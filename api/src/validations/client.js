import { z } from 'zod';
import { SERVICE_TYPES } from './constants.js';

const serviceTypeValues = Object.values(SERVICE_TYPES);

const optionalString = z.string().optional().or(z.literal(''));

const ClientBaseSchema = {
  email: z.string().email().optional().or(z.literal('')),
  address: optionalString,
  serviceType: z.enum(serviceTypeValues).optional(),
  apiUrl: optionalString,
  phone: optionalString,
  description: optionalString,
  domain: optionalString,
  notes: optionalString,
  gitRepo: optionalString,
  backendRepo: optionalString,
  frontendRepo: optionalString,
};

export const CreateClientSchema = z.object({
  businessName: z.string().min(1, 'El nombre es requerido'),
  ...ClientBaseSchema,
});

export const UpdateClientSchema = z.object({
  businessName: z.string().min(1).optional(),
  ...ClientBaseSchema,
});
