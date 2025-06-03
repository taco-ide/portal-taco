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
import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Adicionar declaração de tipo para a função onTurnstileVerify no objeto Window
declare global {
  interface Window {
    onTurnstileVerify: (token: string) => void;
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: string;
          "refresh-expired"?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | null;
    };
  }
}

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { requestPasswordReset, resetPassword, error, isLoading } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [, setEmail] = useState("");
  const [, setRequestSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const renderTurnstile = useCallback(() => {
    if (
      !SHARED_AUTH_CONFIG.TURNSTILE_SITE_KEY ||
      !isMounted ||
      !turnstileContainerRef.current ||
      !window.turnstile
    ) {
      return;
    }

    // Limpar widget anterior se existir
    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
      turnstileWidgetId.current = null;
    }

    // Remover conteúdo anterior
    if (turnstileContainerRef.current) {
      turnstileContainerRef.current.innerHTML = "";
    }

    // Definir a função de callback globalmente antes de renderizar o widget
    window.onTurnstileVerify = (token: string) => {
      console.log("Turnstile token received:", token.substring(0, 10) + "...");
      setTurnstileToken(token);
    };

    setTimeout(() => {
      if (window.turnstile && turnstileContainerRef.current) {
        turnstileWidgetId.current = window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: SHARED_AUTH_CONFIG.TURNSTILE_SITE_KEY,
            callback: "onTurnstileVerify",
            "refresh-expired": "auto",
          }
        );
        console.log(
          "Turnstile widget rendered with ID:",
          turnstileWidgetId.current
        );
      }
    }, 100);
  }, [isMounted]);

  // Função para carregar o script Turnstile
  const loadTurnstileScript = useCallback(() => {
    // Verificar se o script já existe
    const existingScript = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Turnstile script loaded");
        // Esperar que a API do Turnstile esteja disponível
        const checkTurnstileReady = () => {
          if (window.turnstile) {
            console.log("Turnstile API is ready");
            renderTurnstile();
          } else {
            console.log("Waiting for Turnstile API...");
            setTimeout(checkTurnstileReady, 100);
          }
        };
        checkTurnstileReady();
      };
      document.body.appendChild(script);
    } else {
      // Se o script já existe, ainda precisamos verificar se a API está pronta
      const checkTurnstileReady = () => {
        if (window.turnstile) {
          console.log("Turnstile API is ready (existing script)");
          renderTurnstile();
        } else {
          console.log("Waiting for Turnstile API (existing script)...");
          setTimeout(checkTurnstileReady, 100);
        }
      };
      checkTurnstileReady();
    }
  }, [renderTurnstile]);

  // Garantir que o componente só renderize o Turnstile no cliente
  useEffect(() => {
    console.log("Reset password form mounted");
    setIsMounted(true);

    // Carregar o script após um pequeno atraso para garantir que o DOM esteja pronto
    if (SHARED_AUTH_CONFIG.TURNSTILE_SITE_KEY) {
      console.log("Turnstile site key is present, loading Turnstile script...");
      setTimeout(() => {
        loadTurnstileScript();
      }, 200);
    }

    return () => {
      // Limpar widget quando o componente desmontar
      if (turnstileWidgetId.current && window.turnstile) {
        console.log("Cleaning up Turnstile widget");
        window.turnstile.reset(turnstileWidgetId.current);
      }
    };
  }, [loadTurnstileScript]);

  // Form for requesting code
  const requestForm = useForm({
    resolver: zodResolver(requestPasswordResetSchema),
  });

  // Form for resetting password
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Send code request
  const onRequestSubmit = async (data: { email: string }) => {
    // Verificar e registrar o estado do token antes da validação
    console.log(
      "Form submission - Turnstile token status:",
      turnstileToken ? "Present" : "Missing"
    );

    if (SHARED_AUTH_CONFIG.TURNSTILE_SITE_KEY && !turnstileToken) {
      // Tentar recuperar o token novamente do Turnstile se estiver disponível
      try {
        if (window.turnstile && turnstileWidgetId.current) {
          const response = window.turnstile.getResponse(
            turnstileWidgetId.current
          );
          if (response) {
            console.log(
              "Retrieved token on submit:",
              response.substring(0, 10) + "..."
            );
            setEmail(data.email);
            const success = await requestPasswordReset(data.email, response);

            if (success) {
              setRequestSuccess(true);
              setStep("reset");
            }
            return;
          }
        }
      } catch (e) {
        console.error("Error retrieving Turnstile token:", e);
      }

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

          {isMounted && SHARED_AUTH_CONFIG.TURNSTILE_SITE_KEY && (
            <div className="flex justify-center">
              <div ref={turnstileContainerRef} id="turnstile-widget"></div>
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
