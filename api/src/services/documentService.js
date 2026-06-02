import db from '../models/index.js';
import { upload, deleteFile } from './storage/index.js';

const { Client, ClientDocument } = db;

export async function uploadDocument(token, file, documentType) {
  const client = await Client.findOne({
    where: { inviteToken: token },
  });

  if (!client) return null;

  const storageResult = await upload(
    file.buffer,
    client.id,
    documentType || 'general',
    file.originalname
  );

  const storageProvider =
    process.env.NODE_ENV === 'production' || process.env.STORAGE_PROVIDER === 'cloudinary'
      ? 'cloudinary'
      : 'local';

  const document = await ClientDocument.create({
    clientId: client.id,
    documentType: documentType || 'general',
    name: file.originalname,
    mimeType: file.mimetype,
    fileUrl: storageResult.url,
    fileSize: storageResult.bytes,
    storageProvider,
    publicId: storageResult.publicId,
    resourceType: storageResult.resourceType || 'auto',
  });

  return {
    id: document.id,
    name: document.name,
    mimeType: document.mimeType,
    fileUrl: document.fileUrl,
    fileSize: document.fileSize,
    documentType: document.documentType,
    uploadedAt: document.uploadedAt,
  };
}

export async function listByToken(token) {
  const client = await Client.findOne({
    where: { inviteToken: token },
  });

  if (!client) return null;

  const documents = await ClientDocument.findAll({
    where: { clientId: client.id },
    attributes: [
      'id',
      'documentType',
      'name',
      'mimeType',
      'fileUrl',
      'fileSize',
      'uploadedAt',
    ],
    order: [['uploadedAt', 'DESC']],
  });

  return documents.map((d) => d.toJSON());
}

export async function deleteDocument(token, documentId) {
  const client = await Client.findOne({
    where: { inviteToken: token },
  });

  if (!client) return null;

  const document = await ClientDocument.findOne({
    where: { id: documentId, clientId: client.id },
  });

  if (!document) return 'not_found';

  await ClientDocument.destroy({
    where: { id: documentId, clientId: client.id },
  });

  try {
    await deleteFile(document.publicId, document.resourceType);
  } catch (storageError) {
    console.error(`Failed to delete file ${document.publicId}:`, storageError);
  }

  return { success: true };
}
