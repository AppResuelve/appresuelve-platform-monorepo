import { z } from 'zod';
import { SERVICE_TYPES } from './constants.js';

const serviceTypeValues = Object.values(SERVICE_TYPES);

export const CreateClientSchema = z.object({
  businessName: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  serviceType: z.enum(serviceTypeValues).optional(),
  apiUrl: z.string().optional().or(z.literal('')),
});

export const UpdateClientSchema = z.object({
  businessName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  serviceType: z.enum(serviceTypeValues).optional(),
  apiUrl: z.string().optional().or(z.literal('')),
});
