import React from 'react';

export function ProductSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-stone-200/80 overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-stone-200/70" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-28 bg-stone-200 rounded" />
              <div className="h-3 w-10 bg-stone-200 rounded" />
            </div>
            <div className="h-5 w-3/4 bg-stone-200 rounded" />
            <div className="h-3 w-1/2 bg-stone-200 rounded" />
            <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
              <div className="h-4 w-16 bg-stone-200 rounded" />
              <div className="h-3 w-14 bg-stone-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
