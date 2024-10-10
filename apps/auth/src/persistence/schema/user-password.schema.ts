import { AbstractSchema } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true, versionKey: false })
export class UserPassword extends AbstractSchema {
    @Prop({ ref: User.name })
    user: User;
    password: string;
    salt: string;
}

export const UserPasswordSchema = SchemaFactory.createForClass(UserPassword);