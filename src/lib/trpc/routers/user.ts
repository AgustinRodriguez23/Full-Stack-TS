import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../server';
import { profiles } from '@/db/schema';
import { eq, sql, lt, and } from 'drizzle-orm';
import { updateUsernameSchema } from '@/lib/validation/user';
import { TRPCError } from '@trpc/server';
import { MAX_USERNAME_CHANGES } from '@/lib/validation/user';

export const userRouter = router({
  getUsers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(profiles);
  }),

  // Mutation protegida: crea el profile ligado al usuario autenticado
  createUser: protectedProcedure
    .input(
      z.object({
        username: z.string().min(1, 'El username no puede estar vacío'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newUser] = await ctx.db
        .insert(profiles)
        .values({
          id: ctx.user.id, // mismo UUID que auth.users, no autogenerado
          username: input.username,
        })
        .returning();

      return newUser;
    }),

  // Devuelve el usuario de la sesión, o null si no hay sesión (no lanza 401)
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;

      const [profile] = await ctx.db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.id, ctx.user.id));

      return {
        id: ctx.user.id,
        email: ctx.user.email,
        role: profile?.role ?? 'user',
      };
    }),
  
    getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [profile] = await ctx.db
        .select({ id: profiles.id, username: profiles.username, createdAt: profiles.createdAt })
        .from(profiles)
        .where(eq(profiles.id, input.id));

      return profile ?? null;
    }),

      updateUsername: protectedProcedure
    .input(updateUsernameSchema)
    .mutation(async ({ ctx, input }) => {
      // El límite va dentro del WHERE: es una sola operación atómica,
      // así dos requests simultáneos no pueden saltarse el tope.
      const [updated] = await ctx.db
        .update(profiles)
        .set({
          username: input.username,
          usernameChanges: sql`${profiles.usernameChanges} + 1`,
        })
        .where(
          and(
            eq(profiles.id, ctx.user.id),
            lt(profiles.usernameChanges, MAX_USERNAME_CHANGES)
          )
        )
        .returning({
          username: profiles.username,
          usernameChanges: profiles.usernameChanges,
        });

      if (!updated) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Alcanzaste el límite de ${MAX_USERNAME_CHANGES} cambios de username`,
        });
      }

      return updated;
    }),
});