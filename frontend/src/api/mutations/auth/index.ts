import { api } from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import type { LoginFormValues, RegisterFormValues } from "@/schemas";
import { useMutation } from "@tanstack/react-query";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ email, password }: LoginFormValues) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(
        /invalid login/i.test(error.message)
          ? "Email or password is incorrect"
          : error.message,
      );
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await api.post("/auth/register", {
        ...values,
        inviteCode: values.inviteCode || undefined,
      });
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw new Error(error.message);
    },
  });
}
