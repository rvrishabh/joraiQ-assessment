import axios from "axios";
import { supabase } from "./supabase";

export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ErrorBody {
  error?: string | string[];
  message?: string | string[];
}

function toMessage(body: ErrorBody | undefined, fallback: string) {
  const detail = body?.error ?? body?.message;
  if (Array.isArray(detail)) return detail.join(". ");
  return detail || fallback;
}

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Success bodies arrive as { success: true, data }. Hand callers the payload.
api.interceptors.response.use(
  (response) => {
    const body = response.data as { success?: boolean; data?: unknown };
    if (body && body.success === true) response.data = body.data;
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(
      new ApiError(
        error.response?.status ?? 0,
        error.response
          ? toMessage(error.response.data, error.message)
          : "Cannot reach the server. Check your connection and try again.",
      ),
    );
  },
);
