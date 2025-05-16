"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    // Handle internal state while also respecting external state
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
      setIsChecked(checked || false);
    }, [checked]);

    const handleToggle = () => {
      const newValue = !isChecked;
      setIsChecked(newValue);
      if (onCheckedChange) {
        onCheckedChange(newValue);
      }
    };

    return (
      <label
        className={cn(
          "relative inline-flex items-center cursor-pointer",
          className
        )}
        ref={ref}
      >
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={handleToggle}
          {...props}
        />{" "}
        <div
          className={`
          group peer bg-white rounded-full duration-300 
          w-8 h-4 sm:w-10 sm:h-5 md:w-12 md:h-6 lg:w-14 lg:h-6
          ring-2 ${isChecked ? "ring-green-500" : "ring-red-500"} 
          after:duration-300 
          ${isChecked ? "after:bg-green-500" : "after:bg-red-500"} 
          after:rounded-full after:absolute 
          after:h-3 after:w-3 sm:after:h-4 sm:after:w-4 md:after:h-4.5 md:after:w-4.5 lg:after:h-5 lg:after:w-5
          after:top-0.5 after:left-0.5 
          after:flex after:justify-center after:items-center 
          ${
            isChecked
              ? "after:translate-x-4 sm:after:translate-x-5 md:after:translate-x-6 lg:after:translate-x-7"
              : ""
          } 
          peer-hover:after:scale-95
        `}
        ></div>
      </label>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
