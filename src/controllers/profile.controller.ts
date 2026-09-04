import { Response } from "express";

import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function getProfileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const username = req.params.username;

    const profileUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!profileUser) {
      return res.status(404).json({
        errors: {
          profile: ["not found"],
        },
      });
    }

    let following = false;

    if (req.userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.userId,
            followingId: profileUser.id,
          },
        },
      });

      following = !!follow;
    }

    return res.status(200).json({
      profile: {
        username: profileUser.username,
        bio: profileUser.bio,
        image: profileUser.image,
        following,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}

export async function followProfileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const followerId = req.userId!;
    const username = req.params.username;

    const profileUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!profileUser) {
      return res.status(404).json({
        errors: {
          profile: ["not found"],
        },
      });
    }

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId: profileUser.id,
        },
      },
      create: {
        followerId,
        followingId: profileUser.id,
      },
      update: {},
    });

    return res.status(200).json({
      profile: {
        username: profileUser.username,
        bio: profileUser.bio,
        image: profileUser.image,
        following: true,
      },
    });
  } catch (error) {
    console.error("Follow profile error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}

export async function unfollowProfileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const followerId = req.userId!;
    const username = req.params.username;

    const profileUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!profileUser) {
      return res.status(404).json({
        errors: {
          profile: ["not found"],
        },
      });
    }

    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: profileUser.id,
      },
    });

    return res.status(200).json({
      profile: {
        username: profileUser.username,
        bio: profileUser.bio,
        image: profileUser.image,
        following: false,
      },
    });
  } catch (error) {
    console.error("Unfollow profile error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}
