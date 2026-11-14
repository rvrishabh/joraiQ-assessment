"use client";

import { useRegisterMutation } from "@/api/mutations/auth";
import { Logo } from "@/components/Brand/Logo";
import FormInput from "@/components/Form/FormInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { registerFormSchema, type RegisterFormValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useHomeRedirect } from "@/hooks/useGuards";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

const ROLES = [
  { value: "STUDENT", title: "Student", body: "Take quizzes your teacher assigns" },
  { value: "TEACHER", title: "Teacher", body: "Create quizzes and track results" },
] as const;

export default function RegisterPage() {
  useHomeRedirect();
  const register = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { fullName: "", email: "", password: "", role: "STUDENT", inviteCode: "" },
  });
  const role = useWatch({ control: form.control, name: "role" });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      await register.mutateAsync(values);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create the account");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-8">
        <Logo />
        <h1 className="mt-8 text-3xl font-bold">Create your account</h1>
        <p className="mt-1.5 text-ink-soft">Pick a role first. It decides what you see after signing in.</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="sr-only">Role</legend>
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={cn(
                  "cursor-pointer rounded-lg border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink",
                  role === r.value ? "border-ink bg-pencil/20" : "border-line hover:border-ink/40",
                )}
              >
                <input type="radio" value={r.value} className="sr-only" {...form.register("role")} />
                <span className="block font-display font-semibold">{r.title}</span>
                <span className="block text-xs text-ink-soft">{r.body}</span>
              </label>
            ))}
          </fieldset>

          <FormInput
            label="Full name"
            autoComplete="name"
            error={form.formState.errors.fullName?.message}
            {...form.register("fullName")}
          />
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
            autoComplete="new-password"
            hint="At least 8 characters"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          {role === "TEACHER" && (
            <FormInput
              label="Teacher invite code"
              hint="Needed only if your school set one up"
              error={form.formState.errors.inviteCode?.message}
              {...form.register("inviteCode")}
            />
          )}

          {formError && (
            <p role="alert" className="rounded-md bg-redpen-soft px-3 py-2 text-sm text-redpen">
              {formError}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={register.isPending}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
