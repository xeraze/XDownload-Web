import { useTranslation } from "react-i18next";
import { Link, Video, Download } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    { icon: Link, title: t("how.s1t"), text: t("how.s1d") },
    { icon: Video, title: t("how.s2t"), text: t("how.s2d") },
    { icon: Download, title: t("how.s3t"), text: t("how.s3d") },
  ];

  return (
    <section id="how" className="py-12 sm:py-16">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("how.title")}
        </h2>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--chip-bg)] p-6 transition-transform hover:-translate-y-0.5"
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
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                {step.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
