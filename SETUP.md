# PromptDeck 完成版 セットアップ手順

## 1. ファイル配置

以下のフォルダ構造になるよう、配布したファイルを `PromptDeck/` フォルダに配置してください。
**既存ファイルは上書きでOK**です。

```
PromptDeck/
├── tailwind.config.js     ← 上書き
└── src/
    ├── App.tsx            ← 上書き
    ├── index.css          ← 上書き
    ├── lib/               ← 新規フォルダ
    │   ├── types.ts
    │   ├── storage.ts
    │   ├── api.ts
    │   └── utils.ts
    ├── hooks/             ← 新規フォルダ
    │   └── useShortcuts.ts
    └── components/        ← 新規フォルダ
        ├── Sidebar.tsx
        ├── PromptDetailView.tsx
        ├── PromptEditView.tsx
        ├── PromptEditor.tsx
        ├── HistoryDetailView.tsx
        ├── CommandPalette.tsx
        └── SettingsModal.tsx
```

## 2. 起動

```bash
cd ~/Desktop/PromptDeck   # フォルダに移動
npm run dev               # 起動
```

ブラウザで http://localhost:5173/ にアクセス。

---

## 3. 機能一覧

### 基本機能
- ✅ プロンプトの作成・編集・削除
- ✅ お気に入り（スター）
- ✅ タグ付け＆タグフィルタ
- ✅ 検索（タイトル・本文・タグ・履歴）
- ✅ localStorageに自動保存

### 変数システム
- `{変数名}` 形式で記述すると自動検出
- 右パネルで変数の値を入力
- エディタ内で変数がハイライト表示

### マルチプロバイダAPI実行
- Google Gemini (Gemini 2.5 Flash / Pro / 2.0 Flash等)
- Anthropic Claude (Opus 4.5 / Sonnet 4.5 / Haiku 4.5)
- OpenAI (GPT-4o / GPT-4o mini / GPT-4 Turbo)

### 実行履歴
- 過去の実行を最大200件保存
- 使用したモデル・変数・実行時間を記録
- 履歴詳細から再確認可能

### バージョン履歴
- プロンプト編集時に過去バージョンを自動保存（最大20件）
- 編集画面の「バージョン履歴」から復元可能

### コマンドパレット (⌘K / Ctrl+K)
- すべての操作にキーボードでアクセス
- プロンプトを検索して即座に開く
- ↑↓で移動、Enterで実行

### import / export
- JSON形式でデータをエクスポート
- 別マシンからインポート可能
- マージ or 置き換えを選択

### テーマ切り替え
- ダーク / ライト
- 設定画面 or コマンドパレットから

### キーボードショートカット
| 操作 | ショートカット |
|---|---|
| コマンドパレット | `Ctrl + K` (Win) / `⌘ + K` (Mac) |
| 新規プロンプト | `Ctrl + N` |
| 設定を開く | `Ctrl + ,` |
| モーダル閉じる | `Esc` |

---

## 4. APIキーの設定

1. 右上の歯車アイコン or `Ctrl + ,` で設定を開く
2. 各プロバイダのAPIキーを入力
3. 「キーを取得 →」リンクから直接APIキー発行ページへ

| プロバイダ | キー取得先 |
|---|---|
| Gemini | https://aistudio.google.com/apikey |
| Claude | https://console.anthropic.com/settings/keys |
| OpenAI | https://platform.openai.com/api-keys |

APIキーは**ブラウザのlocalStorageにのみ保存**されます。サーバーには送信されません。

---

## 5. もし動かなかったら

### 真っ白画面 / エラーが出る場合
- F12（DevTools）でConsoleを開いてエラーメッセージを確認
- 大抵は `npm install` で依存関係を再インストールすれば直る

### 既存のデータが消えてないか心配
- 既存のlocalStorageキー名と異なる新しいキー (`promptdeck_prompts_v2`) を使うので、
  旧バージョンのデータは残ったままです
- 旧データは初回起動時に「Geminiキーのみ」自動で引き継がれます
- 旧プロンプトを使いたい場合はexport→importで取り込んでください
