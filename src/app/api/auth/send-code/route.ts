import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { AUTH_CONFIG, shouldUse2FA } from "@/lib/auth/config";
import { setSecureCookie } from "@/lib/auth/server-cookies";
import { requestPasswordResetSchema } from "@/lib/auth/schemas";
import { createVerificationToken } from "@/lib/auth/jwt";
import {
  generateVerificationCode,
  saveVerificationCode,
  sendVerificationEmail,
  verifyTurnstileToken,
} from "@/lib/auth/utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados de entrada
    const validation = requestPasswordResetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, turnstileToken } = validation.data;

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

    // Se o usuário não existir, não informamos por segurança
    // Mas fingimos que enviamos o código
    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          message: "Se o email existir, um código de redefinição será enviado",
        },
        { status: 200 }
      );
    }

    // Gerar código de verificação
    const code = generateVerificationCode();
    const verificationId = await saveVerificationCode(
      user.userId,
      code,
      "PASSWORD_RESET"
    );

    // Enviar e-mail com o código
    await sendVerificationEmail(user.email, code, "PASSWORD_RESET");

    // Criar token de verificação
    const verificationToken = await createVerificationToken({
      userId: user.userId,
      email: user.email,
      type: "PASSWORD_RESET",
      name: user.name || undefined,
    });

    // Definir cookies temporários para o processo de redefinição
    setSecureCookie(
      AUTH_CONFIG.VERIFICATION_TOKEN_NAME,
      verificationToken,
      AUTH_CONFIG.VERIFICATION_EXPIRATION
    );

    setSecureCookie(
      AUTH_CONFIG.VERIFICATION_ID_NAME,
      verificationId.toString(),
      AUTH_CONFIG.VERIFICATION_EXPIRATION
    );

    return NextResponse.json(
      { message: "Código de redefinição enviado" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao enviar código:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
