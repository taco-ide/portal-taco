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

  // Formulário para solicitar código
  const requestForm = useForm({
    resolver: zodResolver(requestPasswordResetSchema),
  });

  // Formulário para redefinir senha
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Função de callback para o Turnstile
  const onTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
  };

  // Enviar solicitação de código
  const onRequestSubmit = async (data: { email: string }) => {
    if (shouldUse2FA() && !turnstileToken) {
      alert("Por favor, complete a verificação de segurança.");
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

  // Redefinir senha
  const onResetSubmit = async (data: {
    code: string;
    password: string;
    confirmPassword: string;
  }) => {
    await resetPassword(data.code, data.password, data.confirmPassword);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Título e descrição */}
      <div className="flex flex-col items-center text-center mb-6">
        <h1 className="text-2xl font-bold">
          {step === "request" ? "Recuperação de senha" : "Redefinir senha"}
        </h1>
        <p className="text-balance text-muted-foreground">
          {step === "request"
            ? "Informe seu e-mail para receber um código de recuperação."
            : "Insira o código recebido por e-mail e defina sua nova senha."}
        </p>
      </div>

      {/* Formulário para solicitar código */}
      {step === "request" && (
        <form
          className="flex flex-col gap-6"
          onSubmit={requestForm.handleSubmit(onRequestSubmit)}
        >
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              {...requestForm.register("email")}
              placeholder="seu@email.com"
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
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar código"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/auth/login" className="underline underline-offset-4">
              Voltar para o login
            </Link>
          </div>
        </form>
      )}

      {/* Formulário para redefinir senha */}
      {step === "reset" && (
        <form
          className="flex flex-col gap-6"
          onSubmit={resetForm.handleSubmit(onResetSubmit)}
        >
          <div className="grid gap-2">
            <Label htmlFor="code">Código de verificação</Label>
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
            <Label htmlFor="password">Nova senha</Label>
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
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
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
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Redefinindo..." : "Redefinir senha"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/auth/login" className="underline underline-offset-4">
              Voltar para o login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
