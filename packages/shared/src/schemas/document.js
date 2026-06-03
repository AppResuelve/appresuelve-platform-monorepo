import { z } from 'zod';
import { DOCUMENT_TYPES } from '../constants.js';

const validTypes = Object.values(DOCUMENT_TYPES);

export const DocumentTypeSchema = z.enum(validTypes);

export const UploadDocumentSchema = z.object({
  documentType: DocumentTypeSchema,
});
