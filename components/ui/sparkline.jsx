"use client";

import React from "react";

export default function Sparkline({
  data = [],
  color = "#16a34a",
  height = 20,
  width = 80,
}) {
  if (!data || data.length === 0) {
    return <div style={{ height, width }} />;
  }

  // Find min and max values for scaling
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data) || 1; // Prevent division by zero

  // Calculate the path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / (maxValue - minValue)) * height;
    return `${x},${y}`;
  });

  const path = `M${points.join(" L")}`;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
