import { z } from "zod";

// Schema para validação de login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  turnstileToken: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema para validação do formulário de verificação (2FA)
export const verificationSchema = z.object({
  code: z.string().length(6, "O código deve ter 6 dígitos"),
});

export type VerificationFormData = z.infer<typeof verificationSchema>;

// Schema para solicitar redefinição de senha
export const requestPasswordResetSchema = z.object({
  email: z.string().email("Email inválido"),
  turnstileToken: z.string().optional(),
});

export type RequestPasswordResetFormData = z.infer<
  typeof requestPasswordResetSchema
>;

// Schema para redefinição de senha
export const resetPasswordSchema = z
  .object({
    code: z.string().length(6, "O código deve ter 6 dígitos"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Schema para validação de registro (signup)
export const signupSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres"),
    turnstileToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
