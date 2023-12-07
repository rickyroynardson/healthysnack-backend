import { Prisma } from "@prisma/client";
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

export const getSalesTotal = async (query: { date?: Date }) => {
  const date = query.date ? new Date(query.date) : new Date();
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
  const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));

  const whereClause: Prisma.SaleWhereInput = {
    createdAt: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };

  const yesterdayWhereClause: Prisma.SaleWhereInput = {
    createdAt: {
      gte: yesterdayStart,
      lte: yesterdayEnd,
    },
  };

  const salesTotal = await prisma.sale.aggregate({
    _sum: {
      total: true,
    },
    where: whereClause,
  });

  const yesterdaySalesTotal = await prisma.sale.aggregate({
    _sum: {
      total: true,
    },
    where: yesterdayWhereClause,
  });

  const todayTotal = salesTotal._sum.total ?? 0;
  const yesterdayTotal = yesterdaySalesTotal._sum.total ?? 0;

  return {
    total: todayTotal,
    yesterdayTotal: yesterdayTotal,
    percentageChange: parseFloat(
      (((todayTotal - yesterdayTotal) / yesterdayTotal) * 100).toFixed(2)
    ),
  };
};

export const getSalesProfit = async (query: { date?: Date }) => {
  const date = query.date ? new Date(query.date) : new Date();
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
  const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));

  const whereClause: Prisma.SaleWhereInput = {
    createdAt: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };

  const yesterdayWhereClause: Prisma.SaleWhereInput = {
    createdAt: {
      gte: yesterdayStart,
      lte: yesterdayEnd,
    },
  };

  const todaySales = await prisma.sale.findMany({
    where: whereClause,
    include: {
      ProductSale: {
        include: {
          product: {
            include: {
              ProductMaterial: true,
            },
          },
        },
      },
    },
  });

  const yesterdaySales = await prisma.sale.findMany({
    where: yesterdayWhereClause,
    include: {
      ProductSale: {
        include: {
          product: {
            include: {
              ProductMaterial: true,
            },
          },
        },
      },
    },
  });

  const todaySalesWithCapital = todaySales.map((todaySale) => {
    let totalCapital = 0;

    for (const product of todaySale.ProductSale) {
      const productCapital = product.product.ProductMaterial.reduce(
        (total, material) => total + material.price,
        0
      );
      totalCapital += productCapital * product.quantity;
    }

    return { ...todaySale, totalCapital };
  });

  const yesterdaySalesWithCapital = yesterdaySales.map((yesterdaySale) => {
    let totalCapital = 0;

    for (const product of yesterdaySale.ProductSale) {
      const productCapital = product.product.ProductMaterial.reduce(
        (total, material) => total + material.price,
        0
      );
      totalCapital += productCapital * product.quantity;
    }

    return { ...yesterdaySale, totalCapital };
  });

  const todayProfit = todaySalesWithCapital.reduce(
    (total, sale) => total + sale.total - sale.totalCapital,
    0
  );
  const yesterdayProfit = yesterdaySalesWithCapital.reduce(
    (total, sale) => total + sale.total - sale.totalCapital,
    0
  );

  return {
    todayProfit,
    yesterdayProfit,
    percentageChange: parseFloat(
      (((todayProfit - yesterdayProfit) / yesterdayProfit) * 100).toFixed(2)
    ),
  };
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
        invoiceNumber: `INV-${(Date.now() % 100000)
          .toString()
          .padStart(5, "0")}`,
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
