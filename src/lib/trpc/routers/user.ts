import { z } from 'zod';
import { router, publicProcedure } from '../server';
import { profiles } from '@/db/schema';

export const userRouter = router({
  getUsers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(profiles);
  }),

  createUser: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, 'El username no puede estar vacío'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newUser] = await ctx.db
        .insert(profiles)
        .values({ username: input.username })
        .returning();

      return newUser;
    }),
});