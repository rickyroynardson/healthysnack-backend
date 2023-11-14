import prisma from "../db";
import { verify } from "../utils/hash-password";
import { signAccessToken } from "../utils/jwt";
import { LoginType } from "./auth.type";

export const login = async (credentials: LoginType) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: credentials.email,
    },
  });
  if (!isUserExist) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await verify(
    isUserExist.password,
    credentials.password
  );
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const accessToken = signAccessToken({ id: isUserExist.id });

  return {
    user: {
      id: isUserExist.id,
      name: isUserExist.name,
      email: isUserExist.email,
    },
    accessToken,
  };
};
