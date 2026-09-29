import { router, publicProcedure, protectedProcedure } from '../server';
import { posts } from '@/db/schema';
import { createPostSchema, getPostsSchema } from '@/lib/validation/post';
import { and, eq } from 'drizzle-orm';

export const postRouter = router({
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

  // Query privada, solo los posts del usuario autenticado
  getMyPosts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(posts)
      .where(eq(posts.authorId, ctx.user.id));
  }),

  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const [newPost] = await ctx.db
        .insert(posts)
        .values({
          ...input,
          authorId: ctx.user.id,
        })
        .returning();

      return newPost;
    }),
});