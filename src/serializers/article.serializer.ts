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

export function serializeArticleList(
  article: any,
  currentUserId?: string,
  followingIds: string[] = [],
) {
  const favorites = article.favorites ?? [];

  return {
    slug: article.slug,
    title: article.title,
    description: article.description,

    tagList: (article.tags ?? []).map((articleTag: any) => articleTag.tag.name),

    createdAt: article.createdAt,
    updatedAt: article.updatedAt,

    favorited: currentUserId
      ? favorites.some((favorite: any) => favorite.userId === currentUserId)
      : false,

    favoritesCount: favorites.length,

    author: {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,

      following: followingIds.includes(article.authorId),
    },
  };
}

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
