import { projectLanguage, styleLanguage } from "@/data/presets";
import type {
  DirectionCandidate,
  DirectionInput,
  DirectionResult,
  DirectionScores,
  ReferenceImage,
  ReferenceImageSummary,
  StyleTag,
} from "@/lib/types";

const fallbackStyles: StyleTag[] = ["电影感", "高级质感", "未来感"];

function pick<T>(items: T[], seed: number, count = 1): T[] {
  if (items.length === 0) return [];
  const rotated = [...items].sort((a, b) => {
    const left = `${String(a)}-${seed}`;
    const right = `${String(b)}-${seed + 7}`;
    return left.localeCompare(right, "zh-CN") - right.length * 0.001;
  });
  return rotated.slice(0, count);
}

function clampScore(score: number) {
  return Math.max(58, Math.min(98, Math.round(score)));
}

function average(scores: DirectionScores) {
  return (
    scores.clarity +
    scores.visual_control +
    scores.proposal_value +
    scores.execution_feasibility
  ) / 4;
}

function extractBriefKeywords(brief: string) {
  const dictionary = [
    "汽车",
    "性能车",
    "AI",
    "发布会",
    "短片",
    "创作者",
    "屏幕",
    "焦虑",
    "速度",
    "金属",
    "冷色",
    "高反差",
    "品牌",
    "人物",
    "空间",
    "科技",
    "孤独",
    "轻盈",
    "克制",
  ];
  const matched = dictionary.filter((keyword) => brief.includes(keyword));
  if (matched.length > 0) return matched.slice(0, 6);

  return brief
    .replace(/[，。！？、,.!?]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2)
    .slice(0, 6);
}

function summarizeBrief(brief: string, keywords: string[]) {
  if (!brief.trim()) {
    return `用户主要通过参考图建立方向，系统将以${keywords.join("、") || "视觉氛围"}作为首轮方向锚点。`;
  }

  const cleaned = brief.trim().replace(/\s+/g, " ");
  const short = cleaned.length > 82 ? `${cleaned.slice(0, 82)}...` : cleaned;
  return `系统理解为：${short} 核心锚点集中在 ${keywords.join("、") || "气质、画面、执行边界"}。`;
}

function imageTone(fileName: string, index: number) {
  const lower = fileName.toLowerCase();
  if (lower.includes("dark") || lower.includes("black") || lower.includes("night")) return "深色低饱和";
  if (lower.includes("blue") || lower.includes("cold") || lower.includes("ice")) return "冷蓝灰调";
  if (lower.includes("white") || lower.includes("light")) return "明亮清透";
  if (lower.includes("red") || lower.includes("warm")) return "暖色强调";
  return ["冷灰中性色", "低饱和暗调", "干净浅灰", "高反差黑白"][index % 4];
}

function buildReferenceSummary(
  images: ReferenceImage[],
  projectType: DirectionInput["projectType"],
) {
  return images.map<ReferenceImageSummary>((image, index) => ({
    image_id: image.id,
    file_name: image.fileName,
    observed_style:
      image.type === "image/gif"
        ? "动态参考，适合作为节奏与转场情绪样本"
        : `${projectType}参考，适合提取构图、材质与色调线索`,
    color_tone: imageTone(image.fileName, index),
    composition_notes: ["主体居中且边界清晰", "有较强前后景关系", "适合提取局部质感", "可作为光线方向参考"][
      index % 4
    ],
    usable_elements: [
      ["色调关系", "暗部层次", "主体轮廓"],
      ["材质反射", "镜头角度", "空间纵深"],
      ["版式比例", "留白节奏", "视觉重心"],
      ["光线方向", "情绪密度", "细节颗粒"],
    ][index % 4],
  }));
}

