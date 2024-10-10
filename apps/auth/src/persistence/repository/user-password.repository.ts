import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { UserPassword } from '../schema/user-password.schema';

@Injectable()
export class UserPasswordRepository extends AbstractRepository<UserPassword> {

    protected logger = new Logger(UserPasswordRepository.name);

    constructor(
        @InjectModel(UserPassword.name) private readonly userPasswordModel: Model<UserPassword>,
        @InjectConnection() connection: Connection
    ) {
        super(userPasswordModel, connection);
    }
}