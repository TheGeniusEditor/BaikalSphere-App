import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

interface AccessTokenPayload {
  sub: string;
  email: string;
  orgId: string | null;
  platformRole: string;
  modules: string[];
}

/**
 * Verifies the JWT access token from Authorization header or cookie.
 * Populates req.user with the slim token payload.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  let token: string | undefined;

  if (header?.startsWith("Bearer ")) {
    token = header.slice(7);
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as AccessTokenPayload;

    req.user = {
      sub: payload.sub,
      email: payload.email,
      orgId: payload.orgId,
      platformRole: payload.platformRole,
      modules: payload.modules,
    };

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Requires the user to have a specific platform role.
 */
export const requirePlatformRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.platformRole)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
};

/**
 * Requires the user to have access to a specific module.
 */
export const requireModule = (moduleId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!req.user.modules.includes(moduleId)) {
      res.status(403).json({ error: `No access to module: ${moduleId}` });
      return;
    }
    next();
  };
};
