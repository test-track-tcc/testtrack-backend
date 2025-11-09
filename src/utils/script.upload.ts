import { put } from '@vercel/blob';

export async function uploadScriptToBlob(file: Express.Multer.File) {
  if (!file?.buffer) {
    throw new Error('Arquivo inválido ou buffer ausente');
  }

  const blob = await put(`scripts/${file.originalname}`, file.buffer, {
    access: 'public',
    token: process.env.TESTTRACK_READ_WRITE_TOKEN,
    allowOverwrite: true,
  });

  return blob.url;
}
