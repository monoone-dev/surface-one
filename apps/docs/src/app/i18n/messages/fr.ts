import type { Messages } from "./en";

export const fr: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "Des composants sobres et accessibles pour Angular, Vue et React",
    description:
      "SurfaceOne est un design system accessible pour Angular, Vue / Nuxt et React / Next.js : plus de 70 familles de composants, des design tokens indépendants du framework, cinq habillages en clair et en sombre, et des polices couvrant entièrement le latin-ext.",
  },
  a11y: {
    skipToContent: "Aller au contenu",
    mainNav: "Principale",
    sectionNav: "Section",
    breadcrumb: "Fil d’Ariane",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    language: "Langue",
    colorMode: "Mode de couleur",
    externalLink: "(s’ouvre dans un nouvel onglet)",
    copyCode: "Copier le code",
    codeSample: "Code {lang}",
    copied: "Copié",
    onThisPage: "Sur cette page",
    preview: "Aperçu en direct",
  },
  nav: {
    home: "Accueil",
    components: "Composants",
    guide: "Guide",
    theme: "Thème",
    templates: "Modèles",
    changelog: "Nouveautés",
    storybook: "Storybook",
    github: "GitHub",
  },
  colorMode: {
    system: "Système",
    light: "Clair",
    dark: "Sombre",
  },
  footer: {
    madeBy: "Conçu par {brand}.",
    license: "Publié sous licence MIT.",
    resources: "Ressources",
    project: "Projet",
    changelog: "Journal des modifications",
    contributing: "Contribuer",
  },
  home: {
    title: "SurfaceOne — design system pour Angular, Vue et React",
    eyebrow: "Désormais avec React et Next.js",
    heading: "Créez des interfaces sereines et accessibles avec SurfaceOne",
    lead: "Des composants à base de signaux pour Angular, Vue / Nuxt et React / Next.js, des design tokens indépendants du framework et cinq skins soignés en clair et en sombre — accessibles par défaut et prêts pour toute application.",
    getStarted: "Commencer",
    browseComponents: "Parcourir les composants",
    openStorybook: "Ouvrir Storybook",
    installLabel: "Installation",
    stats: {
      components: "familles de composants",
      symbols: "composants et directives",
      skins: "habillages × clair/sombre",
      locales: "langues de documentation",
    },
    featuresTitle: "Tout ce dont une interface produit a besoin",
    features: {
      tokens: {
        title: "Les tokens d’abord",
        body: "Chaque couleur, rayon, espacement et ombre est une propriété personnalisée CSS. Les composants lisent des tokens, jamais des valeurs brutes.",
      },
      skins: {
        title: "Cinq habillages, deux modes",
        body: "Surface, Linen, Studio, Paper, Minimalist et Neumorphism redéclarent les mêmes tokens. Clair, sombre ou système — un seul attribut suffit pour basculer.",
      },
      a11y: {
        title: "Accessible par défaut",
        body: "De vrais boutons, des patterns ARIA issus des pratiques WAI-ARIA, un focus visible, des animations réduites et un contraste AA.",
      },
      signals: {
        title: "Signals et zoneless",
        body: "Standalone, OnPush, inputs et models à base de signals. Compatible avec Angular zoneless et le rendu côté serveur.",
      },
      fonts: {
        title: "latin-ext partout",
        body: "Chaque police fournie inclut les sous-ensembles latin et latin-ext : ą, ł, ő, ř et ș ne basculent jamais sur une autre police en plein mot.",
      },
      frameworks: {
        title: "Un système, trois frameworks",
        body: "Les tokens vivent dans un package indépendant du framework. Angular, Vue / Nuxt et React / Next.js produisent le même balisage sur la même fondation.",
      },
    },
    showcaseTitle: "Un aperçu des composants",
    showcaseLead:
      "Tout ce qui suit est le vrai package, rendu en direct avec le thème que vous avez choisi.",
    ctaTitle: "Livrez votre prochain écran avec SurfaceOne",
    ctaBody:
      "Installez le package, chargez les tokens et commencez à composer.",
    frameworks: {
      label: "Framework",
      angular: "Angular",
      vue: "Vue / Nuxt",
      react: "React / Next.js",
      installStep: "Installer",
      setupAngular: "Chargez les styles dans angular.json",
      setupVue: "Ajoutez le module Nuxt (ou le plugin SurfaceOne en Vue seul)",
      setupReact:
        "Importez les styles une seule fois, dans le layout racine (Next.js) ou dans main.tsx",
      worksWith: "Fonctionne avec",
    },
    previewLabel:
      "Aperçu en direct construit avec des composants SurfaceOne : statistiques de la semaine avec tendance, une sparkline, une liste de barres et un indicateur d’enregistrement.",
  },
  components: {
    title: "Composants",
    description:
      "Tous les composants SurfaceOne, regroupés par rôle : mise en page, éléments, formulaires, données, navigation, superpositions, blocs de page, chat IA, éditeur, médias et flow.",
    lead: "Chaque composant dispose de son propre point d’entrée : une application n’embarque que ce qu’elle importe.",
    filterLabel: "Filtrer les composants",
    filterPlaceholder: "Filtrer par nom…",
    filterClear: "Effacer le filtre",
    noResults: "Aucun composant ne correspond à « {query} ».",
    count: "{count} composants",
    categories: {
      layout: {
        name: "Mise en page",
        description:
          "Structurer un écran : barres latérales, cartes et séparateurs.",
      },
      element: {
        name: "Élément",
        description:
          "Les briques de base : boutons, badges, alertes et indicateurs.",
      },
      form: {
        name: "Formulaire",
        description:
          "Champs, listes déroulantes, interrupteurs, curseurs et contrôles de choix.",
      },
      data: {
        name: "Données",
        description:
          "Afficher des enregistrements : tableaux, éléments, listes et états vides.",
      },
      navigation: {
        name: "Navigation",
        description: "Parcourir des hiérarchies.",
      },
      overlay: {
        name: "Superposition",
        description:
          "Boîtes de dialogue, panneaux, menus, infobulles et toasts.",
      },
      page: {
        name: "Page",
        description: "En-têtes et actions d’une route.",
      },
      chat: {
        name: "Chat IA",
        description:
          "Fils, messages, bulles et marqueurs d’état pour les assistants.",
      },
      editor: {
        name: "Éditeur",
        description: "Afficher et rédiger du markdown.",
      },
      media: {
        name: "Médias",
        description: "Enregistrement, lecture, transcriptions et chronologies.",
      },
      flow: {
        name: "Flow",
        description:
          "Dessinez des diagrammes et des workflows : un canevas de nœuds reliés, des contrôles, une mini-carte et un dock d’outils.",
      },
    },
    page: {
      import: "Importation",
      usage: "Utilisation",
      api: "Référence de l’API",
      selector: "Sélecteur",
      exportAs: "Exporté sous",
      inputs: "Inputs",
      outputs: "Outputs",
      name: "Nom",
      type: "Type",
      default: "Par défaut",
      required: "obligatoire",
      twoWay: "bidirectionnel",
      noInputs: "Aucun input.",
      openInStorybook: "Ouvrir dans Storybook",
      viewSource: "Voir le code source",
      previous: "Précédent",
      next: "Suivant",
      preview: "Aperçu",
      code: "Code",
      framework: "Framework",
      vueMissing: "Pas encore de composant Vue.",
      vueReadme: "Voir ce que couvre le package Vue",
      nuxtNote:
        "Dans Nuxt, ajoutez `@surface-one/vue/nuxt` à `modules` dans `nuxt.config.ts` : il importe automatiquement chaque composant `Sone*`, l’import ci-dessus est donc facultatif.",
      reactMissing: "Pas encore de composant React.",
      reactReadme: "Voir ce que couvre le package React",
      availability: "Disponible pour",
      available: "disponible",
      unavailable: "pas encore disponible",
      nativeAvailable: "Il existe en React Native.",
      nativeMissing: "Pas encore disponible en React Native.",
      nextNote:
        'Dans Next.js, utilisez les composants directement depuis les server components : ceux qui gèrent un état sont marqués `"use client"` dans le package.',
      kind: {
        component: "Composant",
        directive: "Directive",
        pipe: "Pipe",
      },
    },
    entries: {
      sidebar:
        "Une barre latérale d’application repliable avec en-tête, groupes, menus, badges, rail et zone de contenu en retrait — le Sidebar de shadcn/ui pour Angular.",
      card: "Une surface qui regroupe du contenu lié, avec en-tête, titre, description, action, contenu et pied.",
      separator:
        "Un filet d’un pixel entre deux contenus, horizontal ou vertical, décoratif ou sémantique.",
      "scroll-area":
        "Un conteneur de défilement aux barres fines dans les couleurs des tokens, avec le défilement natif du navigateur : vertical, horizontal ou les deux, atteignable au clavier quand le contenu déborde, avec des bords estompés facultatifs.",
      resizable:
        "Des panneaux côte à côte ou empilés, séparés par des poignées : à faire glisser ou à piloter au clavier comme le séparateur de fenêtres de WAI-ARIA, avec tailles minimale et maximale, panneaux repliables, tailles bidirectionnelles et sauvegarde facultative.",
      collapsible:
        "Affiche et masque une zone grâce à un déclencheur qui garde aria-expanded et aria-controls synchronisés.",
      disclosure:
        "Une section à divulgation progressive qui suit le pattern Disclosure de WAI-ARIA.",
      accordion:
        "Des sections empilées qui affichent et masquent leur contenu, une ou plusieurs à la fois, selon le pattern Accordion de WAI-ARIA.",
      breadcrumb:
        "La piste de liens de la page d’accueil jusqu’à la page courante, avec séparateurs, points de suspension pour les éléments repliés et liens compatibles avec le routeur.",
      "navigation-menu":
        "La navigation du site : des liens et des déclencheurs dans un nav, chaque déclencheur dévoilant un panneau de liens au clic, au survol ou au clavier ; des boutons de divulgation et de vrais liens, pas un menu ARIA.",
      "app-bar":
        "La barre supérieure d’un écran : un bouton ou un lien de retour, le titre en vrai titre de section avec un sous-titre et des actions à la fin, dans un header qui peut rester collé en haut et évite l’encoche.",
      "tab-bar":
        "Une navigation du bas façon mobile : des liens ou des boutons avec icônes et le libellé de l’onglet actif, en pilule flottante ou en barre pleine largeur qui évite l’indicateur d’accueil.",
      pagination:
        "Une navigation entre pages avec boutons précédent et suivant, la page courante signalée et des points de suspension pour les pages sautées : des liens à composer ou un composant prêt à l’emploi piloté par le nombre de pages.",
      alert:
        "Un encart pour les informations importantes, avec titre, description, action et cinq tons.",
      avatar:
        "Une image d’utilisateur avec repli sur les initiales et un pictogramme générique une fois déconnecté.",
      "avatar-group":
        "Des avatars qui se chevauchent avec un « +N » pour le reste : des personnes avec image ou initiales, ou des avatars enfants, limités par max, en un seul groupe nommé.",
      badge:
        "Une étiquette compacte pour un statut, un compteur ou un tag, avec six variantes et quatre teintes de statut.",
      banner:
        "Un encart d’état sur une ligne avec un pictogramme en tête ; les erreurs et avertissements sont annoncés aux lecteurs d’écran.",
      "bar-chart":
        "Un histogramme pour une courte série, avec libellés d’axe, info-bulle au survol et au focus, navigation aux flèches et un tableau de données masqué pour les lecteurs d’écran.",
      "line-chart":
        "Une ou plusieurs séries sur des catégories ou dans le temps : lignes droites ou lissées, axe des valeurs à graduations rondes, points, légende et infobulle, avec un focus itinérant et un tableau de données masqué.",
      "area-chart":
        "Des séries dessinées en aires remplies, superposées ou empilées, avec l’axe, la légende, l’infobulle, le focus itinérant et le tableau de données masqué du graphique en courbes.",
      "donut-chart":
        "Les parts d’un tout sous forme d’anneau : un segment par part, le total au centre, une légende avec les valeurs, et des segments à survoler ou à parcourir avec les flèches.",
      "bar-list":
        "Une liste classée de barres horizontales étiquetées, avec la valeur à côté, mises à l’échelle du maximum ou du total ; l’étiquette accepte n’importe quel modèle.",
      button:
        "Le bouton unique : six variantes, quatre tailles de texte et quatre tailles d’icône carrées, plus des groupes de boutons.",
      icon: "Des pictogrammes SVG en ligne dessinés en currentColor — sans police d’icônes ni requête supplémentaire.",
      kbd: "Touches du clavier et combinaisons de touches.",
      logo: "Les logos SurfaceOne, IndexOne et Ivy, qui s’adaptent au mode de couleur.",
      progress:
        "Une barre de progression linéaire, déterminée ou indéterminée, avec un rôle progressbar accessible.",
      "download-progress":
        "Une barre de progression avec une légende mise à jour en direct et une action d’annulation facultative.",
      meter:
        "Un indicateur segmenté pour des quantités ordinales approximatives, comme la précision ou la vitesse.",
      skeleton:
        "Un espace réservé pulsant, dimensionné par son hôte pendant le chargement du contenu.",
      sparkline:
        "Un graphique en ligne, aire, barres ou chaleur de la taille d’un mot, sans axes, dans un seul SVG étiré ; décoratif par défaut ou image avec un résumé vocalisé.",
      spinner:
        "Un indicateur de chargement rotatif dessiné en currentColor, à n’importe quelle taille.",
      "status-dot":
        "Un petit point d’état rond dans une teinte sémantique, avec pulsation et nom accessible facultatifs.",
      input:
        "Champs, libellés, descriptions, erreurs et groupes de champs avec compléments — des champs natifs stylés par le système.",
      select:
        "Un select natif utilisable comme contrôle de formulaire, avec options projetées.",
      calendar:
        "Une grille mensuelle pour choisir une date, une plage ou plusieurs dates, avec les touches de grille de dates WAI-ARIA, un minimum et un maximum, des jours désactivés et les noms de mois d’Intl.",
      "date-picker":
        "Un bouton affichant une date qui ouvre un calendrier dans un popover, pour une date ou une plage, comme contrôle de formulaire avec un formatage Intl.",
      combobox:
        "Un champ de texte qui filtre une liste d’options pendant la saisie, avec des groupes, un état vide, une sélection multiple en puces et les touches de combobox WAI-ARIA, comme contrôle de formulaire.",
      checkbox:
        "La case à cocher native avec un état indéterminé, associée à son libellé par un champ, pour les formulaires et les listes « tout sélectionner ».",
      "radio-group":
        "Un ensemble de boutons radio natifs partageant un nom et une valeur, avec les touches fléchées et un seul arrêt de tabulation, utilisable comme contrôle de formulaire.",
      switch:
        "Un interrupteur marche/arrêt utilisable comme contrôle de formulaire, en deux tailles.",
      slider:
        "Un curseur de plage avec remplissage d’accent et poignée ronde, utilisable comme contrôle de formulaire.",
      "power-slider":
        "Une échelle discrète sous forme de curseur, qui prévisualise pendant le glissement et valide au relâchement.",
      segmented:
        "Un contrôle segmenté à choix unique généré à partir de données — le modèle Clair / Sombre / Système.",
      "toggle-group":
        "Bascules, groupes de bascules et onglets avec focus itinérant, dans toutes les orientations.",
      "choice-card":
        "Des cartes radio riches où la carte entière constitue l’option, avec un seul arrêt de tabulation et une navigation aux flèches.",
      "secret-field":
        "Saisir, enregistrer et effacer un secret tel qu’une clé d’API, avec un statut défini / non défini.",
      "copy-button":
        "Copiez une valeur dans le presse-papiers avec une brève confirmation « Copié » que les lecteurs d’écran entendent aussi.",
      "input-otp":
        "Un champ de code à usage unique : un seul vrai champ dessiné en cases séparées, pour que le collage, le remplissage automatique et les lecteurs d’écran fonctionnent d’office.",
      "password-input":
        "Un champ de mot de passe avec un bouton afficher / masquer, utilisable comme contrôle de formulaire.",
      stepper:
        "La progression dans un parcours en plusieurs étapes, en points ou en étapes numérotées, avec le compteur « Étape x sur y ».",
      rating:
        "Des étoiles pour une note : une image en lecture seule avec fractions ou un groupe radio pour noter au clavier, comme contrôle de formulaire.",
      textarea:
        "Le champ natif multiligne à l'apparence du skin : hauteur automatique entre un nombre minimal et maximal de lignes, état invalide et compteur de caractères qui annonce combien il en reste.",
      "file-upload":
        "Une zone de dépôt autour du champ de fichier natif : cliquez ou déposez des fichiers, vérifiés selon les types acceptés et des limites de taille et de nombre, puis listés avec leur taille, un aperçu d'image et un bouton de suppression.",
      "input-number":
        "Un champ numérique avec boutons moins et plus : un spinbutton piloté par les flèches, Page préc. / suiv. et Début / Fin, borné par min et max, comme contrôle de formulaire.",
      flow: "Un canevas de nœuds pour diagrammes et workflows : nœuds déplaçables, liens courbes avec libellés, poignées de connexion, panoramique et zoom, contrôles et mini-carte.",
      dock: "Une barre d’outils de dessin ancrée au bord supérieur, inférieur, gauche ou droit d’un canevas, avec navigation aux flèches et infobulles.",
      confirm:
        "Une confirmation en place plutôt qu’une modale : titre, description et erreur, Annuler puis Confirmer, focus sur l’action, Échap pour annuler et un état occupé.",
      "search-field":
        "Un champ de recherche avec loupe et bouton d’effacement ; Entrée valide, Échap efface. Utilisable comme contrôle de formulaire.",
      "collapsible-section":
        "Une section titrée repliable : un bouton d’en-tête avec chevron, sous-titre et compteur, et le contenu dessous.",
      "filter-chips":
        "Des boutons de filtre à choix unique générés depuis des données, en puces ou en onglets, avec un compteur par option et la navigation aux flèches.",
      "section-heading":
        "La ligne de titre d’une section : un vrai h2 à h4 nommé par son seul titre (le compteur facultatif est lu après), avec des actions à la fin.",
      "load-more":
        "Le bouton « Afficher plus » en bas d’une liste paginée, avec le nombre restant, un état de chargement et une relance après une erreur.",
      "tag-input":
        "Saisissez des étiquettes sous forme de puces amovibles : Entrée ou une virgule en ajoute une, Retour arrière retire la dernière ; utilisable comme contrôle de formulaire.",
      table:
        "Un tableau de données dense défini par des modèles de colonnes, avec légende et état vide.",
      "data-table":
        "Un tableau piloté par les données, construit sur Table : colonnes triables, filtre global, pagination, sélection de lignes par cases à cocher, menu de visibilité des colonnes et états de chargement et vide.",
      carousel:
        "Des diapositives dans une piste à scroll-snap, sans dépendance : Précédent et Suivant, points facultatifs, balayage et touches fléchées, boucle, plusieurs diapositives par vue et lecture automatique facultative mise en pause au survol et au focus, selon le modèle Carousel de WAI-ARIA.",
      item: "Une ligne avec média, titre, description et actions — pour les listes et les réglages.",
      "empty-state": "Explique une vue vide et propose l’étape suivante.",
      graph:
        "Un diagramme de réseau interactif sur un canevas : dispositions par forces, par groupes et en couches, déplacement et zoom, navigation au clavier et liste des nœuds.",
      "source-list":
        "Une liste de sources titrée, en puces ou en lignes, avec un bouton « Afficher plus ».",
      "chart-legend":
        "Des pastilles de couleur et une légende de graphique dont les éléments peuvent afficher ou masquer les séries.",
      "stacked-bar":
        "Une barre découpée en parts d’un total, avec piste restante en option, légende et un résumé lu par les lecteurs d’écran.",
      stat: "Des chiffres clés dans une liste de descriptions : libellé, valeur, indication et tendance, en cartes, en tuiles en creux ou en simple ligne.",
      command:
        "Une liste et une palette de commandes avec recherche : champ combobox, options surlignées au clavier, groupes et filtrage intégré.",
      tree: "Navigation au clavier dans une arborescence de lignes : flèches, déplier et replier, recherche à la saisie et un seul arrêt de tabulation, selon le motif tree de WAI-ARIA.",
      "tree-row":
        "Une ligne d’arborescence de fichiers avec indentation, bouton de dépliage, sélection et actions.",
      dialog:
        "Boîtes de dialogue modales et d’alerte avec gestion du focus, fermeture par Échap et par clic sur le voile.",
      sheet: "Un panneau modal ancré à n’importe quel bord de la fenêtre.",
      drawer:
        "Un Sheet qu’on balaie pour le fermer : un panneau venu du bas ou de n’importe quel bord, avec une poignée, la fermeture par balayage et des points d’arrêt facultatifs, en gardant le piège de focus, Échap et le fond assombri du Sheet.",
      menu: "Menus déroulants avec groupes, libellés, raccourcis, éléments case à cocher et radio, et sous-menus.",
      "context-menu":
        "Les éléments, sous-menus et touches de la famille des menus, ouverts là où on les demande : d'un clic droit au pointeur, d'un appui long sous le doigt, ou avec la touche menu contextuel et Maj+F10.",
      menubar:
        "Une barre de menus façon application de bureau, construite avec la famille des menus : un seul arrêt de tabulation, les flèches entre les menus et vers leurs voisins, et le changement au survol dès qu'un menu est ouvert.",
      popover:
        "Un panneau non modal ancré à son déclencheur, placé de n'importe quel côté, qui prend le focus et se ferme avec Échap ou un clic à l'extérieur.",
      "hover-card":
        "Une carte d'aperçu pour un lien, affichée au survol ou au focus clavier après un court délai et maintenue ouverte tant que le pointeur reste sur le lien ou la carte ; non modale, elle s'ouvre d'un toucher sur les écrans tactiles.",
      "row-menu":
        "Le menu déroulant « … » pour les actions par ligne, avec gestion du clic extérieur et du clavier.",
      tooltip:
        "Une infobulle au survol et au focus pour les contrôles composés d’une seule icône, de n’importe quel côté, avec flèche facultative.",
      toaster:
        "Des notifications toast empilées avec actions et fermeture — l’application gère la file d’attente.",
      "page-header":
        "Le bloc de titre d’une route avec surtitre, titre, description et actions.",
      "page-actions":
        "Les actions d’en-tête d’une page de document : statut, contrôle principal et menu de débordement.",
      chat: "L’anatomie complète d’un chat : panneau, fil, messages, zone de saisie, envoi, suggestions et indicateur de saisie.",
      terminal:
        "Une conversation avec un agent sous forme de terminal : un journal à chasse fixe où vos lignes ressortent, l'activité des outils en retrait, un statut en direct qui dit qui travaille et depuis combien de temps, et une invite.",
      "agent-chat":
        "La même conversation avec un agent sous forme de chat : vos messages dans des bulles d'accent, les agents sous leur avatar, l'activité des outils en retrait, un statut de travail en direct et une zone de saisie. S'échange avec Terminal pièce par pièce.",
      "chat-history":
        "Les conversations enregistrées avec l’assistant : filtrer par titre, en ouvrir une, les regrouper par ancienneté dans une barre latérale, avec états de chargement, vide et erreur.",
      message:
        "Une entrée d’un fil : avatar, en-tête, bulles et pied, alignée au début ou à la fin.",
      bubble:
        "La bulle d’un message, en variantes default, secondary, muted et ghost.",
      marker:
        "Une ligne d’état dans un fil, comme « Réflexion… » ou « 4 notes consultées ».",
      markdown:
        "Affiche du markdown GitHub sous forme de texte mis en forme et permet de l’éditer avec barre d’outils, aperçu en direct et vue partagée.",
      "audio-player":
        "Un lecteur d’enregistrement compact avec saut, progression, durée et vitesse de lecture.",
      recording:
        "Bouton d’enregistrement, bascule du micro, vumètre, orbe d’état, chronomètre, indicateur d’enregistrement et état du traitement pour les interfaces de capture.",
      "speaker-chip":
        "Les initiales d’un intervenant dans un avatar à la couleur de son rôle et son nom, tirés d’une seule clé d’intervenant de la transcription.",
      transcript:
        "Une transcription groupée par tour de parole, où un clic positionne la lecture.",
      "side-panel":
        "Un panneau ancré à côté de la page, avec en-tête, titre, actions, bouton de fermeture et corps défilant.",
      "floating-bar":
        "La pastille qui flotte au-dessus de toutes les apps lorsque l’enregistrement est prêt, en cours ou en traitement, avec un bouton de fermeture.",
      "live-transcript":
        "Le journal des sous-titres d’un enregistrement en cours.",
      timeline:
        "Des pistes de blocs et un ruban de chapitres sur une même échelle de temps, avec tête de lecture, chapitres et légende.",
    },
  },
  guide: {
    title: "Guide",
    description:
      "Apprenez à installer, personnaliser et utiliser SurfaceOne dans une application Angular.",
    pages: {
      introduction: {
        title: "Introduction",
        description:
          "Ce qu’est SurfaceOne, sur quoi il repose et comment les packages s’articulent.",
        blocks: [
          {
            p: "SurfaceOne est le design system d’IndexOne, extrait dans des packages utilisables par n’importe quelle application. Il s’appuie sur les conventions de **shadcn/ui**, portées vers Angular via l’anatomie de **spartan/ui**, et lit chaque valeur dans des design tokens.",
          },
          { h2: "Packages" },
          {
            list: [
              "`@surface-one/tokens` — du CSS indépendant du framework : tokens, les cinq habillages en clair et en sombre, accents et polices latin-ext.",
              "`@surface-one/angular` — les composants. Chaque famille de composants est son propre point d’entrée, par exemple `@surface-one/angular/button`.",
            ],
          },
          {
            p: "`@surface-one/vue` apporte les mêmes composants à Vue 3 et Nuxt (avec le module `@surface-one/vue/nuxt`), et `@surface-one/react` à React 19 et Next.js. Tous partagent `@surface-one/tokens`, de sorte qu’un thème soit identique dans chaque framework.",
          },
          {
            p: "`@surface-one/react-native` les apporte à iOS et Android, avec les mêmes tokens résolus pour React Native. Voir [React Native](/guide/react-native).",
          },
          { h2: "Fondé sur spartan/ui, shadcn/ui et Nuxt UI" },
          {
            list: [
              "**spartan/ui** (ng-spartan) — l’anatomie Angular : parties pilotées par des directives, noms des inputs et comportement.",
              "**shadcn/ui** — le cœur visuel : variantes, tailles et styles sur lesquels reposent nos habillages.",
              "**Nuxt UI** — la documentation : catégories de composants, templates, le serveur MCP et les skills d’agent.",
            ],
          },
          { h2: "Principes" },
          {
            list: [
              "**Uniquement des tokens.** Les composants consomment `var(--token)` ; un habillage redéclare des tokens et ne duplique jamais un composant.",
              "**Le natif d’abord.** Un bouton est un `<button>`, une liste déroulante est un `<select>`. ARIA comble les lacunes du HTML natif.",
              "**Signals et zoneless.** Composants standalone, OnPush, inputs, models et outputs à base de signals.",
              "**Surfaces plates et opaques.** Ni verre, ni flou — une interface sobre avec un accent mesuré.",
            ],
          },
          { h2: "Nommage" },
          {
            p: "Chaque sélecteur d’élément commence par `sone-` (`<sone-dialog>`, `<sone-switch>`) et chaque directive d’attribut par `sone` (`button[soneBtn]`, `[soneCard]`). Les symboles TypeScript commencent par `Sone`.",
          },
          {
            note: "Envie d’explorer tous les états d’un composant ? Le [Storybook](/storybook/) les affiche un par un avec des contrôles en direct.",
          },
        ],
      },
      installation: {
        title: "Installation",
        description:
          "Ajoutez SurfaceOne à une application Angular 22 en trois étapes.",
        blocks: [
          { h2: "1. Installer les packages" },
          { code: "install" },
          {
            p: "Le point d’entrée markdown nécessite aussi ses dépendances pair facultatives (`marked`, `dompurify` et les packages `@codemirror/*`). Installez-les uniquement si vous importez `@surface-one/angular/markdown`.",
          },
          { h2: "2. Charger les styles" },
          {
            p: "Ajoutez les tokens et la feuille de style des composants au tableau `styles` de votre cible de build, les tokens en premier :",
          },
          { code: "angularJson" },
          {
            p: "Les styles des composants sont volontairement globaux : la plupart des parties sont projetées ou rendues dans un portail, là où l’encapsulation émulée ne peut pas les atteindre.",
          },
          { h2: "3. Activer la localisation" },
          {
            p: "Les composants marquent leurs chaînes intégrées (comme « Close ») avec `$localize` ; ajoutez donc le polyfill :",
          },
          { code: "localize" },
          { h2: "Utiliser un composant" },
          { code: "usage" },
          {
            p: "Choisissez ensuite un habillage et un mode de couleur sur la page [Thème](/theme).",
          },
        ],
      },
      "react-native": {
        title: "React Native",
        description:
          "Utilisez les composants SurfaceOne dans une application React Native ou Expo, habillés par les mêmes tokens et les mêmes habillages.",
        blocks: [
          {
            p: "`@surface-one/react-native` apporte les composants à iOS et Android. Il reprend les mêmes noms `Sone*` et les mêmes props que le package React partout où ils ont un sens sur un téléphone, avec les mêmes rôles, noms et états pour les lecteurs d’écran. React Native n’a pas de CSS : chaque token est donc résolu à l’avance pour chaque habillage, mode de couleur et accent, et un provider transmet les valeurs à chaque composant.",
          },
          { h2: "1. Installer les packages" },
          { p: "Dans une application Expo (SDK 53 ou plus récent) :" },
          { code: "installExpo" },
          {
            p: "Dans une application React Native nue (0.78 ou plus récente, avec la New Architecture) :",
          },
          { code: "installReactNative" },
          { h2: "2. Envelopper l’application dans le provider" },
          { code: "reactNativeProvider" },
          {
            list: [
              "`skin` — `surface`, `linen`, `studio`, `paper`, `minimalist` ou `neumorphism`, importé depuis `@surface-one/react-native/skins`. Chaque habillage est un module distinct : l’application n’embarque que ceux qu’elle utilise.",
              "`colorMode` — `light`, `dark` ou `system` (la valeur par défaut, qui suit l’appareil).",
              "`accent` — `blue`, `teal`, `green`, `orange` ou `pink` ; omettez-le pour utiliser l’accent propre à l’habillage.",
              "`tokens` redéfinit des valeurs isolées, et `messages` traduit les chaînes intégrées.",
            ],
          },
          {
            p: "Le provider est facultatif : sans lui, les composants s’affichent avec Minimalist, en mode clair et en anglais.",
          },
          { h2: "Les tokens dans vos propres vues" },
          {
            p: "Chaque token garde son nom CSS en camelCase (`--surface-raised` → `surfaceRaised`, `--space-4` → `space4`). Les couleurs sont des chaînes, les longueurs des nombres en dp et les ombres des chaînes `boxShadow` :",
          },
          { code: "reactNativeTokens" },
          { h2: "Polices" },
          {
            p: "Par défaut, les composants utilisent la police de la plateforme. Pour utiliser les familles de l’habillage, chargez-les d’abord, puis définissez `fonts` :",
          },
          { code: "reactNativeFonts" },
          { h2: "Ce qui change par rapport au web" },
          {
            list: [
              "`onPress` remplace `onClick`, et `style` (fusionné en dernier) remplace `className`.",
              "Les états pressés remplacent les états de survol. L’anneau de focus s’affiche pour le focus clavier.",
              "Les dialogues et les sheets sont des modales natives : toucher le fond ou appuyer sur le bouton Retour d’Android les ferme.",
              "Le texte hérite de son composant : une chaîne dans un bouton ou un badge devient son libellé, et `SoneText` et `SoneIcon` reprennent la couleur et la taille environnantes.",
              "Le réglage de réduction des animations de l’appareil arrête les spinners, les skeletons et les transitions.",
            ],
          },
          {
            note: "Les formulaires, les overlays, les composants d’affichage et de données sont couverts. Les familles propres au web (sidebar, menus, tooltips, tableaux, markdown, flow, le chat IA et l’éditeur) ne le sont pas.",
          },
        ],
      },
      theming: {
        title: "Thèmes",
        description:
          "Changez d’habillage, de mode de couleur et d’accent avec trois attributs, et redéfinissez n’importe quel token.",
        blocks: [
          {
            p: "Trois attributs sur `<html>` pilotent l’ensemble du système :",
          },
          {
            list: [
              "`data-skin` — `surface`, `linen`, `studio`, `paper`, `minimalist` ou `neumorphism`.",
              "`data-theme` — `light`, `dark` ou `system` (en l’absence d’attribut, le système est également suivi).",
              "`data-accent` — `blue`, `teal`, `green`, `orange` ou `pink` ; sans attribut, l’accent propre à l’habillage est utilisé.",
            ],
          },
          { code: "themeAttributes" },
          { h2: "Éviter le flash d’un mauvais thème" },
          {
            p: "Définissez les attributs avant le premier rendu grâce à un petit script en ligne dans `index.html` :",
          },
          { code: "themeScript" },
          { h2: "Redéfinir des tokens" },
          {
            p: "Chaque choix visuel est une propriété personnalisée. Redéclarez-en une sous le même sélecteur pour la modifier partout :",
          },
          { code: "overrideTokens" },
          {
            p: "Retrouvez tous les tokens, en direct, sur la page [Thème](/theme).",
          },
        ],
      },
      utilities: {
        title: "Utilitaires",
        description:
          "Classes utilitaires globales de mise en page et de texte fournies avec la feuille de style des composants.",
        blocks: [
          {
            p: "`@surface-one/angular/styles.css` (et `@surface-one/vue/styles.css`, `@surface-one/react/styles.css`) incluent quelques classes utilitaires globales, pour qu'une app ne réécrive pas les mêmes conteneurs flex et styles de texte dans chaque composant. Chaque valeur est un token.",
          },
          { h2: "Mise en page" },
          {
            list: [
              "`.stack` — une colonne flex ; espacement `--space-3`.",
              "`.cluster` — une rangée de puces ou de boutons qui passe à la ligne, centrée verticalement ; espacement `--space-2`.",
              "`.row` — une rangée centrée sans retour à la ligne ; `.row-between` écarte ses extrémités. Espacement `--space-2`.",
              '`data-gap="1"` … `"8"` sur l\'une d\'elles choisit le pas `--space-1` … `--space-8`.',
            ],
          },
          { code: "layoutUtilities" },
          { h2: "Texte" },
          {
            list: [
              "`.text-hint` — une ligne secondaire sous un contrôle ou un état vide : couleur secondaire, `sm`, interligne normal, sans marge.",
              "`.text-caption` — petits caractères : couleur atténuée, `xs`.",
              "`.truncate` — une ligne coupée par des points de suspension ; `min-width: 0` lui permet de rétrécir dans une piste flex ou grid.",
              "`.list-reset` — un `<ul>` / `<ol>` sans puces, marge ni remplissage.",
              "`.text-secondary`, `.text-muted`, `.text-success`, `.text-danger`, `.section-label` et `.sr-only` sont aussi disponibles.",
            ],
          },
          { code: "textUtilities" },
          {
            note: "Ce sont des noms de classe ordinaires. Si votre app utilise déjà `.row` ou `.stack` pour autre chose, la règle globale s'y applique aussi : renommez votre classe ou tenez compte des propriétés qu'elle définit.",
          },
          { h2: "Règles de style" },
          {
            p: "`@surface-one/stylelint-config` transforme la règle « uniquement des tokens » en lint. Il n'utilise que les règles natives de stylelint, lit les fichiers `.css`, `.scss` et les blocs `<style>` des fichiers `.vue`, et chaque message indique le token à utiliser :",
          },
          {
            list: [
              "Pas de couleurs brutes : ni hex, ni couleurs nommées, ni `rgb()` / `hsl()` / `oklch()`. Utilisez un token du thème comme `var(--text-primary)`, ou `color-mix()` sur des tokens pour une teinte ; `transparent` et `currentColor` restent autorisés.",
              "Pas de `px` bruts dans `gap`, `padding`, `margin`, `border-radius`, `box-shadow`, `font-size` ou `letter-spacing` : utilisez `--space-*`, `--radius-*`, `--shadow-*`, `--font-size-*` et `--tracking-*`. `0` est accepté, et les tailles structurelles (`width`, `height`, `min-*`, `max-*`, `inset`) gardent leurs pixels.",
              "`z-index` prend l'échelle `--z-*` — `var(--z-raised)`, `var(--z-dropdown)`, `var(--z-modal)` … — ou un cran autour d'un échelon, `calc(var(--z-raised) + 1)`.",
              "Le filet est `var(--border-width-thin) solid`, jamais `1px solid`.",
              "`backdrop-filter` est réservé au voile du skin : `blur(var(--scrim-blur))`.",
              "Les durées viennent de `--transition`, `--transition-fast` et des paliers `--duration-*`, jamais de `ms` ou `s` bruts.",
            ],
          },
          { code: "stylelintInstall" },
          { code: "stylelintConfig" },
          {
            p: "N'exemptez que les fichiers qui définissent vos propres tokens. Quand une valeur brute est vraiment structurelle, désactivez cette seule ligne et dites pourquoi — une désactivation sans raison, ou qui ne masque rien, est aussi une erreur :",
          },
          { code: "stylelintDisable" },
        ],
      },
      fonts: {
        title: "Polices",
        description:
          "Des polices variables auto-hébergées avec les sous-ensembles latin et latin-ext.",
        blocks: [
          {
            p: "`@surface-one/tokens` embarque chaque police qu’il référence — Geist, Geist Mono, Figtree, DM Sans, JetBrains Mono, Schibsted Grotesk et Source Serif 4 — sous forme de polices variables WOFF2 auto-hébergées. Rien n’est chargé depuis un CDN.",
          },
          { h2: "latin-ext est obligatoire" },
          {
            p: "Chaque famille est livrée en deux fichiers : **latin** et **latin-ext**. Le sous-ensemble latin seul ne contient ni ą, ć, ę, ł, ń, ś, ź, ż (ni ő, ř, ș …) : le navigateur dessinerait alors ces glyphes avec une police système en plein mot. Grâce à un découpage par `unicode-range`, une page ne télécharge le fichier latin-ext que lorsqu’elle affiche l’un de ces caractères.",
          },
          { code: "fontFace" },
          {
            p: "Le texte chinois et japonais se replie sur la police CJK de la plateforme via chaque pile de polices.",
          },
          { h2: "Ajouter une police" },
          {
            p: "Une nouvelle famille n’est acceptée qu’avec les deux sous-ensembles. Ajoutez les deux fichiers WOFF2 dans `packages/tokens/fonts/` et une paire de règles `@font-face` dans `fonts.css`.",
          },
        ],
      },
      accessibility: {
        title: "Accessibilité",
        description:
          "Comment SurfaceOne respecte le niveau AA des WCAG 2.2 et ce qui reste à la charge de votre application.",
        blocks: [
          {
            p: "SurfaceOne vise le **niveau AA des WCAG 2.2**. Les composants suivent les WAI-ARIA Authoring Practices, et ce site de documentation est testé avec axe-core sur chaque page, en mode clair comme en mode sombre.",
          },
          { h2: "Ce que font les composants" },
          {
            list: [
              'Utiliser d’abord les éléments natifs — `<button>`, `<select>`, `<input type="checkbox">` — pour bénéficier gratuitement de la prise en charge du clavier et des lecteurs d’écran.',
              'Câbler les patterns ARIA : divulgation (`aria-expanded`, `aria-controls`), groupes radio avec un seul arrêt de tabulation et les flèches, menus, boîtes de dialogue qui piègent puis restaurent le focus, `role="progressbar"` avec ses valeurs.',
              "Afficher un anneau de focus visible sur chaque partie interactive (`--focus-ring`).",
              "Respecter `prefers-reduced-motion` et maintenir un contraste du texte d’au moins 4,5:1 dans chaque habillage.",
            ],
          },
          { h2: "Ce qui revient à votre application" },
          {
            list: [
              "Donner un `aria-label` à chaque bouton composé d’une seule icône.",
              "Étiqueter chaque contrôle de formulaire — avec `soneFieldLabel` ou un `<label for>`.",
              "Définir `<html lang>` et un titre de document pertinent pour chaque route.",
              "Annoncer les résultats asynchrones importants, par exemple avec le toaster ou une région live.",
            ],
          },
        ],
      },
      i18n: {
        title: "Internationalisation",
        description:
          "Traduisez les chaînes intégrées et prenez en charge toutes les écritures.",
        blocks: [
          {
            p: "Les composants contiennent très peu de texte propre, et chaque chaîne intégrée (« Close », « Show more », « Downloading… ») est marquée avec `$localize`. Traduisez-les avec le workflow i18n standard d’Angular :",
          },
          { code: "extractI18n" },
          {
            p: "Les pluriels utilisent des messages ICU et suivent les règles de pluriel de la locale active. Les dates et les durées sont formatées avec `Intl`.",
          },
          { h2: "Langues de ce site" },
          {
            p: "Cette documentation est disponible en English, Polski, Español, Italiano, Français, Português, Deutsch, 简体中文 et 日本語 — les mêmes langues que le site web d’IndexOne.",
          },
        ],
      },
      mcp: {
        title: "Serveur MCP",
        description:
          "Donnez à Claude Code, Codex, GitHub Copilot, Cursor et Windsurf un accès direct à la documentation, à l’API et aux tokens de SurfaceOne.",
        blocks: [
          {
            p: "`@surface-one/angular-mcp` est un serveur Model Context Protocol. Votre assistant IA lui demande l’API exacte d’un composant, un exemple fonctionnel, son code source et ses styles, les guides, les templates d’écrans et les variables de thème — au lieu de deviner. Tout est inclus dans le package : il fonctionne hors ligne et correspond toujours à votre version.",
          },
          { h2: "Claude Code" },
          { code: "mcpClaude" },
          { h2: "Codex" },
          { code: "mcpCodex" },
          { p: "Ou ajoutez-le à `~/.codex/config.toml` :" },
          { code: "mcpCodexToml" },
          { h2: "VS Code avec GitHub Copilot" },
          { p: "Ajoutez `.vscode/mcp.json` à votre projet :" },
          { code: "mcpVsCode" },
          { h2: "Cursor, Windsurf et Claude Desktop" },
          { code: "mcpJson" },
          { h2: "Outils" },
          {
            list: [
              "`list_components` — chaque famille de composants avec son point d’entrée et ses sélecteurs.",
              "`get_component_docs` — description, import, un exemple fonctionnel et l’API complète. Accepte des noms, des slugs, des classes ou des sélecteurs comme `soneBtn`.",
              "`get_component_source_code` et `get_component_source_styles` — l’implémentation.",
              "`get_docs` — les pages de guide et les notes de version.",
              "`get_theme_variables` — les valeurs des tokens pour chaque habillage, en mode clair et sombre.",
              "`list_templates` et `get_template` — des écrans complets pour démarrer.",
            ],
          },
          { h2: "Exemples de demandes" },
          {
            list: [
              "« Crée une page de paramètres avec SurfaceOne : un interrupteur, une liste déroulante et un bouton d’enregistrement. »",
              "« Montre-moi l’API de la boîte de dialogue de SurfaceOne. »",
              "« Quels tokens l’habillage Paper utilise-t-il en mode sombre ? »",
            ],
          },
          {
            note: "Associez le serveur aux [skills d’agent](/guide/skills) : les skills indiquent à votre assistant comment travailler avec SurfaceOne, le serveur lui fournit les faits.",
          },
        ],
      },
      skills: {
        title: "Skills d’agent",
        description:
          "Installez les skills SurfaceOne pour Claude Code, OpenAI Codex et GitHub Copilot en une seule commande.",
        blocks: [
          {
            p: "Les skills d’agent sont des dossiers contenant un `SKILL.md` qu’un assistant charge lorsqu’une tâche en a besoin. Claude Code, Codex et GitHub Copilot partagent ce format : un seul package sert donc les trois.",
          },
          {
            list: [
              "`surface-one-angular` — construire des écrans avec les composants : configuration, points d’entrée, sélecteurs `sone-`, tokens, overlays et formulaires, avec le catalogue complet des composants.",
              "`surface-one-theming` — habillages, modes clair, sombre et système, accents, surcharges de tokens et polices latin-ext.",
              "`surface-one-a11y-review` — une checklist WCAG 2.2 AA pour les écrans SurfaceOne.",
            ],
          },
          { h2: "Installation" },
          { code: "skillsAdd" },
          { h2: "Où elles sont installées" },
          {
            list: [
              "**Claude Code** — `.claude/skills/` (globalement `~/.claude/skills/`).",
              "**Codex** — `.agents/skills/` (globalement `~/.agents/skills/`).",
              "**GitHub Copilot** — `.agents/skills/` (globalement `~/.copilot/skills/`).",
            ],
          },
          {
            p: "Après une mise à jour de SurfaceOne, relancez la commande avec `--force` pour actualiser les skills.",
          },
          {
            note: "Ajoutez aussi le [serveur MCP](/guide/mcp) — les skills utilisent ses outils lorsqu’il est disponible.",
          },
        ],
      },
      contributing: {
        title: "Contribuer",
        description:
          "Branches, Conventional Commits, pull requests et code owners.",
        blocks: [
          { p: "SurfaceOne suit les mêmes règles qu’IndexOne." },
          { h2: "Branches et commits" },
          {
            list: [
              "Les noms de branche suivent le format `<type>/<kebab-slug>`, par exemple `feat/sone-calendar`.",
              "Les en-têtes de commit et les titres de PR suivent les Conventional Commits : `<type>(<scope>): <subject>`, 100 caractères au maximum, sujet en minuscules.",
              "Aucune attribution d’aucune sorte — ni trailer de co-auteur IA, ni pied de page « generated with ».",
            ],
          },
          { code: "commit" },
          { h2: "Pull requests" },
          {
            p: "Le corps de la PR reprend le modèle du dépôt : une ligne courte par changement réel, en anglais simple. Chaque PR doit être approuvée par un code owner.",
          },
          { h2: "Ajouter un composant" },
          {
            list: [
              "Créez `packages/angular/<name>/` avec le composant, `index.ts` et `ng-package.json`.",
              "Utilisez le préfixe de sélecteur `sone-`, OnPush, des inputs à base de signals et uniquement des tokens.",
              "Ajoutez `<name>.stories.ts` et inscrivez le composant dans le catalogue de la documentation avec une démo.",
            ],
          },
        ],
      },
    },
  },
  theme: {
    title: "Thème",
    description:
      "Design tokens, habillages, modes de couleur et accents de SurfaceOne — en direct.",
    lead: "Chaque valeur de cette page est lue depuis les tokens actifs. Modifiez les contrôles et tout le site suit.",
    controls: "Réglages du thème",
    skin: "Habillage",
    mode: "Mode",
    accent: "Accent",
    accentDefault: "Par défaut de l’habillage",
    skins: {
      studio: "Studio",
      paper: "Paper",
      minimalist: "Minimalist",
      neumorphism: "Neumorphism",
      surface: "Surface",
      linen: "Linen",
    },
    accents: {
      blue: "Bleu",
      teal: "Bleu canard",
      green: "Vert",
      orange: "Orange",
      pink: "Rose",
    },
    sections: {
      colors: "Rôles de couleur",
      colorsLead:
        "Couleurs sémantiques. Les composants utilisent ces noms, jamais un niveau de palette.",
      chart: "Couleurs des graphiques",
      chartLead:
        "Huit couleurs catégorielles pour les séries, les pistes et les types de nœuds, une rampe séquentielle en cinq paliers et la paire positif / négatif. Chacune garde au moins 3:1 sur les surfaces de carte et de page, dans chaque habillage et chaque mode.",
      palette: "Palettes d’accent",
      typography: "Typographie",
      typographyLead: "L’échelle typographique commune à tous les habillages.",
      radius: "Rayons",
      spacing: "Espacements",
      shadows: "Ombres",
      tokens: "Tous les tokens",
      tokensLead:
        "Les fichiers de tokens de @surface-one/tokens et les propriétés personnalisées que chacun déclare.",
    },
    sample: "Portez ce vieux whisky au juge blond qui fume — Zażółć gęślą jaźń",
    reset: "Réinitialiser",
  },
  templates: {
    title: "Modèles",
    description:
      "Des écrans prêts à l’emploi composés de composants SurfaceOne : tableau de bord, chat IA, réglages, notes de réunion, connexion et inscription, un formulaire validé, une messagerie, un espace de travail à deux barres latérales, un éditeur markdown, des médias, des finances, un CRM, une boutique en ligne, un tableau de sprint, un éditeur de workflows, une documentation et un journal des modifications.",
    lead: "Des écrans complets construits uniquement avec le package. Copiez-les comme point de départ.",
    view: "Voir le modèle",
    back: "Tous les modèles",
    vueMissing: "Ce modèle n’a pas encore de version Vue.",
    reactMissing: "Ce modèle n’a pas encore de version React.",
    viewport: "Taille d’écran",
    devices: {
      desktop: "Ordinateur",
      tablet: "Tablette",
      phone: "Téléphone",
    },
    items: {
      dashboard: {
        title: "Tableau de bord",
        description:
          "Une structure d’application avec barre latérale, en-tête de page, cartes de statistiques et tableau de données.",
      },
      chat: {
        title: "Chat IA",
        description:
          "Un fil d’assistant avec messages, marqueurs, suggestions et zone de saisie.",
      },
      settings: {
        title: "Réglages",
        description:
          "Des préférences regroupées avec champs, interrupteurs, cartes de choix et un secret.",
      },
      notes: {
        title: "Notes de réunion",
        description:
          "Un enregistrement avec lecteur audio, transcription et notes mises en forme.",
      },
      login: {
        title: "Connexion",
        description:
          "Une carte de connexion avec boutons Google, Apple et GitHub, formulaire e-mail et mot de passe, validation et option « rester connecté ».",
      },
      signup: {
        title: "Inscription",
        description:
          "Une inscription en écran partagé avec SSO, jauge de robustesse du mot de passe, règles en direct et conditions.",
      },
      form: {
        title: "Validation de formulaire",
        description:
          "Un long formulaire en sections avec validation réactive, règles entre champs et récapitulatif des erreurs avec un lien vers chaque champ.",
      },
      messages: {
        title: "Messages",
        description:
          "Une messagerie directe avec liste de conversations filtrable, bulles, indicateur de saisie et zone de rédaction.",
      },
      workspace: {
        title: "Deux barres latérales",
        description:
          "Un espace de tâches avec une barre de navigation repliable à gauche et une barre de détails à droite.",
      },
      editor: {
        title: "Éditeur markdown",
        description:
          "Un éditeur de documents avec liste de fichiers, barre de mise en forme, modes écriture, partagé et aperçu, et enregistrement automatique.",
      },
      media: {
        title: "Médias",
        description:
          "Un studio d’enregistrement avec commande d’enregistrement, bibliothèque d’enregistrements, lecteur audio, frise des chapitres et transcription en direct.",
      },
      finances: {
        title: "Finances",
        description:
          "Une vue d’ensemble des finances avec sélecteur de période, chiffres clés, graphique de trésorerie, dépenses par catégorie, budgets, comptes et tableau des transactions.",
      },
      crm: {
        title: "CRM",
        description:
          "Un CRM commercial avec tableau du pipeline d’affaires, vue en liste, statistiques du pipeline et panneau de détail avec journal d’activité.",
      },
      ecommerce: {
        title: "E-commerce",
        description:
          "Une boutique en ligne avec des filtres par catégorie, une grille de produits avec notes et liste de souhaits, un aperçu rapide du produit et un panier avec quantités, code promo et récapitulatif de commande.",
      },
      board: {
        title: "Tableau",
        description:
          "Un tableau de sprint façon Jira avec couloirs, cartes de tickets indiquant type, priorité, points d’effort et responsable, filtres rapides, glisser-déposer et un panneau de détail.",
      },
      workflow: {
        title: "Workflow",
        description:
          "Un éditeur d’automatisations : un canevas de nœuds avec déclencheurs, conditions et actions, un dock de dessin à placer sur n’importe quel bord, une mini-carte, un inspecteur et une exécution de test.",
      },
      documentation: {
        title: "Documentation",
        description:
          "Une page de documentation avec une navigation groupée et une recherche, un texte lisible avec un exemple de code, un encadré et une liste d’étapes, des liens précédent / suivant et un sommaire « Sur cette page » qui suit le défilement.",
      },
      changelog: {
        title: "Journal des modifications",
        description:
          "Les notes de version d’un produit sur une seule frise : la version et la date à côté de chaque version, un court résumé et des listes Ajouté / Amélioré / Corrigé, un filtre par type, un bouton d’abonnement et une liste des versions fixée à gauche pour aller directement à n’importe quelle version.",
      },
    },
  },
  changelog: {
    title: "Journal des modifications",
    description:
      "Chaque version de SurfaceOne, de la plus récente à la plus ancienne : nouveaux composants, correctifs et changements incompatibles, avec la date de chaque version.",
    eyebrow: "Journal des modifications",
    heading: "Nouveautés de SurfaceOne",
    lead: "Chaque version du design system, de la plus récente à la plus ancienne. Les tokens, les composants Angular, le serveur MCP et les skills partagent une seule version.",
    npm: "Installer depuis npm",
    github: "Toutes les versions sur GitHub",
    latest: "Dernière",
    englishNote: "Les notes de version sont publiées en anglais.",
    versions: "Versions",
    show: "Afficher les changements",
    all: "Tous",
    features: "Nouveautés",
    fixes: "Corrections",
    docs: "Documentation",
    breaking: "Changements incompatibles",
    empty: "Aucune version avec ce type de changement.",
  },
  notFound: {
    title: "Page introuvable",
    description: "La page que vous recherchez n’existe pas.",
    back: "Retour à l’accueil",
  },
};
