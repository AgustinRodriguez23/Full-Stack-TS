'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

export default function UsernameForm({ initial, remaining }: { initial: string; remaining: number }) {
  const router = useRouter();
  const [username, setUsername] = useState(initial);
  const [saved, setSaved] = useState(false);

  const update = trpc.user.updateUsername.useMutation({
    onSuccess: () => {
      setSaved(true);
      router.refresh(); // vuelve a leer el Server Component con el nombre nuevo
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    update.mutate({ username });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-center gap-2">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-neutral-900"
      />
      <button
        type="submit"
        disabled={update.isPending || username === initial || remaining <= 0}
        className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {update.isPending ? 'Guardando...' : 'Guardar'}
      </button>
      {saved && <span className="text-sm text-green-600">Guardado</span>}
      {update.error && <span className="text-sm text-red-600">{update.error.message}</span>}
        <span className="text-xs text-neutral-500">
            {remaining > 0 ? `Te quedan ${remaining} cambios` : 'Sin cambios disponibles'}
        </span>
    </form>
  );
}