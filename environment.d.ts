declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET: string;
            DATABASE_URL: string;
            NODE_ENV: 'dev' | 'production' | 'test';
            PORT?: string;
        }
    }
}

export {};
