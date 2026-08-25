import { prisma } from "../lib/prisma";
import { slugify } from "../utils/slug";

const articleListInclude = {
  author: {
    select: {
      username: true,
      bio: true,
      image: true,
    },
  },

  tags: {
    include: {
      tag: true,
    },
  },

  favorites: {
    select: {
      userId: true,
    },
  },

  _count: {
    select: {
      favorites: true,
    },
  },
} as const;

const articleDetailInclude = {
  author: {
    select: {
      username: true,
      bio: true,
      image: true,
    },
  },

  tags: {
    include: {
      tag: true,
    },
  },

  favorites: {
    select: {
      userId: true,
    },
  },

  _count: {
    select: {
      favorites: true,
    },
  },
} as const;

async function generateUniqueSlug(
  title: string,
  excludeArticleId?: string,
): Promise<string> {
  const baseSlug = slugify(title);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findFirst({
      where: {
        slug,

        ...(excludeArticleId
          ? {
              NOT: {
                id: excludeArticleId,
              },
            }
          : {}),
      },

      select: {
        id: true,
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function createArticle(
  authorId: string,
  data: {
    title: string;
    description: string;
    body: string;
    tagList?: string[];
  },
) {
  const slug = await generateUniqueSlug(data.title);

  const tagList = data.tagList ?? [];

  const uniqueTags = [...new Set(tagList)];

  const article = await prisma.$transaction(async (tx) => {
    const createdArticle = await tx.article.create({
      data: {
        title: data.title,
        description: data.description,
        body: data.body,
        slug,
        authorId,
      },
    });

    for (const tagName of uniqueTags) {
      const tag = await tx.tag.upsert({
        where: {
          name: tagName,
        },

        update: {},

        create: {
          name: tagName,
        },
      });

      await tx.articleTag.create({
        data: {
          articleId: createdArticle.id,

          tagId: tag.id,
        },
      });
    }

    return tx.article.findUniqueOrThrow({
      where: {
        id: createdArticle.id,
      },

      include: articleDetailInclude,
    });
  });

  return article;
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: {
      slug,
    },

    include: articleDetailInclude,
  });
}

export async function getArticles(options: { author?: string; tag?: string }) {
  const { author, tag } = options;

  return prisma.article.findMany({
    where: {
      ...(author
        ? {
            author: {
              username: author,
            },
          }
        : {}),

      ...(tag
        ? {
            tags: {
              some: {
                tag: {
                  name: tag,
                },
              },
            },
          }
        : {}),
    },

    include: articleListInclude,

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateArticle(
  slug: string,
  authorId: string,
  data: {
    title?: string;
    description?: string;
    body?: string;
    tagList?: string[];
  },
) {
  const existing = await prisma.article.findUnique({
    where: {
      slug,
    },
  });

  if (!existing) {
    return {
      type: "NOT_FOUND" as const,
    };
  }

  if (existing.authorId !== authorId) {
    return {
      type: "FORBIDDEN" as const,
    };
  }

  let newSlug = existing.slug;

  if (data.title !== undefined && data.title !== existing.title) {
    newSlug = await generateUniqueSlug(data.title, existing.id);
  }

  const updatedArticle = await prisma.$transaction(async (tx) => {
    await tx.article.update({
      where: {
        id: existing.id,
      },

      data: {
        ...(data.title !== undefined
          ? {
              title: data.title,
              slug: newSlug,
            }
          : {}),

        ...(data.description !== undefined
          ? {
              description: data.description,
            }
          : {}),

        ...(data.body !== undefined
          ? {
              body: data.body,
            }
          : {}),
      },
    });

    /**
     * VERY IMPORTANT
     *
     * undefined:
     *   Don't touch existing tags.
     *
     * []:
     *   Remove all tags.
     *
     * ["tag1"]&#58;          *   Replace tags.
     */
    if (data.tagList !== undefined) {
      await tx.articleTag.deleteMany({
        where: {
          articleId: existing.id,
        },
      });

      const uniqueTags = [...new Set(data.tagList)];

      for (const tagName of uniqueTags) {
        const tag = await tx.tag.upsert({
          where: {
            name: tagName,
          },

          update: {},

          create: {
            name: tagName,
          },
        });

        await tx.articleTag.create({
          data: {
            articleId: existing.id,
            tagId: tag.id,
          },
        });
      }
    }

    return tx.article.findUniqueOrThrow({
      where: {
        id: existing.id,
      },

      include: articleDetailInclude,
    });
  });

  return {
    type: "SUCCESS" as const,
    article: updatedArticle,
  };
}

export async function deleteArticle(slug: string, authorId: string) {
  const article = await prisma.article.findUnique({
    where: {
      slug,
    },
  });

  if (!article) {
    return {
      type: "NOT_FOUND" as const,
    };
  }

  if (article.authorId !== authorId) {
    return {
      type: "FORBIDDEN" as const,
    };
  }

  await prisma.article.delete({
    where: {
      id: article.id,
    },
  });

  return {
    type: "SUCCESS" as const,
  };
}
