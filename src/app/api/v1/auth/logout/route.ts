import { NextResponse } from "next/server";
import { SHARED_AUTH_CONFIG } from "@/lib/auth/config";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Limpar o cookie de sessão
    cookies().delete(SHARED_AUTH_CONFIG.SESSION_TOKEN_NAME);

    return NextResponse.json(
      { message: "Logout bem-sucedido" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json(
      { error: "Erro ao processar logout" },
      { status: 500 }
    );
  }
}
