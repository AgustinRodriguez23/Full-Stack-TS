import { redirect, notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import CategoryManager from './CategoryManager';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  // 404 en vez de 403: no revela que la ruta existe
  if (profile?.role !== 'admin') notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Categorías</h1>
      <CategoryManager />
    </main>
  );
}