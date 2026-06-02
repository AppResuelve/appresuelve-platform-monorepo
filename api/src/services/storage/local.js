import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function upload(fileBuffer, clientId, documentType, filename) {
  const dir = path.join(UPLOAD_DIR, clientId, documentType);
  fs.mkdirSync(dir, { recursive: true });

  const uniqueName = `${Date.now()}-${filename}`;
  const filePath = path.join(dir, uniqueName);
  fs.writeFileSync(filePath, fileBuffer);

  const publicId = `${clientId}/${documentType}/${uniqueName}`;
  const relativeUrl = `/uploads/${clientId}/${documentType}/${uniqueName}`;

  return {
    publicId,
    url: relativeUrl,
    bytes: fileBuffer.length,
    format: path.extname(filename).slice(1) || 'unknown',
    resourceType: 'auto',
  };
}

export async function deleteFile(publicId) {
  const filePath = path.join(UPLOAD_DIR, publicId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export async function deleteClientFiles(clientId) {
  const dir = path.join(UPLOAD_DIR, clientId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
