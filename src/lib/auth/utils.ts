import { compare, hash } from "bcrypt";
import { Resend } from "resend";
import { AUTH_CONFIG, isProduction } from "./config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const resend = new Resend(AUTH_CONFIG.RESEND_API_KEY);

// Função para gerar hash de senha
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

// Função para verificar senha
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Função para gerar código de verificação de 6 dígitos
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Salvar código de verificação no banco de dados
export async function saveVerificationCode(
  userId: number,
  code: string,
  type: "2FA" | "PASSWORD_RESET"
): Promise<number> {
  // Primeiro, exclui quaisquer códigos ativos para este usuário e tipo
  await prisma.$queryRaw`DELETE FROM verification_codes WHERE user_id = ${userId} AND type = ${type}`;

  // Cria um novo código de verificação
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Expira em 5 minutos

  const result = await prisma.$queryRaw`
    INSERT INTO verification_codes (code, type, user_id, expires_at, created_at)
    VALUES (${code}, ${type}, ${userId}, ${expiresAt}, NOW())
    RETURNING id
  `;

  return (result as any)[0].id;
}

// Verificar o código de verificação
export async function verifyCode(
  codeId: number,
  userCode: string
): Promise<boolean> {
  const result = await prisma.$queryRaw`
    SELECT * FROM verification_codes WHERE id = ${codeId}
  `;

  const verificationCode = (result as any)[0];

  if (!verificationCode) {
    return false;
  }

  // Verifica se o código expirou
  if (new Date(verificationCode.expires_at) < new Date()) {
    // Código expirado, vamos excluí-lo
    await prisma.$queryRaw`DELETE FROM verification_codes WHERE id = ${codeId}`;
    return false;
  }

  // Verifica se o código é válido
  const isValid = verificationCode.code === userCode;

  if (isValid) {
    // Código válido, vamos excluí-lo para não ser usado novamente
    await prisma.$queryRaw`DELETE FROM verification_codes WHERE id = ${codeId}`;
  }

  return isValid;
}

// Enviar e-mail com código de verificação
export async function sendVerificationEmail(
  email: string,
  code: string,
  type: "2FA" | "PASSWORD_RESET"
) {
  if (!isProduction() && !AUTH_CONFIG.RESEND_API_KEY) {
    console.log(`[DEV] Código de verificação para ${email}: ${code}`);
    return true;
  }

  try {
    const subject =
      type === "2FA" ? "Seu código de verificação" : "Recuperação de senha";

    const content =
      type === "2FA"
        ? `Seu código de verificação é: ${code}. Este código expira em 5 minutos.`
        : `Seu código para redefinição de senha é: ${code}. Este código expira em 5 minutos.`;

    await resend.emails.send({
      from: AUTH_CONFIG.EMAIL_FROM,
      to: email,
      subject,
      text: content,
    });

    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return false;
  }
}

// Verificar token do Turnstile
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  // Em ambiente de desenvolvimento, pular a verificação
  if (!isProduction()) {
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", AUTH_CONFIG.TURNSTILE_SECRET);
    formData.append("response", token);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Erro ao verificar token do Turnstile:", error);
    return false;
  }
}
