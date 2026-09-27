import { describe, it, expect, afterAll } from 'vitest';
import { db } from '@/db';
import { profiles, posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

describe('Cascade delete: profiles -> posts', () => {
  it('borra los posts asociados cuando se borra el profile', async () => {
    const [profile] = await db
      .insert(profiles)
      .values({ username: 'test-cascade-user' })
      .returning();

    const [post] = await db
      .insert(posts)
      .values({
        title: 'Post de prueba para cascade',
        authorId: profile.id,
      })
      .returning();

    const postsBefore = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, profile.id));

    expect(postsBefore).toHaveLength(1);

    await db.delete(profiles).where(eq(profiles.id, profile.id));

    const postsAfter = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, profile.id));

    expect(postsAfter).toHaveLength(0);
  });
});