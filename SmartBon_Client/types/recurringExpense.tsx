import { Expense } from "./expense";

export interface RecurringExpense {
  id: number;
  title: string;
  description: string;
  cost: number;
  categoryId: number;
  subcategoryId: number;
  expenseDate: Date;
  paymentType: number;
  currency: number;
  frequency: number;
  startDate: Date;
  nextExecutionDate: Date;
  expenses: Expense[];
}