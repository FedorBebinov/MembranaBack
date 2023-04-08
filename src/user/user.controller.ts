import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { User } from './user';
import { UserRepository } from './user.repository';

class CreateUserPayload {
  userName: string;
  isActive: boolean;
}

@Controller()
export class UserController {
  constructor(private readonly _userRepository: UserRepository) {}

  @Post()
  async firstLaunch(@Body() payload: CreateUserPayload): Promise<User> {
    if (!payload.userName) {
      throw new BadRequestException('No username was provided.');
    }

    return await this._userRepository.firstLaunch(
      payload.userName,
      payload.isActive,
    );
  }
}
