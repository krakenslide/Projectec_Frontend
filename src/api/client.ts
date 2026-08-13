import { useAuthErrorStore } from "../store/authErrorStore";

const BASE_URL = "http://127.0.0.1:8000/v1";
export { BASE_URL };
export const getApiRoot = () => fetch("http://127.0.0.1:8000/").then(response => response.json() as Promise<{ status: string }>);

export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T | null;
}

export function responseData<T>(response: ApiResponse<T>): T {
  if (!response.success) throw new Error(response.message || "The request was not successful");
  if (response.data === null) throw new Error(response.message || "The server returned no data");
  return response.data;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Surface a full-page notice instead of a silent failure: a 401 here
    // most often means the account's email hasn't been verified yet
    // (or the session has expired), so let the UI explain that rather
    // than just showing a generic "request failed" error.
    useAuthErrorStore.getState().trigger(path);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    // FastAPI returns { detail: "..." } for HTTPException
    const message =
      typeof error.detail === "string"
        ? error.detail
        : Array.isArray(error.detail)
          ? error.detail.map((d: { msg: string }) => d.msg).join(", ")
          : "Something went wrong";
    throw new Error(message);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// Fetches a binary/file response (e.g. Excel exports) instead of JSON.
export async function apiBlobRequest(
  path: string,
  options: RequestInit = {}
): Promise<{ blob: Blob; filename: string | null }> {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    useAuthErrorStore.getState().trigger(path);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const message =
      typeof error.detail === "string"
        ? error.detail
        : Array.isArray(error.detail)
          ? error.detail.map((d: { msg: string }) => d.msg).join(", ")
          : "Something went wrong";
    throw new Error(message);
  }

  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return { blob: await res.blob(), filename: match?.[1] ?? null };
}

// Use this in every catch block instead of err: any
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
