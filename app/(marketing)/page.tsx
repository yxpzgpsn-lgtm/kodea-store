import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  Boxes,
  ShoppingCart,
  Megaphone,
  CreditCard,
  Users,
  Globe,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/marketing/pricing-section";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Store Builder",
    description: "Drag-and-drop sections, responsive previews, undo/redo — no code required.",
  },
  {
    icon: Sparkles,
    title: "AI Store Assistant",
    description: "Describe your store and let AI draft your homepage, copy and SEO metadata.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Revenue, conversion, LTV and cohort trends — updated in real time.",
  },
  {
    icon: Boxes,
    title: "Inventory Management",
    description: "Multi-location stock, low-stock alerts, and full adjustment history.",
  },
  {
    icon: ShoppingCart,
    title: "Order Management",
    description: "From pending to delivered — one timeline, one source of truth.",
  },
  {
    icon: Megaphone,
    title: "Marketing Automation",
    description: "Abandoned-cart flows, segmented email, and visual automation builder.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Stripe-powered checkout, built on an abstraction ready for more providers.",
  },
  {
    icon: Users,
    title: "Customer CRM",
    description: "Segments, lifetime value, and order history in one customer profile.",
  },
  {
    icon: Globe,
    title: "Multi-channel Selling",
    description: "One catalog, every storefront — multi-language and multi-currency by default.",
  },
  {
    icon: Code2,
    title: "Developer API",
    description: "REST API, scoped API keys, and signed webhooks for every domain event.",
  },
];

const STEPS = [
  { step: "1", title: "Create your store", description: "Name it, pick a category, choose your currency and language." },
  { step: "2", title: "Add products", description: "Import a CSV or add products one by one with variants and inventory." },
  { step: "3", title: "Customize your storefront", description: "Drag and drop sections, tune typography, colors and layout." },
  { step: "4", title: "Connect payments", description: "Turn on Stripe in minutes — no code, no middleman." },
  { step: "5", title: "Start selling", description: "Publish your store and watch orders land in your dashboard." },
];

export default function MarketingHomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            Now with an AI store builder
          </div>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
            Build. Sell. Grow.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Everything you need to build, manage and scale your online business —
            powered by intelligent automation.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
              Start for free <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="#features" />}>
              Explore platform
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-24">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="size-2.5 rounded-full bg-destructive/40" />
              <span className="size-2.5 rounded-full bg-yellow-500/40" />
              <span className="size-2.5 rounded-full bg-green-500/40" />
              <span className="ms-3 text-xs text-muted-foreground">kodea-store.platform.com/dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6 sm:grid-cols-4">
              {[
                { label: "Revenue (30d)", value: "$48,210" },
                { label: "Orders", value: "1,284" },
                { label: "Conversion", value: "3.8%" },
                { label: "Customers", value: "9,402" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                </div>
              ))}
              <div className="col-span-3 h-40 rounded-xl border border-border/60 bg-gradient-to-t from-foreground/5 to-transparent sm:col-span-4" />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-border/60 bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything your business needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              One platform instead of a dozen disconnected tools.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-6">
                <feature.icon className="size-5 text-foreground" />
                <h3 className="mt-4 font-medium">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">From idea to your first sale, in one afternoon.</p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((item) => (
              <div key={item.step}>
                <div className="flex size-9 items-center justify-center rounded-full border border-border text-sm font-medium">
                  {item.step}
                </div>
                <h3 className="mt-4 font-medium">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-border/60">
        <PricingSection />
      </div>

      <section className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to build your store?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join Kodéa Store and launch a professional online store today.
          </p>
          <Button size="lg" className="mt-8" nativeButton={false} render={<Link href="/register" />}>
            Start for free <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </>
  );
}
