import { z } from 'zod';
import { BILLING_STATUS } from '../constants/client.js';

export const UpdateBillingSchema = z.object({
  billing_status: z.enum(Object.values(BILLING_STATUS)),
  billing_day: z.number().int().min(1).max(31).nullable().optional(),
  grace_days: z.number().int().min(0).nullable().optional(),
});
