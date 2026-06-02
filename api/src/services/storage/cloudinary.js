import cloudinary from '../../config/cloudinary.js';

const BASE_FOLDER = 'appresuelve-platform/clients';

export async function upload(fileBuffer, clientId, documentType, filename) {
  const folder = `${BASE_FOLDER}/${clientId}/${documentType}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        use_filename: true,
        unique_filename: true,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    bytes: result.bytes,
    format: result.format,
    resourceType: result.resource_type,
  };
}

export async function deleteFile(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export async function deleteClientFiles(clientId) {
  const prefix = `${BASE_FOLDER}/${clientId}/`;

  try {
    await Promise.all([
      cloudinary.api.delete_resources_by_prefix(prefix, { resource_type: 'image' }),
      cloudinary.api.delete_resources_by_prefix(prefix, { resource_type: 'raw' }),
      cloudinary.api.delete_resources_by_prefix(prefix, { resource_type: 'video' }),
    ]);
  } catch (error) {
    console.error(`Error deleting Cloudinary files for client ${clientId}:`, error);
    throw error;
  }
}
