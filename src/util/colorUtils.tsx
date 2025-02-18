import React from 'react';

const COLORS = [
  "#e6194B",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#42d4f4",
  "#f032e6",
  "#fabed4",
  "#469990",
  "#dcbeff",
  "#9A6324",
  "#800000",
  "#aaffc3",
  "#000075",
  "#000000",
];

export const randomColor = (i: number) => {
  return COLORS[i % COLORS.length];
};

export const GlowFilter = () => {
  return (
    <svg style={{ position: 'absolute', height: 0 }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};
