import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { getUserResponse } from "../utils/user-response";

export async function register(req: Request, res: Response) {
  try {
    const { user } = req.body;

    if (!user?.username || !user?.email || !user?.password) {
      return res.status(422).json({
        errors: {
          body: ["username, email and password are required"],
        },
      });
    }

    const email = user.email.toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: user.username,
          },
          {
            email,
          },
        ],
      },
    });

    if (existingUser) {
      return res.status(422).json({
        errors: {
          body: ["Username or email already exists"],
        },
      });
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: user.username,
        email,
        password: hashedPassword,
        bio: null,
        image: null,
      },
    });

    return res.status(201).json({
      user: getUserResponse(newUser),
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

export async function login(req: Request, res: Response) {
  try {
    const { user } = req.body;

    if (!user?.email || !user?.password) {
      return res.status(422).json({
        errors: {
          body: ["email and password are required"],
        },
      });
    }

    const email = user.email.toLowerCase();

    const dbUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!dbUser) {
      return res.status(401).json({
        errors: {
          body: ["Invalid email or password"],
        },
      });
    }

    const passwordValid = await bcrypt.compare(user.password, dbUser.password);

    if (!passwordValid) {
      return res.status(401).json({
        errors: {
          body: ["Invalid email or password"],
        },
      });
    }

    return res.status(200).json({
      user: getUserResponse(dbUser),
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
