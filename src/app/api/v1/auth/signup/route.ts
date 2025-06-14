import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { shouldUse2FA } from "@/lib/auth/config";
import { hashPassword } from "@/lib/auth/utils";
import { signupSchema } from "@/lib/auth/schemas";
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
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid registration data",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, email, password, turnstileToken } = validation.data;

    // Verificar token do Turnstile
    if (turnstileToken) {
      const isValidTurnstile = await verifyTurnstileToken(turnstileToken);
      if (!isValidTurnstile) {
        return NextResponse.json(
          { error: "Security verification failed" },
          { status: 400 }
        );
      }
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 409 }
      );
    }

    // Gerar hash da senha
    const passwordHash = await hashPassword(password);

    // Criar o usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        isActive: true,
      },
    });

    // Lógica diferente para ambiente de desenvolvimento e produção
    if (shouldUse2FA()) {
      // Em produção: Gerar código de verificação e enviar e-mail
      const code = generateVerificationCode();
      const verificationId = await saveVerificationCode(
        newUser.userId,
        code,
        "2FA"
      );

      // Enviar e-mail com o código
      await sendVerificationEmail(newUser.email, code);

      // Criar token de verificação
      const verificationToken = await createVerificationToken({
        userId: newUser.userId,
        email: newUser.email,
        name: newUser.name || undefined,
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
          message: "Verification code sent",
          requireVerification: true,
        },
        { status: 201 }
      );
    } else {
      // Em desenvolvimento: Criar usuário sem verificação
      return NextResponse.json(
        {
          message: "User created successfully",
          user: {
            id: newUser.userId,
            email: newUser.email,
            name: newUser.name,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
