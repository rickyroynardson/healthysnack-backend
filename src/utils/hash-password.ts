import argon2 from "argon2";

export const hash = async (password: string) => {
  return await argon2.hash(password);
};

export const verify = async (hash: string, plain: string) => {
  return await argon2.verify(hash, plain);
};
