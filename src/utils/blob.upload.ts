import { put } from '@vercel/blob';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class BlobUploadService {
  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    if (!file || !file.buffer) {
      throw new Error('Arquivo inválido ou buffer ausente');
    }

    const blobName = `${folder}/${Date.now()}-${randomUUID()}-${file.originalname}`;

    const { url } = await put(blobName, file.buffer, {
      access: 'public',
      token: process.env.TESTTRACK_READ_WRITE_TOKEN,
    });

    return url;
  }
}
