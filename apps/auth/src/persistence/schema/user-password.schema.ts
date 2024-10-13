import { AbstractSchema } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class UserPassword extends AbstractSchema {
    @Prop()
    userId: Types.ObjectId;
    @Prop()
    password: string;
    @Prop()
    salt: string;
}

export const UserPasswordSchema = SchemaFactory.createForClass(UserPassword);