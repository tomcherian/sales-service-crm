import type { UserRole } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        companyId: string;
        role: UserRole;
      };
      companyId?: string;
    }
  }
}

export {};