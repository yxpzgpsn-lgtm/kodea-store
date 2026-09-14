"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

export function InventoryToolbar({
  locations,
}: {
  locations: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
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
        defaultValue={searchParams.get("location") ?? ""}
        onChange={(event) => setParam("location", event.target.value)}
        className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
      >
        <option value="">All locations</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          defaultChecked={searchParams.get("lowStock") === "1"}
          onChange={(event) => setParam("lowStock", event.target.checked ? "1" : "")}
        />
        Low stock only
      </label>
    </div>
  );
}
