import { NextRequest, NextResponse } from "next/server";
import { verificationSchema } from "@/lib/auth/schemas";
import { AUTH_CONFIG } from "@/lib/auth/config";
import {
  clearCookie,
  getCookie,
  setSecureCookie,
} from "@/lib/auth/server-cookies";
import { verifyCode } from "@/lib/auth/utils";
import { createSessionToken, verifyVerificationToken } from "@/lib/auth/jwt";
import { PrismaClient } from "@prisma/client";

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

    // Obter tokens temporários dos cookies
    const verificationToken = getCookie(AUTH_CONFIG.VERIFICATION_TOKEN_NAME);
    const verificationId = getCookie(AUTH_CONFIG.VERIFICATION_ID_NAME);

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

    // Definir cookie de sessão
    setSecureCookie(
      AUTH_CONFIG.SESSION_TOKEN_NAME,
      sessionToken,
      AUTH_CONFIG.SESSION_EXPIRATION
    );

    // Limpar cookies temporários
    clearCookie(AUTH_CONFIG.VERIFICATION_TOKEN_NAME);
    clearCookie(AUTH_CONFIG.VERIFICATION_ID_NAME);

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
