'use client';

import { trpc } from '@/lib/trpc/client';

export default function ProfileGrid({ authorId }: { authorId: string }) {
  const pinsQuery = trpc.pin.getAll.useQuery({ authorId });

  return (
    <section>
      {pinsQuery.isLoading && <p className="text-neutral-500">Cargando...</p>}
      {pinsQuery.error && <p className="text-red-600">Error: {pinsQuery.error.message}</p>}
      {pinsQuery.data?.length === 0 && (
        <p className="text-neutral-500">Todavía no publicó nada.</p>
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
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white opacity-0 transition group-hover:opacity-100">
              <p className="font-medium">{pin.title}</p>
              <p className="text-xs capitalize text-white/80">{pin.category}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}