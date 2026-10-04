// Minimal 24px stroke icons so the 64px collapsed rail stays readable without an icon dependency.
const paths = {
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  aurora: "M3 17c3-8 6-8 9 0s6 8 9 0M3 11c3-6 6-6 9 0s6 6 9 0",
  gnss: "M12 3l3 6-3 3-3-3 3-6zM5 21l7-7 7 7",
  cme: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12 2v3M12 19v3M2 12h3M19 12h3",
  backtest: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  models: "M4 7h16M4 12h16M4 17h16M8 4v6M15 9v6M10 14v6",
  api: "M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
