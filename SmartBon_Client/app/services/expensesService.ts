import { apiClient } from './apiClient';
import { Expense, NewExpenseInput } from '../types';

export async function fetchExpenses(): Promise<Expense[]> {
  const { data } = await apiClient.get<Expense[]>('/api/expenses');
  return data;
}

export async function createExpense(payload: NewExpenseInput): Promise<Expense> {
  const { data } = await apiClient.post<Expense>('/api/expenses', payload);
  return data;
}

export async function fetchExpense(id: string): Promise<Expense> {
  const { data } = await apiClient.get<Expense>(`/api/expenses/${id}`);
  return data;
}
