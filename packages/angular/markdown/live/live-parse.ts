import type { EditorState, Transaction } from "@codemirror/state";
import { ensureSyntaxTree, syntaxTree } from "@codemirror/language";
import type { Tree } from "@lezer/common";

export const BULK_PARSE_MS = 200;
const EDIT_PARSE_MS = 20;
const BULK_INSERT_CHARS = 1_000;

function isBulkEdit(tr: Transaction): boolean {
  if (tr.isUserEvent("input.paste") || tr.isUserEvent("input.drop")) {
    return true;
  }
  let inserted = 0;
  tr.changes.iterChanges((_fromA, _toA, _fromB, _toB, text) => {
    inserted += text.length;
  });
  return inserted >= BULK_INSERT_CHARS;
}

export function parseBudget(transactions: readonly Transaction[]): number {
  return transactions.some(isBulkEdit) ? BULK_PARSE_MS : EDIT_PARSE_MS;
}

// The background parser only covers what fit its time slice, so decorating from `syntaxTree`
// alone leaves the tail of a long paste raw until idle; parse the needed range up front.
export function parsedTree(
  state: EditorState,
  upto: number,
  budgetMs: number,
): Tree {
  return ensureSyntaxTree(state, upto, budgetMs) ?? syntaxTree(state);
}
