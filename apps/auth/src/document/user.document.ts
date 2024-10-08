import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ timestamps: true, versionKey: false })
export class User extends AbstractDocument {
    email: string;
    password: string;
    name: string;
    age: number;
    phoneNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);