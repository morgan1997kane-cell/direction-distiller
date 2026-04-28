"use client";

import { useEffect, useRef, useState } from "react";
import { outputGoals, projectTypes, styleTags } from "@/data/presets";
import { ExamplePrompts } from "@/components/ExamplePrompts";
import { Hero } from "@/components/Hero";
import { HistoryPanel } from "@/components/HistoryPanel";
import { ImageUploader } from "@/components/ImageUploader";
import { OptionChips } from "@/components/OptionChips";
import { ResultPanel } from "@/components/ResultPanel";
import { generateDirectionResult } from "@/lib/mockGenerator";
import {
  clearSavedResults,
  deleteSavedResult,
  getSavedResults,
  saveDirectionResult,
} from "@/lib/storage";
import type {
  DirectionInput,
  DirectionResult,
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
  const [error, setError] = useState("");
  const [savedResultId, setSavedResultId] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const currentInput: DirectionInput = {
    brief,
    referenceImages,
    projectType,
    outputGoal,
    styleTags: selectedStyles,
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setHistory(getSavedResults()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function fillExample(example: ExamplePrompt) {
    setBrief(example.brief);
    setProjectType(example.projectType);
    setOutputGoal(example.outputGoal);
    setSelectedStyles(example.styleTags);
    setError("");
    window.scrollTo({ top: 260, behavior: "smooth" });
  }

  function runGenerate() {
    if (!brief.trim() && referenceImages.length === 0) {
      setError("请先输入一个 brief、灵感片段，或上传参考图。");
      return;
    }

    setError("");
    setSavedResultId("");
    setIsGenerating(true);
    const generationInput = currentInput;
    window.setTimeout(() => {
      const nextResult = generateDirectionResult(generationInput);
      setResult(nextResult);
      setResultInput(generationInput);
      setIsGenerating(false);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }, 1200 + Math.round(Math.random() * 700));
  }

  function saveCurrent() {
    if (!result || !resultInput) return;
    const item: SavedDirectionResult = {
      id: result.id,
      savedAt: new Date().toISOString(),
      title: result.proposal_copy.short_pitch,
      projectType: result.project_type,
      recommendedTitle: result.recommended_direction.title,
      input: resultInput,
      result,
    };
    setHistory(saveDirectionResult(item));
    setSavedResultId(result.id);
  }

  function restoreHistory(item: SavedDirectionResult) {
    setBrief(item.input.brief);
    setReferenceImages(item.input.referenceImages);
    setProjectType(item.input.projectType);
    setOutputGoal(item.input.outputGoal);
    setSelectedStyles(item.input.styleTags);
    setResult(item.result);
    setResultInput(item.input);
    setSavedResultId(item.result.id);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
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
    setError("");
  }

  return (
    <main>
      <Hero />

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 pb-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/60">Input Composer</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-50">方向输入</h2>
            </div>
            {isGenerating ? (
              <div className="flex items-center gap-2 text-sm text-cyan-100">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-200" />
                正在压缩方向…
              </div>
            ) : null}
          </div>

          <textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="粘贴你的项目 brief、灵感片段、画面想法或客户需求。例如：我想做一组偏未来感、高反差、冷色金属质感的汽车广告视觉……"
            className="min-h-52 w-full resize-y rounded-lg border border-white/10 bg-black/40 p-4 text-base leading-8 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-200/50"
          />

          <div className="mt-6 grid gap-6">
            <ImageUploader images={referenceImages} onChange={setReferenceImages} />
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

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runGenerate}
              disabled={isGenerating}
              className="rounded-md bg-zinc-50 px-5 py-3 text-sm font-medium text-black transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "正在压缩方向…" : "压缩成方向"}
            </button>
            <button
              type="button"
              onClick={clearInput}
              className="rounded-md border border-white/10 px-5 py-3 text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              清空输入
            </button>
          </div>
        </div>

        <HistoryPanel
          items={history}
          onRestore={restoreHistory}
          onDelete={(id) => setHistory(deleteSavedResult(id))}
          onClear={() => {
            clearSavedResults();
            setHistory([]);
          }}
        />
      </section>

      <ExamplePrompts onSelect={fillExample} />

      <div ref={resultRef} className="mx-auto w-full max-w-6xl px-5 pb-20">
        {result && resultInput ? (
          <ResultPanel
            result={result}
            input={resultInput}
            saved={savedResultId === result.id}
            onSave={saveCurrent}
            onRegenerate={runGenerate}
            onClear={clearInput}
          />
        ) : null}
      </div>
    </main>
  );
}
