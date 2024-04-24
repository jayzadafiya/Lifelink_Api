import { SetMetadata } from '@nestjs/common';
import { Role } from 'utils/role.enum';

// Decorator to assign roles to a route or handler
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
