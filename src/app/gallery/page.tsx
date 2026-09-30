'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { PIN_CATEGORIES, type PinCategory } from '@/lib/validation/pin';

export default function GalleryPage() {
  const [category, setCategory] = useState<PinCategory | undefined>(undefined);

  const pinsQuery = trpc.pin.getAll.useQuery(category ? { category } : undefined);

  return (
    <main style={{ padding: 24 }}>
      <h1>Galería</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setCategory(undefined)} disabled={!category}>
          Todas
        </button>
        {PIN_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} disabled={category === c}>
            {c}
          </button>
        ))}
      </div>

      {pinsQuery.isLoading && <p>Cargando...</p>}
      {pinsQuery.error && <p>Error: {pinsQuery.error.message}</p>}

      <div style={{ columnCount: 3, columnGap: 16 }}>
        {pinsQuery.data?.map((pin) => (
          <figure
            key={pin.id}
            style={{ margin: '0 0 16px', breakInside: 'avoid' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pin.imageUrl}
              alt={pin.title}
              style={{ width: '100%', display: 'block', borderRadius: 8 }}
            />
            <figcaption>
              <strong>{pin.title}</strong> · {pin.category}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}