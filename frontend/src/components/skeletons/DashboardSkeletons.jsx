import Skeleton from '../Skeleton';

export const ModuleCardSkeleton = () => (
  <div className="flex flex-col p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-color)]/90 space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <div className="mt-auto space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

export const DashboardHeroSkeleton = () => (
  <div className="relative rounded-[1.5rem] overflow-hidden bg-[var(--bg-color)]/90 border border-[var(--card-border)] h-32 md:h-48">
    <Skeleton className="h-full w-full rounded-none" />
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);
