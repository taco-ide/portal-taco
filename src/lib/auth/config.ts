// Configurações de autenticação

// Configurações compartilhadas (seguras para cliente e servidor)
export const SHARED_AUTH_CONFIG = {
  SESSION_TOKEN_NAME: "session_token",
  VERIFICATION_TOKEN_NAME: "verification_token",
  VERIFICATION_ID_NAME: "verification_id",
  SESSION_EXPIRATION: 60 * 60 * 24 * 7, // 7 dias em segundos
  VERIFICATION_EXPIRATION: 60 * 5, // 5 minutos em segundos
  TURNSTILE_SITE_KEY:
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "",
};

// Configurações apenas para servidor (não devem ser usadas no cliente)
export const SERVER_AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || "insecure-jwt-secret-for-development",
  TURNSTILE_SECRET: process.env.CLOUDFLARE_TURNSTILE_SECRET || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@example.com",
};

// Para compatibilidade com código existente
// Não use diretamente em componentes do cliente
export const AUTH_CONFIG = {
  ...SHARED_AUTH_CONFIG,
  ...(typeof window === "undefined" ? SERVER_AUTH_CONFIG : {}),
};

// Função para verificar se o ambiente é de produção
// Agora também verifica a variável NEXT_PUBLIC_APP_ENV para permitir forçar o modo de produção
export const isProduction = () =>
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_APP_ENV === "production";

// Verifica se a autenticação de dois fatores deve ser usada
export function shouldUse2FA() {
  return isProduction();
}
