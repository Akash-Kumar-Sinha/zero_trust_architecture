import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";

export function ModeToggle() {
  const { setTheme,theme } = useTheme();

return (
  <>
    {theme === "dark" ? (
      <div onClick={() => setTheme("light")}>
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      </div>
    ) : (
      <div onClick={() => setTheme("dark")}>
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </div>
    )}
  </>
);
}
