import * as documentService from '../services/documentService.js';

export async function upload(req, res) {
  try {
    const { token } = req.params;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await documentService.uploadDocument(
      token,
      req.file,
      documentType
    );

    if (!result) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
}

export async function list(req, res) {
  try {
    const { token } = req.params;
    const documents = await documentService.listByToken(token);

    if (documents === null) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
}

export async function remove(req, res) {
  try {
    const { token, documentId } = req.params;
    const result = await documentService.deleteDocument(token, documentId);

    if (result === null) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (result === 'not_found') {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
}
