/**
 * theme_toggle.tsx
 * Botón conmutador para alternar el tema visual de la plataforma entre modo claro y modo oscuro.
 */
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/class_names";

/**
 * Renderiza el botón accesible para cambiar el esquema de color activo en `next-themes`.
 *
 * @param props.className - Clases CSS opcionales para ajustar contraste según el encabezado.
 * @returns Botón de icono que alterna entre `"dark"` y `"light"`.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const toggle_color_theme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle_color_theme}
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={cn("text-blue-200/80 hover:bg-white/10 hover:text-white", className)}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}
