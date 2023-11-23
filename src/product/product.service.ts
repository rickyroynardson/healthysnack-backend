import prisma from "../db";
import { CreateProductType, UpdateProductType } from "./product.type";

export const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      productCategory: true,
    },
  });

  return products;
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

export const createProduct = async (data: CreateProductType) => {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      productCategoryId: data.productCategoryId,
    },
  });

  return product;
};

export const updateProduct = async (id: number, data: UpdateProductType) => {
  await getProductById(id);

  const product = await prisma.product.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock,
      productCategoryId: data.productCategoryId,
    },
  });

  return product;
};

export const deleteProduct = async (id: number) => {
  await getProductById(id);

  await prisma.product.delete({
    where: {
      id,
    },
  });
};
