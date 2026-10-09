import type { Messages } from "./en";

export const pt: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "O design system para apps tranquilos e local-first",
    description:
      "SurfaceOne é um design system acessível para Angular: 50 famílias de componentes, design tokens, três skins nos modos claro e escuro, e fontes com cobertura completa de latin-ext.",
  },
  a11y: {
    skipToContent: "Pular para o conteúdo",
    mainNav: "Principal",
    sectionNav: "Seção",
    breadcrumb: "Trilha de navegação",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    language: "Idioma",
    colorMode: "Modo de cor",
    externalLink: "(abre em uma nova aba)",
    copyCode: "Copiar código",
    copied: "Copiado",
    onThisPage: "Nesta página",
    preview: "Pré-visualização ao vivo",
  },
  nav: {
    home: "Início",
    components: "Componentes",
    guide: "Guia",
    theme: "Tema",
    templates: "Templates",
    changelog: "Changelog",
    storybook: "Storybook",
    github: "GitHub",
  },
  colorMode: {
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
  },
  footer: {
    madeBy: "Feito pela MonoOne.",
    license: "Publicado sob a licença do projeto.",
    resources: "Recursos",
    project: "Projeto",
    changelog: "Changelog",
    contributing: "Como contribuir",
  },
  home: {
    title: "SurfaceOne — design system para Angular",
    eyebrow: "Design system · v{version}",
    heading: "Crie interfaces tranquilas e acessíveis com SurfaceOne",
    lead: "Componentes Angular baseados em signals, design tokens e três skins ajustadas à mão — nos modos claro e escuro — extraídos do IndexOne e prontos para qualquer app.",
    getStarted: "Começar",
    browseComponents: "Ver componentes",
    openStorybook: "Abrir o Storybook",
    installLabel: "Instalação",
    stats: {
      components: "famílias de componentes",
      symbols: "componentes e diretivas",
      skins: "skins × claro/escuro",
      locales: "idiomas da documentação",
    },
    featuresTitle: "Tudo o que a interface de um produto precisa",
    features: {
      tokens: {
        title: "Tokens em primeiro lugar",
        body: "Cada cor, raio, espaçamento e sombra é uma propriedade personalizada CSS. Os componentes leem tokens, nunca valores fixos.",
      },
      skins: {
        title: "Três skins, dois modos",
        body: "Studio, Paper e Minimalist redeclaram os mesmos tokens. Claro, escuro ou sistema — alternados com um único atributo.",
      },
      a11y: {
        title: "Acessível por padrão",
        body: "Botões de verdade, padrões ARIA das práticas WAI-ARIA, foco visível, movimento reduzido e contraste AA.",
      },
      signals: {
        title: "Signals e zoneless",
        body: "Standalone, OnPush, inputs e models com signals. Funciona com Angular zoneless e renderização no servidor.",
      },
      fonts: {
        title: "latin-ext em todo lugar",
        body: "Toda fonte incluída traz os subconjuntos latin e latin-ext, então ą, ł, ő, ř e ș nunca trocam de fonte no meio da palavra.",
      },
      frameworks: {
        title: "Pronto para mais frameworks",
        body: "Os tokens ficam em um pacote independente de framework. Angular e Vue / Nuxt já estão disponíveis; React vai compartilhar a mesma base.",
      },
    },
    showcaseTitle: "Uma amostra dos componentes",
    showcaseLead:
      "Tudo abaixo é o pacote real, renderizado ao vivo com o tema que você escolheu.",
    ctaTitle: "Entregue sua próxima tela com SurfaceOne",
    ctaBody: "Instale o pacote, carregue os tokens e comece a compor.",
  },
  components: {
    title: "Componentes",
    description:
      "Todos os componentes do SurfaceOne, agrupados por função: layout, elementos, formulários, dados, navegação, sobreposições, blocos de página, chat com IA, editor e mídia.",
    lead: "Cada componente tem seu próprio entry point, então um app só inclui no bundle o que importa.",
    filterLabel: "Filtrar componentes",
    filterPlaceholder: "Filtrar por nome…",
    noResults: "Nenhum componente corresponde a “{query}”.",
    count: "{count} componentes",
    categories: {
      layout: {
        name: "Layout",
        description: "Estruture uma tela: barras laterais, cards e divisores.",
      },
      element: {
        name: "Elemento",
        description:
          "Os blocos básicos: botões, badges, alertas e indicadores.",
      },
      form: {
        name: "Formulário",
        description:
          "Campos, seletores, interruptores, sliders e controles de escolha.",
      },
      data: {
        name: "Dados",
        description:
          "Exiba registros: tabelas, itens, listas e estados vazios.",
      },
      navigation: {
        name: "Navegação",
        description: "Percorra hierarquias.",
      },
      overlay: {
        name: "Sobreposição",
        description: "Diálogos, painéis, menus, tooltips e toasts.",
      },
      page: {
        name: "Página",
        description: "Cabeçalhos e ações de uma rota.",
      },
      chat: {
        name: "Chat com IA",
        description:
          "Threads, mensagens, balões e marcadores de status para assistentes.",
      },
      editor: {
        name: "Editor",
        description: "Renderize e escreva markdown.",
      },
      media: {
        name: "Mídia",
        description: "Gravação, reprodução, transcrições e linhas do tempo.",
      },
    },
    page: {
      import: "Importação",
      usage: "Uso",
      api: "Referência da API",
      selector: "Seletor",
      exportAs: "Exportado como",
      inputs: "Inputs",
      outputs: "Outputs",
      name: "Nome",
      type: "Tipo",
      default: "Padrão",
      required: "obrigatório",
      twoWay: "bidirecional",
      noInputs: "Nenhum input.",
      openInStorybook: "Abrir no Storybook",
      viewSource: "Ver código-fonte",
      previous: "Anterior",
      next: "Próximo",
      preview: "Pré-visualização",
      code: "Código",
      framework: "Framework",
      vueMissing: "Ainda não há componente Vue — este existe só em Angular.",
      vueReadme: "Veja o que o pacote Vue inclui",
      nuxtNote:
        "No Nuxt, adicione `@surface-one/vue/nuxt` a `modules` em `nuxt.config.ts`: ele importa automaticamente todos os componentes `Sone*`, então o import acima é opcional.",
      kind: {
        component: "Componente",
        directive: "Diretiva",
        pipe: "Pipe",
      },
    },
    entries: {
      sidebar:
        "Uma barra lateral de aplicativo recolhível com cabeçalho, grupos, menus, badges, rail e área de conteúdo recuada — o Sidebar do shadcn/ui para Angular.",
      card: "Uma superfície que agrupa conteúdo relacionado, com cabeçalho, título, descrição, ação, conteúdo e rodapé.",
      separator:
        "Uma linha fina de um pixel entre conteúdos, horizontal ou vertical, decorativa ou semântica.",
      collapsible:
        "Mostre e oculte uma região com um gatilho que mantém aria-expanded e aria-controls sincronizados.",
      disclosure:
        "Uma seção de revelação progressiva que segue o padrão Disclosure do WAI-ARIA.",
      alert:
        "Um destaque para informações importantes, com título, descrição, ação e cinco tons.",
      avatar:
        "Uma imagem de usuário com fallback para iniciais e um ícone genérico quando a sessão está encerrada.",
      badge:
        "Um rótulo compacto para status, contagens ou tags, com seis variantes e quatro tons de status.",
      banner:
        "Um aviso de status em uma linha com um ícone à frente; erros e alertas são anunciados aos leitores de tela.",
      button:
        "O botão único: seis variantes, quatro tamanhos de texto e quatro tamanhos de ícone quadrado, além de grupos de botões.",
      icon: "Ícones SVG inline desenhados em currentColor — sem fonte de ícones, sem requisição extra.",
      kbd: "Teclas e combinações de teclas.",
      logo: "As marcas SurfaceOne, IndexOne e Ivy, que mudam conforme o modo de cor.",
      progress:
        "Uma barra de progresso linear, determinada ou indeterminada, com o papel acessível progressbar.",
      "download-progress":
        "Uma barra de progresso com legenda atualizada ao vivo e uma ação de cancelar opcional.",
      meter:
        "Um indicador segmentado para quantidades ordinais aproximadas, como precisão ou velocidade.",
      skeleton:
        "Um placeholder pulsante dimensionado pelo elemento host enquanto o conteúdo carrega.",
      spinner:
        "Um indicador de carregamento giratório desenhado em currentColor, em qualquer tamanho.",
      input:
        "Campos, rótulos, descrições, erros e grupos de input com complementos — inputs nativos estilizados pelo sistema.",
      select:
        "Um select nativo como controle de formulário, com opções projetadas.",
      switch:
        "Um interruptor liga/desliga que funciona como controle de formulário, em dois tamanhos.",
      slider:
        "Um slider de intervalo com preenchimento na cor de destaque e um controle redondo, utilizável como controle de formulário.",
      "power-slider":
        "Uma escala discreta como controle de intervalo, que mostra uma prévia enquanto você arrasta e confirma ao soltar.",
      segmented:
        "Um controle segmentado de escolha única renderizado a partir de dados — o padrão Claro / Escuro / Sistema.",
      "toggle-group":
        "Toggles, grupos de toggles e abas com foco itinerante e em qualquer orientação.",
      "choice-card":
        "Cards de rádio ricos em que o card inteiro é a opção, com uma única parada de tabulação e navegação pelas setas.",
      "secret-field":
        "Digite, salve e limpe um segredo, como uma chave de API, com status definido / não definido.",
      "copy-button":
        "Copie um valor para a área de transferência com uma breve confirmação “Copiado” que os leitores de ecrã também ouvem.",
      "input-otp":
        "Um campo de código de uso único: um único campo real desenhado como casas separadas, para que colar, o preenchimento automático e os leitores de ecrã simplesmente funcionem.",
      "password-input":
        "Um campo de palavra-passe com um botão mostrar / ocultar, como controlo de formulário.",
      stepper:
        "O progresso num fluxo de várias etapas como pontos ou etapas numeradas, com o contador “Etapa x de y”.",
      "tag-input":
        "Escreva etiquetas como chips removíveis: Enter ou uma vírgula adiciona uma, Backspace remove a última; funciona como controlo de formulário.",
      table:
        "Uma tabela de dados densa definida por templates de coluna, com legenda e estado vazio.",
      item: "Uma linha com mídia, título, descrição e ações — para listas e configurações.",
      "empty-state": "Explique uma tela vazia e ofereça o próximo passo.",
      "source-list":
        "Uma lista de fontes com título, em chips ou linhas, com um botão “mostrar mais”.",
      "chart-legend":
        "Amostras de cor e uma legenda de gráfico cujos itens podem mostrar ou ocultar séries.",
      "stacked-bar":
        "Uma barra dividida nas partes de um total, com trilho restante opcional, legenda e um resumo para leitores de tela.",
      stat: "Números-chave em uma lista de descrição: rótulo, valor, observação e tendência, como cards, blocos rebaixados ou uma linha simples.",
      "tree-row":
        "Uma linha de árvore de arquivos com recuo, botão de expandir, seleção e ações.",
      dialog:
        "Diálogos modais e diálogos de alerta com gerenciamento de foco e fechamento por Esc e pelo clique no fundo.",
      sheet: "Um painel modal ancorado em qualquer borda da janela.",
      menu: "Menus suspensos com grupos, rótulos, atalhos, itens de checkbox e rádio, submenus e popovers.",
      "row-menu":
        "O menu suspenso de reticências para ações por linha, com tratamento de clique externo e teclado.",
      tooltip:
        "Uma tooltip de hover e foco para controles só com ícone, em qualquer lado, com seta opcional.",
      toaster:
        "Notificações toast empilhadas com ações e fechamento — o app controla a fila.",
      "page-header":
        "O bloco de título de uma rota, com sobretítulo, título, descrição e ações.",
      "page-actions":
        "As ações de cabeçalho de uma página de documento: status, um controle principal e um menu de overflow.",
      chat: "A anatomia completa do chat: painel, thread, mensagens, compositor, envio, sugestões e indicador de digitação.",
      message:
        "Uma entrada da thread: avatar, cabeçalho, balões e rodapé, alinhada no início ou no fim.",
      bubble:
        "O balão de fala de uma mensagem, nas variantes default, secondary, muted e ghost.",
      marker:
        "Uma linha de status na thread, como “Pensando…” ou “4 notas pesquisadas”.",
      markdown:
        "Renderize markdown no estilo GitHub como texto formatado e edite-o com barra de ferramentas, pré-visualização ao vivo e visualização dividida.",
      "audio-player":
        "Um player de gravação compacto com avanço/retrocesso, progresso, tempo e velocidade de reprodução.",
      recording:
        "Botão de gravar, alternância do microfone, medidor de nível, orbe de status, cronômetro, indicador de gravação e status de processamento para interfaces de captura.",
      "speaker-chip":
        "As iniciais de quem fala em um avatar na cor do seu papel e o seu nome, obtidos de uma única chave de falante da transcrição.",
      transcript:
        "Uma transcrição agrupada por turno de fala, em que um clique leva ao trecho correspondente.",
      "side-panel":
        "Um painel acoplado ao lado da página, com cabeçalho, título, ações, botão de fechar e um corpo com rolagem.",
      "floating-bar":
        "A pílula que flutua sobre todos os apps enquanto a gravação está pronta, em andamento ou em processamento, com um botão de fechar.",
      "live-transcript": "O registro de legendas de uma gravação em andamento.",
      timeline:
        "Faixas de blocos e uma faixa de capítulos em uma mesma escala de tempo, com cursor de reprodução, capítulos e legenda.",
    },
  },
  guide: {
    title: "Guia",
    description:
      "Aprenda a instalar, personalizar o tema e usar o SurfaceOne em um app Angular.",
    pages: {
      introduction: {
        title: "Introdução",
        description:
          "O que é o SurfaceOne, em que ele se baseia e como os pacotes se encaixam.",
        blocks: [
          {
            p: "SurfaceOne é o design system por trás do IndexOne, extraído em pacotes que qualquer app pode usar. Ele segue as convenções do **shadcn/ui**, portadas para Angular pela anatomia do **spartan/ui**, e lê todos os valores de design tokens.",
          },
          { h2: "Pacotes" },
          {
            list: [
              "`@surface-one/tokens` — CSS independente de framework: tokens, as três skins nos modos claro e escuro, cores de destaque e fontes latin-ext.",
              "`@surface-one/angular` — os componentes. Cada família de componentes tem seu próprio entry point, como `@surface-one/angular/button`.",
            ],
          },
          {
            p: "`@surface-one/vue` leva os mesmos componentes para Vue 3 e Nuxt (com o módulo `@surface-one/vue/nuxt`), e um pacote para React está planejado. Todos compartilham `@surface-one/tokens`, para que um tema fique idêntico em qualquer framework.",
          },
          { h2: "Baseado em spartan/ui, shadcn/ui e Nuxt UI" },
          {
            list: [
              "**spartan/ui** (ng-spartan) — a anatomia Angular: partes baseadas em diretivas, nomes de inputs e comportamento.",
              "**shadcn/ui** — o núcleo visual: variantes, tamanhos e os estilos sobre os quais nossas skins são construídas.",
              "**Nuxt UI** — a documentação: categorias de componentes, templates, o servidor MCP e as skills de agente.",
            ],
          },
          { h2: "Princípios" },
          {
            list: [
              "**Somente tokens.** Os componentes consomem `var(--token)`; uma skin redeclara tokens e nunca cria um fork de um componente.",
              "**Nativo primeiro.** Um botão é um `<button>`, um seletor é um `<select>`. O ARIA preenche as lacunas que o HTML nativo deixa.",
              "**Signals e zoneless.** Componentes standalone, OnPush, inputs, models e outputs com signals.",
              "**Superfícies planas e opacas.** Sem vidro, sem desfoque — uma interface tranquila com um destaque contido.",
            ],
          },
          { h2: "Nomenclatura" },
          {
            p: "Todo seletor de elemento começa com `sone-` (`<sone-dialog>`, `<sone-switch>`) e toda diretiva de atributo com `sone` (`button[soneBtn]`, `[soneCard]`). Os símbolos TypeScript começam com `Sone`.",
          },
          {
            note: "Quer explorar todos os estados de um componente? O [Storybook](/storybook/) renderiza cada um com controles ao vivo.",
          },
        ],
      },
      installation: {
        title: "Instalação",
        description:
          "Adicione o SurfaceOne a uma aplicação Angular 22 em três passos.",
        blocks: [
          { h2: "1. Instale os pacotes" },
          { code: "install" },
          {
            p: "O entry point de markdown também precisa das suas peer dependencies opcionais (`marked`, `dompurify` e os pacotes `@codemirror/*`). Instale-as apenas se você importar `@surface-one/angular/markdown`.",
          },
          { h2: "2. Carregue os estilos" },
          {
            p: "Adicione os tokens e a folha de estilos dos componentes ao array `styles` do seu build target, com os tokens primeiro:",
          },
          { code: "angularJson" },
          {
            p: "Os estilos dos componentes são globais de propósito: a maioria das partes é projetada ou renderizada em portais, onde o encapsulamento emulado não alcança.",
          },
          { h2: "3. Ative a localização" },
          {
            p: "Os componentes marcam suas strings embutidas (como “Close”) com `$localize`, então adicione o polyfill:",
          },
          { code: "localize" },
          { h2: "Use um componente" },
          { code: "usage" },
          {
            p: "Em seguida, escolha uma skin e um modo de cor na página [Tema](/theme).",
          },
        ],
      },
      theming: {
        title: "Temas",
        description:
          "Troque skins, modos de cor e cores de destaque com três atributos, e sobrescreva qualquer token.",
        blocks: [
          { p: "Três atributos em `<html>` controlam todo o sistema:" },
          {
            list: [
              "`data-skin` — `studio`, `paper` ou `minimalist`.",
              "`data-theme` — `light`, `dark` ou `system` (sem o atributo, o sistema também é seguido).",
              "`data-accent` — `blue`, `teal`, `green`, `orange` ou `pink`; sem o atributo, vale a cor de destaque da própria skin.",
            ],
          },
          { code: "themeAttributes" },
          { h2: "Evite o flash do tema errado" },
          {
            p: "Defina os atributos antes da primeira renderização com um pequeno script inline no `index.html`:",
          },
          { code: "themeScript" },
          { h2: "Sobrescreva tokens" },
          {
            p: "Toda decisão visual é uma propriedade personalizada. Redeclare uma sob o mesmo seletor para alterá-la em todo lugar:",
          },
          { code: "overrideTokens" },
          { p: "Veja todos os tokens, ao vivo, na página [Tema](/theme)." },
        ],
      },
      fonts: {
        title: "Fontes",
        description:
          "Fontes variáveis auto-hospedadas com os subconjuntos latin e latin-ext.",
        blocks: [
          {
            p: "`@surface-one/tokens` inclui todas as fontes que referencia — Geist, Geist Mono, Figtree, DM Sans, JetBrains Mono e Source Serif 4 — como fontes variáveis WOFF2 auto-hospedadas. Nada é carregado de uma CDN.",
          },
          { h2: "latin-ext é obrigatório" },
          {
            p: "Cada família vem em dois arquivos: **latin** e **latin-ext**. O subconjunto latin sozinho não tem ą, ć, ę, ł, ń, ś, ź, ż (nem ő, ř, ș …), então o navegador desenharia esses glifos com uma fonte do sistema no meio da palavra. A divisão por `unicode-range` faz com que a página só baixe o arquivo latin-ext quando renderiza um desses caracteres.",
          },
          { code: "fontFace" },
          {
            p: "Textos em chinês e japonês recorrem à fonte CJK da própria plataforma por meio de cada pilha de fontes.",
          },
          { h2: "Adicionando uma fonte" },
          {
            p: "Uma nova família só é aceita com os dois subconjuntos. Adicione os dois arquivos WOFF2 em `packages/tokens/fonts/` e um par de regras `@font-face` em `fonts.css`.",
          },
        ],
      },
      accessibility: {
        title: "Acessibilidade",
        description:
          "Como o SurfaceOne atende ao WCAG 2.2 AA e o que ainda é responsabilidade do seu app.",
        blocks: [
          {
            p: "O SurfaceOne busca o **nível AA do WCAG 2.2**. Os componentes seguem as WAI-ARIA Authoring Practices, e este site de documentação é testado com axe-core em todas as páginas, nos modos claro e escuro.",
          },
          { h2: "O que os componentes fazem" },
          {
            list: [
              'Usam elementos nativos primeiro — `<button>`, `<select>`, `<input type="checkbox">` — para que o suporte a teclado e leitores de tela venha de graça.',
              'Implementam os padrões ARIA: disclosure (`aria-expanded`, `aria-controls`), grupos de rádio com uma única parada de tabulação e setas, menus, diálogos que prendem e restauram o foco, `role="progressbar"` com valores.',
              "Exibem um anel de foco visível em toda parte interativa (`--focus-ring`).",
              "Respeitam `prefers-reduced-motion` e mantêm o contraste do texto em 4,5:1 ou mais em todas as skins.",
            ],
          },
          { h2: "O que é responsabilidade do seu app" },
          {
            list: [
              "Dar um `aria-label` a todo botão só com ícone.",
              "Rotular todo controle de formulário — use `soneFieldLabel` ou um `<label for>`.",
              "Definir `<html lang>` e um título de documento significativo para cada rota.",
              "Anunciar os resultados assíncronos relevantes, por exemplo com o toaster ou uma live region.",
            ],
          },
        ],
      },
      i18n: {
        title: "Internacionalização",
        description:
          "Traduza as strings embutidas e dê suporte a todos os sistemas de escrita.",
        blocks: [
          {
            p: "Os componentes têm pouquíssimo texto próprio, e toda string embutida (“Close”, “Show more”, “Downloading…”) é marcada com `$localize`. Traduza-as com o fluxo padrão de i18n do Angular:",
          },
          { code: "extractI18n" },
          {
            p: "Os plurais usam mensagens ICU e seguem as regras de plural da locale ativa. Datas e durações são formatadas com `Intl`.",
          },
          { h2: "Idiomas deste site" },
          {
            p: "Esta documentação está disponível em English, Polski, Español, Italiano, Français, Português, Deutsch, 简体中文 e 日本語 — os mesmos idiomas do site do IndexOne.",
          },
        ],
      },
      mcp: {
        title: "Servidor MCP",
        description:
          "Dê ao Claude Code, Codex, GitHub Copilot, Cursor e Windsurf acesso direto à documentação, à API e aos tokens do SurfaceOne.",
        blocks: [
          {
            p: "`@surface-one/angular-mcp` é um servidor Model Context Protocol. Seu assistente de IA pede a ele a API exata de um componente, um exemplo funcional, o código-fonte e os estilos, os guias, os templates de telas e as variáveis de tema — em vez de adivinhar. Tudo vem incluído no pacote: funciona offline e sempre corresponde à sua versão.",
          },
          { h2: "Claude Code" },
          { code: "mcpClaude" },
          { h2: "Codex" },
          { code: "mcpCodex" },
          { p: "Ou adicione-o ao `~/.codex/config.toml`:" },
          { code: "mcpCodexToml" },
          { h2: "VS Code com GitHub Copilot" },
          { p: "Adicione `.vscode/mcp.json` ao seu projeto:" },
          { code: "mcpVsCode" },
          { h2: "Cursor, Windsurf e Claude Desktop" },
          { code: "mcpJson" },
          { h2: "Ferramentas" },
          {
            list: [
              "`list_components` — todas as famílias de componentes com seu entry point e seletores.",
              "`get_component_docs` — descrição, import, um exemplo funcional e a API completa. Aceita nomes, slugs, classes ou seletores como `soneBtn`.",
              "`get_component_source_code` e `get_component_source_styles` — a implementação.",
              "`get_docs` — páginas de guia e notas de versão.",
              "`get_theme_variables` — valores dos tokens de cada skin nos modos claro e escuro.",
              "`list_templates` e `get_template` — telas completas para começar.",
            ],
          },
          { h2: "Experimente pedir" },
          {
            list: [
              "“Crie uma página de configurações com SurfaceOne: um switch, um select e um botão de salvar.”",
              "“Mostre a API do dialog do SurfaceOne.”",
              "“Quais tokens a skin Paper usa no modo escuro?”",
            ],
          },
          {
            note: "Combine o servidor com as [skills de agente](/guide/skills): as skills dizem ao seu assistente como trabalhar com o SurfaceOne, e o servidor fornece os fatos.",
          },
        ],
      },
      skills: {
        title: "Skills de agente",
        description:
          "Instale as skills do SurfaceOne para Claude Code, OpenAI Codex e GitHub Copilot com um único comando.",
        blocks: [
          {
            p: "Skills de agente são pastas com um `SKILL.md` que o assistente carrega quando uma tarefa precisa delas. Claude Code, Codex e GitHub Copilot compartilham o formato, então um único pacote atende aos três.",
          },
          {
            list: [
              "`surface-one-angular` — construir telas com os componentes: configuração, entry points, seletores `sone-`, tokens, overlays e formulários, com o catálogo completo de componentes.",
              "`surface-one-theming` — skins, modos claro, escuro e sistema, cores de destaque, sobrescrita de tokens e fontes latin-ext.",
              "`surface-one-a11y-review` — um checklist WCAG 2.2 AA para telas do SurfaceOne.",
            ],
          },
          { h2: "Instalação" },
          { code: "skillsAdd" },
          { h2: "Onde elas ficam" },
          {
            list: [
              "**Claude Code** — `.claude/skills/` (globalmente `~/.claude/skills/`).",
              "**Codex** — `.agents/skills/` (globalmente `~/.agents/skills/`).",
              "**GitHub Copilot** — `.agents/skills/` (globalmente `~/.copilot/skills/`).",
            ],
          },
          {
            p: "Depois de atualizar o SurfaceOne, execute o comando novamente com `--force` para atualizar as skills.",
          },
          {
            note: "Adicione também o [servidor MCP](/guide/mcp) — as skills usam as ferramentas dele quando ele está disponível.",
          },
        ],
      },
      contributing: {
        title: "Como contribuir",
        description:
          "Branches, Conventional Commits, pull requests e code owners.",
        blocks: [
          { p: "O SurfaceOne segue as mesmas regras do IndexOne." },
          { h2: "Branches e commits" },
          {
            list: [
              "Os nomes de branch seguem o formato `<type>/<kebab-slug>`, por exemplo `feat/sone-calendar`.",
              "Cabeçalhos de commit e títulos de PR seguem os Conventional Commits: `<type>(<scope>): <subject>`, com no máximo 100 caracteres e assunto em minúsculas.",
              "Nenhum tipo de atribuição — nada de trailers de coautoria de IA ou rodapés “generated with”.",
            ],
          },
          { code: "commit" },
          { h2: "Pull requests" },
          {
            p: "O corpo do PR é o template do repositório: uma linha curta por mudança real, em inglês simples. Todo PR precisa da aprovação de um code owner.",
          },
          { h2: "Adicionando um componente" },
          {
            list: [
              "Crie `packages/angular/<name>/` com o componente, `index.ts` e `ng-package.json`.",
              "Use o prefixo de seletor `sone-`, OnPush, inputs com signals e somente tokens.",
              "Adicione `<name>.stories.ts` e registre o componente no catálogo da documentação com uma demo.",
            ],
          },
        ],
      },
    },
  },
  theme: {
    title: "Tema",
    description:
      "Design tokens, skins, modos de cor e cores de destaque do SurfaceOne — ao vivo.",
    lead: "Todos os valores desta página são lidos dos tokens ativos. Altere os controles e o site inteiro acompanha.",
    controls: "Controles do tema",
    skin: "Skin",
    mode: "Modo",
    accent: "Destaque",
    accentDefault: "Padrão da skin",
    skins: {
      studio: "Studio",
      paper: "Paper",
      minimalist: "Minimalist",
    },
    accents: {
      blue: "Azul",
      teal: "Verde-azulado",
      green: "Verde",
      orange: "Laranja",
      pink: "Rosa",
    },
    sections: {
      colors: "Papéis de cor",
      colorsLead:
        "Cores semânticas. Os componentes usam esses nomes, nunca um tom da paleta.",
      chart: "Cores de gráficos",
      chartLead:
        "Oito cores categóricas para séries, faixas e tipos de nó, uma escala sequencial de cinco passos e o par positivo / negativo. Cada uma mantém pelo menos 3:1 sobre as superfícies de cartão e de página em cada skin e modo.",
      palette: "Paletas de destaque",
      typography: "Tipografia",
      typographyLead: "A escala tipográfica compartilhada por todas as skins.",
      radius: "Raio",
      spacing: "Espaçamento",
      shadows: "Sombras",
      tokens: "Todos os tokens",
      tokensLead:
        "Os arquivos de tokens de @surface-one/tokens e as propriedades personalizadas que cada um declara.",
    },
    sample:
      "Um pequeno jabuti xereta viu dez cegonhas felizes — Zażółć gęślą jaźń",
    reset: "Redefinir",
  },
  templates: {
    title: "Templates",
    description:
      "Telas prontas compostas com componentes do SurfaceOne: dashboard, chat com IA, configurações e notas de reunião.",
    lead: "Telas completas construídas apenas com o pacote. Copie-as como ponto de partida.",
    view: "Ver template",
    back: "Todos os templates",
    items: {
      dashboard: {
        title: "Dashboard",
        description:
          "Um shell de app com barra lateral, cabeçalho de página, cards de estatísticas e uma tabela de dados.",
      },
      chat: {
        title: "Chat com IA",
        description:
          "Uma thread de assistente com mensagens, marcadores, sugestões e um compositor.",
      },
      settings: {
        title: "Configurações",
        description:
          "Preferências agrupadas com campos, interruptores, cards de escolha e um segredo.",
      },
      notes: {
        title: "Notas de reunião",
        description:
          "Uma gravação com player de áudio, transcrição e notas renderizadas.",
      },
    },
  },
  changelog: {
    title: "Registro de alterações",
    description:
      "Cada versão do SurfaceOne, da mais recente para a mais antiga: novos componentes, correções e mudanças incompatíveis, com a data de cada versão.",
    eyebrow: "Changelog",
    heading: "Novidades do SurfaceOne",
    lead: "Cada versão do design system, da mais recente para a mais antiga. Os tokens, os componentes Angular, o servidor MCP e as skills compartilham uma única versão.",
    npm: "Instalar pelo npm",
    github: "Todas as versões no GitHub",
    latest: "Mais recente",
    englishNote: "As notas de versão são publicadas em inglês.",
    versions: "Versões",
  },
  notFound: {
    title: "Página não encontrada",
    description: "A página que você está procurando não existe.",
    back: "Voltar ao início",
  },
};
