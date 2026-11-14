import { api } from "@/lib/axios";
import type { User } from "@/types";

export const meQueryKeys = { all: ["me"] as const };

export async function fetchMe() {
  const { data } = await api.get<User>("/users/me");
  return data;
}
