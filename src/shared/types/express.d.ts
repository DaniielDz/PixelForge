declare global {
  namespace Express {
    interface Request {
      validatedData?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

export {};
