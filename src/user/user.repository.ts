import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel('User')
    private readonly _userModel: Model<User>,
  ) { }

  async firstLaunch(userName: string): Promise<User> {
    const existingUser = await this._userModel.findOne({ userName });
    if (existingUser) {
      throw new Error(`User with username "${userName}" already exists.`);
    }

    return await this._userModel.create({
      userName,
      isActive: true,
      isInSession: false,
      connections: [],
      drawingGestureType: 5,
      tapGestureLocation: [],
    });
  }

  async login(userName: string): Promise<void> {
    const existingUser = await this._userModel.findOne({ userName }).exec();

    if (!existingUser) {
      throw new Error('Not registered user.');
    }

    await this._userModel.findOneAndUpdate(
      { userName },
      { $set: { isActive: true } },
      { new: true },
    ).exec();
  }

  async logout(userName: string): Promise<void> {
    const existingUser = await this._userModel.findOne({ userName }).exec();

    if (!existingUser) {
      throw new Error('Not registered user.');
    }

    await this._userModel.findOneAndUpdate(
      { userName },
      { $set: { isActive: false, isInSession: false, connections: [] } },
      { new: true },
    ).exec();
  }

  async getUserInfo(userName: string): Promise<User> {
    const user = await this._userModel.findOne({ userName }).exec();

    return user;
  }

  async updateUserName(userName: string, newUserName: string): Promise<void> {
    const userWithSameUsername = await this._userModel.findOne({ userName: newUserName }).exec();
    const existingUser = await this._userModel.findOne({ userName }).exec();

    if (!existingUser) {
      throw new Error('Not registered user. The given userName is not correct');
    }

    if (userWithSameUsername) {
      throw new Error('This username already taken.');
    }

    await this._userModel.findOneAndUpdate(
      { userName: userName },
      { $set: { userName: newUserName } },
      { new: true },
    ).exec();
  }

  async connectUsers(userName: string, userToConnectWith: string): Promise<User> {
    await this._userModel.findOneAndUpdate(
      { userName: userToConnectWith },
      { $set: { connections: [userName] } },
      { new: true },
    ).exec();

    await this._userModel.findOneAndUpdate(
      { userName: userName },
      { $set: { isInSession: true } },
      { new: true },
    ).exec();

    const updatedUser = await this._userModel.findOne({ userName }).exec();

    return updatedUser;
  }

  async updateSessionStatus(userName: string, connections: string[]): Promise<User> {
    const connectedUser = connections[0];
    await this._userModel.findOneAndUpdate(
      { userName: connectedUser },
      { $set: { connections: [userName] } },
      { new: true },
    ).exec();

    await this._userModel.findOneAndUpdate(
      { userName: userName },
      { $set: { isInSession: true } },
      { new: true },
    ).exec();

    const updatedUser = await this._userModel.findOne({ userName }).exec();

    return updatedUser;
  }

  async fillConnectedUserData(payload): Promise<void> {
    const connectedUser = payload.connections[0];
    await this._userModel.findOneAndUpdate(
      { userName: connectedUser },
      { $set: { drawingGestureType: payload.drawingGestureType, tapGestureLocation: payload.tapGestureLocation } },
      { new: true },
    ).exec();
  }

  async disconnect(userName: string): Promise<void> {
    await this._userModel.findOneAndUpdate(
      { userName },
      { $set: { isInSession: false, connections: [] } },
      { new: true },
    ).exec();
  }

  async resetUserData(userName: string): Promise<void> {
    await this._userModel.findOneAndUpdate(
      { userName },
      { $set: { drawingGestureType: 5, tapGestureLocation: [] } },
      { new: true },
    ).exec();
  }

  async findOne(filter: any): Promise<User> {
    return await this._userModel.findOne(filter).exec();
  }

  async update(filter: any, update: any): Promise<void> {
    await this._userModel.updateOne(filter, update).exec();
  }
}
