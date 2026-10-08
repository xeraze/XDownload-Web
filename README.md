# XDownload Web

Web interface for XDownload: 13 services (YouTube, TikTok, Instagram, VK, Spotify and others) - download via yt-dlp on your own hardware.

The bot and the Go backend live in the main repository: https://github.com/xeraze/XDownload

## How it works

```
browser ──> GitHub Pages (React static site)
              └──> Cloudflare Worker (CORS, rate limit, X-Api-Key)
                     └──> tunnel ──> localhost:8080 (xcore api ──> yt-dlp)
```

The site stores no files. Download history lives in browser localStorage, key `xdl-history`.

## Stack

- React, Vite, Tailwind CSS
- Icons - Tabler (UI) and Simple Icons (services) via Iconify, bundled at build time
- Go backend - the `xcore api` command (separate repository)
- Cloudflare Worker - a single file with no build step, `worker/`

## Local development

```bash
npm ci
npm run dev        # http://localhost:5173
```

`/api` is proxied to `http://127.0.0.1:8080`. Start the backend from the main
repository (`xcore api`). If a key sits in `../XDownload/.api-key`, the proxy
injects it as the `X-Api-Key` header; without the file everything works keyless.

## Deploy

Any change -> `npm run deploy`. The script builds the production bundle (base
path and API URL are filled in automatically by `vite.config.ts` and
`.env.production`) and force-pushes `dist/` to the `gh-pages` branch, which
GitHub Pages serves.

Worker:

```bash
cd worker
npx wrangler deploy
npx wrangler secret put API_KEY    # value = the backend's XDL_API_KEY
```

Worker variables (`wrangler.toml`, `[vars]` section):

| Variable      | Meaning                                     |
|---------------|---------------------------------------------|
| `ORIGIN`      | tunnel address to the local API             |
| `SITE_ORIGIN` | site address allowed by CORS                |

## Limits

Worker: 6 POST/min per IP (job creation), 90 reads/min. Backend limits are the
`XDL_API_*` variables, see the main repository.
