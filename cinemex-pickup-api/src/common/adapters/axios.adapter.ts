import axios, { AxiosInstance } from "axios";
import { HttpAdapter } from "../interfaces/http-adapter.interface";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class AxiosAdapter implements HttpAdapter {

    private axios: AxiosInstance = axios;

    private logger = new Logger('AxiosAdapter');

    async get<T>(url: string, body?: any, headers?: any): Promise<T> {
        try {
            const { data } = await this.axios.get<T>(url, body);
            return data;
        } catch (error) {
            this.logger.debug('Error in GET request:', error);
            throw new Error('This is an error - Check logs');
        }
    }
    async post<T>(url: string, body: any, headers?: any): Promise<T> {
        try {
            const { data } = await this.axios.post<T>(url, body, headers);
            return data;
        } catch (error) {
            this.logger.debug('Error in POST request:', error);
            throw new Error('This is an error - Check logs');
        }
    }


}