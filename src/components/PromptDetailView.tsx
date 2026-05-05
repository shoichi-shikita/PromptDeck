import { useState, useEffect } from "react"
import { Copy, Edit3, Star, Play, ChevronDown, Check } from "lucide-react"
import type { Prompt, Provider, Settings, HistoryEntry } from "../lib/types"
import { extractVariables, buildFinalPrompt, MODELS, modelsByProvider, runPrompt, findModel } from "../lib/api"
import { generateId } from "../lib/utils"

type Props = {
  prompt: Prompt
  settings: Settings
  onEdit: () => void
  onStar: () => void
  onAddHistory: (h: HistoryEntry) => void
}

export function PromptDetailView({ prompt, settings, onEdit, onStar, onAddHistory }: Props) {
  const [provider, setProvider] = useState<Provider>(settings.defaultProvider)
  const [model, setModel] = useState(settings.defaultModel)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [result, setResult] = useState("")
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [resultCopied, setResultCopied] = useState(false)

  const vars = extractVariables(prompt.content)

  // プロンプトが変わったら変数とモデルをリセット
  useEffect(() => {
    const init: Record<string, string> = {}
    vars.forEach(v => { init[v] = "" })
    setVariables(init)
    setResult("")
    setError("")
    setProvider(settings.defaultProvider)
    setModel(settings.defaultModel)
  }, [prompt.id])

  // プロバイダ変えたらモデルも合わせる
  function changeProvider(p: Provider) {
    setProvider(p)
    const first = modelsByProvider(p)[0]
    if (first) setModel(first.id)
  }

  function handleCopy(text: string, isResult = false) {
    navigator.clipboard.writeText(text)
    if (isResult) {
      setResultCopied(true)
      setTimeout(() => setResultCopied(false), 1500)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  async function handleRun() {
    setRunning(true)
    setResult("")
    setError("")
    const startTs = Date.now()
    try {
      const apiKey = settings.apiKeys[provider]
      const finalPrompt = buildFinalPrompt(prompt.content, variables)
      const text = await runPrompt(provider, apiKey, model, finalPrompt)
      setResult(text)
      onAddHistory({
        id: generateId(),
        promptId: prompt.id,
        promptTitle: prompt.title,
        finalPrompt,
        result: text,
        provider,
        model,
        variables: { ...variables },
        createdAt: Date.now(),
        durationMs: Date.now() - startTs,
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden">

      {/* 中央: プロンプト本体 */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-base font-medium text-text">{prompt.title}</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={onStar}
                className={`p-2 rounded hover:bg-surface-2 transition-colors ${
                  prompt.starred ? "text-accent" : "text-text-3 hover:text-text"
                }`}
                title="スター"
              >
                <Star size={14} className={prompt.starred ? "fill-accent" : ""} />
              </button>
              <button
                onClick={() => handleCopy(prompt.content)}
                className="p-2 rounded text-text-3 hover:text-text hover:bg-surface-2 transition-colors"
                title="コピー"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button
                onClick={onEdit}
                className="p-2 rounded text-text-3 hover:text-text hover:bg-surface-2 transition-colors"
                title="編集"
              >
                <Edit3 size={14} />
              </button>
            </div>
          </div>
          {prompt.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {prompt.tags.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-2">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 本体 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-surface-2 rounded-md p-4 border border-border">
            <pre className="text-sm font-mono whitespace-pre-wrap text-text break-words">
              {prompt.content.split(/(\{[^}]+\})/).map((part, i) =>
                part.match(/^\{[^}]+\}$/)
                  ? <span key={i} className="text-accent font-medium bg-accent/10 rounded px-0.5">{part}</span>
                  : <span key={i}>{part}</span>
              )}
            </pre>
          </div>
        </div>
      </div>

      {/* 右: 実行パネル */}
      <div className="w-80 flex flex-col bg-surface-1 shrink-0">
        {/* プロバイダ + モデル */}
        <div className="p-4 border-b border-border space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-3 mb-1.5 block">プロバイダ</label>
            <div className="grid grid-cols-3 gap-1">
              {(["gemini", "claude", "openai"] as Provider[]).map(p => (
                <button
                  key={p}
                  onClick={() => changeProvider(p)}
                  className={`py-1.5 rounded text-[11px] font-medium transition-colors ${
                    provider === p
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-text-2 hover:bg-surface-3"
                  }`}
                >
                  {p === "gemini" ? "Gemini" : p === "claude" ? "Claude" : "OpenAI"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-3 mb-1.5 block">モデル</label>
            <div className="relative">
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-xs outline-none focus:border-accent text-text appearance-none pr-8"
              >
                {modelsByProvider(provider).map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 変数 */}
        <div className="flex-1 overflow-y-auto p-4">
          {vars.length > 0 ? (
            <>
              <p className="text-[10px] uppercase tracking-wider text-text-3 mb-3">変数</p>
              <div className="space-y-3">
                {vars.map(v => (
                  <div key={v}>
                    <label className="text-xs text-accent mb-1 block font-mono">{`{${v}}`}</label>
                    <textarea
                      value={variables[v] ?? ""}
                      onChange={e => setVariables(prev => ({ ...prev, [v]: e.target.value }))}
                      placeholder={v}
                      rows={2}
                      className="w-full bg-surface-2 border border-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-accent resize-y text-text placeholder:text-text-3"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-text-3">変数なし</p>
          )}

          {/* 結果 */}
          {(running || error || result) && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider text-text-3">結果</p>
                {result && (
                  <button
                    onClick={() => handleCopy(result, true)}
                    className="flex items-center gap-1 text-[10px] text-text-3 hover:text-text"
                  >
                    {resultCopied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                    {resultCopied ? "コピー完了" : "コピー"}
                  </button>
                )}
              </div>
              {running && (
                <div className="text-xs text-accent flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                  生成中...
                </div>
              )}
              {error && (
                <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded p-3">
                  {error}
                </div>
              )}
              {result && !running && (
                <div className="bg-surface-2 border border-border rounded p-3 max-h-80 overflow-y-auto">
                  <pre className="text-xs text-text whitespace-pre-wrap break-words">{result}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 実行ボタン */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleRun}
            disabled={running || !settings.apiKeys[provider]}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            <Play size={13} />
            {running ? "実行中..." : "実行"}
            <kbd className="text-[10px] px-1 py-0 rounded bg-white/20 ml-1">⌘↵</kbd>
          </button>
          {!settings.apiKeys[provider] && (
            <p className="text-[10px] text-red-400 mt-2 text-center">
              {provider} のAPIキーを設定してください
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
