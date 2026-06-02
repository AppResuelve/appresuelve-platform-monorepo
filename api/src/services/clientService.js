import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';
import { deleteClientFiles } from './storage/index.js';

const { Client, ClientForm, ClientDocument } = db;

function generateToken() {
  return uuidv4().replace(/-/g, '').slice(0, 16);
}

function calculateCompletion(formData, documents) {
  if (!formData || Object.keys(formData).length === 0) return 0;

  const sections = ['hero', 'services', 'faq', 'colors', 'socialLinks', 'branding'];
  let filledSections = 0;

  sections.forEach((section) => {
    if (formData[section] && Object.keys(formData[section]).length > 0) {
      filledSections++;
    }
  });

  const hasDocuments = documents && documents.length > 0;
  let total = 100;
  if (!hasDocuments) total -= 20;

  return Math.round((filledSections / sections.length) * total);
}

export async function createInvite({ businessName, email }) {
  const inviteToken = generateToken();

  const client = await Client.create({
    businessName: businessName || null,
    email: email || null,
    inviteToken,
    status: 'pending',
    inviteSentAt: new Date(),
  });

  const onboardingUrl =
    process.env.ONBOARDING_URL || 'http://localhost:5173';
  const inviteLink = `${onboardingUrl}/client/${client.inviteToken}`;

  return {
    id: client.id,
    businessName: client.businessName,
    email: client.email,
    inviteToken: client.inviteToken,
    status: client.status,
    createdAt: client.createdAt,
    inviteLink,
  };
}

export async function findAllWithCompletion() {
  const clients = await Client.findAll({
    include: [
      {
        model: ClientForm,
        as: 'form',
        required: false,
      },
      {
        model: ClientDocument,
        as: 'documents',
        required: false,
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return clients.map((client) => {
    const formData = client.form ? client.form.data : {};
    const docs = client.documents || [];
    const completion = calculateCompletion(formData, docs);

    return {
      id: client.id,
      businessName: client.businessName,
      email: client.email,
      inviteToken: client.inviteToken,
      status: client.status,
      createdAt: client.createdAt,
      formData,
      documents: docs.map((d) => ({
        id: d.id,
        name: d.name,
        mimeType: d.mimeType,
        fileUrl: d.fileUrl,
        fileSize: d.fileSize,
        documentType: d.documentType,
      })),
      completion,
    };
  });
}

export async function findByToken(token) {
  const client = await Client.findOne({
    where: { inviteToken: token },
    include: [
      {
        model: ClientForm,
        as: 'form',
        required: false,
      },
      {
        model: ClientDocument,
        as: 'documents',
        required: false,
      },
    ],
  });

  if (!client) return null;

  return {
    id: client.id,
    businessName: client.businessName,
    email: client.email,
    status: client.status,
    createdAt: client.createdAt,
    formData: client.form ? client.form.data : null,
    documents: client.documents.map((d) => ({
      id: d.id,
      name: d.name,
      mimeType: d.mimeType,
      fileUrl: d.fileUrl,
      documentType: d.documentType,
    })),
  };
}

export async function deleteClient(clientId) {
  const client = await Client.findByPk(clientId);
  if (!client) return false;

  const t = await db.sequelize.transaction();
  try {
    await ClientDocument.destroy({
      where: { clientId },
      transaction: t,
    });

    await ClientForm.destroy({
      where: { clientId },
      transaction: t,
    });

    await Client.destroy({
      where: { id: clientId },
      transaction: t,
    });

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }

  try {
    await deleteClientFiles(clientId);
  } catch (storageError) {
    console.error(`Failed to delete files for client ${clientId}:`, storageError);
  }

  return true;
}
