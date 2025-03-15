import { NextRequest, NextResponse } from "next/server";
import { SHARED_AUTH_CONFIG } from "./config";
import { verifySessionToken } from "./jwt";
import { cookies } from "next/headers";

// Default public paths if none are provided
const DEFAULT_PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/reset-password",
  "/auth/verify",
];

export async function authMiddleware(
  request: NextRequest,
  publicPaths: string[] = DEFAULT_PUBLIC_PATHS
) {
  const pathname = request.nextUrl.pathname;

  // Check if the current path is public
  if (isPublicPath(pathname, publicPaths)) {
    return NextResponse.next();
  }

  // Get the session token from cookies
  const sessionToken = request.cookies.get(
    SHARED_AUTH_CONFIG.SESSION_TOKEN_NAME
  )?.value;

  // Check if it's an API request
  const isApiRequest = pathname.startsWith("/api/");

  // If there's no token
  if (!sessionToken) {
    return handleUnauthenticated(request, isApiRequest, pathname);
  }

  // Verify if the token is valid
  try {
    await verifySessionToken(sessionToken);
    return NextResponse.next();
  } catch (error) {
    return handleInvalidToken(request, isApiRequest, pathname);
  }
}

// Helper function to handle unauthenticated requests
function handleUnauthenticated(
  request: NextRequest,
  isApiRequest: boolean,
  pathname: string
) {
  if (isApiRequest) {
    return createUnauthorizedResponse("Unauthorized. Authentication required.");
  }

  return redirectToLogin(request, pathname);
}

// Helper function to handle invalid token
function handleInvalidToken(
  request: NextRequest,
  isApiRequest: boolean,
  pathname: string
) {
  if (isApiRequest) {
    return createUnauthorizedResponse(
      "Unauthorized. Invalid or expired token."
    );
  }

  return redirectToLogin(request, pathname);
}

// Helper function to create unauthorized response
function createUnauthorizedResponse(message: string) {
  return new NextResponse(
    JSON.stringify({
      success: false,
      message,
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// Helper function to redirect to login
function redirectToLogin(request: NextRequest, pathname: string) {
  const url = new URL("/auth/login", request.url);
  url.searchParams.set("redirect", encodeURIComponent(pathname));
  return NextResponse.redirect(url);
}

// Helper function to check if a path is public
function isPublicPath(pathname: string, publicPaths: string[]): boolean {
  return publicPaths.some(
    (path) =>
      // For specific paths ("/auth", "/api/v1/auth"), check if the path starts with them
      (path !== "/" && pathname.startsWith(path)) ||
      // For the root ("/"), check if it's exactly equal
      (path === "/" && pathname === "/")
  );
}

// Helper to check role-based access
export async function checkRole(request: NextRequest, allowedRoles: string[]) {
  const sessionToken = request.cookies.get(
    SHARED_AUTH_CONFIG.SESSION_TOKEN_NAME
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

// Middleware para verificar se o usuário é admin
export async function adminMiddleware(req: NextRequest) {
  try {
    // Obter token da sessão dos cookies
    const sessionToken = req.cookies.get(
      SHARED_AUTH_CONFIG.SESSION_TOKEN_NAME
    )?.value;

    // Implementação futura
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
