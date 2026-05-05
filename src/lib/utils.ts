import type { Prompt } from "./types"

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts
  if (diff < 60_000) return "たった今"
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}分前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}時間前`
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}日前`
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" })
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("ja-JP", {
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// 初回起動時のサンプル
export function getSamplePrompts(): Prompt[] {
  const now = Date.now()
  return [
    {
      id: generateId(),
      title: "ブログ記事の構成案",
      content: "あなたはプロのブログライターです。\n\n{テーマ}についてのブログ記事の構成案を作成してください。\n\n対象読者: {読者層}\n目的: {目的}\n\n以下の形式で出力してください:\n- タイトル案 (3つ)\n- 導入文\n- 見出し構成 (h2, h3)\n- まとめの方向性",
      tags: ["ライティング", "ブログ"],
      starred: true,
      createdAt: now - 1000,
      updatedAt: now - 1000,
      versions: [],
    },
    {
      id: generateId(),
      title: "コードレビュー",
      content: "以下のコードをレビューしてください。\n\n```\n{コード}\n```\n\n観点:\n- バグの可能性\n- パフォーマンス\n- 可読性\n- ベストプラクティス\n\n改善提案があれば修正版コードも提示してください。",
      tags: ["開発", "コードレビュー"],
      starred: false,
      createdAt: now - 2000,
      updatedAt: now - 2000,
      versions: [],
    },
    {
      id: generateId(),
      title: "SNS投稿文の生成",
      content: "{プロダクト}を{プラットフォーム}向けに宣伝する投稿文を{個数}パターン作成してください。\n\nトーン: {トーン}\n含めるキーワード: {キーワード}\n\nそれぞれ違う切り口で、エンゲージメントを意識した内容にしてください。",
      tags: ["マーケティング", "SNS"],
      starred: false,
      createdAt: now - 3000,
      updatedAt: now - 3000,
      versions: [],
    },
    {
      id: generateId(),
      title: "翻訳 (英→日)",
      content: "以下の英文を自然な日本語に翻訳してください。直訳ではなく、文脈に合った言い回しで。\n\n---\n{原文}\n---\n\n注意:\n- 専門用語は適切な訳語を選ぶ\n- カジュアル/フォーマルは原文に合わせる\n- 不自然な表現は意訳でOK",
      tags: ["翻訳"],
      starred: false,
      createdAt: now - 4000,
      updatedAt: now - 4000,
      versions: [],
    },
  ]
}
