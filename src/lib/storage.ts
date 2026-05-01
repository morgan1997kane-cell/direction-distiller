import type { CurrentDraft, CurrentDraftInputState, DirectionInput, DirectionResult, SavedDirectionResult } from "@/lib/types";

const STORAGE_KEY = "direction-distiller-history";
const CURRENT_DRAFT_KEY = "direction-distiller-current-draft";

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
