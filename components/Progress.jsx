import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * @param {object} props
 * @param {number} [props.value]        Percentage 0–100
 * @param {number} [props.max]          Max value if you ever want something other than 100
 * @param {string} [props.className]    Tailwind classes for outer track
 * @param {string} [props.indicatorClassName] Tailwind classes for inner bar
 * @param {object} [props.style]        Any other DOM props (e.g. id, onClick)
 */
const Progress = forwardRef(function Progress(
  { className = "", indicatorClassName = "", value = 0, max = 100, ...props },
  ref
) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props} // note: indicatorClassName is not spread here
    >
      <div
        className={cn("h-full bg-blue-600", indicatorClassName)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
});

Progress.displayName = "Progress";
export default Progress;
