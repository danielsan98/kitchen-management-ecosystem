// src/auth/context/AuthReducer.ts
import { types } from "../types/types.js";

interface AuthAction {
  type: string;
  payload?: any;
  error?: string;
}

export const AuthReducer = (state: any, action: AuthAction) => {
  switch (action.type) {
    case types.login:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.loginSuccess:
      return {
        ...state,
        logged: true,
        loading: false,
        token: action.payload.token,
        email: action.payload.email,
        error: null
      };
    case types.loginError:
      return {
        ...state,
        logged: false,
        loading: false,
        token: null,
        email: null,
        error: action.error
      };
    case types.logout:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.logoutSuccess:
      return {
        ...state,
        logged: false,
        loading: false,
        token: null,
        email: null,
        error: null
      };
    case types.logoutError:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    case types.refreshToken:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.refreshTokenSuccess:
      return {
        ...state,
        loading: false,
        token: action.payload.token,
        email: action.payload.email,
        error: null
      };
    case types.refreshTokenError:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    default:
      return state;
  }
};