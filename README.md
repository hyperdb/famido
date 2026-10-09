# Timeline Todo (タイムライン・ToDo)

> **完了したタスクが消えない、実績とこれからの予定がひと目でわかるプロジェクト＆タスク管理アプリ**

Todoistのような軽快な操作感を持ちながら、「完了したタスクをリストから消さず、アクション履歴として色・スタイルを変えて常に参照できる」ことをコンセプトにしたWebアプリケーションです。

---

## 🌟 主な特徴

1. **完了タスクが消えないタイムライン**
   - 完了したタスクは消去されず、完了者・完了日時とともに落ち着いたスタイルでタイムラインに残ります。
   - 「誰が・いつ終わらせたか」の実績ログが一目瞭然になります。
2. **スマートな日付グルーピング**
   - 「期限切れ」「今日」「明日」「今後の予定」「期限未設定」「完了した実績ログ」に自動整理。
   - 期限の全体タップで直感的にカレンダーからリスケジュール可能（完了タスクは実績として保護・変更不可）。
3. **プロジェクト管理 & テーマ切り替え**
   - 複数のプロジェクト（引越し、旅行、仕事など）を簡単に切り替え・新規作成。
   - プロジェクトごとに選んだテーマカラー（エメラルド、インディゴ、ローズ、アンバー、バイオレット、ダークなど）が自動保存・復元されます。
4. **少人数マルチユーザー協調**
   - 操作者の切り替え、ユーザー名の変更、メンバーの追加に対応。
   - 未完了タスクの担当者変更もカード上から即座に行えます。
5. **カテゴリー & タグの絞り込み**
   - 大分類のカテゴリーと、横断的なタグによるスムーズなフィルタリング。

---

## 🛠 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **バックエンド**: Cloudflare Workers, Hono, Cloudflare D1 (SQLite)
- **インフラ**: Cloudflare Workers / Cloudflare Pages

---

## 🚀 ローカル開発環境のセットアップ

### 前提条件
- Node.js (v18以上推奨)
- npm

### 1. バックエンド (Cloudflare Workers + D1)

```bash
cd backend
npm install

# ローカル D1 データベースの初期化とシードデータの投入
npx wrangler d1 execute timeline-todo-db --local --file=./src/db/schema.sql
npx wrangler d1 execute timeline-todo-db --local --file=./src/db/seed.sql

# 開発サーバー起動 (デフォルト: http://127.0.0.1:8787)
npm run dev
```

### 2. フロントエンド (React + Vite)

```bash
cd frontend
npm install

# 開発サーバー起動 (デフォルト: http://localhost:5173)
npm run dev
```

ブラウザで `http://localhost:5173` を開いて動作を確認します。

---

## 🌐 Cloudflare へのデプロイ

### 1. 本番 D1 データベースの作成と適用

```bash
cd backend
npx wrangler d1 create timeline-todo-db
# 出力された database_id を wrangler.toml に反映
npx wrangler d1 execute timeline-todo-db --remote --file=./src/db/schema.sql
npx wrangler d1 execute timeline-todo-db --remote --file=./src/db/seed.sql
```

### 2. バックエンド API のデプロイ

```bash
npx wrangler deploy
# 発行された Workers URL を確認 (例: https://timeline-todo-api.<your-subdomain>.workers.dev)
```

### 3. フロントエンドのデプロイ (Cloudflare Pages)

```bash
cd ../frontend
# .env.production に本番 Workers API URL を指定
echo "VITE_API_URL=https://<your-workers-url>/api" > .env.production
npm run build
npx wrangler pages deploy dist --project-name=timeline-todo
```

---

## 📄 ライセンス
MIT License
