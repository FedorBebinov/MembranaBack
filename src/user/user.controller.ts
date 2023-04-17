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
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

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

  @WebSocketServer() server: Server;

  @Post('register')
  async firstLaunch(@Body() payload: CreateUserPayload): Promise<{ message: string }> {
    console.log('register user payload', payload)
    if (!payload.userName) {
      console.log('no username provided in register')
      throw new BadRequestException('No username was provided.');
    }

    try {
      await this._userRepository.firstLaunch(
        payload.userName,
      );
      return { message: 'User successfully registered' };
    } catch (err) {
      console.log('>>>>error in register', err)
      // // MongoDB duplicate key error
      throw new HttpException(
        'This username already taken',
        HttpStatus.CONFLICT,
      );
    }
  }

  @Post('login')
  async login(@Body() payload: CreateUserPayload): Promise<{ message: string }> {
    console.log('login user payload', payload)
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
    console.log('logout user payload', payload)
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
    console.log('>>>>>get user info', userName)
    const user = await this._userRepository.getUserInfo(userName);
    return user;
  }


  @Put('updateUsername')
  async updateUserName(@Body() payload: UpdateUserNamePayload): Promise<{ message: string }> {
    if (!payload.newUserName) {
      console.log('no username provided in update')
      throw new BadRequestException('New username is not provided.');
    }
    console.log('rename payload', payload)
    try {
      await this._userRepository.updateUserName(
        payload.userName,
        payload.newUserName
      );
      return { message: 'Username successfully updated' };
    } catch (err) {
      console.log('>>>>error in update', err)
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  @Post('connect')
  async connectUsers(@Body() payload: ConnectUserPayload): Promise<User> {
    console.log("connect user payload", payload)
    const userToConnect = await this._userRepository.findOne({ userName: payload.userToConnectWith });

    // Check if user exist
    if (!userToConnect) {
      console.log("User not found")
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userToConnectIsInSession = userToConnect.isInSession;

    if (userToConnectIsInSession) {
      console.log("User is in another active session")
      throw new HttpException('User is in another active session.', HttpStatus.CONFLICT);
    }

    const userIsOnline = userToConnect.isActive;

    if (!userIsOnline) {
      console.log("User is offline.")
      throw new HttpException('User is offline.', HttpStatus.CONFLICT);
    }

    try {
      const updatedUser = await this._userRepository.connectUsers(
        payload.userName,
        payload.userToConnectWith
      );
      return updatedUser;
    } catch (err) {
      console.log('>>>>error in connectUsers', err)
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  @Put('updateSessionStatus')
  async updateSessionStatus(@Body() payload: UpdateSessionStatusPayload): Promise<User> {
    console.log('updateSessionStatus payload', payload)
    if (!payload.connections.length) {
      console.log('There is no user in connections.')
      throw new BadRequestException('The connection array is empty.');
    }

    try {
      const updatedUser = await this._userRepository.updateSessionStatus(
        payload.userName,
        payload.connections
      );
      return updatedUser;
    } catch (err) {
      console.log('>>>>error in update', err)
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  @Put('resetData')
  async resetUserData(@Body() payload): Promise<{ message: string }> {
    console.log('resetUserData payload', payload)
    try {
      await this._userRepository.resetUserData(
        payload.userName,
      );
      return { message: 'User data reseted!' };
    } catch (err) {
      console.log('>>>>error in  reset data', err)
      throw new HttpException(
        err.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  @Post('sendData')
  async sendData(@Body() payload: GestureDataPayload): Promise<{ message: string }> {
    console.log('sendData  payload', payload)
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
