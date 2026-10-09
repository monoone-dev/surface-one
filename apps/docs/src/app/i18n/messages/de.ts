import type { Messages } from "./en";

export const de: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "Das Designsystem für ruhige Local-first-Apps",
    description:
      "SurfaceOne ist ein barrierefreies Angular-Designsystem: 50 Komponentenfamilien, Design-Tokens, drei Skins in Hell und Dunkel sowie Schriften mit vollständiger latin-ext-Abdeckung.",
  },
  a11y: {
    skipToContent: "Zum Inhalt springen",
    mainNav: "Hauptnavigation",
    sectionNav: "Bereichsnavigation",
    breadcrumb: "Brotkrumennavigation",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    language: "Sprache",
    colorMode: "Farbmodus",
    externalLink: "(öffnet in einem neuen Tab)",
    copyCode: "Code kopieren",
    copied: "Kopiert",
    onThisPage: "Auf dieser Seite",
    preview: "Live-Vorschau",
  },
  nav: {
    home: "Startseite",
    components: "Komponenten",
    guide: "Leitfaden",
    theme: "Theme",
    templates: "Vorlagen",
    changelog: "Änderungen",
    storybook: "Storybook",
    github: "GitHub",
  },
  colorMode: {
    system: "System",
    light: "Hell",
    dark: "Dunkel",
  },
  footer: {
    madeBy: "Entwickelt von MonoOne.",
    license: "Veröffentlicht unter der Projektlizenz.",
    resources: "Ressourcen",
    project: "Projekt",
    changelog: "Änderungsprotokoll",
    contributing: "Mitwirken",
  },
  home: {
    title: "SurfaceOne — Angular-Designsystem",
    eyebrow: "Designsystem · v{version}",
    heading: "Ruhige, barrierefreie Oberflächen mit SurfaceOne gestalten",
    lead: "Signal-basierte Angular-Komponenten, Design-Tokens und drei sorgfältig abgestimmte Skins — in Hell und Dunkel — aus IndexOne herausgelöst und bereit für jede App.",
    getStarted: "Loslegen",
    browseComponents: "Komponenten ansehen",
    openStorybook: "Storybook öffnen",
    installLabel: "Installation",
    stats: {
      components: "Komponentenfamilien",
      symbols: "Komponenten & Direktiven",
      skins: "Skins × Hell/Dunkel",
      locales: "Dokumentationssprachen",
    },
    featuresTitle: "Alles, was eine Produktoberfläche braucht",
    features: {
      tokens: {
        title: "Tokens zuerst",
        body: "Jede Farbe, jeder Radius, Abstand und Schatten ist eine CSS Custom Property. Komponenten lesen Tokens, niemals Rohwerte.",
      },
      skins: {
        title: "Drei Skins, zwei Modi",
        body: "Studio, Paper und Minimalist deklarieren dieselben Tokens neu. Hell, Dunkel oder System — umgeschaltet mit einem einzigen Attribut.",
      },
      a11y: {
        title: "Standardmäßig barrierefrei",
        body: "Echte Buttons, ARIA-Muster aus den WAI-ARIA-Praktiken, sichtbarer Fokus, reduzierte Bewegung und AA-Kontrast.",
      },
      signals: {
        title: "Signals & zoneless",
        body: "Standalone, OnPush, Signal-Inputs und Models. Funktioniert mit zonelessem Angular und serverseitigem Rendering.",
      },
      fonts: {
        title: "latin-ext überall",
        body: "Jede mitgelieferte Schrift enthält die Teilmengen latin und latin-ext, sodass ą, ł, ő, ř und ș nie mitten im Wort auf eine Ersatzschrift zurückfallen.",
      },
      frameworks: {
        title: "Bereit für weitere Frameworks",
        body: "Tokens liegen in einem Framework-unabhängigen Paket. Angular ist bereits verfügbar; Vue und React werden dieselbe Grundlage nutzen.",
      },
    },
    showcaseTitle: "Ein Vorgeschmack auf die Komponenten",
    showcaseLead:
      "Alles hier ist das echte Paket, live gerendert mit dem von Ihnen gewählten Theme.",
    ctaTitle: "Liefern Sie Ihren nächsten Screen mit SurfaceOne",
    ctaBody: "Paket installieren, Tokens laden und loslegen.",
  },
  components: {
    title: "Komponenten",
    description:
      "Alle Komponenten von SurfaceOne, nach Aufgabe gruppiert: Layout, Elemente, Formulare, Daten, Navigation, Overlays, Seitenbausteine, KI-Chat, Editor und Medien.",
    lead: "Jede Komponente hat einen eigenen Entry Point, sodass eine App nur bündelt, was sie importiert.",
    filterLabel: "Komponenten filtern",
    filterPlaceholder: "Nach Name filtern…",
    noResults: "Keine Komponente passt zu „{query}“.",
    count: "{count} Komponenten",
    categories: {
      layout: {
        name: "Layout",
        description:
          "Einen Screen strukturieren: Seitenleisten, Karten und Trennlinien.",
      },
      element: {
        name: "Element",
        description:
          "Die kleinen Bausteine: Buttons, Badges, Hinweise und Indikatoren.",
      },
      form: {
        name: "Formular",
        description:
          "Eingabefelder, Auswahllisten, Schalter, Schieberegler und Auswahlelemente.",
      },
      data: {
        name: "Daten",
        description:
          "Datensätze anzeigen: Tabellen, Einträge, Listen und leere Zustände.",
      },
      navigation: {
        name: "Navigation",
        description: "Durch Hierarchien navigieren.",
      },
      overlay: {
        name: "Overlay",
        description: "Dialoge, Sheets, Menüs, Tooltips und Toasts.",
      },
      page: {
        name: "Seite",
        description: "Kopfbereiche und Aktionen für eine Route.",
      },
      chat: {
        name: "KI-Chat",
        description:
          "Threads, Nachrichten, Sprechblasen und Statusmarker für Assistenten.",
      },
      editor: {
        name: "Editor",
        description: "Markdown rendern und schreiben.",
      },
      media: {
        name: "Medien",
        description: "Aufnahme, Wiedergabe, Transkripte und Zeitachsen.",
      },
    },
    page: {
      import: "Import",
      usage: "Verwendung",
      api: "API-Referenz",
      selector: "Selektor",
      exportAs: "Export als",
      inputs: "Inputs",
      outputs: "Outputs",
      name: "Name",
      type: "Typ",
      default: "Standard",
      required: "erforderlich",
      twoWay: "bidirektional",
      noInputs: "Keine Inputs.",
      openInStorybook: "In Storybook öffnen",
      viewSource: "Quellcode ansehen",
      previous: "Zurück",
      next: "Weiter",
      preview: "Vorschau",
      code: "Code",
      kind: {
        component: "Komponente",
        directive: "Direktive",
        pipe: "Pipe",
      },
    },
    entries: {
      sidebar:
        "Eine einklappbare App-Seitenleiste mit Kopfbereich, Gruppen, Menüs, Badges, einer Rail und einem eingerückten Inhaltsbereich — die Sidebar von shadcn/ui für Angular.",
      card: "Eine Fläche, die zusammengehörige Inhalte gruppiert, mit den Teilen Kopf, Titel, Beschreibung, Aktion, Inhalt und Fuß.",
      separator:
        "Eine ein Pixel feine Linie zwischen Inhalten, horizontal oder vertikal, dekorativ oder semantisch.",
      collapsible:
        "Einen Bereich ein- und ausblenden – mit einem Auslöser, der aria-expanded und aria-controls synchron hält.",
      disclosure:
        "Ein Bereich zur schrittweisen Offenlegung nach dem WAI-ARIA-Muster Disclosure.",
      alert:
        "Ein Hinweis für wichtige Informationen, mit Titel, Beschreibung, Aktion und fünf Tönen.",
      avatar:
        "Ein Benutzerbild mit Initialen als Fallback und einem allgemeinen Symbol im abgemeldeten Zustand.",
      badge:
        "Ein kompaktes Label für Status, Zähler oder Tags, mit sechs Varianten und vier Statusfarben.",
      banner:
        "Ein einzeiliger Statushinweis mit vorangestelltem Symbol; Fehler und Warnungen werden Screenreadern angesagt.",
      button:
        "Der eine Button: sechs Varianten, vier Textgrößen und vier quadratische Icon-Größen, dazu Button-Gruppen.",
      icon: "Inline-SVG-Glyphen in currentColor — keine Icon-Schrift, keine zusätzliche Anfrage.",
      kbd: "Tasten und Tastenkombinationen.",
      logo: "Die Marken von SurfaceOne, IndexOne und Ivy, die mit dem Farbmodus wechseln.",
      progress:
        "Ein linearer Fortschrittsbalken, bestimmt oder unbestimmt, mit barrierefreier progressbar-Rolle.",
      "download-progress":
        "Ein Fortschrittsbalken mit Live-Beschriftung und optionaler Abbrechen-Aktion.",
      meter:
        "Ein segmentierter Indikator für grobe, ordinale Größen wie Genauigkeit oder Geschwindigkeit.",
      skeleton:
        "Ein pulsierender Platzhalter in der Größe seines Hosts, während Inhalte laden.",
      spinner:
        "Ein rotierender Ladeindikator in currentColor, in beliebiger Größe.",
      input:
        "Felder, Labels, Beschreibungen, Fehler und Eingabegruppen mit Add-ons — native Eingabefelder, vom System gestaltet.",
      select:
        "Ein natives Select als Formularsteuerelement mit projizierten Optionen.",
      switch:
        "Ein Ein/Aus-Schalter, der als Formularsteuerelement funktioniert, in zwei Größen.",
      slider:
        "Ein Bereichsschieberegler mit Akzentfüllung und rundem Griff, als Formularsteuerelement verwendbar.",
      "power-slider":
        "Eine diskrete Stufenleiter als Bereichssteuerelement, die beim Ziehen eine Vorschau zeigt und beim Loslassen übernimmt.",
      segmented:
        "Ein segmentiertes Steuerelement für Einfachauswahl, aus Daten gerendert — das Muster Hell / Dunkel / System.",
      "toggle-group":
        "Toggles, Toggle-Gruppen und Tabs mit Roving Focus in jeder Ausrichtung.",
      "choice-card":
        "Ausführliche Radio-Karten, bei denen die ganze Karte die Option ist, mit einem Tab-Stopp und Pfeiltastennavigation.",
      "secret-field":
        "Ein Geheimnis wie einen API-Schlüssel eingeben, speichern und löschen, mit Status gesetzt / nicht gesetzt.",
      "input-otp":
        "Eine Eingabe für Einmalcodes: ein echtes Feld, als getrennte Kästchen gezeichnet – Einfügen, automatisches Ausfüllen und Screenreader funktionieren einfach.",
      stepper:
        "Der Fortschritt durch einen mehrstufigen Ablauf als Punkte oder nummerierte Schritte, mit dem Zähler „Schritt x von y“.",
      table:
        "Eine kompakte Datentabelle, definiert über Spaltenvorlagen, mit Beschriftungen und leerem Zustand.",
      item: "Eine Zeile aus Medien, Titel, Beschreibung und Aktionen — für Listen und Einstellungen.",
      "empty-state":
        "Eine leere Ansicht erklären und den nächsten Schritt anbieten.",
      "source-list":
        "Eine betitelte Liste von Quellen als Chips oder Zeilen, mit Umschalter „Mehr anzeigen“.",
      "tree-row":
        "Eine Dateibaum-Zeile mit Einrückung, Aufklapp-Schalter, Auswahl und Aktionen.",
      dialog:
        "Modale Dialoge und Alert-Dialoge mit Fokusverwaltung, Schließen per Escape und Klick auf den Hintergrund.",
      sheet: "Ein modales Panel, angedockt an einen beliebigen Fensterrand.",
      menu: "Dropdown-Menüs mit Gruppen, Labels, Tastenkürzeln, Checkbox- und Radio-Einträgen, Untermenüs sowie Popovers.",
      "row-menu":
        "Das Auslassungspunkte-Dropdown für zeilenbezogene Aktionen, mit Behandlung von Außenklicks und Tastatur.",
      tooltip:
        "Ein Tooltip bei Hover und Fokus für reine Icon-Steuerelemente, auf jeder Seite, mit optionalem Pfeil.",
      toaster:
        "Gestapelte Toast-Benachrichtigungen mit Aktionen und Schließen — die Warteschlange verwaltet die App.",
      "page-header":
        "Der Titelblock einer Route mit Dachzeile, Titel, Beschreibung und Aktionen.",
      "page-actions":
        "Die Kopfaktionen einer Dokumentseite: Status, ein primäres Steuerelement und ein Überlaufmenü.",
      chat: "Die vollständige Chat-Anatomie: Bereich, Thread, Nachrichten, Eingabefeld, Senden, Vorschläge und Tippindikator.",
      message:
        "Ein Eintrag eines Threads: Avatar, Kopf, Sprechblasen und Fuß, am Anfang oder Ende ausgerichtet.",
      bubble:
        "Die Sprechblase einer Nachricht in den Varianten default, secondary, muted und ghost.",
      marker:
        "Eine Statuszeile in einem Thread wie „Denke nach…“ oder „4 Notizen durchsucht“.",
      markdown:
        "GitHub-Flavored Markdown als Fließtext rendern und mit Toolbar, Live-Vorschau und geteilter Ansicht bearbeiten.",
      "audio-player":
        "Ein schlanker Aufnahme-Player mit Springen, Fortschritt, Zeit und Wiedergabegeschwindigkeit.",
      recording:
        "Aufnahmetaste, Mikrofon-Schalter, Pegelanzeige und Status-Orb für Aufnahmeoberflächen.",
      transcript:
        "Ein nach Redebeiträgen gruppiertes Transkript mit Springen per Klick.",
      "side-panel": "Ein neben der Seite angedocktes Panel mit Kopfzeile, Titel, Aktionen, Schließen-Schaltfläche und scrollbarem Inhalt.",
      "floating-bar": "Die Pille, die über allen Apps schwebt, während die Aufnahme bereit ist, läuft oder verarbeitet wird – mit Schließen-Schaltfläche.",
      "live-transcript": "Das Untertitelprotokoll einer laufenden Aufnahme.",
      timeline:
        "Spuren aus Blöcken und ein Kapitelband auf einer gemeinsamen Zeitskala, mit Abspielkopf, Kapiteln und Legende.",
    },
  },
  guide: {
    title: "Leitfaden",
    description:
      "Erfahren Sie, wie Sie SurfaceOne in einer Angular-App installieren, anpassen und verwenden.",
    pages: {
      introduction: {
        title: "Einführung",
        description:
          "Was SurfaceOne ist, worauf es aufbaut und wie die Pakete zusammenspielen.",
        blocks: [
          {
            p: "SurfaceOne ist das Designsystem hinter IndexOne, herausgelöst in Pakete, die jede App nutzen kann. Es basiert auf den Konventionen von **shadcn/ui**, wurde über die Anatomie von **spartan/ui** nach Angular portiert und liest jeden Wert aus Design-Tokens.",
          },
          { h2: "Pakete" },
          {
            list: [
              "`@surface-one/tokens` — Framework-unabhängiges CSS: Tokens, die drei Skins in Hell und Dunkel, Akzente und latin-ext-Schriften.",
              "`@surface-one/angular` — die Komponenten. Jede Komponentenfamilie ist ein eigener Entry Point, etwa `@surface-one/angular/button`.",
            ],
          },
          {
            p: "Pakete für Vue und React sind geplant. Sie werden `@surface-one/tokens` gemeinsam nutzen, sodass ein Theme in jedem Framework identisch aussieht.",
          },
          { h2: "Aufgebaut auf spartan/ui, shadcn/ui und Nuxt UI" },
          {
            list: [
              "**spartan/ui** (ng-spartan) — die Angular-Anatomie: Direktiven-basierte Teile, Input-Namen und Verhalten.",
              "**shadcn/ui** — der visuelle Kern: Varianten, Größen und die Styles, auf denen unsere Skins aufbauen.",
              "**Nuxt UI** — die Dokumentation: Komponentenkategorien, Templates, der MCP-Server und Agent-Skills.",
            ],
          },
          { h2: "Prinzipien" },
          {
            list: [
              "**Nur Tokens.** Komponenten verwenden `var(--token)`; ein Skin deklariert Tokens neu und forkt nie eine Komponente.",
              "**Nativ zuerst.** Ein Button ist ein `<button>`, ein Select ist ein `<select>`. ARIA schließt die Lücken, die natives HTML lässt.",
              "**Signals und zoneless.** Standalone-Komponenten, OnPush, Signal-Inputs, Models und Outputs.",
              "**Flache, deckende Flächen.** Kein Glas, keine Unschärfe — ruhige Bedienelemente mit zurückhaltendem Akzent.",
            ],
          },
          { h2: "Benennung" },
          {
            p: "Jeder Element-Selektor beginnt mit `sone-` (`<sone-dialog>`, `<sone-switch>`) und jede Attributdirektive mit `sone` (`button[soneBtn]`, `[soneCard]`). TypeScript-Symbole beginnen mit `Sone`.",
          },
          {
            note: "Sie möchten jeden Zustand einer Komponente ausprobieren? Das [Storybook](/storybook/) rendert jeden einzelnen mit Live-Steuerelementen.",
          },
        ],
      },
      installation: {
        title: "Installation",
        description:
          "SurfaceOne in drei Schritten zu einer Angular-22-Anwendung hinzufügen.",
        blocks: [
          { h2: "1. Pakete installieren" },
          { code: "install" },
          {
            p: "Der Markdown-Entry-Point benötigt außerdem seine optionalen Peer-Abhängigkeiten (`marked`, `dompurify` und die `@codemirror/*`-Pakete). Installieren Sie diese nur, wenn Sie `@surface-one/angular/markdown` importieren.",
          },
          { h2: "2. Styles laden" },
          {
            p: "Fügen Sie die Tokens und das Komponenten-Stylesheet dem `styles`-Array Ihres Build-Targets hinzu, Tokens zuerst:",
          },
          { code: "angularJson" },
          {
            p: "Komponenten-Styles sind absichtlich global: Die meisten Teile werden projiziert oder in Portale verschoben, wo emulierte Kapselung nicht greift.",
          },
          { h2: "3. Lokalisierung aktivieren" },
          {
            p: "Komponenten kennzeichnen ihre eingebauten Texte (etwa „Schließen“) mit `$localize`, fügen Sie daher das Polyfill hinzu:",
          },
          { code: "localize" },
          { h2: "Eine Komponente verwenden" },
          { code: "usage" },
          {
            p: "Wählen Sie als Nächstes einen Skin und einen Farbmodus auf der Seite [Theme](/theme).",
          },
        ],
      },
      theming: {
        title: "Theming",
        description:
          "Skins, Farbmodi und Akzente mit drei Attributen umschalten und beliebige Tokens überschreiben.",
        blocks: [
          { p: "Drei Attribute auf `<html>` steuern das gesamte System:" },
          {
            list: [
              "`data-skin` — `studio`, `paper` oder `minimalist`.",
              "`data-theme` — `light`, `dark` oder `system` (ohne Attribut wird ebenfalls dem System gefolgt).",
              "`data-accent` — `blue`, `teal`, `green`, `orange` oder `pink`; ohne Attribut wird der Akzent des Skins verwendet.",
            ],
          },
          { code: "themeAttributes" },
          { h2: "Aufblitzen des falschen Themes vermeiden" },
          {
            p: "Setzen Sie die Attribute vor dem ersten Rendern mit einem kleinen Inline-Skript in `index.html`:",
          },
          { code: "themeScript" },
          { h2: "Tokens überschreiben" },
          {
            p: "Jede visuelle Entscheidung ist eine Custom Property. Deklarieren Sie sie unter demselben Selektor neu, um sie überall zu ändern:",
          },
          { code: "overrideTokens" },
          { p: "Alle Tokens live finden Sie auf der Seite [Theme](/theme)." },
        ],
      },
      fonts: {
        title: "Schriften",
        description:
          "Selbst gehostete variable Schriften mit den Teilmengen latin und latin-ext.",
        blocks: [
          {
            p: "`@surface-one/tokens` enthält jede Schrift, auf die es verweist — Geist, Geist Mono, Figtree, DM Sans, JetBrains Mono und Source Serif 4 — als selbst gehostete variable WOFF2-Schriften. Nichts wird von einem CDN geladen.",
          },
          { h2: "latin-ext ist Pflicht" },
          {
            p: "Jede Familie enthält zwei Dateien: **latin** und **latin-ext**. Die latin-Teilmenge allein enthält kein ą, ć, ę, ł, ń, ś, ź, ż (oder ő, ř, ș …), daher würde der Browser diese Glyphen mitten im Wort aus einer Systemschrift zeichnen. Durch die Aufteilung per `unicode-range` lädt eine Seite die latin-ext-Datei nur herunter, wenn sie eines dieser Zeichen darstellt.",
          },
          { code: "fontFace" },
          {
            p: "Chinesischer und japanischer Text fällt über den jeweiligen Font-Stack auf die CJK-Schrift der Plattform zurück.",
          },
          { h2: "Eine Schrift hinzufügen" },
          {
            p: "Eine neue Familie wird nur mit beiden Teilmengen akzeptiert. Fügen Sie die zwei WOFF2-Dateien zu `packages/tokens/fonts/` und ein Paar `@font-face`-Regeln zu `fonts.css` hinzu.",
          },
        ],
      },
      accessibility: {
        title: "Barrierefreiheit",
        description:
          "Wie SurfaceOne WCAG 2.2 AA erfüllt und wofür Ihre App weiterhin verantwortlich ist.",
        blocks: [
          {
            p: "SurfaceOne zielt auf **WCAG 2.2 Stufe AA**. Die Komponenten folgen den WAI-ARIA Authoring Practices, und diese Dokumentationsseite wird auf jeder Seite in Hell und Dunkel mit axe-core getestet.",
          },
          { h2: "Was die Komponenten leisten" },
          {
            list: [
              'Sie verwenden zuerst native Elemente — `<button>`, `<select>`, `<input type="checkbox">` —, sodass Tastatur- und Screenreader-Unterstützung ohne Zusatzaufwand bereitsteht.',
              'Sie setzen die ARIA-Muster um: Disclosure (`aria-expanded`, `aria-controls`), Radiogruppen mit einem Tab-Stopp und Pfeiltasten, Menüs, Dialoge, die den Fokus festhalten und wiederherstellen, `role="progressbar"` mit Werten.',
              "Sie zeigen auf jedem interaktiven Teil einen sichtbaren Fokusring (`--focus-ring`).",
              "Sie berücksichtigen `prefers-reduced-motion` und halten in jedem Skin einen Textkontrast von mindestens 4.5:1 ein.",
            ],
          },
          { h2: "Wofür Ihre App verantwortlich ist" },
          {
            list: [
              "Versehen Sie jeden reinen Icon-Button mit einem `aria-label`.",
              "Beschriften Sie jedes Formularsteuerelement — mit `soneFieldLabel` oder einem `<label for>`.",
              "Setzen Sie `<html lang>` und pro Route einen aussagekräftigen Dokumenttitel.",
              "Kündigen Sie wichtige asynchrone Ergebnisse an, zum Beispiel mit dem Toaster oder einer Live-Region.",
            ],
          },
        ],
      },
      i18n: {
        title: "Internationalisierung",
        description:
          "Eingebaute Texte übersetzen und jedes Schriftsystem unterstützen.",
        blocks: [
          {
            p: "Komponenten enthalten nur sehr wenig eigenen Text, und jeder eingebaute Text („Schließen“, „Mehr anzeigen“, „Wird heruntergeladen…“) ist mit `$localize` gekennzeichnet. Übersetzen Sie sie mit dem Standard-i18n-Workflow von Angular:",
          },
          { code: "extractI18n" },
          {
            p: "Pluralformen verwenden ICU-Nachrichten und folgen den Pluralregeln der aktiven Locale. Datumsangaben und Zeitdauern werden mit `Intl` formatiert.",
          },
          { h2: "Sprachen dieser Website" },
          {
            p: "Diese Dokumentation ist verfügbar auf English, Polski, Español, Italiano, Français, Português, Deutsch, 简体中文 und 日本語 — in denselben Sprachen wie die IndexOne-Website.",
          },
        ],
      },
      mcp: {
        title: "MCP-Server",
        description:
          "Geben Sie Claude Code, Codex, GitHub Copilot, Cursor und Windsurf direkten Zugriff auf die Dokumentation, die API und die Tokens von SurfaceOne.",
        blocks: [
          {
            p: "`@surface-one/angular-mcp` ist ein Model Context Protocol-Server. Ihr KI-Assistent fragt ihn nach der genauen API einer Komponente, einem funktionierenden Beispiel, ihrem Quellcode und ihren Styles, den Leitfäden, den Bildschirm-Templates und den Theme-Variablen — statt zu raten. Alles ist im Paket enthalten: Es funktioniert offline und passt immer zu Ihrer Version.",
          },
          { h2: "Claude Code" },
          { code: "mcpClaude" },
          { h2: "Codex" },
          { code: "mcpCodex" },
          { p: "Oder fügen Sie ihn zu `~/.codex/config.toml` hinzu:" },
          { code: "mcpCodexToml" },
          { h2: "VS Code mit GitHub Copilot" },
          { p: "Fügen Sie Ihrem Projekt `.vscode/mcp.json` hinzu:" },
          { code: "mcpVsCode" },
          { h2: "Cursor, Windsurf und Claude Desktop" },
          { code: "mcpJson" },
          { h2: "Tools" },
          {
            list: [
              "`list_components` — jede Komponentenfamilie mit ihrem Entry Point und ihren Selektoren.",
              "`get_component_docs` — Beschreibung, Import, ein funktionierendes Beispiel und die vollständige API. Akzeptiert Namen, Slugs, Klassen oder Selektoren wie `soneBtn`.",
              "`get_component_source_code` und `get_component_source_styles` — die Implementierung.",
              "`get_docs` — Leitfadenseiten und Release Notes.",
              "`get_theme_variables` — Token-Werte für jeden Skin in Hell und Dunkel.",
              "`list_templates` und `get_template` — vollständige Bildschirme als Ausgangspunkt.",
            ],
          },
          { h2: "Fragen Sie zum Beispiel" },
          {
            list: [
              "„Erstelle mit SurfaceOne eine Einstellungsseite: einen Switch, ein Select und einen Speichern-Button.“",
              "„Zeige mir die API des SurfaceOne-Dialogs.“",
              "„Welche Tokens verwendet der Paper-Skin im Dunkelmodus?“",
            ],
          },
          {
            note: "Kombinieren Sie den Server mit den [Agent-Skills](/guide/skills): Die Skills sagen Ihrem Assistenten, wie er mit SurfaceOne arbeitet, der Server liefert ihm die Fakten.",
          },
        ],
      },
      skills: {
        title: "Agent-Skills",
        description:
          "Installieren Sie die SurfaceOne-Skills für Claude Code, OpenAI Codex und GitHub Copilot mit einem einzigen Befehl.",
        blocks: [
          {
            p: "Agent-Skills sind Ordner mit einer `SKILL.md`, die ein Assistent lädt, wenn eine Aufgabe sie erfordert. Claude Code, Codex und GitHub Copilot teilen sich das Format, sodass ein Paket alle drei bedient.",
          },
          {
            list: [
              "`surface-one-angular` — Bildschirme mit den Komponenten bauen: Einrichtung, Entry Points, `sone-`-Selektoren, Tokens, Overlays und Formulare, mit dem vollständigen Komponentenkatalog.",
              "`surface-one-theming` — Skins, heller, dunkler und System-Modus, Akzente, Token-Überschreibungen und latin-ext-Schriften.",
              "`surface-one-a11y-review` — eine WCAG 2.2 AA-Checkliste für SurfaceOne-Bildschirme.",
            ],
          },
          { h2: "Installation" },
          { code: "skillsAdd" },
          { h2: "Wo sie landen" },
          {
            list: [
              "**Claude Code** — `.claude/skills/` (global `~/.claude/skills/`).",
              "**Codex** — `.agents/skills/` (global `~/.agents/skills/`).",
              "**GitHub Copilot** — `.agents/skills/` (global `~/.copilot/skills/`).",
            ],
          },
          {
            p: "Führen Sie den Befehl nach einem Upgrade von SurfaceOne erneut mit `--force` aus, um die Skills zu aktualisieren.",
          },
          {
            note: "Fügen Sie auch den [MCP-Server](/guide/mcp) hinzu — die Skills nutzen seine Tools, wenn er verfügbar ist.",
          },
        ],
      },
      contributing: {
        title: "Mitwirken",
        description:
          "Branches, Conventional Commits, Pull Requests und Code Owners.",
        blocks: [
          { p: "Für SurfaceOne gelten dieselben Regeln wie für IndexOne." },
          { h2: "Branches und Commits" },
          {
            list: [
              "Branch-Namen haben die Form `<type>/<kebab-slug>`, zum Beispiel `feat/sone-calendar`.",
              "Commit-Header und PR-Titel folgen Conventional Commits: `<type>(<scope>): <subject>`, höchstens 100 Zeichen, Betreff in Kleinbuchstaben.",
              "Keinerlei Urheberangaben — keine KI-Co-Author-Trailer und keine „generated with“-Fußzeilen.",
            ],
          },
          { code: "commit" },
          { h2: "Pull Requests" },
          {
            p: "Der PR-Text ist die Vorlage des Repositorys: eine kurze Zeile pro tatsächlicher Änderung, in einfachem Englisch. Jeder PR benötigt die Freigabe eines Code Owners.",
          },
          { h2: "Eine Komponente hinzufügen" },
          {
            list: [
              "Legen Sie `packages/angular/<name>/` mit der Komponente, `index.ts` und `ng-package.json` an.",
              "Verwenden Sie ausschließlich das Selektor-Präfix `sone-`, OnPush, Signal-Inputs und Tokens.",
              "Fügen Sie `<name>.stories.ts` hinzu und registrieren Sie die Komponente mit einer Demo im Dokumentationskatalog.",
            ],
          },
        ],
      },
    },
  },
  theme: {
    title: "Theme",
    description:
      "Design-Tokens, Skins, Farbmodi und Akzente von SurfaceOne — live.",
    lead: "Jeder Wert auf dieser Seite wird aus den aktiven Tokens gelesen. Ändern Sie die Einstellungen, und die gesamte Website passt sich an.",
    controls: "Theme-Einstellungen",
    skin: "Skin",
    mode: "Modus",
    accent: "Akzent",
    accentDefault: "Standard des Skins",
    skins: {
      studio: "Studio",
      paper: "Paper",
      minimalist: "Minimalist",
    },
    accents: {
      blue: "Blau",
      teal: "Petrol",
      green: "Grün",
      orange: "Orange",
      pink: "Pink",
    },
    sections: {
      colors: "Farbrollen",
      colorsLead:
        "Semantische Farben. Komponenten verwenden diese Namen, niemals eine Palettenstufe.",
      palette: "Akzentpaletten",
      typography: "Typografie",
      typographyLead: "Die Schriftgrößenskala, die alle Skins teilen.",
      radius: "Radius",
      spacing: "Abstände",
      shadows: "Schatten",
      tokens: "Alle Tokens",
      tokensLead:
        "Die Token-Dateien von @surface-one/tokens und die Custom Properties, die jede davon deklariert.",
    },
    sample:
      "Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich — Zażółć gęślą jaźń",
    reset: "Zurücksetzen",
  },
  templates: {
    title: "Vorlagen",
    description:
      "Fertige Screens aus Surface-One-Komponenten: Dashboard, KI-Chat, Einstellungen und Besprechungsnotizen.",
    lead: "Vollständige Screens, ausschließlich aus dem Paket gebaut. Kopieren Sie sie als Ausgangspunkt.",
    view: "Vorlage ansehen",
    back: "Alle Vorlagen",
    items: {
      dashboard: {
        title: "Dashboard",
        description:
          "Eine App-Shell mit Seitenleiste, Seitenkopf, Statistikkarten und Datentabelle.",
      },
      chat: {
        title: "KI-Chat",
        description:
          "Ein Assistenten-Thread mit Nachrichten, Markern, Vorschlägen und Eingabefeld.",
      },
      settings: {
        title: "Einstellungen",
        description:
          "Gruppierte Einstellungen mit Feldern, Schaltern, Auswahlkarten und einem Geheimnis.",
      },
      notes: {
        title: "Besprechungsnotizen",
        description:
          "Eine Aufnahme mit Audio-Player, Transkript und gerenderten Notizen.",
      },
    },
  },
  changelog: {
    title: "Änderungsprotokoll",
    description:
      "Jede Version von SurfaceOne, die neueste zuerst: neue Komponenten, Fehlerbehebungen und Breaking Changes, mit dem Datum jeder Version.",
    eyebrow: "Änderungsprotokoll",
    heading: "Neu in SurfaceOne",
    lead: "Jede Version des Designsystems, die neueste zuerst. Tokens, Angular-Komponenten, MCP-Server und Skills teilen sich eine Version.",
    npm: "Von npm installieren",
    github: "Alle Releases auf GitHub",
    latest: "Neueste",
    englishNote: "Die Versionshinweise erscheinen auf Englisch.",
    versions: "Versionen",
  },
  notFound: {
    title: "Seite nicht gefunden",
    description: "Die gesuchte Seite existiert nicht.",
    back: "Zurück zur Startseite",
  },
};
