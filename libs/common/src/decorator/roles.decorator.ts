import { Reflector } from '@nestjs/core';

export const ROLE = {
	guest: 'GUEST',
	user: 'USER',
	admin: 'ADMIN'
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE]; // GUEST | USER | ADMIN

export const Roles = Reflector.createDecorator<Role[]>();
