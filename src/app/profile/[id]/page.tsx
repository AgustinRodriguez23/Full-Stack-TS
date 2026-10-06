import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import ProfileGrid from './ProfileGrid';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Un id mal formado rompería la query de Postgres: lo cortamos antes
  if (!z.string().uuid().safeParse(id).success) notFound();

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
  if (!profile) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{profile.username}</h1>
        <p className="text-sm text-neutral-500">
          Miembro desde {profile.createdAt.toLocaleDateString('es-AR')}
        </p>
      </header>

      <ProfileGrid authorId={profile.id} />
    </main>
  );
}