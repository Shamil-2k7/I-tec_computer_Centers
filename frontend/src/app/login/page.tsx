"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const justRegistered = params.get("registered") === "true";

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      await login(data.email, data.password);
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
          <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Log in to continue your courses.</p>

          {justRegistered && (
            <div className="mb-4 rounded-md bg-success/10 border border-success/30 text-success text-sm px-3 py-2">
              Account created! Please log in.
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don&apos;t have an account? <Link href="/register" className="text-accent hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
