import prisma from "../db";
import { UpdateProfileType } from "./profile.type";

export const getProfile = async (id: number) => {
  const profile = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  return profile;
};

export const updateProfile = async (id: number, data: UpdateProfileType) => {
  const currentUser = await getProfile(id);

  const isUserExist = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (isUserExist && isUserExist.email !== currentUser.email) {
    throw new Error("Email already exist");
  }

  const profile = await prisma.user.update({
    data: {
      name: data.name,
      email: data.email,
    },
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return profile;
};
