"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/lib/auth/schemas";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { AUTH_CONFIG, shouldUse2FA } from "@/lib/auth/config";
import Script from "next/script";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, error, isLoading, requireVerification } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (shouldUse2FA() && !turnstileToken) {
      alert("Por favor, complete a verificação de segurança.");
      return;
    }

    await login({
      ...data,
      turnstileToken: turnstileToken || undefined,
    });
  };

  // Função de callback para o Turnstile
  const onTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
  };

  // Se for necessária verificação, redirecionar para a página de verificação
  if (requireVerification) {
    window.location.href = "/auth/verify";
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                <p className="text-balance text-muted-foreground">
                  Entre na sua conta TACO
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/auth/reset-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {shouldUse2FA() && (
                <div className="flex justify-center">
                  <div
                    id="turnstile-widget"
                    className="cf-turnstile"
                    data-sitekey={AUTH_CONFIG.TURNSTILE_SITE_KEY}
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
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <Link
                  href="/auth/signup"
                  className="underline underline-offset-4"
                >
                  Registre-se
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/logoTaco.png"
              alt="Image"
              width={500}
              height={500}
              className="absolute inset-0 h-full w-full object-scale-down dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Ao clicar em continuar, você concorda com nossos{" "}
        <a href="#">Termos de Serviço</a> e{" "}
        <a href="#">Política de Privacidade</a>.
      </div>
    </div>
  );
}
