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

export type AuthContextValue = {
  token: string | null;
  status: AuthStatus;
  processing: boolean;
  authError: string | null;
  signIn: (payload: LoginRequest) => Promise<void>;
  signUp: (payload: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
};

export type NewExpenseInput = Omit<Expense, 'id'>;
