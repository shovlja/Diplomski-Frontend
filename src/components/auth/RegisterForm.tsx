import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { FieldErrors, FieldError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAuthActions } from "@/hooks/useAuthActions";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Span } from "@/components/ui/Span";

/* ===== Schema ===== */
const schema = z
  .object({
    display_name: z.string().min(2, "Username is too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Please confirm your password"),
    terms: z.boolean().refine(Boolean, { message: "You must accept the terms" }),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

type JsonLike = Record<string, unknown>;
const isObj = (v: unknown): v is JsonLike => typeof v === "object" && v !== null;

function getErrMessage(err: unknown): string {
  if (isObj(err)) {
    const resp = isObj(err["response"]) ? (err["response"] as JsonLike) : undefined;
    const data = resp && isObj(resp["data"]) ? (resp["data"] as JsonLike) : undefined;

    const detail = data?.["detail"];
    if (typeof detail === "string" && detail.trim()) return detail;

    const message = err["message"];
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Something went wrong. Please try again.";
}

/** First validation message out of nested FieldErrors (RHF) */
function firstErrorMessage(errors: FieldErrors): string | undefined {
  for (const value of Object.values(errors)) {
    if (!value) continue;
    const fe = value as FieldError | undefined;
    if (fe?.message) return String(fe.message);
    if (typeof value === "object" && value !== null) {
      const nested = firstErrorMessage(value as FieldErrors);
      if (nested) return nested;
    }
  }
  return undefined;
}

export function RegisterForm() {
  const { doRegister, loading, error } = useAuthActions();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
    mode: "onSubmit",
  });

  const busy = isSubmitting || loading === "register";

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await doRegister({
        display_name: values.display_name.trim(),
        email: values.email,
        password: values.password,
      });

      // Lep, čitljiv log (samo u dev okruženju)
      if (import.meta.env.DEV) {
        console.groupCollapsed("%c[REGISTER SUCCESS]", "color:#0EA5E9;font-weight:700");
        if (result && typeof result === "object") {
          console.table(result as Record<string, unknown>);
          console.log("Raw:", JSON.stringify(result, null, 2));
        } else {
          console.log(
            "Registration succeeded. Your hook didn't return a user object. " +
              "If želiš log, vrati UserOut iz doRegister."
          );
        }
        console.groupEnd();
      }

      toast.success("Account created! Redirecting to sign in…");
      await new Promise((r) => setTimeout(r, 60));
      window.location.href = "/login";
    } catch (err) {
      toast.error(getErrMessage(err));
    }
  };

  const onInvalid = (errs: FieldErrors) => {
    const msg = firstErrorMessage(errs) ?? "Please fix the highlighted fields.";
    toast.error(msg);
  };

  return (
    <div className="relative z-10 flex min-h-screen w-full items-center justify-end">
      <div className="w-full max-w-lg px-4 md:px-8">
        <div className="rounded-xl border border-white/20 bg-white/20 backdrop-blur-sm shadow-lg shadow-black/10">
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-semibold text-slate-900">Create account</h2>
            <p className="text-slate-600 mt-1">It’s free and only takes a minute</p>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-8 space-y-4" noValidate>
              {/* Username */}
              <div className="space-y-1">
                <Label htmlFor="display_name">Username</Label>
                <Input
                  id="display_name"
                  placeholder="Your username"
                  variant="default"
                  invalid={!!errors.display_name}
                  aria-invalid={!!errors.display_name}
                  className="h-12 rounded-md !bg-white/75 backdrop-blur-[1px] placeholder:text-slate-500/90"
                  {...register("display_name")}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  variant="default"
                  invalid={!!errors.email}
                  aria-invalid={!!errors.email}
                  className="h-12 rounded-md !bg-white/75 backdrop-blur-[1px] placeholder:text-slate-500/90"
                  {...register("email")}
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Password"
                  variant="default"
                  invalid={!!errors.password}
                  aria-invalid={!!errors.password}
                  className="h-12 rounded-md !bg-white/75 backdrop-blur-[1px]"
                  {...register("password")}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Confirm Password"
                  variant="default"
                  invalid={!!errors.confirm_password}
                  aria-invalid={!!errors.confirm_password}
                  className="h-12 rounded-md !bg-white/75 backdrop-blur-[1px] placeholder:text-slate-500/90"
                  {...register("confirm_password")}
                />
              </div>

              {/* Terms */}
              <Label className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  className="mt-[3px] h-4 w-4 rounded border-slate-300
                             text-[color:var(--accent-on-dark,#0EA5E9)]
                             focus:ring-[rgba(14,165,233,0.28)]"
                  {...register("terms")}
                />
                <Span tone="muted" className="text-sm text-slate-800">
                  I accept the{" "}
                  <a className="text-[color:var(--accent-on-dark,#0EA5E9)] underline">Terms of Use</a>{" "}
                  &{" "}
                  <a className="text-[color:var(--accent-on-dark,#0EA5E9)] underline">Privacy Policy</a>
                </Span>
              </Label>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="h-12 rounded-md shadow-md shadow-[rgba(14,165,233,0.25)] hover:shadow-[rgba(14,165,233,0.35)]"
                loading={busy}
                aria-busy={busy}
                disabled={busy}
              >
                Create account
              </Button>

              <Span tone="muted" className="text-sm text-slate-800">
                Already have an account?{" "}
                <a className="text-[color:var(--accent-on-dark,#0EA5E9)] underline font-medium" href="/login">
                  Sign in
                </a>
              </Span>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
