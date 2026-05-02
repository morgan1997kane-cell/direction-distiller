"use client";

import { useEffect, useRef, useState } from "react";
import { outputGoals, projectTypes, styleTags } from "@/data/presets";
import { AdvancedSettingsPanel } from "@/components/AdvancedSettingsPanel";
import { AIProviderSelector } from "@/components/AIProviderSelector";
import { ExamplePrompts } from "@/components/ExamplePrompts";
import { GenerationLoadingState } from "@/components/GenerationLoadingState";
import { Hero } from "@/components/Hero";
import { HistoryPanel } from "@/components/HistoryPanel";
import { ImageUploader } from "@/components/ImageUploader";
import { OptionChips } from "@/components/OptionChips";
import { ProductIntro } from "@/components/ProductIntro";
import { ResultPanel } from "@/components/ResultPanel";
import { VersionBadge } from "@/components/VersionBadge";
import { ValueFlow } from "@/components/ValueFlow";
import { WorkflowStepper, type WorkflowStep } from "@/components/WorkflowStepper";
import { NextActionPanel } from "@/components/NextActionPanel";
import {
  getDefaultModel,
  isSupportedModel,
  isSupportedProvider,
  normalizeModel,
  type AIProvider,
} from "@/lib/aiProvider";
import { normalizeDirectionResult } from "@/lib/directionSchema";
import { generateDirection } from "@/lib/generateDirection";
import { generateDirectionResult } from "@/lib/mockGenerator";
import {
  clearCurrentDraft,
  clearArchiveItems,
  createArchiveItem,
  deleteArchiveItem,
  getSavedResults,
  loadCurrentDraft,
  renameArchiveItem,
  saveArchiveItem,
  saveAutosaveSnapshot,
  toggleArchiveFavorite,
  updateCurrentDraftAiMeta,
  updateCurrentDraftInput,
  updateCurrentDraftResult,
} from "@/lib/storage";
import type {
  DirectionInput,
  DirectionResult,
  CurrentDraft,
  ExamplePrompt,
  OutputGoal,
  ProjectType,
  ReferenceImage,
  SavedDirectionResult,
  StyleTag,
} from "@/lib/types";

const defaultInput: DirectionInput = {
  brief: "",
  referenceImages: [],
  projectType: "品牌视觉",
  outputGoal: "提案方向",
  styleTags: [],
};

const AI_SETTINGS_KEY = "direction-distiller-ai-settings";
const defaultAIProvider: AIProvider = "deepseek";
const generationStages = [
  "\u6b63\u5728\u7406\u89e3 brief",
  "\u6b63\u5728\u6574\u7406\u53c2\u8003\u56fe\u4fe1\u606f",
  "\u6b63\u5728\u751f\u6210\u65b9\u5411\u5019\u9009",
  "\u6b63\u5728\u8bc4\u4f30\u63a8\u8350\u65b9\u5411",
  "\u6b63\u5728\u6574\u7406\u63d0\u6848\u6587\u6848\u4e0e Prompt \u5305",
  "\u6b63\u5728\u751f\u6210\u6267\u884c\u5efa\u8bae",
];

function getFallbackNotice(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (error instanceof DOMException && error.name === "AbortError") {
    return "\u771f\u5b9e AI \u54cd\u5e94\u8d85\u65f6\uff0c\u5df2\u5207\u6362\u4e3a\u672c\u5730\u6f14\u793a\u7ed3\u679c\u3002";
  }

  if (/timeout|abort/i.test(message)) {
    return "\u771f\u5b9e AI \u54cd\u5e94\u8d85\u65f6\uff0c\u5df2\u5207\u6362\u4e3a\u672c\u5730\u6f14\u793a\u7ed3\u679c\u3002";
  }

  if (/local \/ ollama|ollama|localhost:11434/i.test(message)) {
    return "Local / Ollama \u4ec5\u652f\u6301\u672c\u5730\u8fd0\u884c\u7248\u672c\uff0c\u5f53\u524d\u5df2\u5207\u6362\u4e3a Demo \u7ed3\u679c\u3002";
  }

  if (/missing api key|401|403|unauthorized|forbidden|unsupported model|unsupported ai provider/i.test(message)) {
    return "\u5f53\u524d\u6a21\u578b\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u5df2\u4f7f\u7528 Demo \u7ed3\u679c\u3002";
  }

  if (/json|directionresult|incompatible|schema|structure/i.test(message)) {
    return "\u771f\u5b9e AI \u8fd4\u56de\u683c\u5f0f\u4e0e\u5f53\u524d\u7248\u672c\u4e0d\u5b8c\u5168\u517c\u5bb9\uff0c\u5df2\u81ea\u52a8\u5207\u6362\u4e3a Demo \u7ed3\u679c\u3002";
  }

  return "\u8bf7\u6c42\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\uff1b\u5f53\u524d\u5df2\u4f7f\u7528 Demo \u7ed3\u679c\u3002";
}

