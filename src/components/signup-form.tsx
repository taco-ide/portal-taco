"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupFormData, signupSchema } from "@/lib/auth/schemas";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { SHARED_AUTH_CONFIG, shouldUse2FA } from "@/lib/auth/config";
import Script from "next/script";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signup, error, isLoading, requireVerification } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    if (shouldUse2FA() && !turnstileToken) {
      alert("Por favor, complete a verificação de segurança.");
      return;
    }

    await signup({
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Crie sua conta</h1>
            <p className="text-balance text-muted-foreground">
              Registre-se na plataforma TACO
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
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
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirme a senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Tipo de perfil</Label>
            <Select onValueChange={(value) => setValue("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Estudante</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
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
            {isLoading ? "Registrando..." : "Registrar"}
          </Button>
          <div className="text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Entrar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
