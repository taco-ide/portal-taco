import type { NextRequest } from "next/server";
import { authMiddleware } from "./lib/auth/middleware";

// Public paths that don't require authentication
const publicPaths = [
  "/auth", // All authentication routes in the interface
  "/api/v1/auth", // All API v1 authentication routes
  "/", // Only the exact home page
  "/images",
  "/public", // Public folder content
];

// This function is executed for all requests
export async function middleware(request: NextRequest) {
  // Check authentication for all routes, passing our public paths configuration
  return authMiddleware(request, publicPaths);
}

// Route matching configuration for the middleware
export const config = {
  // Apply the middleware to all routes, except static resources
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.svg|images/|public/|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)",
  ],
};
