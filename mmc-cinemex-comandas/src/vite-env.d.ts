/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SECRET_KEY: string;
    // Agrega aquí otras variables de entorno que tengas
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  