import type { ScheduleState, Theme } from "./schedule";

type RGBA = [number, number, number, number];

const PALETTES: Record<Theme, Record<string, RGBA>> = {
  day: {
    bg: [255, 255, 255, 1],
    ink: [17, 17, 19, 1],
    "ink-soft": [99, 99, 107, 1],
    line: [17, 17, 19, 0.08],
    "glass-bg": [255, 255, 255, 0.72],
    "glass-border": [17, 17, 19, 0.08],
    "chip-bg": [17, 17, 19, 0.04],
  },
  morning: {
    bg: [232, 232, 236, 1],
    ink: [23, 23, 26, 1],
    "ink-soft": [91, 91, 99, 1],
    line: [17, 17, 19, 0.08],
    "glass-bg": [255, 255, 255, 0.55],
    "glass-border": [17, 17, 19, 0.1],
    "chip-bg": [17, 17, 19, 0.04],
  },
  night: {
    bg: [11, 11, 13, 1],
    ink: [242, 242, 244, 1],
    "ink-soft": [160, 160, 170, 1],
    line: [255, 255, 255, 0.1],
    "glass-bg": [24, 24, 27, 0.66],
    "glass-border": [255, 255, 255, 0.09],
    "chip-bg": [255, 255, 255, 0.06],
  },
};

function mix(a: RGBA, b: RGBA, t: number): RGBA {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
  ];
}

function css(c: RGBA): string {
  const r = Math.round(c[0]);
  const g = Math.round(c[1]);
  const b = Math.round(c[2]);
  if (c[3] >= 1) return `rgb(${r} ${g} ${b})`;
  return `rgba(${r}, ${g}, ${b}, ${Math.round(c[3] * 1000) / 1000})`;
}

export function applyTheme(state: ScheduleState): void {
  const root = document.documentElement;
  const target = PALETTES[state.theme];
  const values: Record<string, RGBA> = {};

  for (const key of Object.keys(target)) {
    if (state.blend) {
      const source = PALETTES[state.blend.from][key];
      values[key] = mix(source, target[key], state.blend.t);
    } else {
      values[key] = target[key];
    }
  }

  root.dataset.theme =
    state.blend && state.blend.t < 0.5 ? state.blend.from : state.theme;

  for (const [key, value] of Object.entries(values)) {
    root.style.setProperty(`--${key}`, css(value));
  }
}
