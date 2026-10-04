export const SWPC_URL = "https://www.swpc.noaa.gov";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-outline py-6 text-sm text-muted">
      Not an official forecast. See{" "}
      <a className="underline underline-offset-2 hover:text-foreground" href={SWPC_URL}>
        NOAA SWPC
      </a>
      .
    </footer>
  );
}
