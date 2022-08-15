import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  email: string;
  password: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(240)
  bio: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(11)
  @MinLength(10)
  phone: string;
}
