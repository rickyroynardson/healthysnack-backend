import { Prisma } from "@prisma/client";
import prisma from "../db";
import {
  CreateInventoryType,
  ManageInventoryStockType,
  UpdateInventoryType,
} from "./inventory.type";

export const getInventories = async (query: {
  limit?: number;
  page?: number;
  name?: string;
}) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const offset = (page - 1) * limit;

  const whereClause: Prisma.InventoryWhereInput = {};

  if (query.name) {
    whereClause.name = {
      contains: query.name,
    };
  }

  const inventories = await prisma.inventory.findMany({
    where: whereClause,
    take: limit,
    skip: offset,
  });
  const inventoriesCount = await prisma.inventory.count({
    where: whereClause,
  });

  return {
    data: inventories,
    meta: {
      page,
      total: inventoriesCount,
      perPage: limit,
      hasNext: inventoriesCount - page * limit > 0,
    },
  };
};

export const getAllInventories = async () => {
  const inventories = await prisma.inventory.findMany();

  return inventories;
};

export const getInventoryById = async (id: number) => {
  const inventory = await prisma.inventory.findUnique({
    where: {
      id,
    },
  });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  return inventory;
};

export const getInventoryLogs = async () => {
  const inventoryLogs = await prisma.inventoryLog.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return inventoryLogs;
};

export const createInventory = async (data: CreateInventoryType) => {
  const inventory = await prisma.inventory.create({
    data: {
      name: data.name,
      unit: data.unit,
    },
  });

  return inventory;
};

export const updateInventory = async (
  id: number,
  data: UpdateInventoryType
) => {
  const oldInventory = await getInventoryById(id);

  const inventory = await prisma.inventory.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      stock: data.stock,
      unit: data.unit,
    },
  });
  if (oldInventory.stock !== data.stock) {
    await prisma.inventoryLog.create({
      data: {
        description: `Inventory ${inventory.name} stock update from ${oldInventory.stock} to ${inventory.stock}`,
        type: "UPDATE",
      },
    });
  }

  return inventory;
};

export const manageInventoryStock = async (data: ManageInventoryStockType) => {
  const inventory = await getInventoryById(data.id);

  if (data.action === "increase") {
    await prisma.inventory.update({
      where: {
        id: data.id,
      },
      data: {
        stock: {
          increment: data.quantity,
        },
      },
    });
    await prisma.inventoryLog.create({
      data: {
        description: `Inventory ${inventory.name} stock increase by ${data.quantity}`,
        memo: data.memo,
        type: "INCREASE",
      },
    });
  } else if (data.action === "decrease") {
    if (inventory.stock < data.quantity) {
      throw new Error("Not enough stock to decrease");
    }

    await prisma.inventory.update({
      where: {
        id: data.id,
      },
      data: {
        stock: {
          decrement: data.quantity,
        },
      },
    });
    await prisma.inventoryLog.create({
      data: {
        description: `Inventory ${inventory.name} stock decrease by ${data.quantity}`,
        memo: data.memo,
        type: "DECREASE",
      },
    });
  } else {
    throw new Error("Action not supported");
  }
};

export const deleteInventory = async (id: number) => {
  await getInventoryById(id);

  await prisma.inventory.delete({
    where: {
      id,
    },
  });
};
