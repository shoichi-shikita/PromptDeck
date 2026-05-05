import { Search, Plus, Star, Trash2, History, FileText, Tag } from "lucide-react"
import type { Prompt, HistoryEntry } from "../lib/types"
import { formatDate } from "../lib/utils"

type Tab = "prompts" | "history"

type Props = {
  tab: Tab
  setTab: (t: Tab) => void
  prompts: Prompt[]
  history: HistoryEntry[]
  selectedId: string | null
  selectedHistoryId: string | null
  onSelectPrompt: (id: string) => void
  onSelectHistory: (h: HistoryEntry) => void
  onNew: () => void
  onDeletePrompt: (id: string) => void
  onStarPrompt: (id: string) => void
  onDeleteHistory: (id: string) => void
  search: string
  setSearch: (v: string) => void
  activeTag: string | null
  setActiveTag: (t: string | null) => void
  showStarred: boolean
  setShowStarred: (v: boolean) => void
}

export function Sidebar(p: Props) {
  // タグ集計
  const tagCount = new Map<string, number>()
  p.prompts.forEach(pr => pr.tags.forEach(t => tagCount.set(t, (tagCount.get(t) ?? 0) + 1)))
  const allTags = [...tagCount.entries()].sort((a, b) => b[1] - a[1])

  // フィルタリング
  const q = p.search.toLowerCase()
  const filteredPrompts = p.prompts.filter(pr => {
    if (p.showStarred && !pr.starred) return false
    if (p.activeTag && !pr.tags.includes(p.activeTag)) return false
    if (q && !(
      pr.title.toLowerCase().includes(q) ||
      pr.content.toLowerCase().includes(q) ||
      pr.tags.some(t => t.toLowerCase().includes(q))
    )) return false
    return true
  })

  const filteredHistory = p.history.filter(h => {
    if (q && !(
      h.promptTitle.toLowerCase().includes(q) ||
      h.result.toLowerCase().includes(q) ||
      h.finalPrompt.toLowerCase().includes(q)
    )) return false
    return true
  })

  return (
    <aside className="w-72 flex flex-col border-r border-border bg-surface-1 shrink-0">
      {/* ロゴ + 検索 */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-serif italic">
            Prompt<span className="text-accent">Deck</span>
          </h1>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-3 font-mono">⌘K</kbd>
        </div>
        <div className="flex items-center gap-2 bg-surface-2 rounded px-2.5 py-1.5">
          <Search size={13} className="text-text-3" />
          <input
            value={p.search}
            onChange={e => p.setSearch(e.target.value)}
            placeholder="検索..."
            className="bg-transparent text-xs outline-none flex-1 placeholder:text-text-3"
          />
        </div>
      </div>

      {/* タブ */}
      <div className="flex border-b border-border">
        <button
          onClick={() => p.setTab("prompts")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${
            p.tab === "prompts"
              ? "text-text border-b-2 border-accent -mb-px"
              : "text-text-3 hover:text-text-2"
          }`}
        >
          <FileText size={11} />プロンプト
          <span className="text-[10px] text-text-3">{p.prompts.length}</span>
        </button>
        <button
          onClick={() => p.setTab("history")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${
            p.tab === "history"
              ? "text-text border-b-2 border-accent -mb-px"
              : "text-text-3 hover:text-text-2"
          }`}
        >
          <History size={11} />履歴
          <span className="text-[10px] text-text-3">{p.history.length}</span>
        </button>
      </div>

      {/* タグフィルタ（プロンプトタブのみ） */}
      {p.tab === "prompts" && allTags.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => p.setShowStarred(!p.showStarred)}
              className={`text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 transition-colors ${
                p.showStarred
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-text-2 hover:bg-surface-3"
              }`}
            >
              <Star size={9} className={p.showStarred ? "fill-white" : ""} />
              スター
            </button>
            {allTags.slice(0, 8).map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => p.setActiveTag(p.activeTag === tag ? null : tag)}
                className={`text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 transition-colors ${
                  p.activeTag === tag
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-text-2 hover:bg-surface-3"
                }`}
              >
                <Tag size={9} />{tag}
                <span className="opacity-60">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* リスト */}
      <div className="flex-1 overflow-y-auto p-2">
        {p.tab === "prompts" && (
          <>
            {filteredPrompts.length === 0 && (
              <p className="text-text-3 text-xs text-center mt-8">
                {p.prompts.length === 0 ? "プロンプトがありません" : "該当する項目がありません"}
              </p>
            )}
            {filteredPrompts.map(pr => (
              <div
                key={pr.id}
                onClick={() => p.onSelectPrompt(pr.id)}
                className={`group p-2.5 rounded cursor-pointer mb-1 transition-colors ${
                  p.selectedId === pr.id ? "bg-surface-2" : "hover:bg-surface-2/60"
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="text-xs font-medium truncate flex-1 text-text">{pr.title}</span>
                  <div className="flex items-center gap-1.5">
                    {pr.starred && (
                      <Star size={10} className="text-accent fill-accent shrink-0" />
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); p.onStarPrompt(pr.id) }}
                        className="text-text-3 hover:text-accent"
                      >
                        <Star size={11} className={pr.starred ? "fill-accent text-accent" : ""} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); p.onDeletePrompt(pr.id) }}
                        className="text-text-3 hover:text-red-400"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
                {pr.tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {pr.tags.map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-3">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-text-3 mt-1.5">{formatDate(pr.updatedAt)}</div>
              </div>
            ))}
          </>
        )}

        {p.tab === "history" && (
          <>
            {filteredHistory.length === 0 && (
              <p className="text-text-3 text-xs text-center mt-8">
                {p.history.length === 0 ? "履歴がありません" : "該当する項目がありません"}
              </p>
            )}
            {filteredHistory.map(h => (
              <div
                key={h.id}
                onClick={() => p.onSelectHistory(h)}
                className={`group p-2.5 rounded cursor-pointer mb-1 transition-colors ${
                  p.selectedHistoryId === h.id ? "bg-surface-2" : "hover:bg-surface-2/60"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-medium truncate flex-1 text-text">{h.promptTitle}</span>
                  <button
                    onClick={e => { e.stopPropagation(); p.onDeleteHistory(h.id) }}
                    className="text-text-3 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
                <p className="text-[10px] text-text-3 mt-1 line-clamp-2 break-all">
                  {h.result.slice(0, 80)}
                </p>
                <div className="text-[10px] text-text-3 mt-1.5">{formatDate(h.createdAt)}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 新規ボタン */}
      <div className="p-3 border-t border-border">
        <button
          onClick={p.onNew}
          className="w-full flex items-center justify-center gap-2 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
        >
          <Plus size={13} />
          新しいプロンプト
          <kbd className="text-[10px] px-1 py-0 rounded bg-white/20 ml-1">⌘N</kbd>
        </button>
      </div>
    </aside>
  )
}
