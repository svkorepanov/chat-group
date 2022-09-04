import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-jwt';
import { Socket } from 'socket.io';
import { UsersService } from '../../user/users.service';
import { jwtConfig } from '../configs/jwt.config';
import { JwtPayload } from '../dto/jwt.dto';

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, 'jwt-ws') {
  constructor(private readonly userService: UsersService) {
    const strategyOptions: StrategyOptions = {
      jwtFromRequest: (req) => {
        const socket = req as any as Socket;
        const token = socket.handshake.headers.authorization;
        return token.split(' ')[1];
      },
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    };
    super(strategyOptions);
  }

  public async validate({ sub, username }: JwtPayload) {
    return { id: sub, name: username };
  }
}
