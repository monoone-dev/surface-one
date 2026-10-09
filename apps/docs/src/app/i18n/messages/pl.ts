import type { Messages } from "./en";

export const pl: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "System projektowy dla spokojnych aplikacji local-first",
    description:
      "SurfaceOne to dostępny system projektowy dla Angulara: 50 rodzin komponentów, tokeny projektowe, trzy skórki w trybie jasnym i ciemnym oraz fonty z pełnym pokryciem latin-ext.",
  },
  a11y: {
    skipToContent: "Przejdź do treści",
    mainNav: "Główna",
    sectionNav: "Sekcja",
    breadcrumb: "Ścieżka nawigacji",
    openMenu: "Otwórz menu",
    closeMenu: "Zamknij menu",
    language: "Język",
    colorMode: "Tryb kolorów",
    externalLink: "(otwiera się w nowej karcie)",
    copyCode: "Kopiuj kod",
    copied: "Skopiowano",
    onThisPage: "Na tej stronie",
    preview: "Podgląd na żywo",
  },
  nav: {
    home: "Strona główna",
    components: "Komponenty",
    guide: "Przewodnik",
    theme: "Motyw",
    templates: "Szablony",
    changelog: "Lista zmian",
    storybook: "Storybook",
    github: "GitHub",
  },
  colorMode: {
    system: "Systemowy",
    light: "Jasny",
    dark: "Ciemny",
  },
  footer: {
    madeBy: "Stworzone przez MonoOne.",
    license: "Udostępnione na licencji projektu.",
    resources: "Zasoby",
    project: "Projekt",
    changelog: "Lista zmian",
    contributing: "Współtworzenie",
  },
  home: {
    title: "SurfaceOne — system projektowy dla Angulara",
    eyebrow: "System projektowy · v{version}",
    heading: "Twórz spokojne, dostępne interfejsy z SurfaceOne",
    lead: "Komponenty Angulara oparte na sygnałach, tokeny projektowe i trzy starannie dopracowane skórki — w trybie jasnym i ciemnym — wyodrębnione z IndexOne i gotowe do użycia w dowolnej aplikacji.",
    getStarted: "Zacznij",
    browseComponents: "Przeglądaj komponenty",
    openStorybook: "Otwórz Storybook",
    installLabel: "Instalacja",
    stats: {
      components: "rodzin komponentów",
      symbols: "komponentów i dyrektyw",
      skins: "skórki × jasny/ciemny",
      locales: "języków dokumentacji",
    },
    featuresTitle: "Wszystko, czego potrzebuje interfejs produktu",
    features: {
      tokens: {
        title: "Najpierw tokeny",
        body: "Każdy kolor, promień, odstęp i cień to właściwość niestandardowa CSS. Komponenty odczytują tokeny, nigdy surowe wartości.",
      },
      skins: {
        title: "Trzy skórki, dwa tryby",
        body: "Studio, Paper i Minimalist deklarują na nowo te same tokeny. Jasny, ciemny lub systemowy — przełączany jednym atrybutem.",
      },
      a11y: {
        title: "Dostępność domyślnie",
        body: "Prawdziwe przyciski, wzorce ARIA z praktyk WAI-ARIA, widoczny fokus, ograniczony ruch i kontrast na poziomie AA.",
      },
      signals: {
        title: "Sygnały i tryb zoneless",
        body: "Komponenty standalone, OnPush, wejścia i modele oparte na sygnałach. Działa z Angularem w trybie zoneless i z renderowaniem po stronie serwera.",
      },
      fonts: {
        title: "latin-ext wszędzie",
        body: "Każdy dołączony font zawiera podzbiory latin i latin-ext, więc ą, ł, ő, ř i ș nigdy nie są zastępowane w środku słowa.",
      },
      frameworks: {
        title: "Gotowe na kolejne frameworki",
        body: "Tokeny znajdują się w pakiecie niezależnym od frameworka. Angular jest dostępny już dziś; Vue i React będą korzystać z tych samych fundamentów.",
      },
    },
    showcaseTitle: "Przedsmak komponentów",
    showcaseLead:
      "Wszystko poniżej to prawdziwy pakiet, renderowany na żywo z wybranym przez Ciebie motywem.",
    ctaTitle: "Zbuduj kolejny ekran z SurfaceOne",
    ctaBody: "Zainstaluj pakiet, załaduj tokeny i zacznij komponować.",
  },
  components: {
    title: "Komponenty",
    description:
      "Wszystkie komponenty SurfaceOne pogrupowane według roli: układ, elementy, formularze, dane, nawigacja, nakładki, bloki stron, czat AI, edytor i multimedia.",
    lead: "Każdy komponent ma własny punkt wejścia, więc aplikacja dołącza do paczki tylko to, co importuje.",
    filterLabel: "Filtruj komponenty",
    filterPlaceholder: "Filtruj po nazwie…",
    noResults: "Żaden komponent nie pasuje do „{query}”.",
    count: "Komponenty: {count}",
    categories: {
      layout: {
        name: "Układ",
        description: "Struktura ekranu: paski boczne, karty i separatory.",
      },
      element: {
        name: "Element",
        description:
          "Małe elementy składowe: przyciski, plakietki, alerty i wskaźniki.",
      },
      form: {
        name: "Formularz",
        description:
          "Pola, listy wyboru, przełączniki, suwaki i kontrolki wyboru.",
      },
      data: {
        name: "Dane",
        description:
          "Prezentacja rekordów: tabele, elementy, listy i stany puste.",
      },
      navigation: {
        name: "Nawigacja",
        description: "Poruszanie się po hierarchiach.",
      },
      overlay: {
        name: "Nakładka",
        description:
          "Okna dialogowe, panele, menu, podpowiedzi i powiadomienia.",
      },
      page: {
        name: "Strona",
        description: "Nagłówki i akcje dla trasy.",
      },
      chat: {
        name: "Czat AI",
        description:
          "Wątki, wiadomości, dymki i znaczniki statusu dla asystentów.",
      },
      editor: {
        name: "Edytor",
        description: "Renderowanie i pisanie w Markdownie.",
      },
      media: {
        name: "Multimedia",
        description: "Nagrywanie, odtwarzanie, transkrypcje i osie czasu.",
      },
    },
    page: {
      import: "Import",
      usage: "Użycie",
      api: "Dokumentacja API",
      selector: "Selektor",
      exportAs: "Eksport jako",
      inputs: "Wejścia",
      outputs: "Wyjścia",
      name: "Nazwa",
      type: "Typ",
      default: "Domyślnie",
      required: "wymagane",
      twoWay: "dwukierunkowe",
      noInputs: "Brak wejść.",
      openInStorybook: "Otwórz w Storybooku",
      viewSource: "Zobacz źródło",
      previous: "Poprzedni",
      next: "Następny",
      preview: "Podgląd",
      code: "Kod",
      kind: {
        component: "Komponent",
        directive: "Dyrektywa",
        pipe: "Potok",
      },
    },
    entries: {
      sidebar:
        "Zwijany pasek boczny aplikacji z nagłówkiem, grupami, menu, plakietkami, szyną i wciętym obszarem treści — Sidebar z shadcn/ui dla Angulara.",
      card: "Powierzchnia grupująca powiązane treści, z częściami: nagłówek, tytuł, opis, akcja, treść i stopka.",
      separator:
        "Jednopikselowa linia między treściami, pozioma lub pionowa, dekoracyjna lub semantyczna.",
      collapsible:
        "Pokazuje i ukrywa obszar za pomocą wyzwalacza, który utrzymuje synchronizację aria-expanded i aria-controls.",
      disclosure:
        "Sekcja stopniowego ujawniania zgodna ze wzorcem Disclosure z WAI-ARIA.",
      alert:
        "Wyróżniony komunikat z ważną informacją, z tytułem, opisem, akcją i pięcioma tonami.",
      avatar:
        "Obraz użytkownika z inicjałami jako zastępstwem i ogólnym symbolem po wylogowaniu.",
      badge:
        "Kompaktowa etykieta statusu, liczników lub tagów, w sześciu wariantach i czterech odcieniach statusu.",
      banner:
        "Jednowierszowy komunikat statusu z ikoną na początku; błędy i ostrzeżenia są ogłaszane czytnikom ekranu.",
      "bar-chart":
        "Wykres kolumnowy krótkiej serii z etykietami osi, podpowiedzią przy najechaniu i fokusie, nawigacją strzałkami i ukrytą tabelą danych dla czytników ekranu.",
      "bar-list":
        "Uszeregowana lista poziomych słupków z etykietą i wartością obok, skalowanych do największej wartości lub sumy; etykieta może być dowolnym szablonem.",
      button:
        "Jeden przycisk: sześć wariantów, cztery rozmiary tekstowe i cztery kwadratowe rozmiary ikon, a do tego grupy przycisków.",
      icon: "Wbudowane symbole SVG rysowane w currentColor — bez fontu ikon i bez dodatkowego żądania.",
      kbd: "Klawisze i kombinacje klawiszy.",
      logo: "Znaki SurfaceOne, IndexOne i Ivy, które zmieniają się wraz z trybem kolorów.",
      progress:
        "Liniowy pasek postępu, określony lub nieokreślony, z dostępną rolą progressbar.",
      "download-progress":
        "Pasek postępu z dynamicznym podpisem i opcjonalną akcją anulowania.",
      meter:
        "Segmentowy wskaźnik zgrubnych, porządkowych wielkości, takich jak dokładność czy szybkość.",
      skeleton:
        "Pulsujący symbol zastępczy o rozmiarze hosta, wyświetlany podczas ładowania treści.",
      sparkline:
        "Miniaturowy wykres liniowy, warstwowy, słupkowy lub cieplny bez osi w jednym rozciągniętym SVG — domyślnie dekoracyjny albo obraz z odczytywanym podsumowaniem.",
      spinner:
        "Obracający się wskaźnik ładowania rysowany w currentColor, w dowolnym rozmiarze.",
      input:
        "Pola, etykiety, opisy, błędy i grupy pól z dodatkami — natywne pola stylowane przez system.",
      select:
        "Natywna lista wyboru jako kontrolka formularza z projektowanymi opcjami.",
      switch:
        "Przełącznik wł./wył. działający jako kontrolka formularza, w dwóch rozmiarach.",
      slider:
        "Suwak zakresu z wypełnieniem w kolorze akcentu i okrągłym uchwytem, używany jako kontrolka formularza.",
      "power-slider":
        "Dyskretna drabina wartości jako kontrolka zakresu, która pokazuje podgląd podczas przeciągania i zatwierdza po zwolnieniu.",
      segmented:
        "Kontrolka segmentowa jednokrotnego wyboru renderowana z danych — wzorzec Jasny / Ciemny / Systemowy.",
      "toggle-group":
        "Przełączniki, grupy przełączników i karty z wędrującym fokusem, w każdej orientacji.",
      "choice-card":
        "Rozbudowane karty radiowe, w których cała karta jest opcją, z jednym przystankiem tabulatora i nawigacją strzałkami.",
      "secret-field":
        "Wprowadzanie, zapisywanie i czyszczenie sekretu, np. klucza API, ze statusem ustawiony / nieustawiony.",
      table:
        "Gęsta tabela danych definiowana szablonami kolumn, z podpisami i stanem pustym.",
      item: "Wiersz z multimediami, tytułem, opisem i akcjami — do list i ustawień.",
      "empty-state": "Wyjaśnia pusty widok i proponuje kolejny krok.",
      "source-list":
        "Zatytułowana lista źródeł w postaci chipów lub wierszy, z przełącznikiem „pokaż więcej”.",
      "chart-legend":
        "Próbki kolorów i legenda wykresu, której pozycje mogą włączać i wyłączać serie.",
      "stacked-bar":
        "Jeden pasek podzielony na części całości, z opcjonalnym pustym torem na resztę, legendą i odczytywanym podsumowaniem.",
      stat: "Kluczowe liczby w liście opisów — etykieta, wartość, podpowiedź i trend, jako karty, wpuszczone kafelki lub zwykły wiersz.",
      "tree-row":
        "Wiersz drzewa plików z wcięciem, przełącznikiem rozwijania, zaznaczeniem i akcjami.",
      dialog:
        "Modalne okna dialogowe i okna alertów z zarządzaniem fokusem, zamykaniem klawiszem Escape i kliknięciem tła.",
      sheet: "Modalny panel przypięty do dowolnej krawędzi okna.",
      menu: "Menu rozwijane z grupami, etykietami, skrótami, elementami typu pole wyboru i radio, podmenu oraz popovery.",
      "row-menu":
        "Menu rozwijane pod wielokropkiem z akcjami dla wiersza, obsługujące kliknięcie poza nim i klawiaturę.",
      tooltip:
        "Podpowiedź wyświetlana po najechaniu i przy fokusie, dla kontrolek z samą ikoną, z dowolnej strony, z opcjonalną strzałką.",
      toaster:
        "Ułożone w stos powiadomienia typu toast z akcjami i zamykaniem — kolejką zarządza aplikacja.",
      "page-header":
        "Blok tytułowy trasy z nadtytułem, tytułem, opisem i akcjami.",
      "page-actions":
        "Akcje nagłówka strony dokumentu: status, główna kontrolka i menu z dodatkowymi opcjami.",
      chat: "Pełna anatomia czatu: panel, wątek, wiadomości, pole redagowania, wysyłanie, sugestie i wskaźnik pisania.",
      message:
        "Jeden wpis wątku: awatar, nagłówek, dymki i stopka, wyrównane do początku lub końca.",
      bubble:
        "Dymek wiadomości w wariantach default, secondary, muted i ghost.",
      marker:
        "Wiersz statusu w wątku, np. „Myślę…” lub „Przeszukano 4 notatki”.",
      markdown:
        "Renderuje Markdown w stylu GitHub jako tekst i pozwala go edytować z paskiem narzędzi, podglądem na żywo i widokiem dzielonym.",
      "audio-player":
        "Smukły odtwarzacz nagrań z przewijaniem, postępem, czasem i prędkością odtwarzania.",
      recording:
        "Przycisk nagrywania, przełącznik mikrofonu, wskaźnik poziomu, kula statusu, licznik czasu, wskaźnik nagrywania i status przetwarzania dla interfejsów nagrywania.",
      "speaker-chip":
        "Inicjały mówcy w awatarze w kolorze jego roli oraz jego nazwa, wyprowadzone z jednego klucza mówcy transkrypcji.",
      transcript:
        "Transkrypcja pogrupowana według wypowiedzi, z przewijaniem do miejsca po kliknięciu.",
      "side-panel":
        "Panel zadokowany obok strony, z nagłówkiem, tytułem, akcjami, przyciskiem zamknięcia i przewijaną treścią.",
      "floating-bar":
        "Pastylka unosząca się nad wszystkimi aplikacjami, gdy nagrywanie jest gotowe, trwa lub jest przetwarzane, z przyciskiem zamknięcia.",
      "live-transcript": "Dziennik napisów trwającego nagrania.",
      timeline:
        "Ścieżki bloków i wstęga rozdziałów na jednej skali czasu, ze znacznikiem odtwarzania, rozdziałami i legendą.",
    },
  },
  guide: {
    title: "Przewodnik",
    description:
      "Dowiedz się, jak zainstalować, dostosować motyw i używać SurfaceOne w aplikacji Angular.",
    pages: {
      introduction: {
        title: "Wprowadzenie",
        description:
          "Czym jest SurfaceOne, na czym jest zbudowany i jak pakiety do siebie pasują.",
        blocks: [
          {
            p: "SurfaceOne to system projektowy stojący za IndexOne, wyodrębniony do pakietów, z których może korzystać każda aplikacja. Opiera się na konwencjach **shadcn/ui**, przeniesionych do Angulara poprzez anatomię **spartan/ui**, a każdą wartość odczytuje z tokenów projektowych.",
          },
          { h2: "Pakiety" },
          {
            list: [
              "`@surface-one/tokens` — CSS niezależny od frameworka: tokeny, trzy skórki w trybie jasnym i ciemnym, akcenty oraz fonty latin-ext.",
              "`@surface-one/angular` — komponenty. Każda rodzina komponentów ma własny punkt wejścia, np. `@surface-one/angular/button`.",
            ],
          },
          {
            p: "Planowane są pakiety dla Vue i Reacta. Będą współdzielić `@surface-one/tokens`, więc motyw wygląda identycznie w każdym frameworku.",
          },
          { h2: "Zbudowany na spartan/ui, shadcn/ui i Nuxt UI" },
          {
            list: [
              "**spartan/ui** (ng-spartan) — anatomia Angulara: części oparte na dyrektywach, nazwy wejść i zachowanie.",
              "**shadcn/ui** — rdzeń wizualny: warianty, rozmiary i style, na których zbudowane są nasze skórki.",
              "**Nuxt UI** — dokumentacja: kategorie komponentów, szablony, serwer MCP i umiejętności agentów.",
            ],
          },
          { h2: "Zasady" },
          {
            list: [
              "**Wyłącznie tokeny.** Komponenty korzystają z `var(--token)`; skórka deklaruje tokeny na nowo i nigdy nie tworzy odgałęzienia komponentu.",
              "**Najpierw natywne elementy.** Przycisk to `<button>`, lista wyboru to `<select>`. ARIA uzupełnia luki, które pozostawia natywny HTML.",
              "**Sygnały i tryb zoneless.** Komponenty standalone, OnPush, wejścia, modele i wyjścia oparte na sygnałach.",
              "**Płaskie, nieprzezroczyste powierzchnie.** Bez szkła i rozmycia — spokojna oprawa z powściągliwym akcentem.",
            ],
          },
          { h2: "Nazewnictwo" },
          {
            p: "Każdy selektor elementu zaczyna się od `sone-` (`<sone-dialog>`, `<sone-switch>`), a każda dyrektywa atrybutowa od `sone` (`button[soneBtn]`, `[soneCard]`). Symbole TypeScript zaczynają się od `Sone`.",
          },
          {
            note: "Chcesz sprawdzić każdy stan komponentu? [Storybook](/storybook/) renderuje każdy z nich z kontrolkami na żywo.",
          },
        ],
      },
      installation: {
        title: "Instalacja",
        description:
          "Dodaj SurfaceOne do aplikacji Angular 22 w trzech krokach.",
        blocks: [
          { h2: "1. Zainstaluj pakiety" },
          { code: "install" },
          {
            p: "Punkt wejścia markdown wymaga też opcjonalnych zależności równorzędnych (`marked`, `dompurify` i pakietów `@codemirror/*`). Zainstaluj je tylko wtedy, gdy importujesz `@surface-one/angular/markdown`.",
          },
          { h2: "2. Załaduj style" },
          {
            p: "Dodaj tokeny i arkusz stylów komponentów do tablicy `styles` w celu budowania — najpierw tokeny:",
          },
          { code: "angularJson" },
          {
            p: "Style komponentów są celowo globalne: większość części jest projektowana lub przenoszona do portali, gdzie emulowana enkapsulacja nie sięga.",
          },
          { h2: "3. Włącz lokalizację" },
          {
            p: "Komponenty oznaczają swoje wbudowane teksty (np. „Zamknij”) za pomocą `$localize`, więc dodaj polyfill:",
          },
          { code: "localize" },
          { h2: "Użyj komponentu" },
          { code: "usage" },
          {
            p: "Następnie wybierz skórkę i tryb kolorów na stronie [Motyw](/theme).",
          },
        ],
      },
      theming: {
        title: "Motywy",
        description:
          "Przełączaj skórki, tryby kolorów i akcenty za pomocą trzech atrybutów i nadpisuj dowolne tokeny.",
        blocks: [
          { p: "Trzy atrybuty elementu `<html>` sterują całym systemem:" },
          {
            list: [
              "`data-skin` — `studio`, `paper` lub `minimalist`.",
              "`data-theme` — `light`, `dark` lub `system` (brak atrybutu również oznacza ustawienie systemowe).",
              "`data-accent` — `blue`, `teal`, `green`, `orange` lub `pink`; bez atrybutu używany jest akcent skórki.",
            ],
          },
          { code: "themeAttributes" },
          { h2: "Unikaj mignięcia niewłaściwego motywu" },
          {
            p: "Ustaw atrybuty przed pierwszym renderowaniem za pomocą małego skryptu wbudowanego w `index.html`:",
          },
          { code: "themeScript" },
          { h2: "Nadpisywanie tokenów" },
          {
            p: "Każda decyzja wizualna to właściwość niestandardowa. Zadeklaruj ją ponownie pod tym samym selektorem, aby zmienić ją wszędzie:",
          },
          { code: "overrideTokens" },
          {
            p: "Wszystkie tokeny na żywo znajdziesz na stronie [Motyw](/theme).",
          },
        ],
      },
      fonts: {
        title: "Fonty",
        description:
          "Hostowane lokalnie fonty zmienne z podzbiorami latin i latin-ext.",
        blocks: [
          {
            p: "`@surface-one/tokens` zawiera każdy font, do którego się odwołuje — Geist, Geist Mono, Figtree, DM Sans, JetBrains Mono i Source Serif 4 — jako hostowane lokalnie fonty zmienne WOFF2. Nic nie jest ładowane z CDN.",
          },
          { h2: "latin-ext jest obowiązkowy" },
          {
            p: "Każda rodzina zawiera dwa pliki: **latin** i **latin-ext**. Sam podzbiór latin nie ma znaków ą, ć, ę, ł, ń, ś, ź, ż (ani ő, ř, ș …), więc przeglądarka rysowałaby te glify fontem systemowym w środku słowa. Podział przez `unicode-range` sprawia, że strona pobiera plik latin-ext tylko wtedy, gdy renderuje jeden z tych znaków.",
          },
          { code: "fontFace" },
          {
            p: "Tekst chiński i japoński korzysta z fontu CJK platformy, określonego w każdym stosie fontów.",
          },
          { h2: "Dodawanie fontu" },
          {
            p: "Nowa rodzina jest akceptowana tylko z oboma podzbiorami. Dodaj dwa pliki WOFF2 do `packages/tokens/fonts/` oraz parę reguł `@font-face` do `fonts.css`.",
          },
        ],
      },
      accessibility: {
        title: "Dostępność",
        description:
          "Jak SurfaceOne spełnia WCAG 2.2 AA i za co nadal odpowiada Twoja aplikacja.",
        blocks: [
          {
            p: "SurfaceOne celuje w **WCAG 2.2 na poziomie AA**. Komponenty stosują WAI-ARIA Authoring Practices, a ta witryna dokumentacji jest testowana narzędziem axe-core na każdej stronie w trybie jasnym i ciemnym.",
          },
          { h2: "Co robią komponenty" },
          {
            list: [
              'Używają najpierw elementów natywnych — `<button>`, `<select>`, `<input type="checkbox">` — dzięki czemu obsługa klawiatury i czytników ekranu jest zapewniona od razu.',
              'Implementują wzorce ARIA: ujawnianie (`aria-expanded`, `aria-controls`), grupy radiowe z jednym przystankiem tabulatora i klawiszami strzałek, menu, okna dialogowe, które zatrzymują i przywracają fokus, `role="progressbar"` z wartościami.',
              "Pokazują widoczny pierścień fokusu na każdej interaktywnej części (`--focus-ring`).",
              "Respektują `prefers-reduced-motion` i utrzymują kontrast tekstu na poziomie co najmniej 4.5:1 w każdej skórce.",
            ],
          },
          { h2: "Za co odpowiada Twoja aplikacja" },
          {
            list: [
              "Nadaj każdemu przyciskowi z samą ikoną atrybut `aria-label`.",
              "Opisz etykietą każdą kontrolkę formularza — użyj `soneFieldLabel` lub `<label for>`.",
              "Ustaw `<html lang>` i znaczący tytuł dokumentu dla każdej trasy.",
              "Ogłaszaj istotne wyniki operacji asynchronicznych, np. za pomocą toastera lub regionu live.",
            ],
          },
        ],
      },
      i18n: {
        title: "Internacjonalizacja",
        description: "Tłumacz wbudowane teksty i obsługuj każdy system pisma.",
        blocks: [
          {
            p: "Komponenty zawierają bardzo mało własnego tekstu, a każdy wbudowany tekst („Zamknij”, „Pokaż więcej”, „Pobieranie…”) jest oznaczony za pomocą `$localize`. Przetłumacz je, korzystając ze standardowego procesu i18n w Angularze:",
          },
          { code: "extractI18n" },
          {
            p: "Liczba mnoga korzysta z komunikatów ICU i stosuje reguły odmiany aktywnych ustawień regionalnych. Daty i czasy trwania są formatowane za pomocą `Intl`.",
          },
          { h2: "Języki tej witryny" },
          {
            p: "Ta dokumentacja jest dostępna w językach: English, Polski, Español, Italiano, Français, Português, Deutsch, 简体中文 i 日本語 — tych samych co witryna IndexOne.",
          },
        ],
      },
      mcp: {
        title: "Serwer MCP",
        description:
          "Daj Claude Code, Codex, GitHub Copilot, Cursor i Windsurf bezpośredni dostęp do dokumentacji, API i tokenów SurfaceOne.",
        blocks: [
          {
            p: "`@surface-one/angular-mcp` to serwer Model Context Protocol. Twój asystent AI pyta go o dokładne API komponentu, działający przykład, jego kod źródłowy i style, przewodniki, szablony ekranów i zmienne motywu — zamiast zgadywać. Wszystko jest dołączone do pakietu: działa offline i zawsze odpowiada Twojej wersji.",
          },
          { h2: "Claude Code" },
          { code: "mcpClaude" },
          { h2: "Codex" },
          { code: "mcpCodex" },
          { p: "Lub dodaj go do `~/.codex/config.toml`:" },
          { code: "mcpCodexToml" },
          { h2: "VS Code z GitHub Copilot" },
          { p: "Dodaj `.vscode/mcp.json` do swojego projektu:" },
          { code: "mcpVsCode" },
          { h2: "Cursor, Windsurf i Claude Desktop" },
          { code: "mcpJson" },
          { h2: "Narzędzia" },
          {
            list: [
              "`list_components` — każda rodzina komponentów wraz z punktem wejścia i selektorami.",
              "`get_component_docs` — opis, import, działający przykład i pełne API. Przyjmuje nazwy, slugi, klasy lub selektory, np. `soneBtn`.",
              "`get_component_source_code` i `get_component_source_styles` — implementacja.",
              "`get_docs` — strony przewodnika i informacje o wydaniach.",
              "`get_theme_variables` — wartości tokenów dla każdej skórki w trybie jasnym i ciemnym.",
              "`list_templates` i `get_template` — kompletne ekrany, od których można zacząć.",
            ],
          },
          { h2: "Zapytaj na przykład" },
          {
            list: [
              "„Zbuduj stronę ustawień z SurfaceOne: przełącznik, listę wyboru i przycisk zapisu.”",
              "„Pokaż mi API okna dialogowego SurfaceOne.”",
              "„Których tokenów używa skórka Paper w trybie ciemnym?”",
            ],
          },
          {
            note: "Połącz serwer z [umiejętnościami agentów](/guide/skills): umiejętności mówią asystentowi, jak pracować z SurfaceOne, a serwer dostarcza mu faktów.",
          },
        ],
      },
      skills: {
        title: "Umiejętności agentów",
        description:
          "Zainstaluj umiejętności SurfaceOne dla Claude Code, OpenAI Codex i GitHub Copilot jednym poleceniem.",
        blocks: [
          {
            p: "Umiejętności agentów to foldery z plikiem `SKILL.md`, które asystent ładuje, gdy zadanie ich wymaga. Claude Code, Codex i GitHub Copilot korzystają z tego samego formatu, więc jeden pakiet obsługuje wszystkie trzy.",
          },
          {
            list: [
              "`surface-one-angular` — budowanie ekranów z komponentów: konfiguracja, punkty wejścia, selektory `sone-`, tokeny, nakładki i formularze, wraz z pełnym katalogiem komponentów.",
              "`surface-one-theming` — skórki, tryb jasny, ciemny i systemowy, akcenty, nadpisywanie tokenów i fonty latin-ext.",
              "`surface-one-a11y-review` — lista kontrolna WCAG 2.2 AA dla ekranów SurfaceOne.",
            ],
          },
          { h2: "Instalacja" },
          { code: "skillsAdd" },
          { h2: "Gdzie trafiają" },
          {
            list: [
              "**Claude Code** — `.claude/skills/` (globalnie `~/.claude/skills/`).",
              "**Codex** — `.agents/skills/` (globalnie `~/.agents/skills/`).",
              "**GitHub Copilot** — `.agents/skills/` (globalnie `~/.copilot/skills/`).",
            ],
          },
          {
            p: "Po aktualizacji SurfaceOne uruchom polecenie ponownie z `--force`, aby odświeżyć umiejętności.",
          },
          {
            note: "Dodaj też [serwer MCP](/guide/mcp) — umiejętności korzystają z jego narzędzi, gdy jest dostępny.",
          },
        ],
      },
      contributing: {
        title: "Współtworzenie",
        description:
          "Gałęzie, Conventional Commits, pull requesty i właściciele kodu.",
        blocks: [
          { p: "SurfaceOne stosuje te same zasady co IndexOne." },
          { h2: "Gałęzie i commity" },
          {
            list: [
              "Nazwy gałęzi mają postać `<type>/<kebab-slug>`, np. `feat/sone-calendar`.",
              "Nagłówki commitów i tytuły PR są zgodne z Conventional Commits: `<type>(<scope>): <subject>`, maksymalnie 100 znaków, temat małymi literami.",
              "Żadnych przypisań autorstwa — bez stopek współautorstwa AI ani dopisków „generated with”.",
            ],
          },
          { code: "commit" },
          { h2: "Pull requesty" },
          {
            p: "Treść PR to szablon repozytorium: jeden krótki wiersz na każdą rzeczywistą zmianę, prostym językiem angielskim. Każdy PR wymaga zatwierdzenia przez właściciela kodu.",
          },
          { h2: "Dodawanie komponentu" },
          {
            list: [
              "Utwórz `packages/angular/<name>/` z komponentem, `index.ts` i `ng-package.json`.",
              "Używaj wyłącznie prefiksu selektora `sone-`, OnPush, wejść opartych na sygnałach i tokenów.",
              "Dodaj `<name>.stories.ts` i zarejestruj komponent w katalogu dokumentacji wraz z demem.",
            ],
          },
        ],
      },
    },
  },
  theme: {
    title: "Motyw",
    description:
      "Tokeny projektowe, skórki, tryby kolorów i akcenty SurfaceOne — na żywo.",
    lead: "Każda wartość na tej stronie jest odczytywana z aktywnych tokenów. Zmień ustawienia, a cała witryna się dostosuje.",
    controls: "Ustawienia motywu",
    skin: "Skórka",
    mode: "Tryb",
    accent: "Akcent",
    accentDefault: "Domyślny dla skórki",
    skins: {
      studio: "Studio",
      paper: "Paper",
      minimalist: "Minimalist",
    },
    accents: {
      blue: "Niebieski",
      teal: "Morski",
      green: "Zielony",
      orange: "Pomarańczowy",
      pink: "Różowy",
    },
    sections: {
      colors: "Role kolorów",
      colorsLead:
        "Kolory semantyczne. Komponenty używają tych nazw, nigdy stopni palety.",
      chart: "Kolory wykresów",
      chartLead:
        "Osiem kolorów kategorii dla serii, torów i rodzajów węzłów, pięciostopniowa skala sekwencyjna oraz para wzrost / spadek. Każdy ma co najmniej 3:1 na tle karty i strony w każdej skórce i trybie kolorów.",
      palette: "Palety akcentów",
      typography: "Typografia",
      typographyLead: "Skala typograficzna wspólna dla wszystkich skórek.",
      radius: "Promień zaokrąglenia",
      spacing: "Odstępy",
      shadows: "Cienie",
      tokens: "Wszystkie tokeny",
      tokensLead:
        "Pliki tokenów pakietu @surface-one/tokens i właściwości niestandardowe deklarowane w każdym z nich.",
    },
    sample: "Pchnąć w tę łódź jeża lub ośm skrzyń fig — Zażółć gęślą jaźń",
    reset: "Resetuj",
  },
  templates: {
    title: "Szablony",
    description:
      "Gotowe ekrany złożone z komponentów SurfaceOne: pulpit, czat AI, ustawienia i notatki ze spotkania.",
    lead: "Pełne ekrany zbudowane wyłącznie z pakietu. Skopiuj je jako punkt wyjścia.",
    view: "Zobacz szablon",
    back: "Wszystkie szablony",
    items: {
      dashboard: {
        title: "Pulpit",
        description:
          "Powłoka aplikacji z paskiem bocznym, nagłówkiem strony, kartami statystyk i tabelą danych.",
      },
      chat: {
        title: "Czat AI",
        description:
          "Wątek asystenta z wiadomościami, znacznikami, sugestiami i polem redagowania.",
      },
      settings: {
        title: "Ustawienia",
        description:
          "Pogrupowane preferencje z polami, przełącznikami, kartami wyboru i sekretem.",
      },
      notes: {
        title: "Notatki ze spotkania",
        description:
          "Nagranie z odtwarzaczem audio, transkrypcją i wyrenderowanymi notatkami.",
      },
    },
  },
  changelog: {
    title: "Lista zmian",
    description:
      "Każde wydanie SurfaceOne, od najnowszego: nowe komponenty, poprawki i zmiany niekompatybilne, z datą każdej wersji.",
    eyebrow: "Lista zmian",
    heading: "Co nowego w SurfaceOne",
    lead: "Każde wydanie design systemu, od najnowszego. Tokeny, komponenty Angular, serwer MCP i skille mają jedną wspólną wersję.",
    npm: "Zainstaluj z npm",
    github: "Wszystkie wydania na GitHubie",
    latest: "Najnowsza",
    englishNote: "Informacje o wydaniach publikujemy po angielsku.",
    versions: "Wersje",
  },
  notFound: {
    title: "Nie znaleziono strony",
    description: "Strona, której szukasz, nie istnieje.",
    back: "Wróć na stronę główną",
  },
};
