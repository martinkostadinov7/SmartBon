import { apiClient } from './apiClient';
import { Category } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/api/categories');
  return data;
}
