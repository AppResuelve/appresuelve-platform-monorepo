import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';
import { deleteClientFiles } from './storage/index.js';

const { Client, ClientForm, ClientDocument } = db;

function generateToken() {
  return uuidv4().replace(/-/g, '').slice(0, 16);
}

function generateCloudinaryPrefix() {
  return `cl_${uuidv4().replace(/-/g, '').slice(0, 8)}`;
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

export async function createInvite({ businessName, email, address, serviceType, apiUrl }) {
  const inviteToken = generateToken();

  const client = await Client.create({
    businessName: businessName || null,
    email: email || null,
    address: address || null,
    serviceType: serviceType || null,
    apiUrl: apiUrl || null,
    cloudinaryFolderPrefix: generateCloudinaryPrefix(),
    inviteToken,
    status: 'pending',
    adminStatus: 'pending',
    inviteSentAt: new Date(),
  });

  const onboardingUrl =
    process.env.ONBOARDING_URL || 'http://localhost:5173';
  const inviteLink = `${onboardingUrl}/client/${client.inviteToken}`;

  return {
    id: client.id,
    business_name: client.businessName,
    email: client.email,
    address: client.address,
    service_type: client.serviceType,
    invite_token: client.inviteToken,
    status: client.status,
    api_url: client.apiUrl,
    admin_status: client.adminStatus,
    cloudinary_folder_prefix: client.cloudinaryFolderPrefix,
    created_at: client.createdAt ? new Date(client.createdAt).toISOString() : null,
    invite_link: inviteLink,
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
      business_name: client.businessName,
      email: client.email,
      address: client.address,
      service_type: client.serviceType,
      invite_token: client.inviteToken,
      status: client.status,
      api_url: client.apiUrl,
      admin_status: client.adminStatus,
      sync_status: client.syncStatus,
      cloudinary_folder_prefix: client.cloudinaryFolderPrefix,
      created_at: client.createdAt ? new Date(client.createdAt).toISOString() : null,
      form_data: formData,
      documents: docs.map((d) => ({
        id: d.id,
        name: d.name,
        mime_type: d.mimeType,
        file_url: d.fileUrl,
        file_size: d.fileSize,
        document_type: d.documentType,
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
    business_name: client.businessName,
    email: client.email,
    address: client.address,
    service_type: client.serviceType,
    status: client.status,
    created_at: client.createdAt ? new Date(client.createdAt).toISOString() : null,
    form_data: client.form ? client.form.data : null,
    documents: client.documents.map((d) => ({
      id: d.id,
      name: d.name,
      mime_type: d.mimeType,
      file_url: d.fileUrl,
      document_type: d.documentType,
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
    const prefix = client.cloudinaryFolderPrefix || `appresuelve-platform/clients/${clientId}`
    await deleteClientFiles(`${prefix}/`);
  } catch (storageError) {
    console.error(`Failed to delete files for client ${clientId}:`, storageError);
  }

  return true;
}

export async function updateClient(clientId, data) {
  const client = await Client.findByPk(clientId, {
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

  const fields = {};
  if (data.businessName !== undefined) fields.businessName = data.businessName || null;
  if (data.email !== undefined) fields.email = data.email || null;
  if (data.address !== undefined) fields.address = data.address || null;
  if (data.serviceType !== undefined) fields.serviceType = data.serviceType || null;
  if (data.apiUrl !== undefined) {
    fields.apiUrl = data.apiUrl || null
  }

  await client.update(fields);

  const formData = client.form ? client.form.data : {};
  const docs = client.documents || [];
  const completion = calculateCompletion(formData, docs);

  return {
    id: client.id,
    business_name: client.businessName,
    email: client.email,
    address: client.address,
    service_type: client.serviceType,
    invite_token: client.inviteToken,
    status: client.status,
    api_url: client.apiUrl,
    admin_status: client.adminStatus,
    sync_status: client.syncStatus,
    created_at: client.createdAt ? new Date(client.createdAt).toISOString() : null,
    form_data: formData,
    documents: docs.map((d) => ({
      id: d.id,
      name: d.name,
      mime_type: d.mimeType,
      file_url: d.fileUrl,
      file_size: d.fileSize,
      document_type: d.documentType,
    })),
    completion,
  };
}

export async function createAdminForClient(clientId) {
  const client = await Client.findByPk(clientId)
  if (!client) throw new Error('Cliente no encontrado')
  if (!client.apiUrl) throw new Error('El cliente no tiene api_url configurada')
  if (!client.email) throw new Error('El cliente no tiene email')

  const secret = process.env.APPRESUELVE_SECRET
  if (!secret) throw new Error('APPRESUELVE_SECRET no configurado')

  const apiBase = client.apiUrl.replace(/\/+$/, '')

  let res
  try {
    res = await fetch(`${apiBase}/api/internal/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        email: client.email,
        name: client.businessName || client.email,
      }),
    })
  } catch (fetchErr) {
    if (fetchErr.cause?.code === 'ENOTFOUND') {
      throw new Error(`No se encontró el dominio "${new URL(apiBase).hostname}". Verificá la URL de la API.`)
    }
    if (fetchErr.cause?.code === 'ECONNREFUSED') {
      throw new Error(`El servidor en "${new URL(apiBase).hostname}" rechazó la conexión. Verificá que el proyecto esté desplegado.`)
    }
    throw new Error(`No se pudo conectar con la API del cliente. Verificá que la URL sea correcta y el proyecto esté online.`)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || 'Error al crear admin')
  }

  await client.update({ adminStatus: 'active' })
  return client
}

export async function syncSections(clientId, sections) {
  const client = await Client.findByPk(clientId, {
    include: [{ model: ClientForm, as: 'form', required: false }]
  })
  if (!client) throw new Error('Cliente no encontrado')
  if (!client.apiUrl) throw new Error('api_url no configurada')

  const secret = process.env.APPRESUELVE_SECRET
  if (!secret) throw new Error('APPRESUELVE_SECRET no configurado')

  const apiBase = client.apiUrl.replace(/\/+$/, '')
  const formData = client.form?.data || {}
  const syncStatus = { ...(client.syncStatus || {}) }
  const results = {}

  const call = async (path, body) => {
    let res
    try {
      res = await fetch(`${apiBase}/api/internal/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify(body),
      })
    } catch {
      throw new Error(`No se pudo conectar con la API del cliente. Verificá que la URL sea correcta y el proyecto esté online.`)
    }
    const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    return data
  }

  if (sections.includes('branding') || sections.includes('socialLinks')) {
    const branding = formData.branding || {}
    const social = formData.socialLinks || {}
    const allDocs = await ClientDocument.findAll({ where: { clientId } })
    const logoDoc = allDocs.find(d => d.documentType === 'logo')
    const faviconDoc = allDocs.find(d => d.documentType === 'favicon')
    try {
      await call('seed-settings', {
        businessName: branding.businessName,
        description: branding.description,
        primaryColor: branding.primary,
        secondaryColor: branding.secondary || branding.accent,
        logoUrl: logoDoc?.fileUrl || null,
        faviconUrl: faviconDoc?.fileUrl || null,
        instagram: social.instagram,
        facebook: social.facebook,
        tiktok: social.tiktok,
        youtube: social.youtube,
        whatsappNumber: social.whatsapp,
      })
      results.branding = 'ok'
      results.socialLinks = 'ok'
      syncStatus.branding = { at: new Date().toISOString(), status: 'ok' }
      syncStatus.socialLinks = { at: new Date().toISOString(), status: 'ok' }
    } catch (err) {
      results.branding = err.message
    }
  }

  if (sections.includes('products')) {
    const docs = await ClientDocument.findAll({ where: { clientId } })
    const excelDoc = docs.find(d => d.documentType === 'product_files')
    if (excelDoc?.fileUrl) {
      try {
        const body = { categoryId: null }
        // Si el archivo está en disco local, lo mandamos como base64
        if (excelDoc.fileUrl.startsWith('/')) {
          const fs = await import('fs')
          const path = await import('path')
          const filePath = path.resolve(excelDoc.fileUrl.replace(/^\/uploads/, './uploads'))
          const buffer = fs.readFileSync(filePath)
          body.excelBase64 = buffer.toString('base64')
        } else {
          body.excelUrl = excelDoc.fileUrl
        }
        await call('seed-products', body)
        results.products = 'ok'
        syncStatus.products = { at: new Date().toISOString(), status: 'ok' }
      } catch (err) {
        results.products = err.message
      }
    } else {
      results.products = 'no-file'
    }
  }

  if (sections.includes('services')) {
    syncStatus.services = { at: new Date().toISOString(), status: 'ok' }
    results.services = 'ok'
  }

  await client.update({ syncStatus })
  return { results, syncStatus }
}
