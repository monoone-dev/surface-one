import type { Messages } from "./en";

export const zh: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "为沉静、本地优先的应用打造的设计系统",
    description:
      "SurfaceOne 是一个无障碍的 Angular 设计系统：50 个组件系列、设计令牌、三套支持亮色与暗色的皮肤，以及完整覆盖 latin-ext 的字体。",
  },
  a11y: {
    skipToContent: "跳到主要内容",
    mainNav: "主导航",
    sectionNav: "本节导航",
    breadcrumb: "面包屑导航",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    language: "语言",
    colorMode: "颜色模式",
    externalLink: "（在新标签页中打开）",
    copyCode: "复制代码",
    copied: "已复制",
    onThisPage: "本页内容",
    preview: "实时预览",
  },
  nav: {
    home: "首页",
    components: "组件",
    guide: "指南",
    theme: "主题",
    templates: "模板",
    changelog: "更新日志",
    storybook: "Storybook",
    github: "GitHub",
  },
  colorMode: {
    system: "跟随系统",
    light: "亮色",
    dark: "暗色",
  },
  footer: {
    madeBy: "由 MonoOne 打造。",
    license: "基于项目许可证发布。",
    resources: "资源",
    project: "项目",
    changelog: "更新日志",
    contributing: "参与贡献",
  },
  home: {
    title: "SurfaceOne — Angular 设计系统",
    eyebrow: "设计系统 · v{version}",
    heading: "使用 SurfaceOne 构建沉静、无障碍的界面",
    lead: "以 Signal 为核心的 Angular 组件、设计令牌和三套精心调校的皮肤（支持亮色与暗色），提取自 IndexOne，可直接用于任何应用。",
    getStarted: "快速开始",
    browseComponents: "浏览组件",
    openStorybook: "打开 Storybook",
    installLabel: "安装",
    stats: {
      components: "个组件系列",
      symbols: "个组件和指令",
      skins: "套皮肤 × 亮色/暗色",
      locales: "种文档语言",
    },
    featuresTitle: "产品界面所需的一切",
    features: {
      tokens: {
        title: "令牌优先",
        body: "每一种颜色、圆角、间距和阴影都是 CSS 自定义属性。组件只读取令牌，从不使用硬编码值。",
      },
      skins: {
        title: "三套皮肤，两种模式",
        body: "Studio、Paper 和 Minimalist 重新声明同一组令牌。亮色、暗色或跟随系统，只需一个属性即可切换。",
      },
      a11y: {
        title: "默认无障碍",
        body: "真正的按钮、遵循 WAI-ARIA 实践的 ARIA 模式、可见的焦点、减弱动效以及 AA 级对比度。",
      },
      signals: {
        title: "Signal 与无 Zone",
        body: "独立组件、OnPush、Signal 输入和模型。支持无 Zone 的 Angular 和服务端渲染。",
      },
      fonts: {
        title: "全面支持 latin-ext",
        body: "每款内置字体都附带 latin 和 latin-ext 子集，因此 ą、ł、ő、ř 和 ș 绝不会在单词中途回退到其他字体。",
      },
      frameworks: {
        title: "为更多框架做好准备",
        body: "令牌位于与框架无关的包中。Angular 版本现已推出，Vue 和 React 版本将共享同一基础。",
      },
    },
    showcaseTitle: "组件一览",
    showcaseLead: "下方所有内容均来自真实的包，并以你所选的主题实时渲染。",
    ctaTitle: "用 SurfaceOne 交付你的下一个界面",
    ctaBody: "安装包，加载令牌，然后开始组合。",
  },
  components: {
    title: "组件",
    description:
      "按用途分组的全部 SurfaceOne 组件：布局、元素、表单、数据、导航、浮层、页面构建块、AI 聊天、编辑器和媒体。",
    lead: "每个组件都有独立的入口点，因此应用只会打包它所导入的内容。",
    filterLabel: "筛选组件",
    filterPlaceholder: "按名称筛选…",
    noResults: "没有与“{query}”匹配的组件。",
    count: "{count} 个组件",
    categories: {
      layout: {
        name: "布局",
        description: "搭建界面结构：侧边栏、卡片和分隔线。",
      },
      element: {
        name: "元素",
        description: "小型构建块：按钮、徽章、提示和指示器。",
      },
      form: {
        name: "表单",
        description: "输入框、选择框、开关、滑块和选项控件。",
      },
      data: {
        name: "数据",
        description: "展示记录：表格、条目、列表和空状态。",
      },
      navigation: {
        name: "导航",
        description: "在层级结构中移动。",
      },
      overlay: {
        name: "浮层",
        description: "对话框、面板、菜单、工具提示和消息通知。",
      },
      page: {
        name: "页面",
        description: "路由的标题区和操作。",
      },
      chat: {
        name: "AI 聊天",
        description: "面向助手的会话、消息、气泡和状态标记。",
      },
      editor: {
        name: "编辑器",
        description: "渲染和编写 Markdown。",
      },
      media: {
        name: "媒体",
        description: "录制、播放、转录和时间线。",
      },
    },
    page: {
      import: "导入",
      usage: "用法",
      api: "API 参考",
      selector: "选择器",
      exportAs: "导出为",
      inputs: "输入",
      outputs: "输出",
      name: "名称",
      type: "类型",
      default: "默认值",
      required: "必填",
      twoWay: "双向",
      noInputs: "无输入。",
      openInStorybook: "在 Storybook 中打开",
      viewSource: "查看源码",
      previous: "上一个",
      next: "下一个",
      preview: "预览",
      code: "代码",
      kind: {
        component: "组件",
        directive: "指令",
        pipe: "管道",
      },
    },
    entries: {
      sidebar:
        "可折叠的应用侧边栏，包含头部、分组、菜单、徽章、导轨和内嵌内容区——Angular 版的 shadcn/ui Sidebar。",
      card: "将相关内容组合在一起的容器，包含头部、标题、描述、操作、内容和底部等部分。",
      separator: "内容之间一像素宽的细线，可水平或垂直，可为装饰性或语义性。",
      collapsible:
        "通过触发器显示和隐藏区域，并保持 aria-expanded 与 aria-controls 同步。",
      disclosure: "遵循 WAI-ARIA Disclosure 模式的渐进式展开区块。",
      alert: "用于重要信息的提示框，包含标题、描述、操作和五种色调。",
      avatar: "用户头像，支持首字母回退，未登录时显示通用图标。",
      badge: "用于状态、计数或标签的紧凑标签，提供六种变体和四种状态色。",
      banner: "带前置图标的单行状态提示；错误和警告会通知给屏幕阅读器。",
      button:
        "唯一的按钮组件：六种变体、四种文字尺寸和四种方形图标尺寸，另含按钮组。",
      icon: "以 currentColor 绘制的内联 SVG 图标——无需图标字体，也无需额外请求。",
      kbd: "键盘按键与组合键。",
      logo: "随颜色模式切换的 SurfaceOne、IndexOne 和 Ivy 标志。",
      progress:
        "线性进度条，支持确定与不确定状态，带有无障碍的 progressbar 角色。",
      "download-progress": "带实时说明文字和可选取消操作的进度条。",
      meter: "分段指示器，用于准确度或速度等粗粒度的序数量。",
      skeleton: "内容加载时由宿主决定尺寸的脉动占位符。",
      spinner: "以 currentColor 绘制、可任意尺寸的旋转加载器。",
      input:
        "字段、标签、描述、错误信息以及带附加项的输入组——由系统统一样式的原生输入框。",
      select: "作为表单控件的原生选择框，选项通过内容投影提供。",
      switch: "可用作表单控件的开关，提供两种尺寸。",
      slider: "带强调色填充和圆形滑块的范围滑块，可用作表单控件。",
      "power-slider": "离散档位的范围控件，拖动时预览，松开时提交。",
      segmented: "根据数据渲染的单选分段控件——即“亮色 / 暗色 / 跟随系统”模式。",
      "toggle-group": "切换按钮、切换按钮组和标签页，支持漫游焦点和各种方向。",
      "choice-card":
        "整张卡片即为选项的富单选卡片，只占一个 Tab 停靠点，支持方向键导航。",
      "secret-field":
        "输入、保存和清除 API 密钥等机密信息，并显示已设置 / 未设置状态。",
      "copy-button":
        "将值复制到剪贴板，并短暂显示“已复制”确认，屏幕阅读器也会播报。",
      "input-otp":
        "一次性验证码输入：一个真实的输入框绘制成多个独立格子，因此粘贴、自动填充和屏幕阅读器都能直接使用。",
      stepper:
        "以圆点或编号步骤显示多步骤流程的进度，并附带“第 x 步，共 y 步”计数。",
      "tag-input":
        "以可移除的标签块输入标签：按 Enter 或逗号添加，按退格键删除最后一个，可作为表单控件使用。",
      table: "由列模板定义的紧凑数据表格，支持标题和空状态。",
      item: "由媒体、标题、描述和操作组成的行——适用于列表和设置页。",
      "empty-state": "说明空视图的原因，并提供下一步操作。",
      "source-list": "带标题的来源列表，以标签或行展示，并带有“显示更多”切换。",
      "tree-row": "文件树中的一行，支持缩进、展开切换、选中和操作。",
      dialog:
        "模态对话框和警告对话框，支持焦点管理以及按 Escape 键或点击遮罩关闭。",
      sheet: "停靠在窗口任意边缘的模态面板。",
      menu: "下拉菜单，支持分组、标签、快捷键、复选和单选项、子菜单以及弹出框。",
      "row-menu": "用于行级操作的省略号下拉菜单，处理外部点击和键盘交互。",
      tooltip:
        "用于纯图标控件的悬停和聚焦工具提示，可位于任意一侧，可选带箭头。",
      toaster: "可堆叠的消息通知，支持操作和关闭——队列由应用自行管理。",
      "page-header": "路由的标题区，包含眉标、标题、描述和操作。",
      "page-actions": "文档页面的头部操作：状态、主控件和溢出菜单。",
      chat: "完整的聊天结构：面板、会话、消息、输入框、提交、建议和正在输入指示器。",
      message: "会话中的一条记录：头像、头部、气泡和底部，可起始或末尾对齐。",
      bubble: "消息的对话气泡，提供 default、secondary、muted 和 ghost 变体。",
      marker: "会话中的状态行，例如“正在思考…”或“已搜索 4 条笔记”。",
      markdown:
        "将 GitHub 风格的 Markdown 渲染为正文，并通过工具栏、实时预览和分屏视图进行编辑。",
      "audio-player": "精简的录音播放器，支持跳转、进度、时间和播放速度。",
      recording: "用于录制界面的录制按钮、麦克风开关、音量表和状态球。",
      transcript: "按发言轮次分组、点击即可跳转的转录文本。",
      "side-panel": "停靠在页面旁边的面板，包含标题栏、标题、操作、关闭按钮和可滚动的内容区。",
      "floating-bar": "在录制就绪、进行中或处理中时悬浮于所有应用之上的胶囊条，带有关闭按钮。",
      "live-transcript": "正在进行的录制的字幕日志。",
      timeline:
        "在同一时间刻度上的区块泳道和章节条带，带有播放头、章节和图例。",
    },
  },
  guide: {
    title: "指南",
    description: "了解如何在 Angular 应用中安装、定制主题和使用 SurfaceOne。",
    pages: {
      introduction: {
        title: "简介",
        description:
          "SurfaceOne 是什么、基于什么构建，以及各个包如何协同工作。",
        blocks: [
          {
            p: "SurfaceOne 是 IndexOne 背后的设计系统，已提取为任何应用都能使用的包。它基于 **shadcn/ui** 的约定构建，通过 **spartan/ui** 的结构移植到 Angular，所有值都来自设计令牌。",
          },
          { h2: "包" },
          {
            list: [
              "`@surface-one/tokens` —— 与框架无关的 CSS：令牌、三套亮色与暗色皮肤、强调色以及 latin-ext 字体。",
              "`@surface-one/angular` —— 组件。每个组件系列都有独立的入口点，例如 `@surface-one/angular/button`。",
            ],
          },
          {
            p: "Vue 和 React 包正在计划中。它们将共享 `@surface-one/tokens`，因此同一主题在所有框架中的外观完全一致。",
          },
          { h2: "基于 spartan/ui、shadcn/ui 和 Nuxt UI 构建" },
          {
            list: [
              "**spartan/ui**（ng-spartan）—— Angular 结构：以指令为先的部件、输入名称和行为。",
              "**shadcn/ui** —— 视觉核心：变体、尺寸，以及我们的皮肤所基于的样式。",
              "**Nuxt UI** —— 文档：组件分类、模板、MCP 服务器和智能体技能。",
            ],
          },
          { h2: "原则" },
          {
            list: [
              "**只用令牌。** 组件使用 `var(--token)`；皮肤只重新声明令牌，从不派生组件的分支。",
              "**原生优先。** 按钮就是 `<button>`，选择框就是 `<select>`。ARIA 用于弥补原生 HTML 的不足。",
              "**Signal 与无 Zone。** 独立组件、OnPush、Signal 输入、模型和输出。",
              "**扁平、不透明的界面。** 没有玻璃质感，没有模糊——沉静的界面外观，克制的强调色。",
            ],
          },
          { h2: "命名" },
          {
            p: "所有元素选择器都以 `sone-` 开头（`<sone-dialog>`、`<sone-switch>`），所有属性指令都以 `sone` 开头（`button[soneBtn]`、`[soneCard]`）。TypeScript 符号以 `Sone` 开头。",
          },
          {
            note: "想查看组件的每一种状态？[Storybook](/storybook/) 会通过实时控件渲染每一种状态。",
          },
        ],
      },
      installation: {
        title: "安装",
        description: "只需三步，即可将 SurfaceOne 添加到 Angular 22 应用中。",
        blocks: [
          { h2: "1. 安装包" },
          { code: "install" },
          {
            p: "Markdown 入口点还需要其可选的对等依赖（`marked`、`dompurify` 以及 `@codemirror/*` 包）。只有在导入 `@surface-one/angular/markdown` 时才需要安装它们。",
          },
          { h2: "2. 加载样式" },
          {
            p: "将令牌和组件样式表添加到构建目标的 `styles` 数组中，令牌放在最前面：",
          },
          { code: "angularJson" },
          {
            p: "组件样式特意设为全局：大多数部件通过内容投影或传送门渲染，模拟封装无法作用到这些位置。",
          },
          { h2: "3. 启用本地化" },
          {
            p: "组件使用 `$localize` 标记其内置字符串（例如“关闭”），因此请添加该 polyfill：",
          },
          { code: "localize" },
          { h2: "使用组件" },
          { code: "usage" },
          { p: "接下来，在[主题](/theme)页面中选择皮肤和颜色模式。" },
        ],
      },
      theming: {
        title: "主题定制",
        description: "用三个属性切换皮肤、颜色模式和强调色，并可覆盖任意令牌。",
        blocks: [
          { p: "`<html>` 上的三个属性驱动整个系统：" },
          {
            list: [
              "`data-skin` —— `studio`、`paper` 或 `minimalist`。",
              "`data-theme` —— `light`、`dark` 或 `system`（不设置该属性时同样跟随系统）。",
              "`data-accent` —— `blue`、`teal`、`green`、`orange` 或 `pink`；不设置该属性时使用皮肤自带的强调色。",
            ],
          },
          { code: "themeAttributes" },
          { h2: "避免主题闪烁" },
          {
            p: "在 `index.html` 中用一小段内联脚本，在首次绘制前设置这些属性：",
          },
          { code: "themeScript" },
          { h2: "覆盖令牌" },
          {
            p: "每一项视觉决策都是一个自定义属性。在同一选择器下重新声明它，即可全局生效：",
          },
          { code: "overrideTokens" },
          { p: "在[主题](/theme)页面上实时查看所有令牌。" },
        ],
      },
      fonts: {
        title: "字体",
        description: "自托管的可变字体，包含 latin 和 latin-ext 子集。",
        blocks: [
          {
            p: "`@surface-one/tokens` 内置了其引用的所有字体——Geist、Geist Mono、Figtree、DM Sans、JetBrains Mono 和 Source Serif 4——均为自托管的 WOFF2 可变字体，不从任何 CDN 加载。",
          },
          { h2: "latin-ext 是必需的" },
          {
            p: "每个字体系列都提供两个文件：**latin** 和 **latin-ext**。仅 latin 子集不包含 ą、ć、ę、ł、ń、ś、ź、ż（以及 ő、ř、ș 等），浏览器会在单词中途改用系统字体绘制这些字形。借助 `unicode-range` 拆分，页面只有在渲染这些字符时才会下载 latin-ext 文件。",
          },
          { code: "fontFace" },
          { p: "中文和日文文本会通过各字体栈回退到平台自带的 CJK 字体。" },
          { h2: "添加字体" },
          {
            p: "新字体系列必须同时提供两个子集才会被接受。将两个 WOFF2 文件添加到 `packages/tokens/fonts/`，并在 `fonts.css` 中添加一对 `@font-face` 规则。",
          },
        ],
      },
      accessibility: {
        title: "无障碍",
        description:
          "SurfaceOne 如何满足 WCAG 2.2 AA，以及哪些仍需由你的应用负责。",
        blocks: [
          {
            p: "SurfaceOne 以 **WCAG 2.2 AA 级**为目标。组件遵循 WAI-ARIA 创作实践，本文档站点的每个页面都在亮色和暗色模式下使用 axe-core 进行测试。",
          },
          { h2: "组件负责的部分" },
          {
            list: [
              '优先使用原生元素——`<button>`、`<select>`、`<input type="checkbox">`——从而天然获得键盘和屏幕阅读器支持。',
              '实现 ARIA 模式：展开收起（`aria-expanded`、`aria-controls`）、只有一个 Tab 停靠点并支持方向键的单选组、菜单、可锁定并恢复焦点的对话框，以及带有数值的 `role="progressbar"`。',
              "在每个可交互部件上显示可见的焦点环（`--focus-ring`）。",
              "遵循 `prefers-reduced-motion`，并确保每套皮肤的文本对比度不低于 4.5:1。",
            ],
          },
          { h2: "应用负责的部分" },
          {
            list: [
              "为每个纯图标按钮提供 `aria-label`。",
              "为每个表单控件添加标签——使用 `soneFieldLabel` 或 `<label for>`。",
              "设置 `<html lang>`，并为每个路由设置有意义的文档标题。",
              "播报重要的异步结果，例如使用 toaster 或实时区域。",
            ],
          },
        ],
      },
      i18n: {
        title: "国际化",
        description: "翻译内置字符串，并支持各种文字。",
        blocks: [
          {
            p: "组件本身包含的文本很少，所有内置字符串（“关闭”“显示更多”“正在下载…”）都用 `$localize` 标记。使用标准的 Angular i18n 工作流程进行翻译：",
          },
          { code: "extractI18n" },
          {
            p: "复数使用 ICU 消息，并遵循当前语言环境的复数规则。日期和时长使用 `Intl` 进行格式化。",
          },
          { h2: "本站支持的语言" },
          {
            p: "本文档提供 English、Polski、Español、Italiano、Français、Português、Deutsch、简体中文和日本語版本——与 IndexOne 网站的语言相同。",
          },
        ],
      },
      mcp: {
        title: "MCP 服务器",
        description:
          "让 Claude Code、Codex、GitHub Copilot、Cursor 和 Windsurf 直接访问 SurfaceOne 的文档、API 和令牌。",
        blocks: [
          {
            p: "`@surface-one/angular-mcp` 是一个 Model Context Protocol 服务器。你的 AI 助手会向它查询组件的确切 API、可运行的示例、源代码和样式、指南、页面模板以及主题变量——而不是靠猜测。所有内容都随包一起提供：它可以离线工作，并且始终与你的版本保持一致。",
          },
          { h2: "Claude Code" },
          { code: "mcpClaude" },
          { h2: "Codex" },
          { code: "mcpCodex" },
          { p: "或者将其添加到 `~/.codex/config.toml`：" },
          { code: "mcpCodexToml" },
          { h2: "VS Code 与 GitHub Copilot" },
          { p: "在项目中添加 `.vscode/mcp.json`：" },
          { code: "mcpVsCode" },
          { h2: "Cursor、Windsurf 和 Claude Desktop" },
          { code: "mcpJson" },
          { h2: "工具" },
          {
            list: [
              "`list_components` —— 所有组件系列及其入口点和选择器。",
              "`get_component_docs` —— 说明、导入方式、可运行的示例和完整 API。接受名称、slug、类名或选择器，例如 `soneBtn`。",
              "`get_component_source_code` 和 `get_component_source_styles` —— 实现代码。",
              "`get_docs` —— 指南页面和发布说明。",
              "`get_theme_variables` —— 每套皮肤在亮色和暗色模式下的令牌值。",
              "`list_templates` 和 `get_template` —— 可直接作为起点的完整页面。",
            ],
          },
          { h2: "试着这样问" },
          {
            list: [
              "“用 SurfaceOne 构建一个设置页面：包含一个开关、一个选择框和一个保存按钮。”",
              "“给我看看 SurfaceOne 对话框的 API。”",
              "“Paper 皮肤在暗色模式下使用哪些令牌？”",
            ],
          },
          {
            note: "将服务器与[智能体技能](/guide/skills)搭配使用：技能告诉助手如何使用 SurfaceOne，服务器则为它提供事实。",
          },
        ],
      },
      skills: {
        title: "智能体技能",
        description:
          "用一条命令为 Claude Code、OpenAI Codex 和 GitHub Copilot 安装 SurfaceOne 技能。",
        blocks: [
          {
            p: "智能体技能是包含 `SKILL.md` 的文件夹，助手会在任务需要时加载它们。Claude Code、Codex 和 GitHub Copilot 使用相同的格式，因此一个包即可同时服务这三者。",
          },
          {
            list: [
              "`surface-one-angular` —— 使用组件构建页面：设置、入口点、`sone-` 选择器、令牌、浮层和表单，并附带完整的组件目录。",
              "`surface-one-theming` —— 皮肤、亮色、暗色和跟随系统模式、强调色、令牌覆盖以及 latin-ext 字体。",
              "`surface-one-a11y-review` —— 适用于 SurfaceOne 页面的 WCAG 2.2 AA 检查清单。",
            ],
          },
          { h2: "安装" },
          { code: "skillsAdd" },
          { h2: "安装位置" },
          {
            list: [
              "**Claude Code** —— `.claude/skills/`（全局为 `~/.claude/skills/`）。",
              "**Codex** —— `.agents/skills/`（全局为 `~/.agents/skills/`）。",
              "**GitHub Copilot** —— `.agents/skills/`（全局为 `~/.copilot/skills/`）。",
            ],
          },
          {
            p: "升级 SurfaceOne 后，使用 `--force` 再次运行该命令即可刷新技能。",
          },
          {
            note: "同时添加 [MCP 服务器](/guide/mcp)——技能会在其可用时使用它的工具。",
          },
        ],
      },
      contributing: {
        title: "参与贡献",
        description: "分支、Conventional Commits、拉取请求和代码所有者。",
        blocks: [
          { p: "SurfaceOne 遵循与 IndexOne 相同的规则。" },
          { h2: "分支与提交" },
          {
            list: [
              "分支名称格式为 `<type>/<kebab-slug>`，例如 `feat/sone-calendar`。",
              "提交标题和 PR 标题遵循 Conventional Commits：`<type>(<scope>): <subject>`，最多 100 个字符，主题使用小写。",
              "不添加任何形式的署名——不加 AI 共同作者尾注，也不加“generated with”之类的页脚。",
            ],
          },
          { code: "commit" },
          { h2: "拉取请求" },
          {
            p: "PR 正文使用仓库模板：每项实际改动用一行简短的英文描述。每个 PR 都需要代码所有者批准。",
          },
          { h2: "添加组件" },
          {
            list: [
              "创建 `packages/angular/<name>/`，包含组件、`index.ts` 和 `ng-package.json`。",
              "使用 `sone-` 选择器前缀、OnPush、Signal 输入，并且只使用令牌。",
              "添加 `<name>.stories.ts`，并在文档目录中注册该组件及其演示。",
            ],
          },
        ],
      },
    },
  },
  theme: {
    title: "主题",
    description: "SurfaceOne 的设计令牌、皮肤、颜色模式和强调色——实时呈现。",
    lead: "本页上的每个值都读取自实时令牌。调整控件，整个站点都会随之变化。",
    controls: "主题控件",
    skin: "皮肤",
    mode: "模式",
    accent: "强调色",
    accentDefault: "皮肤默认",
    skins: {
      studio: "Studio",
      paper: "Paper",
      minimalist: "Minimalist",
    },
    accents: {
      blue: "蓝色",
      teal: "青色",
      green: "绿色",
      orange: "橙色",
      pink: "粉色",
    },
    sections: {
      colors: "颜色角色",
      colorsLead: "语义化颜色。组件使用这些名称，而不是具体的色阶。",
      palette: "强调色色板",
      typography: "排版",
      typographyLead: "所有皮肤共享的字号阶梯。",
      radius: "圆角",
      spacing: "间距",
      shadows: "阴影",
      tokens: "全部令牌",
      tokensLead: "@surface-one/tokens 的令牌文件及每个文件声明的自定义属性。",
    },
    sample: "天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。 — Zażółć gęślą jaźń",
    reset: "重置",
  },
  templates: {
    title: "模板",
    description:
      "由 SurfaceOne 组件组合而成的现成界面：仪表盘、AI 聊天、设置和会议纪要。",
    lead: "完全使用该包构建的完整界面。可复制它们作为起点。",
    view: "查看模板",
    back: "全部模板",
    items: {
      dashboard: {
        title: "仪表盘",
        description: "带侧边栏的应用外壳，包含页面标题、统计卡片和数据表格。",
      },
      chat: {
        title: "AI 聊天",
        description: "助手会话，包含消息、标记、建议和输入框。",
      },
      settings: {
        title: "设置",
        description: "分组的偏好设置，包含字段、开关、选项卡片和机密信息。",
      },
      notes: {
        title: "会议纪要",
        description: "一段录音，配有音频播放器、转录文本和渲染后的笔记。",
      },
    },
  },
  changelog: {
    title: "更新日志",
    description:
      "SurfaceOne 的每个版本，从新到旧：新组件、修复和不兼容变更，以及每个版本的发布日期。",
    eyebrow: "更新日志",
    heading: "SurfaceOne 的新变化",
    lead: "设计系统的每个版本，从新到旧。令牌、Angular 组件、MCP 服务器和技能共用同一个版本号。",
    npm: "从 npm 安装",
    github: "GitHub 上的所有版本",
    latest: "最新",
    englishNote: "版本说明以英文发布。",
    versions: "版本",
  },
  notFound: {
    title: "页面未找到",
    description: "你要查找的页面不存在。",
    back: "返回首页",
  },
};
