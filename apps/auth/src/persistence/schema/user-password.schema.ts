import { MongoSchema } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class UserPassword extends MongoSchema {
	@Prop()
	password: string;
	@Prop()
	salt: string;
}

export const UserPasswordSchema = SchemaFactory.createForClass(UserPassword);
