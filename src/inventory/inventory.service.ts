import { Prisma } from "@prisma/client";
import prisma from "../db";
import { CreateInventoryType, UpdateInventoryType } from "./inventory.type";

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
  await getInventoryById(id);

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

  return inventory;
};

export const deleteInventory = async (id: number) => {
  await getInventoryById(id);

  await prisma.inventory.delete({
    where: {
      id,
    },
  });
};
