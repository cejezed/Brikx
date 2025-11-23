// /components/expert/TipSkeleton.tsx
// ✅ v3.9: Loading skeleton voor ExpertCorner tips

"use client";

import React from "react";

interface TipSkeletonProps {
  count?: number;
}

function SingleSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm animate-pulse">
      <div className="flex items-start gap-2">
        {/* Badge skeleton */}
        <div className="h-5 w-16 rounded-full bg-slate-200" />
        {/* Text skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-3/4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function TipSkeleton({ count = 3 }: TipSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <SingleSkeleton key={index} />
      ))}
    </div>
  );
}
