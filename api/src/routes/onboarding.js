import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// Get onboarding data for client
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const clientResult = await pool.query(
      `SELECT c.id, c.business_name, c.email, c.status,
              cf.data as form_data
       FROM clients c
       LEFT JOIN client_forms cf ON c.id = cf.client_id AND cf.form_type = 'onboarding'
       WHERE c.invite_token = $1`,
      [token]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json(clientResult.rows[0]);
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Save onboarding form data
router.put('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { data } = req.body;

    const clientResult = await pool.query(
      `SELECT id FROM clients WHERE invite_token = $1`,
      [token]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const clientId = clientResult.rows[0].id;

    await pool.query(
      `INSERT INTO client_forms (client_id, form_type, data, updated_at)
       VALUES ($1, 'onboarding', $2, CURRENT_TIMESTAMP)
       ON CONFLICT (client_id, form_type)
       DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [clientId, JSON.stringify(data)]
    );

    await pool.query(
      `UPDATE clients SET status = 'onboarding' WHERE id = $1 AND status = 'pending'`,
      [clientId]
    );

    res.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

export default router;
