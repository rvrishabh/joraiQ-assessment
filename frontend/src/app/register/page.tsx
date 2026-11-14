"use client";

import { useRegisterMutation } from "@/api/mutations/auth";
import FormInput from "@/components/Form/FormInput";
import { AuthLayout } from "@/components/Layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { registerFormSchema, type RegisterFormValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useHomeRedirect } from "@/hooks/useGuards";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

const ROLES = [
  { value: "STUDENT", title: "Student", body: "Take the quizzes your teacher assigns" },
  { value: "TEACHER", title: "Teacher", body: "Write quizzes and track results" },
] as const;

/** Student: a pencil-filled bubble. Teacher: a red-pen tick. */
function RoleGlyph({ role, active }: { role: "STUDENT" | "TEACHER"; active: boolean }) {
  if (role === "STUDENT") {
    return (
      <span className="relative grid size-10 place-items-center rounded-full border-2 border-ink/40">
        <span
          className={cn(
            "absolute inset-[3px] rounded-full bg-ink transition-transform duration-300 ease-[cubic-bezier(.34,1.8,.64,1)]",
            active ? "scale-100" : "scale-0",
          )}
        />
      </span>
    );
  }
  return (
    <span className="grid size-10 place-items-center rounded-full border-2 border-ink/40">
      <svg viewBox="0 0 40 40" className="size-7 text-redpen" fill="none" aria-hidden>
        <path
          d="M8 21 L16 29 L33 10"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="40"
          className="transition-[stroke-dashoffset] duration-500 ease-out"
          style={{ strokeDashoffset: active ? 0 : 40 }}
        />
      </svg>
    </span>
  );
}

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
    <AuthLayout>
      <h2 data-reveal className="text-4xl font-extrabold">
        Create your account
      </h2>
      <p data-reveal className="mt-2 text-ink-soft">
        Your role decides what you see after signing in.
      </p>

      <form
        data-reveal
        onSubmit={form.handleSubmit(onSubmit)}
        className="sheet mt-8 space-y-4 rounded-2xl p-6 sm:p-7"
        noValidate
      >
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="mb-1.5 text-sm font-semibold">I am a</legend>
          {ROLES.map((r) => {
            const active = role === r.value;
            return (
              <label
                key={r.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-3.5 transition-all duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink-2",
                  active
                    ? "-translate-y-0.5 border-ink bg-pencil-soft shadow-[0_4px_0_0_var(--color-ink)]"
                    : "border-line hover:border-ink/35",
                )}
              >
                <input type="radio" value={r.value} className="sr-only" {...form.register("role")} />
                <RoleGlyph role={r.value} active={active} />
                <span>
                  <span className="block font-display text-lg font-bold leading-tight">{r.title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{r.body}</span>
                </span>
              </label>
            );
          })}
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
          placeholder="you@school.edu"
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
          <div className="animate-rise">
            <FormInput
              label="Teacher invite code"
              hint="Needed only if your school set one up"
              error={form.formState.errors.inviteCode?.message}
              {...form.register("inviteCode")}
            />
          </div>
        )}

        {formError && (
          <p role="alert" className="animate-rise rounded-lg border border-redpen/20 bg-redpen-soft px-3 py-2 text-sm text-redpen">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-2 w-full" loading={register.isPending}>
          Create account
        </Button>
      </form>

      <p data-reveal className="mt-6 text-center text-sm text-ink-soft">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-ink underline decoration-pencil decoration-[3px] underline-offset-4 hover:decoration-ink">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
