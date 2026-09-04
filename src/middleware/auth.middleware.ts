import { Request, Response, NextFunction } from "express";

import { prisma } from "../lib/prisma";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        errors: {
          token: ["is missing"],
        },
      });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Token" || !token) {
      return res.status(401).json({
        errors: {
          token: ["is invalid"],
        },
      });
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      return res.status(401).json({
        errors: {
          token: ["is invalid"],
        },
      });
    }

    req.userId = user.id;

    next();
  } catch (error) {
    return res.status(401).json({
      errors: {
        token: ["is invalid"],
      },
    });
  }
}

export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return next();
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Token" || !token) {
      return next();
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
      },
    });

    if (user) {
      req.userId = user.id;
    }

    next();
  } catch {
    next();
  }
}
