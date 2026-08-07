import type { CSSProperties } from "react";

export function getStoreThemeStyle(settings: {
  lightPrimaryColor: string;
  lightBackgroundColor: string;
  lightTextColor: string;
}) {
  return {
    "--primary": settings.lightPrimaryColor,
    "--background": settings.lightBackgroundColor,
    "--foreground": settings.lightTextColor,
    "--ring": settings.lightPrimaryColor
  } as CSSProperties;
}