import { AbstractSchema, role, Role } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class User extends AbstractSchema {
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
    @Prop({ type: String, default: role.guest })
    role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);