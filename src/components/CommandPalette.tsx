import { useState, useEffect, useRef } from "react"
import { Search, FileText, Plus, Settings, Download, Upload, Sun, Moon, History } from "lucide-react"
import type { Prompt } from "../lib/types"

type Command = {
  id: string
  label: string
  hint?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
}

type Props = {
  open: boolean
  onClose: () => void
  prompts: Prompt[]
  onSelectPrompt: (id: string) => void
  onNewPrompt: () => void
  onOpenSettings: () => void
  onExport: () => void
  onImport: () => void
  onToggleTheme: () => void
  onOpenHistory: () => void
  theme: "dark" | "light"
}

export function CommandPalette({
  open, onClose, prompts, onSelectPrompt, onNewPrompt,
  onOpenSettings, onExport, onImport, onToggleTheme, onOpenHistory, theme,
}: Props) {
  const [query, setQuery] = useState("")
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQuery("")
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // 全コマンド
  const actions: Command[] = [
    {
      id: "new",
      label: "新規プロンプトを作成",
      hint: "Ctrl+N",
      icon: <Plus size={14} />,
      action: () => { onNewPrompt(); onClose() },
      keywords: ["new", "create", "add", "新規", "作成"],
    },
    {
      id: "history",
      label: "実行履歴を開く",
      icon: <History size={14} />,
      action: () => { onOpenHistory(); onClose() },
      keywords: ["history", "履歴"],
    },
    {
      id: "settings",
      label: "設定を開く",
      hint: "Ctrl+,",
      icon: <Settings size={14} />,
      action: () => { onOpenSettings(); onClose() },
      keywords: ["settings", "config", "設定"],
    },
    {
      id: "export",
      label: "データをエクスポート",
      icon: <Download size={14} />,
      action: () => { onExport(); onClose() },
      keywords: ["export", "download", "backup", "エクスポート"],
    },
    {
      id: "import",
      label: "データをインポート",
      icon: <Upload size={14} />,
      action: () => { onImport(); onClose() },
      keywords: ["import", "restore", "インポート"],
    },
    {
      id: "theme",
      label: theme === "dark" ? "ライトテーマに切り替え" : "ダークテーマに切り替え",
      icon: theme === "dark" ? <Sun size={14} /> : <Moon size={14} />,
      action: () => { onToggleTheme(); onClose() },
      keywords: ["theme", "dark", "light", "テーマ"],
    },
  ]

  const promptCommands: Command[] = prompts.map(p => ({
    id: `prompt:${p.id}`,
    label: p.title,
    hint: p.tags.join(", "),
    icon: <FileText size={14} />,
    action: () => { onSelectPrompt(p.id); onClose() },
    keywords: [p.title, ...p.tags, p.content.slice(0, 50)],
  }))

  const allCommands = [...actions, ...promptCommands]

  // フィルタ
  const q = query.toLowerCase().trim()
  const filtered = q
    ? allCommands.filter(c => {
        const text = (c.label + " " + (c.keywords?.join(" ") ?? "")).toLowerCase()
        return text.includes(q)
      })
    : allCommands

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      filtered[activeIdx]?.action()
    }
  }

  // アクティブ要素を可視範囲にスクロール
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIdx])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface rounded-lg shadow-2xl border border-border overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search size={16} className="text-text-2" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="コマンドやプロンプトを検索..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-text-3"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-3 font-mono">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="text-sm text-text-3 text-center py-8">該当する項目がありません</p>
          )}
          {filtered.map((c, i) => (
            <button
              key={c.id}
              data-idx={i}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={c.action}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                i === activeIdx ? "bg-surface-2 text-text" : "text-text-2 hover:bg-surface-2/50"
              }`}
            >
              <span className="text-text-3">{c.icon}</span>
              <span className="text-sm flex-1 truncate">{c.label}</span>
              {c.hint && (
                <span className="text-[10px] text-text-3 font-mono">{c.hint}</span>
              )}
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-[10px] text-text-3">
          <span><kbd className="px-1 bg-surface-2 rounded font-mono">↑↓</kbd> 移動</span>
          <span><kbd className="px-1 bg-surface-2 rounded font-mono">↵</kbd> 選択</span>
          <span><kbd className="px-1 bg-surface-2 rounded font-mono">ESC</kbd> 閉じる</span>
        </div>
      </div>
    </div>
  )
}
