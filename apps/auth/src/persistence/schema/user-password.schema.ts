import { AbstractSchema } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true, versionKey: false })
export class UserPassword extends AbstractSchema {
    @Prop({ type: Types.ObjectId, ref: User.name })
    user: User;
    @Prop()
    password: string;
    @Prop()
    salt: string;
}

export const UserPasswordSchema = SchemaFactory.createForClass(UserPassword);