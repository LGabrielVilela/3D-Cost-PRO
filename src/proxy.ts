import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/session";

/** Rotas acessíveis sem sessão. */
const PUBLIC_PATHS = ["/login"];

/**
 * Proxy (substitui o antigo `middleware.ts` a partir do Next 16): checagem
 * "otimista" de sessão via cookie antes de renderizar qualquer rota. As
 * Server Actions também verificam a sessão de forma independente
 * (`requireSession`), então esta camada é só a primeira linha de defesa.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = await verifyToken(token);

  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
