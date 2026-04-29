export function extractJsonFromText(text: string): string {
  const trimmed = text.trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (codeBlockMatch?.[1] ?? trimmed).trim();

  if (candidate.startsWith("{") && candidate.endsWith("}")) {
    return candidate;
  }

  const start = candidate.indexOf("{");
  if (start === -1) {
    throw new Error("No JSON object start found");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < candidate.length; index += 1) {
    const char = candidate[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return candidate.slice(start, index + 1);
    }
  }

  throw new Error("No complete JSON object found");
}

export function parseJsonFromText(text: string): unknown {
  return JSON.parse(extractJsonFromText(text)) as unknown;
}
