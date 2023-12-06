export interface CreateProductType {
  name: string;
  price: number;
  productCategoryId: number;
  materials: {
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }[];
}

export interface UpdateProductType {
  name: string;
  price: number;
  stock: number;
  productCategoryId: number;
  materials: {
    materialId?: number;
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }[];
}

export interface ManageProductStockType {
  id: number;
  quantity: number;
  action: "increase" | "decrease";
}
