export interface CreateInventoryType {
  name: string;
  unit: string;
}

export interface UpdateInventoryType {
  name: string;
  stock: number;
  unit: string;
}

export interface ManageInventoryStockType {
  id: number;
  quantity: number;
  memo: string;
  action: "increase" | "decrease";
}
