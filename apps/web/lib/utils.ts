import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the relative luminance of a color
 * Returns a value between 0 (darkest) and 1 (lightest)
 */
function getLuminance(hex: string): number {
  // Remove # if present
  const color = hex.replace(/^#/, '');
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;
  
  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Adjusts color brightness by a percentage
 */
function adjustBrightness(hex: string, percent: number): string {
  const color = hex.replace(/^#/, '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  const newR = Math.min(255, Math.max(0, Math.round(r + (255 - r) * percent)));
  const newG = Math.min(255, Math.max(0, Math.round(g + (255 - g) * percent)));
  const newB = Math.min(255, Math.max(0, Math.round(b + (255 - b) * percent)));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Generates adaptive UI colors based on the canvas background color
 * Returns colors for toolbar, sidebar backgrounds and text that contrast well
 */
export function getAdaptiveColors(canvasBgColor: string): {
  toolbarBg: string;
  sidebarBg: string;
  textColor: string;
  borderColor: string;
} {
  const luminance = getLuminance(canvasBgColor);
  const isLight = luminance > 0.5;
  
  if (isLight) {
    // For light backgrounds: use semi-transparent white with slight tint
    return {
      toolbarBg: 'rgba(255, 255, 255, 0.90)',
      sidebarBg: adjustBrightness(canvasBgColor, 0.15), // Slightly lighter
      textColor: '#1f2937', // Dark gray text
      borderColor: 'rgba(0, 0, 0, 0.1)',
    };
  } else {
    // For dark backgrounds: use lighter, more opaque colors
    return {
      toolbarBg: 'rgba(255, 255, 255, 0.95)',
      sidebarBg: adjustBrightness(canvasBgColor, 0.3), // Much lighter
      textColor: '#111827', // Near black text
      borderColor: 'rgba(255, 255, 255, 0.2)',
    };
  }
}
