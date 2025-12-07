"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm"></div>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border backdrop-blur-sm transition-all duration-200
        border-slate-200 bg-white/50 hover:bg-white/80 text-slate-500 hover:text-brikx-600
        dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
