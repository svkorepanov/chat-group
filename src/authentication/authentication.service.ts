import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { User } from 'src/user/user.entity';
import { UsersService } from 'src/user/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { PgErrorCodes } from 'src/constants/postgres';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersSerice: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async singUp(signUpData: SignUpDto): Promise<User> {
    const hashedPassword = await this.hashPassword(signUpData.password);

    try {
      return await this.usersSerice.create({
        ...signUpData,
        password: hashedPassword,
      });
    } catch (error) {
      if (error?.code === PgErrorCodes.UniqueViolation) {
        throw new ConflictException(
          `User with email: ${signUpData.email} alread exists`,
        );
      }

      throw new InternalServerErrorException();
    }
  }

  public async signIn(user: User): Promise<{ accessToken: string }> {
    const jwtPayload: JwtPayload = { username: user.name, sub: user.id };
    const accessToken = this.jwtService.sign(jwtPayload);

    return { accessToken };
  }

  public async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.usersSerice.findByemail(email);
      await this.verifyPassword(password, user.password);
      return user;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw new UnauthorizedException();
      }

      throw new InternalServerErrorException();
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return await hash(password, salt);
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string) {
    const isPasswordMatching = await compare(plainPassword, hashedPassword);

    if (!isPasswordMatching) {
      throw new UnauthorizedException();
    }
  }
}