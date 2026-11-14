import type { User } from "@/types";
import { atom } from "jotai";

export type AuthState =
  | { status: "loading"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: User };

export const authAtom = atom<AuthState>({ status: "loading", user: null });
