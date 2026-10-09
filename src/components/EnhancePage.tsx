import { useTranslation } from "react-i18next";
import Enhancer from "./Enhancer";

export default function EnhancePage() {
  const { t } = useTranslation();
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("enh.title")}</h1>
        <p className="mt-4 text-[color:var(--ink-soft)]">{t("enh.hint")}</p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        <Enhancer />
      </div>
    </section>
  );
}
