import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as https from 'https';
import { AxiosAdapter } from '../common/adapters/axios.adapter';
import { RefreshUserTokenDto } from './dto/refresh-token.dto';
import { LoginUserDto } from './dto/login-user.dto';

// Definición de tipos para las respuestas de Keycloak
export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token?: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

export interface KeycloakUserInfo {
  sub: string;
  email_verified: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  // Agrega otros campos según la configuración de tu Keycloak
}

@Injectable()
export class AuthService {

  private logger = new Logger('AuthService');

  constructor(
    private readonly configService: ConfigService,

    private readonly http: AxiosAdapter
  ) { }

  async login(loginUserDto: LoginUserDto) {

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    try {

      const params = new URLSearchParams();
      params.append('client_id', this.configService.get('KEYCLOAK_CLIENT_ID'));
      params.append('client_secret', this.configService.get('KEYCLOAK_CLIENT_SECRET'));
      params.append('grant_type', 'password');
      params.append('username',  loginUserDto.email);
      params.append('password', loginUserDto.password);
      this.logger.debug('Realizando solicitud de login a Keycloak con los siguientes parámetros:' + params);

      const response = await this.http.post(
        `${this.configService.get("KEYCLOAK_AUTH_SERVER_URL")}/realms/${this.configService.get("KEYCLOAK_REALM")}/protocol/openid-connect/token`, 
        params, 
        {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent
      });


      return response;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error en la solicitud:', error.response?.data || error.message);
      } else {
        console.error('Error desconocido:', error);
      }
      throw error;
    }
  }

  async refreshToken(refreshUserTokenDto: RefreshUserTokenDto) {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });


    try {
      const params = new URLSearchParams();
      params.append('client_id', this.configService.get('KEYCLOAK_CLIENT_ID'));
      params.append('client_secret', this.configService.get('KEYCLOAK_CLIENT_SECRET'));
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshUserTokenDto.refreshToken);

      const response = await this.http.post(
        `${this.configService.get("KEYCLOAK_AUTH_SERVER_URL")}/realms/${this.configService.get("KEYCLOAK_REALM")}/protocol/openid-connect/token`, 
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          httpsAgent
        }
      );

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('Keycloak error:', error.response?.data || error.message);
        throw new BadRequestException(error.response?.data || 'Error al refrescar el token');
      }
      this.logger.error('Error desconocido:', error);
      throw new InternalServerErrorException('Error desconocido al refrescar el token');
    }
  }

}
