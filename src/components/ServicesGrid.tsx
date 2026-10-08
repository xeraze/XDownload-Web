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

interface Service {
  name: string;
  icon: SimpleIcon;
  video: boolean;
}

const SERVICES: Service[] = [
  { name: "YouTube", icon: siYoutube, video: true },
  { name: "YouTube Music", icon: siYoutubemusic, video: false },
  { name: "Spotify", icon: siSpotify, video: false },
  { name: "SoundCloud", icon: siSoundcloud, video: false },
  { name: "TikTok", icon: siTiktok, video: true },
  { name: "Instagram", icon: siInstagram, video: true },
  { name: "Facebook", icon: siFacebook, video: true },
  { name: "Reddit", icon: siReddit, video: true },
  { name: "Pinterest", icon: siPinterest, video: true },
  { name: "VK", icon: siVk, video: true },
  { name: "X (Twitter)", icon: siX, video: true },
  { name: "Rumble", icon: siRumble, video: true },
  { name: "Snapchat", icon: siSnapchat, video: true },
];

function Icon({ icon, size = 20 }: { icon: SimpleIcon; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d={icon.path} />
    </svg>
  );
}

export default function ServicesGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {SERVICES.map(({ name, icon, video }) => (
        <div
          key={name}
          className="group flex flex-col gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--chip-bg)] px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-[color:var(--glass-border)]"
        >
          <span className="text-[color:var(--ink-soft)] transition-colors group-hover:text-[color:var(--ink)]">
            <Icon icon={icon} />
          </span>
          <span className="text-sm font-medium leading-tight">{name}</span>
          <span className="flex gap-1.5">
            {video && (
              <span className="rounded-md border border-[color:var(--line)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--ink-soft)]">
                MP4
              </span>
            )}
            <span className="rounded-md border border-[color:var(--line)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--ink-soft)]">
              MP3
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function ServicesStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[color:var(--ink-soft)]">
      {SERVICES.map(({ name, icon }) => (
        <span
          key={name}
          className="flex items-center gap-2 transition-colors hover:text-[color:var(--ink)]"
        >
          <Icon icon={icon} size={16} />
          {name}
        </span>
      ))}
    </div>
  );
}
