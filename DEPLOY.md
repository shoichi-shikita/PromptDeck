# デプロイ手順ガイド

PromptDeck を **GitHub に上げて Vercel でデプロイ** する手順です。
全部で20分くらいで終わります。

---

## 0. 事前準備

- [ ] GitHubアカウント作成済み（https://github.com）
- [ ] Vercelアカウント（GitHubで連携できるので未作成でOK）
- [ ] PCにGitがインストール済み（https://git-scm.com/downloads）

---

## 1. ファイル更新

配布物を `PromptDeck/` フォルダに展開して上書き：

```
PromptDeck/
├── README.md            ← 新規
├── LICENSE              ← 新規
├── .gitignore           ← 新規（既にあれば上書き）
└── src/
    ├── App.tsx                          ← 上書き
    ├── lib/
    │   ├── types.ts                     ← 上書き
    │   ├── storage.ts                   ← 上書き
    │   └── api.ts                       ← 上書き
    └── components/
        ├── PromptDetailView.tsx         ← 上書き
        └── SettingsModal.tsx            ← 上書き
```

---

## 2. ローカル動作確認

```bash
cd ~/Desktop/PromptDeck
npm run dev
```

ブラウザで以下を確認：
- [ ] ストリーミング表示が動く（結果が少しずつ流れる）
- [ ] プロンプト詳細の右上に「複製」アイコン（コピーアイコン2つ目）が出る
- [ ] 変数を入力すると右パネルに「プリセット」セクションが出る
- [ ] 設定モーダルで「ストリーミング表示」のスイッチがある

OKならビルドも通るか確認：
```bash
npm run build
```

エラーが出なければ次へ。

---

## 3. GitHubに公開

### a. GitHubで新しいリポジトリを作成

1. https://github.com/new を開く
2. **Repository name**: `promptdeck`
3. **Description**: `Browser-based AI prompt management & execution tool`
4. **Public** を選択（ポートフォリオに載せるため）
5. ⚠️ **「Add a README」「Add .gitignore」「Add license」は全部チェックしない**（既に作ってあるので衝突する）
6. **Create repository** をクリック

### b. ローカルからpush

PromptDeckフォルダで以下を実行：

```bash
# 初期化
git init
git add .
git commit -m "Initial commit: PromptDeck v1.0"

# GitHubに接続（USERNAMEは自分のユーザー名に置き換え）
git branch -M main
git remote add origin https://github.com/USERNAME/promptdeck.git
git push -u origin main
```

初回pushでログインを求められたら：
- ブラウザが開いて認証 → そのまま進める
- もしくは個人アクセストークン (PAT) を使う

### c. ブラウザでGitHubのリポジトリを開いて、ファイルが上がってるか確認

---

## 4. Vercelにデプロイ

### a. Vercelにサインアップ

1. https://vercel.com/signup を開く
2. **Continue with GitHub** をクリック
3. 権限を承認

### b. プロジェクトをインポート

1. Vercelダッシュボードで **Add New → Project**
2. GitHubのリポジトリ一覧から **promptdeck** を **Import**
3. 設定画面：
   - **Framework Preset**: `Vite`（自動検出されるはず）
   - **Root Directory**: そのまま
   - **Build Command**: `npm run build`（自動）
   - **Output Directory**: `dist`（自動）
4. **Deploy** をクリック

### c. 30秒〜1分待つ

ビルドが終わると🎉が表示され、URLが発行される：
- `https://promptdeck-xxxx.vercel.app/`

ブラウザで開いて動作確認！

### d. （オプション）カスタムドメイン

`promptdeck.shoichi.studio` みたいに自分のドメインで使いたい場合：

1. Vercelプロジェクト → **Settings → Domains**
2. ドメイン追加 → DNSレコードを設定（指示に従う）

---

## 5. ポートフォリオ（shoichi.studio）に追加

ポートフォリオに以下のような形で追加できます。
別途 `portfolio-update.md` で具体的なHTMLスニペットを共有します。

---

## 6. README にスクショを追加（任意・推奨）

PromptDeckの画面をスクショして、リポジトリにアップ：

1. PromptDeckフォルダに `docs/` フォルダを作る
2. スクショを撮って保存：
   - `docs/main.png` — メイン画面
   - `docs/palette.png` — コマンドパレット (`Ctrl+K`)
   - `docs/settings.png` — 設定画面
3. push:
   ```bash
   git add docs/
   git commit -m "Add screenshots"
   git push
   ```

READMEで参照されてる画像が表示されるようになります！

---

## 困ったら

- **`git push` で認証エラー** → GitHubで個人アクセストークンを発行して使う：https://github.com/settings/tokens
- **Vercelビルドが失敗** → ログを見せてくれれば直します
- **ローカルでは動くのにVercelで真っ白** → 環境変数の問題かもしれない、エラーログをチェック
