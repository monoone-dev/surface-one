import type { Messages } from "./en";

export const ja: Messages = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "Angular と Vue のための、落ち着いたアクセシブルなコンポーネント",
    description:
      "SurfaceOne は Angular と Vue / Nuxt のためのアクセシブルなデザインシステムです。70 以上のコンポーネントファミリー、フレームワークに依存しないデザイントークン、ライトとダークに対応した 4 つのスキン、そして latin-ext を完全にカバーするフォントを備えています。",
  },
  a11y: {
    skipToContent: "本文へスキップ",
    mainNav: "メイン",
    sectionNav: "セクション",
    breadcrumb: "パンくずリスト",
    openMenu: "メニューを開く",
    closeMenu: "メニューを閉じる",
    language: "言語",
    colorMode: "カラーモード",
    externalLink: "（新しいタブで開きます）",
    copyCode: "コードをコピー",
    copied: "コピーしました",
    onThisPage: "このページの内容",
    preview: "ライブプレビュー",
  },
  nav: {
    home: "ホーム",
    components: "コンポーネント",
    guide: "ガイド",
    theme: "テーマ",
    templates: "テンプレート",
    changelog: "変更履歴",
    storybook: "Storybook",
    github: "GitHub",
  },
  colorMode: {
    system: "システム",
    light: "ライト",
    dark: "ダーク",
  },
  footer: {
    madeBy: "{brand} が制作しています。",
    license: "プロジェクトのライセンスのもとで公開されています。",
    resources: "リソース",
    project: "プロジェクト",
    changelog: "変更履歴",
    contributing: "コントリビュート",
  },
  home: {
    title: "SurfaceOne — Angular と Vue のためのデザインシステム",
    eyebrow: "Vue と Nuxt に対応しました",
    heading: "SurfaceOne で、落ち着いたアクセシブルなインターフェースを",
    lead: "Angular と Vue / Nuxt 向けのシグナルファーストなコンポーネント、フレームワークに依存しないデザイントークン、ライトとダークに対応した 4 つのスキン。標準でアクセシブルで、どんなアプリにもすぐ使えます。",
    getStarted: "はじめる",
    browseComponents: "コンポーネントを見る",
    openStorybook: "Storybook を開く",
    installLabel: "インストール",
    stats: {
      components: "コンポーネントファミリー",
      symbols: "コンポーネントとディレクティブ",
      skins: "スキン × ライト/ダーク",
      locales: "ドキュメントの言語",
    },
    featuresTitle: "プロダクトの画面に必要なものをすべて",
    features: {
      tokens: {
        title: "トークンファースト",
        body: "色、角丸、余白、影のすべてが CSS カスタムプロパティです。コンポーネントはトークンだけを参照し、生の値は使いません。",
      },
      skins: {
        title: "4 つのスキン、2 つのモード",
        body: "Studio、Paper、Minimalist、Neumorphism は同じトークンを再宣言します。ライト、ダーク、システムの切り替えは属性ひとつで行えます。",
      },
      a11y: {
        title: "標準でアクセシブル",
        body: "本物のボタン、WAI-ARIA プラクティスに基づく ARIA パターン、見えるフォーカス、モーションの軽減、AA 準拠のコントラスト。",
      },
      signals: {
        title: "シグナルとゾーンレス",
        body: "スタンドアロン、OnPush、シグナル入力とモデル。ゾーンレスの Angular やサーバーサイドレンダリングでも動作します。",
      },
      fonts: {
        title: "すべてに latin-ext",
        body: "同梱のフォントはすべて latin と latin-ext のサブセットを含むため、ą、ł、ő、ř、ș が単語の途中で別のフォントにフォールバックすることはありません。",
      },
      frameworks: {
        title: "ほかのフレームワークにも対応予定",
        body: "トークンはフレームワーク非依存のパッケージにあります。現在は Angular 版と Vue / Nuxt 版を提供しており、React も同じ基盤を共有する予定です。",
      },
    },
    showcaseTitle: "コンポーネントの一部をご紹介",
    showcaseLead:
      "以下はすべて実際のパッケージを、選択中のテーマでライブレンダリングしたものです。",
    ctaTitle: "次の画面を SurfaceOne で",
    ctaBody:
      "パッケージをインストールし、トークンを読み込んで、組み立てを始めましょう。",
    frameworks: {
      label: "フレームワーク",
      angular: "Angular",
      vue: "Vue / Nuxt",
      react: "React",
      soon: "近日公開",
      installStep: "インストール",
      setupAngular: "angular.json でスタイルを読み込む",
      setupVue: "Nuxt モジュールを追加（素の Vue では SurfaceOne プラグイン）",
      reactBody:
        "React コンポーネントを準備中です。Angular や Vue と同じトークン、スキン、マークアップを共有します。",
      worksWith: "対応",
    },
    previewLabel:
      "SurfaceOne のコンポーネントで作ったライブプレビュー：トレンド付きの週間統計、スパークライン、バーリスト、録音インジケーター。",
  },
  components: {
    title: "コンポーネント",
    description:
      "SurfaceOne のすべてのコンポーネントを役割別にまとめています。レイアウト、エレメント、フォーム、データ、ナビゲーション、オーバーレイ、ページの構成要素、AI チャット、エディター、メディア。",
    lead: "各コンポーネントは独立したエントリーポイントを持つため、アプリにはインポートしたものだけがバンドルされます。",
    filterLabel: "コンポーネントを絞り込む",
    filterPlaceholder: "名前で絞り込む…",
    noResults: "「{query}」に一致するコンポーネントはありません。",
    count: "{count} 個のコンポーネント",
    categories: {
      layout: {
        name: "レイアウト",
        description: "画面を構成する：サイドバー、カード、区切り線。",
      },
      element: {
        name: "エレメント",
        description:
          "小さな構成要素：ボタン、バッジ、アラート、インジケーター。",
      },
      form: {
        name: "フォーム",
        description:
          "入力欄、セレクト、スイッチ、スライダー、選択コントロール。",
      },
      data: {
        name: "データ",
        description:
          "レコードを表示する：テーブル、アイテム、リスト、空の状態。",
      },
      navigation: {
        name: "ナビゲーション",
        description: "階層をたどる。",
      },
      overlay: {
        name: "オーバーレイ",
        description: "ダイアログ、シート、メニュー、ツールチップ、トースト。",
      },
      page: {
        name: "ページ",
        description: "ルートのヘッダーとアクション。",
      },
      chat: {
        name: "AI チャット",
        description:
          "アシスタント向けのスレッド、メッセージ、吹き出し、ステータスマーカー。",
      },
      editor: {
        name: "エディター",
        description: "Markdown の表示と執筆。",
      },
      media: {
        name: "メディア",
        description: "録音、再生、文字起こし、タイムライン。",
      },
    },
    page: {
      import: "インポート",
      usage: "使い方",
      api: "API リファレンス",
      selector: "セレクター",
      exportAs: "エクスポート名",
      inputs: "入力",
      outputs: "出力",
      name: "名前",
      type: "型",
      default: "デフォルト",
      required: "必須",
      twoWay: "双方向",
      noInputs: "入力はありません。",
      openInStorybook: "Storybook で開く",
      viewSource: "ソースを表示",
      previous: "前へ",
      next: "次へ",
      preview: "プレビュー",
      code: "コード",
      framework: "フレームワーク",
      vueMissing:
        "Vue コンポーネントはまだありません。このコンポーネントは Angular 専用です。",
      vueReadme: "Vue パッケージの対応範囲を見る",
      nuxtNote:
        "Nuxt では `nuxt.config.ts` の `modules` に `@surface-one/vue/nuxt` を追加してください。すべての `Sone*` コンポーネントが自動インポートされるため、上の import は省略できます。",
      kind: {
        component: "コンポーネント",
        directive: "ディレクティブ",
        pipe: "パイプ",
      },
    },
    entries: {
      sidebar:
        "ヘッダー、グループ、メニュー、バッジ、レール、インセットのコンテンツ領域を備えた折りたたみ可能なアプリケーションサイドバー。Angular 版の shadcn/ui Sidebar です。",
      card: "関連するコンテンツをまとめるサーフェス。ヘッダー、タイトル、説明、アクション、コンテンツ、フッターの各パーツを持ちます。",
      separator:
        "コンテンツ間の 1 ピクセルの細線。水平・垂直、装飾的・意味的のいずれにも使えます。",
      collapsible:
        "トリガーで領域を表示・非表示にし、aria-expanded と aria-controls を同期させます。",
      disclosure:
        "WAI-ARIA の Disclosure パターンに従った段階的開示セクション。",
      alert:
        "重要な情報を伝えるコールアウト。タイトル、説明、アクション、5 つのトーンを持ちます。",
      avatar:
        "ユーザー画像。イニシャルへのフォールバックと、サインアウト時の汎用グリフに対応します。",
      badge:
        "ステータス、件数、タグのためのコンパクトなラベル。6 つのバリアントと 4 つのステータス色があります。",
      banner:
        "先頭にグリフを持つ 1 行のステータスコールアウト。エラーと警告はスクリーンリーダーに通知されます。",
      "bar-chart":
        "短い系列のための縦棒グラフ。目盛りラベル、ホバーとフォーカスで出るツールチップ、矢印キーでの移動、スクリーンリーダー向けの非表示データ表を備えます。",
      "bar-list":
        "ラベル付きの横棒をランキング表示し、値を横に添えるリスト。最大値または合計に合わせて伸縮し、ラベルには任意のテンプレートを使えます。",
      button:
        "唯一のボタン。6 つのバリアント、4 つのテキストサイズ、4 つの正方形アイコンサイズに加え、ボタングループもあります。",
      icon: "currentColor で描画されるインライン SVG グリフ。アイコンフォントも追加のリクエストも不要です。",
      kbd: "キーボードのキーとキーの組み合わせ。",
      logo: "カラーモードに合わせて切り替わる SurfaceOne、IndexOne、Ivy のロゴ。",
      progress:
        "確定・不確定に対応したリニアなプログレスバー。アクセシブルな progressbar ロールを持ちます。",
      "download-progress":
        "ライブで更新されるキャプションと、任意のキャンセルアクションを備えたプログレスバー。",
      meter:
        "精度や速度のような大まかな順序量を表す、セグメント化されたインジケーター。",
      skeleton:
        "コンテンツの読み込み中に表示される、ホストのサイズに合わせて脈動するプレースホルダー。",
      sparkline:
        "1 つの伸縮する SVG に描く、軸のない単語サイズの折れ線・面・棒・ヒート図。既定は装飾扱いで、読み上げ用の要約を持つ画像にもできます。",
      spinner: "currentColor で描画される、任意のサイズの回転ローダー。",
      input:
        "フィールド、ラベル、説明、エラー、アドオン付きの入力グループ。システムでスタイルを整えたネイティブの入力欄です。",
      select:
        "オプションをコンテンツ投影するフォームコントロールとしてのネイティブセレクト。",
      switch:
        "フォームコントロールとして使えるオン／オフのスイッチ。2 つのサイズがあります。",
      slider:
        "アクセントカラーの塗りと丸いつまみを持つ範囲スライダー。フォームコントロールとして使えます。",
      "power-slider":
        "離散的な段階を持つ範囲コントロール。ドラッグ中にプレビューし、離したときに確定します。",
      segmented:
        "データから描画される単一選択のセグメントコントロール。ライト / ダーク / システムのパターンです。",
      "toggle-group":
        "トグル、トグルグループ、タブ。ロービングフォーカスとあらゆる向きに対応します。",
      "choice-card":
        "カード全体が選択肢になるリッチなラジオカード。タブストップは 1 つで、矢印キーで移動できます。",
      "secret-field":
        "API キーなどのシークレットを入力・保存・消去し、設定済み / 未設定のステータスを表示します。",
      "copy-button":
        "値をクリップボードにコピーし、短い「コピーしました」の確認を表示します。スクリーンリーダーにも読み上げられます。",
      "input-otp":
        "ワンタイムコードの入力欄。1 つの実際の入力欄を個別のマスとして描くため、貼り付け・自動入力・スクリーンリーダーがそのまま機能します。",
      "password-input":
        "表示 / 非表示の切り替えボタン付きのパスワード入力欄。フォームコントロールとして使えます。",
      stepper:
        "複数ステップのフローの進捗をドットまたは番号付きステップで示し、「ステップ x / y」の表示を添えます。",
      "tag-input":
        "タグを削除可能なチップとして入力します。Enter またはカンマで追加、Backspace で最後のタグを削除。フォームコントロールとして使えます。",
      table:
        "列テンプレートで定義する高密度のデータテーブル。キャプションと空の状態に対応します。",
      item: "メディア、タイトル、説明、アクションからなる行。リストや設定画面に使います。",
      "empty-state": "ビューが空である理由を説明し、次のステップを提示します。",
      graph:
        "キャンバス上のインタラクティブなネットワーク図。力学・クラスター・レイヤーの各レイアウト、パンとズーム、キーボード操作、ノード一覧に対応します。",
      "source-list":
        "タイトル付きのソース一覧。チップまたは行で表示し、「もっと見る」の切り替えを備えます。",
      "chart-legend":
        "カラースウォッチと、項目で系列の表示・非表示を切り替えられるチャートの凡例。",
      "stacked-bar":
        "1 本のバーを全体の内訳に分割。残りのトラックと凡例をオプションで表示し、スクリーンリーダー向けの要約を生成します。",
      stat: "説明リストで示す主要な数値。ラベル・値・補足・トレンドを、カード、くぼんだタイル、またはシンプルな横並びで表示します。",
      command:
        "検索できるコマンドリストとコマンドパレット。コンボボックス入力、キーボードでハイライトする選択肢、グループ、組み込みのフィルターを備えます。",
      tree: "ツリー行のキーボード操作。矢印キー、展開と折りたたみ、タイプアヘッド、単一の Tab 停止位置を備え、WAI-ARIA の tree パターンに従います。",
      "tree-row":
        "インデント、展開トグル、選択、アクションを備えたファイルツリーの行。",
      dialog:
        "モーダルダイアログとアラートダイアログ。フォーカス管理、Escape キーやスクリムのクリックによる閉じる操作に対応します。",
      sheet: "ウィンドウの任意の端にドッキングするモーダルパネル。",
      menu: "グループ、ラベル、ショートカット、チェックボックス項目とラジオ項目、サブメニュー、ポップオーバーを備えたドロップダウンメニュー。",
      "row-menu":
        "行ごとのアクションを表示する三点リーダーのドロップダウン。外側のクリックとキーボード操作に対応します。",
      tooltip:
        "アイコンのみのコントロール向けに、ホバーとフォーカスで表示されるツールチップ。任意の方向に表示でき、矢印も付けられます。",
      toaster:
        "アクションと閉じる操作に対応した、積み重なるトースト通知。キューはアプリ側で管理します。",
      "page-header":
        "アイブロウ、タイトル、説明、アクションを備えたルートのタイトルブロック。",
      "page-actions":
        "ドキュメントページのヘッダーアクション。ステータス、主要なコントロール、オーバーフローメニュー。",
      chat: "チャットの完全な構成要素。ペイン、スレッド、メッセージ、コンポーザー、送信、サジェスト、入力中インジケーター。",
      message:
        "スレッドの 1 件分。アバター、ヘッダー、吹き出し、フッターからなり、先頭または末尾に揃えられます。",
      bubble:
        "メッセージの吹き出し。default、secondary、muted、ghost のバリアントがあります。",
      marker:
        "「考え中…」や「4 件のノートを検索しました」のような、スレッド内のステータス行。",
      markdown:
        "GitHub Flavored Markdown を本文として表示し、ツールバー、ライブプレビュー、分割ビューで編集できます。",
      "audio-player":
        "スキップ、進捗、時間、再生速度を備えたスリムな録音プレーヤー。",
      recording:
        "録音画面のための録音ボタン、マイクのトグル、レベルメーター、ステータスオーブ、経過時間タイマー、録音インジケーター、処理ステータス。",
      "speaker-chip":
        "文字起こしの話者キー 1 つから、役割の色のアバターに入ったイニシャルと話者名を表示します。",
      transcript:
        "発言ごとにまとめられ、クリックでその位置へ移動できる文字起こし。",
      "side-panel":
        "ページの横にドッキングするパネル。ヘッダー、タイトル、アクション、閉じるボタン、スクロールする本文を備えます。",
      "floating-bar":
        "録音の準備完了・録音中・処理中に、すべてのアプリの上に浮かぶピル型のバー。閉じるボタン付き。",
      "live-transcript": "録音中のキャプションログ。",
      timeline:
        "1 つの時間軸上に並ぶブロックのレーンとチャプターのリボン。再生ヘッド、チャプター、凡例を備えます。",
    },
  },
  guide: {
    title: "ガイド",
    description:
      "Angular アプリで SurfaceOne をインストールし、テーマを設定して使う方法を学びます。",
    pages: {
      introduction: {
        title: "はじめに",
        description:
          "SurfaceOne とは何か、何をベースにしているか、各パッケージがどう組み合わさるか。",
        blocks: [
          {
            p: "SurfaceOne は IndexOne を支えるデザインシステムを、どんなアプリでも使えるパッケージとして切り出したものです。**shadcn/ui** の規約に基づき、**spartan/ui** の構造を通じて Angular に移植されており、すべての値をデザイントークンから読み取ります。",
          },
          { h2: "パッケージ" },
          {
            list: [
              "`@surface-one/tokens` — フレームワーク非依存の CSS。トークン、ライトとダークの 4 つのスキン、アクセントカラー、latin-ext フォントを含みます。",
              "`@surface-one/angular` — コンポーネント。各コンポーネントファミリーは `@surface-one/angular/button` のように独立したエントリーポイントです。",
            ],
          },
          {
            p: "`@surface-one/vue` は同じコンポーネントを Vue 3 と Nuxt（`@surface-one/vue/nuxt` モジュール付き）に提供し、React のパッケージも予定しています。いずれも `@surface-one/tokens` を共有するため、どのフレームワークでもテーマの見た目はまったく同じになります。",
          },
          { h2: "spartan/ui、shadcn/ui、Nuxt UI をベースに構築" },
          {
            list: [
              "**spartan/ui**（ng-spartan）— Angular の構造。ディレクティブ中心のパーツ、入力名、振る舞いです。",
              "**shadcn/ui** — ビジュアルの中核。バリアント、サイズ、そしてスキンの土台となるスタイルです。",
              "**Nuxt UI** — ドキュメント。コンポーネントのカテゴリ、テンプレート、MCP サーバー、エージェントスキルです。",
            ],
          },
          { h2: "原則" },
          {
            list: [
              "**トークンのみ。** コンポーネントは `var(--token)` を使います。スキンはトークンを再宣言するだけで、コンポーネントをフォークすることはありません。",
              "**ネイティブ優先。** ボタンは `<button>`、セレクトは `<select>` です。ネイティブ HTML で足りない部分を ARIA で補います。",
              "**シグナルとゾーンレス。** スタンドアロンコンポーネント、OnPush、シグナル入力、モデル、出力。",
              "**フラットで不透明なサーフェス。** ガラス表現もぼかしもなく、控えめなアクセントカラーを添えた落ち着いた UI です。",
            ],
          },
          { h2: "命名規則" },
          {
            p: "要素セレクターはすべて `sone-` で始まり（`<sone-dialog>`、`<sone-switch>`）、属性ディレクティブはすべて `sone` で始まります（`button[soneBtn]`、`[soneCard]`）。TypeScript のシンボルは `Sone` で始まります。",
          },
          {
            note: "コンポーネントのあらゆる状態を試してみたいですか？ [Storybook](/storybook/) では、それぞれの状態をライブコントロール付きで表示できます。",
          },
        ],
      },
      installation: {
        title: "インストール",
        description:
          "3 つのステップで SurfaceOne を Angular 22 アプリケーションに追加します。",
        blocks: [
          { h2: "1. パッケージをインストールする" },
          { code: "install" },
          {
            p: "Markdown のエントリーポイントには、オプションのピア依存関係（`marked`、`dompurify`、`@codemirror/*` パッケージ）も必要です。これらは `@surface-one/angular/markdown` をインポートする場合にのみインストールしてください。",
          },
          { h2: "2. スタイルを読み込む" },
          {
            p: "ビルドターゲットの `styles` 配列に、トークンとコンポーネントのスタイルシートを追加します。トークンを先に記述してください：",
          },
          { code: "angularJson" },
          {
            p: "コンポーネントのスタイルは意図的にグローバルにしています。ほとんどのパーツはコンテンツ投影やポータルで描画され、エミュレートされたカプセル化が届かないためです。",
          },
          { h2: "3. ローカライゼーションを有効にする" },
          {
            p: "コンポーネントは組み込みの文字列（「閉じる」など）を `$localize` でマークしているため、ポリフィルを追加します：",
          },
          { code: "localize" },
          { h2: "コンポーネントを使う" },
          { code: "usage" },
          {
            p: "次に、[テーマ](/theme)ページでスキンとカラーモードを選びましょう。",
          },
        ],
      },
      theming: {
        title: "テーマ設定",
        description:
          "3 つの属性でスキン、カラーモード、アクセントカラーを切り替え、任意のトークンを上書きします。",
        blocks: [
          { p: "`<html>` に付ける 3 つの属性がシステム全体を制御します：" },
          {
            list: [
              "`data-skin` — `studio`、`paper`、`minimalist`、`neumorphism` のいずれか。",
              "`data-theme` — `light`、`dark`、`system` のいずれか（属性がない場合もシステム設定に従います）。",
              "`data-accent` — `blue`、`teal`、`green`、`orange`、`pink` のいずれか。属性がない場合はスキン固有のアクセントカラーを使います。",
            ],
          },
          { code: "themeAttributes" },
          { h2: "誤ったテーマのちらつきを防ぐ" },
          {
            p: "`index.html` に小さなインラインスクリプトを置き、最初の描画より前に属性を設定します：",
          },
          { code: "themeScript" },
          { h2: "トークンを上書きする" },
          {
            p: "見た目に関するすべての決定はカスタムプロパティです。同じセレクターの下で再宣言すれば、すべての箇所に反映されます：",
          },
          { code: "overrideTokens" },
          {
            p: "すべてのトークンは[テーマ](/theme)ページでライブに確認できます。",
          },
        ],
      },
      utilities: {
        title: "ユーティリティ",
        description:
          "コンポーネントのスタイルシートに含まれる、レイアウトとテキスト用のグローバルなヘルパークラス。",
        blocks: [
          {
            p: "`@surface-one/angular/styles.css`（および `@surface-one/vue/styles.css`）には、アプリがコンポーネントごとに同じ flex コンテナやテキストスタイルを書き直さずに済むよう、いくつかのグローバルなヘルパークラスが含まれています。値はすべてトークンです。",
          },
          { h2: "レイアウト" },
          {
            list: [
              "`.stack` — flex の縦並び。間隔は `--space-3`。",
              "`.cluster` — 折り返し、縦方向に中央揃えされたチップやボタンの行。間隔は `--space-2`。",
              "`.row` — 折り返さない中央揃えの行。`.row-between` は両端を離して配置します。間隔は `--space-2`。",
              'どのクラスにも `data-gap="1"` … `"8"` を付けると `--space-1` … `--space-8` の段階を選べます。',
            ],
          },
          { code: "layoutUtilities" },
          { h2: "テキスト" },
          {
            list: [
              "`.text-hint` — コントロールや空の状態の下に置く補足の行。セカンダリの文字色、`sm`、標準の行間、マージンなし。",
              "`.text-caption` — 注記。控えめな文字色、`xs`。",
              "`.truncate` — 1 行に収めて省略記号で切り詰めます。`min-width: 0` により flex や grid のトラック内で縮められます。",
              "`.list-reset` — 行頭記号・マージン・パディングのない `<ul>` / `<ol>`。",
              "`.text-secondary`、`.text-muted`、`.text-success`、`.text-danger`、`.section-label`、`.sr-only` も使えます。",
            ],
          },
          { code: "textUtilities" },
          {
            note: "これらは通常のクラス名です。アプリですでに `.row` や `.stack` を別の用途に使っている場合、そこにもグローバルなルールが適用されます。独自のクラス名を変えるか、設定されるプロパティを考慮してください。",
          },
        ],
      },
      fonts: {
        title: "フォント",
        description:
          "latin と latin-ext のサブセットを備えたセルフホストの可変フォント。",
        blocks: [
          {
            p: "`@surface-one/tokens` は参照するすべてのフォント（Geist、Geist Mono、Figtree、DM Sans、JetBrains Mono、Source Serif 4）を、セルフホストの WOFF2 可変フォントとして同梱しています。CDN からは何も読み込みません。",
          },
          { h2: "latin-ext は必須" },
          {
            p: "各ファミリーは **latin** と **latin-ext** の 2 つのファイルを提供します。latin サブセットだけでは ą、ć、ę、ł、ń、ś、ź、ż（や ő、ř、ș など）が含まれないため、ブラウザーは単語の途中でそれらのグリフをシステムフォントで描画してしまいます。`unicode-range` で分割しておけば、ページはそうした文字を描画するときにだけ latin-ext ファイルをダウンロードします。",
          },
          { code: "fontFace" },
          {
            p: "中国語と日本語のテキストは、各フォントスタックを通じてプラットフォーム標準の CJK フォントにフォールバックします。",
          },
          { h2: "フォントを追加する" },
          {
            p: "新しいファミリーは、両方のサブセットがそろっている場合にのみ受け付けます。2 つの WOFF2 ファイルを `packages/tokens/fonts/` に追加し、`fonts.css` に `@font-face` ルールを 1 組追加してください。",
          },
        ],
      },
      accessibility: {
        title: "アクセシビリティ",
        description:
          "SurfaceOne が WCAG 2.2 AA をどのように満たしているか、そしてアプリ側で担うべきこと。",
        blocks: [
          {
            p: "SurfaceOne は **WCAG 2.2 レベル AA** を目標としています。コンポーネントは WAI-ARIA Authoring Practices に従っており、このドキュメントサイトはすべてのページをライトモードとダークモードの両方で axe-core によりテストしています。",
          },
          { h2: "コンポーネントが担うこと" },
          {
            list: [
              'ネイティブ要素（`<button>`、`<select>`、`<input type="checkbox">`）を優先して使い、キーボードとスクリーンリーダーのサポートを標準で得られるようにします。',
              'ARIA パターンを実装します：ディスクロージャー（`aria-expanded`、`aria-controls`）、タブストップが 1 つで矢印キーで操作できるラジオグループ、メニュー、フォーカスを閉じ込めて復元するダイアログ、値を持つ `role="progressbar"`。',
              "すべてのインタラクティブなパーツに見えるフォーカスリング（`--focus-ring`）を表示します。",
              "`prefers-reduced-motion` を尊重し、どのスキンでもテキストのコントラスト比を 4.5:1 以上に保ちます。",
            ],
          },
          { h2: "アプリが担うこと" },
          {
            list: [
              "アイコンのみのボタンにはすべて `aria-label` を付けてください。",
              "すべてのフォームコントロールにラベルを付けてください。`soneFieldLabel` または `<label for>` を使います。",
              "`<html lang>` を設定し、ルートごとに意味のあるドキュメントタイトルを付けてください。",
              "重要な非同期処理の結果は、トースターやライブリージョンなどで読み上げられるようにしてください。",
            ],
          },
        ],
      },
      i18n: {
        title: "国際化",
        description:
          "組み込みの文字列を翻訳し、あらゆる文字体系をサポートします。",
        blocks: [
          {
            p: "コンポーネント自体が持つテキストはごくわずかで、組み込みの文字列（「閉じる」「もっと見る」「ダウンロード中…」）はすべて `$localize` でマークされています。標準の Angular i18n ワークフローで翻訳してください：",
          },
          { code: "extractI18n" },
          {
            p: "複数形は ICU メッセージを使い、アクティブなロケールの複数形ルールに従います。日付と期間は `Intl` でフォーマットします。",
          },
          { h2: "このサイトの言語" },
          {
            p: "このドキュメントは English、Polski、Español、Italiano、Français、Português、Deutsch、简体中文、日本語で提供しています。IndexOne のウェブサイトと同じ言語です。",
          },
        ],
      },
      mcp: {
        title: "MCP サーバー",
        description:
          "Claude Code、Codex、GitHub Copilot、Cursor、Windsurf から SurfaceOne のドキュメント、API、トークンに直接アクセスできるようにします。",
        blocks: [
          {
            p: "`@surface-one/angular-mcp` は Model Context Protocol サーバーです。AI アシスタントは推測する代わりに、コンポーネントの正確な API、動作するサンプル、ソースとスタイル、ガイド、画面テンプレート、テーマ変数をこのサーバーに問い合わせます。すべてがパッケージに同梱されているため、オフラインでも動作し、常にお使いのバージョンと一致します。",
          },
          { h2: "Claude Code" },
          { code: "mcpClaude" },
          { h2: "Codex" },
          { code: "mcpCodex" },
          { p: "または `~/.codex/config.toml` に追加してください：" },
          { code: "mcpCodexToml" },
          { h2: "VS Code と GitHub Copilot" },
          { p: "プロジェクトに `.vscode/mcp.json` を追加してください：" },
          { code: "mcpVsCode" },
          { h2: "Cursor、Windsurf、Claude Desktop" },
          { code: "mcpJson" },
          { h2: "ツール" },
          {
            list: [
              "`list_components` — すべてのコンポーネントファミリーと、そのエントリーポイントおよびセレクター。",
              "`get_component_docs` — 説明、インポート、動作するサンプル、完全な API。名前、スラッグ、クラス、`soneBtn` のようなセレクターを受け付けます。",
              "`get_component_source_code` と `get_component_source_styles` — 実装コード。",
              "`get_docs` — ガイドページとリリースノート。",
              "`get_theme_variables` — 各スキンのライトモードとダークモードのトークン値。",
              "`list_templates` と `get_template` — 出発点として使える完成済みの画面。",
            ],
          },
          { h2: "質問の例" },
          {
            list: [
              "「SurfaceOne で設定ページを作って。スイッチ、セレクト、保存ボタンを入れて。」",
              "「SurfaceOne のダイアログの API を見せて。」",
              "「Paper スキンはダークモードでどのトークンを使っている？」",
            ],
          },
          {
            note: "サーバーは[エージェントスキル](/guide/skills)と組み合わせて使ってください。スキルはアシスタントに SurfaceOne の扱い方を教え、サーバーは事実を提供します。",
          },
        ],
      },
      skills: {
        title: "エージェントスキル",
        description:
          "Claude Code、OpenAI Codex、GitHub Copilot 向けの SurfaceOne スキルを 1 つのコマンドでインストールします。",
        blocks: [
          {
            p: "エージェントスキルは `SKILL.md` を含むフォルダーで、タスクで必要になったときにアシスタントが読み込みます。Claude Code、Codex、GitHub Copilot は同じ形式を共有しているため、1 つのパッケージで 3 つすべてに対応できます。",
          },
          {
            list: [
              "`surface-one-angular` — コンポーネントを使って画面を構築します。セットアップ、エントリーポイント、`sone-` セレクター、トークン、オーバーレイ、フォームに加え、完全なコンポーネントカタログを含みます。",
              "`surface-one-theming` — スキン、ライト・ダーク・システムモード、アクセントカラー、トークンの上書き、latin-ext フォント。",
              "`surface-one-a11y-review` — SurfaceOne の画面向けの WCAG 2.2 AA チェックリスト。",
            ],
          },
          { h2: "インストール" },
          { code: "skillsAdd" },
          { h2: "配置場所" },
          {
            list: [
              "**Claude Code** — `.claude/skills/`（グローバルでは `~/.claude/skills/`）。",
              "**Codex** — `.agents/skills/`（グローバルでは `~/.agents/skills/`）。",
              "**GitHub Copilot** — `.agents/skills/`（グローバルでは `~/.copilot/skills/`）。",
            ],
          },
          {
            p: "SurfaceOne をアップグレードした後は、`--force` を付けてコマンドを再実行し、スキルを更新してください。",
          },
          {
            note: "[MCP サーバー](/guide/mcp)も追加してください。サーバーが利用可能な場合、スキルはそのツールを使用します。",
          },
        ],
      },
      contributing: {
        title: "コントリビュート",
        description:
          "ブランチ、Conventional Commits、プルリクエスト、コードオーナー。",
        blocks: [
          { p: "SurfaceOne は IndexOne と同じルールに従います。" },
          { h2: "ブランチとコミット" },
          {
            list: [
              "ブランチ名は `<type>/<kebab-slug>` の形式です（例：`feat/sone-calendar`）。",
              "コミットのヘッダーと PR のタイトルは Conventional Commits に従います：`<type>(<scope>): <subject>`。最大 100 文字で、subject は小文字で書きます。",
              "いかなる形式の帰属表示も付けません。AI の共同作成者トレーラーや「generated with」のフッターも不可です。",
            ],
          },
          { code: "commit" },
          { h2: "プルリクエスト" },
          {
            p: "PR の本文はリポジトリのテンプレートに従い、実際の変更ごとに短い 1 行を平易な英語で書きます。すべての PR にはコードオーナーの承認が必要です。",
          },
          { h2: "コンポーネントを追加する" },
          {
            list: [
              "コンポーネント、`index.ts`、`ng-package.json` を含む `packages/angular/<name>/` を作成します。",
              "`sone-` のセレクタープレフィックス、OnPush、シグナル入力を使い、値はトークンのみを使います。",
              "`<name>.stories.ts` を追加し、デモとともにドキュメントのカタログにコンポーネントを登録します。",
            ],
          },
        ],
      },
    },
  },
  theme: {
    title: "テーマ",
    description:
      "SurfaceOne のデザイントークン、スキン、カラーモード、アクセントカラーをライブで確認できます。",
    lead: "このページの値はすべてライブのトークンから読み取っています。コントロールを変更すると、サイト全体が追従します。",
    controls: "テーマのコントロール",
    skin: "スキン",
    mode: "モード",
    accent: "アクセント",
    accentDefault: "スキンの既定値",
    skins: {
      studio: "Studio",
      paper: "Paper",
      minimalist: "Minimalist",
      neumorphism: "Neumorphism",
    },
    accents: {
      blue: "ブルー",
      teal: "ティール",
      green: "グリーン",
      orange: "オレンジ",
      pink: "ピンク",
    },
    sections: {
      colors: "カラーロール",
      colorsLead:
        "セマンティックカラー。コンポーネントはパレットの段階ではなく、これらの名前を使います。",
      chart: "チャートの色",
      chartLead:
        "系列・レーン・ノード種別のための 8 つのカテゴリカラー、5 段階のシーケンシャルスケール、そしてプラス / マイナスの組。どのスキンとモードでも、カードとページの面に対して 3:1 以上を保ちます。",
      palette: "アクセントパレット",
      typography: "タイポグラフィ",
      typographyLead: "すべてのスキンで共通の文字サイズの階層。",
      radius: "角丸",
      spacing: "余白",
      shadows: "影",
      tokens: "すべてのトークン",
      tokensLead:
        "@surface-one/tokens のトークンファイルと、それぞれが宣言するカスタムプロパティ。",
    },
    sample:
      "いろはにほへと ちりぬるを わかよたれそ つねならむ — Zażółć gęślą jaźń",
    reset: "リセット",
  },
  templates: {
    title: "テンプレート",
    description:
      "SurfaceOne のコンポーネントで組み立てた既製の画面：ダッシュボード、AI チャット、設定、議事録、ログインと新規登録、バリデーション付きフォーム、メッセージ、2 つのサイドバーを持つワークスペース、Markdown エディター、メディア、財務、CRM。",
    lead: "パッケージだけで構築した完全な画面です。出発点としてコピーしてお使いください。",
    view: "テンプレートを見る",
    back: "すべてのテンプレート",
    vueMissing: "このテンプレートにはまだ Vue 版がありません。",
    viewport: "表示サイズ",
    devices: {
      desktop: "デスクトップ",
      tablet: "タブレット",
      phone: "スマートフォン",
    },
    items: {
      dashboard: {
        title: "ダッシュボード",
        description:
          "ページヘッダー、統計カード、データテーブルを備えた、サイドバー付きのアプリシェル。",
      },
      chat: {
        title: "AI チャット",
        description:
          "メッセージ、マーカー、サジェスト、コンポーザーを備えたアシスタントのスレッド。",
      },
      settings: {
        title: "設定",
        description:
          "フィールド、スイッチ、選択カード、シークレットを含む、グループ化された環境設定。",
      },
      notes: {
        title: "議事録",
        description:
          "オーディオプレーヤー、文字起こし、レンダリングされたノートを備えた録音。",
      },
      login: {
        title: "ログイン",
        description:
          "Google・Apple・GitHub のボタン、メールとパスワードのフォーム、バリデーション、ログイン状態の保持を備えたサインインカード。",
      },
      signup: {
        title: "新規登録",
        description:
          "SSO、パスワード強度メーター、リアルタイムのパスワード条件、利用規約への同意を備えた分割レイアウトの登録画面。",
      },
      form: {
        title: "フォームのバリデーション",
        description:
          "リアクティブなバリデーション、項目間のルール、各項目へリンクするエラー一覧を備えた複数セクションの長いフォーム。",
      },
      messages: {
        title: "メッセージ",
        description:
          "検索できる会話リスト、吹き出し、入力中インジケーター、入力欄を備えたダイレクトメッセージの受信箱。",
      },
      workspace: {
        title: "2 つのサイドバー",
        description:
          "左に折りたためるナビゲーション、右に詳細サイドバーを配置したタスクのワークスペース。",
      },
      editor: {
        title: "Markdown エディター",
        description:
          "ファイル一覧、書式ツールバー、編集・分割・プレビューの各モード、自動保存を備えたドキュメントエディター。",
      },
      media: {
        title: "メディア",
        description:
          "録音コントロール、録音ライブラリ、オーディオプレーヤー、チャプターのタイムライン、ライブ文字起こしを備えた録音スタジオ。",
      },
      finances: {
        title: "家計・財務",
        description:
          "期間の切り替え、主要指標、キャッシュフローのグラフ、カテゴリ別の支出、予算、口座、取引テーブルを備えた財務の概要。",
      },
      crm: {
        title: "CRM",
        description:
          "商談パイプラインのボード、リスト表示、パイプラインの統計、活動履歴付きの商談詳細パネルを備えた営業 CRM。",
      },
    },
  },
  changelog: {
    title: "変更履歴",
    description:
      "SurfaceOne のすべてのリリースを新しい順に。新しいコンポーネント、修正、互換性のない変更と、各バージョンのリリース日を掲載しています。",
    eyebrow: "変更履歴",
    heading: "SurfaceOne の新機能",
    lead: "デザインシステムのすべてのリリースを新しい順に掲載しています。トークン、Angular コンポーネント、MCP サーバー、スキルは同じバージョンを共有します。",
    npm: "npm からインストール",
    github: "GitHub のすべてのリリース",
    latest: "最新",
    englishNote: "リリースノートは英語で公開しています。",
    versions: "バージョン",
  },
  notFound: {
    title: "ページが見つかりません",
    description: "お探しのページは存在しません。",
    back: "ホームに戻る",
  },
};
