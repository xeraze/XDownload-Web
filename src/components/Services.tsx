import { useTranslation } from "react-i18next";

const SERVICES = [
  "YouTube",
  "YouTube Music",
  "Spotify",
  "SoundCloud",
  "TikTok",
  "Instagram",
  "Facebook",
  "Reddit",
  "Pinterest",
  "VK",
  "X (Twitter)",
  "Rumble",
  "Snapchat",
];

export default function Services() {
  const { t } = useTranslation();

  return (
    <section id="services" className="py-16">
      <div className="grid gap-8 lg:grid-cols-4 lg:gap-12">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("services.title")}
          </h2>
          <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
            {t("services.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 sm:justify-start lg:col-span-3 lg:pt-2">
          {SERVICES.map((name) => (
            <span
              key={name}
              className="rounded-full border border-[color:var(--line)] bg-[color:var(--chip-bg)] px-4 py-2 text-sm"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
