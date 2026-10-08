import { useTranslation } from "react-i18next";

const SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6"];

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-3xl py-14 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("privacy.title")}</h1>
      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((key) => (
          <div key={key}>
            <h2 className="text-base font-semibold">{t(`privacy.${key}h`)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
              {t(`privacy.${key}p`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
