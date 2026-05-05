import type { Prompt, HistoryEntry, Settings } from "./types"

const KEYS = {
  prompts: "promptdeck_prompts_v2",
  history: "promptdeck_history_v2",
  settings: "promptdeck_settings_v2",
} as const

// --- 汎用 ---
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Prompts ---
export function loadPrompts(): Prompt[] {
  return load<Prompt[]>(KEYS.prompts, [])
}
export function savePrompts(prompts: Prompt[]) {
  save(KEYS.prompts, prompts)
}

// --- History ---
export function loadHistory(): HistoryEntry[] {
  return load<HistoryEntry[]>(KEYS.history, [])
}
export function saveHistory(history: HistoryEntry[]) {
  save(KEYS.history, history)
}

// --- Settings ---
export const DEFAULT_SETTINGS: Settings = {
  apiKeys: { gemini: "", claude: "", openai: "" },
  defaultProvider: "gemini",
  defaultModel: "gemini-2.5-flash",
  theme: "dark",
}
export function loadSettings(): Settings {
  const s = load<Settings>(KEYS.settings, DEFAULT_SETTINGS)
  // 旧キーからの自動移行
  const legacyKey = localStorage.getItem("promptdeck_gemini_key")
  if (legacyKey && !s.apiKeys.gemini) {
    s.apiKeys.gemini = legacyKey
  }
  return { ...DEFAULT_SETTINGS, ...s, apiKeys: { ...DEFAULT_SETTINGS.apiKeys, ...s.apiKeys } }
}
export function saveSettings(settings: Settings) {
  save(KEYS.settings, settings)
}

// --- Export / Import ---
export function exportData() {
  return {
    version: 2,
    exportedAt: Date.now(),
    prompts: loadPrompts(),
    history: loadHistory(),
  }
}

export function importData(data: { prompts?: Prompt[]; history?: HistoryEntry[] }, mode: "merge" | "replace") {
  if (mode === "replace") {
    if (data.prompts) savePrompts(data.prompts)
    if (data.history) saveHistory(data.history)
  } else {
    if (data.prompts) {
      const existing = loadPrompts()
      const existingIds = new Set(existing.map(p => p.id))
      const merged = [...existing, ...data.prompts.filter(p => !existingIds.has(p.id))]
      savePrompts(merged)
    }
    if (data.history) {
      const existing = loadHistory()
      const existingIds = new Set(existing.map(h => h.id))
      const merged = [...existing, ...data.history.filter(h => !existingIds.has(h.id))]
      saveHistory(merged)
    }
  }
}
