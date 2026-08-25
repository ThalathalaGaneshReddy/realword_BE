import { generateToken } from "./jwt";

export function getUserResponse(user: {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  image: string | null;
}) {
  return {
    username: user.username,
    email: user.email,
    bio: user.bio,
    image: user.image,
    token: generateToken(user.id),
  };
}
