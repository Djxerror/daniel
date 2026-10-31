export function Meter({
  value,
  max = 100,
  tone = "brass",
}: {
  value: number;
  max?: number;
  tone?: "brass" | "ember";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className={tone === "ember" ? "h-full rounded-full bg-ember" : "h-full rounded-full bg-brass"}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
