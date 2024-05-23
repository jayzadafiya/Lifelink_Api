import { Body, Controller, Post } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  deletePhoto(@Body('publicId') id: string) {
    return this.cloudinaryService.deletePhoto(id);
  }
}
