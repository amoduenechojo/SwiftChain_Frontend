/**
 * IndustryHeroSkeleton — loading placeholder that mirrors the final layout
 * (header, stats row, split block) so the page does not jump when data lands.
 */
export function IndustryHeroSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="animate-pulse space-y-16"
    >
      <span className="sr-only">Loading industry solutions…</span>

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
        <div className="h-3 w-40 rounded-full bg-slate-800" />
        <div className="h-10 w-full rounded-2xl bg-slate-800" />
        <div className="h-10 w-3/4 rounded-2xl bg-slate-800" />
        <div className="h-4 w-5/6 rounded-full bg-slate-800/70" />
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-800/70" />
        ))}
      </div>

      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <div className="h-3 w-32 rounded-full bg-slate-800" />
          <div className="h-8 w-2/3 rounded-2xl bg-slate-800" />
          <div className="h-4 w-full rounded-full bg-slate-800/70" />
          <div className="h-4 w-5/6 rounded-full bg-slate-800/70" />
          <div className="h-4 w-4/6 rounded-full bg-slate-800/70" />
        </div>
        <div className="aspect-[4/3] w-full rounded-3xl bg-slate-800/70" />
      </div>
    </div>
  );
}
