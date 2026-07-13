(() => {
  // ../../packages/protocol/dist/version.js
  var PROVIDER_GLOBAL = "claude";

  // ../../packages/sdk/dist/connect-chip.js
  var STYLE = `
:host { all: initial; }
* { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
.chip, .btn { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; border: 0;
  font-size: 13px; font-weight: 600; line-height: 1; border-radius: 10px; }
/* The canonical connect lockup \u2014 the SAME mark + wordmark on every wrapp, so users recognize
   "Connect Switchboard" the way they knew the MetaMask button. Dark pill, lime glyph, locked in
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
    let sessionDisconnected = false;
    let upgradeAsked = false;
    const onDocClick = (e) => {
      if (menuOpen && !host.contains(e.target)) {
        menuOpen = false;
        render();
      }
    };
    document.addEventListener("click", onDocClick);
    function el(tag, cls, text) {
      const n = document.createElement(tag);
      if (cls)
        n.className = cls;
      if (text != null)
        n.textContent = text;
      return n;
    }
    async function refresh() {
      const my = ++seq;
      const r = await whenRelayReady(2500, { installUrl });
      if (destroyed || my !== seq)
        return;
      if (!(r instanceof Relay)) {
        state = { kind: "not-installed", installUrl };
        return render();
      }
      relay = r;
      subscribe(r);
      let grant = sessionDisconnected ? null : await r.permissions().catch(() => null);
      if (destroyed || my !== seq)
        return;
      if (!grant) {
        state = { kind: "disconnected", relay: r };
        emitTransition(false);
        return render();
      }
      const wanted = opts.scope?.contextKinds ?? [];
      const granted = grant.contextKinds;
      const covered = Array.isArray(granted) && (granted.length === 0 || wanted.every((k) => granted.includes(k)));
      if (wanted.length && !covered && !upgradeAsked) {
        upgradeAsked = true;
        const upgraded = await r.connect(opts.scope).catch(() => null);
        if (destroyed || my !== seq)
          return;
        if (upgraded)
          grant = upgraded;
      }
      const wantsContext = opts.context !== "none";
      const [user, project] = await Promise.all([
        r.identity(),
        wantsContext ? r.context.active().catch(() => null) : Promise.resolve(null)
      ]);
      if (destroyed || my !== seq)
        return;
      state = { kind: "connected", relay: r, user, project };
      emitTransition(true);
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
      r.on("disconnect", () => {
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
      } catch {
      }
    }
    async function doPick() {
      if (!relay)
        return;
      menuOpen = false;
      render();
      const project = await relay.context.pick().catch(() => null);
      opts.onProjectChange?.(project);
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
        const b = el("button", "btn get");
        b.append(el("span", "glyph"), el("span", void 0, "Get Switchboard"), el("span", "arr", "\u2197"));
        b.onclick = () => window.open(state.kind === "not-installed" ? state.installUrl : installUrl, "_blank", "noopener");
        mount.append(b);
        return;
      }
      if (state.kind === "disconnected") {
        const b = el("button", "btn connect");
        b.append(el("span", "glyph"), el("span", void 0, "Connect Switchboard"));
        b.onclick = doConnect;
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
        host.remove();
      }
    };
  }

  // ../../packages/sdk/dist/index.js
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
      return {
        get: (key) => req2({ op: "get", key }).then((r) => r.value ?? null),
        set: (key, value) => req2({ op: "set", key, value }).then(() => void 0),
        delete: (key) => req2({ op: "delete", key }).then((r) => r.ok),
        list: () => req2({ op: "list" }).then((r) => r.keys ?? []),
        info: () => req2({ op: "info" }).then((r) => r.info),
        /** Point this app's store at a real folder (triggers a path-consent click). */
        bind: (path) => req2({ op: "bind", path }).then((r) => r.info)
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

  // ../adapter/claude.mjs
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

  // ../adapter/claude_storage.mjs
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

  // src/bootstrap.js
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
