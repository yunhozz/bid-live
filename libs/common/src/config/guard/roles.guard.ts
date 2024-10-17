import { ROLES } from '@app/common/decorator/roles.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { getMetadata } from 'reflect-metadata/no-conflict';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const roles: string[] = getMetadata(ROLES, context.getHandler());
		if (!roles) {
			return true;
		}
		const request: Request = context.switchToHttp().getRequest();

		return roles.some((role) => request.user?.['role'] == role);
	}
}
