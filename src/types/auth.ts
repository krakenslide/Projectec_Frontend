export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
}