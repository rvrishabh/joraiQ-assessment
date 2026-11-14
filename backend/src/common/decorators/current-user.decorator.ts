import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthUser } from 'types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<{ user: AuthUser }>().user,
);
