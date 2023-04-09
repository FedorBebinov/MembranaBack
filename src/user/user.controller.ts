import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';

import { User } from './user';
import { UserRepository } from './user.repository';

class CreateUserPayload {
  userName: string;
  isActive: boolean;
}

class UpdateUserNamePayload {
  userName: string;
  newUserName: string;
}

class ConnectUserPayload {
  userName: string;
  userToConnectWith: string;
}

@Controller()
export class UserController {
  constructor(private readonly _userRepository: UserRepository, @InjectModel('User')
  private readonly _userModel: Model<User>,) { }

  @WebSocketServer() server: Server;

  @Post('register')
  async firstLaunch(@Body() payload: CreateUserPayload): Promise<{ message: string }> {
    if (!payload.userName) {
      throw new BadRequestException('No username was provided.');
    }

    try {
      await this._userRepository.firstLaunch(
        payload.userName,
        payload.isActive,
      );
      return { message: 'User successfully registered' };
    } catch (err) {
      console.log('>>>>', err)
      // MongoDB duplicate key error
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

  @Put('update')
  async updateUserName(@Body() payload: UpdateUserNamePayload): Promise<{ message: string }> {
    if (!payload.newUserName) {
      throw new BadRequestException('New username is not provided.');
    }
    console.log('payload', payload)
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

  // @Post('connect')
  // async createConnection(@Body() payload: ConnectUserPayload): Promise<{ message: string }> {
  //   if (!payload.userName) {
  //     throw new BadRequestException('No username was provided.');
  //   }

  //   try {
  //     await this._userRepository.createConnection(
  //       payload.userName,
  //       payload.userToConnectWith
  //     );
  //     return { message: 'User successfully logged In' };
  //   } catch (err) {
  //     throw new HttpException(
  //       err.message,
  //       HttpStatus.CONFLICT,
  //     );
  //   }
  // }

  // @Post('connect')
  // async createConnection(@Body() body: { userName: string; userToConnectWith: string }) {
  //   const { userName, userToConnectWith } = body;

  //   // Check if the other user is active and not in session
  //   const isUserToConnectWithActiveAndNotInSession = await this.userService.checkIfUserToConnectWithIsActiveAndNotInSession(userToConnectWith);

  //   if (!isUserToConnectWithActiveAndNotInSession) {
  //     throw new Error('The user to connect with is not active or is in session.');
  //   }

  //   // Update the users' `isInSession` properties in the database
  //   // ...

  //   // Emit the `usersConnected` event to all connected clients
  //   this.userService.connect(user1);
  //   this.userService.connect(user2);
  // }
}
