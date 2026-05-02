# Direction Distiller / 方向压缩器

Direction Distiller / 方向压缩器 是一个面向泛视觉设计师的 AI 创意方向压缩工具 MVP 原型。

它帮助视觉设计师把零散灵感、模糊 brief、参考图和项目想法，快速压缩成一套可用于客户提案、团队脑暴和首轮视觉探索的视觉方向包。

当前版本是 v0.3.2：默认支持 DeepSeek 国内可充值供应商，同时支持 Gemini 和 OpenAI-compatible 扩展能力，并保留本地 mock fallback。

## Product Positioning

Direction Distiller 不是普通灵感笔记，也不是聊天式脑暴工具。第一版更偏“提案方向包”：输入模糊想法后，系统输出可比较、可沟通、可继续执行的视觉方向。

页面气质以黑底、高级灰、克制冷色微光、电影感和中文提案语境为主，面向三维设计师、品牌视觉设计师、AI 视觉创作者、广告概念设计师、影像概念设计师和 UI / HMI 视觉设计师。

## Current Capabilities

当前原型已经实现：

- 输入 brief / 灵感片段
- 上传参考图并显示缩略图
- 选择项目类型、输出目标和风格标签
- 默认使用服务端 DeepSeek API 生成结果
- 可通过环境变量切换到 Gemini 或 OpenAI-compatible 供应商
- 可在页面中手动切换 provider / model
- 无 API key 或 API 失败时 fallback 到本地 mock generator
- 生成 3 个视觉方向候选
- 生成 1 个推荐方向
- 生成视觉方向包、提案文案、Prompt 草稿和下一步执行建议
- 复制完整方向包
- 复制 Prompt
- 保存历史记录到 localStorage
- 从历史记录恢复结果
- 删除历史记录

## Tech Stack

- Next.js 16.2.4
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- localStorage
- OpenAI Node SDK（通过 baseURL 兼容 DeepSeek / Gemini / OpenAI）
- 服务端 API Route
- 本地 mock generator fallback

## Environment Variables

复制 `.env.example`，在本地创建 `.env.local`。

默认推荐国内用户使用 DeepSeek：

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

可选 Gemini：

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
GEMINI_MODEL=gemini-2.5-flash
```

可选 OpenAI：

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-5.5
```

说明：

- `AI_PROVIDER` 默认是 `deepseek`
- `AI_PROVIDER=deepseek` 时读取 `DEEPSEEK_API_KEY` / `DEEPSEEK_BASE_URL` / `DEEPSEEK_MODEL`
- `AI_PROVIDER=gemini` 时读取 `GEMINI_API_KEY` / `GEMINI_BASE_URL` / `GEMINI_MODEL`
- `AI_PROVIDER=openai` 时读取 `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL`
- DeepSeek 推荐国内用户优先使用，支持国内充值
- Gemini 可用于免费额度测试
- OpenAI 可选，高质量但需要海外 API 计费条件
- 如果当前账号或环境暂时不支持默认模型，可以通过对应的 `*_MODEL` 切换为可用模型
- 不要把真实 API key 提交到仓库
- 如果没有配置对应 API key，前端会自动 fallback 到本地 mock generator
- 当前 v0.3.3 仍不支持参考图真实识别，只把参考图数量、文件名、MIME 类型和 size 作为文本上下文传给 API

## Provider / Model Switcher

输入区包含轻量 AI 设置区，可手动切换 provider / model：

- `demo`：直接使用本地 mock generator，不请求真实 API
- `deepseek`：`deepseek-chat`
- `gemini`：`gemini-2.5-flash`
- `openai`：`gpt-5.4-mini` / `gpt-5.5`

选择结果会保存在 localStorage，刷新页面后保留。后端会对 provider / model 做 allowlist 校验，不允许任意模型名直接透传。没有对应 API key 或 API 调用失败时，会自动 fallback 到 Demo 模式。

## Local / Ollama Provider

v0.4.0 adds a Local / Ollama provider for local development only.

