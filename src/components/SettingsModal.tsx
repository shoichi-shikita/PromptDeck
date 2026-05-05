import { useState, useEffect } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import type { Settings, Provider } from "../lib/types"
import {modelsByProvider } from "../lib/api"

type Props = {
  open: boolean
  onClose: () => void
  settings: Settings
  onSave: (s: Settings) => void
}

const PROVIDER_LABELS: Record<Provider, string> = {
  gemini: "Google Gemini",
  claude: "Anthropic Claude",
  openai: "OpenAI",
}

const PROVIDER_LINKS: Record<Provider, string> = {
  gemini: "https://aistudio.google.com/apikey",
  claude: "https://console.anthropic.com/settings/keys",
  openai: "https://platform.openai.com/api-keys",
}

export function SettingsModal({ open, onClose, settings, onSave }: Props) {
  const [draft, setDraft] = useState<Settings>(settings)
  const [showKey, setShowKey] = useState<Record<Provider, boolean>>({
    gemini: false, claude: false, openai: false,
  })

  useEffect(() => {
    if (open) setDraft(settings)
  }, [open, settings])

  if (!open) return null

  function handleSave() {
    onSave(draft)
    onClose()
  }

  // プロバイダ変更時、デフォルトモデルも合わせる
  function changeProvider(p: Provider) {
    const firstModel = modelsByProvider(p)[0]
    setDraft({ ...draft, defaultProvider: p, defaultModel: firstModel?.id ?? draft.defaultModel })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-surface rounded-lg shadow-2xl border border-border overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium">設定</h2>
          <button onClick={onClose} className="text-text-3 hover:text-text">
            <X size={18} />
          </button>
        </div>

        {/* 本体 */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* APIキー */}
          <section>
            <h3 className="text-sm font-medium mb-3">APIキー</h3>
            <div className="space-y-3">
              {(Object.keys(PROVIDER_LABELS) as Provider[]).map(p => (
                <div key={p}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-text-2">{PROVIDER_LABELS[p]}</label>
                    <a
                      href={PROVIDER_LINKS[p]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-accent hover:underline"
                    >
                      キーを取得 →
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type={showKey[p] ? "text" : "password"}
                      value={draft.apiKeys[p]}
                      onChange={e => setDraft({
                        ...draft,
                        apiKeys: { ...draft.apiKeys, [p]: e.target.value }
                      })}
                      placeholder={`${PROVIDER_LABELS[p]} API key`}
                      className="flex-1 bg-surface-2 border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent font-mono"
                    />
                    <button
                      onClick={() => setShowKey(s => ({ ...s, [p]: !s[p] }))}
                      className="p-2 text-text-3 hover:text-text"
                    >
                      {showKey[p] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* デフォルトモデル */}
          <section>
            <h3 className="text-sm font-medium mb-3">デフォルトモデル</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-2 mb-1.5 block">プロバイダ</label>
                <select
                  value={draft.defaultProvider}
                  onChange={e => changeProvider(e.target.value as Provider)}
                  className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent text-text"
                >
                  {(Object.keys(PROVIDER_LABELS) as Provider[]).map(p => (
                    <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-2 mb-1.5 block">モデル</label>
                <select
                  value={draft.defaultModel}
                  onChange={e => setDraft({ ...draft, defaultModel: e.target.value })}
                  className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent text-text"
                >
                  {modelsByProvider(draft.defaultProvider).map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* テーマ */}
          <section>
            <h3 className="text-sm font-medium mb-3">外観</h3>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setDraft({ ...draft, theme: t })}
                  className={`flex-1 py-2 px-4 rounded text-sm transition-colors ${
                    draft.theme === t
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-text-2 hover:bg-surface-3"
                  }`}
                >
                  {t === "dark" ? "ダーク" : "ライト"}
                </button>
              ))}
            </div>
          </section>

          {/* 注意書き */}
          <section className="text-[11px] text-text-3 leading-relaxed bg-surface-2 rounded p-3">
            APIキーはブラウザのlocalStorageにのみ保存されます。サーバーには送信されません。
            ただし共有PCでの利用時は注意してください。
          </section>
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm text-text-2 hover:bg-surface-2"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-accent hover:bg-accent-hover text-white text-sm font-medium"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
