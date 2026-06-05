import { z } from 'zod';

export const UuidSchema = z.string().uuid();

export const EmailSchema = z.string().email().optional().or(z.literal(''));

export const TokenSchema = z.string().min(1, 'Token is required');

export const UrlSchema = z.string().url().optional().or(z.literal(''));
