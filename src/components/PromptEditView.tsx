import { useState, useEffect } from "react"
import { X, Check, Clock, RotateCcw } from "lucide-react"
import type { Prompt, PromptVersion } from "../lib/types"
import { PromptEditor } from "./PromptEditor"
import { formatDateTime } from "../lib/utils"

type Props = {
  prompt: Prompt | null // null なら新規
  onSave: (data: { title: string; content: string; tags: string[] }) => void
  onCancel: () => void
  onRestoreVersion?: (version: PromptVersion) => void
}

export function PromptEditView({ prompt, onSave, onCancel, onRestoreVersion }: Props) {
  const [title, setTitle] = useState(prompt?.title ?? "")
  const [content, setContent] = useState(prompt?.content ?? "")
  const [tagsInput, setTagsInput] = useState(prompt?.tags.join(", ") ?? "")
  const [showVersions, setShowVersions] = useState(false)

  useEffect(() => {
    setTitle(prompt?.title ?? "")
    setContent(prompt?.content ?? "")
    setTagsInput(prompt?.tags.join(", ") ?? "")
  }, [prompt])

  function handleSave() {
    if (!title.trim()) return
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean)
    onSave({ title: title.trim(), content, tags })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-sm font-medium">
          {prompt ? "プロンプトを編集" : "新しいプロンプト"}
        </h2>
        <div className="flex items-center gap-2">
          {prompt && prompt.versions.length > 0 && (
            <button
              onClick={() => setShowVersions(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-text-2 hover:bg-surface-2 transition-colors"
            >
              <Clock size={12} />
              バージョン履歴
              <span className="text-[10px] text-text-3">({prompt.versions.length})</span>
            </button>
          )}
          <button
            onClick={onCancel}
            className="text-text-3 hover:text-text"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* バージョン履歴ドロワー */}
      {showVersions && prompt && (
        <div className="border-b border-border bg-surface-1 px-6 py-3 max-h-48 overflow-y-auto">
          <p className="text-xs text-text-3 mb-2">過去のバージョン (新しい順)</p>
          <div className="space-y-1.5">
            {prompt.versions.slice().reverse().map((v, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded bg-surface-2 hover:bg-surface-3 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-text-3 mb-1">{formatDateTime(v.savedAt)}</div>
                  <pre className="text-xs text-text-2 line-clamp-2 font-mono whitespace-pre-wrap break-all">
                    {v.content.slice(0, 200)}
                  </pre>
                </div>
                <button
                  onClick={() => {
                    setContent(v.content)
                    onRestoreVersion?.(v)
                    setShowVersions(false)
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-surface-3 hover:bg-accent hover:text-white text-[10px] text-text-2 transition-colors shrink-0"
                >
                  <RotateCcw size={9} />
                  復元
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* フォーム */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-4">
          <div>
            <label className="text-xs text-text-2 mb-1.5 block">タイトル</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例: ブログ記事の構成案"
              className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-text-2">内容</label>
              <span className="text-[10px] text-text-3">
                変数は <code className="px-1 py-0.5 rounded bg-surface-2 text-accent font-mono">{"{変数名}"}</code> の形式
              </span>
            </div>
            <PromptEditor
              value={content}
              onChange={setContent}
              placeholder="あなたは{役割}の専門家です。{テーマ}について教えてください。"
              rows={14}
            />
          </div>

          <div>
            <label className="text-xs text-text-2 mb-1.5 block">タグ（カンマ区切り）</label>
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="例: マーケティング, SEO"
              className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
            >
              <Check size={12} />保存
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-surface-2 hover:bg-surface-3 text-text-2 text-xs transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
