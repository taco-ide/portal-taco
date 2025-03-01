// Configurações de autenticação (compartilhadas entre cliente e servidor)
export const AUTH_CONFIG = {
  SESSION_TOKEN_NAME: "session_token",
  VERIFICATION_TOKEN_NAME: "verification_token",
  VERIFICATION_ID_NAME: "verification_id",
  SESSION_EXPIRATION: 60 * 60 * 8, // 8 horas em segundos
  VERIFICATION_EXPIRATION: 60 * 5, // 5 minutos em segundos
  JWT_SECRET: process.env.JWT_SECRET || "insecure-jwt-secret-for-development",
  TURNSTILE_SECRET: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SECRET || "",
  TURNSTILE_SITE_KEY: process.env.CLOUDFLARE_TURNSTILE_SITE_KEY || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@example.com",
};

// Função para verificar se o ambiente é de produção
export const isProduction = () => process.env.NODE_ENV === "production";

// Verifica se a autenticação de dois fatores deve ser usada
export function shouldUse2FA() {
  return isProduction();
}
