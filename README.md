# brandbrain-web

Static web deployment of **brandbrain** — the launch & growth companion for consumer (D2C)
brands — ported onto the [Switchboard](https://github.com/sameeeeeeep) BYO-Claude broker and
exported as a fully static site.

**Live:** https://sameeeeeeep.github.io/brandbrain-web/

---

## How this works (read this first)

There is **no backend server**. This site is only static HTML/JS/CSS. brandbrain's API routes were
compiled into the page and run **in your browser tab**; the two things a static file can't do — call
a model and store data — are proxied to **your own machine** through the Switchboard broker:

```
brandbrain UI  →  fetch("/api/…")            ← runs in your tab (no network)
   →  bundled route handler  (sb/routes.js)  ← a static file
       →  window.claude                      ← injected by the Switchboard extension
           →  local Switchboard daemon → your Claude Code CLI
```

So the site runs on **your** Claude, **your** tools, and **your** data. The operator holds nothing
and pays for nothing.

- **The frontend always loads.** Pages, styling, the seeded brand library render with nothing
  installed — open the link and look around.
- **The AI features** (market canvas, gaps, analogue, Ask, teardowns, visuals) need the two pieces
  below. Without them, those actions show an honest "can't reach Claude" message rather than
  generating.

---

## Run it end-to-end (two pieces)

To make the live/AI features work, you need both:

### 1. The Switchboard browser extension
Loaded unpacked (it is not on the Chrome Web Store yet):
1. In the Switchboard repo, build the extension: `packages/extension` (see that repo's build).
2. Chrome → `chrome://extensions` → enable **Developer mode** → **Load unpacked** →
   select `packages/extension`.
3. The extension injects `window.claude` into every page (its content script matches all origins,
   so it works on this github.io site).

### 2. The Switchboard app / sidekick daemon
The local daemon that holds your Claude and fulfills the calls:
1. Start the sidekick daemon (it listens on `ws://127.0.0.1:8787`).
2. **Pair** it with the extension (a pairing token — via the extension popup / side panel).
3. Make sure your **Claude Code CLI is signed in** (the daemon shells out to it).

### 3. Connect on the site
1. Open https://sameeeeeeep.github.io/brandbrain-web/
2. Click **Connect Switchboard** (bottom-right) and approve the scoped consent.
3. Optionally **bind a data folder** (e.g. an existing `~/Documents/Projects/brandbrain/.data`) so
   your real brands appear.

That's it — the app's routes now round-trip through your own Claude.

### Tool-backed features need matching MCP servers
Some features call tools, not just the model: **web search** (Ask, competitor deep-dives), **Shopify**
(connect store, store previews), **Higgsfield** (brand visuals). These only work if you have those MCP
servers configured in your Claude CLI. The plain model round-trip works without them; a missing tool
means "not set up," not "broken."

---

## What renders without a broker

Open the link with nothing installed and you'll still get the full frontend: the Discover library,
the Build/Launch/OS shells, navigation, styling. The **Connect Switchboard** chip sits bottom-right in
its disconnected state. This is the intended "someone I sent the link to" experience until they set up
the two pieces above.

---

## Rebuild / redeploy

This repo holds a **build artifact, not source** — don't hand-edit the files. Regenerate from the
Switchboard port pipeline:

```bash
# in the Switchboard/relay project:
PORT_BASE_PATH=/brandbrain-web node examples/brandbrain-port/build.mjs
# then copy the export into this repo, keep .nojekyll, and push:
cp -R examples/brandbrain-port/dist/. /path/to/brandbrain-web/
touch /path/to/brandbrain-web/.nojekyll
cd /path/to/brandbrain-web && git add -A && git commit -m "rebuild" && git push
```

Two host-specific details this deploy depends on:
- **`PORT_BASE_PATH=/brandbrain-web`** — GitHub Pages serves this at a `/brandbrain-web/` subpath, so
  the export needs that base path or the absolute `/_next` asset URLs 404.
- **`.nojekyll`** — stops GitHub Pages' Jekyll from stripping the `_next/` directory.

Full porting + deployment guide (and the constraints to hold for any app): `docs/PORTING-AND-DEPLOY.md`
in the Switchboard/relay repo.
