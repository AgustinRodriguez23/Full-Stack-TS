import { login, signup } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main style={{ padding: 24, maxWidth: 400 }}>
      <h1>Iniciar sesión</h1>

      {params.error && (
        <p style={{ color: 'red' }}>{decodeURIComponent(params.error)}</p>
      )}
      {params.message && <p style={{ color: 'green' }}>{params.message}</p>}

      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button formAction={login}>Iniciar sesión</button>
        <button formAction={signup}>Registrarse</button>
      </form>
    </main>
  );
}