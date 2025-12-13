import { apiClient } from './apiClient';
import { Category, IconType, Subcategory } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/api/categories');
  return data;
}

export async function createCategory(input: {
  name: string;
  iconType: IconType;
  iconValue: string;
}): Promise<Category> {
  const { data } = await apiClient.post<Category>('/api/categories', input);
  return data;
}

export async function createSubcategory(
  categoryId: number,
  input: { name: string; iconType: IconType; iconValue: string }
): Promise<Subcategory> {
  const { data } = await apiClient.post<Subcategory>(
    `/api/categories/${categoryId}/subcategories`,
    input
  );
  return data;
}
