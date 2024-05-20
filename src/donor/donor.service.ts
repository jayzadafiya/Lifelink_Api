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
import { createOne, getOne } from 'shared/handlerFactory';
import { Twilio } from 'twilio';
import { SMSDto } from './dto/sms.dto';

@Injectable()
export class DonorService {
  private twilioClient: Twilio;
  constructor(
    @InjectModel(Donor.name) private DonorSchema: mongoose.Model<Donor>,
  ) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  // Method for get coordinates form address
  async getCoordinates(
    address: string,
    city: string,
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const { data } = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: `${address}, ${city}`,
            format: 'json',
          },
        },
      );

      if (data && data.length > 0) {
        const { lat, lon } = data[0];

        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      } else {
        throw new NotFoundException('Please enter valid address!!');
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

  // Method for find donor by email
  async getDonor(email: string): Promise<Donor> {
    return await this.DonorSchema.findOne({ email });
  }

  // Method for find donor by id
  async getDonorById(id: mongoose.Types.ObjectId): Promise<Donor> {
    return await getOne(this.DonorSchema, id);
  }

  // Method for finding donors
  async getAllDonor(latlog?: string, query?: any): Promise<Donor[]> {
    let donorData = this.DonorSchema.find();

    const reciveGroup = {
      'O+': ['O+', 'O-'],
      'O-': ['O-'],
      'A+': ['O+', 'O-', 'A+', 'A-'],
      'A-': ['O-', 'A-'],
      'B+': ['O+', 'O-', 'B+', 'B-'],
      'B-': ['O-', 'B-'],
      'AB+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      'AB-': ['O-', 'A-', 'B-', 'AB-'],
    };

    //value for pagination
    const page = query.page || 1;
    const limit = query.limit || 8;
    const skip = (page - 1) * limit;

    // For show donor who have donate blood 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (latlog) {
      const [lat, lng] = latlog.split(',');
      donorData = this.DonorSchema.find({
        location: {
          $geoWithin: {
            $centerSphere: [[lng, lat], 10 / 3963.2], // Assuming a default radius of 10 miles
          },
        },
      });
    }

    // Get final donor data
    const finalData = await donorData
      .find(query.city ? { city: query.city } : null)
      .find(
        query.bloodType ? { bloodType: reciveGroup[query?.bloodType] } : null,
      )
      .find({
        $or: [
          {
            lastDonationDate: {
              $lte: sixMonthsAgo.toISOString().split('T')[0],
            },
          },
          { lastDonationDate: { $exists: false } },
        ],
      })
      .sort('location.coordinates')
      .select('-__v -location')
      .skip(skip)
      .limit(limit);

    return finalData;
  }

  // Method for update donor
  async updateDonor(
    id: mongoose.Types.ObjectId,
    updateData: CreateDonorDto,
  ): Promise<Donor> {
    const donor = await this.DonorSchema.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
      },
    );
    if (!donor) {
      throw new BadRequestException('Error while updating donor');
    }
    return donor;
  }

  // Method for send reques message to donor using twilio
  async sendSMS(smsData: SMSDto): Promise<void> {
    const message = `Hello, I'm ${smsData.name}, contacting you from Drop of Life.\nUrgent assistance is needed at ${smsData.address}.\nPlease come as soon as possible.\nAdditional message: ${smsData.message}.\nYou can reach me at ${smsData.phone}.\nThank you.`;

    await this.twilioClient.messages
      .create({
        body: message,
        from: process.env.TWILIO_SENDER_PHONE_NUMBER,
        to: `+91${smsData.donorPhone}`,
      })
      .then((message) => console.log(message.sid));
  }
}
