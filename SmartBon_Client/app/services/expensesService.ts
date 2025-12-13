import { apiClient } from './apiClient';
import { Expense, ExpenseCreateInput, PaymentType } from '../types';

const paymentTypeToApi: Record<PaymentType, number> = {
  Cash: 0,
  DebitCard: 1,
  CreditCard: 2,
  Bank_Transfer: 3
};

const paymentTypeFromApi: Record<number, PaymentType> = {
  0: 'Cash',
  1: 'DebitCard',
  2: 'CreditCard',
  3: 'Bank_Transfer'
};

const normalizeExpense = (raw: any): Expense => ({
  ...raw,
  paymentType:
    typeof raw?.paymentType === 'number'
      ? paymentTypeFromApi[raw.paymentType] ?? 'Cash'
      : raw?.paymentType ?? 'Cash',
  expenseDate: raw?.expenseDate || raw?.date || raw?.createdAt || new Date().toISOString()
});

export async function fetchExpenses(): Promise<Expense[]> {
  const { data } = await apiClient.get<Expense[]>('/api/expenses');
  return data.map(normalizeExpense);
}

export async function fetchRecentExpenses(count = 15): Promise<Expense[]> {
  const { data } = await apiClient.get<Expense[]>(`/api/expenses/recent/${count}`);
  return data.map(normalizeExpense);
}

export async function createExpense(payload: ExpenseCreateInput): Promise<Expense> {
  try {
    const { data } = await apiClient.post<Expense>('/api/expenses', {
      ...payload,
      paymentType: paymentTypeToApi[payload.paymentType]
    });
    return normalizeExpense(data);
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

export async function fetchExpense(id: number): Promise<Expense> {
  const { data } = await apiClient.get<Expense>(`/api/expenses/${id}`);
  return normalizeExpense(data);
}
