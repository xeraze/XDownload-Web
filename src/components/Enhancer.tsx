import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import IconDownload from "~icons/tabler/download";
import IconImage from "~icons/tabler/photo";
import IconSparkles from "~icons/tabler/sparkles";
import { EnhanceError, enhanceImage } from "../lib/api";
import { PRIMARY } from "../lib/buttons";

type Engine = "local" | "ai";
type Mode = "clean" | "x2";

const seg = (active: boolean) =>
  `rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
    active
      ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
      : "border border-[color:var(--line)] bg-[color:var(--chip-bg)] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
  }`;

export default function Enhancer() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [engine, setEngine] = useState<Engine>("local");
  const [mode, setMode] = useState<Mode>("clean");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const pick = (f: File | null | undefined) => {
    if (!f) return;
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setResult(null);
    setErrorKey(null);
    setFile(f);
  };

  const chooseEngine = (next: Engine) => {
    setEngine(next);
    if (next === "ai") setMode("x2");
  };

  const start = async () => {
    if (!file || busy) return;
    setBusy(true);
    setErrorKey(null);
    try {
      const blob = await enhanceImage(file, mode, engine);
      const url = URL.createObjectURL(blob);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = url;
      setResult(url);
    } catch (err) {
      const status = err instanceof EnhanceError ? err.status : 0;
      setErrorKey(
        status === 429
          ? "errBusy"
          : status === 413
            ? "errSize"
            : status === 415
              ? "errFormat"
              : status === 503
                ? "errAi"
                : status === 502
                  ? "errAiFail"
                  : status === 400
                    ? "errDims"
                    : "errGeneric",
      );
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `enhanced_${file.name}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="glass rounded-3xl p-6 transition-colors sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(event) => pick(event.target.files?.[0])}
      />

      {!file ? (
        <button type="button" className={PRIMARY + " w-full"} onClick={() => inputRef.current?.click()}>
          <IconImage width={16} height={16} />
          {t("enh.pick")}
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--chip-bg)] px-4 py-3">
            <span className="truncate text-sm">{file.name}</span>
            <button
              type="button"
              className="shrink-0 text-sm text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--ink)]"
              onClick={() => inputRef.current?.click()}
            >
              {t("enh.replace")}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={seg(engine === "local")} onClick={() => chooseEngine("local")}>
              {t("enh.fast")}
            </button>
            <button type="button" className={seg(engine === "ai")} onClick={() => chooseEngine("ai")}>
              {t("enh.ai")}
            </button>
          </div>

          <div
            className={
              "flex flex-wrap gap-3 " + (engine === "ai" ? "pointer-events-none opacity-50" : "")
            }
          >
            <button type="button" className={seg(mode === "clean")} onClick={() => setMode("clean")}>
              {t("enh.modeClean")}
            </button>
            <button type="button" className={seg(mode === "x2")} onClick={() => setMode("x2")}>
              {t("enh.modeX2")}
            </button>
          </div>
          <p className="text-sm text-[color:var(--ink-soft)]">
            {engine === "ai" || mode === "x2" ? t("enh.hintX2") : t("enh.hintClean")}
          </p>

          {busy ? (
            <div className="flex flex-col items-center gap-3 py-2" aria-hidden="true">
              <div className="skeleton h-4 w-2/3 rounded-full" />
              <div className="skeleton h-4 w-1/2 rounded-full" />
              <p className="text-sm text-[color:var(--ink-soft)]">{t("enh.work")}</p>
            </div>
          ) : result ? (
            <>
              <img
                src={result}
                alt={t("enh.title")}
                className="max-h-80 w-full rounded-2xl border border-[color:var(--line)] object-contain"
              />
              <div className="flex flex-wrap justify-center gap-3">
                <button type="button" className={PRIMARY} onClick={download}>
                  <IconDownload width={16} height={16} />
                  {t("enh.download")}
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--chip-bg)] px-6 py-3.5 text-sm font-medium text-[color:var(--ink-soft)] transition-all hover:text-[color:var(--ink)]"
                  onClick={() => {
                    setResult(null);
                    setErrorKey(null);
                  }}
                >
                  {t("enh.again")}
                </button>
              </div>
            </>
          ) : (
            <button type="button" className={PRIMARY + " w-full"} onClick={() => void start()}>
              <IconSparkles width={16} height={16} />
              {t("enh.workBtn")}
            </button>
          )}

          {errorKey && !busy && (
            <p className="text-center text-sm text-red-500">{t(`enh.${errorKey}`)}</p>
          )}
        </div>
      )}
    </div>
  );
}
