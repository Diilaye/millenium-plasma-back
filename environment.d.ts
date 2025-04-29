declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET: string;
            DATABASE_URL: string;
            NODE_ENV: 'development' | 'production' | 'test';
            PORT?: string;
        }
    }
}

export {};
