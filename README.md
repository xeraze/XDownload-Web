# XDownload (Web Version)

Free and ad-free web version of XDownload: 13 services (YouTube, TikTok, Instagram, VK, Spotify and others) - download via yt-dlp on your own hardware. A personal project: no ads, no fees, no accounts.

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

## Limits

Worker: 6 POST/min per IP (job creation), 90 reads/min. Backend limits are the
`XDL_API_*` variables, see the main repository.
