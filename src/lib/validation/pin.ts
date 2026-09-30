import { z } from 'zod';

export const PIN_CATEGORIES = ['tatuajes', 'paisajes', 'dibujos', 'ropa'] as const;

export const pinCategorySchema = z.enum(PIN_CATEGORIES);

export const createPinSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  category: pinCategorySchema,
  imageUrl: z.string().url(),
  imagePath: z.string().min(1),
});

export const getPinsSchema = z
  .object({
    category: pinCategorySchema.optional(),
    authorId: z.string().uuid().optional(),
  })
  .optional();

export const deletePinSchema = z.object({
  id: z.string().uuid(),
});

export type PinCategory = z.infer<typeof pinCategorySchema>;
export type CreatePinInput = z.infer<typeof createPinSchema>;