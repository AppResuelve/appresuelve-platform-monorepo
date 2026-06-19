import { z } from 'zod';
import { BILLING_STATUS } from '../constants/client.js';

export const UpdateBillingSchema = z.object({
  billing_status: z.enum(Object.values(BILLING_STATUS)),
});
