import { Roles } from '@app/common/decorator/roles.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const roles = this.reflector.get(Roles, context.getHandler);
		if (!roles) return true;

		const req = context.switchToHttp().getRequest();

		return roles.some((role) => req.user?.role === role);
	}
}
