import { useEffect, useRef, useState } from "react";
import {
  SoneButton,
  SoneIcon,
  SoneTerminal,
  SoneTerminalDivider,
  SoneTerminalLine,
  SoneTerminalLog,
  SoneTerminalPrompt,
  SoneTerminalPromptInput,
  SoneTerminalStatus,
  type AgentState,
} from "@surface-one/react";

interface Sent {
  id: number;
  from: "user" | "agent";
  kind: "message" | "activity";
  text: string;
  glyph?: string;
  meta?: string;
}

const started = Date.UTC(2026, 9, 17, 12, 47, 0);
const at = (step: number) => started + step * 9000;

export default function TerminalDemo() {
  const [open, setOpen] = useState(true);
  const [sent, setSent] = useState<Sent[]>([]);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<AgentState>("done");
  const [since, setSince] = useState<number | null>(null);
  const [doing, setDoing] = useState("");
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const add = (entry: Omit<Sent, "id">) => {
    const id = nextId.current++;
    setSent((all) => [...all, { ...entry, id }]);
  };

  const finish = (next: AgentState) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setState(next);
    setSince(null);
    setDoing("");
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    add({ from: "user", kind: "message", text });
    setState("working");
    setSince(Date.now());
    setDoing("Reading the cart tests");
    // A canned run stands in for the agent; it only ever starts after a user action.
    timers.current.push(
      setTimeout(() => {
        add({ from: "agent", kind: "activity", glyph: "$", text: "Ran npm test -- cart", meta: "ok · 2s" });
        setDoing("Writing the answer");
      }, 1600),
      setTimeout(() => {
        add({
          from: "agent",
          kind: "message",
          text: "This is a demo, so here is a canned answer: the cart suite is green.",
        });
        finish("done");
      }, 3400),
    );
  };

  return (
    <SoneTerminal style={{ height: "560px", width: "100%" }}>
      <SoneTerminalLog>
        <SoneTerminalDivider time={at(0)}>Run started · fix-flaky-tests</SoneTerminalDivider>
        <SoneTerminalLine from="user" to="Lead" time={at(1)}>
          The checkout tests fail about once in ten runs. Find out why and fix it.
        </SoneTerminalLine>
        <SoneTerminalLine speaker="Lead" hue={3} time={at(2)}>
          On it. I'll rerun the suite to catch the failure first.
        </SoneTerminalLine>
        <SoneTerminalLine
          kind="activity"
          speaker="Lead"
          hue={3}
          glyph="$"
          tone="danger"
          time={at(3)}
          meta={
            <SoneButton
              type="button"
              variant="outline"
              size="icon-xs"
              aria-expanded={open}
              aria-label={open ? "Hide output" : "Show output"}
              onClick={() => setOpen(!open)}
            >
              {open ? "−" : "+"}
            </SoneButton>
          }
          detail={
            open ? (
              <pre>
                {"Exit code 1\n✕ checkout › applies the discount once (2 of 20 runs)\n    expected 90, received 81\n    at discount.spec.ts:42:18"}
              </pre>
            ) : undefined
          }
        >
          Ran npm test -- checkout --repeat 20 --reporter=verbose --coverage=false --bail=false
        </SoneTerminalLine>
        <SoneTerminalLine kind="activity" speaker="Explore" hue={5} time={at(4)}>
          Read 2 files
        </SoneTerminalLine>
        <SoneTerminalLine
          kind="activity"
          speaker="Lead"
          hue={3}
          time={at(5)}
          meta={
            <span>
              <ins>+3</ins> <del>−1</del>
            </span>
          }
        >
          Edited src/checkout/discount.ts
        </SoneTerminalLine>
        <SoneTerminalLine kind="activity" speaker="Lead" hue={3} glyph="$" time={at(6)} meta={<span>ok · 41s</span>}>
          Ran npm test -- checkout --repeat 20
        </SoneTerminalLine>
        <SoneTerminalLine speaker="Lead" hue={3} time={at(7)}>
          <p>
            <strong>Fixed: the discount was applied twice.</strong>
          </p>
          <ul>
            <li>
              <code>applyDiscount()</code> ran in a promise nobody awaited, so a slow run applied it again.
            </li>
            <li>
              It is awaited now, and <code>discount.spec.ts</code> covers the slow path.
            </li>
          </ul>
          <p>20 of 20 runs pass. Shall I look at the cart tests next?</p>
        </SoneTerminalLine>
        <SoneTerminalDivider tone="success" time={at(8)}>
          Done · 6 turns · 1m 12s
        </SoneTerminalDivider>
        {sent.map((e) => (
          <SoneTerminalLine
            key={e.id}
            from={e.from}
            kind={e.kind}
            glyph={e.glyph ?? null}
            speaker={e.from === "user" ? null : "Lead"}
            to={e.from === "user" ? "Lead" : null}
            hue={3}
            time={at(9 + e.id)}
            meta={e.meta ? <span>{e.meta}</span> : undefined}
          >
            {e.text}
          </SoneTerminalLine>
        ))}
      </SoneTerminalLog>
      <SoneTerminalStatus
        state={state}
        speaker="Lead"
        hue={3}
        since={since}
        actions={
          state === "working" ? (
            <SoneButton type="button" variant="ghost" size="icon-sm" aria-label="Interrupt" onClick={() => finish("idle")}>
              <SoneIcon icon="square" />
            </SoneButton>
          ) : undefined
        }
      >
        {doing}
      </SoneTerminalStatus>
      <SoneTerminalPrompt
        onSubmitted={send}
        actions={
          <SoneButton type="submit" size="icon-sm" aria-label="Send" disabled={!draft.trim()}>
            <SoneIcon icon="arrow-up" />
          </SoneButton>
        }
      >
        <SoneTerminalPromptInput
          placeholder="Message the lead…"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </SoneTerminalPrompt>
    </SoneTerminal>
  );
}
