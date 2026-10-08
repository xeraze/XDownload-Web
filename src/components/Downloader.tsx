import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Loader2, Music, Video } from "lucide-react";
import { ApiError, createJob, fileHref, getJob } from "../lib/api";
import { FIELD, PRIMARY, SECONDARY } from "../lib/buttons";
import { formatSize } from "../lib/format";
import type { DownloadEntry } from "../lib/history";
import type { ScheduleState } from "../lib/schedule";

type Phase = "idle" | "format" | "quality" | "working" | "done" | "error";
type ErrorKey = "offline" | "unsupported" | "generic" | "pauseToday" | "pauseTomorrow";

interface Props {
  state: ScheduleState;
  onDownloaded: (entry: DownloadEntry) => void;
}

export default function Downloader({ state, onDownloaded }: Props) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("idle");
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [file, setFile] = useState<{ name: string; size?: number } | null>(null);
  const [errorKey, setErrorKey] = useState<ErrorKey>("generic");

  const pauseError = () => {
    setErrorKey(state.opensToday ? "pauseToday" : "pauseTomorrow");
    setPhase("error");
  };

  const mapError = (err: unknown) => {
    if (err instanceof ApiError) {
      setErrorKey(err.kind === "unsupported" ? "unsupported" : "generic");
    } else {
      setErrorKey("offline");
    }
    setPhase("error");
  };

  const submit = () => {
    const trimmed = url.trim();
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      setErrorKey("unsupported");
      setPhase("error");
      return;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      setErrorKey("unsupported");
      setPhase("error");
      return;
    }
    if (state.paused) {
      pauseError();
      return;
    }
    setPhase("format");
  };

  const start = async (chosen: "mp4" | "mp3", height?: number) => {
    if (state.paused) {
      pauseError();
      return;
    }
    setProgress(null);
    setFile(null);
    setPhase("working");
    try {
      const id = await createJob(url.trim(), chosen, height);
      setJobId(id);
    } catch (err) {
      mapError(err);
    }
  };

  const reset = () => {
    setPhase("idle");
    setJobId(null);
    setProgress(null);
    setFile(null);
  };

  useEffect(() => {
    if (!jobId || phase !== "working") return;
    let stopped = false;
    let attempts = 0;
    let timer = 0;

    const tick = async () => {
      try {
        const job = await getJob(jobId);
        if (stopped) return;
        attempts = 0;
        if (job.state === "done") {
          const name = job.file?.name ?? "file";
          const size = job.file?.size;
          setFile({ name, size });
          setPhase("done");
          onDownloaded({ id: jobId, url: url.trim(), name, size, at: Date.now() });
          return;
        }
        if (job.state === "error") {
          setErrorKey("generic");
          setPhase("error");
          return;
        }
        if (typeof job.progress === "number") setProgress(job.progress);
        timer = window.setTimeout(tick, 1000);
      } catch {
        if (stopped) return;
        attempts += 1;
        if (attempts >= 3) {
          setErrorKey("offline");
          setPhase("error");
          return;
        }
        timer = window.setTimeout(tick, 1000);
      }
    };

    void tick();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [jobId, phase]);

  const errorMessage =
    errorKey === "pauseToday"
      ? t("status.pauseToday")
      : errorKey === "pauseTomorrow"
        ? t("status.pauseTomorrow")
        : errorKey === "offline"
          ? t("dl.errOffline")
          : errorKey === "unsupported"
            ? t("dl.errUnsupported")
            : t("dl.errGeneric");

  return (
    <div className="glass rounded-3xl p-6 transition-colors focus-within:border-[color:var(--ink-soft)] sm:p-8">
      {phase === "idle" && (
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={t("dl.placeholder")}
            className={FIELD}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className={PRIMARY + " sm:w-40"}>
            {t("dl.submit")}
          </button>
        </form>
      )}

      {phase === "format" && (
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="truncate text-sm text-[color:var(--ink-soft)]">{url}</span>
            <button
              type="button"
              onClick={() => setPhase("idle")}
              className="shrink-0 text-sm text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--ink)]"
            >
              {t("dl.change")}
            </button>
          </div>
          <p className="mt-4 text-sm font-medium">{t("dl.chooseFormat")}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={SECONDARY}
              onClick={() => {
                setPhase("quality");
              }}
            >
              <Video size={16} />
              {t("dl.video")}
            </button>
            <button type="button" className={SECONDARY} onClick={() => start("mp3")}>
              <Music size={16} />
              {t("dl.audio")}
            </button>
          </div>
        </div>
      )}

      {phase === "quality" && (
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="truncate text-sm text-[color:var(--ink-soft)]">{url}</span>
            <button
              type="button"
              onClick={() => setPhase("format")}
              className="flex shrink-0 items-center gap-1 text-sm text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--ink)]"
            >
              <ArrowLeft size={14} />
              {t("dl.back")}
            </button>
          </div>
          <p className="mt-4 text-sm font-medium">{t("dl.chooseQuality")}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {[1080, 720, 480].map((height) => (
              <button
                key={height}
                type="button"
                className={SECONDARY}
                onClick={() => start("mp4", height)}
              >
                {height}p
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "working" && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          {progress !== null ? (
            <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-[color:var(--chip-bg)]">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all dark:bg-white"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          ) : (
            <Loader2 size={28} className="animate-spin" />
          )}
          <p className="text-sm text-[color:var(--ink-soft)]">{t("dl.working")}</p>
        </div>
      )}

      {phase === "done" && file && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-medium">{file.name}</p>
            {formatSize(file.size) && (
              <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{formatSize(file.size)}</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {jobId && (
              <a href={fileHref(jobId)} target="_blank" rel="noreferrer" className={PRIMARY}>
                <Download size={16} />
                {t("dl.save")}
              </a>
            )}
            <button type="button" className={SECONDARY} onClick={reset}>
              {t("dl.again")}
            </button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <AlertCircle size={28} className="text-[color:var(--ink-soft)]" />
          <p className="text-sm text-[color:var(--ink-soft)]">{errorMessage}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className={PRIMARY} onClick={reset}>
              <ArrowLeft size={16} />
              {t("dl.retry")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
