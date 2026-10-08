import { useTranslation } from "react-i18next";
import { setLanguage } from "../i18n";
import logoUrl from "../assets/logo.png";

export default function Header() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === "en" ? "en" : "ru";

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full max-w-[2000px] items-center justify-between px-6 sm:px-10 xl:px-16">
        <a href="#home" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <img src={logoUrl} alt="" className="h-7 w-7 object-contain dark:invert" />
          XDownload
        </a>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          <a
            href="#how"
            className="hidden text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--ink)] sm:block"
          >
            {t("nav.how")}
          </a>
          <a
            href="#services"
            className="hidden text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--ink)] sm:block"
          >
            {t("nav.services")}
          </a>
          <a
            href="#download"
            className="rounded-full bg-[color:var(--ink)] px-4 py-1.5 text-xs font-medium text-[color:var(--bg)] transition-all hover:opacity-85 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
          >
            {t("nav.download")}
          </a>
          <div className="flex items-center rounded-full border border-[color:var(--line)] p-0.5 text-xs font-medium">
            {(["ru", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={
                  "rounded-full px-2.5 py-1 uppercase transition-colors active:scale-95 " +
                  (lang === code
                    ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                    : "text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]")
                }
              >
                {code}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
