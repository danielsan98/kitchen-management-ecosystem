export interface HttpAdapter {
    get<T>(url: string, body?: any ,headers?: any): Promise<T>;
    post<T>(url: string, body?: any, headers?: any): Promise<T>;
    // put<T>(url: string, body: any): Promise<T>;
    // delete<T>(url: string): Promise<T>;
}