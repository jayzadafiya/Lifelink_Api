import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_PUBLIC_API,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  async deletePhoto(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
