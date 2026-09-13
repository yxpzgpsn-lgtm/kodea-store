"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createStoreAction } from "./actions";

const CATEGORIES = ["Fashion & Apparel", "Electronics", "Home & Furniture", "Beauty", "Food & Beverage", "Other"];
const BUSINESS_TYPES = ["Individual", "Registered company", "Non-profit"];
const COUNTRIES = ["United States", "United Kingdom", "France", "Algeria", "Saudi Arabia", "United Arab Emirates"];
const CURRENCIES = ["USD", "EUR", "GBP", "DZD", "SAR", "AED"];
const LOCALES: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];
const STYLES = [
  { value: "minimal", label: "Minimal", swatch: "#111111" },
  { value: "bold", label: "Bold", swatch: "#dc2626" },
  { value: "playful", label: "Playful", swatch: "#7c3aed" },
  { value: "classic", label: "Classic", swatch: "#065f46" },
];

const STEPS = ["Store details", "Location & language", "Design"] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [error, formAction, isPending] = useActionState(createStoreAction, undefined);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [locale, setLocale] = useState("");
  const [stylePreference, setStylePreference] = useState("");

  const canAdvanceFromStep0 = name.trim().length >= 2 && category && businessType;
  const canAdvanceFromStep1 = country && currency && locale;

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                index <= step
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground",
              )}
            >
              {index + 1}
            </div>
            <span className={cn("text-xs", index === step ? "text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {index < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <form action={formAction} className="space-y-6 rounded-2xl border border-border bg-card p-8">
        {/* Hidden fields carry state across steps into a single final submit. */}
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="businessType" value={businessType} />
        <input type="hidden" name="country" value={country} />
        <input type="hidden" name="currency" value={currency} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="stylePreference" value={stylePreference} />

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="store-name">Store name</Label>
              <Input
                id="store-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="NOVA"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Business category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Business type</Label>
              <Select value={businessType} onValueChange={(value) => setBusinessType(value ?? "")}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a business type" /></SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Select value={country} onValueChange={(value) => setCountry(value ?? "")}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a country" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(value) => setCurrency(value ?? "")}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a currency" /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={locale} onValueChange={(value) => setLocale(value ?? "")}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a language" /></SelectTrigger>
                <SelectContent>
                  {LOCALES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-1.5">
            <Label>Store design preference</Label>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStylePreference(s.value)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-3 text-start text-sm",
                    stylePreference === s.value ? "border-foreground" : "border-border",
                  )}
                >
                  <span className="size-5 rounded-full" style={{ backgroundColor: s.swatch }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              disabled={(step === 0 && !canAdvanceFromStep0) || (step === 1 && !canAdvanceFromStep1)}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={!stylePreference || isPending}>
              {isPending ? "Creating store…" : "Create store"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
