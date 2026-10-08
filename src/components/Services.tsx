import { useTranslation } from "react-i18next";
import ServicesGrid from "./ServicesGrid";

export default function Services() {
  const { t } = useTranslation();

  return (
    <section id="services" className="py-12 sm:py-16">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("services.title")}
        </h2>
        <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
          {t("services.subtitle")}
        </p>
      </div>
      <div className="mt-8">
        <ServicesGrid />
      </div>
    </section>
  );
}
