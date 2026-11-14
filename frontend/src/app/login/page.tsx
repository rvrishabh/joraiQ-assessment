"use client";

import { useLoginMutation } from "@/api/mutations/auth";
import FormInput from "@/components/Form/FormInput";
import { AuthLayout } from "@/components/Layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { loginFormSchema, type LoginFormValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useHomeRedirect } from "@/hooks/useGuards";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  useHomeRedirect();
  const login = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login.mutateAsync(values);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not sign in");
    }
  };

  return (
    <AuthLayout>
      <h2 data-reveal className="text-4xl font-extrabold">
        Welcome back
      </h2>
      <p data-reveal className="mt-2 text-ink-soft">
        Sign in with the email you registered with.
      </p>

      <form
        data-reveal
        onSubmit={form.handleSubmit(onSubmit)}
        className="sheet mt-8 space-y-4 rounded-2xl p-6 sm:p-7"
        noValidate
      >
        <FormInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@school.edu"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <FormInput
          label="Password"
          type="password"
          autoComplete="current-password"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        {formError && (
          <p role="alert" className="animate-rise rounded-lg border border-redpen/20 bg-redpen-soft px-3 py-2 text-sm text-redpen">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-2 w-full" loading={login.isPending}>
          Sign in
        </Button>
      </form>

      <p data-reveal className="mt-6 text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/register" className="font-semibold text-ink underline decoration-pencil decoration-[3px] underline-offset-4 hover:decoration-ink">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
