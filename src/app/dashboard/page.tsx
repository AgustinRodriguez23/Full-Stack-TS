import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logout } from '../login/actions';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Sesión iniciada como: <strong>{user.email}</strong></p>

      <form>
        <button formAction={logout}>Cerrar sesión</button>
      </form>
    </main>
  );
}