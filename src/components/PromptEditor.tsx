import { useEffect, useRef } from "react"

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}

// 変数{xxx}部分にハイライトを付けるエディタ
// （divの背景レイヤーで色をつけて、その上に透明なtextareaを重ねる）
export function PromptEditor({ value, onChange, placeholder, rows = 12 }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // スクロール同期
  function handleScroll() {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  useEffect(() => {
    handleScroll()
  }, [value])

  // ハイライト付きHTML生成
  function buildHighlight(text: string): string {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\{([^}]+)\}/g, '<span class="text-accent font-medium bg-accent/10 rounded px-0.5">{$1}</span>')
    return escaped + "\n"
  }

  return (
    <div className="relative bg-surface-2 border border-border rounded-md overflow-hidden focus-within:border-accent transition-colors">
      <div
        ref={highlightRef}
        className="absolute inset-0 px-3 py-2.5 text-sm font-mono whitespace-pre-wrap overflow-auto pointer-events-none break-words text-text"
        aria-hidden
        dangerouslySetInnerHTML={{ __html: buildHighlight(value) }}
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
        className="relative w-full bg-transparent px-3 py-2.5 text-sm font-mono outline-none resize-none placeholder:text-text-3"
        style={{ color: "transparent", caretColor: "var(--ink)" }}
      />
    </div>
  )
}
