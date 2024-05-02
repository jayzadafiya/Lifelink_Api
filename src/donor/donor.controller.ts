import { Body, Controller, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DonorService } from './donor.service';
import { CreateDonorDto } from './dto/createDonor.dto';
import { Donor } from './schema/donor.schema';
import { RolesGuard } from 'shared/role/role.gurd';

@Controller('donor')
export class DonorController {
  constructor(private donorService: DonorService) {}

  // Endpoint for create and update donor
  @UseGuards(RolesGuard)
  @Put('/')
  async donorDetails(@Body() donorDetails: CreateDonorDto): Promise<Donor> {
    const { address, email, city } = donorDetails;
    const donor = await this.donorService.getDonor(email);

    if (!donor) {
      const { latitude, longitude } = await this.donorService.getCoordinates(
        address,
        city,
      );

      donorDetails.location = {
        coordinates: [longitude, latitude],
      };

      return await this.donorService.createDonor(donorDetails);
    }

    // Set coordinates base on address
    if (donor.address !== address || donor.city !== city) {
      const { latitude, longitude } = await this.donorService.getCoordinates(
        address,
        city,
      );

      donor.location.coordinates = [longitude, latitude];
      await donor.save();
    }

    return await this.donorService.updateDonor(donor._id, donorDetails);
  }

  // Endpoint for get donor from query
  @Post('/')
  async getAllDonor(
    @Body('latlng') latlog: string,
    @Query() query?: any,
  ): Promise<Donor[]> {
    //if latlog is not present then use addres
    if (!latlog && query.address) {
      const { latitude, longitude } = await this.donorService.getCoordinates(
        query.address,
        query.city,
      );
      latlog = latitude + ',' + longitude;
    }
    return await this.donorService.getAllDonor(latlog, query);
  }
}
