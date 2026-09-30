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
    <main style={{ padding: 24, maxWidth: 480 }}>
      <h1>Subir imagen</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PinCategory)}
          >
            {PIN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <button type="submit" disabled={busy}>
          {busy ? 'Subiendo...' : 'Publicar'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  );
}