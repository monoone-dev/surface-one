<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import {
  SoneButton,
  SoneAgentChat,
  SoneAgentChatDivider,
  SoneAgentChatMessage,
  SoneAgentChatLog,
  SoneAgentChatComposer,
  SoneAgentChatComposerInput,
  SoneAgentChatStatus,
  type AgentState,
} from "@surface-one/vue";

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
const output =
  "Exit code 1\n✕ checkout › applies the discount once (2 of 20 runs)\n    expected 90, received 81\n    at discount.spec.ts:42:18";

const open = ref(true);
const sent = ref<Sent[]>([]);
const draft = ref("");
const state = ref<AgentState>("done");
const since = ref<number | null>(null);
const doing = ref("");
let nextId = 1;
let timers: ReturnType<typeof setTimeout>[] = [];

function add(entry: Omit<Sent, "id">): void {
  sent.value = [...sent.value, { ...entry, id: nextId++ }];
}

function finish(next: AgentState): void {
  timers.forEach(clearTimeout);
  timers = [];
  state.value = next;
  since.value = null;
  doing.value = "";
}

function send(): void {
  const text = draft.value.trim();
  if (!text) return;
  draft.value = "";
  add({ from: "user", kind: "message", text });
  state.value = "working";
  since.value = Date.now();
  doing.value = "Reading the cart tests";
  // A canned run stands in for the agent; it only ever starts after a user action.
  timers.push(
    setTimeout(() => {
      add({ from: "agent", kind: "activity", glyph: "$", text: "Ran npm test -- cart", meta: "ok · 2s" });
      doing.value = "Writing the answer";
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
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<template>
  <SoneAgentChat style="height: 560px; width: 100%">
    <SoneAgentChatLog>
      <SoneAgentChatDivider :time="at(0)">Run started · fix-flaky-tests</SoneAgentChatDivider>
      <SoneAgentChatMessage from="user" to="Lead" :time="at(1)">
        The checkout tests fail about once in ten runs. Find out why and fix it.
      </SoneAgentChatMessage>
      <SoneAgentChatMessage speaker="Lead" :hue="3" :time="at(2)">
        On it. I'll rerun the suite to catch the failure first.
      </SoneAgentChatMessage>
      <SoneAgentChatMessage kind="activity" speaker="Lead" :hue="3" glyph="$" tone="danger" :time="at(3)">
        Ran npm test -- checkout --repeat 20 --reporter=verbose --coverage=false --bail=false
        <template #meta>
          <SoneButton
            type="button"
            variant="outline"
            size="icon-xs"
            :aria-expanded="open"
            :aria-label="open ? 'Hide output' : 'Show output'"
            @click="open = !open"
          >
            {{ open ? "−" : "+" }}
          </SoneButton>
        </template>
        <template v-if="open" #detail><pre>{{ output }}</pre></template>
      </SoneAgentChatMessage>
      <SoneAgentChatMessage kind="activity" speaker="Explore" :hue="5" :time="at(4)">Read 2 files</SoneAgentChatMessage>
      <SoneAgentChatMessage kind="activity" speaker="Lead" :hue="3" :time="at(5)">
        Edited src/checkout/discount.ts
        <template #meta><span><ins>+3</ins> <del>−1</del></span></template>
      </SoneAgentChatMessage>
      <SoneAgentChatMessage kind="activity" speaker="Lead" :hue="3" glyph="$" :time="at(6)">
        Ran npm test -- checkout --repeat 20
        <template #meta><span>ok · 41s</span></template>
      </SoneAgentChatMessage>
      <SoneAgentChatMessage speaker="Lead" :hue="3" :time="at(7)">
        <p><strong>Fixed: the discount was applied twice.</strong></p>
        <ul>
          <li><code>applyDiscount()</code> ran in a promise nobody awaited, so a slow run applied it again.</li>
          <li>It is awaited now, and <code>discount.spec.ts</code> covers the slow path.</li>
        </ul>
        <p>20 of 20 runs pass. Shall I look at the cart tests next?</p>
      </SoneAgentChatMessage>
      <SoneAgentChatDivider tone="success" :time="at(8)">Done · 6 turns · 1m 12s</SoneAgentChatDivider>
      <SoneAgentChatMessage
        v-for="e in sent"
        :key="e.id"
        :from="e.from"
        :kind="e.kind"
        :glyph="e.glyph ?? null"
        :speaker="e.from === 'user' ? null : 'Lead'"
        :to="e.from === 'user' ? 'Lead' : null"
        :hue="3"
        :time="at(9 + e.id)"
      >
        {{ e.text }}
        <template v-if="e.meta" #meta><span>{{ e.meta }}</span></template>
      </SoneAgentChatMessage>
    </SoneAgentChatLog>
    <SoneAgentChatStatus :state="state" speaker="Lead" :hue="3" :since="since">
      {{ doing }}
      <template v-if="state === 'working'" #actions>
        <SoneButton type="button" variant="outline" size="sm" @click="finish('idle')">
          Interrupt
        </SoneButton>
      </template>
    </SoneAgentChatStatus>
    <SoneAgentChatComposer @submitted="send">
      <SoneAgentChatComposerInput v-model="draft" placeholder="Message the lead…" />
      <template #actions>
        <SoneButton type="submit" size="sm" :disabled="!draft.trim()">Send</SoneButton>
      </template>
    </SoneAgentChatComposer>
  </SoneAgentChat>
</template>
