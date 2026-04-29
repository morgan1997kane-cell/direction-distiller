export type ProjectType =
  | "品牌视觉"
  | "广告 KV"
  | "三维视觉"
  | "影像概念"
  | "UI / HMI"
  | "人物 / 角色"
  | "空间 / 场景"
  | "其他";

export type OutputGoal = "提案方向" | "视觉探索" | "团队脑暴" | "Prompt 准备";

export type StyleTag =
  | "电影感"
  | "高级质感"
  | "未来感"
  | "极简"
  | "写实"
  | "实验性"
  | "商业广告"
  | "叙事感"
  | "暗黑"
  | "明亮清爽";

export interface ReferenceImage {
  id: string;
  fileName: string;
  type: string;
  previewUrl: string;
  size?: number;
}

export interface DirectionInput {
  brief: string;
  referenceImages: ReferenceImage[];
  projectType: ProjectType;
  outputGoal: OutputGoal;
  styleTags: StyleTag[];
}

export interface ReferenceImageSummary {
  image_id: string;
  file_name: string;
  observed_style: string;
  color_tone: string;
  composition_notes: string;
  usable_elements: string[];
}

export interface DirectionScores {
  clarity: number;
  visual_control: number;
  proposal_value: number;
  execution_feasibility: number;
}

export interface DirectionCandidate {
  id: string;
  type: "稳妥型" | "大胆型" | "执行型";
  title: string;
  one_line_concept: string;
  visual_keywords: string[];
  mood_keywords: string[];
  strength: string;
  risk: string;
  scores: DirectionScores;
}

export interface RecommendedDirection {
  candidate_id: string;
  title: string;
  reason: string;
  core_sentence: string;
}

export interface DirectionPackage {
  core_concept: string;
  mood: string[];
  material: string[];
  lighting: string[];
  composition: string[];
  color_palette: string[];
  do_not: string[];
}

export interface ProposalCopy {
  short_pitch: string;
  client_facing_description: string;
  internal_direction_note: string;
}

export interface PromptPackage {
  main_prompt: string;
  variation_prompts: string[];
  negative_constraints: string[];
}

export interface ExecutionAdvice {
  first_step: string;
  recommended_workflow: string;
  risk_warning: string;
}

export interface DirectionResult {
  id: string;
  createdAt: string;
  ai_mode?: "live" | "demo";
  ai_provider?: string;
  ai_model?: string;
  project_type: ProjectType;
  output_goal: OutputGoal;
  input_summary: string;
  reference_image_summary: ReferenceImageSummary[];
  style_tags: StyleTag[];
  candidate_directions: DirectionCandidate[];
  recommended_direction: RecommendedDirection;
  direction_package: DirectionPackage;
  proposal_copy: ProposalCopy;
  prompt_package: PromptPackage;
  execution_advice: ExecutionAdvice;
}

export interface SavedDirectionResult {
  id: string;
  savedAt: string;
  title: string;
  projectType: ProjectType;
  recommendedTitle: string;
  input: DirectionInput;
  result: DirectionResult;
}

export interface ExamplePrompt {
  title: string;
  brief: string;
  projectType: ProjectType;
  outputGoal: OutputGoal;
  styleTags: StyleTag[];
}
