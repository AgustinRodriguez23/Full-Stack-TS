import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../server';
import { profiles } from '@/db/schema';

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
});