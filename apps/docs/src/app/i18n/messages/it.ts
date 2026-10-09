import type { Messages } from "./en";

export const it: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "Il design system per app pacate e local-first",
    description:
      "SurfaceOne è un design system accessibile per Angular: 50 famiglie di componenti, design token, tre skin in modalità chiara e scura e font con copertura latin-ext completa.",
  },
  a11y: {
    skipToContent: "Vai al contenuto",
    mainNav: "Principale",
    sectionNav: "Sezione",
    breadcrumb: "Percorso di navigazione",
    openMenu: "Apri menu",
    closeMenu: "Chiudi menu",
    language: "Lingua",
    colorMode: "Modalità colore",
    externalLink: "(si apre in una nuova scheda)",
    copyCode: "Copia codice",
    copied: "Copiato",
    onThisPage: "In questa pagina",
    preview: "Anteprima dal vivo",
  },
  nav: {
    home: "Home",
    components: "Componenti",
    guide: "Guida",
    theme: "Tema",
    templates: "Modelli",
    changelog: "Novità",
    storybook: "Storybook",
    github: "GitHub",
  },
  colorMode: {
    system: "Sistema",
    light: "Chiaro",
    dark: "Scuro",
  },
  footer: {
    madeBy: "Realizzato da MonoOne.",
    license: "Distribuito con la licenza del progetto.",
    resources: "Risorse",
    project: "Progetto",
    changelog: "Registro delle modifiche",
    contributing: "Come contribuire",
  },
  home: {
    title: "SurfaceOne — design system per Angular",
    eyebrow: "Design system · v{version}",
    heading: "Crea interfacce pacate e accessibili con SurfaceOne",
    lead: "Componenti Angular basati sui signal, design token e tre skin calibrate a mano, in chiaro e scuro, estratti da IndexOne e pronti per qualsiasi app.",
    getStarted: "Inizia",
    browseComponents: "Esplora i componenti",
    openStorybook: "Apri Storybook",
    installLabel: "Installa",
    stats: {
      components: "famiglie di componenti",
      symbols: "componenti e direttive",
      skins: "skin × chiaro/scuro",
      locales: "lingue della documentazione",
    },
    featuresTitle: "Tutto ciò che serve all'interfaccia di un prodotto",
    features: {
      tokens: {
        title: "Prima i token",
        body: "Ogni colore, raggio, spaziatura e ombra è una proprietà personalizzata CSS. I componenti leggono i token, mai valori fissi.",
      },
      skins: {
        title: "Tre skin, due modalità",
        body: "Studio, Paper e Minimalist ridichiarano gli stessi token. Chiaro, scuro o sistema, con un solo attributo.",
      },
      a11y: {
        title: "Accessibile per impostazione predefinita",
        body: "Pulsanti veri, pattern ARIA dalle pratiche WAI-ARIA, focus visibile, movimento ridotto e contrasto AA.",
      },
      signals: {
        title: "Signal e zoneless",
        body: "Standalone, OnPush, input e model basati sui signal. Funziona con Angular zoneless e con il rendering lato server.",
      },
      fonts: {
        title: "latin-ext ovunque",
        body: "Ogni font incluso contiene i sottoinsiemi latin e latin-ext, così ą, ł, ő, ř e ș non cambiano mai font a metà parola.",
      },
      frameworks: {
        title: "Pronto per altri framework",
        body: "I token risiedono in un pacchetto indipendente dal framework. Oggi è disponibile Angular; Vue e React condivideranno le stesse fondamenta.",
      },
    },
    showcaseTitle: "Un assaggio dei componenti",
    showcaseLead:
      "Tutto ciò che vedi qui sotto è il pacchetto reale, renderizzato dal vivo con il tema che hai scelto.",
    ctaTitle: "Realizza la tua prossima schermata con SurfaceOne",
    ctaBody: "Installa il pacchetto, carica i token e inizia a comporre.",
  },
  components: {
    title: "Componenti",
    description:
      "Tutti i componenti di SurfaceOne, raggruppati per ruolo: layout, elementi, moduli, dati, navigazione, overlay, blocchi di pagina, chat IA, editor e media.",
    lead: "Ogni componente ha un proprio entry point, così un'app include nel bundle solo ciò che importa.",
    filterLabel: "Filtra componenti",
    filterPlaceholder: "Filtra per nome…",
    noResults: "Nessun componente corrisponde a «{query}».",
    count: "{count} componenti",
    categories: {
      layout: {
        name: "Layout",
        description:
          "Struttura una schermata: barre laterali, schede e separatori.",
      },
      element: {
        name: "Elemento",
        description: "I piccoli mattoni: pulsanti, badge, avvisi e indicatori.",
      },
      form: {
        name: "Modulo",
        description:
          "Campi, menu di selezione, interruttori, cursori e controlli di scelta.",
      },
      data: {
        name: "Dati",
        description: "Mostra record: tabelle, elementi, elenchi e stati vuoti.",
      },
      navigation: {
        name: "Navigazione",
        description: "Muoviti tra le gerarchie.",
      },
      overlay: {
        name: "Overlay",
        description: "Dialoghi, pannelli, menu, tooltip e toast.",
      },
      page: {
        name: "Pagina",
        description: "Intestazioni e azioni di una route.",
      },
      chat: {
        name: "Chat IA",
        description:
          "Thread, messaggi, fumetti e indicatori di stato per assistenti.",
      },
      editor: {
        name: "Editor",
        description: "Visualizza e scrivi markdown.",
      },
      media: {
        name: "Media",
        description: "Registrazione, riproduzione, trascrizioni e timeline.",
      },
    },
    page: {
      import: "Importazione",
      usage: "Utilizzo",
      api: "Riferimento API",
      selector: "Selettore",
      exportAs: "Esporta come",
      inputs: "Input",
      outputs: "Output",
      name: "Nome",
      type: "Tipo",
      default: "Predefinito",
      required: "obbligatorio",
      twoWay: "bidirezionale",
      noInputs: "Nessun input.",
      openInStorybook: "Apri in Storybook",
      viewSource: "Visualizza sorgente",
      previous: "Precedente",
      next: "Successivo",
      preview: "Anteprima",
      code: "Codice",
      kind: {
        component: "Componente",
        directive: "Direttiva",
        pipe: "Pipe",
      },
    },
    entries: {
      sidebar:
        "Una barra laterale dell'applicazione comprimibile con intestazione, gruppi, menu, badge, una barra compatta e un'area di contenuto inserita: il Sidebar di shadcn/ui per Angular.",
      card: "Una superficie che raggruppa contenuti correlati, con intestazione, titolo, descrizione, azione, contenuto e piè di pagina.",
      separator:
        "Una linea sottile di un pixel tra i contenuti, orizzontale o verticale, decorativa o semantica.",
      collapsible:
        "Mostra e nasconde una regione con un attivatore che mantiene sincronizzati aria-expanded e aria-controls.",
      disclosure:
        "Una sezione a rivelazione progressiva che segue il pattern Disclosure di WAI-ARIA.",
      alert:
        "Un riquadro per informazioni importanti, con titolo, descrizione, azione e cinque toni.",
      avatar:
        "Un'immagine utente con le iniziali come alternativa e un glifo generico quando non si è connessi.",
      badge:
        "Un'etichetta compatta per stati, conteggi o tag, con sei varianti e quattro tinte di stato.",
      banner:
        "Un avviso di stato su una riga con un glifo iniziale; errori e avvisi vengono annunciati agli screen reader.",
      button:
        "L'unico pulsante: sei varianti, quattro dimensioni di testo e quattro dimensioni di icona quadrata, più i gruppi di pulsanti.",
      icon: "Glifi SVG inline disegnati in currentColor: nessun font di icone, nessuna richiesta aggiuntiva.",
      kbd: "Tasti e combinazioni di tasti.",
      logo: "I marchi di SurfaceOne, IndexOne e Ivy, che cambiano con la modalità colore.",
      progress:
        "Una barra di avanzamento lineare, determinata o indeterminata, con un ruolo progressbar accessibile.",
      "download-progress":
        "Una barra di avanzamento con una didascalia aggiornata in tempo reale e un'azione di annullamento facoltativa.",
      meter:
        "Un indicatore segmentato per quantità ordinali approssimative, come precisione o velocità.",
      skeleton:
        "Un segnaposto pulsante, dimensionato dal contenitore, durante il caricamento dei contenuti.",
      spinner:
        "Un indicatore di caricamento rotante disegnato in currentColor, di qualsiasi dimensione.",
      input:
        "Campi, etichette, descrizioni, errori e gruppi di input con elementi aggiuntivi: input nativi con lo stile del sistema.",
      select:
        "Un select nativo come controllo di modulo con opzioni proiettate.",
      switch:
        "Un interruttore on/off che funziona come controllo di modulo, in due dimensioni.",
      slider:
        "Un cursore di intervallo con riempimento nel colore d'accento e una maniglia rotonda, utilizzabile come controllo di modulo.",
      "power-slider":
        "Una scala discreta come controllo di intervallo, con anteprima durante il trascinamento e conferma al rilascio.",
      segmented:
        "Un controllo segmentato a scelta singola generato dai dati: il pattern Chiaro / Scuro / Sistema.",
      "toggle-group":
        "Toggle, gruppi di toggle e schede con focus mobile e qualsiasi orientamento.",
      "choice-card":
        "Schede di scelta ricche in cui l'intera scheda è l'opzione, con un solo punto di tabulazione e navigazione con le frecce.",
      "secret-field":
        "Inserisci, salva e cancella un segreto, come una chiave API, con uno stato impostato / non impostato.",
      table:
        "Una tabella di dati densa definita da template di colonna, con didascalie e uno stato vuoto.",
      item: "Una riga con media, titolo, descrizione e azioni, per elenchi e impostazioni.",
      "empty-state": "Spiega una vista vuota e propone il passo successivo.",
      "source-list":
        "Un elenco di fonti con titolo, sotto forma di chip o righe, con un pulsante per mostrarne di più.",
      command:
        "Un elenco e una palette di comandi con ricerca: campo combobox, opzioni evidenziate da tastiera, gruppi e filtro integrato.",
      "tree-row":
        "Una riga di un albero di file con rientro, pulsante di espansione, selezione e azioni.",
      dialog:
        "Dialoghi modali e dialoghi di avviso con gestione del focus e chiusura con Esc o clic sullo sfondo.",
      sheet: "Un pannello modale ancorato a qualsiasi bordo della finestra.",
      menu: "Menu a discesa con gruppi, etichette, scorciatoie, voci a casella di controllo e radio, sottomenu e popover.",
      "row-menu":
        "Il menu a discesa con i puntini di sospensione per le azioni di riga, con gestione dei clic esterni e della tastiera.",
      tooltip:
        "Un tooltip al passaggio del mouse e al focus per i controlli con sola icona, su qualsiasi lato, con freccia facoltativa.",
      toaster:
        "Notifiche toast impilate con azioni e chiusura: la coda è gestita dall'app.",
      "page-header":
        "Il blocco del titolo di una route con occhiello, titolo, descrizione e azioni.",
      "page-actions":
        "Le azioni nell'intestazione di una pagina documento: stato, un controllo principale e un menu di overflow.",
      chat: "L'anatomia completa della chat: pannello, thread, messaggi, compositore, invio, suggerimenti e indicatore di digitazione.",
      message:
        "Una voce di un thread: avatar, intestazione, fumetti e piè di pagina, allineati all'inizio o alla fine.",
      bubble:
        "Il fumetto di un messaggio, nelle varianti default, secondary, muted e ghost.",
      marker:
        "Una riga di stato in un thread, come «Sto pensando…» o «Cercato in 4 note».",
      markdown:
        "Visualizza markdown in stile GitHub come testo e modificalo con barra degli strumenti, anteprima dal vivo e vista divisa.",
      "audio-player":
        "Un lettore di registrazioni compatto con salto, avanzamento, tempo e velocità di riproduzione.",
      recording:
        "Pulsante di registrazione, interruttore del microfono, indicatore di livello e sfera di stato per interfacce di acquisizione.",
      transcript:
        "Una trascrizione raggruppata per turni, in cui un clic porta al punto corrispondente.",
      "side-panel": "Un pannello agganciato accanto alla pagina, con intestazione, titolo, azioni, pulsante di chiusura e corpo scorrevole.",
      "floating-bar": "La pillola che fluttua sopra ogni app mentre la registrazione è pronta, in corso o in elaborazione, con un pulsante di chiusura.",
      "live-transcript":
        "Il registro dei sottotitoli di una registrazione in corso.",
      timeline:
        "Corsie di blocchi e una fascia dei capitoli su un'unica scala temporale, con indicatore di riproduzione, capitoli e legenda.",
    },
  },
  guide: {
    title: "Guida",
    description:
      "Scopri come installare, personalizzare e usare SurfaceOne in un'app Angular.",
    pages: {
      introduction: {
        title: "Introduzione",
        description:
          "Che cos'è SurfaceOne, su cosa si basa e come si combinano i pacchetti.",
        blocks: [
          {
            p: "SurfaceOne è il design system alla base di IndexOne, estratto in pacchetti utilizzabili da qualsiasi app. Si basa sulle convenzioni di **shadcn/ui**, portate in Angular tramite l'anatomia di **spartan/ui**, e legge ogni valore dai design token.",
          },
          { h2: "Pacchetti" },
          {
            list: [
              "`@surface-one/tokens`: CSS indipendente dal framework con i token, le tre skin in chiaro e scuro, i colori d'accento e i font latin-ext.",
              "`@surface-one/angular`: i componenti. Ogni famiglia di componenti ha un proprio entry point, come `@surface-one/angular/button`.",
            ],
          },
          {
            p: "Sono previsti pacchetti per Vue e React. Condivideranno `@surface-one/tokens`, così un tema avrà lo stesso aspetto in ogni framework.",
          },
          { h2: "Basato su spartan/ui, shadcn/ui e Nuxt UI" },
          {
            list: [
              "**spartan/ui** (ng-spartan): l'anatomia Angular, ovvero parti basate su direttive, nomi degli input e comportamento.",
              "**shadcn/ui**: il nucleo visivo, ovvero varianti, dimensioni e gli stili su cui si basano le nostre skin.",
              "**Nuxt UI**: la documentazione, ovvero categorie di componenti, template, il server MCP e le skill per agenti.",
            ],
          },
          { h2: "Principi" },
          {
            list: [
              "**Solo token.** I componenti usano `var(--token)`; una skin ridichiara i token e non crea mai un fork di un componente.",
              "**Prima il nativo.** Un pulsante è un `<button>`, un menu di selezione è un `<select>`. ARIA colma le lacune lasciate dall'HTML nativo.",
              "**Signal e zoneless.** Componenti standalone, OnPush, input, model e output basati sui signal.",
              "**Superfici piatte e opache.** Niente vetro, niente sfocatura: un'interfaccia pacata con un accento discreto.",
            ],
          },
          { h2: "Convenzioni di denominazione" },
          {
            p: "Ogni selettore di elemento inizia con `sone-` (`<sone-dialog>`, `<sone-switch>`) e ogni direttiva di attributo con `sone` (`button[soneBtn]`, `[soneCard]`). I simboli TypeScript iniziano con `Sone`.",
          },
          {
            note: "Vuoi esplorare ogni stato di un componente? [Storybook](/storybook/) li mostra uno per uno con controlli dal vivo.",
          },
        ],
      },
      installation: {
        title: "Installazione",
        description:
          "Aggiungi SurfaceOne a un'applicazione Angular 22 in tre passaggi.",
        blocks: [
          { h2: "1. Installa i pacchetti" },
          { code: "install" },
          {
            p: "L'entry point markdown richiede anche le sue peer dependency facoltative (`marked`, `dompurify` e i pacchetti `@codemirror/*`). Installale solo se importi `@surface-one/angular/markdown`.",
          },
          { h2: "2. Carica gli stili" },
          {
            p: "Aggiungi i token e il foglio di stile dei componenti all'array `styles` del tuo target di build, prima i token:",
          },
          { code: "angularJson" },
          {
            p: "Gli stili dei componenti sono globali di proposito: la maggior parte delle parti viene proiettata o resa in un portale, dove l'incapsulamento emulato non arriva.",
          },
          { h2: "3. Abilita la localizzazione" },
          {
            p: "I componenti contrassegnano i propri testi integrati (come «Chiudi») con `$localize`, quindi aggiungi il polyfill:",
          },
          { code: "localize" },
          { h2: "Usa un componente" },
          { code: "usage" },
          {
            p: "Poi scegli una skin e una modalità colore nella pagina [Tema](/theme).",
          },
        ],
      },
      theming: {
        title: "Temi",
        description:
          "Cambia skin, modalità colore e colore d'accento con tre attributi e sovrascrivi qualsiasi token.",
        blocks: [
          { p: "Tre attributi su `<html>` controllano l'intero sistema:" },
          {
            list: [
              "`data-skin`: `studio`, `paper` o `minimalist`.",
              "`data-theme`: `light`, `dark` o `system` (anche senza attributo si segue il sistema).",
              "`data-accent`: `blue`, `teal`, `green`, `orange` o `pink`; senza attributo si usa l'accento proprio della skin.",
            ],
          },
          { code: "themeAttributes" },
          { h2: "Evita il lampeggiamento del tema sbagliato" },
          {
            p: "Imposta gli attributi prima del primo rendering con un piccolo script inline in `index.html`:",
          },
          { code: "themeScript" },
          { h2: "Sovrascrivi i token" },
          {
            p: "Ogni scelta visiva è una proprietà personalizzata. Ridichiarala con lo stesso selettore per cambiarla ovunque:",
          },
          { code: "overrideTokens" },
          {
            p: "Consulta tutti i token, dal vivo, nella pagina [Tema](/theme).",
          },
        ],
      },
      fonts: {
        title: "Font",
        description:
          "Font variabili self-hosted con i sottoinsiemi latin e latin-ext.",
        blocks: [
          {
            p: "`@surface-one/tokens` include tutti i font a cui fa riferimento (Geist, Geist Mono, Figtree, DM Sans, JetBrains Mono e Source Serif 4) come font variabili WOFF2 self-hosted. Nulla viene caricato da una CDN.",
          },
          { h2: "latin-ext è obbligatorio" },
          {
            p: "Ogni famiglia comprende due file: **latin** e **latin-ext**. Il solo sottoinsieme latin non contiene ą, ć, ę, ł, ń, ś, ź, ż (né ő, ř, ș…), quindi il browser disegnerebbe quei glifi con un font di sistema a metà parola. Grazie alla suddivisione per `unicode-range`, una pagina scarica il file latin-ext solo quando visualizza uno di quei caratteri.",
          },
          { code: "fontFace" },
          {
            p: "Il testo in cinese e giapponese ricade sul font CJK della piattaforma tramite ciascuno stack di font.",
          },
          { h2: "Aggiungere un font" },
          {
            p: "Una nuova famiglia viene accettata solo con entrambi i sottoinsiemi. Aggiungi i due file WOFF2 in `packages/tokens/fonts/` e una coppia di regole `@font-face` in `fonts.css`.",
          },
        ],
      },
      accessibility: {
        title: "Accessibilità",
        description:
          "Come SurfaceOne soddisfa le WCAG 2.2 AA e di cosa resta responsabile la tua app.",
        blocks: [
          {
            p: "SurfaceOne punta al **livello AA delle WCAG 2.2**. I componenti seguono le WAI-ARIA Authoring Practices e questo sito di documentazione viene testato con axe-core su ogni pagina, in modalità chiara e scura.",
          },
          { h2: "Cosa fanno i componenti" },
          {
            list: [
              'Usano prima gli elementi nativi (`<button>`, `<select>`, `<input type="checkbox">`), così il supporto per tastiera e screen reader è garantito senza sforzo.',
              'Implementano i pattern ARIA: disclosure (`aria-expanded`, `aria-controls`), gruppi radio con un solo punto di tabulazione e tasti freccia, menu, dialoghi che intrappolano e ripristinano il focus, `role="progressbar"` con valori.',
              "Mostrano un anello di focus visibile su ogni parte interattiva (`--focus-ring`).",
              "Rispettano `prefers-reduced-motion` e mantengono un contrasto del testo di almeno 4,5:1 in ogni skin.",
            ],
          },
          { h2: "Di cosa è responsabile la tua app" },
          {
            list: [
              "Assegna un `aria-label` a ogni pulsante con sola icona.",
              "Etichetta ogni controllo di modulo: usa `soneFieldLabel` o un `<label for>`.",
              "Imposta `<html lang>` e un titolo del documento significativo per ogni route.",
              "Annuncia i risultati asincroni rilevanti, ad esempio con il toaster o una live region.",
            ],
          },
        ],
      },
      i18n: {
        title: "Internazionalizzazione",
        description:
          "Traduci i testi integrati e supporta ogni sistema di scrittura.",
        blocks: [
          {
            p: "I componenti contengono pochissimo testo proprio e ogni testo integrato («Chiudi», «Mostra altro», «Download in corso…») è contrassegnato con `$localize`. Traducili con il flusso di lavoro i18n standard di Angular:",
          },
          { code: "extractI18n" },
          {
            p: "I plurali usano messaggi ICU e seguono le regole di pluralizzazione della locale attiva. Date e durate sono formattate con `Intl`.",
          },
          { h2: "Lingue di questo sito" },
          {
            p: "Questa documentazione è disponibile in English, Polski, Español, Italiano, Français, Português, Deutsch, 简体中文 e 日本語, le stesse lingue del sito web di IndexOne.",
          },
        ],
      },
      mcp: {
        title: "Server MCP",
        description:
          "Offri a Claude Code, Codex, GitHub Copilot, Cursor e Windsurf l'accesso diretto a documentazione, API e token di SurfaceOne.",
        blocks: [
          {
            p: "`@surface-one/angular-mcp` è un server Model Context Protocol. Il tuo assistente IA gli chiede l'API esatta di un componente, un esempio funzionante, il codice sorgente e gli stili, le guide, i template delle schermate e le variabili del tema, invece di tirare a indovinare. Tutto è incluso nel pacchetto: funziona offline e corrisponde sempre alla tua versione.",
          },
          { h2: "Claude Code" },
          { code: "mcpClaude" },
          { h2: "Codex" },
          { code: "mcpCodex" },
          { p: "Oppure aggiungilo a `~/.codex/config.toml`:" },
          { code: "mcpCodexToml" },
          { h2: "VS Code con GitHub Copilot" },
          { p: "Aggiungi `.vscode/mcp.json` al tuo progetto:" },
          { code: "mcpVsCode" },
          { h2: "Cursor, Windsurf e Claude Desktop" },
          { code: "mcpJson" },
          { h2: "Strumenti" },
          {
            list: [
              "`list_components`: ogni famiglia di componenti con il relativo entry point e i selettori.",
              "`get_component_docs`: descrizione, import, un esempio funzionante e l'API completa. Accetta nomi, slug, classi o selettori come `soneBtn`.",
              "`get_component_source_code` e `get_component_source_styles`: l'implementazione.",
              "`get_docs`: pagine delle guide e note di rilascio.",
              "`get_theme_variables`: i valori dei token per ogni skin in modalità chiara e scura.",
              "`list_templates` e `get_template`: schermate complete da cui partire.",
            ],
          },
          { h2: "Prova a chiedere" },
          {
            list: [
              "«Crea una pagina di impostazioni con SurfaceOne: uno switch, un menu di selezione e un pulsante di salvataggio.»",
              "«Mostrami l'API del dialog di SurfaceOne.»",
              "«Quali token usa la skin Paper in modalità scura?»",
            ],
          },
          {
            note: "Abbina il server alle [skill per agenti](/guide/skills): le skill spiegano al tuo assistente come lavorare con SurfaceOne, il server gli fornisce i dati.",
          },
        ],
      },
      skills: {
        title: "Skill per agenti",
        description:
          "Installa le skill di SurfaceOne per Claude Code, OpenAI Codex e GitHub Copilot con un solo comando.",
        blocks: [
          {
            p: "Le skill per agenti sono cartelle con un `SKILL.md` che un assistente carica quando un'attività ne ha bisogno. Claude Code, Codex e GitHub Copilot condividono lo stesso formato, quindi un solo pacchetto li serve tutti e tre.",
          },
          {
            list: [
              "`surface-one-angular`: crea schermate con i componenti (configurazione, entry point, selettori `sone-`, token, overlay e moduli), con il catalogo completo dei componenti.",
              "`surface-one-theming`: skin, modalità chiara, scura e di sistema, colori d'accento, override dei token e font latin-ext.",
              "`surface-one-a11y-review`: una checklist WCAG 2.2 AA per le schermate di SurfaceOne.",
            ],
          },
          { h2: "Installazione" },
          { code: "skillsAdd" },
          { h2: "Dove vengono installate" },
          {
            list: [
              "**Claude Code**: `.claude/skills/` (globalmente `~/.claude/skills/`).",
              "**Codex**: `.agents/skills/` (globalmente `~/.agents/skills/`).",
              "**GitHub Copilot**: `.agents/skills/` (globalmente `~/.copilot/skills/`).",
            ],
          },
          {
            p: "Dopo l'aggiornamento di SurfaceOne, esegui di nuovo il comando con `--force` per aggiornare le skill.",
          },
          {
            note: "Aggiungi anche il [server MCP](/guide/mcp): le skill ne usano gli strumenti quando è disponibile.",
          },
        ],
      },
      contributing: {
        title: "Come contribuire",
        description: "Branch, Conventional Commits, pull request e code owner.",
        blocks: [
          { p: "SurfaceOne segue le stesse regole di IndexOne." },
          { h2: "Branch e commit" },
          {
            list: [
              "I nomi dei branch seguono il formato `<type>/<kebab-slug>`, ad esempio `feat/sone-calendar`.",
              "Le intestazioni dei commit e i titoli delle PR seguono Conventional Commits: `<type>(<scope>): <subject>`, al massimo 100 caratteri, con l'oggetto in minuscolo.",
              "Nessuna attribuzione di alcun tipo: niente trailer di co-autore IA né piè di pagina «generated with».",
            ],
          },
          { code: "commit" },
          { h2: "Pull request" },
          {
            p: "Il corpo della PR è il template del repository: una breve riga per ogni modifica reale, in inglese semplice. Ogni PR richiede l'approvazione di un code owner.",
          },
          { h2: "Aggiungere un componente" },
          {
            list: [
              "Crea `packages/angular/<name>/` con il componente, `index.ts` e `ng-package.json`.",
              "Usa il prefisso di selettore `sone-`, OnPush, input basati sui signal e solo token.",
              "Aggiungi `<name>.stories.ts` e registra il componente nel catalogo della documentazione con una demo.",
            ],
          },
        ],
      },
    },
  },
  theme: {
    title: "Tema",
    description:
      "Design token, skin, modalità colore e colori d'accento di SurfaceOne, dal vivo.",
    lead: "Ogni valore di questa pagina viene letto dai token attivi. Modifica i controlli e l'intero sito si adegua.",
    controls: "Controlli del tema",
    skin: "Skin",
    mode: "Modalità",
    accent: "Accento",
    accentDefault: "Predefinito della skin",
    skins: {
      studio: "Studio",
      paper: "Paper",
      minimalist: "Minimalist",
    },
    accents: {
      blue: "Blu",
      teal: "Verde acqua",
      green: "Verde",
      orange: "Arancione",
      pink: "Rosa",
    },
    sections: {
      colors: "Ruoli dei colori",
      colorsLead:
        "Colori semantici. I componenti usano questi nomi, mai una tonalità della palette.",
      palette: "Palette d'accento",
      typography: "Tipografia",
      typographyLead: "La scala tipografica condivisa da tutte le skin.",
      radius: "Raggio",
      spacing: "Spaziatura",
      shadows: "Ombre",
      tokens: "Tutti i token",
      tokensLead:
        "I file dei token di @surface-one/tokens e le proprietà personalizzate dichiarate da ciascuno.",
    },
    sample:
      "Quel vituperabile xenofobo zelante assaggia il whisky ed esclama: alleluja! — Zażółć gęślą jaźń",
    reset: "Ripristina",
  },
  templates: {
    title: "Modelli",
    description:
      "Schermate pronte all'uso composte con i componenti di SurfaceOne: dashboard, chat IA, impostazioni e note di riunione.",
    lead: "Schermate complete realizzate solo con il pacchetto. Copiale come punto di partenza.",
    view: "Visualizza modello",
    back: "Tutti i modelli",
    items: {
      dashboard: {
        title: "Dashboard",
        description:
          "Una struttura di app con barra laterale, intestazione di pagina, schede statistiche e una tabella di dati.",
      },
      chat: {
        title: "Chat IA",
        description:
          "Un thread con l'assistente, con messaggi, indicatori, suggerimenti e un compositore.",
      },
      settings: {
        title: "Impostazioni",
        description:
          "Preferenze raggruppate con campi, interruttori, schede di scelta e un segreto.",
      },
      notes: {
        title: "Note di riunione",
        description:
          "Una registrazione con lettore audio, trascrizione e note visualizzate.",
      },
    },
  },
  changelog: {
    title: "Registro delle modifiche",
    description:
      "Ogni versione di SurfaceOne, dalla più recente: nuovi componenti, correzioni e modifiche incompatibili, con la data di ogni versione.",
    eyebrow: "Registro delle modifiche",
    heading: "Novità di SurfaceOne",
    lead: "Ogni versione del design system, dalla più recente. Token, componenti Angular, server MCP e skill condividono un'unica versione.",
    npm: "Installa da npm",
    github: "Tutte le versioni su GitHub",
    latest: "Ultima",
    englishNote: "Le note di rilascio sono pubblicate in inglese.",
    versions: "Versioni",
  },
  notFound: {
    title: "Pagina non trovata",
    description: "La pagina che stai cercando non esiste.",
    back: "Torna alla home",
  },
};
