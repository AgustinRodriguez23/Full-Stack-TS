import { z } from 'zod';

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Solo letras, números, punto, guion y guion bajo'),
});

export const MAX_USERNAME_CHANGES = 3;