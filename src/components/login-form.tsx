"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/lib/auth/schemas";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  SHARED_AUTH_CONFIG,
  shouldUse2FA,
  isProduction,
} from "@/lib/auth/config";
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, error, isLoading, requireVerification } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
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
    console.log("Login form mounted");
    setIsMounted(true);

    // Adicionar informações de depuração
    const envInfo = {
      isProduction: isProduction(),
      shouldUse2FA: shouldUse2FA(),
      turnstileSiteKey: SHARED_AUTH_CONFIG.TURNSTILE_SITE_KEY,
      nodeEnv: process.env.NODE_ENV,
      appEnv: process.env.NEXT_PUBLIC_APP_ENV,
    };

    console.log("Environment Debug Info:", envInfo);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
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
            await login({
              ...data,
              turnstileToken: response,
            });
            return;
          }
        }
      } catch (e) {
        console.error("Error retrieving Turnstile token:", e);
      }

      alert("Please complete the security verification.");
      return;
    }

    await login({
      ...data,
      turnstileToken: turnstileToken || undefined,
    });
  };

  // If verification is required, redirect to verification page
  if (requireVerification) {
    window.location.href = "/auth/verify";
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-balance text-muted-foreground">
              Sign in to your TACO account
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/reset-password"
                className="ml-auto text-sm underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
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
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
