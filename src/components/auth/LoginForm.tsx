import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { FieldErrors, FieldError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

import { useAuthActions } from "@/hooks/useAuthActions";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Span } from "@/components/ui/Span";

/* ===== Schema ===== */
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

/** Get the first validation message from RHF FieldErrors (handles nested) */
function firstErrorMessage(errors: FieldErrors): string | undefined {
  for (const value of Object.values(errors)) {
    if (!value) continue;
    const fe = value as FieldError | undefined;
    if (fe && fe.message) return String(fe.message);
    if (typeof value === "object" && value !== null) {
      const nested = firstErrorMessage(value as FieldErrors);
      if (nested) return nested;
    }
  }
  return undefined;
}

export function LoginForm() {
  const navigate = useNavigate();
  const { doLogin, loading, error } = useAuthActions();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  const busy = isSubmitting || loading === "login";

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onSubmit = async (values: FormValues) => {
    try {
      await doLogin(values.email, values.password);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed";
      toast.error(msg);
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
            <h2 className="text-3xl font-semibold text-slate-900">Sign in</h2>
            <p className="text-slate-600 mt-1">Access your PMHub workspace</p>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-8 space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
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
                  placeholder="Your password"
                  variant="default"
                  invalid={!!errors.password}
                  aria-invalid={!!errors.password}
                  className="h-12 rounded-md !bg-white/75 backdrop-blur-[1px]"
                  {...register("password")}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="h-12 rounded-md shadow-md shadow-[rgba(14,165,233,0.25)] hover:shadow-[rgba(14,165,233,0.35)]"
                loading={busy}
                aria-busy={busy}
              >
                Sign in
              </Button>

              <Span tone="muted" className="text-sm text-slate-800">
                New here?{" "}
                <Link
                  to="/register"
                  className="text-[color:var(--accent-on-dark,#0EA5E9)] underline font-medium"
                >
                  Create account
                </Link>
              </Span>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
