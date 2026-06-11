import Skeleton from '../Skeleton';
import { ModuleCardSkeleton, DashboardHeroSkeleton } from '../skeletons/DashboardSkeletons';

export default function DashboardLoading() {
    return (
        <div className="space-y-6 md:space-y-8 animate-pulse pt-4">
            {/* Banner Skeleton - Infrastructure Layer */}
            <DashboardHeroSkeleton />
            
            {/* Navigation & Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center px-4 md:px-0">
                <div className="lg:col-span-3">
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-14 w-full md:w-1/3 rounded-[1.5rem] bg-slate-200/70" />
                        <Skeleton className="h-4 w-48 rounded-full bg-slate-200/60 opacity-80 ml-2" />
                    </div>
                </div>
                <div className="hidden lg:flex gap-6 justify-end">
                    <Skeleton className="h-24 w-36 rounded-[2rem] bg-slate-200/70" />
                    <Skeleton className="h-24 w-36 rounded-[2rem] bg-slate-200/70" />
                </div>
            </div>

            {/* Core Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="card bg-[var(--bg-color)]/90 shadow-lg p-10 rounded-[3rem] border border-[var(--card-border)]">
                        <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-6">
                                <Skeleton className="w-16 h-16 rounded-2xl bg-slate-200/70 opacity-90" />
                                <div className="space-y-3">
                                    <Skeleton className="h-8 w-64 rounded-xl bg-slate-200/70" />
                                    <Skeleton className="h-4 w-40 rounded-lg bg-slate-200/70 opacity-90" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-48 rounded-xl bg-slate-200/70" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ModuleCardSkeleton />
                            <ModuleCardSkeleton />
                            <ModuleCardSkeleton />
                        </div>
                    </div>
                </div>
                
                {/* Lateral Profile Skeleton */}
                <div className="space-y-8">
                    <div className="bg-[var(--bg-color)]/90 border border-[var(--card-border)] h-[600px] w-full rounded-[4rem] shadow-lg p-10 flex flex-col items-center">
                        <Skeleton className="w-48 h-48 rounded-[3.5rem] mb-8 bg-slate-200/70" />
                        <Skeleton className="h-8 w-48 rounded-xl mb-3 bg-slate-200/70" />
                        <Skeleton className="h-4 w-32 rounded-lg bg-slate-200/70 opacity-90 mb-10" />
                        <div className="w-full grid grid-cols-2 gap-4">
                            <Skeleton className="h-28 rounded-[2rem] bg-slate-200/70" />
                            <Skeleton className="h-28 rounded-[2rem] bg-slate-200/70" />
                        </div>
                        <Skeleton className="mt-auto h-16 w-full rounded-[2.5rem] bg-slate-200/70" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-32 rounded-[2.5rem] bg-slate-200/70" />
                        <Skeleton className="h-32 rounded-[2.5rem] bg-slate-200/70" />
                    </div>
                </div>
            </div>
        </div>
    );
}
