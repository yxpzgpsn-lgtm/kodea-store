"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { importProductsAction } from "./actions";

export function ImportForm({ storeId }: { storeId: string }) {
  const [result, formAction, isPending] = useActionState(
    importProductsAction.bind(null, storeId),
    undefined,
  );

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-6">
      <div>
        <label htmlFor="file" className="text-sm font-medium">
          CSV file
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="mt-1.5 block w-full text-sm"
        />
      </div>

      {result?.error && <p className="text-sm text-destructive">{result.error}</p>}

      {result && !result.error && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p>
            Imported <strong>{result.created}</strong> product{result.created === 1 ? "" : "s"}.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-destructive">
              {result.errors.map((e) => (
                <li key={e.row}>
                  Row {e.row}: {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Importing…" : "Import products"}
      </Button>
    </form>
  );
}
