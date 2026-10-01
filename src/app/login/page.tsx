import { login, signup } from './actions';

const input =
  'w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Iniciar sesión</h1>

      {params.error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </p>
      )}
      {params.message && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {params.message}
        </p>
      )}

      <form className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required className={input} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={input}
          />
        </div>
        <div className="flex gap-2">
          <button
            formAction={login}
            className="flex-1 rounded-full bg-neutral-900 py-2.5 font-medium text-white hover:bg-neutral-700"
          >
            Entrar
          </button>
          <button
            formAction={signup}
            className="flex-1 rounded-full border border-neutral-300 py-2.5 font-medium hover:border-neutral-900"
          >
            Registrarme
          </button>
        </div>
      </form>
    </main>
  );
}