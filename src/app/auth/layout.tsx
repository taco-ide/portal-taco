"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">{children}</div>
            <div className="relative hidden bg-muted md:block">
              <Image
                src="/logoTaco.png"
                alt="Logo TACO"
                width={500}
                height={500}
                className="absolute inset-0 h-full w-full object-scale-down dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          Ao utilizar nossos serviços, você concorda com nossos{" "}
          <a href="#">Termos de Serviço</a> e{" "}
          <a href="#">Política de Privacidade</a>.
        </div>
      </div>
    </div>
  );
}
