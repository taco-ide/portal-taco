import { compare, hash } from "bcrypt";
import { Resend } from "resend";
import { SERVER_AUTH_CONFIG, isProduction } from "./config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const resend = new Resend(SERVER_AUTH_CONFIG.RESEND_API_KEY);

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

  return (result as { id: number }[])[0].id;
}

// Verificar o código de verificação
export async function verifyCode(
  codeId: number,
  userCode: string
): Promise<boolean> {
  const result = await prisma.$queryRaw`
    SELECT * FROM verification_codes WHERE id = ${codeId}
  `;

  const verificationCode = (
    result as { id: number; expires_at: Date; code: string }[]
  )[0];

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

// Enviar email com código de verificação
export async function sendVerificationEmail(email: string, code: string) {
  try {
    // Em desenvolvimento, apenas simular o envio se não houver API key
    if (!isProduction() && !SERVER_AUTH_CONFIG.RESEND_API_KEY) {
      console.log(`[DEV] Código de verificação para ${email}: ${code}`);
      return { success: true };
    }

    const { error } = await resend.emails.send({
      from: SERVER_AUTH_CONFIG.EMAIL_FROM,
      to: email,
      subject: "Seu código de verificação",
      text: `Seu código de verificação é: ${code}. Este código expira em 5 minutos.`,
    });

    if (error) {
      console.error("Erro ao enviar e-mail:", error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { success: false };
  }
}

// Verificar token do Cloudflare Turnstile
export async function verifyTurnstileToken(token: string) {
  try {
    const formData = new FormData();
    formData.append("secret", SERVER_AUTH_CONFIG.TURNSTILE_SECRET);
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
