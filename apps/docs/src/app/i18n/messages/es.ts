import type { Messages } from "./en";

export const es: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "Componentes tranquilos y accesibles para Angular y Vue",
    description:
      "SurfaceOne es un sistema de diseño accesible para Angular y Vue / Nuxt: más de 70 familias de componentes, tokens de diseño independientes del framework, seis skins en modo claro y oscuro, y fuentes con cobertura latin-ext completa.",
  },
  a11y: {
    skipToContent: "Saltar al contenido",
    mainNav: "Principal",
    sectionNav: "Sección",
    breadcrumb: "Ruta de navegación",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    language: "Idioma",
    colorMode: "Modo de color",
    externalLink: "(se abre en una pestaña nueva)",
    copyCode: "Copiar código",
    copied: "Copiado",
    onThisPage: "En esta página",
    preview: "Vista previa en directo",
  },
  nav: {
    home: "Inicio",
    components: "Componentes",
    guide: "Guía",
    theme: "Tema",
    templates: "Plantillas",
    changelog: "Cambios",
    storybook: "Storybook",
    github: "GitHub",
  },
  colorMode: {
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
  },
  footer: {
    madeBy: "Hecho por {brand}.",
    license: "Publicado bajo la licencia MIT.",
    resources: "Recursos",
    project: "Proyecto",
    changelog: "Registro de cambios",
    contributing: "Cómo contribuir",
  },
  home: {
    title: "SurfaceOne — sistema de diseño para Angular y Vue",
    eyebrow: "Ahora también con Vue y Nuxt",
    heading: "Crea interfaces serenas y accesibles con SurfaceOne",
    lead: "Componentes basados en señales para Angular y Vue / Nuxt, tokens de diseño independientes del framework y seis skins cuidados al detalle en modo claro y oscuro: accesibles por defecto y listos para cualquier app.",
    getStarted: "Empezar",
    browseComponents: "Ver componentes",
    openStorybook: "Abrir Storybook",
    installLabel: "Instalar",
    stats: {
      components: "familias de componentes",
      symbols: "componentes y directivas",
      skins: "skins × claro/oscuro",
      locales: "idiomas de documentación",
    },
    featuresTitle: "Todo lo que necesita la interfaz de un producto",
    features: {
      tokens: {
        title: "Primero los tokens",
        body: "Cada color, radio, espaciado y sombra es una propiedad personalizada de CSS. Los componentes leen tokens, nunca valores fijos.",
      },
      skins: {
        title: "Seis skins, dos modos",
        body: "Studio, Paper, Minimalist, Neumorphism, Material y Surface redeclaran los mismos tokens. Claro, oscuro o sistema, con un solo atributo.",
      },
      a11y: {
        title: "Accesible por defecto",
        body: "Botones reales, patrones ARIA de las prácticas de WAI-ARIA, foco visible, movimiento reducido y contraste AA.",
      },
      signals: {
        title: "Signals y zoneless",
        body: "Standalone, OnPush, inputs y models con signals. Funciona con Angular zoneless y renderizado en el servidor.",
      },
      fonts: {
        title: "latin-ext en todas partes",
        body: "Cada fuente incluida trae los subconjuntos latin y latin-ext, así que ą, ł, ő, ř y ș nunca cambian de fuente a mitad de palabra.",
      },
      frameworks: {
        title: "Preparado para más frameworks",
        body: "Los tokens viven en un paquete independiente del framework. Hoy están disponibles Angular y Vue / Nuxt; React compartirá la misma base.",
      },
    },
    showcaseTitle: "Una muestra de los componentes",
    showcaseLead:
      "Todo lo que ves abajo es el paquete real, renderizado en directo con el tema que has elegido.",
    ctaTitle: "Lanza tu próxima pantalla con SurfaceOne",
    ctaBody: "Instala el paquete, carga los tokens y empieza a componer.",
    frameworks: {
      label: "Framework",
      angular: "Angular",
      vue: "Vue / Nuxt",
      react: "React",
      soon: "Pronto",
      installStep: "Instalar",
      setupAngular: "Carga los estilos en angular.json",
      setupVue:
        "Añade el módulo de Nuxt (o el plugin de SurfaceOne en Vue puro)",
      reactBody:
        "Los componentes de React están en camino. Compartirán los mismos tokens, skins y marcado que Angular y Vue.",
      worksWith: "Funciona con",
    },
    previewLabel:
      "Vista previa en vivo hecha con componentes de SurfaceOne: estadísticas semanales con tendencia, un sparkline, una lista de barras y un indicador de grabación.",
  },
  components: {
    title: "Componentes",
    description:
      "Todos los componentes de SurfaceOne, agrupados por función: diseño, elementos, formularios, datos, navegación, superposiciones, bloques de página, chat con IA, editor, multimedia y flujo.",
    lead: "Cada componente tiene su propio punto de entrada, así que una app solo empaqueta lo que importa.",
    filterLabel: "Filtrar componentes",
    filterPlaceholder: "Filtrar por nombre…",
    noResults: "Ningún componente coincide con «{query}».",
    count: "{count} componentes",
    categories: {
      layout: {
        name: "Diseño",
        description:
          "Estructura una pantalla: barras laterales, tarjetas y separadores.",
      },
      element: {
        name: "Elemento",
        description:
          "Las piezas pequeñas: botones, insignias, alertas e indicadores.",
      },
      form: {
        name: "Formulario",
        description:
          "Campos, selectores, interruptores, deslizadores y controles de opción.",
      },
      data: {
        name: "Datos",
        description:
          "Muestra registros: tablas, elementos, listas y estados vacíos.",
      },
      navigation: {
        name: "Navegación",
        description: "Desplázate por jerarquías.",
      },
      overlay: {
        name: "Superposición",
        description: "Diálogos, paneles, menús, tooltips y toasts.",
      },
      page: {
        name: "Página",
        description: "Encabezados y acciones de una ruta.",
      },
      chat: {
        name: "Chat con IA",
        description:
          "Hilos, mensajes, burbujas y marcadores de estado para asistentes.",
      },
      editor: {
        name: "Editor",
        description: "Renderiza y escribe markdown.",
      },
      media: {
        name: "Multimedia",
        description:
          "Grabación, reproducción, transcripciones y líneas de tiempo.",
      },
      flow: {
        name: "Flujo",
        description:
          "Dibuja diagramas y flujos de trabajo: un lienzo de nodos con conexiones, controles, un minimapa y un dock de herramientas.",
      },
    },
    page: {
      import: "Importación",
      usage: "Uso",
      api: "Referencia de la API",
      selector: "Selector",
      exportAs: "Exportar como",
      inputs: "Inputs",
      outputs: "Outputs",
      name: "Nombre",
      type: "Tipo",
      default: "Predeterminado",
      required: "obligatorio",
      twoWay: "bidireccional",
      noInputs: "Sin inputs.",
      openInStorybook: "Abrir en Storybook",
      viewSource: "Ver código fuente",
      previous: "Anterior",
      next: "Siguiente",
      preview: "Vista previa",
      code: "Código",
      framework: "Framework",
      vueMissing:
        "Todavía no hay componente de Vue: este solo existe en Angular.",
      vueReadme: "Ver qué incluye el paquete de Vue",
      nuxtNote:
        "En Nuxt, añade `@surface-one/vue/nuxt` a `modules` en `nuxt.config.ts`: importa automáticamente todos los componentes `Sone*`, así que el import de arriba es opcional.",
      kind: {
        component: "Componente",
        directive: "Directiva",
        pipe: "Pipe",
      },
    },
    entries: {
      sidebar:
        "Una barra lateral de aplicación plegable con encabezado, grupos, menús, insignias, un riel y un área de contenido insertada: el Sidebar de shadcn/ui para Angular.",
      card: "Una superficie que agrupa contenido relacionado, con encabezado, título, descripción, acción, contenido y pie.",
      separator:
        "Una línea fina de un píxel entre contenidos, horizontal o vertical, decorativa o semántica.",
      collapsible:
        "Muestra y oculta una región con un disparador que mantiene sincronizados aria-expanded y aria-controls.",
      disclosure:
        "Una sección de revelación progresiva que sigue el patrón Disclosure de WAI-ARIA.",
      alert:
        "Un aviso para información importante, con título, descripción, acción y cinco tonos.",
      avatar:
        "Una imagen de usuario con iniciales como alternativa y un glifo genérico sin sesión iniciada.",
      badge:
        "Una etiqueta compacta para estados, recuentos o etiquetas, con seis variantes y cuatro tintes de estado.",
      banner:
        "Un aviso de estado de una línea con un glifo inicial; los errores y advertencias se anuncian a los lectores de pantalla.",
      "bar-chart":
        "Un gráfico de columnas para una serie corta con etiquetas de eje, información al pasar el puntero y al enfocar, navegación con flechas y una tabla de datos oculta para lectores de pantalla.",
      "bar-list":
        "Una lista ordenada de barras horizontales con etiqueta y el valor al lado, escaladas al valor máximo o al total; la etiqueta admite cualquier plantilla.",
      button:
        "El único botón: seis variantes, cuatro tamaños de texto y cuatro tamaños de icono cuadrado, además de grupos de botones.",
      icon: "Glifos SVG en línea dibujados en currentColor: sin fuente de iconos ni peticiones adicionales.",
      kbd: "Teclas y combinaciones de teclas.",
      logo: "Los logotipos de SurfaceOne, IndexOne e Ivy, que cambian con el modo de color.",
      progress:
        "Una barra de progreso lineal, determinada o indeterminada, con un rol progressbar accesible.",
      "download-progress":
        "Una barra de progreso con un texto que se actualiza en directo y una acción de cancelar opcional.",
      meter:
        "Un indicador segmentado para cantidades ordinales aproximadas, como la precisión o la velocidad.",
      skeleton:
        "Un marcador de posición pulsante, dimensionado por su contenedor, mientras carga el contenido.",
      sparkline:
        "Un gráfico de línea, área, barras o calor del tamaño de una palabra, sin ejes, en un único SVG estirado; decorativo por defecto o una imagen con un resumen hablado.",
      spinner:
        "Un indicador de carga giratorio dibujado en currentColor a cualquier tamaño.",
      input:
        "Campos, etiquetas, descripciones, errores y grupos de campos con complementos: inputs nativos con el estilo del sistema.",
      select:
        "Un select nativo como control de formulario con opciones proyectadas.",
      switch:
        "Un interruptor de encendido/apagado que funciona como control de formulario, en dos tamaños.",
      slider:
        "Un deslizador de rango con relleno de acento y un tirador redondo, utilizable como control de formulario.",
      "power-slider":
        "Una escala discreta como control de rango que muestra una vista previa al arrastrar y confirma al soltar.",
      segmented:
        "Un control segmentado de opción única generado a partir de datos: el patrón Claro / Oscuro / Sistema.",
      "toggle-group":
        "Conmutadores, grupos de conmutadores y pestañas con foco itinerante y cualquier orientación.",
      "choice-card":
        "Tarjetas de opción enriquecidas donde toda la tarjeta es la opción, con una sola parada de tabulación y navegación con flechas.",
      "secret-field":
        "Introduce, guarda y borra un secreto, como una clave de API, con un estado de configurado / sin configurar.",
      "copy-button":
        "Copia un valor al portapapeles con una breve confirmación «Copiado» que también oyen los lectores de pantalla.",
      "input-otp":
        "Un campo de código de un solo uso: un único campo real dibujado como casillas separadas, para que pegar, el autocompletado y los lectores de pantalla funcionen sin más.",
      "password-input":
        "Un campo de contraseña con un botón para mostrarla u ocultarla, como control de formulario.",
      stepper:
        "El avance por un flujo de varios pasos como puntos o pasos numerados, con el contador «Paso x de y».",
      rating:
        "Estrellas para una puntuación: una imagen de solo lectura con fracciones o un grupo de radio para valorar con el teclado, como control de formulario.",
      "input-number":
        "Un campo numérico con botones de menos y más: un spinbutton con flechas, Re Pág / Av Pág e Inicio / Fin, limitado a min y max, como control de formulario.",
      flow: "Un lienzo de nodos para diagramas y flujos: nodos arrastrables, conexiones curvas con etiquetas, puntos de conexión, desplazamiento y zoom, controles y un minimapa.",
      dock: "Una barra de herramientas de dibujo que se acopla al borde superior, inferior, izquierdo o derecho de un lienzo, con navegación por flechas y tooltips.",
      confirm:
        "Una confirmación en línea en lugar de un modal: título, descripción y error, primero Cancelar y luego Confirmar, foco en la acción, Escape cancela y estado ocupado.",
      "search-field":
        "Un cuadro de búsqueda con lupa y botón para borrar; Enter envía y Escape borra. Funciona como control de formulario.",
      "collapsible-section":
        "Una sección con título que se pliega: un botón de cabecera con flecha, subtítulo y contador, y el contenido debajo.",
      "filter-chips":
        "Botones de filtro de una sola opción generados a partir de datos, como chips o pestañas, con un contador por opción y navegación con flechas.",
      "section-heading":
        "La fila de encabezado de una sección: un h2 a h4 real con un contador opcional y acciones al final.",
      "load-more":
        "El botón «Mostrar más» al final de una lista paginada, con el número restante, un estado de carga y un reintento tras un error.",
      "tag-input":
        "Escribe etiquetas como chips que se pueden quitar: Intro o una coma añade una y Retroceso quita la última; funciona como control de formulario.",
      table:
        "Una tabla de datos densa definida mediante plantillas de columna, con títulos y un estado vacío.",
      item: "Una fila con multimedia, título, descripción y acciones, para listas y ajustes.",
      "empty-state": "Explica una vista vacía y ofrece el siguiente paso.",
      graph:
        "Un diagrama de red interactivo en un lienzo: disposiciones de fuerzas, por grupos y por capas, desplazamiento y zoom, navegación con teclado y una lista de nodos.",
      "source-list":
        "Una lista de fuentes con título, en forma de chips o filas, con un conmutador para mostrar más.",
      "chart-legend":
        "Muestras de color y una leyenda de gráfico cuyos elementos pueden mostrar u ocultar series.",
      "stacked-bar":
        "Una barra dividida en las partes de un total, con pista restante opcional, leyenda y un resumen para lectores de pantalla.",
      stat: "Cifras clave en una lista de descripción: etiqueta, valor, nota y tendencia, como tarjetas, mosaicos hundidos o una fila sencilla.",
      command:
        "Una lista y paleta de comandos con búsqueda: campo combobox, opciones resaltadas con el teclado, grupos y filtrado integrado.",
      tree: "Navegación con teclado para un árbol de filas: flechas, expandir y contraer, búsqueda al escribir y una sola parada de Tab, según el patrón tree de WAI-ARIA.",
      "tree-row":
        "Una fila de árbol de archivos con sangría, conmutador para expandir, selección y acciones.",
      dialog:
        "Diálogos modales y diálogos de alerta con gestión del foco y cierre con Escape o al pulsar el fondo.",
      sheet: "Un panel modal anclado a cualquier borde de la ventana.",
      menu: "Menús desplegables con grupos, etiquetas, atajos, elementos de casilla y de opción, submenús y popovers.",
      "row-menu":
        "El menú desplegable de puntos suspensivos para acciones por fila, con gestión de clics externos y teclado.",
      tooltip:
        "Un tooltip al pasar el cursor o enfocar, para controles solo con icono, en cualquier lado y con flecha opcional.",
      toaster:
        "Notificaciones toast apiladas con acciones y cierre: la app gestiona la cola.",
      "page-header":
        "El bloque de título de una ruta con antetítulo, título, descripción y acciones.",
      "page-actions":
        "Las acciones del encabezado de una página de documento: estado, un control principal y un menú de desbordamiento.",
      chat: "La anatomía completa del chat: panel, hilo, mensajes, redactor, envío, sugerencias e indicador de escritura.",
      message:
        "Una entrada de un hilo: avatar, encabezado, burbujas y pie, alineados al inicio o al final.",
      bubble:
        "La burbuja de diálogo de un mensaje, en las variantes default, secondary, muted y ghost.",
      marker:
        "Una línea de estado en un hilo, como «Pensando…» o «Se han buscado 4 notas».",
      markdown:
        "Renderiza markdown con sabor GitHub como texto y edítalo con barra de herramientas, vista previa en directo y vista dividida.",
      "audio-player":
        "Un reproductor de grabaciones compacto con saltos, progreso, tiempo y velocidad de reproducción.",
      recording:
        "Botón de grabación, conmutador de micrófono, medidor de nivel, orbe de estado, cronómetro, indicador de grabación y estado de procesamiento para interfaces de captura.",
      "speaker-chip":
        "Las iniciales de un hablante en un avatar del color de su papel y su nombre, obtenidos de una sola clave de hablante de la transcripción.",
      transcript:
        "Una transcripción agrupada por turnos en la que se puede hacer clic para saltar a ese punto.",
      "side-panel":
        "Un panel acoplado junto a la página, con encabezado, título, acciones, botón de cierre y un cuerpo desplazable.",
      "floating-bar":
        "La píldora que flota sobre todas las apps mientras la grabación está lista, en curso o en proceso, con un botón de cierre.",
      "live-transcript": "El registro de subtítulos de una grabación en curso.",
      timeline:
        "Carriles de bloques y una franja de capítulos en una misma escala de tiempo, con cabezal de reproducción, capítulos y leyenda.",
    },
  },
  guide: {
    title: "Guía",
    description:
      "Aprende a instalar, tematizar y usar SurfaceOne en una app de Angular.",
    pages: {
      introduction: {
        title: "Introducción",
        description:
          "Qué es SurfaceOne, en qué se basa y cómo encajan los paquetes.",
        blocks: [
          {
            p: "SurfaceOne es el sistema de diseño de IndexOne, extraído en paquetes que cualquier app puede usar. Se basa en las convenciones de **shadcn/ui**, adaptadas a Angular mediante la anatomía de **spartan/ui**, y lee cada valor de los tokens de diseño.",
          },
          { h2: "Paquetes" },
          {
            list: [
              "`@surface-one/tokens`: CSS independiente del framework con los tokens, los seis skins en claro y oscuro, los acentos y las fuentes latin-ext.",
              "`@surface-one/angular`: los componentes. Cada familia de componentes es su propio punto de entrada, como `@surface-one/angular/button`.",
            ],
          },
          {
            p: "`@surface-one/vue` lleva los mismos componentes a Vue 3 y Nuxt (con el módulo `@surface-one/vue/nuxt`), y hay un paquete para React en preparación. Todos comparten `@surface-one/tokens`, de modo que un tema se ve idéntico en todos los frameworks.",
          },
          { h2: "Basado en spartan/ui, shadcn/ui y Nuxt UI" },
          {
            list: [
              "**spartan/ui** (ng-spartan): la anatomía de Angular, es decir, partes basadas en directivas, nombres de inputs y comportamiento.",
              "**shadcn/ui**: el núcleo visual, es decir, variantes, tamaños y los estilos sobre los que se construyen nuestros skins.",
              "**Nuxt UI**: la documentación, es decir, categorías de componentes, plantillas, el servidor MCP y las skills para agentes.",
            ],
          },
          { h2: "Principios" },
          {
            list: [
              "**Solo tokens.** Los componentes consumen `var(--token)`; un skin redeclara tokens y nunca bifurca un componente.",
              "**Primero lo nativo.** Un botón es un `<button>` y un selector es un `<select>`. ARIA cubre lo que el HTML nativo no ofrece.",
              "**Signals y zoneless.** Componentes standalone, OnPush, inputs, models y outputs con signals.",
              "**Superficies planas y opacas.** Sin cristal ni desenfoque: una interfaz serena con un acento contenido.",
            ],
          },
          { h2: "Nomenclatura" },
          {
            p: "Todos los selectores de elemento empiezan por `sone-` (`<sone-dialog>`, `<sone-switch>`) y todas las directivas de atributo por `sone` (`button[soneBtn]`, `[soneCard]`). Los símbolos de TypeScript empiezan por `Sone`.",
          },
          {
            note: "¿Quieres explorar todos los estados de un componente? [Storybook](/storybook/) los renderiza uno a uno con controles en directo.",
          },
        ],
      },
      installation: {
        title: "Instalación",
        description:
          "Añade SurfaceOne a una aplicación de Angular 22 en tres pasos.",
        blocks: [
          { h2: "1. Instala los paquetes" },
          { code: "install" },
          {
            p: "El punto de entrada de markdown también necesita sus dependencias peer opcionales (`marked`, `dompurify` y los paquetes `@codemirror/*`). Instálalas solo si importas `@surface-one/angular/markdown`.",
          },
          { h2: "2. Carga los estilos" },
          {
            p: "Añade los tokens y la hoja de estilos de los componentes al array `styles` de tu target de compilación, primero los tokens:",
          },
          { code: "angularJson" },
          {
            p: "Los estilos de los componentes son globales a propósito: la mayoría de las partes se proyectan o se renderizan en portales, donde la encapsulación emulada no llega.",
          },
          { h2: "3. Activa la localización" },
          {
            p: "Los componentes marcan sus textos integrados (como «Cerrar») con `$localize`, así que añade el polyfill:",
          },
          { code: "localize" },
          { h2: "Usa un componente" },
          { code: "usage" },
          {
            p: "A continuación, elige un skin y un modo de color en la página [Tema](/theme).",
          },
        ],
      },
      theming: {
        title: "Temas",
        description:
          "Cambia de skin, modo de color y acento con tres atributos, y sobrescribe cualquier token.",
        blocks: [
          { p: "Tres atributos en `<html>` controlan todo el sistema:" },
          {
            list: [
              "`data-skin`: `studio`, `paper`, `minimalist`, `neumorphism`, `material` o `surface`.",
              "`data-theme`: `light`, `dark` o `system` (sin atributo también sigue al sistema).",
              "`data-accent`: `blue`, `teal`, `green`, `orange` o `pink`; sin atributo se usa el acento propio del skin.",
            ],
          },
          { code: "themeAttributes" },
          { h2: "Evita el parpadeo del tema incorrecto" },
          {
            p: "Define los atributos antes del primer pintado con un pequeño script en línea en `index.html`:",
          },
          { code: "themeScript" },
          { h2: "Sobrescribe tokens" },
          {
            p: "Cada decisión visual es una propiedad personalizada. Redeclárala bajo el mismo selector para cambiarla en todas partes:",
          },
          { code: "overrideTokens" },
          {
            p: "Consulta todos los tokens, en directo, en la página [Tema](/theme).",
          },
        ],
      },
      utilities: {
        title: "Utilidades",
        description:
          "Clases auxiliares globales de diseño y texto incluidas en la hoja de estilos de los componentes.",
        blocks: [
          {
            p: "`@surface-one/angular/styles.css` (y `@surface-one/vue/styles.css`) incluyen algunas clases auxiliares globales para que una app no reescriba los mismos contenedores flex y estilos de texto en cada componente. Cada valor es un token.",
          },
          { h2: "Diseño" },
          {
            list: [
              "`.stack` — una columna flex; separación `--space-3`.",
              "`.cluster` — una fila de chips o botones que se ajusta y está centrada verticalmente; separación `--space-2`.",
              "`.row` — una fila centrada que no se ajusta; `.row-between` separa sus extremos. Separación `--space-2`.",
              '`data-gap="1"` … `"8"` en cualquiera de ellas elige el paso `--space-1` … `--space-8`.',
            ],
          },
          { code: "layoutUtilities" },
          { h2: "Texto" },
          {
            list: [
              "`.text-hint` — una línea secundaria bajo un control o un estado vacío: color secundario, `sm`, interlineado normal, sin margen.",
              "`.text-caption` — letra pequeña: color atenuado, `xs`.",
              "`.truncate` — una línea recortada con puntos suspensivos; `min-width: 0` le permite encogerse dentro de una pista flex o grid.",
              "`.list-reset` — un `<ul>` / `<ol>` sin viñetas, margen ni relleno.",
              "También están `.text-secondary`, `.text-muted`, `.text-success`, `.text-danger`, `.section-label` y `.sr-only`.",
            ],
          },
          { code: "textUtilities" },
          {
            note: "Son nombres de clase normales. Si tu app ya usa `.row` o `.stack` para otra cosa, la regla global también se aplica allí: renombra tu clase o ten en cuenta las propiedades que define.",
          },
        ],
      },
      fonts: {
        title: "Fuentes",
        description:
          "Fuentes variables autoalojadas con los subconjuntos latin y latin-ext.",
        blocks: [
          {
            p: "`@surface-one/tokens` incluye todas las fuentes a las que hace referencia —Geist, Geist Mono, Figtree, DM Sans, Instrument Sans, JetBrains Mono, Roboto y Source Serif 4— como fuentes variables WOFF2 autoalojadas. No se carga nada desde una CDN.",
          },
          { h2: "latin-ext es obligatorio" },
          {
            p: "Cada familia incluye dos archivos: **latin** y **latin-ext**. El subconjunto latin por sí solo no contiene ą, ć, ę, ł, ń, ś, ź, ż (ni ő, ř, ș…), así que el navegador dibujaría esos glifos con una fuente del sistema a mitad de palabra. Gracias a la división por `unicode-range`, una página solo descarga el archivo latin-ext cuando renderiza alguno de esos caracteres.",
          },
          { code: "fontFace" },
          {
            p: "El texto en chino y japonés recurre a la fuente CJK de la plataforma a través de cada pila de fuentes.",
          },
          { h2: "Añadir una fuente" },
          {
            p: "Solo se acepta una familia nueva si incluye ambos subconjuntos. Añade los dos archivos WOFF2 a `packages/tokens/fonts/` y un par de reglas `@font-face` a `fonts.css`.",
          },
        ],
      },
      accessibility: {
        title: "Accesibilidad",
        description:
          "Cómo cumple SurfaceOne las WCAG 2.2 AA y de qué sigue encargándose tu app.",
        blocks: [
          {
            p: "SurfaceOne tiene como objetivo el **nivel AA de las WCAG 2.2**. Los componentes siguen las WAI-ARIA Authoring Practices, y este sitio de documentación se prueba con axe-core en cada página, en modo claro y oscuro.",
          },
          { h2: "Qué hacen los componentes" },
          {
            list: [
              'Usan primero elementos nativos —`<button>`, `<select>`, `<input type="checkbox">`— para que la compatibilidad con teclado y lectores de pantalla venga de serie.',
              'Implementan los patrones ARIA: revelación (`aria-expanded`, `aria-controls`), grupos de opciones con una sola parada de tabulación y teclas de flecha, menús, diálogos que atrapan y restauran el foco, y `role="progressbar"` con valores.',
              "Muestran un anillo de foco visible en cada parte interactiva (`--focus-ring`).",
              "Respetan `prefers-reduced-motion` y mantienen un contraste de texto de 4,5:1 o superior en todos los skins.",
            ],
          },
          { h2: "De qué se encarga tu app" },
          {
            list: [
              "Asigna un `aria-label` a cada botón que solo tenga icono.",
              "Etiqueta cada control de formulario: usa `soneFieldLabel` o un `<label for>`.",
              "Define `<html lang>` y un título de documento significativo para cada ruta.",
              "Anuncia los resultados asíncronos relevantes, por ejemplo con el toaster o una región live.",
            ],
          },
        ],
      },
      i18n: {
        title: "Internacionalización",
        description:
          "Traduce los textos integrados y admite cualquier sistema de escritura.",
        blocks: [
          {
            p: "Los componentes contienen muy poco texto propio, y cada texto integrado («Cerrar», «Mostrar más», «Descargando…») está marcado con `$localize`. Tradúcelos con el flujo de trabajo estándar de i18n de Angular:",
          },
          { code: "extractI18n" },
          {
            p: "Los plurales usan mensajes ICU y siguen las reglas de plural de la configuración regional activa. Las fechas y duraciones se formatean con `Intl`.",
          },
          { h2: "Idiomas de este sitio" },
          {
            p: "Esta documentación está disponible en English, Polski, Español, Italiano, Français, Português, Deutsch, 简体中文 y 日本語, los mismos idiomas que el sitio web de IndexOne.",
          },
        ],
      },
      mcp: {
        title: "Servidor MCP",
        description:
          "Da a Claude Code, Codex, GitHub Copilot, Cursor y Windsurf acceso directo a la documentación, la API y los tokens de SurfaceOne.",
        blocks: [
          {
            p: "`@surface-one/angular-mcp` es un servidor Model Context Protocol. Tu asistente de IA le pide la API exacta de un componente, un ejemplo que funciona, su código fuente y sus estilos, las guías, las plantillas de pantalla y las variables del tema, en lugar de adivinarlos. Todo va incluido en el paquete: funciona sin conexión y siempre coincide con tu versión.",
          },
          { h2: "Claude Code" },
          { code: "mcpClaude" },
          { h2: "Codex" },
          { code: "mcpCodex" },
          { p: "O añádelo a `~/.codex/config.toml`:" },
          { code: "mcpCodexToml" },
          { h2: "VS Code con GitHub Copilot" },
          { p: "Añade `.vscode/mcp.json` a tu proyecto:" },
          { code: "mcpVsCode" },
          { h2: "Cursor, Windsurf y Claude Desktop" },
          { code: "mcpJson" },
          { h2: "Herramientas" },
          {
            list: [
              "`list_components`: todas las familias de componentes con su punto de entrada y sus selectores.",
              "`get_component_docs`: descripción, importación, un ejemplo que funciona y la API completa. Acepta nombres, slugs, clases o selectores como `soneBtn`.",
              "`get_component_source_code` y `get_component_source_styles`: la implementación.",
              "`get_docs`: páginas de guía y notas de la versión.",
              "`get_theme_variables`: los valores de los tokens de cada skin en modo claro y oscuro.",
              "`list_templates` y `get_template`: pantallas completas para empezar.",
            ],
          },
          { h2: "Prueba a pedir" },
          {
            list: [
              "«Crea una página de ajustes con SurfaceOne: un interruptor, un selector y un botón de guardar.»",
              "«Muéstrame la API del diálogo de SurfaceOne.»",
              "«¿Qué tokens usa el skin Paper en modo oscuro?»",
            ],
          },
          {
            note: "Combina el servidor con las [skills para agentes](/guide/skills): las skills le indican a tu asistente cómo trabajar con SurfaceOne y el servidor le da los datos.",
          },
        ],
      },
      skills: {
        title: "Skills para agentes",
        description:
          "Instala las skills de SurfaceOne para Claude Code, OpenAI Codex y GitHub Copilot con un solo comando.",
        blocks: [
          {
            p: "Las skills para agentes son carpetas con un `SKILL.md` que un asistente carga cuando una tarea las necesita. Claude Code, Codex y GitHub Copilot comparten el formato, así que un solo paquete sirve para los tres.",
          },
          {
            list: [
              "`surface-one-angular`: crea pantallas con los componentes (configuración, puntos de entrada, selectores `sone-`, tokens, overlays y formularios), con el catálogo completo de componentes.",
              "`surface-one-theming`: skins, modo claro, oscuro y del sistema, acentos, sobrescritura de tokens y fuentes latin-ext.",
              "`surface-one-a11y-review`: una lista de comprobación de las WCAG 2.2 AA para pantallas de SurfaceOne.",
            ],
          },
          { h2: "Instalación" },
          { code: "skillsAdd" },
          { h2: "Dónde se instalan" },
          {
            list: [
              "**Claude Code**: `.claude/skills/` (globalmente `~/.claude/skills/`).",
              "**Codex**: `.agents/skills/` (globalmente `~/.agents/skills/`).",
              "**GitHub Copilot**: `.agents/skills/` (globalmente `~/.copilot/skills/`).",
            ],
          },
          {
            p: "Después de actualizar SurfaceOne, vuelve a ejecutar el comando con `--force` para refrescar las skills.",
          },
          {
            note: "Añade también el [servidor MCP](/guide/mcp): las skills usan sus herramientas cuando está disponible.",
          },
        ],
      },
      contributing: {
        title: "Cómo contribuir",
        description:
          "Ramas, Conventional Commits, pull requests y code owners.",
        blocks: [
          { p: "SurfaceOne sigue las mismas reglas que IndexOne." },
          { h2: "Ramas y commits" },
          {
            list: [
              "Los nombres de rama siguen el formato `<type>/<kebab-slug>`, por ejemplo `feat/sone-calendar`.",
              "Los encabezados de commit y los títulos de PR siguen Conventional Commits: `<type>(<scope>): <subject>`, con un máximo de 100 caracteres y el asunto en minúsculas.",
              "Sin atribuciones de ningún tipo: nada de líneas de coautoría de IA ni pies del tipo «generated with».",
            ],
          },
          { code: "commit" },
          { h2: "Pull requests" },
          {
            p: "El cuerpo de la PR es la plantilla del repositorio: una línea breve por cada cambio real, en inglés sencillo. Toda PR necesita la aprobación de un code owner.",
          },
          { h2: "Añadir un componente" },
          {
            list: [
              "Crea `packages/angular/<name>/` con el componente, `index.ts` y `ng-package.json`.",
              "Usa el prefijo de selector `sone-`, OnPush, inputs con signals y solo tokens.",
              "Añade `<name>.stories.ts` y registra el componente en el catálogo de la documentación con una demo.",
            ],
          },
        ],
      },
    },
  },
  theme: {
    title: "Tema",
    description:
      "Tokens de diseño, skins, modos de color y acentos de SurfaceOne, en directo.",
    lead: "Todos los valores de esta página se leen de los tokens en directo. Cambia los controles y todo el sitio se adapta.",
    controls: "Controles del tema",
    skin: "Skin",
    mode: "Modo",
    accent: "Acento",
    accentDefault: "Predeterminado del skin",
    skins: {
      studio: "Studio",
      paper: "Paper",
      minimalist: "Minimalist",
      neumorphism: "Neumorphism",
      material: "Material",
      surface: "Surface",
    },
    accents: {
      blue: "Azul",
      teal: "Verde azulado",
      green: "Verde",
      orange: "Naranja",
      pink: "Rosa",
    },
    sections: {
      colors: "Roles de color",
      colorsLead:
        "Colores semánticos. Los componentes usan estos nombres, nunca un tono de la paleta.",
      chart: "Colores de gráficos",
      chartLead:
        "Ocho colores categóricos para series, carriles y tipos de nodo, una escala secuencial de cinco pasos y el par positivo / negativo. Cada uno mantiene al menos 3:1 sobre las superficies de tarjeta y de página en cada skin y modo.",
      palette: "Paletas de acento",
      typography: "Tipografía",
      typographyLead: "La escala tipográfica que comparten todos los skins.",
      radius: "Radio",
      spacing: "Espaciado",
      shadows: "Sombras",
      tokens: "Todos los tokens",
      tokensLead:
        "Los archivos de tokens de @surface-one/tokens y las propiedades personalizadas que declara cada uno.",
    },
    sample:
      "El veloz murciélago hindú comía feliz cardillo y kiwi — Zażółć gęślą jaźń",
    reset: "Restablecer",
  },
  templates: {
    title: "Plantillas",
    description:
      "Pantallas listas para usar compuestas con componentes de SurfaceOne: panel de control, chat con IA, ajustes, notas de reunión, inicio de sesión y registro, un formulario con validación, mensajes, un espacio de trabajo con dos barras laterales, un editor de markdown, multimedia, finanzas, un CRM, una tienda online, un tablero de sprint y un editor de flujos de trabajo.",
    lead: "Pantallas completas creadas solo con el paquete. Cópialas como punto de partida.",
    view: "Ver plantilla",
    back: "Todas las plantillas",
    vueMissing: "Esta plantilla aún no tiene versión para Vue.",
    viewport: "Tamaño de pantalla",
    devices: {
      desktop: "Escritorio",
      tablet: "Tableta",
      phone: "Teléfono",
    },
    items: {
      dashboard: {
        title: "Panel de control",
        description:
          "Una estructura de app con barra lateral, encabezado de página, tarjetas de estadísticas y una tabla de datos.",
      },
      chat: {
        title: "Chat con IA",
        description:
          "Un hilo de asistente con mensajes, marcadores, sugerencias y un redactor.",
      },
      settings: {
        title: "Ajustes",
        description:
          "Preferencias agrupadas con campos, interruptores, tarjetas de opción y un secreto.",
      },
      notes: {
        title: "Notas de reunión",
        description:
          "Una grabación con reproductor de audio, transcripción y notas renderizadas.",
      },
      login: {
        title: "Inicio de sesión",
        description:
          "Una tarjeta de acceso con botones de Google, Apple y GitHub, formulario de correo y contraseña, validación y opción de recordar la sesión.",
      },
      signup: {
        title: "Registro",
        description:
          "Un registro a pantalla dividida con SSO, medidor de seguridad de la contraseña, reglas en vivo y términos.",
      },
      form: {
        title: "Validación de formularios",
        description:
          "Un formulario largo por secciones con validación reactiva, reglas entre campos y un resumen de errores que enlaza con cada campo.",
      },
      messages: {
        title: "Mensajes",
        description:
          "Una bandeja de mensajes directos con lista de conversaciones con búsqueda, burbujas, indicador de escritura y redactor.",
      },
      workspace: {
        title: "Dos barras laterales",
        description:
          "Un espacio de tareas con una barra de navegación plegable a la izquierda y una barra de detalles a la derecha.",
      },
      editor: {
        title: "Editor de markdown",
        description:
          "Un editor de documentos con lista de archivos, barra de formato, modos de escritura, dividido y vista previa, y guardado automático.",
      },
      media: {
        title: "Multimedia",
        description:
          "Un estudio de grabación con control de grabación, biblioteca de grabaciones, reproductor de audio, línea de tiempo por capítulos y transcripción en vivo.",
      },
      finances: {
        title: "Finanzas",
        description:
          "Un resumen financiero con selector de periodo, cifras clave, gráfico de flujo de caja, gastos por categoría, presupuestos, cuentas y tabla de transacciones.",
      },
      crm: {
        title: "CRM",
        description:
          "Un CRM de ventas con tablero del embudo de oportunidades, vista de lista, estadísticas del embudo y panel de detalle con registro de actividad.",
      },
      ecommerce: {
        title: "Comercio electrónico",
        description:
          "Una tienda online con filtros por categoría, una cuadrícula de productos con valoraciones y lista de deseos, una vista rápida del producto y un carrito con cantidades, código promocional y resumen del pedido.",
      },
      board: {
        title: "Tablero",
        description:
          "Un tablero de sprint al estilo de Jira con carriles, tarjetas de incidencias con tipo, prioridad, puntos de historia y responsable, filtros rápidos, arrastrar y soltar y un panel de detalle.",
      },
      workflow: {
        title: "Flujo de trabajo",
        description:
          "Un editor de automatizaciones: un lienzo de nodos con disparadores, condiciones y acciones, un dock de dibujo que se coloca en cualquier borde, un minimapa, un inspector y una ejecución de prueba.",
      },
    },
  },
  changelog: {
    title: "Registro de cambios",
    description:
      "Cada versión de SurfaceOne, de la más reciente a la más antigua: nuevos componentes, correcciones y cambios incompatibles, con la fecha de cada versión.",
    eyebrow: "Registro de cambios",
    heading: "Novedades de SurfaceOne",
    lead: "Cada versión del sistema de diseño, de la más reciente a la más antigua. Los tokens, los componentes de Angular, el servidor MCP y las skills comparten una única versión.",
    npm: "Instalar desde npm",
    github: "Todas las versiones en GitHub",
    latest: "Última",
    englishNote: "Las notas de la versión se publican en inglés.",
    versions: "Versiones",
  },
  notFound: {
    title: "Página no encontrada",
    description: "La página que buscas no existe.",
    back: "Volver al inicio",
  },
};
