import { Router } from 'express';
import multer from 'multer';
import pool from '../db/connection.js';
import { upload, deleteFile } from '../services/storage/index.js';

const router = Router();

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Upload document for client
router.post('/:token', uploadMiddleware.single('file'), async (req, res) => {
  try {
    const { token } = req.params;
    const { documentType } = req.body;

    const clientResult = await pool.query(
      `SELECT id FROM clients WHERE invite_token = $1`,
      [token]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const clientId = clientResult.rows[0].id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const storageResult = await upload(
      req.file.buffer,
      clientId,
      documentType || 'general',
      req.file.originalname
    );

    const storageProvider = process.env.STORAGE_PROVIDER === 'cloudinary' ? 'cloudinary' : 'local';

    const result = await pool.query(
      `INSERT INTO client_documents
       (client_id, document_type, name, mime_type, file_url, file_size, storage_provider, public_id, resource_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, mime_type, file_url, file_size, document_type, uploaded_at`,
      [
        clientId,
        documentType || 'general',
        req.file.originalname,
        req.file.mimetype,
        storageResult.url,
        storageResult.bytes,
        storageProvider,
        storageResult.publicId,
        storageResult.resourceType || 'auto'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get documents for client
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const clientResult = await pool.query(
      `SELECT id FROM clients WHERE invite_token = $1`,
      [token]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const result = await pool.query(
      `SELECT id, document_type, name, mime_type, file_url, file_size, uploaded_at
       FROM client_documents
       WHERE client_id = $1
       ORDER BY uploaded_at DESC`,
      [clientResult.rows[0].id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Delete document
router.delete('/:token/:documentId', async (req, res) => {
  try {
    const { token, documentId } = req.params;

    const clientResult = await pool.query(
      `SELECT id FROM clients WHERE invite_token = $1`,
      [token]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const docResult = await pool.query(
      `SELECT public_id, resource_type FROM client_documents WHERE id = $1 AND client_id = $2`,
      [documentId, clientResult.rows[0].id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const doc = docResult.rows[0];
    await deleteFile(doc.public_id, doc.resource_type);

    await pool.query(
      `DELETE FROM client_documents WHERE id = $1 AND client_id = $2`,
      [documentId, clientResult.rows[0].id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
