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

  async firstLaunch(userName: string, isActive: boolean): Promise<User> {
    const existingUser = await this._userModel.findOne({ userName });
    if (existingUser) {
      throw new Error(`User with username "${userName}" already exists.`);
    }

    return await this._userModel.create({
      userName,
      isActive,
    });
  }

  async login(userName: string): Promise<void> {
    const existingUser = await this._userModel.findOne({ userName }).exec();

    if (!existingUser) {
      throw new Error('Not registered user.');
    }
    console.log('>>>>>>111', existingUser)


    await this._userModel.findOneAndUpdate(
      { userName },
      { $set: { isActive: true } },
      { new: true },
    ).exec();
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

  async createConnection(userName: string, userToConnectWith: string): Promise<void> {
    const existingUser = await this._userModel.findOne({ userName }).exec();

    if (!existingUser) {
      throw new Error('Not registered user.');
    }
    console.log('>>>>>>111', existingUser)

  }

  async findOne(filter: any): Promise<User> {
    return await this._userModel.findOne(filter).exec();
  }

  async update(filter: any, update: any): Promise<void> {
    await this._userModel.updateOne(filter, update).exec();
  }
}
