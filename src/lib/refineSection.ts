import type { AIProvider } from "@/lib/aiProvider";
import type { DirectionInput, DirectionResult } from "@/lib/types";

export type RefineSectionType =
  | "candidate_direction"
  | "recommended_direction"
  | "direction_package"
  | "proposal_copy"
  | "prompt_package"
  | "execution_advice";

export interface RefineSectionRequest {
  sectionType: RefineSectionType;
  currentResult: DirectionResult;
  brief: DirectionInput;
  provider: AIProvider;
  model: string;
  optionalInstruction?: string;
  candidateId?: string;
}

export async function refineSection(input: RefineSectionRequest) {
  const response = await fetch("/api/refine-section", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({}))) as { section?: unknown; error?: string };

  if (!response.ok) {
    throw new Error(payload.error || `Section refinement failed with ${response.status}`);
  }

  if (payload.section === undefined) {
    throw new Error("Section refinement returned no section payload");
  }

  return payload.section;
}
