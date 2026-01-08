import { Subcategory } from "./subcategory";

export interface Category {
  id: number;
  name: string;
  icon: string;
  colorHex: string;
  subcategories: Subcategory[];
}