import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'types';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';

@Roles('TEACHER')
class TeacherOnly {
  handler() {}
}

function ctx(role?: Role): ExecutionContext {
  return {
    getHandler: () => TeacherOnly.prototype.handler,
    getClass: () => TeacherOnly,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('lets a teacher into a teacher-only route', () => {
    expect(guard.canActivate(ctx('TEACHER'))).toBe(true);
  });

  it('blocks a student from a teacher-only route', () => {
    expect(() => guard.canActivate(ctx('STUDENT'))).toThrow(ForbiddenException);
  });

  it('blocks a request with no user', () => {
    expect(() => guard.canActivate(ctx())).toThrow(ForbiddenException);
  });
});
