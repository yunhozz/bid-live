import { SetMetadata } from '@nestjs/common';

export const role = {
    guest: "GUEST",
    user: "USER",
    admin: "ADMIN"
} as const;

export type Role = typeof role[keyof typeof role]; // GUEST | USER | ADMIN

export const ROLES = "roles";

export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);