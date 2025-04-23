export type Quote = {
  customerName: string;
  projectName: string;
  description?: string;
  products: {
    productDescription: string;
    lengthFeet: number;
    lengthInches: number;
    widthFeet: number;
    widthInches: number;
    price: number;
  }[];
};