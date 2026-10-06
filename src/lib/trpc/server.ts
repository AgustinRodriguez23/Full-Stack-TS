import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import { eq } from 'drizzle-orm';
import { profiles } from '@/db/schema';

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

const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Debés iniciar sesión' });
  }

  // El rol se lee de la base en cada request, nunca del cliente ni del JWT
  const [profile] = await ctx.db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, ctx.user.id));

  if (profile?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Solo administradores' });
  }

  return next({ ctx: { user: ctx.user } });
});

export const adminProcedure = t.procedure.use(isAdmin);