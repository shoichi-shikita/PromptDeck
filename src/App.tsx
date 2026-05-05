import { useState, useEffect, useMemo } from "react"
import { Plus, Settings as SettingsIcon, Command } from "lucide-react"
import type { Prompt, HistoryEntry, Settings } from "./lib/types"
import {
  loadPrompts, savePrompts,
  loadHistory, saveHistory,
  loadSettings, saveSettings,
  exportData, importData,
} from "./lib/storage"
import { generateId, getSamplePrompts } from "./lib/utils"
import { Sidebar } from "./components/Sidebar"
import { PromptDetailView } from "./components/PromptDetailView"
import { PromptEditView } from "./components/PromptEditView"
import { HistoryDetailView } from "./components/HistoryDetailView"
import { CommandPalette } from "./components/CommandPalette"
import { SettingsModal } from "./components/SettingsModal"
import { useShortcuts } from "./hooks/useShortcuts"

type Tab = "prompts" | "history"
type View = "detail" | "edit" | "history" | "empty"

export default function App() {
  // データ
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const loaded = loadPrompts()
    if (loaded.length === 0) {
      const samples = getSamplePrompts()
      savePrompts(samples)
      return samples
    }
    return loaded
  })
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [settings, setSettings] = useState<Settings>(loadSettings)

  // UI状態
  const [tab, setTab] = useState<Tab>("prompts")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [view, setView] = useState<View>("empty")
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showStarred, setShowStarred] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // 初回 - 最初のプロンプトを選択
  useEffect(() => {
    if (prompts.length > 0 && !selectedId) {
      setSelectedId(prompts[0].id)
      setView("detail")
    }
  }, [])

  // 永続化
  useEffect(() => { savePrompts(prompts) }, [prompts])
  useEffect(() => { saveHistory(history) }, [history])
  useEffect(() => { saveSettings(settings) }, [settings])

  // テーマ適用
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  const selected = useMemo(
    () => prompts.find(p => p.id === selectedId) ?? null,
    [prompts, selectedId]
  )
  const selectedHistory = useMemo(
    () => history.find(h => h.id === selectedHistoryId) ?? null,
    [history, selectedHistoryId]
  )

  // --- ハンドラ ---
  function handleSelectPrompt(id: string) {
    setSelectedId(id)
    setSelectedHistoryId(null)
    setView("detail")
  }

  function handleSelectHistory(h: HistoryEntry) {
    setSelectedHistoryId(h.id)
    setSelectedId(null)
    setView("history")
  }

  function handleNewPrompt() {
    setSelectedId(null)
    setSelectedHistoryId(null)
    setView("edit")
  }

  function handleEditPrompt() {
    setView("edit")
  }

  function handleSavePrompt(data: { title: string; content: string; tags: string[] }) {
    const now = Date.now()
    if (selected) {
      // 更新（現行内容が違っていたらバージョン履歴に追加）
      const versionAdded = selected.content !== data.content
      const newVersions = versionAdded
        ? [...selected.versions, { content: selected.content, savedAt: selected.updatedAt }].slice(-20)
        : selected.versions
      setPrompts(prev => prev.map(p =>
        p.id === selected.id
          ? { ...p, ...data, updatedAt: now, versions: newVersions }
          : p
      ))
      setView("detail")
    } else {
      // 新規
      const np: Prompt = {
        id: generateId(),
        ...data,
        starred: false,
        createdAt: now,
        updatedAt: now,
        versions: [],
      }
      setPrompts(prev => [np, ...prev])
      setSelectedId(np.id)
      setView("detail")
    }
  }

  function handleDeletePrompt(id: string) {
    if (!confirm("このプロンプトを削除しますか？")) return
    setPrompts(prev => prev.filter(p => p.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
      setView("empty")
    }
  }

  function handleStarPrompt(id: string) {
    setPrompts(prev => prev.map(p =>
      p.id === id ? { ...p, starred: !p.starred } : p
    ))
  }

  function handleDeleteHistory(id: string) {
    setHistory(prev => prev.filter(h => h.id !== id))
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null)
      setView("empty")
    }
  }

  function handleAddHistory(h: HistoryEntry) {
    setHistory(prev => [h, ...prev].slice(0, 200))
  }

  // export / import
  function handleExport() {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `promptdeck-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,application/json"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        const mode = confirm("OK: 既存データに追加 / Cancel: 既存データを置き換え")
          ? "merge" : "replace"
        importData(data, mode)
        setPrompts(loadPrompts())
        setHistory(loadHistory())
        alert(`インポート完了 (${mode === "merge" ? "追加" : "置き換え"})`)
      } catch (e) {
        alert("インポートに失敗しました: " + (e instanceof Error ? e.message : String(e)))
      }
    }
    input.click()
  }

  function toggleTheme() {
    setSettings(s => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))
  }

  // ショートカット
  useShortcuts([
    {
      key: "k", ctrl: true,
      handler: e => {
        e.preventDefault()
        setPaletteOpen(v => !v)
      },
    },
    {
      key: "n", ctrl: true,
      handler: e => {
        // テキスト入力中のCtrl+NはOSに任せる
        const t = e.target as HTMLElement
        if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return
        e.preventDefault()
        handleNewPrompt()
      },
    },
    {
      key: ",", ctrl: true,
      handler: e => {
        e.preventDefault()
        setSettingsOpen(true)
      },
    },
    {
      key: "Escape",
      handler: () => {
        if (paletteOpen) setPaletteOpen(false)
        else if (settingsOpen) setSettingsOpen(false)
      },
    },
  ])

  return (
    <div className="h-screen flex flex-col bg-bg text-text font-sans overflow-hidden">

      {/* トップバー */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-1 shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-text-3">
          <span className="hidden sm:inline">プロンプト管理 + AI実行</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs text-text-2 hover:bg-surface-2 transition-colors"
            title="コマンドパレット"
          >
            <Command size={12} />
            <span className="hidden sm:inline">コマンド</span>
            <kbd className="text-[10px] px-1 py-0 rounded bg-surface-2 font-mono">⌘K</kbd>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded text-text-3 hover:text-text hover:bg-surface-2 transition-colors"
            title="設定"
          >
            <SettingsIcon size={14} />
          </button>
        </div>
      </header>

      {/* 本体 */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          tab={tab}
          setTab={setTab}
          prompts={prompts}
          history={history}
          selectedId={selectedId}
          selectedHistoryId={selectedHistoryId}
          onSelectPrompt={handleSelectPrompt}
          onSelectHistory={handleSelectHistory}
          onNew={handleNewPrompt}
          onDeletePrompt={handleDeletePrompt}
          onStarPrompt={handleStarPrompt}
          onDeleteHistory={handleDeleteHistory}
          search={search}
          setSearch={setSearch}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
          showStarred={showStarred}
          setShowStarred={setShowStarred}
        />

        <main className="flex-1 flex overflow-hidden">
          {view === "edit" && (
            <PromptEditView
              prompt={selected}
              onSave={handleSavePrompt}
              onCancel={() => setView(selected ? "detail" : "empty")}
            />
          )}

          {view === "detail" && selected && (
            <PromptDetailView
              prompt={selected}
              settings={settings}
              onEdit={handleEditPrompt}
              onStar={() => handleStarPrompt(selected.id)}
              onAddHistory={handleAddHistory}
            />
          )}

          {view === "history" && selectedHistory && (
            <HistoryDetailView
              entry={selectedHistory}
              onClose={() => { setSelectedHistoryId(null); setView("empty") }}
            />
          )}

          {view === "empty" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-serif italic mb-2 text-text">
                  Prompt<span className="text-accent">Deck</span>
                </h3>
                <p className="text-text-3 text-sm mb-6">プロンプトを選ぶか、新しく作成してください</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleNewPrompt}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
                  >
                    <Plus size={13} />新しいプロンプト
                  </button>
                  <button
                    onClick={() => setPaletteOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-surface-2 hover:bg-surface-3 text-text-2 text-xs transition-colors"
                  >
                    <Command size={12} />コマンドパレット
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* モーダル類 */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        prompts={prompts}
        onSelectPrompt={handleSelectPrompt}
        onNewPrompt={handleNewPrompt}
        onOpenSettings={() => setSettingsOpen(true)}
        onExport={handleExport}
        onImport={handleImport}
        onToggleTheme={toggleTheme}
        onOpenHistory={() => { setTab("history") }}
        theme={settings.theme}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={s => setSettings(s)}
      />
    </div>
  )
}
