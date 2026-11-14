import { toast } from "sonner";
import { ApiError } from "./axios";

export function toastApiError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}
