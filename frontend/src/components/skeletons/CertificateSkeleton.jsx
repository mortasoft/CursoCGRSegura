import React from 'react';
import Skeleton from '../Skeleton';

export const CertificateSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#161b33] p-8 flex flex-col items-center animate-fade-in">
            <div className="w-full max-w-5xl flex justify-between items-center mb-8">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-48 rounded-xl" />
            </div>
            <div className="w-full max-w-5xl aspect-[1.414/1] card p-0 border-none shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 p-16 flex flex-col items-center justify-between">
                    <Skeleton className="h-20 w-48" />
                    <div className="space-y-6 w-full flex flex-col items-center">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-16 w-3/4" />
                        <Skeleton className="h-10 w-1/2" />
                    </div>
                    <div className="flex justify-between w-full">
                        <Skeleton className="h-24 w-40" />
                        <Skeleton className="h-24 w-24 rounded-none" />
                        <Skeleton className="h-24 w-40" />
                    </div>
                </div>
            </div>
        </div>
    );
};
