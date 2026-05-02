import type { CurrentDraft, CurrentDraftInputState, DirectionInput, DirectionResult, SavedDirectionResult } from "@/lib/types";

const STORAGE_KEY = "direction-distiller-history";
const CURRENT_DRAFT_KEY = "direction-distiller-current-draft";

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function defaultArchiveTitle(result: DirectionResult, input: DirectionInput) {
  const recommendedTitle = text(result.recommended_direction?.title);
  if (recommendedTitle) return recommendedTitle;

  const briefTitle = input.brief.trim().slice(0, 20);
  if (briefTitle) return briefTitle;

  const date = new Date().toLocaleDateString("zh-CN");
  if (input.projectType) return `${input.projectType} ${date}`;

  return "Untitled Direction";
}

function normalizeArchiveItem(value: unknown): SavedDirectionResult | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;

  const item = value as Partial<SavedDirectionResult>;
  if (!item.result || !item.input) return null;

  const now = new Date().toISOString();
  const createdAt = text(item.createdAt, text(item.savedAt, text(item.result.createdAt, now)));
  const updatedAt = text(item.updatedAt, text(item.savedAt, createdAt));
  const title = text(item.title, defaultArchiveTitle(item.result, item.input));

  return {
    id: text(item.id, `archive-${Date.now()}`),
    title,
    brief: text(item.brief, item.input.brief),
    projectType: item.projectType ?? item.input.projectType,
    outputGoal: item.outputGoal ?? item.input.outputGoal,
    styleTags: item.styleTags ?? item.input.styleTags,
    provider: item.provider ?? item.result.ai_provider,
    model: item.model ?? item.result.ai_model,
    aiMode: item.aiMode ?? item.result.ai_mode ?? "demo",
    recommendedTitle: text(item.recommendedTitle, item.result.recommended_direction.title),
    input: item.input,
    result: item.result,
    createdAt,
    updatedAt,
    savedAt: item.savedAt ?? updatedAt,
    favorite: Boolean(item.favorite),
    exportedAt: item.exportedAt,
  };
}

export function createArchiveItem(result: DirectionResult, input: DirectionInput, existing?: SavedDirectionResult | null) {
  const now = new Date().toISOString();
  const id = existing?.id ?? `archive-${Date.now()}`;

  return normalizeArchiveItem({
    id,
    title: existing?.title ?? defaultArchiveTitle(result, input),
    brief: input.brief,
    projectType: input.projectType,
    outputGoal: input.outputGoal,
    styleTags: input.styleTags,
    provider: result.ai_provider,
    model: result.ai_model,
    aiMode: result.ai_mode ?? "demo",
    recommendedTitle: result.recommended_direction.title,
    input,
    result,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    savedAt: now,
    favorite: existing?.favorite ?? false,
    exportedAt: existing?.exportedAt,
  }) as SavedDirectionResult;
}

export function loadArchiveItems(): SavedDirectionResult[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    const items = parsed.map(normalizeArchiveItem).filter((item): item is SavedDirectionResult => Boolean(item));
    return items.sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export function setArchiveItems(results: SavedDirectionResult[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export function saveArchiveItem(item: SavedDirectionResult) {
  const normalized = normalizeArchiveItem(item);
  if (!normalized) return loadArchiveItems();

  const existing = loadArchiveItems().filter((saved) => saved.id !== normalized.id);
  const next = [normalized, ...existing].slice(0, 50);
  setArchiveItems(next);
  return next;
}

export function updateArchiveItem(id: string, patch: Partial<SavedDirectionResult>) {
  const next = loadArchiveItems().map((item) =>
    item.id === id ? ({ ...item, ...patch, updatedAt: new Date().toISOString() } as SavedDirectionResult) : item,
  );
  setArchiveItems(next);
  return next;
}

export function renameArchiveItem(id: string, title: string) {
  return updateArchiveItem(id, { title: title.trim() || "Untitled Direction" });
}

export function toggleArchiveFavorite(id: string) {
  const item = loadArchiveItems().find((archiveItem) => archiveItem.id === id);
  return updateArchiveItem(id, { favorite: !item?.favorite });
}

export function deleteArchiveItem(id: string) {
  const next = loadArchiveItems().filter((item) => item.id !== id);
  setArchiveItems(next);
  return next;
}

export function clearArchiveItems() {
  setArchiveItems([]);
}

export const getSavedResults = loadArchiveItems;
export const setSavedResults = setArchiveItems;
export const saveDirectionResult = saveArchiveItem;
export const deleteSavedResult = deleteArchiveItem;
export const clearSavedResults = clearArchiveItems;

function sanitizeInputState(input: DirectionInput): CurrentDraftInputState {
  return {
    brief: input.brief,
    projectType: input.projectType,
    outputGoal: input.outputGoal,
    styleTags: input.styleTags,
    referenceImages: input.referenceImages.map((image) => ({
      id: image.id,
      fileName: image.fileName,
      type: image.type,
      size: image.size,
      previewUrl: "",
    })),
  };
}

export function saveCurrentDraft(draft: CurrentDraft) {
  if (typeof window === "undefined") return draft;
  window.localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

export function loadCurrentDraft(): CurrentDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CURRENT_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as CurrentDraft;
    return draft?.type === "current_draft" && draft.result ? draft : null;
  } catch {
    window.localStorage.removeItem(CURRENT_DRAFT_KEY);
    return null;
  }
}

export function clearCurrentDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CURRENT_DRAFT_KEY);
}

export function saveAutosaveSnapshot(
  result: DirectionResult,
  input: DirectionInput,
  metadata?: { fallbackReason?: string },
) {
  const existing = loadCurrentDraft();
  const now = new Date().toISOString();
  const draft: CurrentDraft = {
    id: existing?.id ?? `draft-${Date.now()}`,
    type: "current_draft",
    result,
    inputState: sanitizeInputState(input),
    aiMeta: {
      mode: result.ai_mode ?? "demo",
      provider: result.ai_provider,
      model: result.ai_model,
      fallbackReason: metadata?.fallbackReason ?? existing?.aiMeta.fallbackReason,
    },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  return saveCurrentDraft(draft);
}

export function updateCurrentDraftResult(result: DirectionResult, metadata?: { fallbackReason?: string }) {
  const existing = loadCurrentDraft();
  if (!existing) return null;

  return saveCurrentDraft({
    ...existing,
    result,
    aiMeta: {
      ...existing.aiMeta,
      mode: result.ai_mode ?? existing.aiMeta.mode,
      provider: result.ai_provider ?? existing.aiMeta.provider,
      model: result.ai_model ?? existing.aiMeta.model,
      fallbackReason: metadata?.fallbackReason ?? existing.aiMeta.fallbackReason,
    },
    updatedAt: new Date().toISOString(),
  });
}

export function updateCurrentDraftInput(input: DirectionInput) {
  const existing = loadCurrentDraft();
  if (!existing) return null;

  return saveCurrentDraft({
    ...existing,
    inputState: sanitizeInputState(input),
    updatedAt: new Date().toISOString(),
  });
}

export function updateCurrentDraftAiMeta(metadata: { provider?: string; model?: string }) {
  const existing = loadCurrentDraft();
  if (!existing) return null;

  return saveCurrentDraft({
    ...existing,
    aiMeta: {
      ...existing.aiMeta,
      provider: metadata.provider ?? existing.aiMeta.provider,
      model: metadata.model ?? existing.aiMeta.model,
    },
    updatedAt: new Date().toISOString(),
  });
}
