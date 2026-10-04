export function Header() {
  return (
    <header className="glass fixed inset-x-0 top-0 z-20 flex h-16 items-center border-b pl-20 pr-4 md:pl-72 md:pr-8">
      <span className="text-base font-bold tracking-tight md:hidden">SolarBud</span>
      <p className="hidden text-sm text-[var(--on-shell-muted)] md:block">
        Geomagnetic storm forecasts and alerts
      </p>
    </header>
  );
}
