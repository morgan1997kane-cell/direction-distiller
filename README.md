# Direction Distiller / 方向压缩器

Direction Distiller / 方向压缩器 是一个面向泛视觉设计师的 AI 创意方向压缩工具 MVP 原型。

它帮助视觉设计师把零散灵感、模糊 brief、参考图和项目想法，快速压缩成一套可用于客户提案、团队脑暴和首轮视觉探索的视觉方向包。

当前版本是 mock AI 原型，不接真实 AI API。

## Product Positioning

Direction Distiller 不是普通灵感笔记，也不是聊天式脑暴工具。第一版更偏“提案方向包”：输入模糊想法后，系统输出可比较、可沟通、可继续执行的视觉方向。

页面气质以黑底、高级灰、克制冷色微光、电影感和中文提案语境为主，面向三维设计师、品牌视觉设计师、AI 视觉创作者、广告概念设计师、影像概念设计师和 UI / HMI 视觉设计师。

## Current Capabilities

当前原型已经实现：

- 输入 brief / 灵感片段
- 上传参考图并显示缩略图
- 选择项目类型、输出目标和风格标签
- 使用本地 mock generator 生成结果
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
- 本地 mock generator

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

已知推进记录：

- v0.1：Codex 一次性生成完整 mock MVP
- v0.2：结果页与首页优化成更像提案工具的体验
- v0.2.1：移除 Google Fonts 远程依赖，修复 build 稳定性

相关 Git 提交记录中应包含：

- Initial / Create Next App 初始工程
- Direction Distiller 初版原型
- Proposal-style prototype polish
- Remove remote font dependency for stable build

## Notes for AI Coding Agents

项目根目录包含 `AGENTS.md`。新开 Codex / AI coding agent 会话时，请先阅读 `AGENTS.md`，再读取代码。
