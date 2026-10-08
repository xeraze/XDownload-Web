import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { PRIMARY } from "../lib/buttons";
import bannerUrl from "../assets/banner.svg";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative flex items-center gap-12 pt-12 pb-6 sm:pt-20 sm:pb-10">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl xl:text-7xl">
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
      <img
        src={bannerUrl}
        alt=""
        aria-hidden="true"
        className="hidden w-[440px] shrink-0 self-center rounded-xl lg:block xl:w-[540px]"
      />
    </section>
  );
}
