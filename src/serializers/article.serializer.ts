type ArticleAuthor = {
  username: string;
  bio: string | null;
  image: string | null;
};

type ArticleTagRelation = {
  tag: {
    name: string;
  };
};

type ArticleData = {
  slug: string;
  title: string;
  description: string;
  body?: string;

  createdAt: Date;
  updatedAt: Date;

  author: ArticleAuthor;

  tags: ArticleTagRelation[];

  favorites?: {
    userId: string;
  }[];

  _count?: {
    favorites: number;
  };
};

/**
 * Used by:
 * GET /api/articles
 *
 * IMPORTANT:
 * body is NOT returned.
 */
export function serializeArticleList(
  article: ArticleData,
  currentUserId?: string,
) {
  const favorites = article.favorites ?? [];

  return {
    title: article.title,

    slug: article.slug,

    description: article.description,

    tagList: article.tags.map((articleTag) => articleTag.tag.name),

    createdAt: article.createdAt.toISOString(),

    updatedAt: article.updatedAt.toISOString(),

    favorited: currentUserId
      ? favorites.some((favorite) => favorite.userId === currentUserId)
      : false,

    favoritesCount: article._count?.favorites ?? favorites.length,

    author: {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,
    },
  };
}

/**
 * Used by:
 * GET /api/articles/:slug
 * POST /api/articles
 * PUT /api/articles/:slug
 *
 * body IS returned.
 */
export function serializeArticleDetail(
  article: ArticleData,
  currentUserId?: string,
) {
  const favorites = article.favorites ?? [];

  return {
    title: article.title,

    slug: article.slug,

    description: article.description,

    body: article.body,

    tagList: article.tags.map((articleTag) => articleTag.tag.name),

    createdAt: article.createdAt.toISOString(),

    updatedAt: article.updatedAt.toISOString(),

    favorited: currentUserId
      ? favorites.some((favorite) => favorite.userId === currentUserId)
      : false,

    favoritesCount: article._count?.favorites ?? favorites.length,

    author: {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,
    },
  };
}