function scoreFor(type: DirectionCandidate["type"], goal: DirectionInput["outputGoal"], seed: number): DirectionScores {
  const jitter = (offset: number) => ((seed + offset) % 9) - 4;
  const base =
    type === "稳妥型"
      ? { clarity: 88, visual_control: 84, proposal_value: 86, execution_feasibility: 88 }
      : type === "大胆型"
        ? { clarity: 78, visual_control: 74, proposal_value: 92, execution_feasibility: 72 }
        : { clarity: 82, visual_control: 90, proposal_value: 80, execution_feasibility: 94 };

  const goalBoost =
    goal === "提案方向"
      ? { proposal_value: 5, clarity: 3 }
      : goal === "视觉探索"
        ? { visual_control: 3, proposal_value: 2 }
        : goal === "团队脑暴"
          ? { proposal_value: 3, clarity: -1 }
          : { execution_feasibility: 4, visual_control: 2 };

  return {
    clarity: clampScore(base.clarity + (goalBoost.clarity ?? 0) + jitter(1)),
    visual_control: clampScore(base.visual_control + (goalBoost.visual_control ?? 0) + jitter(2)),
    proposal_value: clampScore(base.proposal_value + (goalBoost.proposal_value ?? 0) + jitter(3)),
    execution_feasibility: clampScore(
      base.execution_feasibility + (goalBoost.execution_feasibility ?? 0) + jitter(4),
    ),
  };
}

