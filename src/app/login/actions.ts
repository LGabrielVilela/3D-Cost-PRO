"use server";

import { redirect } from "next/navigation";

import { createSession, deleteSession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return { error: "Informe a senha." };
  }

  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    return { error: "APP_PASSWORD não configurada no servidor." };
  }

  if (password !== appPassword) {
    return { error: "Senha incorreta." };
  }

  await createSession();
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
