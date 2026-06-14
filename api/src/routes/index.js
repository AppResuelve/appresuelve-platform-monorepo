import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, generateToken } from '../middleware/auth.js';
import {
  CreateClientSchema,
  UpdateClientSchema,
  SaveOnboardingSchema,
  UploadDocumentSchema,
} from '../validations/index.js';
import { validate } from '../middleware/validate.js';
import * as clientsController from '../controllers/clientsController.js';
import * as onboardingController from '../controllers/onboardingController.js';
import * as documentsController from '../controllers/documentsController.js';

const router = Router();

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Auth
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body
  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL
  const adminPass = process.env.PLATFORM_ADMIN_PASSWORD

  if (!adminEmail || !adminPass) {
    return res.status(500).json({ error: 'Credenciales de admin no configuradas' })
  }
  if (email !== adminEmail || password !== adminPass) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }

  const token = generateToken(email)
  res.json({ token })
})

// Clients (protegido)
router.post('/clients', authMiddleware, validate(CreateClientSchema), clientsController.create);
router.get('/clients', authMiddleware, clientsController.list);
router.get('/clients/by-token/:token', clientsController.getByToken); // público (onboarding)
router.put('/clients/:id', authMiddleware, validate(UpdateClientSchema), clientsController.update);
router.delete('/clients/:id', authMiddleware, clientsController.remove);
router.post('/clients/:id/create-admin', authMiddleware, clientsController.createAdmin);
router.post('/clients/:id/sync', authMiddleware, clientsController.sync);

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
