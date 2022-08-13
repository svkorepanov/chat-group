import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { AuthenticationService } from './authentication.service';
import { GetUser } from './decorators/user-request.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('signup')
  @UsePipes(ValidationPipe)
  async signUp(@Body() signUpData: SignUpDto): Promise<User> {
    return this.authService.singUp(signUpData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@GetUser() user: User): Promise<{ accessToken: string }> {
    return await this.authService.signIn(user);
  }
}
