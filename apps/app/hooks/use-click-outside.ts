import { type RefObject, useEffect, useRef } from "react";

/**
 * Calls `onOutside` when a pointer event occurs outside `ref.current`.
 * Uses capture phase so it runs before elements that stop propagation.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  enabled = true,
) {
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: PointerEvent) => {
      const node = ref.current;
      if (!node || node.contains(event.target as Node)) return;
      onOutsideRef.current();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [ref, enabled]);
}
