'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/client';
import { PIN_CATEGORIES, type PinCategory } from '@/lib/validation/pin';

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PinCategory>('tatuajes');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPin = trpc.pin.create.useMutation({
    onSuccess: () => router.push('/gallery'),
    onError: (e) => setError(e.message),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Elegí una imagen');
      return;
    }

    setUploading(true);

    const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();

console.log('getUser:', { user, authError });

    if (!user) {
      setUploading(false);
      setError('Tenés que iniciar sesión para subir imágenes');
      return;
    }

    // Ruta: <user-id>/<timestamp>-<nombre>, exigida por la política de Storage
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const imagePath = `${user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('pins')
      .upload(imagePath, file);

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('pins').getPublicUrl(imagePath);

    setUploading(false);

    createPin.mutate({
      title,
      description: description || undefined,
      category,
      imageUrl: publicUrl,
      imagePath,
    });
  }

  const busy = uploading || createPin.isPending;

    return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Subir imagen</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
        />

        <textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PinCategory)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 capitalize outline-none focus:border-neutral-900"
        >
          {PIN_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-white hover:file:bg-neutral-700"
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-neutral-900 py-2.5 font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {busy ? 'Subiendo...' : 'Publicar'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}