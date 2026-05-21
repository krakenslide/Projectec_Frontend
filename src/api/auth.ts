import type { AuthResponse, User } from "../types/auth";
import { apiRequest } from "./client";

export const login = (email: string, password: string) =>
  apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (email: string, password: string) =>
  apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => apiRequest<User>("/auth/me");