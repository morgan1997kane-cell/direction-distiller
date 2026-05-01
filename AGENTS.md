<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16.2.4 with React 19.2.4. This version has breaking changes: APIs, conventions, and file structure may differ from older Next.js knowledge. Before writing application code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Direction Distiller / 方向压缩器 - Agent Instructions

## Project Overview

Direction Distiller / 方向压缩器 是一个面向泛视觉设计师的 AI 创意方向压缩工具。

它不是普通灵感笔记，也不是聊天式脑暴工具，而是帮助视觉设计师把零散灵感、模糊 brief、参考图和项目想法，快速压缩成一套可以用于提案沟通、团队脑暴和首轮视觉探索的“视觉方向包”。

核心价值：

把模糊灵感压缩成可提案的视觉方向。

当前版本是 v0.3.2：默认接入 DeepSeek 国内可充值供应商，同时支持 Gemini 和 OpenAI-compatible 扩展能力，并保留本地 mock fallback。

## Target Users

第一版服务对象是泛视觉设计师，包括：

- 三维设计师
- 平面 / 品牌视觉设计师
- AI 视觉创作者
- 广告概念设计师
- 影像概念设计师
- UI / HMI 视觉设计师

## Current Product Capabilities

当前原型已经实现：

- 输入 brief / 灵感片段
- 上传参考图并显示缩略图
- 选择项目类型
- 选择输出目标
- 选择风格标签
- 默认使用服务端 DeepSeek API 生成结果
- 可通过环境变量切换到 Gemini 或 OpenAI-compatible 供应商
- 可在页面中手动切换 provider / model
- 无 API key 或 API 失败时 fallback 到本地 mock generator
- 生成 3 个视觉方向候选
- 生成 1 个推荐方向
- 生成视觉方向包
- 生成提案文案
- 生成 Prompt 草稿
- 生成下一步执行建议
- 复制完整方向包
- 复制 Prompt
- 保存历史记录到 localStorage
- 从历史记录恢复结果
- 删除历史记录

## Important Product Positioning

这个产品第一版更偏“提案方向包”，不是纯 Prompt 工具。

结果页应该像视觉提案卡片，而不是普通聊天记录或后台表单。

页面气质应该是：

- 黑底
- 高级灰
- 克制冷色微光
- 创业类 AI 产品
- 视觉设计师提案工具
- 电影感
- 中文为主，英文作为辅助装饰
- 专业、清晰、有判断力

不要把它做成普通 SaaS 后台，也不要做成过度霓虹或廉价毛玻璃风格。

## Current Project Structure

当前主要文件结构：

- `src/app/page.tsx`：首页入口，只渲染 `InputComposer`
- `src/app/layout.tsx`：根布局与 metadata
- `src/app/globals.css`：Tailwind v4 全局样式、主题 token、系统字体栈
- `src/components/InputComposer.tsx`：主交互容器，管理输入、生成、保存、历史恢复
- `src/components/ResultPanel.tsx`：结果展示总面板
- `src/components/*Card.tsx`：各类方向包、候选方向、提案文案、Prompt、执行建议卡片
- `src/components/ImageUploader.tsx`：参考图上传与缩略图
- `src/components/HistoryPanel.tsx`：localStorage 历史记录面板
- `src/data/presets.ts`：项目类型、输出目标、风格标签和示例 brief
- `src/lib/mockGenerator.ts`：本地 mock 方向生成器，用于无 key、API 失败或演示 fallback
- `src/lib/storage.ts`：localStorage 保存、读取、删除逻辑
- `src/lib/copy.ts`：复制方向包和 Prompt 的格式化逻辑
- `src/lib/types.ts`：产品数据结构类型定义

## Deployment

线上站点：

https://direction-distiller.vercel.app/

GitHub 仓库：

https://github.com/morgan1997kane-cell/direction-distiller.git

部署方式：

本地修改
→ npm run build
→ git add .
→ git commit
→ git push 到 main
→ Vercel 自动部署线上站点

注意：

localhost 只是本地开发预览地址。
不要把 localhost 当成线上地址。
完成修改后，如果需要同步线上，必须 push 到 main。

## Development Commands

安装依赖：

```bash
npm install
```

本地开发：

```bash
npm run dev
```

构建检查：

```bash
npm run build
```

TypeScript 检查：

```bash
npx tsc --noEmit
```

## Build Stability Notes

之前项目使用 `next/font/google` 拉取 Google Fonts，导致 `npm run build` 在网络不稳定时失败。

现在已经移除远程 Google Fonts 依赖，改用本地系统字体栈。

不要重新引入 `next/font/google`。
不要在构建阶段依赖 Google Fonts 等外部字体请求。

