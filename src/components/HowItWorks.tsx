import { useTranslation } from "react-i18next";
import { Link, Video, Download } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    { icon: Link, title: t("how.s1t") },
    { icon: Video, title: t("how.s2t") },
    { icon: Download, title: t("how.s3t") },
  ];

  return (
    <section className="py-12 sm:py-16">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {t("how.title")}
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <a
              key={step.title}
              href="#how"
              className="group rounded-3xl border border-[color:var(--line)] bg-[color:var(--chip-bg)] p-6 transition-all hover:-translate-y-0.5 hover:border-[color:var(--glass-border)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--line)]">
                  <StepIcon size={16} />
                </span>
                <span className="text-xs font-medium text-[color:var(--ink-soft)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-medium">{step.title}</h3>
            </a>
          );
        })}
      </div>
    </section>
  );
}
