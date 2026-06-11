import Skeleton from '../Skeleton';

const ModuleDetailSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    {/* Header / Hero Section Skeleton */}
    <div className="relative rounded-[2.5rem] overflow-hidden bg-[var(--bg-color)]/90 border border-[var(--card-border)] h-[300px]">
      <div className="relative z-10 h-full p-8 md:p-12 flex flex-col justify-end">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-14 w-48 rounded-xl" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lessons List Skeleton */}
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>

      {/* Sidebar Skeleton */}
      <div className="space-y-8">
        <div className="card bg-[var(--bg-color)]/90 p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="card bg-[var(--bg-color)]/90 p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ModuleDetailSkeleton;
