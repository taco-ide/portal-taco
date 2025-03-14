import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Definindo a interface do usuário
export interface User {
  name?: string;
  role: string;
}

// Interface do contexto
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
  getFirstName: () => string;
  logout: () => Promise<void>;
}

// Função para extrair o primeiro nome
const extractFirstName = (fullName?: string): string => {
  if (!fullName) return "Usuário";
  return fullName.split(" ")[0];
};

// Criando o contexto com valor padrão
const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async () => {},
  clearUser: () => {},
  getFirstName: () => "Usuário",
  logout: async () => {},
});

// Hook personalizado para usar o contexto
export const useUser = () => useContext(UserContext);

// Provedor do contexto
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os dados do usuário da API
  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/user");

      if (!response.ok) {
        // Se o status não for 2xx, consideramos que não há usuário logado
        if (response.status === 401) {
          setUser(null);
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar dados do usuário");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao buscar usuário:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para limpar os dados do usuário (logout)
  const clearUser = () => {
    setUser(null);
  };

  // Função para fazer logout
  const logout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao fazer logout");
      }

      // Limpar dados do usuário no estado
      clearUser();

      // Redirecionar para a página de login
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao fazer logout:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para obter o primeiro nome do usuário
  const getFirstName = (): string => {
    if (!user || !user.name) return "Usuário";
    return extractFirstName(user.name);
  };

  // Buscar usuário ao montar o componente
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        fetchUser,
        clearUser,
        getFirstName,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
