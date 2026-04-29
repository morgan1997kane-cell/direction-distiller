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

## Provider Response Normalization

服务端会对模型返回做兼容解析：

- 支持从 markdown code block 或混杂文本中提取 JSON object
- 支持字段别名映射，例如 `candidates` / `recommendation` / `package` / `prompts`
- 缺失字段会尽量补齐为当前前端可用的 `DirectionResult`
- 候选方向会归一化为 `稳妥型` / `大胆型` / `执行型` 三个方向
- `recommended_direction.candidate_id` 会修正到合法候选 id
- 只有完全无法提取 JSON 或 normalize 后仍不可用时，才 fallback 到 Demo

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

## Notes for AI Coding Agents

项目根目录包含 `AGENTS.md`。新开 Codex / AI coding agent 会话时，请先阅读 `AGENTS.md`，再读取代码。
