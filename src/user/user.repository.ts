import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel('User')
    private readonly _userModel: Model<User>,
  ) {}

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
}
