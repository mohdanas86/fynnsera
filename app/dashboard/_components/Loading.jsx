"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
    </div>
  );
}
