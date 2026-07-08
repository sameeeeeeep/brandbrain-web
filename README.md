# brandbrain-web

Static web deployment of **brandbrain** — the launch & growth companion for consumer (D2C)
brands — ported onto the [Switchboard](https://github.com/sameeeeeeep) BYO-Claude broker and
exported as a fully static site.

**Live:** https://sameeeeeeep.github.io/brandbrain-web/

## What this is

This repo holds the **built static export** produced by the Switchboard Next.js port pipeline
(`examples/brandbrain-port/build.mjs` in the Switchboard/relay project). It is a build artifact,
not source — regenerate it from that pipeline rather than editing files here by hand.

- The **frontend** (pages, styling, navigation, seeded brand library) is fully static and
  renders standalone.
- The **AI features** (market canvas, gaps, analogue, Ask, brand teardowns, etc.) route through
  the Switchboard broker on `window.claude` via `sb/bootstrap.js` + `sb/routes.js`. Without a
  connected broker/extension present, those actions surface an honest "can't reach Claude" error
  instead of generating — the frontend still loads and navigates normally.

## Rebuild

From the Switchboard/relay project:

```bash
PORT_BASE_PATH=/brandbrain-web node examples/brandbrain-port/build.mjs
# then copy examples/brandbrain-port/dist/ into this repo, keeping .nojekyll
```

`PORT_BASE_PATH` prefixes the absolute `/_next` asset URLs so they resolve under the GitHub Pages
project subpath. `.nojekyll` keeps GitHub Pages from stripping the `_next/` directory.
