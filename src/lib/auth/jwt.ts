import { SignJWT, jwtVerify } from "jose";
import { AUTH_CONFIG } from "./config";
import { JWTPayload } from "jose";

export interface SessionTokenPayload extends JWTPayload {
  userId: number;
  email: string;
  name?: string;
  role: string;
}

export interface VerificationTokenPayload extends JWTPayload {
  userId: number;
  email: string;
  type: "2FA" | "PASSWORD_RESET";
  name?: string;
}

// Criar token de sessão
export async function createSessionToken(
  payload: SessionTokenPayload
): Promise<string> {
  const secretKey = new TextEncoder().encode(AUTH_CONFIG.JWT_SECRET);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + AUTH_CONFIG.SESSION_EXPIRATION
    )
    .sign(secretKey);
}

// Criar token de verificação temporário
export async function createVerificationToken(
  payload: VerificationTokenPayload
): Promise<string> {
  const secretKey = new TextEncoder().encode(AUTH_CONFIG.JWT_SECRET);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + AUTH_CONFIG.VERIFICATION_EXPIRATION
    )
    .sign(secretKey);
}

// Verificar qualquer token
export async function verifyToken<T>(token: string): Promise<T> {
  try {
    const secretKey = new TextEncoder().encode(AUTH_CONFIG.JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as T;
  } catch (error) {
    throw new Error("Token inválido ou expirado");
  }
}

// Verificar token de sessão
export async function verifySessionToken(
  token: string
): Promise<SessionTokenPayload> {
  return verifyToken<SessionTokenPayload>(token);
}

// Verificar token de verificação
export async function verifyVerificationToken(
  token: string
): Promise<VerificationTokenPayload> {
  return verifyToken<VerificationTokenPayload>(token);
}
