import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: 'password too weak',
  // })
  password: string;
}
