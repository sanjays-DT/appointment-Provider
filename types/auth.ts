// types/auth.ts

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  role: string;
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user(token: string, user: any): unknown;
  account(token: string, account: any): unknown;
  token: string;
  provider: AuthUser;
}
