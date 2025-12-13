export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  value?: string;
  token?: string;
};

export type PaymentType = 'Cash' | 'DebitCard' | 'CreditCard' | 'Bank_Transfer';

export type IconType = 'Url' | 'Emoji' | 'FontAwesome';

export type Subcategory = {
  id: number;
  name: string;
  iconType: IconType;
  iconValue: string;
};

export type Category = {
  id: number;
  name: string;
  iconType: IconType;
  iconValue: string;
  subcategories?: Subcategory[];
};

export type AuthContextValue = {
  token: string | null;
  status: AuthStatus;
  processing: boolean;
  authError: string | null;
  signIn: (payload: LoginRequest) => Promise<void>;
  signUp: (payload: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
};

export type CategoriesState = {
  items: Category[];
  loading: boolean;
  error: string | null;
};

export type CategoriesContextValue = CategoriesState & {
  refresh: () => Promise<void>;
};

export type Expense = {
  id: number;
  title: string;
  description?: string;
  cost: number;
  categoryId: number;
  categoryName?: string;
  subcategoryId?: number | null;
  subcategoryName?: string | null;
  expenseDate: string;
  paymentType: PaymentType;
};

export type ExpenseCreateInput = {
  title: string;
  description?: string;
  cost: number;
  categoryId: number;
  subcategoryId?: number | null;
  expenseDate: string;
  paymentType: PaymentType;
};
