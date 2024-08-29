// src/types/env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      PORT: number;
      GEMINI_API_KEY: string;
      GEMINI_API_URL: string;
    }
  }
  