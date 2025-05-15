"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Different skeleton types for different visualization components
const SKELETON_TYPES = {
  CHART: "chart",
  TABLE: "table",
  METRICS: "metrics",
  CARDS: "cards",
  DONUT: "donut",
  CUSTOM: "custom",
};

export default function DashboardSkeleton({
  type = SKELETON_TYPES.CHART,
  height = "100%",
  className = "",
  rows = 5,
  metrics = 3,
  cards = 3,
  customContent = null,
}) {
  // Chart skeleton (good for line and bar charts)
  if (type === SKELETON_TYPES.CHART) {
    return (
      <div
        className={`w-full flex flex-col gap-4 ${className}`}
        style={{ height }}
      >
        <div className="flex gap-4">
          {Array(metrics)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-20 flex-1" />
            ))}
        </div>
        <Skeleton className="h-[calc(100%-80px)] w-full" />
      </div>
    );
  }

  // Table skeleton
  if (type === SKELETON_TYPES.TABLE) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-3">
          {Array(rows)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
        </div>
      </div>
    );
  }

  // Metrics skeleton (for summary cards)
  if (type === SKELETON_TYPES.METRICS) {
    return (
      <div
        className={`grid grid-cols-${metrics} gap-4 ${className}`}
        style={{ height }}
      >
        {Array(metrics)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
      </div>
    );
  }

  // Cards skeleton
  if (type === SKELETON_TYPES.CARDS) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(
          cards,
          4
        )} gap-4 ${className}`}
        style={{ height }}
      >
        {Array(cards)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-8 w-full mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5 mt-2" />
            </div>
          ))}
      </div>
    );
  }

  // Donut chart skeleton
  if (type === SKELETON_TYPES.DONUT) {
    return (
      <div
        className={`flex flex-col md:flex-row gap-6 ${className}`}
        style={{ height }}
      >
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <Skeleton className="w-full h-64 rounded-full" />
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // Custom skeleton
  if (type === SKELETON_TYPES.CUSTOM && customContent) {
    return (
      <div className={className} style={{ height }}>
        {customContent}
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}

// Export skeleton types for reference
export { SKELETON_TYPES };
