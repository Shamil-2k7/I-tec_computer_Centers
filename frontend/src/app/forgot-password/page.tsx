"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, MailCheck } from "lucide-react";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
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
          {sent ? (
            <div className="text-center py-4">
              <MailCheck className="h-10 w-10 text-success mx-auto mb-3" />
              <h1 className="font-display text-xl font-semibold mb-2">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                If an account exists for that email, we&apos;ve sent a link to reset your password.
              </p>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href="/login">Back to login</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Forgot password?</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

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
                <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground mt-6">
                Remembered it? <Link href="/login" className="text-accent hover:underline">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
