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
        { error: "Invalid data", details: validation.error.issues },
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
        { error: "Reset session expired or invalid" },
        { status: 401 }
      );
    }

    // Verificar o token de verificação
    let tokenPayload;
    try {
      tokenPayload = await verifyVerificationToken(verificationToken);

      // Verificar se é um token de redefinição de senha
      if (tokenPayload.type !== "PASSWORD_RESET") {
        throw new Error("Invalid token type");
      }
    } catch (error) {
      clearCookie(AUTH_CONFIG.VERIFICATION_TOKEN_NAME);
      clearCookie(AUTH_CONFIG.VERIFICATION_ID_NAME);
      console.error("Error resetting password:", error);
      return NextResponse.json(
        { error: "Reset session expired or invalid" },
        { status: 401 }
      );
    }

    // Verificar o código
    const isValidCode = await verifyCode(parseInt(verificationId), code);
    if (!isValidCode) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
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
        { error: "User not found or disabled" },
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
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
