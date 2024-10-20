import { MongoSchema, ROLE, Role } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { UserPassword } from './user-password.schema';

@Schema({ timestamps: true, versionKey: false })
export class User extends MongoSchema {
	@Prop({ unique: true })
	email: string;
	@Prop()
	name: string;
	@Prop({ unique: true })
	nickname: string;
	@Prop()
	age: number;
	@Prop({ unique: true })
	phoneNumber: string;
	@Prop({ type: String, default: ROLE.guest })
	role: Role;
	@Prop({ type: ObjectId, ref: UserPassword.name, select: false })
	userPassword: UserPassword;
}

export const UserSchema = SchemaFactory.createForClass(User);
