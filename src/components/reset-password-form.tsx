"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { SHARED_AUTH_CONFIG, shouldUse2FA } from "@/lib/auth/config";
import Script from "next/script";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { requestPasswordReset, resetPassword, error, isLoading } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Form for requesting code
  const requestForm = useForm({
    resolver: zodResolver(requestPasswordResetSchema),
  });

  // Form for resetting password
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Turnstile callback function
  const onTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
  };

  // Send code request
  const onRequestSubmit = async (data: { email: string }) => {
    if (shouldUse2FA() && !turnstileToken) {
      alert("Please complete the security verification.");
      return;
    }

    setEmail(data.email);
    const success = await requestPasswordReset(
      data.email,
      turnstileToken || undefined
    );

    if (success) {
      setRequestSuccess(true);
      setStep("reset");
    }
  };

  // Reset password
  const onResetSubmit = async (data: {
    code: string;
    password: string;
    confirmPassword: string;
  }) => {
    await resetPassword(data.code, data.password, data.confirmPassword);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Title and description */}
      <div className="flex flex-col items-center text-center mb-6">
        <h1 className="text-2xl font-bold">
          {step === "request" ? "Password Recovery" : "Reset Password"}
        </h1>
        <p className="text-balance text-muted-foreground">
          {step === "request"
            ? "Enter your email to receive a recovery code."
            : "Enter the code received by email and set your new password."}
        </p>
      </div>

      {/* Form for requesting code */}
      {step === "request" && (
        <form
          className="flex flex-col gap-6"
          onSubmit={requestForm.handleSubmit(onRequestSubmit)}
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...requestForm.register("email")}
              placeholder="your@email.com"
            />
            {requestForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {requestForm.formState.errors.email.message}
              </p>
            )}
          </div>

          {shouldUse2FA() && (
            <div className="flex justify-center">
              <div
                id="turnstile-widget"
                className="cf-turnstile"
                data-sitekey={SHARED_AUTH_CONFIG.TURNSTILE_SITE_KEY}
                data-callback="onTurnstileVerify"
              ></div>

              <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                async
                defer
              />

              <Script id="turnstile-callback">
                {`
                  window.onTurnstileVerify = function(token) {
                    ${onTurnstileVerify.toString()}(token);
                  }
                `}
              </Script>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Code"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/auth/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </div>
        </form>
      )}

      {/* Form for resetting password */}
      {step === "reset" && (
        <form
          className="flex flex-col gap-6"
          onSubmit={resetForm.handleSubmit(onResetSubmit)}
        >
          <div className="grid gap-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              {...resetForm.register("code")}
              placeholder="123456"
            />
            {resetForm.formState.errors.code && (
              <p className="text-sm text-destructive">
                {resetForm.formState.errors.code.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              {...resetForm.register("password")}
            />
            {resetForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {resetForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...resetForm.register("confirmPassword")}
            />
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/auth/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
