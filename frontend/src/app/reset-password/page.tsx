"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, token, password: data.password });
      router.push("/login?reset=true");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 font-display text-xl font-semibold mb-8">
          <GraduationCap className="h-6 w-6 text-accent" /> AKM LMS
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold mb-1">Set a new password</h1>
          <p className="text-sm text-muted-foreground mb-6">Choose a new password for {email || "your account"}.</p>

          {!token && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">
              This reset link is missing or invalid. Please request a new one.
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={loading || !token}>
              {loading ? "Resetting..." : "Reset password"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            <Link href="/login" className="text-accent hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
