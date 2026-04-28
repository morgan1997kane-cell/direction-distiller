import type { SavedDirectionResult } from "@/lib/types";

const STORAGE_KEY = "direction-distiller-history";

export function getSavedResults(): SavedDirectionResult[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedDirectionResult[]) : [];
  } catch {
    return [];
  }
}

export function setSavedResults(results: SavedDirectionResult[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export function saveDirectionResult(item: SavedDirectionResult) {
  const existing = getSavedResults().filter((saved) => saved.id !== item.id);
  const next = [item, ...existing].slice(0, 30);
  setSavedResults(next);
  return next;
}

export function deleteSavedResult(id: string) {
  const next = getSavedResults().filter((item) => item.id !== id);
  setSavedResults(next);
  return next;
}

export function clearSavedResults() {
  setSavedResults([]);
}
