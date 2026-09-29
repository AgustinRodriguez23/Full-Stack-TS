import { router, publicProcedure, protectedProcedure } from '../server';
import { posts } from '@/db/schema';
import { createPostSchema, getPostsSchema } from '@/lib/validation/post';
import { and, eq } from 'drizzle-orm';

export const postRouter = router({
  // Query pública: cualquiera puede ver posts
  getPosts: publicProcedure
    .input(getPostsSchema.optional())
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input?.authorId) {
        conditions.push(eq(posts.authorId, input.authorId));
      }
      if (input?.published !== undefined) {
        conditions.push(eq(posts.published, input.published));
      }

      return ctx.db
        .select()
        .from(posts)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
    }),

  // Mutation protegida: requiere sesión activa
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const [newPost] = await ctx.db
        .insert(posts)
        .values({
          ...input,
          authorId: ctx.user.id, // <- sale de la sesión, NO del input
        })
        .returning();

      return newPost;
    }),
});