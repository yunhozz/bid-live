import { MongoSchema, Role, TRole } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Provider, TProvider } from '../../type/provider.type';
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
	@Prop({ type: String, default: Role.admin })
	role: TRole;
	@Prop({ type: String, default: Provider.local })
	provider: TProvider;
	@Prop({ type: ObjectId, ref: UserPassword.name, select: false })
	userPassword: UserPassword;
}

export const UserSchema = SchemaFactory.createForClass(User);
