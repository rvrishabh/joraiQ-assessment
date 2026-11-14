"use client";

import { useLoginMutation } from "@/api/mutations/auth";
import { OmrSheet } from "@/components/Brand/OmrSheet";
import { Logo } from "@/components/Brand/Logo";
import FormInput from "@/components/Form/FormInput";
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
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div className="text-white">
          <Logo light />
        </div>
        <div className="space-y-10">
          <div className="max-w-md space-y-3">
            <h1 className="text-4xl font-bold leading-[1.05] xl:text-5xl">
              Set the quiz. Let the sheet do the marking.
            </h1>
            <p className="text-lg text-white/65">
              Assign to your class, see who finished, and who is still guessing.
            </p>
          </div>
          <OmrSheet />
        </div>
        <p className="text-sm text-white/45">JoraIQ learning platform</p>
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold">Sign in</h2>
          <p className="mt-1.5 text-ink-soft">Use the account you registered with.</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <FormInput
              label="Email"
              type="email"
              autoComplete="email"
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
              <p role="alert" className="rounded-md bg-redpen-soft px-3 py-2 text-sm text-redpen">
                {formError}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            New here?{" "}
            <Link href="/register" className="font-medium text-ink underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
