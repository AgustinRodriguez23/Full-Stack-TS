'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { createClient } from '@/lib/supabase/client';
import ConfirmDialog from '@/components/ConfirmDialog';

const chip = 'rounded-full px-4 py-1.5 text-sm transition border';

export default function GalleryPage() {
  const supabase = createClient();
  const utils = trpc.useUtils();

  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pinToDelete, setPinToDelete] = useState<{ id: string; imagePath: string } | null>(null);

  const categoriesQuery = trpc.category.getAll.useQuery();
  const pinsQuery = trpc.pin.getAll.useQuery(categoryId ? { categoryId } : undefined);
  const meQuery = trpc.user.me.useQuery();

  const deletePin = trpc.pin.delete.useMutation({
    onSuccess: () => utils.pin.getAll.invalidate(),
    onError: (e) => setDeleteError(e.message),
  });

  function confirmDelete() {
    if (!pinToDelete) return;
    const { id, imagePath } = pinToDelete;
    setDeleteError(null);

    deletePin.mutate(
      { id },
      {
        onSuccess: async () => {
          const { error } = await supabase.storage.from('pins').remove([imagePath]);
          if (error) setDeleteError(`Se borró el pin, pero no el archivo: ${error.message}`);
        },
        onSettled: () => setPinToDelete(null),
      }
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Galería</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryId(undefined)}
          className={`${chip} ${
            !categoryId
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-300 bg-white hover:border-neutral-900'
          }`}
        >
          Todas
        </button>
        {categoriesQuery.data?.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={`${chip} ${
              categoryId === c.id
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-300 bg-white hover:border-neutral-900'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {pinsQuery.isLoading && <p className="text-neutral-500">Cargando...</p>}
      {pinsQuery.error && (
        <p className="text-red-600">Error: {pinsQuery.error.message}</p>
      )}
      {deleteError && <p className="mb-4 text-red-600">{deleteError}</p>}
      {pinsQuery.data?.length === 0 && (
        <p className="text-neutral-500">Todavía no hay imágenes en esta categoría.</p>
      )}

      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {pinsQuery.data?.map((pin) => {
          const isOwner = meQuery.data?.id === pin.authorId;

          return (
            <figure
              key={pin.id}
              className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pin.imageUrl}
                alt={pin.title}
                className="w-full transition duration-300 group-hover:scale-[1.03]"
              />

              {isOwner && (
                <button
                  onClick={() => setPinToDelete({ id: pin.id, imagePath: pin.imagePath })}
                  disabled={deletePin.isPending}
                  className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-red-600 opacity-0 shadow transition hover:bg-white group-hover:opacity-100 disabled:opacity-50"
                >
                  Borrar
                </button>
              )}

              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white opacity-0 transition group-hover:opacity-100">
                <p className="font-medium">{pin.title}</p>
                <p className="text-xs text-white/80">{pin.categoryName}</p>
                {pin.authorName && (
                  <Link
                    href={`/profile/${pin.authorId}`}
                    className="pointer-events-auto text-xs underline underline-offset-2 hover:text-white"
                  >
                    por {pin.authorName}
                  </Link>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>

      <ConfirmDialog
        open={pinToDelete !== null}
        title="¿Borrar esta imagen?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        loading={deletePin.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPinToDelete(null)}
      />
    </main>
  );
}