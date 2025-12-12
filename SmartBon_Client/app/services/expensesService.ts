import { apiClient } from './apiClient';
import { Expense, ExpenseCreateInput, PaymentType } from '../types';

const paymentTypeMap: Record<PaymentType, number> = {
  Cash: 0,
  DebitCard: 1,
  CreditCard: 2,
  Bank_Transfer: 3
};

export async function fetchExpenses(): Promise<Expense[]> {
  const { data } = await apiClient.get<Expense[]>('/api/expenses');
  return data;
}

export async function createExpense(payload: ExpenseCreateInput): Promise<Expense> {
  try {
    const { data } = await apiClient.post<Expense>('/api/expenses', {
      ...payload,
      paymentType: paymentTypeMap[payload.paymentType]
    });
    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data ||
      error?.message ||
      'Failed to create expense';
    throw new Error(message);
  }
}

export async function fetchExpense(id: string): Promise<Expense> {
  const { data } = await apiClient.get<Expense>(`/api/expenses/${id}`);
  return data;
}
