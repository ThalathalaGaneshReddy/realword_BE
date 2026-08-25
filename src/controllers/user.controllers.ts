import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getUserResponse } from "../utils/user-response";

function normalizeNullableString(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const valueTrimmed = value.trim();

  return valueTrimmed === "" ? null : valueTrimmed;
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
          body: ["User not found"],
        },
      });
    }

    return res.status(200).json({
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { user } = req.body;

    if (!user) {
      return res.status(422).json({
        errors: {
          body: ["user is required"],
        },
      });
    }

    const data: {
      username?: string;
      email?: string;
      bio?: string | null;
      image?: string | null;
    } = {};

    if (user.username !== undefined) {
      data.username = user.username;
    }

    if (user.email !== undefined) {
      data.email = user.email.toLowerCase();
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
    console.error(error);

    if (error.code === "P2002") {
      return res.status(422).json({
        errors: {
          body: ["Username or email already exists"],
        },
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        errors: {
          body: ["User not found"],
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
