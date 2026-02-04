import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_KC_ROLES } from '../decorators/kc-rol-protected.decorator';
import { KcUser } from '../interfaces/kc-user.interface';

@Injectable()
export class KcUserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validateRoles = this.reflector.get<string[]>(META_KC_ROLES, context.getHandler());

    if (!validateRoles) return true;
    if (validateRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const kc_user = req.user as KcUser;    

    if (!kc_user)
      throw new BadRequestException('User not found');

    for (const role of kc_user.realm_access.roles) {
      if (validateRoles.includes(role))
        return true;
    }

    throw new ForbiddenException(
      `User ${kc_user.email} need a valid role: [${validateRoles}]`
    );
  }
}
