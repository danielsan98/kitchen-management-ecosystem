import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshUserTokenDto } from './dto/refresh-token.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }


  @Post('refresh-token')
  refreshToken(@Body() refreshUserTokenDto: RefreshUserTokenDto) {
    return this.authService.refreshToken(refreshUserTokenDto);
  }



}
