# XDownload Web

Веб-интерфейс к XDownload: YouTube, TikTok, Instagram, VK, Spotify - скачивание через yt-dlp на собственном железе.

Бот и Go-бэкенд живут в основном репозитории: https://github.com/xeraze/XDownload

## Как это работает

```
браузер ──> GitHub Pages (React-статика)
              └──> Cloudflare Worker (CORS, rate limit, X-Api-Key)
                     └──> туннель ──> localhost:8080 (xcore api ──> yt-dlp)
```

Сайт не хранит файлов. История скачиваний - localStorage браузера, ключ `xdl-history`.

## Стек

- React, Vite, Tailwind CSS
- Go-бэкенд - команда `xcore api` (отдельный репозиторий)
- Cloudflare Worker - один файл без сборки, `worker/`

## Локальная разработка

```bash
npm ci
npm run dev        # http://localhost:5173
```

`/api` проксируется на `http://127.0.0.1:8080`. Поднимите бэкенд из основного
репозитория (`xcore api`). Если в `../XDownload/.api-key` лежит ключ, прокси
подставит его в заголовок `X-Api-Key`; без файла работает без ключа.

## Деплой

Любое изменение → `npm run deploy`. Скрипт соберёт прод-сборку (base и адрес
API подставляются сами: `vite.config.ts` и `.env.production`) и форс-пушнет
`dist/` в ветку `gh-pages`, откуда её раздаёт GitHub Pages.

Воркер:

```bash
cd worker
npx wrangler deploy
npx wrangler secret put API_KEY    # значение = XDL_API_KEY бэкенда
```

Переменные воркера (`wrangler.toml`, секция `[vars]`):

| Переменная   | Смысл                                        |
|--------------|----------------------------------------------|
| `ORIGIN`     | адрес туннеля на локальный API               |
| `SITE_ORIGIN`| адрес сайта, которому разрешён CORS          |

## Лимиты

Воркер: 6 POST/мин на IP (создание задачи), 90 чтений/мин. Лимиты самого
бэкенда - переменные `XDL_API_*`, см. основной репозиторий.
