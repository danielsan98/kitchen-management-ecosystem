// src/auth/context/AuthContext.tsx
import { createContext } from 'react';

interface AuthContextProps {
  token: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>; // Modifica la firma de la función login
  logOut: () => void;
  refreshToken: (token: string) => Promise<void>; // Modifica la firma de la función refreshToken
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  email: null,
  loading: false,
  error: null,
  login: async() => {},
  logOut: () => {},
  refreshToken: async() => {},
});

export default AuthContext;