import type { CSSProperties } from "react";
import {
  siFacebook,
  siInstagram,
  siPinterest,
  siReddit,
  siRumble,
  siSnapchat,
  siSoundcloud,
  siSpotify,
  siTiktok,
  siVk,
  siX,
  siYoutube,
  siYoutubemusic,
  type SimpleIcon,
} from "simple-icons";

const SERVICES: { name: string; icon: SimpleIcon }[] = [
  { name: "YouTube", icon: siYoutube },
  { name: "YouTube Music", icon: siYoutubemusic },
  { name: "Spotify", icon: siSpotify },
  { name: "SoundCloud", icon: siSoundcloud },
  { name: "TikTok", icon: siTiktok },
  { name: "Instagram", icon: siInstagram },
  { name: "Facebook", icon: siFacebook },
  { name: "Reddit", icon: siReddit },
  { name: "Pinterest", icon: siPinterest },
  { name: "VK", icon: siVk },
  { name: "X (Twitter)", icon: siX },
  { name: "Rumble", icon: siRumble },
  { name: "Snapchat", icon: siSnapchat },
];

function brandStyle(hex: string): CSSProperties {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const dark = 0.2126 * r + 0.7152 * g + 0.0722 * b < 70;
  return {
    "--brand": `#${hex}`,
    "--brand-night": dark ? "var(--ink)" : `#${hex}`,
  } as CSSProperties;
}

export default function ServicesGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {SERVICES.map(({ name, icon }) => (
        <div
          key={name}
          className="flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--chip-bg)] px-4 py-3.5 transition-transform hover:-translate-y-0.5"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
            fill="currentColor"
            className="brand-icon"
            style={brandStyle(icon.hex)}
          >
            <path d={icon.path} />
          </svg>
          <span className="truncate text-sm font-medium">{name}</span>
        </div>
      ))}
    </div>
  );
}
