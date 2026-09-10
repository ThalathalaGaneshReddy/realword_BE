export const MESSAGES = {
  VALIDATION: {
    REQUIRED: "is required",
    CANT_BE_BLANK: "can't be blank",
    MUST_BE_ARRAY: "must be an array",
    PASSWORD_TOO_SHORT: "is too short (minimum is 8 characters)",
  },

  AUTH: {
    TOKEN_MISSING: "is missing",
    TOKEN_INVALID: "is invalid",
    INVALID_CREDENTIALS: "invalid",
  },

  ARTICLE: {
    REQUIRED: "article is required",
    NOT_FOUND: "not found",
    FORBIDDEN: "forbidden",
  },

  COMMENT: {
    REQUIRED: "comment is required",
    NOT_FOUND: "not found",
    FORBIDDEN: "forbidden",
  },

  PROFILE: {
    NOT_FOUND: "not found",
  },

  USER: {
    REQUIRED: "user is required",
    NOT_FOUND: "not found",
    ALREADY_TAKEN: "has already been taken",
    ALREADY_EXISTS: "already exists",
  },

  SERVER: {
    INTERNAL_ERROR: "Internal server error",
  },
} as const;
