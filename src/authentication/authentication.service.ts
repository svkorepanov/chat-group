import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt.dto';
import { User } from '../user/entities/user.entity';
import { UsersService } from '../user/users.service';
import { Socket } from 'socket.io';
import { ChannelSocket } from '../channels/interfaces/socket.interface';

type SocketMiddleware = (
  socket: ChannelSocket,
  next: (err?: Error) => void,
) => void;

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly loger = new Logger(AuthenticationService.name);

  public async singUp(signUpData: SignUpDto): Promise<User> {
    const hashedPassword = await this.hashPassword(signUpData.password);

    return await this.usersService.create({
      ...signUpData,
      password: hashedPassword,
    });
  }

  public async signIn(user: User): Promise<{ accessToken: string }> {
    const jwtPayload: JwtPayload = { username: user.name, sub: user.id };
    const accessToken = this.jwtService.sign(jwtPayload);

    return { accessToken };
  }

  public async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      await this.verifyPassword(password, user.password);
      return user;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        this.loger.error(`Unauthrozied access atempt ${email}`, error.stack);
        throw new UnauthorizedException();
      }

      this.loger.error(`Unauthrozied access atempt ${email}`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  public getWsAuthMiddleware(): SocketMiddleware {
    return async (socket, next) => {
      const token = this.extractJwtFromSocket(socket);
      if (!token) {
        return next(new UnauthorizedException());
      }

      try {
        const { sub } = await this.jwtService.verifyAsync<JwtPayload>(token);
        const user = await this.usersService.findById(sub);
        socket.data.user = user;
      } catch (error) {
        this.loger.error(
          `Unauthrozied Socket connection atempt. UserId ${socket.id}`,
          error.stack,
        );
        return next(new UnauthorizedException());
      }
      next();
    };
  }

  private extractJwtFromSocket(socket: Socket) {
    const authHeader = socket.handshake.headers?.authorization || '';

    const [, token] = authHeader.split(' ');

    return token;
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
