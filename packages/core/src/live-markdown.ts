// The live (CodeMirror) markdown surface of packages/angular, re-exported as it is. NOT part
// of the core entry: the Vue and React editors `import()` it only when `live` is on, so
// CodeMirror (an optional peer dependency) loads on demand and never on the server.
export * from "../../angular/markdown/live/live-markdown";
