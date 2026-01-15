export interface User {
  id: number;
  name: string;
  email: string;
  role: 'clerk' | 'manager' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends User {}
