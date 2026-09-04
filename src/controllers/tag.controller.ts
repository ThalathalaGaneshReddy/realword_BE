import { Request, Response } from "express";

import { prisma } from "../lib/prisma";

export async function getTagsController(_req: Request, res: Response) {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      tags: tags.map((tag) => tag.name),
    });
  } catch (error) {
    console.error("Get tags error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}
