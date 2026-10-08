import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { PRIMARY } from "../lib/buttons";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section
      className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}
    >
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:var(--ink-soft)] text-pretty">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8">
          <a href="#download" className={PRIMARY + " px-7 py-4 text-base"}>
            <Download size={18} />
            {t("hero.cta")}
          </a>
        </div>
      </div>
    </section>
  );
}
