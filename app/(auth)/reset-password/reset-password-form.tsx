"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "./actions";

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [result, formAction, isPending] = useActionState(resetPasswordAction, undefined);

  if (result === "reset") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Your password has been reset. You can now sign in.
        </p>
        <Button className="w-full" nativeButton={false} render={<Link href="/login" />}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />

      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {result && <p className="text-sm text-destructive">{result}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
