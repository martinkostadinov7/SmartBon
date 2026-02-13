export interface Budget {
  id: number;
  name: string;
  description: string;
  from: Date;
  to: Date;
  maxAmount: number;
  currentAmount: number;
  icon: string;
  colorHex: string;
  categoryIds: Number[];
  subcategoryIds: Number[];
}