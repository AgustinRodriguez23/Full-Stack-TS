import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import MyPins from './MyPins';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {profile?.username ?? 'Mi perfil'}
        </h1>
        <p className="text-sm text-neutral-500">{user.email}</p>
      </header>

      <MyPins />
    </main>
  );
}