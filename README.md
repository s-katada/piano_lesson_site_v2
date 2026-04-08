# どんぐりピアノ教室 サイト

実家で営む「どんぐりピアノ教室」の公式サイト用リポジトリです。レッスン案内や教室情報のほか、**お問い合わせフォーム**からの送信を受け付けます。送信内容は Discord に通知し、確認メールを Resend 経由で送っています。スパム対策に Cloudflare Turnstile を利用しています。

## 技術スタック

- **モノレポ**: Bun workspaces
- **フロント**（`apps/frontend`）: Astro 5、React（アイランド）、Tailwind CSS、Radix UI、react-hook-form、Cloudflare Pages（`wrangler.toml` で `dist` をデプロイ）
- **バックエンド**（`apps/backend`）: Hono、Cloudflare Workers、`wrangler deploy`
- **共有**（`packages/shared`）: Zod でお問い合わせスキーマを定義し、フロントと API の両方から参照
- **外部サービス**: Cloudflare Turnstile、Resend、Discord Incoming Webhook

## 本番 URL

| 用途 | URL |
|------|-----|
| サイト | https://donguri-piano.com |
| API | https://api.donguri-piano.maropu.com |

## 前提

- [Bun](https://bun.sh/)（このリポジトリは Bun で依存関係とスクリプトを管理しています）

## 初回セットアップ

```bash
bun install
cp apps/frontend/.env.sample apps/frontend/.env
cp apps/backend/.dev.vars.sample apps/backend/.dev.vars
```

`.env` と `.dev.vars` の値を環境に合わせて編集してください（`.dev.vars` は Git に含めません）。

## 環境変数

### フロント（`apps/frontend`）

| 変数 | 説明 |
|------|------|
| `PUBLIC_API_URL` | お問い合わせ API のベース URL（ローカル例: `http://localhost:8787`） |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile のサイトキー（公開してよい値） |

ローカルでは `.env` を参照します。本番の Cloudflare Pages ではダッシュボードの環境変数、または [`apps/frontend/wrangler.toml`](apps/frontend/wrangler.toml) の `[vars]` でビルド時に注入できます（`PUBLIC_*` はビルド時に埋め込まれます）。

### バックエンド（`apps/backend`）

Worker のバインド名は [`apps/backend/src/types/bindings.ts`](apps/backend/src/types/bindings.ts) と一致させます。

| 名前 | 説明 |
|------|------|
| `DISCORD_WEBHOOK_URL` | お問い合わせ通知用 Discord Webhook |
| `CLIENT_URL` | CORS 許可オリジン（例: フロントのオリジン） |
| `RESEND_API_KEY` | Resend API キー |
| `FROM_EMAIL` | 送信元メールアドレス（Resend で利用可能なもの） |
| `TURNSTILE_SECRET_KEY` | Turnstile のシークレットキー（サイトキーとペア） |

機密値はローカルで `apps/backend/.dev.vars` に書くか、本番では Cloudflare ダッシュボードの **Secrets**、または次のコマンドで登録します。

```bash
cd apps/backend
bunx wrangler secret put TURNSTILE_SECRET_KEY
```

## 開発

リポジトリ直下でフロント・バックエンドの `dev` をまとめて起動する例:

```bash
bun run dev
```

個別に動かす場合:

```bash
# フロントのみ（例）
bun run --filter '@piano_lesson_site/frontend' dev

# API のみ（例）
bun run --filter '@piano_lesson_site/backend' dev
```

ビルド:

```bash
bun run build:frontend
bun run build:backend
```

## デプロイ

- **フロント**: Astro の `dist` を Cloudflare Pages に載せる想定（[`apps/frontend/wrangler.toml`](apps/frontend/wrangler.toml) の `pages_build_output_dir` 参照）。CI やダッシュボードの手順に従ってください。
- **バックエンド**:

```bash
cd apps/backend
bun run deploy
```

シークレットを変更したあと、通常は再デプロイなしで次のリクエストから有効になります。

## Turnstile（要点）

- **サイトキー**はフロントに置き、ウィジェットがトークンを発行します。
- **シークレットキー**は API だけが保持し、`siteverify` でトークンを検証します。シークレットが未設定のままではサーバー側の検証は成立しません。

詳細は各アプリの README とソースを参照してください。
