export interface Expense {
  id: number;
  title: string;
  description: string;
  cost: number;
  categoryId: number;
  subcategoryId: number;
  expenseDate: Date;
}