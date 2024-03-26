import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Get('/')
  async getAllUser(): Promise<User[]> {
    return this.userService.getAllUser();
  }

  @Put('/:id')
  async updateUser(
    @Body() updateData: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<User> {
    return this.userService.updateUser(updateData, id);
  }

  @Delete('/:id')
  async dleeteUser(@Param('id') id: string): Promise<string> {
    return this.userService.deleteUser(id);
  }
}
