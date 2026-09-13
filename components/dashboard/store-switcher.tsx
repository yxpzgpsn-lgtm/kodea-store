"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoreOption {
  id: string;
  name: string;
}

export function StoreSwitcher({
  stores,
  activeStoreId,
}: {
  stores: StoreOption[];
  activeStoreId: string;
}) {
  const router = useRouter();
  const activeStore = stores.find((s) => s.id === activeStoreId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium">
        {activeStore?.name ?? "Select store"}
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {stores.map((store) => (
          <DropdownMenuItem
            key={store.id}
            onClick={() => router.push(`/dashboard/${store.id}`)}
          >
            {store.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
