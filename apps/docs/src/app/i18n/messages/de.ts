import type { Messages } from "./en";

export const de: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "Ruhige, barrierefreie Komponenten für Angular, Vue und React",
    description:
      "SurfaceOne ist ein barrierefreies Designsystem für Angular, Vue / Nuxt und React / Next.js: über 70 Komponentenfamilien, framework-unabhängige Design-Tokens, sechs Skins in Hell und Dunkel sowie Schriften mit vollständiger latin-ext-Abdeckung.",
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
    codeSample: "{lang}-Code",
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
    madeBy: "Entwickelt von {brand}.",
    license: "Veröffentlicht unter der MIT-Lizenz.",
    resources: "Ressourcen",
    project: "Projekt",
    changelog: "Änderungsprotokoll",
    contributing: "Mitwirken",
  },
  home: {
    title: "SurfaceOne — Designsystem für Angular, Vue und React",
    eyebrow: "Jetzt auch mit React & Next.js",
    heading: "Ruhige, barrierefreie Oberflächen mit SurfaceOne gestalten",
    lead: "Signal-basierte Komponenten für Angular, Vue / Nuxt und React / Next.js, framework-unabhängige Design-Tokens und sechs sorgfältig abgestimmte Skins in Hell und Dunkel — von Anfang an barrierefrei und bereit für jede App.",
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
        title: "Sechs Skins, zwei Modi",
        body: "Surface, Linen, Studio, Paper, Minimalist und Neumorphism deklarieren dieselben Tokens neu. Hell, Dunkel oder System — umgeschaltet mit einem einzigen Attribut.",
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
        title: "Ein System, drei Frameworks",
        body: "Tokens liegen in einem Framework-unabhängigen Paket. Angular, Vue / Nuxt und React / Next.js rendern dasselbe Markup auf derselben Grundlage.",
      },
    },
    showcaseTitle: "Ein Vorgeschmack auf die Komponenten",
    showcaseLead:
      "Alles hier ist das echte Paket, live gerendert mit dem von Ihnen gewählten Theme.",
    ctaTitle: "Liefern Sie Ihren nächsten Screen mit SurfaceOne",
    ctaBody: "Paket installieren, Tokens laden und loslegen.",
    frameworks: {
      label: "Framework",
      angular: "Angular",
      vue: "Vue / Nuxt",
      react: "React / Next.js",
      installStep: "Installieren",
      setupAngular: "Styles in angular.json laden",
      setupVue:
        "Das Nuxt-Modul hinzufügen (oder das SurfaceOne-Plugin in reinem Vue)",
      setupReact:
        "Die Styles einmal importieren, im Root-Layout (Next.js) oder in main.tsx",
      worksWith: "Funktioniert mit",
    },
    previewLabel:
      "Live-Vorschau aus SurfaceOne-Komponenten: eine Umsatzkarte mit Sparkline, Teammitglieder mit ihren Rollen, Benachrichtigungsschalter und ein KI-Chat.",
  },
  components: {
    title: "Komponenten",
    description:
      "Alle Komponenten von SurfaceOne, nach Aufgabe gruppiert: Layout, Elemente, Formulare, Daten, Navigation, Overlays, Seitenbausteine, KI-Chat, Editor, Medien und Flow.",
    lead: "Jede Komponente hat einen eigenen Entry Point, sodass eine App nur bündelt, was sie importiert.",
    filterLabel: "Komponenten filtern",
    filterPlaceholder: "Nach Name filtern…",
    filterClear: "Filter löschen",
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
      flow: {
        name: "Flow",
        description:
          "Diagramme und Workflows zeichnen: eine Knoten-Arbeitsfläche mit Verbindungen, Steuerelemente, eine Minimap und ein Werkzeug-Dock.",
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
      framework: "Framework",
      vueMissing: "Noch keine Vue-Komponente.",
      vueReadme: "Sehen Sie, was das Vue-Paket umfasst",
      nuxtNote:
        "Fügen Sie in Nuxt `@surface-one/vue/nuxt` zu `modules` in `nuxt.config.ts` hinzu: Das Modul importiert jede `Sone*`-Komponente automatisch, der Import oben ist also optional.",
      reactMissing: "Noch keine React-Komponente.",
      reactReadme: "Sehen Sie, was das React-Paket umfasst",
      availability: "Verfügbar für",
      available: "verfügbar",
      unavailable: "noch nicht verfügbar",
      nativeAvailable: "In React Native ist sie verfügbar.",
      nativeMissing: "In React Native ist sie noch nicht verfügbar.",
      nextNote:
        'Verwenden Sie die Komponenten in Next.js direkt in Server Components: Komponenten mit Zustand sind im Paket mit `"use client"` markiert.',
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
      "scroll-area":
        "Ein Scroll-Container mit schmalen Bildlaufleisten in Token-Farben und dem nativen Scrollen des Browsers — vertikal, horizontal oder beides, per Tastatur erreichbar, solange der Inhalt überläuft, mit optional ausgeblendeten Rändern.",
      resizable:
        "Bereiche nebeneinander oder übereinander mit Griffen dazwischen — per Ziehen oder mit der Tastatur des WAI-ARIA-Fensterteilers bedienbar, mit Mindest- und Höchstgrößen, einklappbaren Bereichen, bidirektional gebundenen Größen und optionalem Speichern.",
      collapsible:
        "Einen Bereich ein- und ausblenden – mit einem Auslöser, der aria-expanded und aria-controls synchron hält.",
      disclosure:
        "Ein Bereich zur schrittweisen Offenlegung nach dem WAI-ARIA-Muster Disclosure.",
      accordion:
        "Gestapelte Abschnitte, die ihren Inhalt ein- und ausblenden – einzeln oder mehrere gleichzeitig – nach dem WAI-ARIA-Muster Accordion.",
      breadcrumb:
        "Die Linkspur von der Startseite bis zur aktuellen Seite, mit Trennzeichen, Auslassungspunkten für eingeklappte Einträge und routerfähigen Links.",
      "navigation-menu":
        "Website-Navigation: Links und Auslöser in einem nav, jeder Auslöser blendet per Klick, Hover oder Tastatur ein Panel mit Links ein; Aufklapp-Schaltflächen und echte Links, kein ARIA-Menü.",
      "app-bar":
        "Die obere Leiste eines Bildschirms: eine Zurück-Schaltfläche oder ein Zurück-Link, der Titel als echte Überschrift mit Untertitel und Aktionen am Ende, in einem Header, der oben haften kann und die Notch freilässt.",
      "tab-bar":
        "Untere Navigation im Mobile-Stil: Links oder Schaltflächen mit Symbolen und der Beschriftung des aktiven Tabs, als schwebende Pille oder als Leiste über die volle Breite, die den Home-Indikator freilässt.",
      pagination:
        "Seitennavigation mit Zurück- und Weiter-Schaltflächen, markierter aktueller Seite und Auslassungspunkten für übersprungene Seiten – kombinierbare Links oder eine fertige Komponente, gesteuert über die Seitenanzahl.",
      alert:
        "Ein Hinweis für wichtige Informationen, mit Titel, Beschreibung, Aktion und fünf Tönen.",
      avatar:
        "Ein Benutzerbild mit Initialen als Fallback und einem allgemeinen Symbol im abgemeldeten Zustand.",
      "avatar-group":
        "Überlappende Avatare mit einem „+N“ für den Rest: Personen mit Bild oder Initialen oder Avatar-Kinder, begrenzt durch max, als eine benannte Gruppe.",
      badge:
        "Ein kompaktes Label für Status, Zähler oder Tags, mit sechs Varianten und vier Statusfarben.",
      banner:
        "Ein einzeiliger Statushinweis mit vorangestelltem Symbol; Fehler und Warnungen werden Screenreadern angesagt.",
      "bar-chart":
        "Ein Säulendiagramm für eine kurze Reihe mit Achsenbeschriftungen, Tooltip bei Hover und Fokus, Pfeiltasten-Navigation und einer versteckten Datentabelle für Screenreader.",
      "line-chart":
        "Eine oder mehrere Reihen über Kategorien oder Zeit: gerade oder geglättete Linien, eine Werteachse mit runden Teilstrichen, Punkte, Legende und Tooltip, mit wanderndem Fokus und einer verborgenen Datentabelle.",
      "area-chart":
        "Reihen als gefüllte Flächen, überlagert oder gestapelt, mit Achse, Legende, Tooltip, wanderndem Fokus und verborgener Datentabelle des Liniendiagramms.",
      "donut-chart":
        "Die Teile eines Ganzen als Ring: ein Segment pro Teil, die Summe in der Mitte, eine Legende mit den Werten und Segmente, die sich per Zeiger oder mit den Pfeiltasten erkunden lassen.",
      "bar-list":
        "Eine sortierte Liste beschrifteter horizontaler Balken mit dem Wert daneben, skaliert auf den größten Wert oder die Summe; die Beschriftung kann jedes Template sein.",
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
      sparkline:
        "Ein wortgroßes Linien-, Flächen-, Balken- oder Heatmap-Diagramm ohne Achsen in einem gestreckten SVG — standardmäßig dekorativ oder ein Bild mit gesprochener Zusammenfassung.",
      spinner:
        "Ein rotierender Ladeindikator in currentColor, in beliebiger Größe.",
      "status-dot":
        "Ein kleiner runder Statuspunkt in einem semantischen Ton, optional pulsierend und mit zugänglichem Namen.",
      input:
        "Felder, Labels, Beschreibungen, Fehler und Eingabegruppen mit Add-ons — native Eingabefelder, vom System gestaltet.",
      "image-picker":
        "Ein antippbares Bildfeld über einem nativen Datei-Input: ein gestrichelter Platzhalter, danach die Vorschau mit Schaltflächen zum Ändern und Entfernen, das die gewählte Datei oder die URL eines gespeicherten Bildes hält.",
      select:
        "Ein natives Select als Formularsteuerelement mit projizierten Optionen.",
      calendar:
        "Ein Monatsraster zur Auswahl eines Datums, eines Zeitraums oder mehrerer Daten, mit den WAI-ARIA-Tasten für Datumsraster, Minimum und Maximum, deaktivierten Tagen und Monatsnamen aus Intl.",
      "date-picker":
        "Eine Schaltfläche mit einem Datum, die einen Kalender in einem Popover öffnet, für ein Datum oder einen Zeitraum, als Formularsteuerelement mit Intl-Formatierung.",
      combobox:
        "Ein Textfeld, das beim Tippen eine Optionsliste filtert, mit Gruppen, Leerzustand, Mehrfachauswahl als Chips und den WAI-ARIA-Combobox-Tasten, als Formularsteuerelement.",
      checkbox:
        "Das native Kontrollkästchen mit unbestimmtem Zustand, über ein Feld mit seiner Beschriftung verbunden, für Formulare und „Alle auswählen“-Listen.",
      "radio-group":
        "Eine Gruppe nativer Optionsfelder mit gemeinsamem Namen und einem Wert, mit Pfeiltasten und einem einzigen Tab-Stopp, als Formularsteuerelement.",
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
      "copy-button":
        "Kopiert einen Wert in die Zwischenablage, mit einer kurzen Bestätigung „Kopiert“, die auch Screenreader ansagen.",
      "input-otp":
        "Eine Eingabe für Einmalcodes: ein echtes Feld, als getrennte Kästchen gezeichnet – Einfügen, automatisches Ausfüllen und Screenreader funktionieren einfach.",
      "password-input":
        "Ein Passwortfeld mit Ein-/Ausblenden-Schalter, als Formularsteuerelement.",
      stepper:
        "Der Fortschritt durch einen mehrstufigen Ablauf als Punkte oder nummerierte Schritte, mit dem Zähler „Schritt x von y“.",
      rating:
        "Sterne für eine Bewertung – ein schreibgeschütztes Bild mit Bruchteilen oder eine Radiogruppe zum Bewerten per Tastatur, als Formularsteuerelement.",
      textarea:
        "Das native mehrzeilige Feld im Look des Skins: automatische Höhe zwischen einer minimalen und maximalen Zeilenzahl, ein ungültiger Zustand und ein Zeichenzähler, der ansagt, wie viele Zeichen übrig sind.",
      "file-upload":
        "Eine Ablagezone um das native Dateifeld: Dateien anklicken oder ablegen, gegen erlaubte Typen sowie Größen- und Anzahlgrenzen geprüft und mit Größe, Bildvorschau und Entfernen-Schaltfläche aufgelistet.",
      "input-number":
        "Ein Zahlenfeld mit Minus- und Plus-Schaltflächen – ein Spinbutton mit Pfeiltasten, Bild auf / ab und Pos1 / Ende, begrenzt auf min und max, als Formularsteuerelement.",
      flow: "Eine Knoten-Arbeitsfläche für Diagramme und Workflows – verschiebbare Knoten, geschwungene Kanten mit Beschriftung, Verbindungspunkte, Schwenken und Zoomen, Steuerelemente und eine Minimap.",
      dock: "Eine Werkzeugleiste zum Zeichnen, die an der oberen, unteren, linken oder rechten Kante einer Arbeitsfläche andockt, mit Pfeiltasten-Navigation und Tooltips.",
      confirm:
        "Eine Bestätigung direkt an Ort und Stelle statt eines Modals: Titel, Beschreibung und Fehler, erst Abbrechen, dann Bestätigen, Fokus auf der Aktion, Escape bricht ab, mit Ladezustand.",
      "search-field":
        "Ein Suchfeld mit Lupe und Löschen-Schaltfläche; Enter sendet, Escape leert. Als Formularsteuerelement nutzbar.",
      "collapsible-section":
        "Ein einklappbarer Abschnitt mit Titel: eine Kopfzeilen-Schaltfläche mit Pfeil, Untertitel und Anzahl, darunter der Inhalt.",
      "filter-chips":
        "Filter-Schaltflächen mit Einfachauswahl aus Daten, als Chips oder Tabs, mit einem Zähler pro Option und Pfeiltasten-Navigation.",
      "section-heading":
        "Die Überschriftenzeile eines Abschnitts: ein echtes h2 bis h4, benannt nur nach dem Titel – die optionale Anzahl wird danach vorgelesen –, mit Aktionen am Ende.",
      "load-more":
        "Die Schaltfläche „Mehr anzeigen“ am Ende einer seitenweisen Liste, mit der verbleibenden Anzahl, einem Ladezustand und einem erneuten Versuch nach einem Fehler.",
      "tag-input":
        "Tags als entfernbare Chips eingeben – Enter oder ein Komma fügt einen hinzu, die Rücktaste entfernt den letzten – als Formularsteuerelement.",
      table:
        "Eine kompakte Datentabelle, definiert über Spaltenvorlagen, mit Beschriftungen und leerem Zustand.",
      "data-table":
        "Eine datengetriebene Tabelle auf Basis von Table: sortierbare Spalten, ein globaler Filter, Paginierung, Zeilenauswahl per Kontrollkästchen, ein Menü für die Spaltensichtbarkeit sowie Lade- und Leerzustände.",
      carousel:
        "Folien in einer Scroll-Snap-Spur ohne Abhängigkeiten: Zurück und Weiter, optionale Punkte, Wischen und Pfeiltasten, Endlosschleife, mehrere Folien pro Ansicht und optionale automatische Wiedergabe, die bei Hover und Fokus pausiert — nach dem WAI-ARIA-Muster Carousel.",
      item: "Eine Zeile aus Medien, Titel, Beschreibung und Aktionen — für Listen und Einstellungen.",
      "empty-state":
        "Eine leere Ansicht erklären und den nächsten Schritt anbieten.",
      graph:
        "Ein interaktives Netzwerkdiagramm auf einem Canvas – Kräfte-, Cluster- und Ebenen-Layout, Verschieben und Zoomen, Tastaturnavigation und eine Knotenliste.",
      "source-list":
        "Eine betitelte Liste von Quellen als Chips oder Zeilen, mit Umschalter „Mehr anzeigen“.",
      "chart-legend":
        "Farbmuster und eine Diagrammlegende, deren Einträge Reihen ein- und ausblenden können.",
      "stacked-bar":
        "Ein Balken, aufgeteilt in die Anteile eines Ganzen, mit optionaler Restspur, Legende und einer Zusammenfassung für Screenreader.",
      stat: "Kennzahlen in einer Beschreibungsliste – Beschriftung, Wert, Hinweis und Trend, als Karten, eingelassene Kacheln oder schlichte Zeile.",
      command:
        "Eine durchsuchbare Befehlsliste und Befehlspalette – Combobox-Eingabe, per Tastatur hervorgehobene Optionen, Gruppen und eingebaute Filterung.",
      tree: "Tastaturnavigation für einen Baum aus Zeilen – Pfeiltasten, Auf- und Zuklappen, Typeahead und ein einziger Tab-Stopp, nach dem WAI-ARIA-Tree-Muster.",
      "tree-row":
        "Eine Dateibaum-Zeile mit Einrückung, Aufklapp-Schalter, Auswahl und Aktionen.",
      dialog:
        "Modale Dialoge und Alert-Dialoge mit Fokusverwaltung, Schließen per Escape und Klick auf den Hintergrund.",
      sheet: "Ein modales Panel, angedockt an einen beliebigen Fensterrand.",
      drawer:
        "Ein Sheet, das sich wegwischen lässt: ein Panel von unten oder einem beliebigen Rand mit Ziehgriff, Schließen per Wischgeste und optionalen Rastpunkten — mit der Fokusfalle, Escape und dem abgedunkelten Hintergrund des Sheets.",
      menu: "Dropdown-Menüs mit Gruppen, Labels, Tastenkürzeln, Checkbox- und Radio-Einträgen sowie Untermenüs.",
      "context-menu":
        "Die Einträge, Untermenüs und Tasten der Menüfamilie, geöffnet dort, wo sie gebraucht werden: per Rechtsklick am Zeiger, per langem Drücken unter dem Finger oder mit der Kontextmenütaste und Umschalt+F10.",
      menubar:
        "Eine Menüleiste im Desktop-Stil aus der Menüfamilie: ein einziger Tab-Stopp, Pfeiltasten zwischen den Menüs und zu ihren Nachbarn und Wechsel per Hover, sobald ein Menü offen ist.",
      popover:
        "Ein nicht modales Panel, das an seinem Auslöser verankert ist, auf jeder Seite platziert wird, den Fokus übernimmt und sich mit Escape oder einem Klick außerhalb schließt.",
      "hover-card":
        "Eine Vorschaukarte für einen Link, die nach kurzer Verzögerung bei Hover oder Tastaturfokus erscheint und offen bleibt, solange der Zeiger auf Link oder Karte ruht; nicht modal, auf Touchscreens öffnet sie ein Tippen.",
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
      "page-hero":
        "Der Eröffnungsblock einer Landingpage: eine Dachzeile, der Titel als echte Überschrift, eine Beschreibung und Call-to-Action-Links, mit Medien daneben oder darunter und vertauschbaren Seiten.",
      "page-section":
        "Ein Abschnitt einer Landingpage: ein Symbol, eine Dachzeile, der Titel als echte Überschrift, eine Beschreibung, ein Raster von Funktionen mit Symbolen und Links sowie Medien daneben oder darunter.",
      "pricing-plan":
        "Die Tarife einer Preisseite: ein Titel mit Badge, der Preis (durchgestrichen, wenn ein Rabatt ihn ersetzt) mit Abrechnungszeitraum, eine Funktionsliste mit Häkchen, ein Call-to-Action und Bedingungen, ein Tarif hervorgehoben.",
      "page-footer":
        "Die Fußzeile einer Website: Ihre Marke, betitelte Linkspalten in einer benannten Navigation und eine untere Zeile mit dem Copyright-Hinweis und eigenen Inhalten, in einem footer-Element.",
      "page-site-header":
        "Der Header einer Website: ein Logo, die Navigation und Aktionen, mit einer Menüschaltfläche, die auf schmalen Bildschirmen die Navigation in einem Sheet öffnet, in einem Header, der oben haften kann.",
      chat: "Die vollständige Chat-Anatomie: Bereich, Thread, Nachrichten, Eingabefeld, Senden, Vorschläge und Tippindikator.",
      terminal:
        "Ein Agentengespräch als Terminal: ein Log in Festbreitenschrift, in dem deine Zeilen hervorstechen, zurückhaltende Werkzeugaktivität, ein Live-Status, der zeigt, wer arbeitet und wie lange schon, und ein Prompt.",
      "agent-chat":
        "Dasselbe Agentengespräch als Chat: deine Nachrichten in Akzent-Blasen, Agenten unter ihren Avataren, zurückhaltende Werkzeugaktivität, ein Live-Arbeitsstatus und ein Eingabefeld. Lässt sich Teil für Teil gegen Terminal tauschen.",
      "chat-history":
        "Gespeicherte Assistenten-Unterhaltungen: nach Titel filtern, eine öffnen, in einer Seitenleiste nach Alter gruppieren – mit Lade-, Leer- und Fehlerzustand.",
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
        "Aufnahmetaste, Mikrofon-Schalter, Pegelanzeige, Status-Orb, Zeitanzeige, Aufnahmeanzeige und Verarbeitungsstatus für Aufnahmeoberflächen.",
      "speaker-chip":
        "Die Initialen einer sprechenden Person in einem Avatar in der Farbe ihrer Rolle und ihr Name, abgeleitet aus einem einzigen Sprecherschlüssel des Transkripts.",
      transcript:
        "Ein nach Redebeiträgen gruppiertes Transkript mit Springen per Klick.",
      "side-panel":
        "Ein neben der Seite angedocktes Panel mit Kopfzeile, Titel, Aktionen, Schließen-Schaltfläche und scrollbarem Inhalt.",
      "floating-bar":
        "Die Pille, die über allen Apps schwebt, während die Aufnahme bereit ist, läuft oder verarbeitet wird – mit Schließen-Schaltfläche.",
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
              "`@surface-one/tokens` — Framework-unabhängiges CSS: Tokens, die sechs Skins in Hell und Dunkel, Akzente und latin-ext-Schriften.",
              "`@surface-one/angular` — die Komponenten. Jede Komponentenfamilie ist ein eigener Entry Point, etwa `@surface-one/angular/button`.",
            ],
          },
          {
            p: "`@surface-one/vue` bringt dieselben Komponenten zu Vue 3 und Nuxt (mit dem Modul `@surface-one/vue/nuxt`), `@surface-one/react` zu React 19 und Next.js. Alle nutzen `@surface-one/tokens` gemeinsam, sodass ein Theme in jedem Framework identisch aussieht.",
          },
          {
            p: "`@surface-one/react-native` bringt sie zu iOS und Android, mit denselben Tokens, aufgelöst für React Native. Siehe [React Native](/guide/react-native).",
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
              "**Deckende Inseln auf einer Glasscheibe.** Inhalte liegen immer auf einer deckenden Fläche; nur der App-Rahmen zeigt den gemalten Hintergrund, und nichts wird unscharf — ruhige Bedienelemente mit zurückhaltendem Akzent.",
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
      "react-native": {
        title: "React Native",
        description:
          "Die SurfaceOne-Komponenten in einer React-Native- oder Expo-App verwenden, gestaltet mit denselben Tokens und Skins.",
        blocks: [
          {
            p: "`@surface-one/react-native` bringt die Komponenten zu iOS und Android. Es verwendet dieselben `Sone*`-Namen und dieselben Props wie das React-Paket, wo immer sie auf einem Smartphone sinnvoll sind, mit denselben Rollen, Namen und Zuständen für Screenreader. React Native kennt kein CSS, daher wird jedes Token vorab für jeden Skin, Farbmodus und Akzent aufgelöst, und ein Provider reicht die Werte an jede Komponente weiter.",
          },
          { h2: "1. Pakete installieren" },
          { p: "In einer Expo-App (SDK 53 oder neuer):" },
          { code: "installExpo" },
          {
            p: "In einer reinen React-Native-App (0.78 oder neuer, mit der New Architecture):",
          },
          { code: "installReactNative" },
          { h2: "2. Die App in den Provider einbetten" },
          { code: "reactNativeProvider" },
          {
            list: [
              "`skin` — `surface`, `linen`, `studio`, `paper`, `minimalist` oder `neumorphism`, importiert aus `@surface-one/react-native/skins`. Jeder Skin ist ein eigenes Modul, sodass die App nur die Skins bündelt, die sie verwendet.",
              "`colorMode` — `light`, `dark` oder `system` (der Standard, der dem Gerät folgt).",
              "`accent` — `blue`, `teal`, `green`, `orange` oder `pink`; lassen Sie es weg, um den Akzent des Skins zu verwenden.",
              "`tokens` überschreibt einzelne Werte, und `messages` übersetzt die eingebauten Texte.",
            ],
          },
          {
            p: "Der Provider ist optional: Ohne ihn rendern die Komponenten Minimalist, hell, auf Englisch.",
          },
          { h2: "Tokens in eigenen Views" },
          {
            p: "Jedes Token behält seinen CSS-Namen in camelCase (`--surface-raised` → `surfaceRaised`, `--space-4` → `space4`). Farben sind Strings, Längen sind Zahlen in dp, und Schatten sind `boxShadow`-Strings:",
          },
          { code: "reactNativeTokens" },
          { h2: "Schriften" },
          {
            p: "Standardmäßig verwenden die Komponenten die Schrift der Plattform. Um die Schriftfamilien des Skins zu nutzen, laden Sie sie zuerst und setzen Sie dann `fonts`:",
          },
          { code: "reactNativeFonts" },
          { h2: "Was sich vom Web unterscheidet" },
          {
            list: [
              "`onPress` ersetzt `onClick`, und `style` (zuletzt zusammengeführt) ersetzt `className`.",
              "Pressed-Zustände ersetzen Hover-Zustände. Der Fokusring erscheint bei Tastaturfokus.",
              "Dialoge und Sheets sind native Modals: Ein Tippen auf den Hintergrund oder die Zurück-Taste von Android schließt sie.",
              "Text erbt von seiner Komponente: Ein String in einem Button oder Badge wird zu dessen Beschriftung, und `SoneText` und `SoneIcon` übernehmen die umgebende Farbe und Größe.",
              "Die Geräteeinstellung „Bewegung reduzieren“ stoppt Spinner, Skeletons und Übergänge.",
            ],
          },
          {
            note: "Formulare, Overlays, Anzeige- und Datenkomponenten sind abgedeckt. Die reinen Web-Familien (Sidebar, Menüs, Tooltips, Tabellen, Markdown, Flow, der KI-Chat und der Editor) nicht.",
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
              "`data-skin` — `surface`, `linen`, `studio`, `paper`, `minimalist` oder `neumorphism`.",
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
      utilities: {
        title: "Hilfsklassen",
        description:
          "Globale Layout- und Text-Hilfsklassen, die mit dem Komponenten-Stylesheet ausgeliefert werden.",
        blocks: [
          {
            p: "`@surface-one/angular/styles.css` (und `@surface-one/vue/styles.css`, `@surface-one/react/styles.css`) enthalten einige globale Hilfsklassen, damit eine App nicht in jeder Komponente dieselben Flex-Container und Textstile neu schreibt. Jeder Wert ist ein Token.",
          },
          { h2: "Layout" },
          {
            list: [
              "`.stack` — eine Flex-Spalte; Abstand `--space-3`.",
              "`.cluster` — eine umbrechende, vertikal zentrierte Reihe aus Chips oder Buttons; Abstand `--space-2`.",
              "`.row` — eine zentrierte Reihe ohne Umbruch; `.row-between` schiebt ihre Enden auseinander. Abstand `--space-2`.",
              '`data-gap="1"` … `"8"` wählt bei jeder davon die Stufe `--space-1` … `--space-8`.',
            ],
          },
          { code: "layoutUtilities" },
          { h2: "Text" },
          {
            list: [
              "`.text-hint` — eine zusätzliche Zeile unter einem Steuerelement oder Leerzustand: sekundäre Farbe, `sm`, normale Zeilenhöhe, kein Rand.",
              "`.text-caption` — Kleingedrucktes: gedämpfte Farbe, `xs`.",
              "`.truncate` — eine Zeile, mit Auslassungspunkten gekürzt; `min-width: 0` lässt sie in einer Flex- oder Grid-Spur schrumpfen.",
              "`.list-reset` — ein `<ul>` / `<ol>` ohne Aufzählungszeichen, Rand und Innenabstand.",
              "Außerdem gibt es `.text-secondary`, `.text-muted`, `.text-success`, `.text-danger`, `.section-label` und `.sr-only`.",
            ],
          },
          { code: "textUtilities" },
          {
            note: "Das sind gewöhnliche Klassennamen. Verwendet deine App `.row` oder `.stack` bereits für etwas anderes, greift die globale Regel auch dort — benenne deine Klasse um oder berücksichtige die Eigenschaften, die sie setzt.",
          },
          { h2: "Stilregeln" },
          {
            p: "`@surface-one/stylelint-config` macht aus der Regel „nur Tokens“ einen Lint. Es nutzt ausschließlich eingebaute stylelint-Regeln, liest `.css`, `.scss` und die `<style>`-Blöcke von `.vue`-Dateien, und jede Meldung nennt das Token, das stattdessen zu verwenden ist:",
          },
          {
            list: [
              "Keine rohen Farben — kein Hex, keine Farbnamen, kein `rgb()` / `hsl()` / `oklch()`. Verwende ein Theme-Token wie `var(--text-primary)` oder `color-mix()` über Tokens für eine Tönung; `transparent` und `currentColor` bleiben erlaubt.",
              "Keine rohen `px` in `gap`, `padding`, `margin`, `border-radius`, `box-shadow`, `font-size` oder `letter-spacing`: verwende `--space-*`, `--radius-*`, `--shadow-*`, `--font-size-*` und `--tracking-*`. `0` ist erlaubt, und strukturelle Größen (`width`, `height`, `min-*`, `max-*`, `inset`) behalten ihre Pixel.",
              "`z-index` nimmt die `--z-*`-Leiter — `var(--z-raised)`, `var(--z-dropdown)`, `var(--z-modal)` … — oder eine Stufe neben einer Sprosse, `calc(var(--z-raised) + 1)`.",
              "Die Haarlinie ist `var(--border-width-thin) solid`, nie `1px solid`.",
              "`backdrop-filter` ist nur der Scrim des Skins: `blur(var(--scrim-blur))`.",
              "Dauern kommen aus `--transition`, `--transition-fast` und den `--duration-*`-Stufen, nie aus rohen `ms` oder `s`.",
            ],
          },
          { code: "stylelintInstall" },
          { code: "stylelintConfig" },
          {
            p: "Nimm nur die Dateien aus, die deine eigenen Tokens definieren. Ist ein roher Wert wirklich strukturell, schalte genau diese eine Zeile stumm und nenne den Grund — eine Deaktivierung ohne Grund oder eine, die nichts stummschaltet, ist ebenfalls ein Fehler:",
          },
          { code: "stylelintDisable" },
        ],
      },
      fonts: {
        title: "Schriften",
        description:
          "Selbst gehostete variable Schriften mit den Teilmengen latin und latin-ext.",
        blocks: [
          {
            p: "`@surface-one/tokens` enthält jede Schrift, auf die es verweist — Inter, Geist, Geist Mono, Figtree, DM Sans, JetBrains Mono, Schibsted Grotesk und Source Serif 4 — als selbst gehostete variable WOFF2-Schriften. Nichts wird von einem CDN geladen.",
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
      neumorphism: "Neumorphism",
      surface: "Surface",
      linen: "Linen",
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
      chart: "Diagrammfarben",
      chartLead:
        "Acht kategoriale Farben für Reihen, Spuren und Knotentypen, eine fünfstufige sequenzielle Skala und das Paar positiv / negativ. Jede hält mindestens 3:1 auf Karten- und Seitenflächen, in jedem Skin und Modus.",
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
      "Fertige Screens aus Surface-One-Komponenten: Dashboard, KI-Chat, Einstellungen, Besprechungsnotizen, Anmeldung und Registrierung, ein validiertes Formular, Nachrichten, ein Arbeitsbereich mit zwei Seitenleisten, ein Markdown-Editor, Medien, Finanzen, ein CRM, ein Onlineshop, ein Sprint-Board, ein Workflow-Editor, eine Dokumentation, ein Changelog und eine Landingpage.",
    lead: "Vollständige Screens, ausschließlich aus dem Paket gebaut. Kopieren Sie sie als Ausgangspunkt.",
    view: "Vorlage ansehen",
    back: "Alle Vorlagen",
    vueMissing: "Für diese Vorlage gibt es noch keine Vue-Version.",
    reactMissing: "Für diese Vorlage gibt es noch keine React-Version.",
    viewport: "Bildschirmgröße",
    devices: {
      desktop: "Desktop",
      tablet: "Tablet",
      phone: "Smartphone",
    },
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
      login: {
        title: "Anmeldung",
        description:
          "Eine Anmeldekarte mit Google-, Apple- und GitHub-Buttons, E-Mail- und Passwortformular, Validierung und „Angemeldet bleiben“.",
      },
      signup: {
        title: "Registrierung",
        description:
          "Eine Registrierung im geteilten Layout mit SSO, Passwortstärke-Anzeige, Live-Passwortregeln und Nutzungsbedingungen.",
      },
      form: {
        title: "Formularvalidierung",
        description:
          "Ein langes Formular in Abschnitten mit reaktiver Validierung, feldübergreifenden Regeln und einer Fehlerübersicht mit Links zu jedem Feld.",
      },
      messages: {
        title: "Nachrichten",
        description:
          "Ein Posteingang für Direktnachrichten mit durchsuchbarer Unterhaltungsliste, Sprechblasen, Tipp-Anzeige und Eingabefeld.",
      },
      workspace: {
        title: "Zwei Seitenleisten",
        description:
          "Ein Aufgaben-Arbeitsbereich mit einklappbarer Navigationsleiste links und einer Detailleiste rechts.",
      },
      editor: {
        title: "Markdown-Editor",
        description:
          "Ein Dokumenteditor mit Dateiliste, Formatierungsleiste, Schreib-, Geteilt- und Vorschaumodus sowie automatischem Speichern.",
      },
      media: {
        title: "Medien",
        description:
          "Ein Aufnahmestudio mit Aufnahmesteuerung, Aufnahmebibliothek, Audio-Player, Kapitel-Zeitleiste und Live-Transkript.",
      },
      finances: {
        title: "Finanzen",
        description:
          "Ein Finanzüberblick mit Zeitraumwahl, Kennzahlen, Cashflow-Diagramm, Ausgaben nach Kategorie, Budgets, Konten und einer Transaktionstabelle.",
      },
      crm: {
        title: "CRM",
        description:
          "Ein Vertriebs-CRM mit Deal-Pipeline als Board, Listenansicht, Pipeline-Kennzahlen und Detailbereich mit Aktivitätsverlauf.",
      },
      ecommerce: {
        title: "E-Commerce",
        description:
          "Ein Onlineshop mit Kategoriefiltern, einem Produktraster mit Bewertungen und Merkliste, einer Produkt-Schnellansicht und einem Warenkorb mit Mengen, Gutscheincode und Bestellübersicht.",
      },
      board: {
        title: "Board",
        description:
          "Ein Sprint-Board im Jira-Stil mit Swimlanes, Vorgangskarten mit Typ, Priorität, Story Points und Bearbeiter, Schnellfiltern, Drag-and-drop und einem Detailbereich.",
      },
      workflow: {
        title: "Workflow",
        description:
          "Ein Editor für Automatisierungen: eine Knoten-Arbeitsfläche mit Triggern, Bedingungen und Aktionen, ein Zeichen-Dock an jeder beliebigen Kante, eine Minimap, ein Inspektor und ein Testlauf.",
      },
      documentation: {
        title: "Dokumentation",
        description:
          "Eine Dokumentationsseite mit gruppierter Navigation und Suche, gut lesbarem Text mit Codebeispiel, einem Hinweiskasten und einer Schrittliste, Links zu vorheriger / nächster Seite und einer Gliederung „Auf dieser Seite“, die beim Scrollen mitläuft.",
      },
      changelog: {
        title: "Changelog",
        description:
          "Release Notes eines Produkts auf einer Zeitleiste: Version und Datum neben jedem Release, eine kurze Zusammenfassung und Listen für Neu / Verbessert / Behoben, ein Filter nach Typ, ein Abonnieren-Button und links eine mitlaufende Versionsliste, die direkt zu jedem Release springt.",
      },
      landing: {
        title: "Landingpage",
        description:
          "Eine Produkt-Landingpage aus den Seitenblöcken: ein Website-Header mit mobilem Menü, ein Hero mit einer Vorschaukarte, ein Funktionsabschnitt, Preispläne und eine Fußzeile mit Linkspalten.",
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
    show: "Änderungen anzeigen",
    all: "Alle",
    features: "Neu",
    fixes: "Fehlerbehebungen",
    docs: "Doku",
    breaking: "Inkompatible Änderungen",
    empty: "Keine Releases mit dieser Art von Änderung.",
  },
  notFound: {
    title: "Seite nicht gefunden",
    description: "Die gesuchte Seite existiert nicht.",
    back: "Zurück zur Startseite",
  },
};
