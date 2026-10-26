<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from "vue";
import {
  SoneButton,
  SoneChatAttachment,
  SoneChatComposer,
  SoneChatComposerInput,
  SoneChatComposerSubmit,
  SoneChatMessage,
  SoneChatMessageContent,
  SoneChatPane,
  SoneChatPaneActions,
  SoneChatPaneDescription,
  SoneChatPaneHeader,
  SoneChatPaneHeading,
  SoneChatPaneTitle,
  SoneMark,
  SoneChatThread,
  SoneIcon,
  SoneSuggestionChips,
  SoneTypingIndicator,
  type SoneChatThreadExposed,
} from "@surface-one/vue";

interface Turn {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const OPENING: readonly Turn[] = [
  {
    id: 1,
    role: "user",
    content: "What did Ada and Leo decide about the onboarding checklist?",
  },
  {
    id: 2,
    role: "assistant",
    content:
      "They agreed to cut the checklist from twelve steps to five and to ship the shorter version behind a feature flag first. Leo owns the rollout.",
  },
];

const starters = ["Summarize the key decisions", "What are my action items?"];
const turns = ref<readonly Turn[]>(OPENING);
const draft = ref("");
const pending = ref(false);
const attached = ref(true);
const thread = ref<SoneChatThreadExposed | null>(null);
let nextId = OPENING.length + 1;
let reply: ReturnType<typeof setTimeout> | undefined;

async function append(role: Turn["role"], content: string) {
  turns.value = [...turns.value, { id: nextId++, role, content }];
  await nextTick();
  thread.value?.scrollToEnd();
}

function send(text: string) {
  const question = text.trim();
  if (!question || pending.value) return;
  draft.value = "";
  void append("user", question);
  pending.value = true;
  // A canned reply stands in for the model; only ever runs after a user action.
  reply = setTimeout(() => {
    pending.value = false;
    void append(
      "assistant",
      "This is a demo, so here is a canned answer: the next review is on Friday.",
    );
  }, 1200);
}

function reset() {
  clearTimeout(reply);
  turns.value = OPENING;
  pending.value = false;
  attached.value = true;
}

onBeforeUnmount(() => clearTimeout(reply));
</script>

<template>
  <SoneChatPane style="max-width: 560px; width: 100%">
    <SoneChatPaneHeader>
      <SoneChatPaneHeading>
        <SoneChatPaneTitle>Ask about this meeting</SoneChatPaneTitle>
        <SoneChatPaneDescription>Answers use the planning meeting transcript</SoneChatPaneDescription>
      </SoneChatPaneHeading>
      <SoneChatPaneActions>
        <SoneButton type="button" variant="ghost" size="sm" @click="reset">
          <SoneIcon icon="plus" /><span>New</span>
        </SoneButton>
      </SoneChatPaneActions>
    </SoneChatPaneHeader>
    <SoneChatThread ref="thread" style="max-height: 360px">
      <SoneChatMessage v-for="turn in turns" :key="turn.id" :from="turn.role">
        <SoneChatMessageContent>{{ turn.content }}</SoneChatMessageContent>
      </SoneChatMessage>
      <SoneChatMessage v-if="pending" from="assistant"><SoneTypingIndicator /></SoneChatMessage>
    </SoneChatThread>
    <SoneSuggestionChips :suggestions="starters" :disabled="pending" @picked="send" />
    <SoneChatComposer @submitted="send(draft)">
      <SoneChatAttachment
        v-if="attached"
        title="Planning meeting"
        url="meetings.example.com/planning"
        removable
        @remove="attached = false"
      >
        <SoneMark icon="meetings" tone="lagoon" />
      </SoneChatAttachment>
      <SoneChatComposerInput
        v-model="draft"
        rows="1"
        aria-label="Your question"
        placeholder="Ask about this meeting…"
        :disabled="pending"
      />
      <SoneChatComposerSubmit :pending="pending" :disabled="pending || !draft.trim()" />
    </SoneChatComposer>
  </SoneChatPane>
</template>
