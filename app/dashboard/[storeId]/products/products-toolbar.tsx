"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"];
const SORTS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name A–Z" },
];

export function ProductsToolbar({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        defaultValue={searchParams.get("search") ?? ""}
        placeholder="Search products or SKU…"
        className="w-56"
        onKeyDown={(event) => {
          if (event.key === "Enter") setParam("search", event.currentTarget.value);
        }}
      />
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(event) => setParam("status", event.target.value)}
        className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(event) => setParam("category", event.target.value)}
        className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("sort") ?? "newest"}
        onChange={(event) => setParam("sort", event.target.value)}
        className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
