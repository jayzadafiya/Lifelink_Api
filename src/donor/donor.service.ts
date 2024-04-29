import mongoose from 'mongoose';
import axios from 'axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Donor } from './schema/donor.schema';
import { CreateDonorDto } from './dto/createDonor.dto';
import { createOne, updateOne } from 'shared/handlerFactory';

@Injectable()
export class DonorService {
  constructor(
    @InjectModel(Donor.name) private DonorSchema: mongoose.Model<Donor>,
  ) {}

  // Method for get coordinates form address
  async getCoordinates(
    address: string,
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const { data } = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: address,
            format: 'json',
          },
        },
      );

      if (data && data.length > 0) {
        const { lat, lon } = data[0];

        if (!lat || !lon) {
          throw new NotFoundException('Please enter valid address!!');
        }
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      } else {
        return null;
      }
    } catch (error) {
      throw new Error('Error fetching geocoding data: ' + error.message);
    }
  }

  // Method for create donor
  async createDonor(donorData: CreateDonorDto): Promise<Donor> {
    const donor = createOne(this.DonorSchema, donorData);

    if (!donor) {
      throw new BadRequestException('Error while creating donor');
    }

    return donor;
  }

  // Method for find donr by email
  async getDonor(email: string): Promise<Donor> {
    return await this.DonorSchema.findOne({ email });
  }

  // Method for update donor
  async updateDonor(
    id: mongoose.Types.ObjectId,
    updateData: CreateDonorDto,
  ): Promise<Donor> {
    const donor = updateOne(this.DonorSchema, id, updateData);

    if (!donor) {
      throw new BadRequestException('Error while updating donor');
    }
    return donor;
  }
}
