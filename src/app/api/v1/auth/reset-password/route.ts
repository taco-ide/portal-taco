import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { AUTH_CONFIG, SHARED_AUTH_CONFIG } from "@/lib/auth/config";
import { clearCookie } from "@/lib/auth/server-cookies";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import { hashPassword, verifyCode } from "@/lib/auth/utils";
import { verifyVerificationToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados de entrada
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { code, password } = validation.data;

    // Obter tokens dos cookies
    const verificationToken = cookies().get(
      SHARED_AUTH_CONFIG.VERIFICATION_TOKEN_NAME
    )?.value;
    const verificationId = cookies().get(
      SHARED_AUTH_CONFIG.VERIFICATION_ID_NAME
    )?.value;

    if (!verificationToken || !verificationId) {
      return NextResponse.json(
        { error: "Sessão de redefinição expirada ou inválida" },
        { status: 401 }
      );
    }

    // Verificar o token de verificação
    let tokenPayload;
    try {
      tokenPayload = await verifyVerificationToken(verificationToken);

      // Verificar se é um token de redefinição de senha
      if (tokenPayload.type !== "PASSWORD_RESET") {
        throw new Error("Tipo de token inválido");
      }
    } catch (error) {
      clearCookie(AUTH_CONFIG.VERIFICATION_TOKEN_NAME);
      clearCookie(AUTH_CONFIG.VERIFICATION_ID_NAME);
      console.error("Erro na redefinição de senha:", error);
      return NextResponse.json(
        { error: "Sessão de redefinição expirada ou inválida" },
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

    // Buscar usuário para confirmar existência
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

    // Gerar hash da nova senha
    const passwordHash = await hashPassword(password);

    // Atualizar a senha do usuário
    await prisma.user.update({
      where: { userId: user.userId },
      data: { passwordHash },
    });

    // Limpar cookies de verificação
    cookies().delete(SHARED_AUTH_CONFIG.VERIFICATION_TOKEN_NAME);
    cookies().delete(SHARED_AUTH_CONFIG.VERIFICATION_ID_NAME);

    return NextResponse.json({
      message: "Senha redefinida com sucesso",
    });
  } catch (error) {
    console.error("Erro na redefinição de senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
