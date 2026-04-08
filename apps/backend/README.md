# `@piano_lesson_site/backend`

どんぐりピアノ教室サイトの API です。[Hono](https://hono.dev/) を Cloudflare Workers 上で動かしています。

## 開発

```bash
bun install
bun run dev
```

`.dev.vars` を用意してください（`.dev.vars.sample` をコピー）。

## デプロイ

```bash
bun run deploy
```

## Wrangler の型生成

Worker の設定と型を同期する場合:

```bash
bun run cf-typegen
```

手順の詳細は [Cloudflare のドキュメント](https://developers.cloudflare.com/workers/wrangler/commands/#types) を参照してください。アプリでは [`src/types/bindings.ts`](src/types/bindings.ts) の `Bindings` を Hono に渡しています。

```ts
// src/index.ts（抜粋）
const app = new Hono<{ Bindings: Bindings }>();
```

環境変数・シークレット・本番 URL はリポジトリ直下の [README.md](../../README.md) を参照してください。
