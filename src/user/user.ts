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
  connections: string[];

  @Optional()
  @Prop()
  drawingGestureType: number;

  @Optional()
  @Prop()
  tapGestureLocation: number[];
}

export type User = UserDocument & Document;

export const userSchema = SchemaFactory.createForClass(UserDocument);