export interface CreatePurchaseType {
  invoiceNumber: string;
  vendor: string;
  orderDate: string;
  memo: string;
  inventories: {
    inventoryId: number;
    quantity: number;
    price: number;
  }[];
}
