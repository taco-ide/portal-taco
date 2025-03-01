"use client";

import Cookies from "js-cookie";
import { isProduction } from "./config";

// Função para definir um cookie no cliente (não HTTP-only)
export function setClientCookie(
  name: string,
  value: string,
  expiration: number
) {
  Cookies.set(name, value, {
    expires: expiration / (60 * 60 * 24), // converter segundos para dias
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
  });
}

// Função para limpar um cookie no cliente
export function clearClientCookie(name: string) {
  Cookies.remove(name, {
    path: "/",
  });
}

// Função para obter o valor de um cookie no cliente
export function getClientCookie(name: string) {
  return Cookies.get(name);
}
