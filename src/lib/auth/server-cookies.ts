import { cookies } from "next/headers";
import { isProduction } from "./config";

// Função para definir um cookie HTTP-only
export function setSecureCookie(
  name: string,
  value: string,
  expiration: number
) {
  cookies().set({
    name,
    value,
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: expiration,
  });
}

// Função para limpar um cookie
export function clearCookie(name: string) {
  cookies().set({
    name,
    value: "",
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: -1,
  });
}

// Função para obter o valor de um cookie
export function getCookie(name: string) {
  return cookies().get(name)?.value;
}
