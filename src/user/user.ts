import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'users' })
class UserDocument {
  @Prop({ required: true })
  userName: string;

  @Prop()
  isActive: boolean;

  // @Prop()
  // isInSession: boolean;

  // @Prop()
  // connectWith: number | string;

  // @Prop()
  // pendingConnection: number | string;

  // @Prop()
  // activeTouch: number;
}

export type User = UserDocument & Document;

export const userSchema = SchemaFactory.createForClass(UserDocument);