export function generateDirectionResult(input: DirectionInput): DirectionResult {
  const seed = Date.now() % 997;
  const activeStyles = input.styleTags.length > 0 ? input.styleTags : fallbackStyles;
  const keywords = extractBriefKeywords(input.brief);
  const project = projectLanguage[input.projectType];
  const styleVisual = activeStyles.flatMap((tag) => styleLanguage[tag].visual);
  const styleMood = activeStyles.flatMap((tag) => styleLanguage[tag].mood);
  const styleColor = activeStyles.flatMap((tag) => styleLanguage[tag].color);
  const styleAvoid = activeStyles.flatMap((tag) => styleLanguage[tag].avoid);
  const anchor = keywords[0] ?? project.nouns[0];
  const secondAnchor = keywords[1] ?? activeStyles[0];

  const candidateTypes: DirectionCandidate["type"][] = ["稳妥型", "大胆型", "执行型"];
  const candidates = candidateTypes.map<DirectionCandidate>((type, index) => {
    const scores = scoreFor(type, input.outputGoal, seed + index * 13);
    const titles = {
      稳妥型: [`克制${anchor}叙事`, `${anchor}的清晰主视觉`, `冷静的${project.nouns[index]}`],
      大胆型: [`${secondAnchor}压迫场`, `断裂式${anchor}记忆点`, `高反差情绪实验`],
      执行型: [`可落地${project.nouns[0]}系统`, `${anchor}静帧执行框架`, `稳定镜头与材质方案`],
    };

    return {
      id: `candidate-${index + 1}-${seed}`,
      type,
      title: pick(titles[type], seed + index, 1)[0],
      one_line_concept:
        type === "稳妥型"
          ? `以清晰主体和克制情绪建立可沟通的${input.projectType}方向。`
          : type === "大胆型"
            ? `放大${anchor}与${secondAnchor}之间的张力，形成更强的第一眼记忆。`
            : `把方向拆解为材质、光线、构图和首轮静帧流程，便于快速制作。`,
      visual_keywords: [
        ...pick(project.nouns, seed + index, 2),
        ...pick(styleVisual, seed + index * 3, 3),
      ],
      mood_keywords: [...new Set(pick(styleMood, seed + index * 5, 4))],
      strength:
        type === "稳妥型"
          ? `表达边界清晰，便于客户理解，${project.promise}`
          : type === "大胆型"
            ? "记忆点更强，适合在提案中承担差异化和传播话题。"
            : "制作路径明确，便于拆解为参考图、静帧测试和后续动态方案。",
      risk:
        type === "稳妥型"
          ? "如果画面钩子不足，可能显得过于平稳。"
          : type === "大胆型"
            ? "概念张力较高，需要控制符号密度，避免跑向难以执行的抽象表达。"
            : "执行稳定但惊喜感有限，需要在主视觉钩子上保留一个强记忆点。",
      scores,
    };
  });

  const recommended = [...candidates].sort((a, b) => {
    const goalBiasA = input.outputGoal === "提案方向" && a.type === "稳妥型" ? 2 : 0;
    const goalBiasB = input.outputGoal === "提案方向" && b.type === "稳妥型" ? 2 : 0;
    return average(b.scores) + goalBiasB - (average(a.scores) + goalBiasA);
  })[0];

  const referenceSummary = buildReferenceSummary(input.referenceImages, input.projectType);
  const coreConcept = `${recommended.title}：围绕${anchor}建立${activeStyles.join("、")}的视觉秩序，用${pick(
    project.composition,
    seed,
    2,
  ).join("、")}控制画面，用${pick(project.lighting, seed, 2).join("、")}强化提案辨识度。`;

  return {
    id: `result-${Date.now()}`,
    createdAt: new Date().toISOString(),
    project_type: input.projectType,
    output_goal: input.outputGoal,
    input_summary: summarizeBrief(input.brief, keywords),
    reference_image_summary: referenceSummary,
    style_tags: activeStyles,
    candidate_directions: candidates,
    recommended_direction: {
      candidate_id: recommended.id,
      title: recommended.title,
      reason:
        input.outputGoal === "提案方向"
          ? `该方向总分较高，且在清晰度与提案价值上更稳定，适合首轮沟通。`
          : `该方向在${input.outputGoal}场景下平衡了画面可控性与执行推进速度。`,
      core_sentence: `用${recommended.title}把零散灵感压缩成一套可讲述、可评估、可执行的${input.projectType}方向。`,
    },
    direction_package: {
      core_concept: coreConcept,
      mood: [...new Set(pick(styleMood, seed, 5))],
      material: [...new Set([...pick(project.material, seed, 3), ...pick(styleVisual, seed, 2)])],
      lighting: pick(project.lighting, seed + 4, 4),
      composition: pick(project.composition, seed + 9, 4),
      color_palette: [...new Set(pick(styleColor, seed + 11, 5))],
      do_not: [
        ...new Set([
          ...pick(styleAvoid, seed, 3),
          "不要把所有参考图元素直接拼贴",
          "避免画面信息同时争夺主视觉重心",
        ]),
      ],
    },
    proposal_copy: {
      short_pitch: `${recommended.title}，让${anchor}在克制而清晰的画面秩序中形成第一眼方向。`,
      client_facing_description: `这套方向以${input.projectType}的提案沟通为核心，将${activeStyles.join(
        "、",
      )}转译为可阅读的画面语言。它保留足够的视觉质感与记忆点，同时控制概念复杂度，便于后续延展为主视觉、静帧或动态分镜。`,
      internal_direction_note: `先锁定色调、光线和主体比例，再推进材质与细节。参考图主要用于提取${referenceSummary.length > 0 ? "色调、构图和质感" : "同类项目的视觉边界"}，不要直接复制具体元素。`,
    },
    prompt_package: {
      main_prompt: `${recommended.title}, ${input.projectType}, ${activeStyles.join(
        ", ",
      )}, ${pick(project.material, seed, 3).join(", ")}, ${pick(project.lighting, seed, 3).join(
        ", ",
      )}, ${pick(project.composition, seed, 3).join(", ")}, proposal-ready visual direction, cinematic controlled composition`,
      variation_prompts: [
        `${anchor} as hero subject, ${pick(styleVisual, seed + 1, 3).join(", ")}, restrained premium layout`,
        `${input.projectType} exploration, ${pick(project.lighting, seed + 2, 3).join(", ")}, ${pick(
          styleMood,
          seed + 2,
          2,
        ).join(", ")}`,
        `first round key visual, ${pick(project.composition, seed + 3, 3).join(", ")}, ${pick(
          styleColor,
          seed + 3,
          3,
        ).join(", ")}`,
      ],
      negative_constraints: [
        "avoid cheap neon overload",
        "avoid chaotic collage",
        "avoid over-sharpened AI texture",
        "avoid unclear subject hierarchy",
        ...pick(styleAvoid, seed, 2),
      ],
    },
    execution_advice: {
      first_step:
        referenceSummary.length > 0
          ? "先把参考图按色调、构图、材质三类拆开，选出 2 张作为主方向锚点。"
          : "先补 6 张同类视觉参考，再用主 prompt 生成 6-9 张首轮静帧。",
      recommended_workflow:
        "先确认色调、光线和构图是否稳定，再进入材质细化与动态分镜。首轮只验证方向，不急于扩展成完整系列。",
      risk_warning:
        "最大风险是把风格标签全部堆进画面，导致主视觉失焦。建议每轮只保留一个核心记忆点和两个辅助质感线索。",
    },
  };
}
