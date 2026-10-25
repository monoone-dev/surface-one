import type { Messages } from "./en";

export const pl: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "Spokojne, dostępne komponenty dla Angulara, Vue i Reacta",
    description:
      "SurfaceOne to dostępny system projektowy dla Angulara, Vue / Nuxt oraz React / Next.js: ponad 70 rodzin komponentów, tokeny projektowe niezależne od frameworka, sześć skórek w trybie jasnym i ciemnym oraz fonty z pełnym pokryciem latin-ext.",
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
    codeSample: "Kod {lang}",
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
    madeBy: "Stworzone przez {brand}.",
    license: "Udostępnione na licencji MIT.",
    resources: "Zasoby",
    project: "Projekt",
    changelog: "Lista zmian",
    contributing: "Współtworzenie",
  },
  home: {
    title: "SurfaceOne — system projektowy dla Angulara, Vue i Reacta",
    eyebrow: "Teraz także React i Next.js",
    heading: "Twórz spokojne, dostępne interfejsy z SurfaceOne",
    lead: "Komponenty oparte na sygnałach dla Angulara, Vue / Nuxt oraz React / Next.js, niezależne od frameworka tokeny projektowe i sześć starannie dopracowanych skórek w trybie jasnym i ciemnym — dostępne od razu i gotowe dla każdej aplikacji.",
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
        title: "Sześć skórek, dwa tryby",
        body: "Surface, Linen, Studio, Paper, Minimalist i Neumorphism deklarują na nowo te same tokeny. Jasny, ciemny lub systemowy — przełączany jednym atrybutem.",
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
        title: "Jeden system, trzy frameworki",
        body: "Tokeny znajdują się w pakiecie niezależnym od frameworka. Angular, Vue / Nuxt oraz React / Next.js renderują te same znaczniki na tych samych fundamentach.",
      },
    },
    showcaseTitle: "Przedsmak komponentów",
    showcaseLead:
      "Wszystko poniżej to prawdziwy pakiet, renderowany na żywo z wybranym przez Ciebie motywem.",
    ctaTitle: "Zbuduj kolejny ekran z SurfaceOne",
    ctaBody: "Zainstaluj pakiet, załaduj tokeny i zacznij komponować.",
    frameworks: {
      label: "Framework",
      angular: "Angular",
      vue: "Vue / Nuxt",
      react: "React / Next.js",
      installStep: "Instalacja",
      setupAngular: "Dodaj style w angular.json",
      setupVue: "Dodaj moduł Nuxt (albo wtyczkę SurfaceOne w czystym Vue)",
      setupReact:
        "Zaimportuj style raz, w głównym layoucie (Next.js) lub w main.tsx",
      worksWith: "Działa z",
    },
    previewLabel:
      "Podgląd na żywo aplikacji zbudowanej z komponentów SurfaceOne: wyspa nawigacji, przegląd ze statystykami, wykresami liniowymi i listą słupkową oraz czat AI.",
  },
  components: {
    title: "Komponenty",
    description:
      "Wszystkie komponenty SurfaceOne pogrupowane według roli: układ, elementy, formularze, dane, nawigacja, nakładki, bloki stron, czat AI, edytor, multimedia i flow.",
    lead: "Każdy komponent ma własny punkt wejścia, więc aplikacja dołącza do paczki tylko to, co importuje.",
    filterLabel: "Filtruj komponenty",
    filterPlaceholder: "Filtruj po nazwie…",
    filterClear: "Wyczyść filtr",
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
      flow: {
        name: "Flow",
        description:
          "Rysuj diagramy i workflowy: płótno z węzłami i krawędziami, sterowanie, minimapa i dock z narzędziami.",
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
      framework: "Framework",
      vueMissing: "Nie ma jeszcze komponentu Vue.",
      vueReadme: "Zobacz, co obejmuje pakiet Vue",
      nuxtNote:
        "W Nuxt dodaj `@surface-one/vue/nuxt` do `modules` w `nuxt.config.ts`: moduł automatycznie importuje każdy komponent `Sone*`, więc powyższy import jest opcjonalny.",
      reactMissing: "Nie ma jeszcze komponentu React.",
      reactReadme: "Zobacz, co obejmuje pakiet React",
      availability: "Dostępny w",
      available: "dostępny",
      unavailable: "jeszcze niedostępny",
      nativeAvailable: "Jest dostępny w React Native.",
      nativeMissing: "Nie ma go jeszcze w React Native.",
      nextNote:
        'W Next.js używaj komponentów bezpośrednio w komponentach serwerowych: te, które przechowują stan, są w pakiecie oznaczone `"use client"`.',
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
      "scroll-area":
        "Kontener przewijania z cienkimi paskami w kolorach tokenów i natywnym przewijaniem przeglądarki — w pionie, w poziomie lub w obu kierunkach, dostępny z klawiatury, gdy treść się nie mieści, z opcjonalnym wygaszaniem krawędzi.",
      resizable:
        "Panele obok siebie lub jeden nad drugim z uchwytami pomiędzy — przeciągane myszą lub obsługiwane klawiaturą jak rozdzielacz okien z WAI-ARIA, z minimalnymi i maksymalnymi rozmiarami, zwijanymi panelami, dwukierunkowymi rozmiarami i opcjonalnym zapisem.",
      collapsible:
        "Pokazuje i ukrywa obszar za pomocą wyzwalacza, który utrzymuje synchronizację aria-expanded i aria-controls.",
      disclosure:
        "Sekcja stopniowego ujawniania zgodna ze wzorcem Disclosure z WAI-ARIA.",
      accordion:
        "Ułożone jedna pod drugą sekcje, które pokazują i ukrywają swoją treść — jedną lub kilka naraz — zgodnie ze wzorcem Accordion z WAI-ARIA.",
      breadcrumb:
        "Ścieżka linków od strony głównej do bieżącej, z separatorami, wielokropkiem zwiniętych pozycji i linkami współpracującymi z routerem.",
      "navigation-menu":
        "Nawigacja witryny: linki i wyzwalacze w elemencie nav, z których każdy odsłania panel linków po kliknięciu, najechaniu lub z klawiatury; przyciski rozwijania i prawdziwe linki, a nie menu ARIA.",
      "app-bar":
        "Górny pasek ekranu: przycisk lub link powrotu, tytuł jako prawdziwy nagłówek z podtytułem i akcje na końcu, w elemencie header, który może przylegać do góry i omija wycięcie ekranu.",
      "tab-bar":
        "Dolna nawigacja w stylu mobilnym: linki lub przyciski z ikonami i etykietą aktywnej karty, jako pływająca pigułka lub pasek na całą szerokość, który omija wskaźnik ekranu głównego.",
      pagination:
        "Nawigacja po stronach z przyciskami Wstecz i Dalej, oznaczoną bieżącą stroną i wielokropkami w miejscu pominiętych stron — składane linki albo gotowy komponent sterowany liczbą stron.",
      alert:
        "Wyróżniony komunikat z ważną informacją, z tytułem, opisem, akcją i pięcioma tonami.",
      avatar:
        "Obraz użytkownika z inicjałami jako zastępstwem i ogólnym symbolem po wylogowaniu.",
      "avatar-group":
        "Nachodzące na siebie awatary z „+N” dla pozostałych: osoby ze zdjęciami lub inicjałami albo awatary jako dzieci, ograniczone przez max, jako jedna nazwana grupa.",
      badge:
        "Kompaktowa etykieta statusu, liczników lub tagów, w sześciu wariantach i czterech odcieniach statusu.",
      banner:
        "Jednowierszowy komunikat statusu z ikoną na początku; błędy i ostrzeżenia są ogłaszane czytnikom ekranu.",
      "bar-chart":
        "Wykres kolumnowy krótkiej serii z etykietami osi, podpowiedzią przy najechaniu i fokusie, nawigacją strzałkami i ukrytą tabelą danych dla czytników ekranu.",
      "line-chart":
        "Jedna lub kilka serii w kategoriach albo w czasie: proste lub wygładzone linie, oś wartości z okrągłymi podziałkami, punkty, legenda i podpowiedź, z ruchomym fokusem i ukrytą tabelą danych.",
      "area-chart":
        "Serie rysowane jako wypełnione obszary, obok siebie lub skumulowane, z osią, legendą, podpowiedzią, ruchomym fokusem i ukrytą tabelą danych wykresu liniowego.",
      "donut-chart":
        "Części całości jako pierścień: jeden segment na część, suma w środku, legenda z wartościami i segmenty, które można wskazać kursorem lub przejść klawiszami strzałek.",
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
      "status-dot":
        "Mała okrągła kropka statusu w kolorze znaczeniowym, z opcjonalnym pulsowaniem i nazwą dostępności.",
      input:
        "Pola, etykiety, opisy, błędy i grupy pól z dodatkami — natywne pola stylowane przez system.",
      "image-picker":
        "Pole obrazu do kliknięcia nad natywnym polem pliku: przerywany placeholder, a potem podgląd z przyciskami zmiany i usunięcia, przechowujący wybrany plik lub adres URL zapisanego obrazu.",
      select:
        "Natywna lista wyboru jako kontrolka formularza z projektowanymi opcjami.",
      calendar:
        "Siatka miesiąca do wyboru daty, zakresu lub kilku dat, z klawiszami siatki dat WAI-ARIA, datami min i max, wyłączonymi dniami i nazwami miesięcy z Intl.",
      "date-picker":
        "Przycisk z datą, który otwiera kalendarz w wyskakującym panelu, do wyboru jednej daty lub zakresu, działający jako kontrolka formularza z formatowaniem Intl.",
      combobox:
        "Pole tekstowe, które podczas pisania filtruje listę opcji, z grupami, stanem pustym, wielokrotnym wyborem jako chipy i klawiszami combobox WAI-ARIA, działające jako kontrolka formularza.",
      checkbox:
        "Natywne pole wyboru ze stanem nieokreślonym, połączone z etykietą przez pole formularza, do formularzy i list „zaznacz wszystko”.",
      "radio-group":
        "Zestaw natywnych przycisków opcji o wspólnej nazwie i jednej wartości, ze strzałkami i jednym przystankiem Tab, działający jako kontrolka formularza.",
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
      "copy-button":
        "Kopiowanie wartości do schowka z krótkim potwierdzeniem „Skopiowano”, które słyszą też czytniki ekranu.",
      "input-otp":
        "Pole kodu jednorazowego: jedno prawdziwe pole rysowane jako osobne komórki, więc wklejanie, autouzupełnianie i czytniki ekranu po prostu działają.",
      "password-input":
        "Pole hasła z przełącznikiem pokaż / ukryj, jako kontrolka formularza.",
      stepper:
        "Postęp w wieloetapowym procesie jako kropki lub numerowane kroki, z licznikiem „Krok x z y”.",
      rating:
        "Gwiazdki dla oceny — obraz tylko do odczytu z ułamkami albo grupa radio do oceniania z klawiatury, jako kontrolka formularza.",
      textarea:
        "Natywne wielowierszowe pole w wyglądzie skórki: automatyczna wysokość między minimalną a maksymalną liczbą wierszy, stan błędu i licznik znaków, który ogłasza, ile znaków zostało.",
      "file-upload":
        "Strefa upuszczania wokół natywnego pola pliku: kliknij lub upuść pliki, sprawdzane pod kątem akceptowanych typów, limitu rozmiaru i liczby, a potem wyświetlane z rozmiarem, podglądem obrazu i przyciskiem usuwania.",
      "input-number":
        "Pole liczbowe z przyciskami minus i plus — spinbutton obsługiwany strzałkami, Page Up / Down i Home / End, ograniczony do min i max, jako kontrolka formularza.",
      flow: "Płótno z węzłami dla diagramów i workflowów — przeciągane węzły, zakrzywione krawędzie z etykietami, uchwyty do łączenia, przesuwanie i zoom, sterowanie i minimapa.",
      dock: "Pasek narzędzi do rysowania przypinany do górnej, dolnej, lewej lub prawej krawędzi płótna, z nawigacją strzałkami i podpowiedziami.",
      confirm:
        "Potwierdzenie w miejscu zamiast okna modalnego: tytuł, opis i błąd, najpierw Anuluj, potem Potwierdź, fokus na akcji, Escape anuluje, stan zajętości.",
      "search-field":
        "Pole wyszukiwania z ikoną lupy i przyciskiem czyszczenia; Enter wysyła, Escape czyści. Działa jako kontrolka formularza.",
      "collapsible-section":
        "Zwijana sekcja z tytułem: przycisk nagłówka ze strzałką, podtytułem i licznikiem oraz treść pod spodem.",
      "filter-chips":
        "Przyciski filtra jednokrotnego wyboru tworzone z danych, jako chipy lub zakładki, z licznikiem przy opcji i nawigacją strzałkami.",
      "section-heading":
        "Wiersz nagłówka sekcji: prawdziwy h2–h4 nazwany samym tytułem (opcjonalny licznik czytany jest po nim), z akcjami na końcu.",
      "load-more":
        "Przycisk „Pokaż więcej” na końcu stronicowanej listy, z liczbą pozostałych pozycji, stanem ładowania i ponowieniem po błędzie.",
      "tag-input":
        "Wpisywanie tagów jako usuwalnych etykiet — Enter lub przecinek dodaje, Backspace usuwa ostatni — jako kontrolka formularza.",
      table:
        "Gęsta tabela danych definiowana szablonami kolumn, z podpisami i stanem pustym.",
      "data-table":
        "Tabela sterowana danymi, zbudowana na Table: sortowane kolumny, globalny filtr, paginacja, zaznaczanie wierszy polami wyboru, menu widoczności kolumn oraz stany ładowania i pusty.",
      carousel:
        "Slajdy w ścieżce ze scroll-snap, bez zależności: przyciski Wstecz i Dalej, opcjonalne kropki, przesuwanie palcem i klawisze strzałek, zapętlenie, kilka slajdów naraz i opcjonalne automatyczne przewijanie, które zatrzymuje się po najechaniu i przy fokusie — zgodnie ze wzorcem Carousel z WAI-ARIA.",
      item: "Wiersz z multimediami, tytułem, opisem i akcjami — do list i ustawień.",
      "empty-state": "Wyjaśnia pusty widok i proponuje kolejny krok.",
      graph:
        "Interaktywny diagram sieci na kanwie — układy siłowy, klastrowy i warstwowy, przesuwanie i powiększanie, obsługa klawiaturą oraz lista węzłów.",
      "source-list":
        "Zatytułowana lista źródeł w postaci chipów lub wierszy, z przełącznikiem „pokaż więcej”.",
      "chart-legend":
        "Próbki kolorów i legenda wykresu, której pozycje mogą włączać i wyłączać serie.",
      "stacked-bar":
        "Jeden pasek podzielony na części całości, z opcjonalnym pustym torem na resztę, legendą i odczytywanym podsumowaniem.",
      stat: "Kluczowe liczby w liście opisów — etykieta, wartość, podpowiedź i trend, jako karty, wpuszczone kafelki lub zwykły wiersz.",
      command:
        "Lista poleceń i paleta z wyszukiwaniem — pole combobox, opcje podświetlane z klawiatury, grupy i wbudowane filtrowanie.",
      tree: "Obsługa klawiatury dla drzewa wierszy — strzałki, rozwijanie i zwijanie, wyszukiwanie po pierwszych literach i jeden przystanek Tab, zgodnie ze wzorcem WAI-ARIA tree.",
      "tree-row":
        "Wiersz drzewa plików z wcięciem, przełącznikiem rozwijania, zaznaczeniem i akcjami.",
      dialog:
        "Modalne okna dialogowe i okna alertów z zarządzaniem fokusem, zamykaniem klawiszem Escape i kliknięciem tła.",
      sheet: "Modalny panel przypięty do dowolnej krawędzi okna.",
      drawer:
        "Sheet, który można zsunąć gestem: panel od dołu lub z dowolnej krawędzi z uchwytem, zamykaniem przesunięciem i opcjonalnymi punktami zatrzymania, z pułapką fokusu, klawiszem Escape i przyciemnionym tłem z komponentu Sheet.",
      menu: "Menu rozwijane z grupami, etykietami, skrótami, elementami typu pole wyboru i radio oraz podmenu.",
      "context-menu":
        "Elementy, podmenu i klawisze rodziny menu, otwierane tam, gdzie są potrzebne: prawym przyciskiem przy wskaźniku, długim przytrzymaniem pod palcem albo klawiszem menu kontekstowego i Shift+F10.",
      menubar:
        "Pasek menu w stylu aplikacji desktopowych, zbudowany z rodziny menu: jeden przystanek tabulacji, klawisze strzałek między menu i do sąsiednich, a po otwarciu menu przełączanie najechaniem.",
      popover:
        "Niemodalny panel zakotwiczony przy wyzwalaczu, umieszczany po dowolnej stronie, który przejmuje fokus i zamyka się klawiszem Escape lub kliknięciem poza nim.",
      "hover-card":
        "Karta podglądu dla linku, pokazywana po krótkim opóźnieniu przy najechaniu lub fokusie z klawiatury i otwarta, dopóki wskaźnik jest na linku lub karcie; niemodalna, a na ekranach dotykowych otwiera ją dotknięcie.",
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
      "page-hero":
        "Blok otwierający stronę docelową: nadtytuł, tytuł jako prawdziwy nagłówek, opis i linki wezwania do działania, z mediami obok lub pod spodem i możliwością zamiany stron.",
      "page-section":
        "Sekcja strony docelowej: ikona, nadtytuł, tytuł jako prawdziwy nagłówek, opis, siatka funkcji z ikonami i linkami oraz media obok lub pod spodem.",
      "pricing-plan":
        "Plany strony z cennikiem: tytuł z plakietką, cena (przekreślona, gdy zastępuje ją rabat) z okresem rozliczeniowym, lista funkcji z ptaszkami, wezwanie do działania i warunki, z jednym wyróżnionym planem.",
      "page-footer":
        "Stopka witryny: Twoja marka, kolumny linków z tytułami w nazwanej nawigacji oraz dolny wiersz z informacją o prawach autorskich i własną treścią, w elemencie footer.",
      "page-site-header":
        "Nagłówek witryny: logo, nawigacja i akcje oraz przycisk menu, który na wąskich ekranach otwiera nawigację w panelu Sheet, w elemencie header, który może przylegać do góry.",
      chat: "Pełna anatomia czatu: panel, wątek, wiadomości, pole redagowania, wysyłanie, sugestie i wskaźnik pisania.",
      terminal:
        "Rozmowa z agentem jako terminal: log w kroju monospace, w którym Twoje wiadomości się wyróżniają, cicha aktywność narzędzi, status na żywo mówiący, kto pracuje i od jak dawna, oraz prompt.",
      "agent-chat":
        "Ta sama rozmowa z agentem jako czat: Twoje wiadomości w dymkach w kolorze akcentu, agenci pod swoimi awatarami, cicha aktywność narzędzi, status pracy na żywo i pole wiadomości. Wymienny z Terminalem część po części.",
      "chat-history":
        "Zapisane rozmowy z asystentem: filtrowanie po tytule, otwieranie, grupowanie według wieku w panelu bocznym, ze stanami ładowania, pustym i błędu.",
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
              "`@surface-one/tokens` — CSS niezależny od frameworka: tokeny, sześć skórek w trybie jasnym i ciemnym, akcenty oraz fonty latin-ext.",
              "`@surface-one/angular` — komponenty. Każda rodzina komponentów ma własny punkt wejścia, np. `@surface-one/angular/button`.",
            ],
          },
          {
            p: "`@surface-one/vue` przenosi te same komponenty do Vue 3 i Nuxt (z modułem `@surface-one/vue/nuxt`), a `@surface-one/react` do Reacta 19 i Next.js. Wszystkie współdzielą `@surface-one/tokens`, więc motyw wygląda identycznie w każdym frameworku.",
          },
          {
            p: "`@surface-one/react-native` przenosi je na iOS i Androida, z tymi samymi tokenami rozwiązanymi dla React Native. Zobacz [React Native](/guide/react-native).",
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
              "**Nieprzezroczyste wyspy na jednej tafli szkła.** Treść zawsze leży na nieprzezroczystej powierzchni; malowane tło widać tylko w ramie aplikacji i nic się nie rozmywa — spokojna oprawa z powściągliwym akcentem.",
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
      "react-native": {
        title: "React Native",
        description:
          "Używaj komponentów SurfaceOne w aplikacji React Native lub Expo, ostylowanych tymi samymi tokenami i skórkami.",
        blocks: [
          {
            p: "`@surface-one/react-native` przenosi komponenty na iOS i Androida. Używa tych samych nazw `Sone*` i tych samych propsów co pakiet React wszędzie tam, gdzie mają sens na telefonie, z tymi samymi rolami, nazwami i stanami dla czytników ekranu. React Native nie ma CSS, więc każdy token jest rozwiązywany z wyprzedzeniem dla każdej skórki, trybu kolorów i akcentu, a provider przekazuje wartości wszystkim komponentom.",
          },
          { h2: "1. Zainstaluj pakiety" },
          { p: "W aplikacji Expo (SDK 53 lub nowszy):" },
          { code: "installExpo" },
          {
            p: "W czystej aplikacji React Native (0.78 lub nowsza, z New Architecture):",
          },
          { code: "installReactNative" },
          { h2: "2. Opakuj aplikację w provider" },
          { code: "reactNativeProvider" },
          {
            list: [
              "`skin` — `surface`, `linen`, `studio`, `paper`, `minimalist` lub `neumorphism`, importowana z `@surface-one/react-native/skins`. Każda skórka jest osobnym modułem, więc aplikacja dołącza do paczki tylko te skórki, których używa.",
              "`colorMode` — `light`, `dark` lub `system` (domyślnie; podąża za ustawieniem urządzenia).",
              "`accent` — `blue`, `teal`, `green`, `orange` lub `pink`; pomiń go, aby użyć akcentu skórki.",
              "`tokens` nadpisuje pojedyncze wartości, a `messages` tłumaczy wbudowane teksty.",
            ],
          },
          {
            p: "Provider jest opcjonalny: bez niego komponenty renderują się w skórce Minimalist, w trybie jasnym, po angielsku.",
          },
          { h2: "Tokeny we własnych widokach" },
          {
            p: "Każdy token zachowuje swoją nazwę z CSS w camelCase (`--surface-raised` → `surfaceRaised`, `--space-4` → `space4`). Kolory są ciągami znaków, długości liczbami w dp, a cienie ciągami `boxShadow`:",
          },
          { code: "reactNativeTokens" },
          { h2: "Fonty" },
          {
            p: "Domyślnie komponenty używają fontu platformy. Aby użyć krojów skórki, najpierw je załaduj, a potem ustaw `fonts`:",
          },
          { code: "reactNativeFonts" },
          { h2: "Czym różni się od wersji webowej" },
          {
            list: [
              "`onPress` zastępuje `onClick`, a `style` (scalany na końcu) zastępuje `className`.",
              "Stany wciśnięcia zastępują stany najechania. Obramowanie fokusu pojawia się przy fokusie z klawiatury.",
              "Dialogi i arkusze są natywnymi modalami: dotknięcie tła lub naciśnięcie przycisku Wstecz na Androidzie je zamyka.",
              "Tekst dziedziczy po swoim komponencie: ciąg znaków wewnątrz przycisku lub plakietki staje się jego etykietą, a `SoneText` i `SoneIcon` przejmują otaczający kolor i rozmiar.",
              "Ustawienie ograniczenia ruchu w urządzeniu zatrzymuje spinnery, szkielety i przejścia.",
            ],
          },
          {
            note: "Obsługiwane są formularze, nakładki oraz komponenty prezentacyjne i danych. Rodziny dostępne tylko w webie (sidebar, menu, podpowiedzi, tabele, markdown, flow, czat AI i edytor) nie są.",
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
              "`data-skin` — `surface`, `linen`, `studio`, `paper`, `minimalist` lub `neumorphism`.",
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
      utilities: {
        title: "Klasy pomocnicze",
        description:
          "Globalne klasy pomocnicze układu i tekstu dołączone do arkusza stylów komponentów.",
        blocks: [
          {
            p: "`@surface-one/angular/styles.css` (oraz `@surface-one/vue/styles.css`, `@surface-one/react/styles.css`) zawierają kilka globalnych klas pomocniczych, dzięki którym aplikacja nie musi w każdym komponencie od nowa pisać tych samych kontenerów flex i stylów tekstu. Każda wartość to token.",
          },
          { h2: "Układ" },
          {
            list: [
              "`.stack` — kolumna flex; odstęp `--space-3`.",
              "`.cluster` — zawijany, wyśrodkowany w pionie rząd etykiet lub przycisków; odstęp `--space-2`.",
              "`.row` — wyśrodkowany rząd bez zawijania; `.row-between` rozsuwa jego krańce. Odstęp `--space-2`.",
              '`data-gap="1"` … `"8"` na każdej z nich wybiera stopień `--space-1` … `--space-8`.',
            ],
          },
          { code: "layoutUtilities" },
          { h2: "Tekst" },
          {
            list: [
              "`.text-hint` — dodatkowa linia pod kontrolką lub pustym stanem: drugorzędny kolor, `sm`, normalna interlinia, bez marginesu.",
              "`.text-caption` — drobny druk: wyciszony kolor, `xs`.",
              "`.truncate` — jedna linia ucięta wielokropkiem; `min-width: 0` pozwala jej się zwężać w ścieżce flex lub grid.",
              "`.list-reset` — `<ul>` / `<ol>` bez punktorów, marginesu i dopełnienia.",
              "Dostępne są też `.text-secondary`, `.text-muted`, `.text-success`, `.text-danger`, `.section-label` i `.sr-only`.",
            ],
          },
          { code: "textUtilities" },
          {
            note: "To zwykłe nazwy klas. Jeśli aplikacja używa już `.row` lub `.stack` do czegoś innego, reguła globalna zadziała i tam — zmień nazwę własnej klasy albo uwzględnij ustawiane przez nią właściwości.",
          },
          { h2: "Reguły stylów" },
          {
            p: "`@surface-one/stylelint-config` zamienia zasadę „tylko tokeny” w lint. Używa wyłącznie wbudowanych reguł stylelinta, czyta pliki `.css`, `.scss` i bloki `<style>` w plikach `.vue`, a każdy komunikat podaje token, którego należy użyć:",
          },
          {
            list: [
              "Bez surowych kolorów — bez hex, nazw kolorów i `rgb()` / `hsl()` / `oklch()`. Użyj tokena motywu, np. `var(--text-primary)`, albo `color-mix()` na tokenach dla odcienia; `transparent` i `currentColor` są dozwolone.",
              "Bez surowych `px` w `gap`, `padding`, `margin`, `border-radius`, `box-shadow`, `font-size` i `letter-spacing`: użyj `--space-*`, `--radius-*`, `--shadow-*`, `--font-size-*` i `--tracking-*`. `0` jest w porządku, a rozmiary strukturalne (`width`, `height`, `min-*`, `max-*`, `inset`) zostają w pikselach.",
              "`z-index` bierze stopień z drabiny `--z-*` — `var(--z-raised)`, `var(--z-dropdown)`, `var(--z-modal)` … — albo jeden krok od niego, `calc(var(--z-raised) + 1)`.",
              "Linia włoskowa to `var(--border-width-thin) solid`, nigdy `1px solid`.",
              "`backdrop-filter` służy tylko do przyciemnienia skórki: `blur(var(--scrim-blur))`.",
              "Czasy trwania pochodzą z `--transition`, `--transition-fast` i stopni `--duration-*`, nigdy z surowych `ms` lub `s`.",
            ],
          },
          { code: "stylelintInstall" },
          { code: "stylelintConfig" },
          {
            p: "Wyłącz reguły tylko dla plików, które definiują twoje własne tokeny. Gdy surowa wartość jest naprawdę strukturalna, wycisz tę jedną linię i podaj powód — wyłączenie bez powodu albo takie, które niczego nie wycisza, też jest błędem:",
          },
          { code: "stylelintDisable" },
        ],
      },
      fonts: {
        title: "Fonty",
        description:
          "Hostowane lokalnie fonty zmienne z podzbiorami latin i latin-ext.",
        blocks: [
          {
            p: "`@surface-one/tokens` zawiera każdy font, do którego się odwołuje — Inter, Geist, Geist Mono, Figtree, DM Sans, JetBrains Mono, Schibsted Grotesk i Source Serif 4 — jako hostowane lokalnie fonty zmienne WOFF2. Nic nie jest ładowane z CDN.",
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
      neumorphism: "Neumorphism",
      surface: "Surface",
      linen: "Linen",
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
      "Gotowe ekrany złożone z komponentów SurfaceOne: pulpit, czat AI, ustawienia, notatki ze spotkania, logowanie i rejestracja, formularz z walidacją, wiadomości, przestrzeń robocza z dwoma paskami bocznymi, edytor markdown, media, finanse, CRM, sklep internetowy, tablica sprintu, edytor workflowów, dokumentacja, lista zmian i strona docelowa.",
    lead: "Pełne ekrany zbudowane wyłącznie z pakietu. Skopiuj je jako punkt wyjścia.",
    view: "Zobacz szablon",
    back: "Wszystkie szablony",
    vueMissing: "Ten szablon nie ma jeszcze wersji Vue.",
    reactMissing: "Ten szablon nie ma jeszcze wersji React.",
    viewport: "Widok urządzenia",
    devices: {
      desktop: "Komputer",
      tablet: "Tablet",
      phone: "Telefon",
    },
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
      login: {
        title: "Logowanie",
        description:
          "Karta logowania z przyciskami Google, Apple i GitHub, formularzem e-mail i hasło, walidacją i opcją zapamiętania.",
      },
      signup: {
        title: "Rejestracja",
        description:
          "Rejestracja na podzielonym ekranie z SSO, miernikiem siły hasła, regułami hasła na żywo i zgodami.",
      },
      form: {
        title: "Walidacja formularza",
        description:
          "Długi, wielosekcyjny formularz z walidacją reaktywną, regułami między polami i podsumowaniem błędów z linkami do pól.",
      },
      messages: {
        title: "Wiadomości",
        description:
          "Skrzynka wiadomości z wyszukiwalną listą rozmów, dymkami, wskaźnikiem pisania i polem redagowania.",
      },
      workspace: {
        title: "Dwa paski boczne",
        description:
          "Przestrzeń zadań ze zwijanym paskiem nawigacji po lewej i paskiem szczegółów po prawej.",
      },
      editor: {
        title: "Edytor markdown",
        description:
          "Edytor dokumentów z listą plików, paskiem formatowania, trybami pisania, podziału i podglądu oraz autozapisem.",
      },
      media: {
        title: "Media",
        description:
          "Studio nagrań z przyciskiem nagrywania, biblioteką nagrań, odtwarzaczem audio, osią czasu rozdziałów i transkrypcją na żywo.",
      },
      finances: {
        title: "Finanse",
        description:
          "Przegląd finansów z przełącznikiem okresu, kluczowymi wskaźnikami, wykresem przepływów, wydatkami według kategorii, budżetami, kontami i tabelą transakcji.",
      },
      crm: {
        title: "CRM",
        description:
          "CRM sprzedażowy z tablicą lejka transakcji, widokiem listy, statystykami lejka i panelem szczegółów transakcji z historią aktywności.",
      },
      ecommerce: {
        title: "E-commerce",
        description:
          "Sklep internetowy z filtrami kategorii, siatką produktów z ocenami i listą życzeń, szybkim podglądem produktu oraz koszykiem z ilościami, kodem rabatowym i podsumowaniem zamówienia.",
      },
      board: {
        title: "Tablica",
        description:
          "Tablica sprintu w stylu Jiry ze swimlane'ami, kartami zgłoszeń z typem, priorytetem, story pointami i osobą przypisaną, szybkimi filtrami, przeciąganiem i panelem szczegółów zgłoszenia.",
      },
      workflow: {
        title: "Workflow",
        description:
          "Edytor automatyzacji: płótno z węzłami wyzwalaczy, warunków i akcji, dock z narzędziami, który przeniesiesz do dowolnej krawędzi, minimapa, inspektor i przebieg testowy.",
      },
      documentation: {
        title: "Dokumentacja",
        description:
          "Strona dokumentacji z pogrupowaną nawigacją i wyszukiwarką, czytelną treścią z przykładem kodu, wyróżnioną uwagą i listą kroków, linkami poprzednia / następna oraz spisem „Na tej stronie”, który podąża za przewijaniem.",
      },
      changelog: {
        title: "Lista zmian",
        description:
          "Informacje o wydaniach produktu na jednej osi czasu: wersja i data obok każdego wydania, krótkie podsumowanie i listy Dodano / Ulepszono / Naprawiono, filtr według typu, przycisk subskrypcji i przyklejona lista wersji po lewej, która przenosi prosto do wybranego wydania.",
      },
      landing: {
        title: "Strona docelowa",
        description:
          "Strona docelowa produktu zbudowana z bloków stron: nagłówek witryny z menu mobilnym, sekcja hero z kartą podglądu, sekcja funkcji, plany cenowe i stopka z kolumnami linków.",
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
    show: "Pokaż zmiany",
    all: "Wszystkie",
    features: "Nowości",
    fixes: "Poprawki",
    docs: "Dokumentacja",
    breaking: "Zmiany niekompatybilne",
    empty: "Brak wydań z tym rodzajem zmian.",
  },
  notFound: {
    title: "Nie znaleziono strony",
    description: "Strona, której szukasz, nie istnieje.",
    back: "Wróć na stronę główną",
  },
};
