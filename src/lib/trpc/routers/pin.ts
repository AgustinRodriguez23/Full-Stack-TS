import { TRPCError } from '@trpc/server';
import { and, desc, eq, getTableColumns } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure } from '../server';
import { pins, profiles } from '@/db/schema';
import {
  createPinSchema,
  getPinsSchema,
  deletePinSchema,
} from '@/lib/validation/pin';

export const pinRouter = router({
  // Pública: la vista general, con filtro opcional por categoría/autor
    getAll: publicProcedure.input(getPinsSchema).query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.category) conditions.push(eq(pins.category, input.category));
      if (input?.authorId) conditions.push(eq(pins.authorId, input.authorId));

      return ctx.db
        .select({
          ...getTableColumns(pins),
          authorName: profiles.username,
        })
        .from(pins)
        .leftJoin(profiles, eq(pins.authorId, profiles.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(pins.createdAt));
    }),

  // Protegida: solo los pins del usuario logueado
  getMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(pins)
      .where(eq(pins.authorId, ctx.user.id))
      .orderBy(desc(pins.createdAt));
  }),

  create: protectedProcedure
    .input(createPinSchema)
    .mutation(async ({ ctx, input }) => {
      // El archivo debe estar dentro de la carpeta del usuario
      if (!input.imagePath.startsWith(`${ctx.user.id}/`)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'La imagen debe estar en tu carpeta',
        });
      }

      const [pin] = await ctx.db
        .insert(pins)
        .values({ ...input, authorId: ctx.user.id })
        .returning();

      return pin;
    }),

  delete: protectedProcedure
    .input(deletePinSchema)
    .mutation(async ({ ctx, input }) => {
      // El filtro por authorId evita borrar pins ajenos
      const [deleted] = await ctx.db
        .delete(pins)
        .where(and(eq(pins.id, input.id), eq(pins.authorId, ctx.user.id)))
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pin no encontrado' });
      }

      return deleted;
    }),
});