import { Prisma } from "@prisma/client";
import prisma from "../db";
import {
  CreateProductType,
  ManageProductStockType,
  UpdateProductType,
} from "./product.type";

export const getProducts = async (query: {
  limit?: number;
  page?: number;
  name?: string;
}) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const offset = (page - 1) * limit;

  const whereClause: Prisma.ProductWhereInput = {};

  if (query.name) {
    whereClause.name = {
      contains: query.name,
    };
  }

  const products = await prisma.product.findMany({
    include: {
      productCategory: true,
      ProductMaterial: {
        select: {
          id: true,
          name: true,
          quantity: true,
          unit: true,
          price: true,
        },
      },
    },
    where: whereClause,
    take: limit,
    skip: offset,
  });
  const productsCount = await prisma.product.count({
    where: whereClause,
  });

  return {
    data: products.map((product) => ({
      ...product,
      capital: product.ProductMaterial.reduce(
        (total, material) => total + material.price,
        0
      ),
    })),
    meta: {
      page,
      total: productsCount,
      perPage: limit,
      hasNext: productsCount - page * limit > 0,
    },
  };
};

export const getAllProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      productCategory: true,
      ProductMaterial: {
        select: {
          id: true,
          name: true,
          quantity: true,
          unit: true,
          price: true,
        },
      },
    },
  });

  return products.map((product) => ({
    ...product,
    capital: product.ProductMaterial.reduce(
      (total, material) => total + material.price,
      0
    ),
  }));
};

export const getProductLogs = async () => {
  const productLogs = await prisma.productLog.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return productLogs;
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
      ProductMaterial: {
        createMany: {
          data: data.materials.map((material) => ({
            name: material.name,
            quantity: material.quantity,
            unit: material.unit,
            price: material.price,
          })),
        },
      },
    },
  });

  return product;
};

export const updateProduct = async (id: number, data: UpdateProductType) => {
  const oldProduct = await getProductById(id);

  return prisma.$transaction(async (tx) => {
    const materialsToCreate = data.materials.filter(
      (material) => !material.materialId
    );
    const materialsToUpdate = data.materials.filter(
      (material) => material.materialId
    );

    const product = await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock,
        productCategoryId: data.productCategoryId,
        ProductMaterial: {
          deleteMany: {
            id: {
              notIn: data.materials
                .map((material) => material.materialId)
                .filter((id): id is number => id !== undefined),
            },
          },
          createMany: {
            data: materialsToCreate.map((material) => ({
              name: material.name,
              quantity: material.quantity,
              unit: material.unit,
              price: material.price,
            })),
          },
          updateMany: materialsToUpdate.map((material) => ({
            where: {
              id: material.materialId,
            },
            data: {
              name: material.name,
              quantity: material.quantity,
              unit: material.unit,
              price: material.price,
            },
          })),
        },
      },
    });
    if (oldProduct.stock !== data.stock) {
      await tx.productLog.create({
        data: {
          description: `Product ${product.name} stock update from ${oldProduct.stock} to ${product.stock}`,
          type: "UPDATE",
        },
      });
    }

    return product;
  });
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
  await prisma.productLog.create({
    data: {
      description: "All product stock reset to 0",
      type: "RESET",
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
    await prisma.productLog.create({
      data: {
        description: `Product ${product.name} stock increase by ${data.quantity}`,
        type: "INCREASE",
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
    await prisma.productLog.create({
      data: {
        description: `Product ${product.name} stock decrease by ${data.quantity}`,
        type: "DECREASE",
      },
    });
  } else {
    throw new Error("Action not supported");
  }
};
