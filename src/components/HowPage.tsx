import { useTranslation } from "react-i18next";
import { Link, Video, Download } from "lucide-react";

export default function HowPage() {
  const { t } = useTranslation();

  const steps = [
    { icon: Link, title: t("how.s1t"), text: t("how.s1d") },
    { icon: Video, title: t("how.s2t"), text: t("how.s2d") },
    { icon: Download, title: t("how.s3t"), text: t("how.s3d") },
  ];

  return (
    <section className="py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("how.title")}
      </h1>
      <div className="mt-10 grid gap-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.title}
              className="flex items-start gap-5 rounded-3xl border border-[color:var(--line)] bg-[color:var(--chip-bg)] p-6 sm:p-8"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--line)]">
                <StepIcon size={20} />
              </span>
              <div>
                <span className="text-xs font-medium text-[color:var(--ink-soft)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-1 text-lg font-medium">{step.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--ink-soft)]">
                  {step.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
