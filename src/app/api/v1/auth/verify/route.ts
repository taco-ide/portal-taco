import { NextRequest, NextResponse } from "next/server";
import { verificationSchema } from "@/lib/auth/schemas";
import {
  AUTH_CONFIG,
  SERVER_AUTH_CONFIG,
  SHARED_AUTH_CONFIG,
  isProduction,
} from "@/lib/auth/config";
import {
  clearCookie,
  getCookie,
  setSecureCookie,
} from "@/lib/auth/server-cookies";
import { verifyCode } from "@/lib/auth/utils";
import { createSessionToken, verifyVerificationToken } from "@/lib/auth/jwt";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados de entrada
    const validation = verificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Código inválido", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { code } = validation.data;

    // Obter tokens dos cookies
    const verificationToken = cookies().get(
      SHARED_AUTH_CONFIG.VERIFICATION_TOKEN_NAME
    )?.value;
    const verificationId = cookies().get(
      SHARED_AUTH_CONFIG.VERIFICATION_ID_NAME
    )?.value;

    if (!verificationToken || !verificationId) {
      return NextResponse.json(
        { error: "Sessão de verificação expirada ou inválida" },
        { status: 401 }
      );
    }

    // Verificar o token de verificação
    let tokenPayload;
    try {
      tokenPayload = await verifyVerificationToken(verificationToken);
    } catch (error) {
      clearCookie(AUTH_CONFIG.VERIFICATION_TOKEN_NAME);
      clearCookie(AUTH_CONFIG.VERIFICATION_ID_NAME);

      return NextResponse.json(
        { error: "Sessão de verificação expirada ou inválida" },
        { status: 401 }
      );
    }

    // Verificar o código
    const isValidCode = await verifyCode(parseInt(verificationId), code);
    if (!isValidCode) {
      return NextResponse.json(
        { error: "Código inválido ou expirado" },
        { status: 400 }
      );
    }

    // Buscar usuário para obter informações atualizadas
    const user = await prisma.user.findUnique({
      where: { userId: tokenPayload.userId },
    });

    if (!user || !user.isActive) {
      clearCookie(AUTH_CONFIG.VERIFICATION_TOKEN_NAME);
      clearCookie(AUTH_CONFIG.VERIFICATION_ID_NAME);

      return NextResponse.json(
        { error: "Usuário não encontrado ou desativado" },
        { status: 404 }
      );
    }

    // Criar token de sessão
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

    // Limpar cookies de verificação
    cookies().delete(SHARED_AUTH_CONFIG.VERIFICATION_TOKEN_NAME);
    cookies().delete(SHARED_AUTH_CONFIG.VERIFICATION_ID_NAME);

    return NextResponse.json({
      message: "Verificação bem-sucedida",
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro na verificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
