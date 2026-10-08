export type Theme = "day" | "dawn" | "morning" | "night";

export interface ScheduleState {
  theme: Theme;
  paused: boolean;
  opensToday: boolean;
}

const DAWN_MIN = 6 * 60;
const MORNING_MIN = 8 * 60;
const OPEN_MIN = 9 * 60;
const EVENING_CLOSE = 21 * 60;
const EVENING_CLOSE_WEEKEND = 21 * 60 + 30;

export function scheduleState(now: Date = new Date()): ScheduleState {
  const msk = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const weekday = msk.getUTCDay();
  const minutes = msk.getUTCHours() * 60 + msk.getUTCMinutes();
  const close = weekday === 5 || weekday === 6 ? EVENING_CLOSE_WEEKEND : EVENING_CLOSE;

  const paused = minutes < OPEN_MIN || minutes >= close;
  const opensToday = minutes < close;

  const theme: Theme =
    minutes < DAWN_MIN
      ? "night"
      : minutes < MORNING_MIN
        ? "dawn"
        : minutes < OPEN_MIN
          ? "morning"
          : minutes < close
            ? "day"
            : "night";

  return { theme, paused, opensToday };
}

const PREVIEWS: Record<string, ScheduleState> = {
  day: { theme: "day", paused: false, opensToday: true },
  dawn: { theme: "dawn", paused: true, opensToday: true },
  morning: { theme: "morning", paused: true, opensToday: true },
  night: { theme: "night", paused: true, opensToday: false },
};

export function previewState(param: string | null): ScheduleState | null {
  if (!param) return null;
  return PREVIEWS[param] ?? null;
}
