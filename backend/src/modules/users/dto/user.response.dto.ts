import { ApiResponseProperty } from '@nestjs/swagger';
import { IStudent, IUser, Role } from 'types';

export class UserResponseDto implements IUser {
  @ApiResponseProperty() id!: string;
  @ApiResponseProperty() email!: string;
  @ApiResponseProperty() fullName!: string;
  @ApiResponseProperty({ enum: ['TEACHER', 'STUDENT'] }) role!: Role;
}

export class StudentResponseDto implements IStudent {
  @ApiResponseProperty() id!: string;
  @ApiResponseProperty() fullName!: string;
  @ApiResponseProperty() email!: string;
}
