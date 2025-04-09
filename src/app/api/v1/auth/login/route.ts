import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { AUTH_CONFIG, shouldUse2FA } from "@/lib/auth/config";
import { setSecureCookie } from "@/lib/auth/server-cookies";
import { verifyPassword } from "@/lib/auth/utils";
import { loginSchema } from "@/lib/auth/schemas";
import { createSessionToken, createVerificationToken } from "@/lib/auth/jwt";
import {
  generateVerificationCode,
  saveVerificationCode,
  sendVerificationEmail,
  verifyTurnstileToken,
} from "@/lib/auth/utils";
import {
  SERVER_AUTH_CONFIG,
  SHARED_AUTH_CONFIG,
  isProduction,
} from "@/lib/auth/config";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados de entrada
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados de login inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, turnstileToken } = validation.data;

    // Verificar token do Turnstile em produção
    if (shouldUse2FA() && turnstileToken) {
      const isValidTurnstile = await verifyTurnstileToken(turnstileToken);
      if (!isValidTurnstile) {
        return NextResponse.json(
          { error: "Verificação de segurança falhou" },
          { status: 400 }
        );
      }
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verificar se o usuário existe
    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Conta desativada. Entre em contato com o suporte." },
        { status: 403 }
      );
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // Lógica diferente para ambiente de desenvolvimento e produção
    if (shouldUse2FA()) {
      // Em produção: Gerar código de verificação e enviar e-mail
      const code = generateVerificationCode();
      const verificationId = await saveVerificationCode(
        user.userId,
        code,
        "2FA"
      );

      // Enviar e-mail com o código
      await sendVerificationEmail(user.email, code, "2FA");

      // Criar token de verificação
      const verificationToken = await createVerificationToken({
        userId: user.userId,
        email: user.email,
        name: user.name || undefined,
        type: "2FA",
      });

      // Definir cookie com token de verificação
      cookies().set({
        name: SHARED_AUTH_CONFIG.VERIFICATION_TOKEN_NAME,
        value: verificationToken,
        maxAge: SHARED_AUTH_CONFIG.VERIFICATION_EXPIRATION,
        httpOnly: true,
        secure: isProduction(),
      });

      // Definir cookie com ID de verificação
      cookies().set({
        name: SHARED_AUTH_CONFIG.VERIFICATION_ID_NAME,
        value: String(verificationId),
        maxAge: SHARED_AUTH_CONFIG.VERIFICATION_EXPIRATION,
        httpOnly: true,
        secure: isProduction(),
      });

      return NextResponse.json(
        {
          message: "Código de verificação enviado",
          requireVerification: true,
        },
        { status: 200 }
      );
    } else {
      // Em desenvolvimento: Gerar token de sessão diretamente
      const sessionToken = await createSessionToken({
        userId: user.userId,
        email: user.email,
        name: user.name || undefined,
        role: user.role,
      });

      // Definir cookie com token de sessão
      cookies().set({
        name: SHARED_AUTH_CONFIG.SESSION_TOKEN_NAME,
        value: sessionToken,
        maxAge: SHARED_AUTH_CONFIG.SESSION_EXPIRATION,
        httpOnly: true,
        secure: isProduction(),
      });

      return NextResponse.json(
        {
          message: "Login bem-sucedido",
          user: {
            id: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
