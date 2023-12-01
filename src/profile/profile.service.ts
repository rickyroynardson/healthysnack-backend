import prisma from "../db";
import { hash, verify } from "../utils/hash-password";
import { UpdatePasswordType, UpdateProfileType } from "./profile.type";

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

export const updatePassword = async (id: number, data: UpdatePasswordType) => {
  const currentUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  const isCurrentPasswordMatch = await verify(
    currentUser.password,
    data.currentPassword
  );

  if (!isCurrentPasswordMatch) {
    throw new Error("Current password not match");
  }

  const hashedPassword = await hash(data.newPassword);
  const profile = await prisma.user.update({
    data: {
      password: hashedPassword,
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
