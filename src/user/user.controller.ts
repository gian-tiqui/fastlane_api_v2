import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: number) {
    return this.userService.getById(id);
  }

  @Delete(':id')
  deleteById(@Param('id') id: number) {
    return this.userService.deleteById(id);
  }
}
