// src/auth/keycloak.ts
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.VITE_KEYCLOAK_AUTH_SERVER_URL || '',
  realm: process.env.VITE_KEYCLOAK_REALM || '',
  clientId: process.env.VITE_KEYCLOAK_CLIENT_ID || '',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;