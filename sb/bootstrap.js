(() => {
  // packages/protocol/dist/version.js
  var PROVIDER_GLOBAL = "claude";

  // packages/protocol/dist/origins.js
  var VERIFIED_DOMAINS = ["thelastprompt.ai", "sameep.ai"];
  var VERIFIED_EXACT = ["sameeeeeeep.github.io"];
  function isVerifiedOrigin(origin) {
    if (!origin)
      return false;
    let host;
    let protocol;
    try {
      const u = new URL(origin);
      host = u.hostname.toLowerCase();
      protocol = u.protocol;
    } catch {
      return false;
    }
    if (protocol !== "https:")
      return false;
    if (VERIFIED_EXACT.includes(host))
      return true;
    return VERIFIED_DOMAINS.some((d) => host === d || host.endsWith("." + d));
  }

  // packages/protocol/dist/storage.js
  var STORAGE_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
  function isValidStorageKey(key) {
    return typeof key === "string" && STORAGE_KEY_RE.test(key);
  }

  // packages/protocol/dist/errors.js
  var BYOPErrorCode = {
    /** User rejected the connect/consent request. (≈ 4001) */
    USER_REJECTED: 4001,
    /** Origin is not connected / has no grant for this method. (≈ 4100) */
    UNAUTHORIZED: 4100,
    /** Method exists but the origin's scope doesn't cover it (model/tool not granted). */
    SCOPE_EXCEEDED: 4110,
    /** Every model capable of this work is turned OFF in the user's model deny-list
     *  (~/.relay/models.json). Distinct from SCOPE_EXCEEDED: the model IS granted, the user just
     *  globally disabled it (and every allowed substitute) — see docs/MODEL-SELECTION.md §5. The
     *  surface shows "re-enable one in Settings → Models", not a stack trace. */
    NO_ALLOWED_MODEL: 4111,
    /** A per-action write consent was denied by the user. */
    CONSENT_DENIED: 4120,
    /** Budget or rate limit hit (tokens/day or calls/min). */
    BUDGET_EXCEEDED: 4290,
    /** Unknown method. (≈ 4200) */
    UNSUPPORTED_METHOD: 4200,
    /** Bad params. (≈ -32602) */
    INVALID_PARAMS: -32602,
    /** The sidekick daemon is not installed / not reachable. The SDK maps this to its
     *  "install the sidekick" fallback. */
    PROVIDER_UNAVAILABLE: 4900,
    /** Backend error (model/tool failed for a non-policy reason). */
    BACKEND_ERROR: 4500,
    /** guide_run: the on-machine guide runtime never picked up the run (the menubar app isn't
     *  running), or the guide timed out waiting for the human to finish. The wrapp/agent shows
     *  "open Switchboard and try again", not a stack trace. */
    NO_GUIDE_RUNTIME: 4510
  };

  // packages/sdk/dist/connect-chip.js
  function rungFromError(e) {
    if (e?.code !== BYOPErrorCode.PROVIDER_UNAVAILABLE)
      return null;
    return e?.data?.reason === "unpaired" ? { kind: "unpaired" } : { kind: "unreachable" };
  }
  var CHROME_STORE_URL = "https://chromewebstore.google.com/detail/injmjolmnekmahlnackakiamjepegagb";
  var RELAY_DMG_URL = "https://github.com/sameeeeeeep/switchboard/releases/latest/download/Switchboard.dmg";
  var STYLE = `
:host { all: initial; }
* { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
.chip, .btn { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; border: 0;
  font-size: 13px; font-weight: 600; line-height: 1; border-radius: 10px; }
/* The canonical connect lockup \u2014 the SAME mark + wordmark on every wrapp, so users recognize
   "Connect Switchboard" the way they'd know an account button. Dark pill, lime glyph, locked in
   the shadow root so a host app can't restyle it away. */
.btn { padding: 9px 15px 9px 11px; background: #12151C; color: #E8EDF4; border: 1px solid #2C3444; }
.btn.connect:hover { background: #161B24; border-color: #3A4A18; }
.btn.get { color: #C3CAD6; border-color: #262C38; }
.btn.get:hover { color: #E8EDF4; border-color: #3A4353; }
.btn .arr { color: #6E7C90; font-weight: 500; margin-left: -2px; }
/* The Switchboard mark: lime rounded square with the top-right notch (matches the side-panel brand).
   Muted to slate when the sidekick isn't installed yet \u2014 the mark "lights up" once you can connect. */
.glyph { position: relative; width: 16px; height: 16px; border-radius: 5px; background: #C8F250;
  box-shadow: 0 0 12px rgba(200,242,80,.45); flex: none; }
.glyph::after { content: ""; position: absolute; top: 4px; right: 4px; width: 4px; height: 4px;
  border-radius: 50%; background: #0A0C10; }
.btn.get .glyph { background: #6E7C90; box-shadow: none; }
.wrap { position: relative; display: inline-block; }
.chip { background: #1A1F29; border: 1px solid #262C38; padding: 6px 10px 6px 7px; color: #E8EDF4; }
.chip:hover { border-color: #3A4353; }
.av { width: 26px; height: 26px; border-radius: 7px; background: #C8F250; color: #0A0C10; display: grid;
  place-items: center; font-weight: 700; font-size: 12px; overflow: hidden; flex: none; }
.av img { width: 100%; height: 100%; object-fit: cover; }
.who { display: flex; flex-direction: column; gap: 3px; min-width: 0; text-align: left; }
.who .hi { font-size: 12.5px; font-weight: 600; white-space: nowrap; }
.who .proj { font-size: 10.5px; font-weight: 500; color: #99A3B7; white-space: nowrap; }
.caret { color: #6E7C90; font-size: 9px; margin-left: 2px; }
.verified { display: inline-flex; align-items: center; gap: 3px; font-size: 9.5px; font-weight: 700;
  color: #C8F250; background: rgba(200,242,80,.10); border: 1px solid rgba(200,242,80,.22);
  border-radius: 999px; padding: 1px 6px 1px 5px; letter-spacing: .01em; white-space: nowrap; width: max-content; }
.verified .vk { font-size: 8.5px; line-height: 1; }
.connect-row { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 5px; }
.menu { position: absolute; top: calc(100% + 6px); right: 0; z-index: 2147483000; width: 232px;
  background: #1A1F29; border: 1px solid #262C38; border-radius: 12px; padding: 7px;
  box-shadow: 0 18px 40px -20px rgba(0,0,0,.7); }
.menu .lbl { padding: 8px 10px 6px; font-size: 10px; font-weight: 600; letter-spacing: .06em;
  text-transform: uppercase; color: #6E7C90; }
.menu .proj-row { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px;
  background: #20262F; cursor: pointer; border: 0; width: 100%; color: #E8EDF4; font-size: 13px; font-weight: 600; }
.menu .proj-row:hover { background: #262d38; }
.menu .proj-row .go { margin-left: auto; color: #C8F250; font-size: 11px; font-weight: 600; }
.menu .sep { height: 1px; background: #262C38; margin: 6px 4px; }
.menu .item { display: block; width: 100%; text-align: left; padding: 8px 10px; border: 0; border-radius: 8px;
  background: transparent; color: #B4BECE; font-size: 13px; font-weight: 500; cursor: pointer; }
.menu .item:hover { background: #20262F; color: #E8EDF4; }
.menu .foot { padding: 8px 10px 4px; font-size: 11px; font-weight: 500; color: #6E7C90; line-height: 1.4; }
/* Setup-ladder pills (sidekick asleep / unpaired): quiet and informative, never red \u2014 nothing is
   broken. Amber only while the daemon is unreachable; the glyph stays muted until it's reachable. */
.dot { width: 7px; height: 7px; border-radius: 50%; background: #E8B84B; flex: none;
  box-shadow: 0 0 8px rgba(232,184,75,.45); }
.menu .body { padding: 8px 10px 2px; font-size: 12px; font-weight: 500; color: #B4BECE; line-height: 1.45; }
`;
  function mountConnect(target, opts = {}) {
    const installUrl = opts.installUrl ?? "https://thelastprompt.ai/switchboard/";
    const host = document.createElement("div");
    host.style.display = "inline-block";
    const root = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE;
    root.append(style);
    const mount = document.createElement("div");
    root.append(mount);
    target.append(host);
    let state = { kind: "booting" };
    let menuOpen = false;
    let destroyed = false;
    let relay = null;
    let seq = 0;
    let wasConnected = false;
    let lastProjectKey;
    let sessionDisconnected = false;
    const onDocClick = (e) => {
      if (menuOpen && !host.contains(e.target)) {
        menuOpen = false;
        render();
      }
    };
    document.addEventListener("click", onDocClick);
    const initEvent = `${PROVIDER_GLOBAL}#initialized`;
    let lateWatching = false;
    const onLateInit = () => {
      lateWatching = false;
      window.removeEventListener(initEvent, onLateInit);
      if (!destroyed)
        void refresh();
    };
    function watchForLateProvider() {
      if (lateWatching || destroyed)
        return;
      lateWatching = true;
      window.addEventListener(initEvent, onLateInit);
    }
    function el(tag, cls, text) {
      const n = document.createElement(tag);
      if (cls)
        n.className = cls;
      if (text != null)
        n.textContent = text;
      return n;
    }
    const isVerified = isVerifiedOrigin(location.origin);
    function mkVerified() {
      const v = el("span", "verified");
      v.append(el("span", "vk", "\u2713"), el("span", void 0, "Verified"));
      v.title = "Official Switchboard app \u2014 safe to connect your Claude.";
      return v;
    }
    async function refresh() {
      const my = ++seq;
      const r = await whenRelayReady(2500, { installUrl });
      if (destroyed || my !== seq)
        return;
      if (!(r instanceof Relay)) {
        watchForLateProvider();
        state = { kind: "not-installed", installUrl };
        return render();
      }
      relay = r;
      subscribe(r);
      const h = await r.health();
      if (destroyed || my !== seq)
        return;
      if (h && !h.reachable) {
        state = { kind: "unreachable", appMissing: h.installedHere === false };
        emitTransition(false);
        return render();
      }
      if (h && !h.paired) {
        state = { kind: "unpaired" };
        emitTransition(false);
        return render();
      }
      let permErr = null;
      const grant = sessionDisconnected ? null : await r.permissions().catch((e) => {
        permErr = e;
        return null;
      });
      if (destroyed || my !== seq)
        return;
      if (!grant) {
        const rung = !h ? rungFromError(permErr) : null;
        if (rung) {
          state = rung;
          emitTransition(false);
          return render();
        }
        state = { kind: "disconnected", relay: r };
        emitTransition(false);
        return render();
      }
      const wantsContext = opts.context !== "none";
      const [capabilities, project] = await Promise.all([
        r.capabilities().catch(() => null),
        wantsContext ? r.context.active().catch(() => null) : Promise.resolve(null)
      ]);
      if (destroyed || my !== seq)
        return;
      const wasAlreadyConnected = wasConnected;
      const model = capabilities?.sessionModelPinning ? capabilities.defaultModel ?? null : grant.modelOverride ?? grant.models[0] ?? null;
      state = { kind: "connected", relay: r, user: capabilities?.user ?? null, project, model };
      emitTransition(true);
      const projKey = project ? project.id ?? project.name : null;
      if (wasAlreadyConnected && lastProjectKey !== void 0 && projKey !== lastProjectKey)
        opts.onProjectChange?.(project);
      lastProjectKey = projKey;
      render();
    }
    function emitTransition(connected) {
      if (connected === wasConnected)
        return;
      wasConnected = connected;
      if (connected && relay)
        opts.onConnect?.(relay);
      else if (!connected)
        opts.onDisconnect?.();
    }
    let subscribed = false;
    function subscribe(r) {
      if (subscribed)
        return;
      subscribed = true;
      r.on("permissionsChanged", () => {
        void refresh();
      });
      r.on("capabilitiesChanged", () => {
        void refresh();
      });
      r.on("connect", () => {
        void refresh();
      });
      r.on("disconnect", () => {
        void refresh();
      });
      r.on("health", () => {
        void refresh();
      });
    }
    async function doConnect() {
      if (!relay)
        return;
      try {
        sessionDisconnected = false;
        await relay.connect(opts.scope);
        await refresh();
      } catch (e) {
        const err = e;
        if (err?.code !== BYOPErrorCode.PROVIDER_UNAVAILABLE)
          return;
        await refresh();
        if (state.kind === "disconnected") {
          const rung = rungFromError(err);
          if (rung) {
            state = rung;
            emitTransition(false);
            render();
          }
        }
      }
    }
    async function doPick() {
      if (!relay)
        return;
      menuOpen = false;
      render();
      await relay.context.pick().catch(() => null);
      await refresh();
    }
    async function doDisconnect() {
      if (!relay)
        return;
      menuOpen = false;
      sessionDisconnected = true;
      await relay.disconnect().catch(() => {
      });
      await refresh();
    }
    function render() {
      if (destroyed)
        return;
      mount.textContent = "";
      if (state.kind === "booting")
        return;
      if (state.kind === "not-installed") {
        const url = state.installUrl;
        const wrap2 = el("div", "wrap");
        const b = el("button", "btn get");
        b.append(el("span", "glyph"), el("span", void 0, "Open in Switchboard"), el("span", "arr", "\u2197"));
        b.onclick = (e) => {
          e.stopPropagation();
          let left = false;
          const onHide = () => {
            left = true;
          };
          document.addEventListener("visibilitychange", onHide, { once: true });
          window.addEventListener("blur", onHide, { once: true });
          try {
            const here = location.href;
            location.href = "switchboard://open?url=" + encodeURIComponent(here) + "&name=" + encodeURIComponent(document.title || location.hostname);
          } catch {
          }
          window.setTimeout(() => {
            document.removeEventListener("visibilitychange", onHide);
            if (!left)
              window.open(url, "_blank", "noopener");
          }, 1200);
        };
        const caret = el("button", "btn caret", "\u2304");
        caret.onclick = (e) => {
          e.stopPropagation();
          menuOpen = !menuOpen;
          render();
        };
        wrap2.append(b, caret);
        if (menuOpen) {
          const menu = el("div", "menu");
          menu.append(el("div", "body", "Opens this page as a Mac app on your own AI. Don't have it yet?"));
          const guide = el("button", "item", "Get Switchboard for Mac \u2197");
          guide.onclick = () => {
            menuOpen = false;
            render();
            window.open(url, "_blank", "noopener");
          };
          const store = el("button", "item", "Prefer your browser? Add to Chrome \u2197");
          store.onclick = () => {
            menuOpen = false;
            render();
            window.open(CHROME_STORE_URL, "_blank", "noopener");
          };
          menu.append(guide, store);
          wrap2.append(menu);
        }
        mount.append(wrap2);
        return;
      }
      if (state.kind === "unreachable") {
        const appMissing = state.appMissing === true;
        const wrap2 = el("div", "wrap");
        const b = el("button", "btn get");
        b.append(el("span", "glyph"), el("span", void 0, appMissing ? "Get Switchboard for Mac" : "Your sidekick is asleep"), el("span", appMissing ? "arr" : "dot", appMissing ? "\u2197" : void 0), ...appMissing ? [] : [el("span", "caret", "\u25BE")]);
        b.onclick = (e) => {
          e.stopPropagation();
          menuOpen = !menuOpen;
          render();
        };
        wrap2.append(b);
        if (menuOpen) {
          const menu = el("div", "menu");
          if (appMissing) {
            menu.append(el("div", "body", "Extension \u2713 \u2014 now the other half: Switchboard, the Mac app that holds your Claude."));
            const dl = el("button", "item", "Download Switchboard.dmg \u2197");
            dl.onclick = () => {
              menuOpen = false;
              render();
              window.open(RELAY_DMG_URL, "_blank", "noopener");
            };
            menu.append(dl, el("div", "sep"));
          } else {
            menu.append(el("div", "body", "Open the Switchboard menubar app to wake it."));
            const retry = el("button", "item", "Retry");
            retry.onclick = () => {
              menuOpen = false;
              render();
              void refresh();
            };
            menu.append(retry, el("div", "sep"));
          }
          const setup = el("button", "item", "New here? Full setup \u2197");
          setup.onclick = () => {
            menuOpen = false;
            render();
            window.open(installUrl, "_blank", "noopener");
          };
          menu.append(setup);
          wrap2.append(menu);
        }
        mount.append(wrap2);
        return;
      }
      if (state.kind === "unpaired") {
        const wrap2 = el("div", "wrap");
        const b = el("button", "btn connect");
        b.append(el("span", "glyph"), el("span", void 0, "Almost there \u2014 pair in the side panel"), el("span", "caret", "\u25BE"));
        b.onclick = (e) => {
          e.stopPropagation();
          menuOpen = !menuOpen;
          render();
        };
        wrap2.append(b);
        if (menuOpen) {
          const menu = el("div", "menu");
          menu.append(el("div", "body", "Click the Switchboard icon in your Chrome toolbar and paste your pairing token."));
          const retry = el("button", "item", "Retry");
          retry.onclick = () => {
            menuOpen = false;
            render();
            void refresh();
          };
          menu.append(retry);
          wrap2.append(menu);
        }
        mount.append(wrap2);
        return;
      }
      if (state.kind === "disconnected") {
        const b = el("button", "btn connect");
        b.append(el("span", "glyph"), el("span", void 0, "Connect Switchboard"));
        b.onclick = doConnect;
        if (isVerified) {
          const row = el("div", "connect-row");
          row.append(mkVerified(), b);
          mount.append(row);
        } else
          mount.append(b);
        return;
      }
      const { user, project } = state;
      const rawName = user?.name?.trim();
      const collides = !!rawName && !!project?.name && rawName.toLowerCase() === project.name.toLowerCase();
      const name = !rawName || collides ? "there" : rawName;
      const wrap = el("div", "wrap");
      const chip = el("button", "chip");
      const av = el("div", "av");
      if (user?.avatar) {
        const img = el("img");
        img.src = user.avatar;
        img.alt = name;
        av.append(img);
      } else
        av.textContent = name.charAt(0).toUpperCase();
      const wantsContext = opts.context !== "none";
      const who = el("div", "who");
      who.append(el("div", "hi", `Hi ${name}`));
      who.append(el("div", "proj", wantsContext ? project ? project.name : "No context lent" : "Connected"));
      if (isVerified)
        who.append(mkVerified());
      chip.append(av, who, el("span", "caret", "\u25BE"));
      chip.onclick = (e) => {
        e.stopPropagation();
        menuOpen = !menuOpen;
        render();
      };
      wrap.append(chip);
      if (menuOpen) {
        const menu = el("div", "menu");
        if (wantsContext) {
          menu.append(el("div", "lbl", "Working on"));
          const row = el("button", "proj-row");
          row.append(el("span", void 0, project ? project.name : "Choose a context"));
          row.append(el("span", "go", project ? "Switch \u25B8" : "Choose \u25B8"));
          row.onclick = doPick;
          menu.append(row, el("div", "sep"));
        }
        const dc = el("button", "item", "Disconnect this app");
        dc.onclick = doDisconnect;
        menu.append(el("div", "lbl", "New conversations"));
        const modelChoice = el("button", "item", `${state.model ?? "Choose an available model"} \xB7 Change\u2026`);
        modelChoice.onclick = () => {
          menuOpen = false;
          render();
          void doConnect();
        };
        menu.append(modelChoice, el("div", "foot", "Conversations keep their starting model. Change the default at the connection notch."), el("div", "sep"));
        menu.append(dc);
        menu.append(el("div", "foot", "Connectors, budgets & activity live in the Switchboard toolbar panel."));
        wrap.append(menu);
      }
      mount.append(wrap);
    }
    render();
    void refresh();
    return {
      refresh: () => void refresh(),
      destroy: () => {
        destroyed = true;
        document.removeEventListener("click", onDocClick);
        window.removeEventListener(initEvent, onLateInit);
        host.remove();
      }
    };
  }

  // packages/sdk/dist/index.js
  var warnedStorageKeys = /* @__PURE__ */ new Set();
  function warnBadStorageKey(key) {
    if (isValidStorageKey(key) || warnedStorageKeys.has(key))
      return;
    warnedStorageKeys.add(key);
    const suggestion = String(key).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[^A-Za-z0-9]+/, "") || "key";
    console.warn(`[relay.storage] invalid key ${JSON.stringify(key)} \u2014 this write/read WILL be rejected by the daemon and silently do nothing.
  Keys map 1:1 to files (<key>.json) in this origin's folder, so they must match ${STORAGE_KEY_RE}.
  ":" is not allowed (illegal on NTFS; "a:b" is Alternate Data Stream syntax on Windows). Try ${JSON.stringify(suggestion)}.`);
  }
  var Relay = class {
    provider;
    constructor(provider2) {
      this.provider = provider2;
    }
    get version() {
      return this.provider.version;
    }
    capabilities() {
      return this.provider.request({ method: "claude_capabilities" });
    }
    connect(scope) {
      return this.provider.request({ method: "claude_connect", params: scope });
    }
    /** Drop this app's connection for the current page session. The grant persists (a later connect()
     *  won't reprompt) — this is "disconnect from this tab", not "revoke". Full revoke lives in the panel. */
    disconnect() {
      return this.provider.request({ method: "claude_disconnect" });
    }
    permissions() {
      return this.provider.request({ method: "claude_permissions" });
    }
    /** The setup-ladder snapshot (reachable/paired/connected), answered by the EXTENSION from its
     *  own state — never the daemon — so it resolves fast (<1s) in every degraded state, including
     *  the ones where every other method would hang. Resolves null when the extension is too old to
     *  know `claude_health` (or its worker is unreachable): callers MUST treat null as "unknown"
     *  and fall back to probing permissions() exactly as before — that skew guard is load-bearing
     *  while store users run an older extension against newer app bundles. */
    health() {
      const answer = this.provider.request({ method: "claude_health" }).catch(() => null);
      const timer = new Promise((resolve) => setTimeout(() => resolve(null), 1500));
      return Promise.race([answer, timer]);
    }
    /** The paired user's public identity (name/avatar), or null if unavailable. Convenience over
     *  capabilities().user — what the connect chip greets with ("Hi Sameep"). */
    identity() {
      return this.capabilities().then((c) => c.user ?? null).catch(() => null);
    }
    /** Synthesize speech ON-DEVICE via a local model/engine (no cloud, no connector, no credits).
     *  Returns audio as a playable data: URL, or null if no local TTS is available.
     *
     *    const clip = await relay.speak("hey, it's Maya");
     *    if (clip) new Audio(clip.audio).play();
     */
    speak(text, opts) {
      return this.provider.request({ method: "claude_speak", params: { text, voice: opts?.voice } }).catch(() => null);
    }
    /** Transcribe an inline audio data URL using the user's configured local recognizer.
     * Check capabilities().local?.stt first. No microphone access is requested by the SDK. */
    transcribe(audio, opts) {
      return this.provider.request({ method: "claude_transcribe", params: { audio, language: opts?.language } });
    }
    listTools() {
      return this.provider.request({ method: "claude_listTools" }).then((r) => r.tools);
    }
    callTool(name, args) {
      const call = { name, arguments: args };
      return this.provider.request({ method: "claude_callTool", params: call });
    }
    complete(params) {
      return this.provider.request({ method: "claude_complete", params });
    }
    /** Streamed completion as an async iterator of deltas. Ends after a `done`/`error` delta. */
    async *stream(params) {
      const { streamId } = await this.provider.request({ method: "claude_stream", params });
      const queue = [];
      let notify = null;
      let ended = false;
      const handler = (payload) => {
        const p = payload;
        if (p.streamId !== streamId)
          return;
        queue.push(p);
        if (p.type === "done" || p.type === "error")
          ended = true;
        notify?.();
      };
      this.provider.on("delta", handler);
      try {
        while (true) {
          if (queue.length === 0) {
            if (ended)
              break;
            await new Promise((r) => notify = r);
            notify = null;
            continue;
          }
          yield queue.shift();
        }
      } finally {
        this.provider.removeListener("delta", handler);
      }
    }
    on(event, handler) {
      this.provider.on(event, handler);
    }
    /**
     * Per-origin local storage — a private on-disk key/value store for this app, plus `bind` to point
     * it at a real folder the user picks. Values are opaque strings (store JSON). Isolated per origin;
     * reads are free, writes need the site not to be read-only, and `bind` prompts for the exact path.
     *
     *   await relay.storage.set("workspace", JSON.stringify(data));
     *   const raw = await relay.storage.get("workspace");
     *   await relay.storage.bind("~/Documents/Projects/brandbrain/.data"); // existing files appear as records
     */
    get storage() {
      const req2 = (params) => this.provider.request({ method: "claude_storage", params });
      const k = (key) => {
        warnBadStorageKey(key);
        return key;
      };
      return {
        get: (key) => req2({ op: "get", key: k(key) }).then((r) => r.value ?? null),
        set: (key, value) => req2({ op: "set", key: k(key), value }).then(() => void 0),
        delete: (key) => req2({ op: "delete", key: k(key) }).then((r) => r.ok),
        list: () => req2({ op: "list" }).then((r) => r.keys ?? []),
        info: () => req2({ op: "info" }).then((r) => r.info),
        /** Point this app's store at a real folder (triggers a path-consent click). */
        bind: (path) => req2({ op: "bind", path }).then((r) => r.info),
        /** Open a NATIVE folder chooser on the daemon's machine (macOS today). The user picking a
         *  folder in an OS dialog that names this origin IS the path consent, so a successful pick
         *  comes back already bound. Resolves undefined on cancel or when no native picker exists —
         *  keep a typed-path `bind` as the fallback UI. */
        pick: (reason) => req2({ op: "pick", reason }).then((r) => r.info).catch(() => void 0)
      };
    }
    /**
     * Shared, cross-app context — your portable brand knowledge. Publish a whole context; read the one
     * the user selected for this app; or open the picker. Selection happens in the side panel, so an
     * app only ever receives the context the user chose to lend it — never the whole library.
     *
     *   await relay.context.publish({ name: "Aamras", kind: "brand", data: brand });
     *   const active = await relay.context.active();   // the brand the user loaded for this app, or null
     */
    get context() {
      const req2 = (params) => this.provider.request({ method: "claude_context", params });
      return {
        publish: (context) => req2({ op: "publish", context }).then((r) => r.id),
        list: () => req2({ op: "list" }).then((r) => r.contexts ?? []),
        active: () => req2({ op: "active" }).then((r) => r.context ?? null),
        pick: () => req2({ op: "pick" }).then((r) => r.context ?? null),
        /** Read ONE context listed via `list()` in full, and make it this app's selection. Needs the
         *  kind granted at connect (ScopeRequest.contextKinds) — powers in-app brand dropdowns. */
        use: (id) => req2({ op: "use", id }).then((r) => r.context ?? null)
      };
    }
  };
  var DEFAULT_INSTALL_URL = "https://thelastprompt.ai/switchboard/";
  function getRelay(opts) {
    const provider2 = globalThis[PROVIDER_GLOBAL];
    if (provider2?.isRelay)
      return new Relay(provider2);
    return { installed: false, installUrl: opts?.installUrl ?? DEFAULT_INSTALL_URL };
  }
  function whenRelayReady(timeoutMs = 3e3, opts) {
    const now = getRelay(opts);
    if (now instanceof Relay)
      return Promise.resolve(now);
    return new Promise((resolve) => {
      const onInit = () => {
        cleanup();
        resolve(getRelay(opts));
      };
      const timer = setTimeout(() => {
        cleanup();
        resolve({ installed: false, installUrl: opts?.installUrl ?? DEFAULT_INSTALL_URL });
      }, timeoutMs);
      function cleanup() {
        clearTimeout(timer);
        window.removeEventListener(`${PROVIDER_GLOBAL}#initialized`, onInit);
      }
      window.addEventListener(`${PROVIDER_GLOBAL}#initialized`, onInit);
    });
  }

  // examples/adapter/claude.mjs
  var provider = typeof window !== "undefined" && window.claude && window.claude.isRelay ? window.claude : null;
  var _resolveReady;
  var _ready = new Promise((r) => {
    _resolveReady = r;
  });
  function setProvider(p) {
    provider = p;
    if (p && _resolveReady) {
      _resolveReady(p);
      _resolveReady = null;
    }
  }
  function getProvider() {
    return provider;
  }
  function whenProvider(timeoutMs = 15e3) {
    if (provider) return Promise.resolve(provider);
    return Promise.race([_ready, new Promise((r) => setTimeout(() => r(provider), timeoutMs))]);
  }
  function abandonProvider() {
    if (_resolveReady) {
      _resolveReady(null);
      _resolveReady = null;
    }
  }

  // examples/adapter/claude_storage.mjs
  async function req(params) {
    const provider2 = getProvider() || await whenProvider();
    if (!provider2) throw new Error("no provider \u2014 call setProvider(window.claude) after connect");
    return provider2.request({ method: "claude_storage", params });
  }
  async function storageGet(key) {
    const r = await req({ op: "get", key });
    return r?.value ?? null;
  }
  async function storageInfo() {
    const r = await req({ op: "info" });
    return r?.info ?? null;
  }
  async function bindFolder(path) {
    try {
      const r = await req({ op: "bind", path });
      return r?.info ?? null;
    } catch {
      return null;
    }
  }
  var workspaceRead = false;
  var workspaceLost = false;
  function workspaceLoadLost() {
    return workspaceLost && !workspaceRead;
  }

  // examples/brandbrain-port/src/bootstrap.js
  function flattenPalette(raw) {
    const flat = [], rich = [];
    for (const p of Array.isArray(raw) ? raw : []) {
      if (typeof p === "string" && p.trim()) flat.push(p.trim());
      else if (p && typeof p.hex === "string" && p.hex.trim()) {
        flat.push(p.hex.trim());
        rich.push({ name: String(p.name || "").trim(), hex: p.hex.trim() });
      }
    }
    return { flat, rich };
  }
  function brandToContext(b) {
    const L = b.locks || {};
    const line = (c) => c && (c.title || c.name) || "";
    const { flat: palette, rich: paletteRich } = flattenPalette(L.identity && L.identity.palette || b.palette || []);
    const products = [line(L.range), line(L.format), b.idea].filter(Boolean);
    return {
      id: b.id,
      // stable → re-publish updates in place, never duplicates
      name: b.name || "Brand",
      kind: "brand",
      data: {
        voice: line(L.voice) || b.brief && b.brief.vibe || "",
        positioning: line(L.positioning) || "",
        audience: line(L.audience) || b.brief && b.brief.audience || "",
        palette,
        ...paletteRich.length ? { paletteRich } : {},
        products
      }
    };
  }
  function ideaToContext(b) {
    const L = b.locks || {};
    const line = (c) => c && (c.title || c.name) || "";
    const body = (c) => c && c.body || "";
    const decisions = {};
    for (const id of Object.keys(L)) {
      const c = L[id];
      if (c && (c.title || c.body)) decisions[id] = { title: line(c), body: body(c) };
    }
    return {
      id: b.id,
      // stable → re-publish updates in place
      name: b.name || "Idea",
      kind: "idea",
      data: {
        idea: b.idea || "",
        category: b.template || "general",
        market: b.brief && b.brief.market || "",
        problem: body(L.problem) || line(L.problem),
        insight: body(L.insight) || line(L.insight),
        solution: line(L.solution),
        model: line(L.model),
        moat: line(L.moat),
        decisions
        // the whole playbook, for a downstream tool to reason over
      }
    };
  }
  async function publishBrands(r) {
    try {
      const raw = await storageGet("workspace");
      const ws = raw ? JSON.parse(raw) : null;
      const brands = Array.isArray(ws && ws.brands) ? ws.brands : [];
      let n = 0;
      for (const b of brands) if (b && b.name) {
        await r.context.publish(b.kind === "idea" ? ideaToContext(b) : brandToContext(b));
        n++;
      }
      return n;
    } catch {
      return 0;
    }
  }
  function mountRoutes() {
    try {
      window.__switchboardRoutes?.mount(null);
    } catch {
    }
  }
  var DEFAULTS = { reason: "brandbrain", models: ["sonnet"], tools: [], storage: {} };
  var BASE = "";
  async function loadManifest() {
    try {
      const r = await fetch(`${BASE}/switchboard.json`);
      if (r.ok) return { ...DEFAULTS, ...await r.json() };
    } catch {
    }
    return DEFAULTS;
  }
  async function main() {
    const manifest = await loadManifest();
    const scope = { reason: manifest.reason, models: manifest.models, tools: manifest.tools };
    const defaultFolder = manifest.storage?.defaultFolder;
    mountRoutes();
    let wired = false;
    const wireProvider = () => {
      if (wired) return;
      wired = true;
      setProvider(window.claude);
      window.__switchboardRoutes?.mount(window.claude);
    };
    function rehydrate() {
      if (sessionStorage.getItem("sb:rehydrated")) return;
      sessionStorage.setItem("sb:rehydrated", "1");
      location.reload();
    }
    let connected = false;
    async function afterConnect(relay, fresh = false) {
      if (connected) return;
      connected = true;
      wireProvider();
      const info = await storageInfo().catch(() => null);
      if (defaultFolder && info && info.autoAssigned) {
        const bound = await bindFolder(defaultFolder).catch(() => null);
        if (bound && bound.count > 0) {
          rehydrate();
          return;
        }
      }
      await publishBrands(relay);
      if (fresh || workspaceLoadLost()) rehydrate();
    }
    const dock = document.createElement("div");
    dock.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:2147483000";
    document.body.appendChild(dock);
    mountConnect(dock, { scope, context: "none", onConnect: (relay) => {
      void afterConnect(relay, true);
    } });
    (async () => {
      const r = await whenRelayReady(1500);
      if (!(r && "connect" in r)) {
        abandonProvider();
        return;
      }
      const grant = await r.permissions().catch(() => null);
      if (grant) await afterConnect(r);
      else abandonProvider();
    })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", main);
  else main();
})();
