import { ref, watch, type Ref } from "vue";

/**
 * A prop that works both bound (`v-model:open="x"`) and unbound: the component keeps a
 * local copy, follows the prop when the owner changes it and emits `update:<name>`
 * when it changes itself.
 */
export function useModel<T>(
  read: () => T,
  emit: (value: T) => void,
): Ref<T> & { set(value: T): void } {
  const local = ref(read()) as Ref<T>;
  watch(read, (value) => (local.value = value));
  return Object.assign(local, {
    set(value: T): void {
      local.value = value;
      emit(value);
    },
  });
}
