import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Optional } from '@nestjs/common';

@Schema({ collection: 'users' })
class UserDocument {
  @Prop({ required: true })
  userName: string;

  @Optional()
  @Prop()
  isActive: boolean;

  @Optional()
  @Prop()
  isInSession: boolean;

  @Optional()
  @Prop()
  userToConnectWith: string;

  // @Prop()
  // pendingConnection: number | string;

  // @Prop()
  // clickType: number;
}

export type User = UserDocument & Document;

export const userSchema = SchemaFactory.createForClass(UserDocument);
