import { Platform } from 'react-native';

// App-wide theme colors
export const colors = {
  background: '#18181b', // dark zinc-900
  card: '#27272a',      // dark zinc-800
  text: '#f4f4f5',      // zinc-100
  textSecondary: '#a1a1aa', // zinc-400
  border: '#3f3f46',    // zinc-700
  green: '#10b981',     // emerald-500
  greenLight: '#059669', // emerald-600
  purple: '#a855f7',    // purple-500
  red: '#f43f5e',       // rose-500
};

// Font family based on platform
export const getFontFamily = () => {
  return Platform.OS === 'ios' ? 'Menlo' : 'monospace';
};

// Function to get color based on percentage
export const getColorForPercentage = (percentage: number): string => {
  // Green (0%) to Yellow (50%) to Red (100%)
  if (percentage <= 0) return colors.green; // Emerald-500 for 0%
  if (percentage >= 100) return colors.red; // Rose-500 for 100%
  
  if (percentage < 50) {
    // Green to Yellow gradient (0-50%)
    const ratio = percentage / 50;
    // Interpolate between green and yellow
    const r = 16 + (234 - 16) * ratio;   // from 16 (green) to 234 (yellow)
    const g = 185 - (185 - 179) * ratio; // from 185 (green) to 179 (yellow)
    const b = 129 - (129 - 8) * ratio;   // from 129 (green) to 8 (yellow)
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  } else {
    // Yellow to Red gradient (50-100%)
    const ratio = (percentage - 50) / 50;
    // Interpolate between yellow and red
    const r = 234 + (244 - 234) * ratio; // from 234 (yellow) to 244 (red)
    const g = 179 - (179 - 63) * ratio;  // from 179 (yellow) to 63 (red)
    const b = 8 + (94 - 8) * ratio;      // from 8 (yellow) to 94 (red)
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }
}; 