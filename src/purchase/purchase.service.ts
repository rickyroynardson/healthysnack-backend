import prisma from "../db";
import { CreatePurchaseType } from "./purchase.type";

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
    }

    const purchase = await tx.purchase.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        vendor: data.vendor,
        orderDate: new Date(data.orderDate),
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
