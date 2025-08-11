import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative h-9 w-9 rounded-md border border-border/50 bg-background/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all duration-200"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 text-foreground rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 text-foreground rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
