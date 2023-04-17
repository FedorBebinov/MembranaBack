import {
  BadRequestException,
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Put,
  Get,
  Query,
} from '@nestjs/common';
import { User } from './user';
import { UserRepository } from './user.repository';

class CreateUserPayload {
  userName: string;
}

class UpdateUserNamePayload {
  userName: string;
  newUserName: string;
}

class ConnectUserPayload {
  userName: string;
  userToConnectWith: string;
}

class UpdateSessionStatusPayload {
  userName: string;
  connections: string[];
}

class GestureDataPayload {
  userName: string;
  connections: string[];
  drawingGestureType: number;
  tapGestureLocation: [];
}

@Controller()
export class UserController {
  constructor(private readonly _userRepository: UserRepository) { }

  @Post('register')
  async firstLaunch(@Body() payload: CreateUserPayload): Promise<{ message: string }> {
    if (!payload.userName) {
      throw new BadRequestException('No username was provided.');
    }

    try {
      await this._userRepository.firstLaunch(
        payload.userName,
      );
      return { message: 'User successfully registered' };
    } catch (err) {
      throw new HttpException(
        'This username already taken',
        HttpStatus.CONFLICT,
      );
    }
  }

  @Post('login')
  async login(@Body() payload: CreateUserPayload): Promise<{ message: string }> {
    if (!payload.userName) {
      throw new BadRequestException('No username was provided.');
    }

    try {
      await this._userRepository.login(
        payload.userName,
      );
      return { message: 'User successfully logged In' };
    } catch (err) {
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  @Put('logout')
  async logout(@Body() payload: CreateUserPayload): Promise<{ message: string }> {
    if (!payload.userName) {
      throw new BadRequestException('No username was provided.');
    }

    try {
      await this._userRepository.logout(
        payload.userName,
      );
      return { message: 'User successfully logged out' };
    } catch (err) {
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }


  @Get('users?')
  async checkingUserData(@Query('userName') userName: string): Promise<User> {
    const user = await this._userRepository.getUserInfo(userName);
    return user;
  }


  @Put('updateUsername')
  async updateUserName(@Body() payload: UpdateUserNamePayload): Promise<{ message: string }> {
    if (!payload.newUserName) {
      throw new BadRequestException('New username is not provided.');
    }
    try {
      await this._userRepository.updateUserName(
        payload.userName,
        payload.newUserName
      );
      return { message: 'Username successfully updated' };
    } catch (err) {
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  @Post('connect')
  async connectUsers(@Body() payload: ConnectUserPayload): Promise<User> {
    const userToConnect = await this._userRepository.findOne({ userName: payload.userToConnectWith });

    if (!userToConnect) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userToConnectIsInSession = userToConnect.isInSession;

    if (userToConnectIsInSession) {
      throw new HttpException('User is in another active session.', HttpStatus.CONFLICT);
    }

    const userIsOnline = userToConnect.isActive;

    if (!userIsOnline) {
      throw new HttpException('User is offline.', HttpStatus.CONFLICT);
    }

    try {
      const updatedUser = await this._userRepository.connectUsers(
        payload.userName,
        payload.userToConnectWith
      );
      return updatedUser;
    } catch (err) {
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  @Put('updateSessionStatus')
  async updateSessionStatus(@Body() payload: UpdateSessionStatusPayload): Promise<User> {
    if (!payload.connections.length) {
      throw new BadRequestException('The connection array is empty.');
    }

    try {
      const updatedUser = await this._userRepository.updateSessionStatus(
        payload.userName,
        payload.connections
      );
      return updatedUser;
    } catch (err) {
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  @Put('resetData')
  async resetUserData(@Body() payload): Promise<{ message: string }> {
    try {
      await this._userRepository.resetUserData(
        payload.userName,
      );
      return { message: 'User data reseted!' };
    } catch (err) {
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  @Post('sendData')
  async sendData(@Body() payload: GestureDataPayload): Promise<{ message: string }> {
    const connectedUser = await this._userRepository.findOne({ userName: payload.connections[0] });

    if (!connectedUser.isInSession || !connectedUser.isActive || !connectedUser.connections.includes(payload.userName)) {
      await this._userRepository.disconnect(payload.userName);
      throw new BadRequestException(`The user ${payload.connections[0]} is no longer in session or active`);

    }
    try {
      await this._userRepository.fillConnectedUserData(
        payload,
      );
      return { message: 'Data has been successfully sent!' };
    } catch (err) {
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }
}
