import { Module } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { KeycloakController } from './keycloak.controller';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [KeycloakController],
  providers: [KeycloakService],
  imports: [
    KeycloakConnectModule.registerAsync ({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        authServerUrl: configService.get('KEYCLOAK_AUTH_SERVER_URL'),
        realm: configService.get('KEYCLOAK_REALM'),
        clientId: configService.get('KEYCLOAK_CLIENT_ID'),
        secret: configService.get('KEYCLOAK_CLIENT_SECRET')
      })

    }),
  ],
  exports: [KeycloakConnectModule],

})
export class KeycloakModule {}
