export interface EnvironmentVars {
    VITE_API_URL:    string;
    VITE_SECRET_KEY: string;
    BASE_URL:        string;
    MODE:            string;
    DEV:             boolean;
    PROD:            boolean;
    SSR:             boolean;
  }

export const getEnvVariables = () => {

    import.meta.env;
    
    return{
        ...import.meta.env
    }

}

export const getVariables = () => {
    const variables: EnvironmentVars = JSON.parse(JSON.stringify(getEnvVariables()));
    return variables;
}