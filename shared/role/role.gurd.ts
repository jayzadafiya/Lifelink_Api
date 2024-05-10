import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from 'utils/role.enum';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request as Req } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Retrieve required roles from the decorator metadata.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Extract the JWT token from the request header.
    const request: Req = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    // console.log(!token);
    if (!token || token === 'null') {
      throw new UnauthorizedException('you ara not logged In');
    }

    let payload;
    try {
      // Verify the JWT token and extract payload.
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
    } catch (error) {
      throw new UnauthorizedException('Provided token is not valid!!');
    }

    if (!payload) {
      throw new UnauthorizedException(
        'the User beloging to this token does no longer exist',
      );
    }

    // Get the role of the user from the payload and attach it to the request object.
    const userRole: Role = payload.role;
    request['user'] = payload;

    if (!requiredRoles) {
      return true;
    }

    if (!requiredRoles.includes(userRole)) {
      throw new UnauthorizedException(
        'User does not have permision to perform this action',
      );
    }

    return true;
  }

  // Helper function to extract JWT token from the request header.
  private extractTokenFromHeader(request: Req): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
