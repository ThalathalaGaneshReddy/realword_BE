import { Response } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getUserResponse } from "../utils/user-response";

function normalizeNullableString(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId!,
      },
    });

    if (!user) {
      return res.status(401).json({
        errors: {
          token: ["is invalid"],
        },
      });
    }

    return res.status(200).json({
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.body?.user;

    if (!user) {
      return res.status(422).json({
        errors: {
          body: ["user is required"],
        },
      });
    }

    if (user.username !== undefined) {
      if (typeof user.username !== "string" || !user.username.trim()) {
        return res.status(422).json({
          errors: {
            username: ["can't be blank"],
          },
        });
      }
    }

    if (user.email !== undefined) {
      if (typeof user.email !== "string" || !user.email.trim()) {
        return res.status(422).json({
          errors: {
            email: ["can't be blank"],
          },
        });
      }
    }

    if (user.password !== undefined) {
      if (typeof user.password !== "string" || !user.password.trim()) {
        return res.status(422).json({
          errors: {
            password: ["can't be blank"],
          },
        });
      }

      if (user.password.length < 8) {
        return res.status(422).json({
          errors: {
            password: ["is too short (minimum is 8 characters)"],
          },
        });
      }
    }

    const data: {
      username?: string;
      email?: string;
      password?: string;
      bio?: string | null;
      image?: string | null;
    } = {};

    if (user.username !== undefined) {
      data.username = user.username.trim();
    }

    if (user.email !== undefined) {
      data.email = user.email.trim().toLowerCase();
    }

    if (user.password !== undefined) {
      data.password = await bcrypt.hash(user.password, 10);
    }

    if (user.bio !== undefined) {
      data.bio =
        user.bio === null
          ? null
          : typeof user.bio === "string"
            ? user.bio
            : null;
    }

    if (user.image !== undefined) {
      data.image =
        user.image === null
          ? null
          : typeof user.image === "string"
            ? user.image
            : null;
    }

    if (user.bio !== undefined) {
      data.bio = normalizeNullableString(user.bio);
    }

    if (user.image !== undefined) {
      data.image = normalizeNullableString(user.image);
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: req.userId!,
      },
      data,
    });

    return res.status(200).json({
      user: getUserResponse(updatedUser),
    });
  } catch (error: any) {
    console.error("Update user error:", error);

    if (error.code === "P2002") {
      const target = error.meta?.target;

      if (Array.isArray(target) && target.includes("username")) {
        return res.status(409).json({
          errors: {
            username: ["has already been taken"],
          },
        });
      }

      if (Array.isArray(target) && target.includes("email")) {
        return res.status(409).json({
          errors: {
            email: ["has already been taken"],
          },
        });
      }

      return res.status(409).json({
        errors: {
          body: ["already exists"],
        },
      });
    }

    if (error.code === "P2025") {
      return res.status(401).json({
        errors: {
          token: ["is invalid"],
        },
      });
    }

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}
