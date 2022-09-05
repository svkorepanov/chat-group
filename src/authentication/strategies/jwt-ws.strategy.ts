import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-jwt';
import { Socket } from 'socket.io';
import { JwtPayload } from '../dto/jwt.dto';

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, 'jwt-ws') {
  constructor(configService: ConfigService) {
    const strategyOptions: StrategyOptions = {
      jwtFromRequest: (req) => {
        const socket = req as any as Socket;
        const token = socket.handshake.headers.authorization;
        return token.split(' ')[1];
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    };
    super(strategyOptions);
  }

  public async validate({ sub, username }: JwtPayload) {
    return { id: sub, name: username };
  }
}
