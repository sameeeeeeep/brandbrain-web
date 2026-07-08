(() => {
  // packages/protocol/dist/version.js
  var PROVIDER_GLOBAL = "claude";

  // packages/sdk/dist/index.js
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
        pick: () => req2({ op: "pick" }).then((r) => r.context ?? null)
      };
    }
  };
  var DEFAULT_INSTALL_URL = "https://relay.dev/install";
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
  function whenProvider(timeoutMs = 3e3) {
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

  // examples/brandbrain-port/src/bootstrap.js
  function brandToContext(b) {
    const L = b.locks || {};
    const line = (c) => c && (c.title || c.name) || "";
    const palette = L.identity && L.identity.palette || b.palette || [];
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
        palette: Array.isArray(palette) ? palette : [],
        products
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
        await r.context.publish(brandToContext(b));
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
  var bar = () => {
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:99999;display:flex;gap:8px;align-items:center;font:600 12px/1 'Hanken Grotesk',system-ui,sans-serif";
    wrap.innerHTML = `
    <span id="sb-dot" style="width:8px;height:8px;border-radius:50%;background:#6E7C90"></span>
    <span id="sb-status" style="color:#99A3B7">Switchboard</span>
    <input id="sb-folder" placeholder="~/Documents/Projects/brandbrain/.data" value="~/Documents/Projects/brandbrain/.data"
      style="display:none;width:230px;background:#12151C;border:1px solid #262C38;border-radius:8px;color:#E8EDF4;padding:7px 9px;font:500 11px/1 'Spline Sans Mono',monospace" />
    <button id="sb-bind" style="display:none;background:#1A1F29;color:#E8EDF4;border:1px solid #262C38;border-radius:999px;padding:7px 11px;cursor:pointer">Bind</button>
    <button id="sb-connect" style="background:#C8F250;color:#0A0C10;border:0;border-radius:999px;padding:8px 13px;cursor:pointer">Connect Switchboard</button>`;
    document.body.appendChild(wrap);
    return wrap;
  };
  var DEFAULTS = { reason: "brandbrain", models: ["sonnet"], tools: [], storage: {} };
  async function loadManifest() {
    try {
      const r = await fetch("/switchboard.json");
      if (r.ok) return { ...DEFAULTS, ...await r.json() };
    } catch {
    }
    return DEFAULTS;
  }
  var grantCoversTools = (grant, tools) => {
    const have = new Set((grant?.tools || []).map((t) => t.name));
    return tools.every((t) => have.has(t));
  };
  async function main() {
    const manifest = await loadManifest();
    const scope = { reason: manifest.reason, models: manifest.models, tools: manifest.tools };
    const defaultFolder = manifest.storage?.defaultFolder;
    mountRoutes();
    const wrap = bar();
    const $ = (id) => wrap.querySelector(id);
    const setStatus = (t, color) => {
      $("#sb-status").textContent = t;
      $("#sb-dot").style.background = color || "#6E7C90";
    };
    const showFolderRow = () => {
      $("#sb-folder").style.display = "";
      $("#sb-bind").style.display = "";
    };
    const setButton = (label, show) => {
      $("#sb-connect").textContent = label;
      $("#sb-connect").style.display = show ? "" : "none";
    };
    if (defaultFolder) $("#sb-folder").value = defaultFolder;
    async function ensureBound() {
      let info = await storageInfo().catch(() => null);
      showFolderRow();
      if (info && info.folder) $("#sb-folder").value = info.folder;
      if (info && !info.autoAssigned) return info;
      if (!defaultFolder) return info;
      setStatus("approve the folder in Switchboard\u2026", "#F59E0B");
      const bound = await bindFolder(defaultFolder);
      if (!bound) {
        setStatus("connected \xB7 folder not bound", "#F59E0B");
        setButton("Bind data folder", false);
        showFolderRow();
        return info;
      }
      setStatus(`connected \xB7 ${bound.count} record${bound.count === 1 ? "" : "s"}`, "#3DD68C");
      if (bound.count > 0) setTimeout(() => location.reload(), 500);
      return bound;
    }
    async function reflect(r, grant) {
      setProvider(window.claude);
      window.__switchboardRoutes?.mount(window.claude);
      const info = await storageInfo().catch(() => null);
      const hasTools = grantCoversTools(grant, scope.tools);
      const bound = !!info && !info.autoAssigned;
      if (info && info.folder) $("#sb-folder").value = info.folder;
      if (hasTools && bound) {
        showFolderRow();
        setButton("", false);
        const n = await publishBrands(r);
        setStatus(`connected \xB7 ${n} brand${n === 1 ? "" : "s"} shared`, "#3DD68C");
      } else {
        setStatus("connected \xB7 finish setup", "#F59E0B");
        showFolderRow();
        setButton(hasTools ? "Bind data folder" : "Grant tools & folder", true);
      }
    }
    (async () => {
      const r = await whenRelayReady(1500);
      if (!("connect" in r)) {
        abandonProvider();
        return;
      }
      const grant = await r.permissions().catch(() => null);
      if (grant) await reflect(r, grant);
      else {
        abandonProvider();
        setButton("Connect Switchboard", true);
      }
    })();
    $("#sb-connect").addEventListener("click", async () => {
      const r = await whenRelayReady();
      if (!("connect" in r)) {
        setStatus("not installed", "#FF2D6E");
        return;
      }
      try {
        const existing = await r.permissions().catch(() => null);
        const grant = grantCoversTools(existing, scope.tools) ? existing : await r.connect(scope);
        setProvider(window.claude);
        window.__switchboardRoutes?.mount(window.claude);
        setButton("", false);
        const bound = await ensureBound();
        if (bound && !bound.autoAssigned && !(bound.count > 0)) await publishBrands(r);
      } catch (e) {
        setStatus(`connect failed (${e?.code ?? e?.message ?? "?"})`, "#FF2D6E");
      }
    });
    $("#sb-bind").addEventListener("click", async () => {
      const path = $("#sb-folder").value.trim();
      if (!path) return;
      setStatus("approve the folder in Switchboard\u2026", "#F59E0B");
      const info = await bindFolder(path);
      if (!info) {
        setStatus("bind declined", "#FF2D6E");
        return;
      }
      setStatus(`bound \xB7 ${info.count} record${info.count === 1 ? "" : "s"}`, "#3DD68C");
      if (info.count > 0) setTimeout(() => location.reload(), 500);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", main);
  else main();
})();
