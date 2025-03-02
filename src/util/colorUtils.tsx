import React from "react";

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

export const convertHexStringToRGBArray = (
  color: string
): [number, number, number] => {
  const { r, g, b } = parseColor(color);
  return [r, g, b];
};

export const multiRGBArray = (
  color: [number, number, number],
  multiplier: number
): [number, number, number] => {
  return [color[0] * multiplier, color[1] * multiplier, color[2] * multiplier];
};

export const lerpColorToRGBArray = (
  startColor: string,
  endColor: string,
  t: number
): [number, number, number] => {
  const c1 = parseColor(startColor);
  const c2 = parseColor(endColor);

  // Clamp t
  t = Math.max(0, Math.min(1, t));

  const r = lerp(c1.r, c2.r, t);
  const g = lerp(c1.g, c2.g, t);
  const b = lerp(c1.b, c2.b, t);

  return [r, g, b];
};

export const lerpColor = (startColor: string, endColor: string, t: number) => {
  const c1 = parseColor(startColor);
  const c2 = parseColor(endColor);

  const r = lerp(c1.r, c2.r, t);
  const g = lerp(c1.g, c2.g, t);
  const b = lerp(c1.b, c2.b, t);

  return `rgb(${r}, ${g}, ${b})`;
};

function parseColor(color: string) {
  const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;

  let result = hexRegex.exec(color);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  result = rgbRegex.exec(color);
  if (result) {
    return {
      r: parseInt(result[1]),
      g: parseInt(result[2]),
      b: parseInt(result[3]),
    };
  }

  throw new Error("Invalid color format. Use hex (#RRGGBB) or rgb(r, g, b).");
}

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}
