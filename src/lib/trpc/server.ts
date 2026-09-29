import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware "bouncer": verifica que haya un usuario autenticado
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Debés iniciar sesión para realizar esta acción',
    });
  }

  return next({
    ctx: {
      // Re-exponemos ctx con `user` ya narrowed a no-null
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);