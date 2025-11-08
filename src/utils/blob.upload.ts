import { put } from '@vercel/blob';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class BlobUploadService {
  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    const blobName = `${folder}/${Date.now()}-${file.originalname}`;
    const buffer = fs.readFileSync(file.path);

    const { url } = await put(blobName, buffer, {
      access: 'public',
      token: process.env.TESTTRACK_READ_WRITE_TOKEN,
    });

    fs.unlinkSync(file.path);

    return url;
  }
}
