import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>
      </div>

      {!token || !email ? (
        <p className="text-sm text-destructive">
          This reset link is missing required information. Request a new one from the
          forgot-password page.
        </p>
      ) : (
        <ResetPasswordForm token={token} email={email} />
      )}
    </div>
  );
}
