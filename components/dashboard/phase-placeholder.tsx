import type { LucideIcon } from "lucide-react";

export function PhasePlaceholder({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <h1 className="mt-4 text-lg font-medium">{title}</h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      <p className="mt-4 text-xs text-muted-foreground">Ships in {phase} — see docs/ROADMAP.md.</p>
    </div>
  );
}
