import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "./config";
import { verifySessionToken } from "./jwt";

export async function authMiddleware(
  request: NextRequest,
  publicPaths: string[] = [
    "/auth/login",
    "/auth/signup",
    "/auth/reset-password",
    "/auth/verify",
  ]
) {
  const pathname = request.nextUrl.pathname;

  // Verifica se o caminho atual é público
  if (
    publicPaths.some(
      (path) =>
        // Para caminhos específicos ("/auth", "/api/v1/auth"), verificamos se o caminho começa com eles
        (path !== "/" && pathname.startsWith(path)) ||
        // Para a raiz ("/"), verificamos se é exatamente igual
        (path === "/" && pathname === "/")
    )
  ) {
    return NextResponse.next();
  }

  // Obtém o token de sessão dos cookies
  const sessionToken = request.cookies.get(
    AUTH_CONFIG.SESSION_TOKEN_NAME
  )?.value;

  // Se não houver token, redirecionar para a página de login
  if (!sessionToken) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  // Verifica se o token é válido
  try {
    await verifySessionToken(sessionToken);
    return NextResponse.next();
  } catch (error) {
    // Token inválido, redirecionar para login
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
}

// Helper para verificar o acesso por função
export async function checkRole(request: NextRequest, allowedRoles: string[]) {
  const sessionToken = request.cookies.get(
    AUTH_CONFIG.SESSION_TOKEN_NAME
  )?.value;

  if (!sessionToken) {
    return false;
  }

  try {
    const payload = await verifySessionToken(sessionToken);
    return allowedRoles.includes(payload.role);
  } catch (error) {
    return false;
  }
}
