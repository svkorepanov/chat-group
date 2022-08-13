import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  email: string;
  password: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
