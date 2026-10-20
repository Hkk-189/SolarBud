# ops

Small scripts that keep the public demo reachable. Standard library only.

## update_api_url.py

The API is exposed by a free Cloudflare quick tunnel (`solarbud-tunnel.service`), whose URL changes
every time it restarts. After each start this script reads the new URL from the tunnel's journal,
waits until `<url>/health` answers, then sets the production `API_URL` on the Vercel project and
redeploys `main` from GitHub. It does nothing if Vercel already has that URL, and it leaves Vercel
alone if the API never answers.

It reads only the tunnel's current run from the journal (by systemd invocation id), ignores
Cloudflare's own `api.trycloudflare.com` host that cloudflared prints in boot-time errors, and if a
step fails it prints Vercel's error and the unit retries after 2 minutes (at most 5 times an hour).

Install (once, as the dev user):

```bash
cp ops/systemd/solarbud-tunnel.service ops/systemd/solarbud-api-url.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now solarbud-tunnel.service solarbud-api-url.service
```

The updater unit is tied to the tunnel (`PartOf`, `WantedBy`), so every tunnel restart re-runs it.
Check it with `journalctl --user -u solarbud-api-url`. It needs the `vercel` CLI logged in as the dev
user. It runs the script from this working tree (`~/code/SolarBud/ops/`), so keep a checkout that has
`ops/` (that is, `main`) in place. Last applied URL: `~/.local/state/solarbud/api_url` (delete it to
force an update).

## check_site.py

Run by `.github/workflows/site-check.yml` every 2 hours: fails when the public forecast is
unreachable or older than 30 minutes, so GitHub emails the owner.
