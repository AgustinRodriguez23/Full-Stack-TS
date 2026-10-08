'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import ConfirmDialog from '@/components/ConfirmDialog';

const input =
  'rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-neutral-900';

export default function CategoryManager() {
  const utils = trpc.useUtils();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoriesQuery = trpc.category.getAll.useQuery();

  const onError = (e: { message: string }) => setError(e.message);
  const refresh = () => utils.category.getAll.invalidate();

  const create = trpc.category.create.useMutation({
    onSuccess: () => {
      setNewName('');
      refresh();
    },
    onError,
  });

  const rename = trpc.category.rename.useMutation({
    onSuccess: () => {
      setEditingId(null);
      refresh();
    },
    onError,
  });

  const remove = trpc.category.delete.useMutation({
    onSuccess: refresh,
    onError,
    onSettled: () => setToDelete(null),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    create.mutate({ name: newName });
  }

  return (
    <section>
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría"
          className={`${input} flex-1`}
        />
        <button
          type="submit"
          disabled={create.isPending || newName.trim().length < 2}
          className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {create.isPending ? 'Creando...' : 'Agregar'}
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      {categoriesQuery.isLoading && <p className="text-neutral-500">Cargando...</p>}

      <ul className="divide-y divide-neutral-200 rounded-2xl bg-white shadow-sm">
        {categoriesQuery.data?.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
            {editingId === c.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`${input} flex-1`}
                  autoFocus
                />
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => {
                      setError(null);
                      rename.mutate({ id: c.id, name: editName });
                    }}
                    disabled={rename.isPending}
                    className="text-green-700 hover:underline disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-neutral-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-neutral-500">/{c.slug}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => {
                      setError(null);
                      setEditingId(c.id);
                      setEditName(c.name);
                    }}
                    className="hover:underline"
                  >
                    Renombrar
                  </button>
                  <button
                    onClick={() => setToDelete({ id: c.id, name: c.name })}
                    className="text-red-600 hover:underline"
                  >
                    Borrar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={toDelete !== null}
        title={`¿Borrar "${toDelete?.name}"?`}
        message="Solo se puede borrar si no tiene imágenes asociadas."
        confirmLabel="Borrar"
        loading={remove.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          setError(null);
          remove.mutate({ id: toDelete.id });
        }}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}