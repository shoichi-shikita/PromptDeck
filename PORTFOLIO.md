# ポートフォリオ更新ガイド

shoichi.studio に PromptDeck を追加する方法です。  
ポートフォリオは "brutalist editorial" 風のダークテーマだったので、その配色・構成に揃えてあります。

---

## 🎯 ステップ1：PromptDeckのスクショを撮る

1. `npm run dev` でローカル起動 or デプロイ後のVercel URLを開く
2. メインの画面（プロンプト選択時、変数入力 + 結果表示）を撮影
3. リサイズして 1600x900 くらいの横長JPGに（画質80%程度）
4. ファイル名: `promptdeck-cover.jpg`
5. shoichi.studioの `assets/` か `images/` フォルダに配置

---

## 🎯 ステップ2：ポートフォリオに作品セクションを追加

`index.html` の作品紹介セクション（bento gridの中など）に以下を追加：

```html
<!-- PromptDeck作品カード -->
<article class="work-card">
  <a href="https://promptdeck.vercel.app" target="_blank" rel="noopener">
    <div class="work-cover">
      <img src="assets/promptdeck-cover.jpg" alt="PromptDeck screenshot" loading="lazy" />
      <div class="work-overlay">
        <span class="work-cta">View live →</span>
      </div>
    </div>
    <div class="work-meta">
      <h3 class="work-title">PromptDeck</h3>
      <p class="work-desc">
        Browser-based AI prompt management tool with multi-provider execution
        (Gemini / Claude / OpenAI), version history, and command palette.
      </p>
      <div class="work-tags">
        <span>React</span>
        <span>TypeScript</span>
        <span>Vite</span>
        <span>Tailwind</span>
      </div>
      <div class="work-links">
        <a href="https://promptdeck.vercel.app" target="_blank">Live</a>
        <span class="dot">·</span>
        <a href="https://github.com/USERNAME/promptdeck" target="_blank">Source</a>
      </div>
    </div>
  </a>
</article>
```

`USERNAME` の部分を実際のGitHubユーザー名に置き換えてください。

---

## 🎯 ステップ3：CSSを追加（既にある場合はスキップ）

既存のbentoグリッドのスタイルがあればそれを使い回してOKですが、もし新規に作るなら以下を `style.css` などに追加：

```css
.work-card {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  transition: transform .3s ease, border-color .3s ease;
}
.work-card:hover {
  transform: translateY(-4px);
  border-color: #b88a8e; /* PromptDeckのテーマ色（モーヴ）と揃える */
}
.work-card a {
  color: inherit;
  text-decoration: none;
  display: block;
}

.work-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.work-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .5s ease;
}
.work-card:hover .work-cover img {
  transform: scale(1.03);
}

.work-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 16px;
  background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%);
  opacity: 0;
  transition: opacity .3s ease;
}
.work-card:hover .work-overlay {
  opacity: 1;
}
.work-cta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #b88a8e;
  letter-spacing: .08em;
}

.work-meta {
  padding: 20px 24px 24px;
}
.work-title {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 8px;
  color: #ededea;
}
.work-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #a8a89e;
  margin: 0 0 14px;
}
.work-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.work-tags span {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: .04em;
  color: #66665d;
  background: #1a1a1a;
  padding: 3px 8px;
  border-radius: 99px;
  border: 0.5px solid #2a2a26;
}
.work-links {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}
.work-links a {
  color: #b88a8e;
  text-decoration: none;
  transition: color .2s;
}
.work-links a:hover {
  color: #c89a9e;
  text-decoration: underline;
}
.work-links .dot {
  color: #444;
}
```

---

## 🎯 ステップ4：英語版テキスト（必要なら）

shoichi.studioが英語ベースだと思うので、descはこれをそのまま使えます：

> Browser-based AI prompt management tool with multi-provider execution (Gemini / Claude / OpenAI), version history, and command palette.

日本語にしたい場合：

> Gemini / Claude / OpenAIに対応したブラウザ完結のプロンプト管理ツール。バージョン履歴とコマンドパレット搭載。

---

## 🎯 ステップ5：デプロイして確認

ポートフォリオが既にデプロイされてれば、変更をpushすれば反映されます。

---

## 完成イメージ

ポートフォリオに作品が並ぶ感じ：

```
┌──────────────────┐  ┌──────────────────┐
│  shoichi.studio  │  │   PromptDeck     │  ← New!
│  ──────────────  │  │  ────────────    │
│  Personal site   │  │  AI prompt mgmt  │
│  React + Vite    │  │  React + Vite    │
└──────────────────┘  └──────────────────┘
```

---

## 仕上げのアイデア（オプション）

- **OGP画像** — TwitterやSlackで共有したときに表示される画像。`docs/og.png` を作って `<meta property="og:image">` を設定
- **GitHubリポジトリのSocial Preview** — リポジトリのSettings → Social previewで設定できる
- **デモGIF** — 操作の様子を録画してREADMEに貼ると伝わりやすい（[Loom](https://loom.com) や [Kap](https://getkap.co) で簡単）
