import prisma from "../db";
import {
  CreateProductCategoryType,
  UpdateProductCategoryType,
} from "./product-category.type";

export const getProductCategories = async () => {
  const productCategories = await prisma.productCategory.findMany();

  return productCategories;
};

export const getProductCategoryById = async (id: number) => {
  const productCategory = await prisma.productCategory.findUnique({
    where: {
      id,
    },
  });

  if (!productCategory) {
    throw new Error("Product category not found");
  }

  return productCategory;
};

export const createProductCategory = async (
  data: CreateProductCategoryType
) => {
  const productCategory = await prisma.productCategory.create({
    data: {
      name: data.name,
    },
  });

  return productCategory;
};

export const updateProductCategory = async (
  id: number,
  data: UpdateProductCategoryType
) => {
  await getProductCategoryById(id);

  const productCategory = await prisma.productCategory.update({
    where: {
      id,
    },
    data: {
      name: data.name,
    },
  });

  return productCategory;
};

export const deleteProductCategory = async (id: number) => {
  await getProductCategoryById(id);

  await prisma.productCategory.delete({
    where: {
      id,
    },
  });
};
