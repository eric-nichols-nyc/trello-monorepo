import { type RefObject, useEffect, useRef } from "react";

function targetIsInsideIgnoredSubtree(
  target: Node,
  ignores: readonly RefObject<HTMLElement | null>[] | undefined,
): boolean {
  if (!ignores) {
    return false;
  }
  for (const ignoreRef of ignores) {
    if (ignoreRef.current?.contains(target)) {
      return true;
    }
  }
  return false;
}

/**
 * Calls `onOutside` when a pointer event occurs outside `ref.current`.
 * Uses capture phase so it runs before elements that stop propagation.
 *
 * `ignoreRefs` — elements that count as “inside” (e.g. a trigger next to a portaled panel)
 * so toggling the trigger does not close then immediately reopen.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  enabled = true,
  ignoreRefs?: readonly RefObject<HTMLElement | null>[],
) {
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;
  const ignoreRefsRef = useRef(ignoreRefs);
  ignoreRefsRef.current = ignoreRefs;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const node = ref.current;
      const target = event.target as Node;
      if (!node || node.contains(target)) {
        return;
      }
      if (targetIsInsideIgnoredSubtree(target, ignoreRefsRef.current)) {
        return;
      }
      onOutsideRef.current();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [ref, enabled]);
}
