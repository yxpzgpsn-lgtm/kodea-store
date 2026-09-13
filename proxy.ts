import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.PLATFORM_ROOT_DOMAIN ?? "platform.com";
// Hostnames that should never be treated as a tenant storefront.
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api"]);

function resolveStoreSlug(hostname: string): string | null {
  const host = hostname.split(":")[0];

  if (host === "localhost" || host === "127.0.0.1") return null;

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = host.slice(0, -(ROOT_DOMAIN.length + 1));
    if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) return null;
    return subdomain;
  }

  if (host === ROOT_DOMAIN) return null;

  // Anything else is treated as a mapped custom domain; resolution to a
  // store slug happens inside the storefront route via Store.customDomain,
  // so we pass the raw hostname through as-is.
  return host;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept platform routes (dashboard, admin, marketing, api, auth pages).
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/store/") // already resolved
  ) {
    return NextResponse.next();
  }

  const storeSlug = resolveStoreSlug(request.headers.get("host") ?? "");
  if (!storeSlug) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/store/${storeSlug}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
