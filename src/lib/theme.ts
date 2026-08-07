import type { CSSProperties } from "react";

export function getStoreThemeStyle(settings: {
  lightPrimaryColor: string;
  lightBackgroundColor: string;
  lightTextColor: string;
  darkPrimaryColor: string;
  darkBackgroundColor: string;
  darkTextColor: string;
}) {
  return {
    "--store-light-primary": settings.lightPrimaryColor,
    "--store-light-background": settings.lightBackgroundColor,
    "--store-light-foreground": settings.lightTextColor,
    "--store-dark-primary": settings.darkPrimaryColor,
    "--store-dark-background": settings.darkBackgroundColor,
    "--store-dark-foreground": settings.darkTextColor
  } as CSSProperties;
}