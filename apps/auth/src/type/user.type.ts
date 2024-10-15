import { CreateUserRequestDTO } from '../dto/request/create-user-request.dto';

export type TUser = Omit<CreateUserRequestDTO, 'password'>;
