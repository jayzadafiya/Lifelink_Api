import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/role/role.gurd';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'utils/role.enum';
import mongoose from 'mongoose';

@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(Role.Patient)
  @Get('/:id')
  async getUser(@Param('id') id: mongoose.Types.ObjectId): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Roles(Role.Admin)
  @Get('/')
  async getAllUser(): Promise<User[]> {
    return this.userService.getAllUser();
  }

  @Roles(Role.Patient)
  @Put('/:id')
  async updateUser(
    @Body() updateData: UpdateUserDto,
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<User> {
    return this.userService.updateUser(updateData, id);
  }

  @Roles(Role.Patient)
  @Delete('/:id')
  async dleeteUser(@Param('id') id: mongoose.Types.ObjectId): Promise<string> {
    return this.userService.deleteUser(id);
  }
}
