import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "./lib/auth/middleware";

// Caminhos públicos que não exigem autenticação
const publicPaths = [
  "/auth", // Todas as rotas de autenticação na interface
  "/api/v1/auth", // Todas as rotas da API v1 de autenticação
  "/", // Apenas a página inicial exata
  "/images",
  "/public", // Conteúdo da pasta pública
];

// Esta função é executada para todas as requisições
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar se é exatamente a página inicial
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Verificar autenticação para todas as outras rotas
  return authMiddleware(request, publicPaths);
}

// Configuração de correspondência de rotas para o middleware
export const config = {
  // Aplicar o middleware a todas as rotas, exceto recursos estáticos
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.svg|images/|public/|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)",
  ],
};
