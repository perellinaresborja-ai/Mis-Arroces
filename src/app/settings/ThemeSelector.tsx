"use client"
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Sun, Moon, Check } from "lucide-react";

export function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const options = [
    { value: "system", label: "Sistema", icon: Monitor },
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Oscuro", icon: Moon },
  ];

  return (
    <div className="flex flex-col space-y-2 mt-2 w-full">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              isActive 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-card border-border hover:bg-muted/50 text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span className="font-medium">{option.label}</span>
            </div>
            {isActive && <Check className="w-5 h-5" />}
          </button>
        );
      })}
    </div>
  );
}
