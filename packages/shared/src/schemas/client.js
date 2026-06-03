import { z } from 'zod';

export const CreateClientSchema = z.object({
  businessName: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

export const UpdateClientSchema = z.object({
  businessName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});
