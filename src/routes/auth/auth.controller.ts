import { Body, Controller, HttpCode, HttpStatus, Post, SerializeOptions, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { LoginBodyDTO, LoginResDTO, RefreshTokenDTO, RefreshTokenResDTO, RegisterBodyDTO, RegisterResDTO } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @SerializeOptions({ type: RegisterResDTO })
  @Post('register')
  register(@Body() body: RegisterBodyDTO) {
    // return new RegisterResDTO(await this.authService.register(body))
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginBodyDTO) {
    return new LoginResDTO(await this.authService.login(body))
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async refreshToken(@Body() body: RefreshTokenDTO) {
    return new RefreshTokenResDTO(await this.authService.refreshToken(body.refreshToken))
  }
}
