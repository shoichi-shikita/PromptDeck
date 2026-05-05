import { useState } from "react"
import { X, Copy, Check, Clock, Cpu } from "lucide-react"
import type { HistoryEntry } from "../lib/types"
import { findModel } from "../lib/api"
import { formatDateTime } from "../lib/utils"

type Props = {
  entry: HistoryEntry
  onClose: () => void
}

export function HistoryDetailView({ entry, onClose }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const modelInfo = findModel(entry.model)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-medium">{entry.promptTitle}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-3">
              <span className="flex items-center gap-1"><Clock size={10} />{formatDateTime(entry.createdAt)}</span>
              <span className="flex items-center gap-1"><Cpu size={10} />{modelInfo?.label ?? entry.model}</span>
              <span>{(entry.durationMs / 1000).toFixed(1)}秒</span>
            </div>
          </div>
          <button onClick={onClose} className="text-text-3 hover:text-text">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 本体 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* 変数 */}
        {Object.keys(entry.variables).length > 0 && (
          <section>
            <p className="text-[10px] uppercase tracking-wider text-text-3 mb-2">使用した変数</p>
            <div className="space-y-2">
              {Object.entries(entry.variables).map(([k, v]) => (
                <div key={k} className="bg-surface-2 border border-border rounded p-2.5">
                  <div className="text-[11px] text-accent font-mono mb-1">{`{${k}}`}</div>
                  <div className="text-xs text-text whitespace-pre-wrap break-words">{v || <span className="text-text-3">(未入力)</span>}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 送信プロンプト */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-text-3">送信プロンプト</p>
            <button
              onClick={() => copy(entry.finalPrompt, "prompt")}
              className="flex items-center gap-1 text-[10px] text-text-3 hover:text-text"
            >
              {copiedField === "prompt" ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
              コピー
            </button>
          </div>
          <pre className="bg-surface-2 border border-border rounded p-3 text-xs font-mono whitespace-pre-wrap text-text-2 break-words">
            {entry.finalPrompt}
          </pre>
        </section>

        {/* 結果 */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-text-3">結果</p>
            <button
              onClick={() => copy(entry.result, "result")}
              className="flex items-center gap-1 text-[10px] text-text-3 hover:text-text"
            >
              {copiedField === "result" ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
              コピー
            </button>
          </div>
          <pre className="bg-surface-2 border border-border rounded p-3 text-xs whitespace-pre-wrap text-text break-words">
            {entry.result}
          </pre>
        </section>
      </div>
    </div>
  )
}
