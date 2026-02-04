import { SetMetadata } from '@nestjs/common';
import { ValidKcRoles } from '../interfaces/kc-valid-roles.interface';

export const META_KC_ROLES = 'kc-roles';

export const KcRolProtected = (...args: ValidKcRoles[]) => SetMetadata(META_KC_ROLES, args);