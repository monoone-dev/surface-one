// Lets `node --test` run the library's TypeScript sources directly (Node strips the
// types): the sources import siblings without an extension, as ng-packagr expects,
// so an extensionless relative specifier is retried as `<path>.ts` and `<path>/index.ts`.
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (!specifier.startsWith(".") || /\.[cm]?[jt]s$/.test(specifier)) {
        throw error;
      }
      try {
        return next(`${specifier}.ts`, context);
      } catch {
        return next(`${specifier}/index.ts`, context);
      }
    }
  },
});
