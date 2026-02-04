import { SetMetadata } from '@nestjs/common';

export const RolProtected = (...args: string[]) => SetMetadata('KC_USER', args);