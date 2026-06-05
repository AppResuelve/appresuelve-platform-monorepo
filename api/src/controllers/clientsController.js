import * as clientService from '../services/clientService.js';

export async function create(req, res) {
  try {
    const { businessName, email, address, serviceType } = req.body;
    const client = await clientService.createInvite({ businessName, email, address, serviceType });
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
}

export async function list(req, res) {
  try {
    const clients = await clientService.findAllWithCompletion();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
}

export async function getByToken(req, res) {
  try {
    const { token } = req.params;
    const client = await clientService.findByToken(token);

    if (!client) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error fetching client by token:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await clientService.deleteClient(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ success: true, message: 'Client and all data deleted' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const result = await clientService.updateClient(id, req.body);

    if (!result) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
}
