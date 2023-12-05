import { Prisma } from "@prisma/client";
import prisma from "../db";
import {
  CreateProductType,
  ManageProductStockType,
  UpdateProductType,
} from "./product.type";

export const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      productCategory: true,
    },
  });

  return products;
};

export const getBestSellingProducts = async (query: { date?: Date }) => {
  const date = query.date ? new Date(query.date) : new Date();
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const whereClause: Prisma.ProductSaleWhereInput = {
    createdAt: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };

  const productSales = await prisma.productSale.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    // filter the date by today. notes: add choices date to filter
    where: whereClause,
    take: 5,
  });

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productSales.map((productSale) => productSale.productId),
      },
    },
  });

  const productsWithTotalQuantitySold = products.map((product) => {
    const productSale = productSales.find(
      (productSale) => productSale.productId === product.id
    );

    return {
      ...product,
      totalQuantitySold: productSale?._sum.quantity || 0,
    };
  });

  productsWithTotalQuantitySold.sort(
    (a, b) => b.totalQuantitySold - a.totalQuantitySold
  );

  return productsWithTotalQuantitySold;
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

export const resetProductsStock = async () => {
  await prisma.product.updateMany({
    data: {
      stock: 0,
    },
  });
};

export const manageProductStock = async (data: ManageProductStockType) => {
  const product = await getProductById(data.id);

  if (data.action === "increase") {
    await prisma.product.update({
      where: {
        id: data.id,
      },
      data: {
        stock: {
          increment: data.quantity,
        },
      },
    });
  } else if (data.action === "decrease") {
    if (product.stock < data.quantity) {
      throw new Error("Not enough stock to decrease");
    }

    await prisma.product.update({
      where: {
        id: data.id,
      },
      data: {
        stock: {
          decrement: data.quantity,
        },
      },
    });
  } else {
    throw new Error("Action not supported");
  }
};
