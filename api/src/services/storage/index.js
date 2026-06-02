import * as cloudinaryProvider from './cloudinary.js';
import * as localProvider from './local.js';

const provider = process.env.STORAGE_PROVIDER === 'cloudinary' ? cloudinaryProvider : localProvider;

export const upload = provider.upload;
export const deleteFile = provider.deleteFile;
export const deleteClientFiles = provider.deleteClientFiles;
