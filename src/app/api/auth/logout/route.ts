import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { clearCookie } from "@/lib/auth/server-cookies";

export async function POST(request: NextRequest) {
  try {
    // Limpar o cookie de sessão
    clearCookie(AUTH_CONFIG.SESSION_TOKEN_NAME);

    return NextResponse.json(
      { message: "Logout bem-sucedido" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro no logout:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
