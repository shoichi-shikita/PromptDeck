// プロンプト1個分
export type Prompt = {
  id: string
  title: string
  content: string
  tags: string[]
  starred: boolean
  createdAt: number
  updatedAt: number
  versions: PromptVersion[] // バージョン履歴
}

// プロンプトの過去バージョン
export type PromptVersion = {
  content: string
  savedAt: number
}

// 実行履歴1件
export type HistoryEntry = {
  id: string
  promptId: string
  promptTitle: string
  finalPrompt: string
  result: string
  provider: Provider
  model: string
  variables: Record<string, string>
  createdAt: number
  durationMs: number
}

// プロバイダ
export type Provider = "gemini" | "claude" | "openai"

// 設定
export type Settings = {
  apiKeys: {
    gemini: string
    claude: string
    openai: string
  }
  defaultProvider: Provider
  defaultModel: string
  theme: "dark" | "light"
}

// モデル一覧
export type ModelOption = {
  id: string
  label: string
  provider: Provider
}
