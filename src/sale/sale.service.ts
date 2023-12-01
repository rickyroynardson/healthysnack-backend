import prisma from "../db";
import { CreateSaleType } from "./sale.type";

export const getSales = async () => {
  const sales = await prisma.sale.findMany({
    include: {
      ProductSale: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return sales;
};

export const createSale = async (data: CreateSaleType) => {
  return prisma.$transaction(async (tx) => {
    let total = 0;

    for (let product of data.products) {
      const productStock = await prisma.product.findUnique({
        where: {
          id: product.productId,
        },
      });

      if (!productStock) {
        throw new Error("Product not found");
      }

      if (productStock.stock < product.quantity) {
        throw new Error("Product out of stock");
      }

      total += productStock.price * product.quantity;

      await tx.product.update({
        where: {
          id: product.productId,
        },
        data: {
          stock: {
            decrement: product.quantity,
          },
        },
      });
    }

    const sale = await tx.sale.create({
      data: {
        total,
        ProductSale: {
          createMany: {
            data: data.products.map((product) => ({
              productId: product.productId,
              quantity: product.quantity,
            })),
          },
        },
      },
    });

    return sale;
  });
};
