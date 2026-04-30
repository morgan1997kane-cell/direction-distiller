import type { DirectionResult } from "@/lib/types";
import { ensureBilingualPromptPackage } from "@/lib/promptPackage";

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function formatPromptMarkdown(result: DirectionResult) {
  const promptPackage = ensureBilingualPromptPackage(result.prompt_package);

  return [
    "# Prompt 草稿",
    "",
    "## 中文版",
    "",
    "### 主 Prompt",
    promptPackage.zh.main_prompt,
    "",
    "### 变体 Prompt",
    list(promptPackage.zh.variation_prompts),
    "",
    "### Negative Constraints",
    list(promptPackage.zh.negative_constraints),
    "",
    "## English Version",
    "",
    "### Main Prompt",
    promptPackage.en.main_prompt,
    "",
    "### Variation Prompts",
    list(promptPackage.en.variation_prompts),
    "",
    "### Negative Constraints",
    list(promptPackage.en.negative_constraints),
  ].join("\n");
}

export function formatDirectionMarkdown(result: DirectionResult) {
  return [
    `# ${result.recommended_direction.title}`,
    "",
    `项目类型：${result.project_type}`,
    `输出目标：${result.output_goal}`,
    "",
    "## 推荐方向",
    result.recommended_direction.core_sentence,
    "",
    result.recommended_direction.reason,
    "",
    "## 三个候选方向",
    ...result.candidate_directions.flatMap((candidate) => [
      "",
      `### ${candidate.type} · ${candidate.title}`,
      candidate.one_line_concept,
      `视觉关键词：${candidate.visual_keywords.join("、")}`,
      `情绪关键词：${candidate.mood_keywords.join("、")}`,
      `优势：${candidate.strength}`,
      `风险：${candidate.risk}`,
    ]),
    "",
    "## 视觉方向包",
    `核心概念：${result.direction_package.core_concept}`,
    "",
    `情绪关键词：${result.direction_package.mood.join("、")}`,
    `材质关键词：${result.direction_package.material.join("、")}`,
    `光线关键词：${result.direction_package.lighting.join("、")}`,
    `构图/镜头关键词：${result.direction_package.composition.join("、")}`,
    `色调关键词：${result.direction_package.color_palette.join("、")}`,
    "",
    "禁止项 / 避免跑偏：",
    list(result.direction_package.do_not),
    "",
    "## 提案文案",
    `短 pitch：${result.proposal_copy.short_pitch}`,
    "",
    `客户可读描述：${result.proposal_copy.client_facing_description}`,
    "",
    `内部执行备注：${result.proposal_copy.internal_direction_note}`,
    "",
    formatPromptMarkdown(result),
    "",
    "## 下一步执行建议",
    `建议第一步：${result.execution_advice.first_step}`,
    "",
    `推荐工作流：${result.execution_advice.recommended_workflow}`,
    "",
    `风险提醒：${result.execution_advice.risk_warning}`,
  ].join("\n");
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
