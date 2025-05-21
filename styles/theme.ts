import { Platform } from "react-native";

// App-wide theme colors
export const colors = {
  background: "#18181b", // dark zinc-900
  card: "#27272a", // dark zinc-800
  text: "#f4f4f5", // zinc-100
  textSecondary: "#a1a1aa", // zinc-400
  border: "#3f3f46", // zinc-700
  green: "#10b981", // emerald-500
  greenLight: "#059669", // emerald-600
  purple: "#a855f7", // purple-500
  red: "#f43f5e", // rose-500
};

// Font family based on platform
export const getFontFamily = () => {
  return Platform.OS === "ios" ? "Menlo" : "monospace";
};

// Function to get color based on percentage
export const getColorForPercentage = (percentage: number, invert: boolean = false): string => {
  if (percentage >= 100) return invert ? colors.green : colors.red;
  if (percentage <= 0) return invert ? colors.red : colors.green;

  const clamped = Math.max(0, Math.min(100, percentage));
  const pct = invert ? 100 - clamped : clamped;

  if (pct < 50) {
    const ratio = pct / 50;
    const r = 16 + (234 - 16) * ratio;  // green to yellow
    const g = 185 - (185 - 179) * ratio;
    const b = 129 - (129 - 8) * ratio;
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  } else {
    const ratio = (pct - 50) / 50;
    const r = 234 + (244 - 234) * ratio; // yellow to red
    const g = 179 - (179 - 63) * ratio;
    const b = 8 + (94 - 8) * ratio;
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }
};