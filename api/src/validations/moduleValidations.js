import { z } from 'zod'

const fieldSchema = z.object({
  key: z.string().min(1, 'key es requerido'),
  label: z.string().min(1, 'label es requerido'),
  type: z.enum([
    'text', 'textarea', 'number', 'email', 'url',
    'color', 'date', 'datetime', 'boolean', 'select',
    'image', 'gallery', 'richtext', 'icon', 'link',
  ]),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  multiple: z.boolean().optional(),
  validations: z.record(z.unknown()).optional(),
  order: z.number().optional(),
})

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'name es requerido'),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
  free: z.boolean().optional(),
  price: z.number().nullable().optional(),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()

export const CreateComponentSchema = z.object({
  categoryId: z.number().int('categoryId debe ser un entero'),
  name: z.string().min(1, 'name es requerido'),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  estimatedDays: z.number().int().optional(),
  requiresApproval: z.boolean().optional(),
  paidOverride: z.boolean().optional(),
  price: z.number().nullable().optional(),
  fields: z.array(fieldSchema).optional(),
  active: z.boolean().optional(),
})

export const UpdateComponentSchema = CreateComponentSchema.partial()
