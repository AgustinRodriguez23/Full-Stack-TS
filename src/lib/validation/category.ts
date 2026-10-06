import { z } from 'zod';

export const categoryNameSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(30, 'Máximo 30 caracteres'),
});

export const renameCategorySchema = categoryNameSchema.extend({
  id: z.string().uuid(),
});

export const deleteCategorySchema = z.object({ id: z.string().uuid() });

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}