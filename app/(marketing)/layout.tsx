import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Kodéa Store
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/register" />}>
              Start for free
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-muted-foreground">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <p className="text-base font-semibold text-foreground">Kodéa Store</p>
              <p className="mt-1 max-w-sm">
                The intelligent commerce platform for building, managing and growing your
                online business.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <p className="font-medium text-foreground">Product</p>
                <ul className="mt-2 space-y-1.5">
                  <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                  <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">Company</p>
                <ul className="mt-2 space-y-1.5">
                  <li><Link href="/register" className="hover:text-foreground">Get started</Link></li>
                  <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-10 text-xs">© {new Date().getFullYear()} Kodéa Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
