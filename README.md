# gd-agentic-skills-use-router

将 [GD-Agentic-Skills](https://github.com/thedivergentai/GD-Agentic-Skills) 打包成一个 `gd-agentic-skills-use` 入口 skill。参考本地 `chrisbanes-skills-use-router`：上游 Git 子模块 + 生成器 + 按需参考文档 + 校验器 + 自动更新工作流。

只安装一个入口，按任务读取 Godot 技术文档。广泛架构任务先到 `godot-master`；具体主题通过生成索引直达；引擎升级直达 `godot-version-migration`。

## 生成与校验

需要 Git 和 Node.js 20+，没有 npm 依赖。

```bash
git submodule update --init --recursive
npm run generate
npm run validate
npm test
```

使用其他干净的上游 Git checkout：

```bash
npm run generate -- --source /path/to/GD-Agentic-Skills/skills
```

参数 `--source`、`--output`、`--template` 的相对路径均相对于本仓库。已有输出目录必须能识别为本项目生成的 skill 才会替换。生成期间先在临时目录校验，再替换旧输出。

```text
skills/gd-agentic-skills-use/
├── SKILL.md
├── agents/openai.yaml
├── UPSTREAM-LICENSE
├── UPSTREAM.md
├── manifest.json
└── references/
    ├── index.md
    └── godot-*/
        ├── DOC.md
        ├── references/ ...
        └── scripts/ ...
```

上游条目从实际 `skills/*/SKILL.md` 发现，版本及数量以 `manifest.json` 为准。生成器移除 Markdown frontmatter，将入口改名为 `DOC.md`，把已打包文档的上游链接改为本地链接，并记录可确定目标的链接修复。脚本和资源按原字节复制，保留文件权限；每项技能的 `agents/` 配置不复制。

`godot-master` 的镜像文档与脚本保留，因为其相对路径与独立技能不同。许可证保留在 `UPSTREAM-LICENSE`，修改说明在 `UPSTREAM.md`。复制这些文档不代表已验证其中所有 Godot API 或运行脚本；使用时按项目实际引擎版本和依赖选择。

## 本地安装

在本仓库运行：

```bash
npx -y skills add ./skills/gd-agentic-skills-use -g -y
```

或使用本项目直接安装器：

```bash
cp .env.example .env
# 修改 GD_AGENTIC_SKILLS_USE_INSTALL_TARGETS 后执行
npm run install-local
```

目标可设为 `~/.codex` 或其 `skills` 子目录；多个目标用冒号分隔。安装器先校验生成产物，再替换目标中的同名 skill。项目创建本身不会安装到全局。

调用示例：`使用 $gd-agentic-skills-use 帮我设计 Godot 俯视角游戏的角色与交互系统。`

## 更新上游

```bash
git -C upstream/gd-agentic-skills fetch --tags --prune origin
git -C upstream/gd-agentic-skills checkout --detach origin/main
npm run generate
npm run validate
npm test
```

也可以 checkout 指定提交或标签。生成版本包含 router 版本和上游 revision；完整 SHA 记录在 manifest，支持没有标签的上游。修改 router 行为时同步增加 `package.json` 版本，再生成。

生成产物与子模块指针应一起提交。发布到 GitHub 后，`update-skills.yml` 每日检查上游 main 并在校验通过后提交到仓库默认分支；需要 Actions 的 contents write 权限及允许该分支推送。`validate.yml` 检查生成结果是否已提交。本地仓库尚未配置远程，因此定时更新要在发布后才会运行。
