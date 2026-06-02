import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { deleteClientFiles } from '../services/storage/index.js';

const router = Router();

// Create new invitation (admin)
router.post('/', async (req, res) => {
  try {
    const { businessName, email } = req.body;
    const inviteToken = uuidv4().replace(/-/g, '').slice(0, 16);

    const result = await pool.query(
      `INSERT INTO clients (business_name, email, invite_token, status, invite_sent_at)
       VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
       RETURNING id, business_name, email, invite_token, status, created_at`,
      [businessName || null, email || null, inviteToken]
    );

    const client = result.rows[0];
    const onboardingUrl = process.env.ONBOARDING_URL || 'http://localhost:5173';
    const inviteLink = `${onboardingUrl}/client/${client.invite_token}`;

    res.status(201).json({
      ...client,
      inviteLink
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

function calculateCompletion(formData, documents) {
  if (!formData || Object.keys(formData).length === 0) return 0;
  
  const sections = ['hero', 'services', 'faq', 'colors', 'socialLinks', 'branding'];
  let filledSections = 0;

  sections.forEach(section => {
    if (formData[section] && Object.keys(formData[section]).length > 0) {
      filledSections++;
    }
  });

  const hasDocuments = documents && documents.length > 0;
  
  let total = 100;
  if (!hasDocuments) total -= 20;
  
  return Math.round((filledSections / sections.length) * total);
}

// List all clients (admin)
router.get('/', async (req, res) => {
  try {
    const clientsResult = await pool.query(
      `SELECT c.id, c.business_name, c.email, c.invite_token, c.status, c.created_at,
              COALESCE(cf.data, '{}') as form_data,
              COALESCE(json_agg(json_build_object(
                'id', cd.id,
                'name', cd.name,
                'mime_type', cd.mime_type,
                'file_url', cd.file_url,
                'file_size', cd.file_size,
                'document_type', cd.document_type
              )) FILTER (WHERE cd.id IS NOT NULL), '[]') as documents
       FROM clients c
       LEFT JOIN client_forms cf ON c.id = cf.client_id
       LEFT JOIN client_documents cd ON c.id = cd.client_id
       GROUP BY c.id, cf.data
       ORDER BY c.created_at DESC`
    );

    const clients = clientsResult.rows.map(client => {
      const completion = calculateCompletion(client.form_data, client.documents);
      return {
        ...client,
        completion
      };
    });

    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client by invite token (public)
router.get('/by-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT c.id, c.business_name, c.email, c.status, c.created_at,
              cf.data as form_data,
              COALESCE(json_agg(json_build_object(
                'id', cd.id,
                'name', cd.name,
                'mime_type', cd.mime_type,
                'file_url', cd.file_url,
                'document_type', cd.document_type
              )) FILTER (WHERE cd.id IS NOT NULL), '[]') as documents
       FROM clients c
       LEFT JOIN client_forms cf ON c.id = cf.client_id
       LEFT JOIN client_documents cd ON c.id = cd.client_id
       WHERE c.invite_token = $1
       GROUP BY c.id, cf.data`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching client by token:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Delete client and all associated data (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const clientResult = await pool.query(
      `SELECT id FROM clients WHERE id = $1`,
      [id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const clientId = clientResult.rows[0].id;

    // Delete all files from storage
    await deleteClientFiles(clientId);

    // Cascade delete removes client_forms and client_documents from DB
    await pool.query(`DELETE FROM clients WHERE id = $1`, [clientId]);

    res.json({ success: true, message: 'Client and all data deleted' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
