import type { Provider, ModelOption } from "./types"

export const MODELS: ModelOption[] = [
  // Gemini
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "gemini" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "gemini" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "gemini" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", provider: "gemini" },
  // Claude
  { id: "claude-opus-4-5", label: "Claude Opus 4.5", provider: "claude" },
  { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5", provider: "claude" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", provider: "claude" },
  // OpenAI
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "openai" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "openai" },
]

export function modelsByProvider(provider: Provider): ModelOption[] {
  return MODELS.filter(m => m.provider === provider)
}

export function findModel(id: string): ModelOption | undefined {
  return MODELS.find(m => m.id === id)
}

// --- 変数抽出 ---
export function extractVariables(content: string): string[] {
  const matches = content.match(/\{([^}]+)\}/g) ?? []
  return [...new Set(matches.map(m => m.slice(1, -1).trim()))]
}

export function buildFinalPrompt(content: string, variables: Record<string, string>): string {
  let text = content
  Object.entries(variables).forEach(([k, v]) => {
    text = text.replaceAll(`{${k}}`, v || `{${k}}`)
  })
  return text
}

// --- Gemini ---
async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Geminiエラー (${res.status})`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

// --- Claude ---
async function callClaude(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Claudeエラー (${res.status})`)
  }
  const data = await res.json()
  return data.content?.[0]?.text ?? ""
}

// --- OpenAI ---
async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `OpenAIエラー (${res.status})`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

export async function runPrompt(
  provider: Provider,
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  if (!apiKey.trim()) throw new Error(`${provider} のAPIキーが設定されていません`)
  switch (provider) {
    case "gemini":
      return callGemini(apiKey, model, prompt)
    case "claude":
      return callClaude(apiKey, model, prompt)
    case "openai":
      return callOpenAI(apiKey, model, prompt)
  }
}
