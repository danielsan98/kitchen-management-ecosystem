// src/auth/context/AuthProvider.tsx
import { ReactNode, useReducer } from "react";
import  AuthContext  from "./AuthContext.js";
import { AuthReducer } from "./AuthReducer.js";
import { types } from "../types/types.js";
// import { postApi } from "../../api/cinemex.api";
// import cinemexUrls from "../../api/cinemexUrls";
import { postLogin, postRefreshToken } from "../../api/cinemex.api.js";

const initialState = {
    logged: false,
    token: null,
    email: null,
    loading: false,
    error: null
}

const init = () => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    return user || initialState;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [authState, dispatch] = useReducer(AuthReducer, initialState, init);

    const login = async (email: string, password: string) => {
        dispatch({ type: types.login });
        try {
            // const response = await postApi( email, password );
            const response = await postLogin(email, password);
            if (response.token) {
                localStorage.setItem("user", JSON.stringify({ email, token: response.token }));
                dispatch({
                    type: types.loginSuccess,
                    payload: { email, token: response.token }
                });
            } else {
                dispatch({
                    type: types.loginError,
                    error: response.message || "Login failed"
                });
            }
        } catch (error) {
            dispatch({
                type: types.loginError,
                error: "Login failed"
            });
        }
    };
    const logOut = () => {
        localStorage.removeItem("user");
        dispatch({ type: types.logoutSuccess });
    };

    const refresh = async (token: string) => {
        dispatch({ type: types.refreshToken });
        try {
            // const response = await postApi(`${cinemexUrls.refresh}`, { token });
            const response = await postRefreshToken(token);
            if (response.token) {
                localStorage.setItem("user", JSON.stringify({ email: authState.email, token: response.token }));
                dispatch({
                    type: types.refreshTokenSuccess,
                    payload: { email: authState.email, token: response.token }
                });
            } else {
                dispatch({
                    type: types.refreshTokenError,
                    error: response.message || "Refresh token failed"
                });
            }
        } catch (error) {
            dispatch({
                type: types.refreshTokenError,
                error: "Refresh token failed"
            });
        }
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logOut, refreshToken: refresh }}>
            {children}
        </AuthContext.Provider>
    );
}