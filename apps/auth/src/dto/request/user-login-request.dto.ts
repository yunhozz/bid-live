import { PickType } from '@nestjs/mapped-types';
import { CreateUserRequestDTO } from './create-user-request.dto';

export class UserLoginRequestDTO extends PickType(CreateUserRequestDTO, ['email', 'password']) {}
