import { router, publicProcedure } from './server';
import { userRouter } from './routers/user';
import { postRouter } from './routers/post';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  user: userRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;