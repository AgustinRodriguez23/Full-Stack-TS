'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

export default function PostsPage() {
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');

  const utils = trpc.useUtils();

  const postsQuery = trpc.post.getPosts.useQuery();

  const createPost = trpc.post.createPost.useMutation({
    onSuccess: () => {
      utils.post.getPosts.invalidate();
      setTitle('');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createPost.mutate({ title, authorId });
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Posts</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div>
          <input
            type="text"
            placeholder="Título (mín. 5 caracteres)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Author ID (UUID)"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
          />
        </div>
        <button type="submit" disabled={createPost.isPending}>
          {createPost.isPending ? 'Creando...' : 'Crear post'}
        </button>

        {createPost.error && (
          <p style={{ color: 'red' }}>{createPost.error.message}</p>
        )}
      </form>

      {postsQuery.isLoading && <p>Cargando posts...</p>}
      {postsQuery.error && <p>Error: {postsQuery.error.message}</p>}

      <ul>
        {postsQuery.data?.map((post) => (
          <li key={post.id}>
            <strong>{post.title}</strong> — {post.published ? 'Publicado' : 'Borrador'}
          </li>
        ))}
      </ul>
    </main>
  );
}