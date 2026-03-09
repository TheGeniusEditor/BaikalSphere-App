import "express";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth middleware after JWT verification */
      user?: {
        sub: string;
        email: string;
        orgId: string | null;
        platformRole: string;
        modules: string[];
      };
    }
  }
}
