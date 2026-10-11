/**
 * The API reference of each entry point (`npm run docs:api` → `api/<slug>.json`), loaded
 * lazily: only `/components/<slug>` fetches its own record, in the route resolver, so the
 * home page, the catalogue and the navigation never carry the API tables.
 */
import { API_LOADERS } from "./api/index.generated";

export { SYMBOL_COUNT } from "./api/index.generated";

export interface ApiInput {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly required: boolean;
  readonly model?: boolean;
  readonly description: string;
}

export interface ApiOutput {
  readonly name: string;
  readonly type: string;
  readonly description: string;
}

export interface ApiSymbol {
  readonly name: string;
  readonly kind: "component" | "directive" | "pipe";
  readonly selector: string;
  readonly exportAs: string;
  readonly description: string;
  readonly file: string;
  readonly inputs: readonly ApiInput[];
  readonly outputs: readonly ApiOutput[];
}

export interface ApiEntry {
  readonly import: string;
  readonly symbols: readonly ApiSymbol[];
  readonly stories: readonly { title: string; id: string }[];
}

export async function loadApi(slug: string): Promise<ApiEntry | null> {
  const load = API_LOADERS[slug];
  return load ? ((await load()).default as ApiEntry) : null;
}
