import { Controller } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';

@Controller('keycloak-module')
export class KeycloakController {
  constructor(private readonly keycloakService: KeycloakService) {}
}