- Provider list now includes `demo`, `deepseek`, `gemini`, `openai`, and `ollama`.
- Ollama model allowlist: `qwen2.5:7b`, `qwen2.5:14b`, `llama3.1:8b`, `deepseek-r1:7b`.
- Vercel production cannot access a user's `http://localhost:11434`; choosing Local / Ollama online returns a clear error and falls back to Demo.
- Install and start Ollama yourself before using this provider.
- Local env example:

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`, choose Provider `Local / Ollama`, then choose an installed model.

## Provider Response Normalization

服务端会对模型返回做兼容解析：

- 支持从 markdown code block 或混杂文本中提取 JSON object
- 支持字段别名映射，例如 `candidates` / `recommendation` / `package` / `prompts`
- 缺失字段会尽量补齐为当前前端可用的 `DirectionResult`
- 候选方向会归一化为 `稳妥型` / `大胆型` / `执行型` 三个方向
- `recommended_direction.candidate_id` 会修正到合法候选 id
- 只有完全无法提取 JSON 或 normalize 后仍不可用时，才 fallback 到 Demo

## Generation Experience

v0.3.4 adds a clearer generation waiting state for Live API calls:

- The result area shows a proposal-style skeleton while generation is running.
- Loading copy advances through stages such as brief understanding, reference sorting, direction candidates, recommendation, proposal copy, prompt package, and execution advice.
- Live mode reminds users that generation usually takes 15-40 seconds.
- Demo mode uses a shorter local-generation hint.
- Fallback notices are more specific and still keep technical details hidden.

## Result Quality

v0.4.1 focuses on live generation quality:

- Candidate directions should be visibly different across safe, bold, and execution-oriented routes.
- Scores should show real trade-offs instead of clustering around the same range.
- Direction packages should use specific visual language for material, lighting, composition, color, and avoid rules.
- Proposal copy should be more suitable for PPT use and client-facing review.
- Prompt drafts should be directly usable, with three distinct variations and practical negative constraints.

## Local Development

安装依赖：

```bash
npm install
```

启动本地开发预览：

```bash
npm run dev
```

默认本地地址：

```text
http://localhost:3000
```

注意：localhost 只是本地开发预览地址，不是线上地址。

## Build

生产构建检查：

```bash
npm run build
```

TypeScript 检查：

```bash
npx tsc --noEmit
```

## Deployment

线上站点：

https://direction-distiller.vercel.app/

GitHub 仓库：

https://github.com/morgan1997kane-cell/direction-distiller.git

当前部署流程：

```text
本地修改
→ npm run build
→ git add .
→ git commit
→ git push 到 main
→ Vercel 自动部署线上站点
```

## Build Stability Notes

项目曾经使用 `next/font/google` 拉取 Google Fonts，导致网络不稳定时 `npm run build` 失败。

当前版本已经移除远程 Google Fonts 依赖，改用本地系统字体栈。不要重新引入 `next/font/google`，也不要让构建阶段依赖 Google Fonts 等外部字体请求。

## Version Notes

当前可见版本号维护在 `src/lib/version.ts`。

页面右下角有轻量版本角标，用于确认本地预览与 Vercel 线上部署是否同步。每次完成可见功能更新或产品阶段变化时，需要更新 `APP_VERSION`，必要时同步更新 `APP_VERSION_LABEL`。

已知推进记录：

- v0.1：Codex 一次性生成完整 mock MVP
- v0.2：结果页与首页优化成更像提案工具的体验
- v0.2.1：移除 Google Fonts 远程依赖，修复 build 稳定性
- v0.3：新增真实 OpenAI API 生成模式，并保留 mock fallback
- v0.3.1：默认支持 DeepSeek 国内供应商，通过 OpenAI-compatible baseURL 保留 OpenAI 扩展能力
- v0.3.2：新增 Gemini provider 支持，形成 DeepSeek / Gemini / OpenAI 三供应商配置
- v0.3.3：新增前端 provider / model 手动切换，并在后端做 allowlist 校验
- v0.3.3：增强 provider 响应解析与 DirectionResult normalize 层

v0.3.4: generation experience upgrade with staged loading copy, result skeleton, clearer AI mode, and better fallback notices.
v0.4.0: Local / Ollama provider support for local development, with Vercel production fallback to Demo.
v0.4.1: result quality upgrade with stronger candidate differentiation, more professional direction packages, PPT-ready proposal copy, and more executable prompt drafts.
v0.4.2: section editing, section-level partial regeneration, and bilingual Prompt Package tabs.
v0.4.3: result layout clarity fix with collapsible sections, clearer summaries, and safer bottom action spacing.
v0.4.3.1: candidate layout and structured edit UX hotfix.
v0.4.3.2: current draft autosave and refresh recovery.
v0.4.3.3: live response compatibility hotfix for bilingual Prompt Package and provider normalization.
v0.4.4: export-ready deliverable output with Markdown download, client copy, and internal production copy.
v0.4.5: project archive upgrade with search, rename, favorite, restore, delete, and Markdown copy.

相关 Git 提交记录中应包含：

- Initial / Create Next App 初始工程
- Direction Distiller 初版原型
- Proposal-style prototype polish
- Remove remote font dependency for stable build
- Add live AI generation API with mock fallback
- Add DeepSeek provider support
- Add Gemini provider support
- Add provider and model switcher
- Normalize provider response for live AI generation
- Improve generation experience and loading states
- Add local Ollama provider support
- Improve live generation result quality
- Add section editing and partial regeneration
- Fix result layout and add collapsible sections
- Fix candidate layout and structured edit UX
- Add autosave and draft recovery

## Notes for AI Coding Agents

项目根目录包含 `AGENTS.md`。新开 Codex / AI coding agent 会话时，请先阅读 `AGENTS.md`，再读取代码。

## v0.4.2 Section Editing

- v0.4.2 adds section-level editing, copying, and partial regeneration for generated results.
- Editable sections: Candidate Directions, Recommended Direction, Direction Package, Proposal Copy, Prompt Package, and Execution Advice.
- Each candidate direction card can be edited, copied, or regenerated independently.
- Partial regeneration uses `/api/refine-section` and keeps the current provider/model context.
- Prompt Package is displayed with bilingual tabs: Chinese and English Version.
- Prompt Package should keep both `zh` and `en` prompt payloads; legacy flat fields remain only for compatibility with older saved results.

## v0.4.3 Layout Clarity

- v0.4.3 fixes result-page spacing and section hierarchy after section editing was added.
- Major result sections are collapsible and keep a compact summary when collapsed.
- Recommended Direction and Candidate Directions are expanded by default.
- Direction Package, Proposal Copy, Prompt Package, Execution Advice, and Reference Notes are collapsed by default.
- Candidate score bars stay in normal document flow, and the bottom sticky action bar has extra page padding to avoid covering content.

## v0.4.3.1 Edit UX Hotfix

- v0.4.3.1 fixes candidate card readability by using wider responsive columns and normal horizontal Chinese text flow.
- User-facing edit mode now uses structured fields instead of raw JSON.
- Candidate, Recommended Direction, Direction Package, Proposal Copy, Prompt Package, and Execution Advice all support field-based editing.
- Prompt Package editing keeps Chinese and English prompt versions editable separately.

## v0.4.3.2 Autosave Recovery

- v0.4.3.2 adds a current draft autosave in localStorage.
- Current draft is separate from manually saved history; history still stores multiple explicit saves.
- Full generation, Demo fallback, section edits, partial regeneration, and input/provider/model changes update the current draft.
- Refreshing the page shows a restore/discard prompt when an autosaved draft exists.
- Reference images are stored only as metadata in the draft, never as binary/base64 image data.

## v0.4.3.3 Live Response Hotfix

- v0.4.3.3 makes live provider responses more tolerant of older or partial `DirectionResult` shapes.
- Legacy flat `prompt_package` payloads are normalized into bilingual `zh` / `en` prompt packages.
- Provider responses with common aliases are mapped before validation, and server logs now report specific missing fields.

## v0.4.4 Export Ready

- v0.4.4 adds deliverable export output based on the current frontend `DirectionResult`.
- Supported exports: full Markdown direction package, client proposal copy, internal production copy, and `.md` download.
- Export does not call backend APIs and does not modify autosave drafts or saved history.
- Prompt Package export supports bilingual `zh` / `en` payloads and remains compatible with older flat prompt payloads.

## v0.4.5 Project Archive

- v0.4.5 upgrades simple history into a local Project Archive.
- Current draft remains a single autosaved recovery state; Project Archive is user-saved and can contain multiple records.
- Archive records support title, brief summary, project type, provider/model, AI mode, favorite state, createdAt, and updatedAt metadata.
- Archive UI supports search, filter, rename, favorite, restore, delete, clear all, and quick Markdown copy.
- Restored archive results can continue editing, partial regeneration, autosave, and export.
