const BASE_URL = "http://127.0.0.1:8000/v1";
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

// Use this in every catch block instead of err: any
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
