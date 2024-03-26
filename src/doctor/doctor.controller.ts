import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { Doctor } from './schema/doctor.schema';

@Controller('doctors')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<Doctor> {
    return this.doctorService.getDoctorById(id);
  }

  @Get('/')
  async getAllDoctor(): Promise<Doctor[]> {
    return this.doctorService.getAllDoctor();
  }

  @Put('/:id')
  async updateDoctor(
    @Body() updateData: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<Doctor> {
    return this.doctorService.updateDoctor(updateData, id);
  }

  @Delete('/:id')
  async dleeteDoctor(@Param('id') id: string): Promise<string> {
    return this.doctorService.deleteDoctor(id);
  }
}
