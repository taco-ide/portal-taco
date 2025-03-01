import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "./lib/auth/middleware";

// Caminhos públicos que não exigem autenticação
const publicPaths = [
  "/auth/login",
  "/auth/reset-password",
  "/auth/verify",
  "/api/auth/login",
  "/api/auth/verify",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/send-code",
  "/",
];

// Esta função é executada para todas as requisições
export async function middleware(request: NextRequest) {
  // Verificar autenticação
  return authMiddleware(request, publicPaths);
}

// Configuração de correspondência de rotas para o middleware
export const config = {
  // Aplicar o middleware a todas as rotas, exceto recursos estáticos
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*.svg).*)"],
};
