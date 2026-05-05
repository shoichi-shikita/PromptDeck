import { useEffect } from "react"

type Shortcut = {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  handler: (e: KeyboardEvent) => void
}

export function useShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      for (const s of shortcuts) {
        const ctrlOk = s.ctrl ? (e.ctrlKey || e.metaKey) : true
        const metaOk = s.meta ? e.metaKey : true
        const shiftOk = s.shift !== undefined ? e.shiftKey === s.shift : true
        if (e.key.toLowerCase() === s.key.toLowerCase() && ctrlOk && metaOk && shiftOk) {
          s.handler(e)
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [shortcuts])
}
