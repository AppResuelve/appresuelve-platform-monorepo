import { Router } from 'express';
import multer from 'multer';
import {
  CreateClientSchema,
  UpdateClientSchema,
  SaveOnboardingSchema,
  UploadDocumentSchema,
} from '@appresuelve/shared/schemas';
import { validate } from '../middleware/validate.js';
import * as clientsController from '../controllers/clientsController.js';
import * as onboardingController from '../controllers/onboardingController.js';
import * as documentsController from '../controllers/documentsController.js';

const router = Router();

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Clients
router.post('/clients', validate(CreateClientSchema), clientsController.create);
router.get('/clients', clientsController.list);
router.get('/clients/by-token/:token', clientsController.getByToken);
router.put('/clients/:id', validate(UpdateClientSchema), clientsController.update);
router.delete('/clients/:id', clientsController.remove);

// Onboarding
router.get('/onboarding/:token', onboardingController.getByToken);
router.put('/onboarding/:token', validate(SaveOnboardingSchema), onboardingController.save);

// Documents
router.post(
  '/documents/:token',
  uploadMiddleware.single('file'),
  validate(UploadDocumentSchema),
  documentsController.upload
);
router.get('/documents/:token', documentsController.list);
router.delete('/documents/:token/:documentId', documentsController.remove);

// Admin
router.get('/admin/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
