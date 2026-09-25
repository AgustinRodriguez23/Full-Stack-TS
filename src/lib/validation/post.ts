import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100),
  content: z.string().optional(),
  published: z.boolean().optional().default(false),
  authorId: z.string().uuid('authorId debe ser un UUID válido'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const getPostsSchema = z.object({
  authorId: z.string().uuid().optional(),
  published: z.boolean().optional(),
});

export type GetPostsInput = z.infer<typeof getPostsSchema>;