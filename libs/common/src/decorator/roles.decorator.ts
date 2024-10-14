import { SetMetadata } from '@nestjs/common';

export const ROLE = {
    guest: "GUEST",
    user: "USER",
    admin: "ADMIN"
} as const;

export const ROLES = "roles";

export type Role = typeof ROLE[keyof typeof ROLE]; // GUEST | USER | ADMIN

export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);