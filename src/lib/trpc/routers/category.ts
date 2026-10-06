import { TRPCError } from '@trpc/server';
import { asc, eq } from 'drizzle-orm';
import { router, publicProcedure, adminProcedure } from '../server';
import { categories, pins } from '@/db/schema';
import {
  categoryNameSchema,
  renameCategorySchema,
  deleteCategorySchema,
  slugify,
} from '@/lib/validation/category';

function isUniqueViolation(e: unknown): boolean {
  const err = e as { code?: string; cause?: { code?: string } };
  return err.code === '23505' || err.cause?.code === '23505';
}

export const categoryRouter = router({
  getAll: publicProcedure.query(({ ctx }) =>
    ctx.db.select().from(categories).orderBy(asc(categories.name))
  ),

  create: adminProcedure.input(categoryNameSchema).mutation(async ({ ctx, input }) => {
    const slug = slugify(input.name);
    if (!slug) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Nombre inválido' });
    try {
      const [created] = await ctx.db
        .insert(categories)
        .values({ name: input.name, slug })
        .returning();
      return created;
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Esa categoría ya existe' });
      }
      throw e;
    }
  }),

  rename: adminProcedure.input(renameCategorySchema).mutation(async ({ ctx, input }) => {
    const slug = slugify(input.name);
    if (!slug) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Nombre inválido' });
    try {
      const [updated] = await ctx.db
        .update(categories)
        .set({ name: input.name, slug })
        .where(eq(categories.id, input.id))
        .returning();
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'No existe' });
      return updated;
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Esa categoría ya existe' });
      }
      throw e;
    }
  }),

  delete: adminProcedure.input(deleteCategorySchema).mutation(async ({ ctx, input }) => {
    const [used] = await ctx.db
      .select({ id: pins.id })
      .from(pins)
      .where(eq(pins.categoryId, input.id))
      .limit(1);
    if (used) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'La categoría tiene imágenes; no se puede borrar',
      });
    }
    const [deleted] = await ctx.db
      .delete(categories)
      .where(eq(categories.id, input.id))
      .returning();
    if (!deleted) throw new TRPCError({ code: 'NOT_FOUND', message: 'No existe' });
    return deleted;
  }),
});