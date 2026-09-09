import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";
import { getUserResponse } from "../utils/user-response";
import { MESSAGES } from "../constants/messages";

export async function register(req: Request, res: Response) {
  try {
    const user = req.body?.user;

    if (!user) {
      return res.status(422).json({
        errors: {
          body: [MESSAGES.USER.REQUIRED],
        },
      });
    }

    if (typeof user.username !== "string" || !user.username.trim()) {
      return res.status(422).json({
        errors: {
          username: [MESSAGES.VALIDATION.CANT_BE_BLANK],
        },
      });
    }

    if (typeof user.email !== "string" || !user.email.trim()) {
      return res.status(422).json({
        errors: {
          email: [MESSAGES.VALIDATION.CANT_BE_BLANK],
        },
      });
    }

    if (typeof user.password !== "string" || !user.password.trim()) {
      return res.status(422).json({
        errors: {
          password: [MESSAGES.VALIDATION.CANT_BE_BLANK],
        },
      });
    }

    const username = user.username.trim();
    const email = user.email.trim().toLowerCase();

    const existingUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      return res.status(409).json({
        errors: {
          username: [MESSAGES.USER.ALREADY_TAKEN],
        },
      });
    }

    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        errors: {
          email: [MESSAGES.USER.ALREADY_TAKEN],
        },
      });
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        bio: user.bio ?? null,
        image: user.image ?? null,
      },
    });

    return res.status(201).json({
      user: getUserResponse(newUser),
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      errors: {
        body: [MESSAGES.SERVER.INTERNAL_ERROR],
      },
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const user = req.body?.user;

    if (!user) {
      return res.status(422).json({
        errors: {
          body: [MESSAGES.USER.REQUIRED],
        },
      });
    }

    if (typeof user.email !== "string" || !user.email.trim()) {
      return res.status(422).json({
        errors: {
          email: [MESSAGES.VALIDATION.CANT_BE_BLANK],
        },
      });
    }

    if (typeof user.password !== "string" || !user.password.trim()) {
      return res.status(422).json({
        errors: {
          password: [MESSAGES.VALIDATION.CANT_BE_BLANK],
        },
      });
    }

    const email = user.email.trim().toLowerCase();

    const dbUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!dbUser) {
      return res.status(401).json({
        errors: {
          credentials: [MESSAGES.AUTH.INVALID_CREDENTIALS],
        },
      });
    }

    const passwordValid = await bcrypt.compare(user.password, dbUser.password);

    if (!passwordValid) {
      return res.status(401).json({
        errors: {
          credentials: [MESSAGES.AUTH.INVALID_CREDENTIALS],
        },
      });
    }

    return res.status(200).json({
      user: getUserResponse(dbUser),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      errors: {
        body: [MESSAGES.SERVER.INTERNAL_ERROR],
      },
    });
  }
}
