'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { createClient } from '@/lib/supabase/client';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function MyPins() {
  const supabase = createClient();
  const utils = trpc.useUtils();

  const [pinToDelete, setPinToDelete] = useState<{ id: string; imagePath: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const pinsQuery = trpc.pin.getMine.useQuery();

  const deletePin = trpc.pin.delete.useMutation({
    onSuccess: () => utils.pin.getMine.invalidate(),
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
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Mis imágenes {pinsQuery.data && `(${pinsQuery.data.length})`}
        </h2>
        <Link
          href="/upload"
          className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-neutral-700"
        >
          Subir imagen nueva
        </Link>
      </div>

      {pinsQuery.isLoading && <p className="text-neutral-500">Cargando...</p>}
      {pinsQuery.error && <p className="text-red-600">Error: {pinsQuery.error.message}</p>}
      {deleteError && <p className="mb-4 text-red-600">{deleteError}</p>}
      {pinsQuery.data?.length === 0 && (
        <p className="text-neutral-500">Todavía no subiste nada.</p>
      )}

      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {pinsQuery.data?.map((pin) => (
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
            <button
              onClick={() => setPinToDelete({ id: pin.id, imagePath: pin.imagePath })}
              className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-red-600 opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
            >
              Borrar
            </button>
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white opacity-0 transition group-hover:opacity-100">
              <p className="font-medium">{pin.title}</p>
              <p className="text-xs text-white/80">{pin.categoryName}</p>
            </figcaption>
          </figure>
        ))}
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
    </section>
  );
}