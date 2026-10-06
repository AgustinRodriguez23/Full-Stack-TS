import { router, publicProcedure } from './server';
import { userRouter } from './routers/user';
import { postRouter } from './routers/post';
import { pinRouter } from './routers/pin';
import { categoryRouter } from './routers/category';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  user: userRouter,
  post: postRouter,
  pin: pinRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;