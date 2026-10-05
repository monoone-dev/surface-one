/** `?raw` imports resolve to the file's source text (see `webpackFinal` in main.ts). */
declare module "*.css?raw" {
  const source: string;
  export default source;
}

/** The theme layers (`packages/tokens/src/themes/*.theme.scss`) are read the same way. */
declare module "*.scss?raw" {
  const source: string;
  export default source;
}
