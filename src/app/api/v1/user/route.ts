import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { AUTH_CONFIG } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(
      AUTH_CONFIG.SESSION_TOKEN_NAME
    )?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userData = await verifySessionToken(sessionToken);

    return NextResponse.json({
      user: {
        name: userData.name,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar token de sessão:", error);
    return NextResponse.json(
      { error: "Token inválido ou expirado" },
      { status: 401 }
    );
  }
}
