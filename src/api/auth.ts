import type { AuthResponse, User } from "../types/auth";
import { apiRequest } from "./client";

export const login = (email: string, password: string) =>
  apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (name: string, email: string, password: string) =>
  apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const getMe = () => apiRequest<User>("/auth/me");

export const logout = () => apiRequest<{ message: string }>("/auth/logout", { method: "POST" });
export const verifyEmail = (token: string) => apiRequest<string>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
export const googleLoginUrl = () => "http://127.0.0.1:8000/v1/auth/google/login";
export const googleCallback = () => apiRequest<string>("/auth/google/callback");
