import { put } from '@vercel/blob';
import * as fs from 'fs';

export async function uploadScriptToBlob(file: Express.Multer.File) {
  const fileBuffer = fs.readFileSync(file.path);
  const blob = await put(`scripts/${file.originalname}`, fileBuffer, {
    access: 'public',
    token: process.env.TESTTRACK_READ_WRITE_TOKEN,
    allowOverwrite: true, 
  });
  return blob.url;
}