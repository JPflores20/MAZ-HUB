/**
 * @fileoverview Theme context wrapper delegating light, dark, and system switching to next-themes.
 */

import type React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Wraps the application tree with next-themes provider state. */
export function ThemeProvider({
  children,
  ...provider_props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...provider_props}>{children}</NextThemesProvider>;
}
