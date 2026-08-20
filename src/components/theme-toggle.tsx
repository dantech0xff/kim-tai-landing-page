"use client";

import { useSyncExternalStore } from "react";

import { AppIcon } from "@/components/app-icon";

interface ThemeToggleProps {
  darkLabel: string;
  lightLabel: string;
}

const storageKey = "kim-tai-theme";
const themeEvent = "kim-tai-theme-change";

const getStoredTheme = (): "dark" | "light" | null => {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
};

const applyPreference = () => {
  // Chế độ tối là mặc định của bộ nhận diện; chỉ lựa chọn "light" mới đảo bảng màu.
  const isDark = getStoredTheme() !== "light";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

const subscribe = (onStoreChange: () => void) => {
  const applyStoredTheme = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      applyPreference();
      onStoreChange();
    }
  };

  window.addEventListener(themeEvent, onStoreChange);
  window.addEventListener("storage", applyStoredTheme);

  return () => {
    window.removeEventListener(themeEvent, onStoreChange);
    window.removeEventListener("storage", applyStoredTheme);
  };
};

const getThemeSnapshot = () => document.documentElement.classList.contains("dark");
const getServerThemeSnapshot = () => true;

export function ThemeToggle({ darkLabel, lightLabel }: ThemeToggleProps) {
  const isDark = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    document.documentElement.style.colorScheme = nextIsDark ? "dark" : "light";
    try {
      localStorage.setItem(storageKey, nextIsDark ? "dark" : "light");
    } catch {
      // The visual control must stay usable when storage is blocked.
    }
    window.dispatchEvent(new Event(themeEvent));
  };

  const label = isDark ? lightLabel : darkLabel;

  return (
    <button
      aria-label={label}
      aria-pressed={isDark}
      className="control-button"
      onClick={toggleTheme}
      title={label}
      type="button"
    >
      <AppIcon name={isDark ? "sun" : "moon"} size={20} />
    </button>
  );
}
