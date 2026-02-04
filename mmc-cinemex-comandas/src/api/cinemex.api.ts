import axios, { AxiosError } from 'axios';
import cinemexUrls from './cinemexUrls.js';


// const API_URL = process.env.VITE_API_URL || "http://localhost:5001/api"
const API_PORT = process.env.VITE_API_PORT || '5001';
const API_HOST = process.env.VITE_API_HOST || 'localhost';
const API_URL = `http://${API_HOST}:${API_PORT}/api`;



export const postLogin = async (email: string, password: string) => {
    try {
        const config = {
            method: "POST",
            url: `${API_URL}/${cinemexUrls.login}`,
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                email,
                password
            }
        }

        const response = await axios.request(config);

        return response.data
    } catch (error: AxiosError | any) {
        if (axios.isAxiosError(error)) {
            const err = error as AxiosError;
            return {
                message: err.message,
                error: err.name,
                statusCode: err.code ? parseInt(err.code) : 500
            };
        } else {
            return {
                message: "An unexpected error occurred",
                error: "UnknownError",
                statusCode: 500
            };
        }

    }
}

export const postRefreshToken = async (token: string) => {
    try {
        const config = {
            method: "POST",
            url: `${API_URL}/${cinemexUrls.refresh}`,
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                token
            }
        }

        const response = await axios.request(config);

        return response.data
    } catch (error: AxiosError | any) {
        if (axios.isAxiosError(error)) {
            const err = error as AxiosError;
            return {
                message: err.message,
                error: err.name,
                statusCode: err.code ? parseInt(err.code) : 500
            };
        } else {
            return {
                message: "An unexpected error occurred",
                error: "UnknownError",
                statusCode: 500
            };
        }
    }
}


export const getApi = async (url: string, token: string, params?: any) => {
    try {

        const config = {
            method: "GET",
            url: `${API_URL}/${url}`,
            params: {
                ...params
            },
            headers: {
                "Authorization": `Bearer ${token}` 
            }
        }

        // console.log("url formada: ", config.url); 

        const response = await axios.request(config);

        // console.log("Respuesta del conector: ", response);

        return response.data
    } catch (error: AxiosError | any) {
        console.error("Error en getApi:", error); 
        throw error; 
    }
}


export const postApi = async (url: string, token: string, data: any) => {
    try {
        const config = {
            method: "POST",
            url: `${API_URL}/${url}`,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            data
        }

        const response = await axios.request(config);

        return response.data
    } catch (error: AxiosError | any) {
        if (axios.isAxiosError(error)) {
            const err = error as AxiosError;
            return {
                message: err.message,
                error: err.name,
                statusCode: err.code ? parseInt(err.code) : 500
            };
        } else {
            return {
                message: "An unexpected error occurred",
                error: "UnknownError",
                statusCode: 500
            };
        }
    }
}


export const patchApi = async (url: string, token: string, params: any) => {
    try {

        const data = JSON.stringify({
            ...params
        });

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        
        if (token) { 
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            method: "PATCH",
            url: `${API_URL}/${url}`,
            headers: headers,
            data
        }

        const response = await axios.request(config);

        return response.data
    } catch (error: AxiosError | any) {
        if (axios.isAxiosError(error)) {
            const err = error as AxiosError;
            return {
                message: err.message,
                error: err.name,
                statusCode: err.code ? parseInt(err.code) : 500
            };
        } else {
            return {
                message: "An unexpected error occurred",
                error: "UnknownError",
                statusCode: 500
            };
        }
    }
}