function formatAutosaveTime(value: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  } catch {
    return "";
  }
}

export function InputComposer() {
  const [brief, setBrief] = useState(defaultInput.brief);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [projectType, setProjectType] = useState<ProjectType>(defaultInput.projectType);
  const [outputGoal, setOutputGoal] = useState<OutputGoal>(defaultInput.outputGoal);
  const [selectedStyles, setSelectedStyles] = useState<StyleTag[]>([]);
  const [result, setResult] = useState<DirectionResult | null>(null);
  const [resultInput, setResultInput] = useState<DirectionInput | null>(null);
  const [history, setHistory] = useState<SavedDirectionResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStageIndex, setGenerationStageIndex] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draftToRecover, setDraftToRecover] = useState<CurrentDraft | null>(null);
  const [autosavedAt, setAutosavedAt] = useState("");
  const [aiProvider, setAiProvider] = useState<AIProvider>(defaultAIProvider);
  const [aiModel, setAiModel] = useState<string>(getDefaultModel(defaultAIProvider));
  const [savedResultId, setSavedResultId] = useState("");
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>("input");
  const [hasEditedResult, setHasEditedResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const currentInput: DirectionInput = {
    brief,
    referenceImages,
    projectType,
    outputGoal,
    styleTags: selectedStyles,
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHistory(getSavedResults());
      const draft = loadCurrentDraft();
      if (draft) {
        setDraftToRecover(draft);
        setAutosavedAt(draft.updatedAt);
      }

      try {
        const raw = window.localStorage.getItem(AI_SETTINGS_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as { provider?: unknown; model?: unknown };
        if (!isSupportedProvider(saved.provider)) return;
        setAiProvider(saved.provider);
        setAiModel(normalizeModel(saved.provider, saved.model));
      } catch {
        window.localStorage.removeItem(AI_SETTINGS_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isGenerating) {
      setGenerationStageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setGenerationStageIndex((current) => Math.min(current + 1, generationStages.length - 1));
    }, 5200);

    return () => window.clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!result) return;
    setResultInput(currentInput);
    const draft = updateCurrentDraftInput(currentInput);
    if (draft) setAutosavedAt(draft.updatedAt);
  }, [brief, referenceImages, projectType, outputGoal, selectedStyles, result]);

  useEffect(() => {
    if (!result) return;
    const draft = updateCurrentDraftAiMeta({ provider: aiProvider, model: aiModel });
    if (draft) setAutosavedAt(draft.updatedAt);
  }, [aiProvider, aiModel, result]);

  function persistAISettings(provider: AIProvider, model: string) {
    window.localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify({ provider, model }));
  }

  function autosaveResult(nextResult: DirectionResult, input: DirectionInput, fallbackReason?: string) {
    const draft = saveAutosaveSnapshot(nextResult, input, { fallbackReason });
    setAutosavedAt(draft.updatedAt);
    setDraftToRecover(null);
  }

  function updateAIProvider(provider: AIProvider) {
    const nextModel = getDefaultModel(provider);
    setAiProvider(provider);
    setAiModel(nextModel);
    persistAISettings(provider, nextModel);
  }

  function updateAIModel(model: string) {
    const nextModel = isSupportedModel(aiProvider, model) ? model : getDefaultModel(aiProvider);
    setAiModel(nextModel);
    persistAISettings(aiProvider, nextModel);
  }

  function fillExample(example: ExamplePrompt) {
    setBrief(example.brief);
    setProjectType(example.projectType);
    setOutputGoal(example.outputGoal);
    setSelectedStyles(example.styleTags);
    setError("");
    setNotice("");
    setWorkflowStep("input");
    window.scrollTo({ top: 360, behavior: "smooth" });
  }

  async function runGenerate() {
    if (!brief.trim() && referenceImages.length === 0) {
      setError("请先输入一个 brief、灵感片段，或上传参考图。");
      return;
    }

    setError("");
    setNotice("");
    setSavedResultId("");
    setWorkflowStep("generate");
    setHasEditedResult(false);
    setGenerationStageIndex(0);
    setIsGenerating(true);
    const generationInput = currentInput;

    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

    try {
      if (aiProvider === "demo") {
        setGenerationStageIndex(generationStages.length - 1);
        const demoResult = normalizeDirectionResult(generateDirectionResult(generationInput), generationInput, "demo");
        setResult(demoResult);
        setResultInput(generationInput);
        autosaveResult(demoResult, generationInput);
        setWorkflowStep("refine");
        return;
      }

      const nextResult = await generateDirection(generationInput, { provider: aiProvider, model: aiModel });
      setResult(nextResult);
      setResultInput(generationInput);
      autosaveResult(nextResult, generationInput);
      setWorkflowStep("refine");
    } catch (generationError) {
      console.warn("Live AI generation failed, falling back to local mock generator.", generationError);
      const fallbackResult = normalizeDirectionResult(generateDirectionResult(generationInput), generationInput, "demo");
      setResult(fallbackResult);
      setResultInput(generationInput);
      const fallbackNotice = getFallbackNotice(generationError);
      autosaveResult(fallbackResult, generationInput, fallbackNotice);
      setNotice(`${fallbackNotice} 当前 Demo 结果已自动保存，可稍后恢复。`);
    } finally {
      setWorkflowStep("refine");
      setIsGenerating(false);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }

  function saveCurrent() {
    if (!result || !resultInput) return;
    const existing = history.find((item) => item.id === savedResultId);
    const item = createArchiveItem(result, resultInput, existing);
    setHistory(saveArchiveItem(item));
    setSavedResultId(item.id);
    setWorkflowStep("archive");
    setHasEditedResult(false);
    autosaveResult(result, resultInput);
    setNotice(`已保存到 Project Archive：${item.title}`);
  }

  function restoreHistory(item: SavedDirectionResult) {
    setBrief(item.input.brief);
    setReferenceImages(item.input.referenceImages);
    setProjectType(item.input.projectType);
    setOutputGoal(item.input.outputGoal);
    setSelectedStyles(item.input.styleTags);
    setResult(item.result);
    setResultInput(item.input);
    setSavedResultId(item.id);
    setWorkflowStep("refine");
    setHasEditedResult(false);
    if (item.provider && isSupportedProvider(item.provider)) {
      setAiProvider(item.provider);
      setAiModel(normalizeModel(item.provider, item.model));
      persistAISettings(item.provider, normalizeModel(item.provider, item.model));
    } else if (item.aiMode === "demo") {
      setAiProvider("demo");
      setAiModel(getDefaultModel("demo"));
      persistAISettings("demo", getDefaultModel("demo"));
    }
    autosaveResult(item.result, item.input);
    setNotice(`已恢复项目：${item.title}`);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function restoreCurrentDraft(draft: CurrentDraft) {
    setBrief(draft.inputState.brief);
    setReferenceImages(draft.inputState.referenceImages);
    setProjectType(draft.inputState.projectType);
    setOutputGoal(draft.inputState.outputGoal);
    setSelectedStyles(draft.inputState.styleTags);
    setResult(draft.result);
    setResultInput(draft.inputState);
    setSavedResultId("");
    setWorkflowStep("refine");
    setHasEditedResult(false);
    setDraftToRecover(null);
    setAutosavedAt(draft.updatedAt);
    setNotice("已恢复上次自动保存的生成结果。");
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function discardCurrentDraft() {
    clearCurrentDraft();
    setDraftToRecover(null);
    setAutosavedAt("");
  }

  function clearInput() {
    setBrief("");
    setReferenceImages([]);
    setProjectType(defaultInput.projectType);
    setOutputGoal(defaultInput.outputGoal);
    setSelectedStyles([]);
    setResult(null);
    setResultInput(null);
    setSavedResultId("");
    setWorkflowStep("input");
    setHasEditedResult(false);
    setError("");
    setNotice("");
    discardCurrentDraft();
  }

  return (
    <main>
      <Hero />
      <ValueFlow />
      <VersionBadge />

      {draftToRecover ? (
        <section className="mx-auto mb-6 w-full max-w-7xl px-5">
          <div className="flex flex-col gap-3 border border-cyan-200/20 bg-cyan-300/[0.06] p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-cyan-50">检测到上次未保存的生成结果，是否恢复？</p>
              <p className="mt-1 text-xs text-zinc-500">
                上次自动保存于 {formatAutosaveTime(draftToRecover.updatedAt) || draftToRecover.updatedAt}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => restoreCurrentDraft(draftToRecover)}
                className="border border-cyan-200/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50 transition hover:bg-cyan-300/15"
              >
                恢复上次结果
              </button>
              <button
                type="button"
                onClick={discardCurrentDraft}
                className="border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:text-zinc-100"
              >
                丢弃
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-14 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="studio-surface p-5 md:p-8">
          <WorkflowStepper currentStep={isGenerating ? "generate" : workflowStep} />
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">Creative Workbench</p>
              <h2 className="mt-3 text-3xl font-semibold text-zinc-50 md:text-4xl">创意简报输入台</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                不用写完整方案，一句话、几张参考图，或一个模糊感觉都可以开始。
              </p>
            </div>
            {isGenerating ? (
              <div className="flex shrink-0 items-center gap-2 border border-cyan-200/20 bg-cyan-300/[0.07] px-3 py-2 text-sm text-cyan-100">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-200" />
                {generationStages[generationStageIndex]}
              </div>
            ) : null}
          </div>

          <div className="bg-black/25 p-4 md:p-5">
            <textarea
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder="粘贴你的项目 brief、灵感片段、画面想法或客户需求。例如：我想做一组偏未来感、高反差、冷色金属质感的汽车广告视觉……"
              className="min-h-72 w-full resize-y bg-transparent text-lg leading-9 text-zinc-100 outline-none placeholder:text-zinc-600"
            />
          </div>

          {!result && !isGenerating ? (
            <div className="mt-5">
              <NextActionPanel step="input" />
            </div>
          ) : null}

          <div className="mt-8 grid gap-7">
            <ImageUploader images={referenceImages} onChange={setReferenceImages} />
            <AdvancedSettingsPanel summary={`${aiProvider} · ${aiModel}`}>
              <AIProviderSelector
                provider={aiProvider}
                model={aiModel}
                onProviderChange={updateAIProvider}
                onModelChange={updateAIModel}
              />
            </AdvancedSettingsPanel>
            <OptionChips
              label="项目类型"
              options={projectTypes}
              value={projectType}
              onChange={(value) => setProjectType(value as ProjectType)}
            />
            <OptionChips
              label="输出目标"
              options={outputGoals}
              value={outputGoal}
              onChange={(value) => setOutputGoal(value as OutputGoal)}
            />
            <OptionChips
              label="风格倾向"
              options={styleTags}
              value={selectedStyles}
              multiple
              onChange={(value) => setSelectedStyles(value as StyleTag[])}
            />
          </div>

          {error ? <p className="mt-5 text-sm text-red-200">{error}</p> : null}
          {notice ? <p className="mt-5 text-sm text-amber-100/80">{notice}</p> : null}
          {autosavedAt ? (
            <p className="mt-4 text-xs text-zinc-500">
              已自动保存 · 上次保存于 {formatAutosaveTime(autosavedAt) || autosavedAt}
              {result?.ai_mode === "live"
                ? ` · 当前结果来自 Live${result.ai_provider ? ` · ${result.ai_provider}` : ""}${result.ai_model ? ` · ${result.ai_model}` : ""}`
                : result
                  ? " · 当前结果来自 Demo"
                  : ""}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={runGenerate}
              disabled={isGenerating}
              className="border border-zinc-50/70 bg-zinc-50 px-7 py-3.5 text-sm font-medium text-black shadow-[0_0_40px_rgba(226,232,240,0.10)] transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "正在压缩方向…" : "压缩成方向"}
            </button>
            <button
              type="button"
              onClick={clearInput}
              className="border border-white/10 bg-white/[0.02] px-5 py-3 text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              清空输入
            </button>
          </div>
        </div>

        <HistoryPanel
          items={history}
          onRestore={restoreHistory}
          onDelete={(id) => {
            setHistory(deleteArchiveItem(id));
            if (savedResultId === id) setSavedResultId("");
          }}
          onClear={() => {
            clearArchiveItems();
            setHistory([]);
            setSavedResultId("");
          }}
          onRename={(id, title) => setHistory(renameArchiveItem(id, title))}
          onToggleFavorite={(id) => setHistory(toggleArchiveFavorite(id))}
        />
      </section>

      <ExamplePrompts onSelect={fillExample} />
      <ProductIntro />

      <div ref={resultRef} className="mx-auto w-full max-w-7xl px-5 pb-20">
        {isGenerating ? (
          <GenerationLoadingState provider={aiProvider} model={aiModel} stage={generationStages[generationStageIndex]} />
        ) : result && resultInput ? (
          <div className="space-y-6">
            <NextActionPanel step={workflowStep} result={result} saved={Boolean(savedResultId)} edited={hasEditedResult} />
            <ResultPanel
              result={result}
              input={resultInput}
              provider={aiProvider}
              model={aiModel}
              saved={Boolean(savedResultId)}
              edited={hasEditedResult}
              onResultChange={(nextResult) => {
                setResult(nextResult);
                setSavedResultId("");
                setWorkflowStep("refine");
                setHasEditedResult(true);
                const draft = updateCurrentDraftResult(nextResult);
                if (draft) setAutosavedAt(draft.updatedAt);
              }}
              onSave={saveCurrent}
              onRegenerate={runGenerate}
              onClear={clearInput}
              onExport={() => setWorkflowStep("export")}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
