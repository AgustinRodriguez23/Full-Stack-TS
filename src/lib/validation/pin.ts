import { z } from 'zod';

export const createPinSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().uuid(),
  imageUrl: z.string().url(),
  imagePath: z.string().min(1),
});

export const getPinsSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    authorId: z.string().uuid().optional(),
  })
  .optional();

export const deletePinSchema = z.object({
  id: z.string().uuid(),
});

export type CreatePinInput = z.infer<typeof createPinSchema>;