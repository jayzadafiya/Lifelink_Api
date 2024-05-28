import { Body, Controller, Post } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  async deletePhoto(@Body('publicId') id: string): Promise<void> {
    return await this.cloudinaryService.deletePhoto(id);
  }
}
