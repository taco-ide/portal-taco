import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requestPasswordResetSchema } from "@/lib/auth/schemas";
import { createVerificationToken } from "@/lib/auth/jwt";
import {
  generateVerificationCode,
  saveVerificationCode,
  sendVerificationEmail,
  verifyTurnstileToken,
} from "@/lib/auth/utils";
import { SHARED_AUTH_CONFIG, isProduction } from "@/lib/auth/config";
import { cookies } from "next/headers";

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

    // Verificar token do Turnstile
    if (turnstileToken) {
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
          message: "If the email exists, a reset code will be sent",
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
    await sendVerificationEmail(user.email, code);

    // Criar token de verificação
    const verificationToken = await createVerificationToken({
      userId: user.userId,
      email: user.email,
      type: "PASSWORD_RESET",
      name: user.name || undefined,
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

    return NextResponse.json({ message: "Reset code sent" }, { status: 200 });
  } catch (error) {
    console.error("Error sending code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