当前字体栈定义在 `src/app/globals.css`，接近：

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif
```

## Live AI Generation Notes

v0.3.2 使用 OpenAI-compatible 供应商配置：

- 服务端入口是 `src/app/api/generate-direction/route.ts`
- 前端 client 是 `src/lib/generateDirection.ts`
- 供应商配置在 `src/lib/aiProvider.ts`
- 结构化输出 schema 与结果校验在 `src/lib/directionSchema.ts`
- 前端点击“压缩成方向”时优先调用 `/api/generate-direction`
- API 成功时结果标记为 `AI Mode: Live`
- API 失败、超时、缺少 key 或返回结构异常时 fallback 到本地 `mockGenerator`
- fallback 时结果标记为 `AI Mode: Demo`
- mock generator 必须保留，不要删除

Provider / model 手动切换：

- 组件在 `src/components/AIProviderSelector.tsx`
- 支持 `demo` / `deepseek` / `gemini` / `openai`
- `demo` 直接使用本地 mock generator，不请求真实 API
- provider / model 选择保存在 localStorage
- 后端会对 provider / model 做 allowlist 校验，不允许任意模型名直接透传
- 没有对应 API key 或 API 调用失败时会自动 fallback 到 Demo

Provider 响应兼容层：

- JSON 文本提取在 `src/lib/extractJsonFromText.ts`
- DirectionResult 归一化在 `src/lib/normalizeDirectionResult.ts`
- 服务端会从 markdown code block 或混杂文本中提取 JSON object
- 服务端会映射常见别名，例如 `candidates` / `recommendation` / `package` / `prompts`
- 缺失字段会尽量补齐，不应因为轻微结构差异直接 fallback
- 候选方向必须归一化为 `稳妥型` / `大胆型` / `执行型`
- 只有完全无法提取 JSON 或 normalize 后仍不可用时，才 fallback 到 Demo

环境变量：

```bash
AI_PROVIDER=deepseek

# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# Gemini optional
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
GEMINI_MODEL=gemini-2.5-flash

# OpenAI optional
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-5.5
```

本地开发请创建 `.env.local`，写入真实供应商 API key。不要提交真实 API key。

默认 `AI_PROVIDER=deepseek`。如果 `AI_PROVIDER=deepseek`，读取 `DEEPSEEK_API_KEY` / `DEEPSEEK_BASE_URL` / `DEEPSEEK_MODEL`。如果 `AI_PROVIDER=gemini`，读取 `GEMINI_API_KEY` / `GEMINI_BASE_URL` / `GEMINI_MODEL`。如果 `AI_PROVIDER=openai`，读取 `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL`。

DeepSeek 默认 `DEEPSEEK_BASE_URL=https://api.deepseek.com`，`DEEPSEEK_MODEL=deepseek-chat`。

Gemini 默认 `GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/`，`GEMINI_MODEL=gemini-2.5-flash`。

OpenAI 默认 `OPENAI_BASE_URL=https://api.openai.com/v1`，`OPENAI_MODEL=gpt-5.5`。

DeepSeek 推荐国内用户优先使用，支持国内充值。Gemini 可用于免费额度测试。OpenAI 可选，高质量但需要海外 API 计费条件。

未来如接入阿里云百炼或火山方舟，优先沿用 OpenAI-compatible `baseURL` 的 provider 配置方式，不要把模型供应商写死在 route 里。

当前仍不支持参考图真实识别。API 只接收：

- brief 文本
- 项目类型
- 输出目标
- 风格标签
- 参考图数量
- 参考图文件名
- 参考图 MIME 类型
- 参考图 size

不要上传图片二进制内容给 OpenAI。
不要把图片转 base64。
不要做多模态输入。
不要在前端暴露 API key。

## Generation Experience

- v0.3.4 adds staged loading copy and a result-area skeleton while Live API generation is running.
- Live generation copy should make the 15-40 second wait explicit.
- Demo mode should show a lighter local-generation hint.
- Fallback notices should explain the user-facing outcome without exposing API keys or raw provider errors.
- Do not remove the loading skeleton or stage progression when adjusting generation flow.

## Local / Ollama Provider

- v0.4.0 adds `ollama` as a Local / Ollama provider for local development only.
- Provider list includes `demo`, `deepseek`, `gemini`, `openai`, and `ollama`.
- Ollama defaults: `OLLAMA_BASE_URL=http://localhost:11434`, `OLLAMA_MODEL=qwen2.5:7b`.
- Ollama does not require an API key.
- Supported Ollama model options are allowlisted: `qwen2.5:7b`, `qwen2.5:14b`, `llama3.1:8b`, `deepseek-r1:7b`.
- Vercel production cannot access a user's local `localhost:11434`; if `ollama` is selected online, the API should return a clear error and the frontend should fallback to Demo.
- Do not add automatic model downloads, an Ollama installer, or image recognition.

## Result Quality

