import { IsEmail, IsInt, IsNotEmpty, IsPhoneNumber, IsString, Length, Min } from 'class-validator';

export class CreateUserRequestDTO {
	@IsNotEmpty()
	@IsString()
	@IsEmail({}, { message: 'Enter it in the correct email format.' })
	readonly email: string;

	@IsNotEmpty()
	@IsString()
	@Length(8, 12, { message: 'Passwords are no less than 8 digits and no more than 12 digits.' })
	readonly password: string;

	@IsNotEmpty()
	@IsString()
	@Length(1, 10, { message: 'Enter no more than 10 digits.' })
	readonly name: string;

	@IsNotEmpty()
	@IsString()
	@Length(3, 10, { message: 'Nicknames are no less than 3 and no more than 10 digits.' })
	readonly nickname: string;

	@IsNotEmpty()
	@IsInt()
	@Min(19, { message: 'Only adults can sign up.' })
	readonly age: number;

	@IsNotEmpty()
	@IsString()
	@IsPhoneNumber('KR', { message: 'Enter the correct mobile phone number.' })
	readonly phoneNumber: string;
}
