import { SetMetadata } from '@nestjs/common';

export const Role = {
	guest: 'GUEST',
	user: 'USER',
	admin: 'ADMIN'
} as const;

export const ROLES = 'roles';

export type TRole = (typeof Role)[keyof typeof Role]; // GUEST | USER | ADMIN

export const Roles = (...roles: TRole[]) => SetMetadata(ROLES, roles);
