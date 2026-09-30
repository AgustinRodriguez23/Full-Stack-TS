import { router, publicProcedure } from './server';
import { userRouter } from './routers/user';
import { postRouter } from './routers/post';
import { pinRouter } from './routers/pin';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  user: userRouter,
  post: postRouter,
  pin: pinRouter,
});

export type AppRouter = typeof appRouter;