import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/30 px-6 py-16">
      <Link href="/" className="mb-8 text-lg font-semibold tracking-tight">
        NOVA
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
