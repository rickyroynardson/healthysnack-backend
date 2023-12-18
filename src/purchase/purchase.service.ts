import { Prisma } from "@prisma/client";
import prisma from "../db";
import { CreatePurchaseType } from "./purchase.type";

export const getPurchases = async (query: {
  limit?: number;
  page?: number;
}) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const offset = (page - 1) * limit;

  const whereClause: Prisma.PurchaseWhereInput = {};

  const purchases = await prisma.purchase.findMany({
    include: {
      InventoryPurchase: {
        include: {
          inventory: true,
        },
      },
    },
    orderBy: {
      orderDate: "desc",
    },
    where: whereClause,
    take: limit,
    skip: offset,
  });
  const purchasesCount = await prisma.purchase.count({
    where: whereClause,
  });

  return {
    data: purchases,
    meta: {
      page,
      total: purchasesCount,
      perPage: limit,
      hasNext: purchasesCount - page * limit > 0,
    },
  };
};

export const createPurchase = async (data: CreatePurchaseType) => {
  return prisma.$transaction(async (tx) => {
    let total = 0;

    for (let inventory of data.inventories) {
      const inventoryStock = await tx.inventory.findUnique({
        where: {
          id: inventory.inventoryId,
        },
      });

      if (!inventoryStock) {
        throw new Error("Inventory not found");
      }

      total += inventory.price * inventory.quantity;

      await tx.inventory.update({
        where: {
          id: inventory.inventoryId,
        },
        data: {
          stock: {
            increment: inventory.quantity,
          },
        },
      });
      await tx.inventoryLog.create({
        data: {
          description: `Inventory ${inventoryStock.name} stock increased by ${inventory.quantity} ${inventoryStock.unit} due to purchase #${data.invoiceNumber}`,
          memo: data.memo,
          type: "PURCHASE",
        },
      });
    }

    const purchase = await tx.purchase.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        vendor: data.vendor,
        orderDate: new Date(data.orderDate),
        total,
        memo: data.memo,
        InventoryPurchase: {
          createMany: {
            data: data.inventories.map((inventory) => ({
              inventoryId: inventory.inventoryId,
              quantity: inventory.quantity,
              price: inventory.price,
            })),
          },
        },
      },
    });

    return purchase;
  });
};
