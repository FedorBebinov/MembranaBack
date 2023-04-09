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
import { Server, Socket } from 'socket.io';
import { SocketGateway } from './socket.gateway';

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
  constructor(private readonly _userRepository: UserRepository, @InjectModel('User') private readonly socketGateway: SocketGateway) { }

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

  @Post('connect')
  async connectUsers(@Body() payload: ConnectUserPayload): Promise<void> {
    const user = await this._userRepository.findOne({ userName: payload.userName });
    const userToConnect = await this._userRepository.findOne({ userName: payload.userToConnectWith });

    // Check if both users exist
    if (!user || !userToConnect) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if both users are active and not already in session
    if (userToConnect.isActive && user.isActive && !userToConnect.isInSession && !user.isInSession) {
      // Set isInSession property for both users
      await this._userRepository.update({ _userName: userToConnect.userName }, { isInSession: true });
      await this._userRepository.update({ _userName: user.userName }, { isInSession: true });

      // Create a socket connection between the two users
      // this.socketGateway.createConnection(user, userToConnect);
    } else {
      throw new HttpException('Cannot connect users', HttpStatus.BAD_REQUEST);
    }
  }

}
