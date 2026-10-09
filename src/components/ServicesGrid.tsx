import type { ComponentType, SVGProps } from "react";
import type { CSSProperties } from "react";
import IconFacebook from "~icons/simple-icons/facebook";
import IconInstagram from "~icons/simple-icons/instagram";
import IconPinterest from "~icons/simple-icons/pinterest";
import IconReddit from "~icons/simple-icons/reddit";
import IconRumble from "~icons/simple-icons/rumble";
import IconSnapchat from "~icons/simple-icons/snapchat";
import IconSoundcloud from "~icons/simple-icons/soundcloud";
import IconSpotify from "~icons/simple-icons/spotify";
import IconTiktok from "~icons/simple-icons/tiktok";
import IconVk from "~icons/simple-icons/vk";
import IconX from "~icons/simple-icons/x";
import IconYoutube from "~icons/simple-icons/youtube";
import IconYoutubemusic from "~icons/simple-icons/youtubemusic";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface Service {
  name: string;
  icon: IconComponent;
  video: boolean;
  color: string;
}

const SERVICES: Service[] = [
  { name: "YouTube", icon: IconYoutube, video: true, color: "#FF0000" },
  { name: "YouTube Music", icon: IconYoutubemusic, video: false, color: "#FF0000" },
  { name: "Spotify", icon: IconSpotify, video: false, color: "#1DB954" },
  { name: "SoundCloud", icon: IconSoundcloud, video: false, color: "#FF5500" },
  { name: "TikTok", icon: IconTiktok, video: true, color: "#FE2C55" },
  { name: "Instagram", icon: IconInstagram, video: true, color: "#E4405F" },
  { name: "Facebook", icon: IconFacebook, video: true, color: "#0866FF" },
  { name: "Reddit", icon: IconReddit, video: true, color: "#FF4500" },
  { name: "Pinterest", icon: IconPinterest, video: true, color: "#E60023" },
  { name: "VK", icon: IconVk, video: true, color: "#0077FF" },
  { name: "X (Twitter)", icon: IconX, video: true, color: "#1D9BF0" },
  { name: "Rumble", icon: IconRumble, video: true, color: "#85C75C" },
  { name: "Snapchat", icon: IconSnapchat, video: true, color: "#F7C600" },
];

function Icon({ icon: Comp, size = 20 }: { icon: IconComponent; size?: number }) {
  return <Comp width={size} height={size} aria-hidden="true" />;
}

export default function ServicesGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {SERVICES.map(({ name, icon, video, color }) => (
        <div
          key={name}
          style={{ "--brand": color } as CSSProperties}
          className="group flex flex-col gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--chip-bg)] px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-[color:var(--glass-border)]"
        >
          <span className="text-[color:var(--ink-soft)] transition-colors group-hover:text-[color:var(--brand)]">
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

export function ServicesMarquee() {
  const row = [...SERVICES, ...SERVICES];
  return (
    <div className="flex flex-col gap-4">
      <div className="marquee">
        <div className="marquee-track">
          {row.map(({ name, icon, color }, index) => (
            <span
              key={`${name}-${index}`}
              style={{ "--brand": color } as CSSProperties}
              className="group flex shrink-0 items-center gap-3 pr-10"
            >
              <Icon icon={icon} size={22} />
              <span className="font-display text-2xl font-semibold tracking-tight text-[color:var(--ink)] uppercase transition-colors group-hover:text-[color:var(--brand)] sm:text-3xl">
                {name}
              </span>
              <span aria-hidden="true" className="text-[color:var(--accent)]">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="marquee marquee-reverse">
        <div className="marquee-track">
          {row.map(({ name, icon, color }, index) => (
            <span
              key={`rev-${name}-${index}`}
              style={{ "--brand": color } as CSSProperties}
              className="group flex shrink-0 items-center gap-3 pr-10"
            >
              <span aria-hidden="true" className="text-[color:var(--accent-2)]">
                ✦
              </span>
              <Icon icon={icon} size={16} />
              <span className="font-display text-lg font-medium tracking-tight text-[color:var(--ink-soft)] uppercase transition-colors group-hover:text-[color:var(--brand)] sm:text-xl">
                {name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
