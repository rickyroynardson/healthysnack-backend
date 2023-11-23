export interface CreateProductType {
  name: string;
  price: number;
  productCategoryId: number;
}

export interface UpdateProductType {
  name: string;
  price: number;
  stock: number;
  productCategoryId: number;
}
