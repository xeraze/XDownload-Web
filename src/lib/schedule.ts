export type Theme = "day" | "morning" | "night";

export interface ThemeBlend {
  from: Theme;
  to: Theme;
  t: number;
}

export interface ScheduleState {
  theme: Theme;
  blend?: ThemeBlend;
  paused: boolean;
  opensToday: boolean;
}

const OPEN_MIN = 9 * 60;
const MORNING_MIN = 7 * 60;
const EVENING_CLOSE = 21 * 60;
const EVENING_CLOSE_WEEKEND = 21 * 60 + 30;
const BLEND_MIN = 30;

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export function scheduleState(now: Date = new Date()): ScheduleState {
  const msk = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const weekday = msk.getUTCDay();
  const minutes =
    msk.getUTCHours() * 60 + msk.getUTCMinutes() + msk.getUTCSeconds() / 60;
  const close = weekday === 5 || weekday === 6 ? EVENING_CLOSE_WEEKEND : EVENING_CLOSE;

  const paused = minutes < OPEN_MIN || minutes >= close;
  const opensToday = minutes < close;

  const windows = [
    { start: MORNING_MIN - BLEND_MIN, from: "night" as Theme, to: "morning" as Theme },
    { start: OPEN_MIN - BLEND_MIN, from: "morning" as Theme, to: "day" as Theme },
    { start: close - BLEND_MIN, from: "day" as Theme, to: "night" as Theme },
  ];

  for (const w of windows) {
    if (minutes >= w.start && minutes < w.start + BLEND_MIN) {
      const t = smoothstep((minutes - w.start) / BLEND_MIN);
      return { theme: w.to, blend: { from: w.from, to: w.to, t }, paused, opensToday };
    }
  }

  const theme: Theme =
    minutes < MORNING_MIN ? "night" : minutes < OPEN_MIN ? "morning" : minutes < close ? "day" : "night";
  return { theme, paused, opensToday };
}

const PREVIEWS: Record<string, ScheduleState> = {
  day: { theme: "day", paused: false, opensToday: true },
  morning: { theme: "morning", paused: true, opensToday: true },
  night: { theme: "night", paused: true, opensToday: false },
  dawn: { theme: "morning", blend: { from: "night", to: "morning", t: 0.5 }, paused: true, opensToday: true },
  sunrise: { theme: "day", blend: { from: "morning", to: "day", t: 0.5 }, paused: true, opensToday: true },
  dusk: { theme: "night", blend: { from: "day", to: "night", t: 0.5 }, paused: false, opensToday: true },
};

export function previewState(param: string | null): ScheduleState | null {
  if (!param) return null;
  return PREVIEWS[param] ?? null;
}
