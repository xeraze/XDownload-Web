import { useTranslation } from "react-i18next";
import { ServicesStrip } from "./ServicesGrid";

export default function Services() {
  const { t } = useTranslation();

  return (
    <section className="py-12 sm:py-16">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {t("services.title")}
      </h2>
      <a href="#services" className="mt-7 block">
        <ServicesStrip />
      </a>
    </section>
  );
}
