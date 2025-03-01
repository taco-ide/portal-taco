import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { AUTH_CONFIG, shouldUse2FA } from "@/lib/auth/config";
import { setSecureCookie } from "@/lib/auth/server-cookies";
import { hashPassword } from "@/lib/auth/utils";
import { signupSchema } from "@/lib/auth/schemas";
import { createSessionToken, createVerificationToken } from "@/lib/auth/jwt";
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
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados de registro inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, email, password, role, turnstileToken } = validation.data;

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

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está registrado" },
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
        role,
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
      await sendVerificationEmail(newUser.email, code, "2FA");

      // Criar token de verificação
      const verificationToken = await createVerificationToken({
        userId: newUser.userId,
        email: newUser.email,
        name: newUser.name || undefined,
        type: "2FA",
      });

      // Definir cookies temporários para o processo de verificação
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
        {
          message: "Código de verificação enviado",
          requireVerification: true,
        },
        { status: 201 }
      );
    } else {
      // Em desenvolvimento: Criar usuário sem verificação
      return NextResponse.json(
        {
          message: "Usuário criado com sucesso",
          user: {
            id: newUser.userId,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
