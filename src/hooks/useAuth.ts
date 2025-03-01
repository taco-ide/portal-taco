import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginFormData, VerificationFormData } from "@/lib/auth/schemas";

interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requireVerification, setRequireVerification] = useState(false);

  // Função para login
  const login = async (data: LoginFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro desconhecido no login");
        return false;
      }

      // Verificar se requer verificação em duas etapas
      if (result.requireVerification) {
        setRequireVerification(true);
        return true;
      }

      // Redirecionamento após login bem-sucedido
      router.push("/dashboard");
      router.refresh();
      return true;
    } catch (error) {
      console.error("Erro durante o login:", error);
      setError("Erro ao conectar com o servidor");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificação em duas etapas
  const verify = async (data: VerificationFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro desconhecido na verificação");
        return false;
      }

      // Redirecionamento após verificação bem-sucedida
      router.push("/dashboard");
      router.refresh();
      return true;
    } catch (error) {
      console.error("Erro durante a verificação:", error);
      setError("Erro ao conectar com o servidor");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para logout
  const logout = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Erro desconhecido no logout");
        return false;
      }

      // Redirecionamento após logout bem-sucedido
      router.push("/auth/login");
      router.refresh();
      return true;
    } catch (error) {
      console.error("Erro durante o logout:", error);
      setError("Erro ao conectar com o servidor");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para solicitar redefinição de senha
  const requestPasswordReset = async (
    email: string,
    turnstileToken?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro desconhecido na solicitação");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao solicitar redefinição:", error);
      setError("Erro ao conectar com o servidor");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para redefinir senha
  const resetPassword = async (
    code: string,
    password: string,
    confirmPassword: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, password, confirmPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro desconhecido na redefinição");
        return false;
      }

      // Redirecionamento após redefinição bem-sucedida
      router.push("/auth/login?resetSuccess=true");
      return true;
    } catch (error) {
      console.error("Erro durante redefinição:", error);
      setError("Erro ao conectar com o servidor");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    verify,
    logout,
    requestPasswordReset,
    resetPassword,
    isLoading,
    error,
    requireVerification,
  };
};
