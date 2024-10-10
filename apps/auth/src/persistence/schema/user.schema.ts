import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractSchema } from '@app/common';

@Schema({ timestamps: true, versionKey: false })
export class User extends AbstractSchema {
    email: string;
    password: string;
    name: string;
    age: number;
    phoneNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);