- v0.4.1 focuses on live generation result quality, not UI changes or new providers.
- Candidate directions should be clearly differentiated: safe/client-friendly, bold/memorable, and execution-oriented.
- Scores should show real trade-offs rather than average 75-85 values.
- Direction packages should include concrete visual language for material, lighting, composition, color, and avoid rules.
- Proposal copy should be PPT-ready and useful for client-facing review.
- Prompt drafts should be executable, with three distinct variation prompts and practical negative constraints.

## Section Editing

- v0.4.2 adds section-level editing, copying, and partial regeneration.
- Editable sections: Candidate Directions, Recommended Direction, Direction Package, Proposal Copy, Prompt Package, and Execution Advice.
- Each candidate direction card can be edited, copied, or regenerated independently.
- Partial regeneration uses `src/app/api/refine-section/route.ts` and should preserve the current provider/model context.
- Prompt Package is displayed with Chinese and English tabs and should keep both `zh` and `en` prompt payloads.
- Keep legacy flat prompt fields only for compatibility with older saved results; new output should prefer bilingual prompt payloads.

## Result Layout

- v0.4.3 focuses on result layout clarity, not new generation capability.
- Result sections should use collapsible shells with a readable collapsed summary.
- Recommended Direction and Candidate Directions are expanded by default.
- Direction Package, Proposal Copy, Prompt Package, Execution Advice, and Reference Notes should default to collapsed to reduce reading pressure.
- Candidate cards must stay in normal document flow; score bars should not use absolute positioning or overlap following sections.
- Sticky bottom actions require enough page padding so they do not cover the last result section.
- v0.4.3.1 hotfix keeps candidate cards readable with wider responsive columns and replaces raw JSON editing with structured text fields.
- User-facing edit mode should not expose raw JSON/object source.

## Autosave And Recovery

- v0.4.3.2 adds a single current draft autosave in localStorage.
- Current draft is separate from user-saved history; history remains explicit and multi-item.
- Full generation, Demo fallback, section edits, partial regeneration, and input/provider/model changes should update the current draft.
- Do not store image binary data in localStorage; only keep reference image metadata.
- On page load, show a lightweight restore/discard prompt instead of automatically overwriting the current screen.

## Current Version History

当前可见版本号维护在 `src/lib/version.ts`。

页面右下角有轻量版本角标，用于确认本地预览与 Vercel 线上部署是否同步。

每次完成可见功能更新或产品阶段变化时，需要更新 `APP_VERSION`，必要时同步更新 `APP_VERSION_LABEL`。

已知推进记录：

- v0.1：Codex 一次性生成完整 mock MVP
- v0.2：结果页与首页优化成更像提案工具的体验
- v0.2.1：移除 Google Fonts 远程依赖，修复 build 稳定性
- v0.3：新增真实 OpenAI API 生成模式，并保留 mock fallback
- v0.3.1：默认支持 DeepSeek 国内供应商，通过 OpenAI-compatible baseURL 保留 OpenAI / 阿里云百炼 / 火山方舟扩展能力
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

## Do Not Do Unless Explicitly Asked

不要主动做这些事情：

- 不要重建整个项目
- 不要删除已有功能
- 不要扩大真实 AI API 范围；当前只允许文本方向生成，不做图片识别、多轮对话或流式输出
- 不要做登录
- 不要做数据库
- 不要做付费
- 不要做团队协作
- 不要做复杂项目管理
- 不要做 Eagle 插件
- 不要做 PDF 导出
- 不要改 GitHub 远程仓库地址
- 不要把 localhost 当作线上地址
- 不要重新引入 Google Fonts 远程依赖

## Preferred Working Style

每次修改前：

1. 先阅读当前项目结构
2. 说明将修改哪些文件
3. 保持功能不被破坏
4. 小步修改，不要大规模重构
5. 修改后运行 `npm run build`
6. build 通过后再提交

每次完成任务后请总结：

1. 修改了哪些页面或组件
2. 新增或修改了哪些文件
3. 是否影响现有功能
4. `npm run build` 是否通过
5. 是否已经 commit
6. 是否已经 push 到 main
7. Vercel 是否需要等待自动部署

## Current Next Product Direction

当前下一步优先级：

1. 先稳定现有原型
2. 再审查线上体验
3. 再决定是否继续做 UI 细修
4. 再准备第一条自媒体内容
5. 真实 AI API 已进入 v0.3，下一步先验证稳定性和线上体验
6. Skill / Image 2.0 / Deep Research / Agent 模式暂时都不是当前第一优先级

## Notes for Future Codex Sessions

如果这是一个新 Codex 会话，请先阅读本文件，再读取当前代码。

不要假设项目只是 localhost 本地项目。
它已经部署到 Vercel，线上地址是：

https://direction-distiller.vercel.app/
