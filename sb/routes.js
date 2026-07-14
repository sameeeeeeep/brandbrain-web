globalThis.process=globalThis.process||{env:{},cwd:function(){return '/'},platform:'browser'};globalThis.global=globalThis;
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

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
  var wantsTools = (opts) => !!opts.mcp || !!(opts.allowedTools && opts.allowedTools.length);
  async function runClaude(prompt5, opts = {}) {
    if (!provider) return null;
    try {
      const r = await provider.request({
        method: "claude_complete",
        params: { prompt: prompt5, system: opts.system, model: opts.model, effort: opts.effort, agentic: wantsTools(opts) }
      });
      return typeof r?.text === "string" ? r.text : null;
    } catch {
      return null;
    }
  }
  function runClaudeStream(prompt5, opts = {}) {
    const enc = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        if (!provider) {
          controller.close();
          return;
        }
        const send = (o) => {
          try {
            controller.enqueue(enc.encode(JSON.stringify(o) + "\n"));
          } catch {
          }
        };
        let streamId;
        const onDelta = (d) => {
          if (!streamId || d.streamId !== streamId) return;
          if (d.type === "text") send({ type: "text", text: d.text });
          else if (d.type === "sources") send({ type: "sources", urls: d.urls });
          else if (d.type === "done" || d.type === "error") {
            provider.removeListener?.("delta", onDelta);
            try {
              controller.close();
            } catch {
            }
          }
        };
        provider.on("delta", onDelta);
        try {
          const res = await provider.request({ method: "claude_stream", params: { prompt: prompt5, system: opts.system, model: opts.model, effort: opts.effort, agentic: wantsTools(opts) } });
          streamId = res?.streamId;
        } catch {
          provider.removeListener?.("delta", onDelta);
          try {
            controller.close();
          } catch {
          }
        }
      }
    });
  }
  function extractJson(text) {
    const cleaned = String(text).replace(/```(?:json)?/gi, "").trim();
    const start = cleaned.search(/[{[]/);
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  // examples/adapter/router.mjs
  function createApp(routes2, { prefix = "/api" } = {}) {
    return {
      prefix,
      async handle(req2) {
        const url2 = new URL(req2.url, "http://switchboard.local");
        const mod = routes2[url2.pathname];
        if (!mod) return new Response("not found", { status: 404 });
        const handler = mod[req2.method] || mod[req2.method?.toUpperCase?.()];
        if (typeof handler !== "function") return new Response("method not allowed", { status: 405 });
        try {
          return await handler(req2);
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { "content-type": "application/json" } });
        }
      }
    };
  }
  function installFetchShim(app) {
    const dispatch = (input, init) => {
      const raw = typeof input === "string" ? input : input.url;
      return app.handle(new Request(raw, init));
    };
    if (typeof window !== "undefined" && Array.isArray(window.__sbQ)) {
      window.__sbRoute = dispatch;
      for (const [input, init, res, rej] of window.__sbQ.splice(0)) dispatch(input, init).then(res, rej);
      return;
    }
    const orig = globalThis.fetch?.bind(globalThis);
    globalThis.fetch = (input, init) => {
      const raw = typeof input === "string" ? input : input.url;
      let path;
      try {
        path = new URL(raw, location.href).pathname;
      } catch {
        path = raw;
      }
      if (path.startsWith(app.prefix)) return app.handle(new Request(raw, init));
      return orig ? orig(input, init) : Promise.reject(new Error("no network in sandbox"));
    };
  }

  // ../brandbrain/app/api/ask/route.ts
  var route_exports = {};
  __export(route_exports, {
    POST: () => POST,
    maxDuration: () => maxDuration,
    runtime: () => runtime
  });

  // examples/brandbrain-port/.build/lib/seed/brands.ts
  var part = (key, label, value) => ({ key, label, value });
  var brands = [
    {
      slug: "liquid-death",
      name: "Liquid Death",
      category: "Beverages",
      market: "US",
      positioning: "Murder your thirst \u2014 an entertainment brand wrapped around canned water.",
      steal: "Personality can be the moat in a commodity.",
      connections: 6,
      parts: [
        part("positioning", "Positioning", "An irreverent entertainment brand that happens to sell water and iced tea."),
        part("audience", "Audience", "Young, ad-cynical men who hate being marketed to."),
        part("angle", "Angle", "Comedy and heavy-metal theatrics instead of health claims."),
        part("product", "Product format", "Tallboy cans, not bottles \u2014 it reads like a beer."),
        part("voice", "Brand voice", "Profane, absurdist, self-aware; sells merch like a band."),
        part("distribution", "Distribution", "DTC + mass retail (Whole Foods, 7-Eleven) + on-premise.")
      ],
      uses: { growthAgency: "ag-pilothouse", designStudio: "ag-gander", copacker: "vd-qcopack", software: ["sw-shopify", "sw-klaviyo"], creators: ["cr-deathsquad"], retailers: ["Whole Foods", "7-Eleven"] }
    },
    {
      slug: "olipop",
      name: "Olipop",
      category: "Beverages",
      market: "US",
      positioning: "A new kind of soda \u2014 prebiotic, low sugar, nostalgic flavors.",
      steal: "Reframe a guilty pleasure as a functional upgrade.",
      connections: 6,
      parts: [
        part("positioning", "Positioning", "Soda you can feel good about \u2014 gut health via prebiotic fiber."),
        part("audience", "Audience", "Millennials cutting soda but craving the ritual."),
        part("angle", "Angle", "Function (gut health) wrapped in nostalgia (root beer, cream soda)."),
        part("product", "Product format", "Slim cans with retro-modern design."),
        part("voice", "Brand voice", "Warm, science-light, optimistic."),
        part("distribution", "Distribution", "DTC + grocery (Target, Kroger) heavy.")
      ],
      uses: { growthAgency: "ag-commonthread", prAgency: "ag-smallgirls", copacker: "vd-qcopack", software: ["sw-shopify", "sw-recharge"], creators: ["cr-gutcheck"], retailers: ["Target", "Kroger"] }
    },
    {
      slug: "glossier",
      name: "Glossier",
      category: "Beauty",
      market: "US",
      positioning: "Skin first, makeup second \u2014 beauty inspired by real life.",
      steal: "Build the audience and content engine before the product.",
      connections: 5,
      parts: [
        part("positioning", "Positioning", "A beauty brand born from a community, not a lab."),
        part("audience", "Audience", "Millennial/Gen-Z who want a natural 'you but better' look."),
        part("angle", "Angle", "Community-led; customers co-create the products."),
        part("product", "Product format", "Minimal, millennial-pink, giftable packaging."),
        part("voice", "Brand voice", "Friendly, intimate, peer-to-peer."),
        part("distribution", "Distribution", "DTC-first, then flagship retail.")
      ],
      uses: { designStudio: "ag-order", prAgency: "ag-derris", software: ["sw-shopify", "sw-yotpo"], creators: ["cr-dewy"] }
    },
    {
      slug: "sugar",
      name: "Sugar Cosmetics",
      category: "Beauty",
      market: "India",
      positioning: "Bold, high-performance color for the unapologetic woman.",
      steal: "Go omnichannel early \u2014 shelves build trust ads can't.",
      connections: 5,
      parts: [
        part("positioning", "Positioning", "Premium-feel makeup at an accessible price, made for Indian skin."),
        part("audience", "Audience", "Urban millennial women across tier-1 and tier-2 India."),
        part("angle", "Angle", "Edgy, matte, confident; long-wear performance."),
        part("product", "Product format", "Monochrome black packaging, travel-friendly."),
        part("voice", "Brand voice", "Bold, witty, unapologetic."),
        part("distribution", "Distribution", "DTC + heavy offline retail + marketplaces (Nykaa, Amazon).")
      ],
      uses: { growthAgency: "ag-commonthread", software: ["sw-shopify"], creators: ["cr-glamint"], retailers: ["Nykaa", "Amazon"] }
    },
    {
      slug: "the-ordinary",
      name: "The Ordinary",
      category: "Skincare",
      market: "Global",
      positioning: "Clinical formulations with integrity.",
      steal: "Disrupt on price + educate; let the range look like a pharmacy.",
      connections: 4,
      parts: [
        part("positioning", "Positioning", "Honest, no-markup actives named by their ingredient."),
        part("audience", "Audience", "Value-seeking skincare nerds tired of marketing markups."),
        part("angle", "Angle", "Radical transparency plus disruptive pricing."),
        part("product", "Product format", "Lab-style dropper bottles, ingredient-name labels."),
        part("voice", "Brand voice", "Clinical, plain, anti-hype."),
        part("distribution", "Distribution", "DTC + Sephora + global retail.")
      ],
      uses: { packaging: "vd-berlin", software: ["sw-shopify"], creators: ["cr-skinscience"], retailers: ["Sephora"] }
    },
    {
      slug: "minimalist",
      name: "Minimalist",
      category: "Skincare",
      market: "India",
      positioning: "Transparent, science-backed actives.",
      steal: "Make radical transparency the brand, not just a feature.",
      connections: 4,
      parts: [
        part("positioning", "Positioning", "Actives with exact percentages on the label and no fluff."),
        part("audience", "Audience", "Informed Indian buyers who read ingredient lists."),
        part("angle", "Angle", "Transparency: exact concentrations and sourced actives."),
        part("product", "Product format", "Clean, clinical, percentage-forward labels."),
        part("voice", "Brand voice", "Educational, precise, trustworthy."),
        part("distribution", "Distribution", "DTC + Nykaa + Amazon.")
      ],
      uses: { packaging: "vd-berlin", software: ["sw-shopify"], creators: ["cr-skinscience"], retailers: ["Nykaa", "Amazon"] }
    },
    {
      slug: "dr-squatch",
      name: "Dr. Squatch",
      category: "Personal care",
      market: "US",
      positioning: "Natural soap for men who care what they put on their body.",
      steal: "A loud, character-led founder video can carry a whole brand.",
      connections: 6,
      parts: [
        part("positioning", "Positioning", "Natural men's grooming with a rugged, funny personality."),
        part("audience", "Audience", "Men upgrading from drugstore body wash."),
        part("angle", "Angle", "Viral, comedic founder-led video ads."),
        part("product", "Product format", "Bar soaps, masculine scents, woodsy packaging."),
        part("voice", "Brand voice", "Rugged, comedic, confident."),
        part("distribution", "Distribution", "DTC + subscription + Amazon + Walmart.")
      ],
      uses: { growthAgency: "ag-pilothouse", software: ["sw-shopify", "sw-recharge", "sw-postscript"], creators: ["cr-deathsquad"], retailers: ["Walmart", "Amazon"] }
    },
    {
      slug: "mamaearth",
      name: "Mamaearth",
      category: "Personal care",
      market: "India",
      positioning: "Toxin-free, natural care you can trust.",
      steal: "Scale on micro-influencers + visible safety certifications.",
      connections: 5,
      parts: [
        part("positioning", "Positioning", "Made-safe, toxin-free care for young families."),
        part("audience", "Audience", "Young parents and safety-conscious mass buyers."),
        part("angle", "Angle", "Safety and trust badges plus a huge influencer army."),
        part("product", "Product format", "Natural, pastel, ingredient-led packaging."),
        part("voice", "Brand voice", "Caring, reassuring, 'goodness inside'."),
        part("distribution", "Distribution", "DTC + marketplaces + fast-growing retail.")
      ],
      uses: { software: ["sw-shopify"], creators: ["cr-momsquad", "cr-glamint"], retailers: ["Amazon", "Nykaa"] }
    },
    {
      slug: "graza",
      name: "Graza",
      category: "Food",
      market: "US",
      positioning: "Drizzle and Sizzle \u2014 squeeze-bottle olive oil that's actually fun.",
      steal: "Redesign the format, not just the label.",
      connections: 6,
      parts: [
        part("positioning", "Positioning", "Single-origin olive oil in a squeeze bottle for everyday cooking."),
        part("audience", "Audience", "Home cooks who follow food creators."),
        part("angle", "Angle", "Format innovation: two bottles for two jobs."),
        part("product", "Product format", "Green squeeze bottles \u2014 Drizzle (finishing), Sizzle (cooking)."),
        part("voice", "Brand voice", "Playful, food-nerdy, warm."),
        part("distribution", "Distribution", "DTC + grocery + Erewhon.")
      ],
      uses: { designStudio: "ag-gander", fulfillment: "vd-shipbob", software: ["sw-shopify", "sw-klaviyo"], creators: ["cr-foodtok"], retailers: ["Erewhon", "Whole Foods"] }
    },
    {
      slug: "the-whole-truth",
      name: "The Whole Truth",
      category: "Food",
      market: "India",
      positioning: "No bull. Ingredients you can actually read.",
      steal: "Honesty as positioning + founder-led storytelling builds cult trust.",
      connections: 4,
      parts: [
        part("positioning", "Positioning", "Radically honest protein bars and foods \u2014 nothing hidden."),
        part("audience", "Audience", "Health-aware buyers sick of misleading 'health' food."),
        part("angle", "Angle", "Founder-written long-form honesty manifestos."),
        part("product", "Product format", "Front-of-pack ingredient transparency."),
        part("voice", "Brand voice", "Blunt, sincere, founder-voiced."),
        part("distribution", "Distribution", "DTC + quick-commerce + marketplaces.")
      ],
      uses: { packaging: "vd-flexible", software: ["sw-shopify"], creators: ["cr-fitfam"], retailers: ["Amazon", "Zepto"] }
    },
    {
      slug: "magic-spoon",
      name: "Magic Spoon",
      category: "Food",
      market: "US",
      positioning: "Childhood cereal, adult macros.",
      steal: "Pair an emotional hook (nostalgia) with a functional upgrade (protein).",
      connections: 5,
      parts: [
        part("positioning", "Positioning", "High-protein, low-sugar cereal that tastes like the sugary kind."),
        part("audience", "Audience", "Nostalgic millennials chasing better macros."),
        part("angle", "Angle", "Nostalgia plus macros; DTC-only premium positioning."),
        part("product", "Product format", "Bright, retro-mascot boxes."),
        part("voice", "Brand voice", "Fun, nostalgic, cheeky."),
        part("distribution", "Distribution", "DTC-first, then Target.")
      ],
      uses: { growthAgency: "ag-pilothouse", fulfillment: "vd-shipbob", software: ["sw-shopify", "sw-recharge"], creators: ["cr-gutcheck"], retailers: ["Target"] }
    },
    {
      slug: "vuori",
      name: "Vuori",
      category: "Apparel",
      market: "US",
      positioning: "Performance apparel inspired by the coastal California lifestyle.",
      steal: "Sell a lifestyle and comfort, not just performance specs.",
      connections: 4,
      parts: [
        part("positioning", "Positioning", "Athleisure that works for the gym, the office and the beach."),
        part("audience", "Audience", "Active men and women who want versatile comfort."),
        part("angle", "Angle", "Lifestyle and comfort over hardcore performance."),
        part("product", "Product format", "Soft, versatile, understated fits."),
        part("voice", "Brand voice", "Calm, optimistic, coastal."),
        part("distribution", "Distribution", "DTC + own retail + wholesale.")
      ],
      uses: { designStudio: "ag-order", software: ["sw-shopify", "sw-yotpo"], creators: ["cr-fitfam"] }
    },
    {
      slug: "souled-store",
      name: "The Souled Store",
      category: "Apparel",
      market: "India",
      positioning: "Fandom and pop-culture merch for Gen-Z.",
      steal: "Build around fandoms \u2014 community is the retention moat.",
      connections: 3,
      parts: [
        part("positioning", "Positioning", "Officially licensed and original pop-culture apparel."),
        part("audience", "Audience", "Gen-Z fans of anime, movies, sport and music."),
        part("angle", "Angle", "Fandom communities plus high SKU velocity."),
        part("product", "Product format", "Graphic tees, licensed collections, drops."),
        part("voice", "Brand voice", "Playful, fan-first, current."),
        part("distribution", "Distribution", "DTC + marketplaces.")
      ],
      uses: { software: ["sw-shopify"], creators: ["cr-fandom"], retailers: ["Myntra", "Amazon"] }
    },
    {
      slug: "oura",
      name: "Oura",
      category: "Wellness",
      market: "US",
      positioning: "A smart ring that turns your body's signals into daily guidance.",
      steal: "Hardware plus a subscription insight layer raises LTV.",
      connections: 4,
      parts: [
        part("positioning", "Positioning", "Sleep and readiness tracking in a discreet ring."),
        part("audience", "Audience", "Quantified-self and wellness optimizers."),
        part("angle", "Angle", "Discreet hardware plus a daily 'readiness score' habit."),
        part("product", "Product format", "Titanium ring + app + membership."),
        part("voice", "Brand voice", "Calm, scientific, premium."),
        part("distribution", "Distribution", "DTC + Best Buy + Amazon.")
      ],
      uses: { software: ["sw-shopify"], creators: ["cr-biohack"], retailers: ["Best Buy", "Amazon"] }
    },
    {
      slug: "huel",
      name: "Huel",
      category: "Wellness",
      market: "Global",
      positioning: "Complete, convenient nutrition in a scoop.",
      steal: "Subscription-native products turn convenience into recurring revenue.",
      connections: 5,
      parts: [
        part("positioning", "Positioning", "Nutritionally complete meals \u2014 powder, ready-to-drink, bars."),
        part("audience", "Audience", "Busy, optimization-minded people skipping meals."),
        part("angle", "Angle", "Convenience plus complete nutrition plus sustainability."),
        part("product", "Product format", "Powder tubs, RTD bottles, subscription bags."),
        part("voice", "Brand voice", "Direct, no-nonsense, science-led."),
        part("distribution", "Distribution", "DTC subscription + Amazon + grocery.")
      ],
      uses: { packaging: "vd-flexible", software: ["sw-shopify", "sw-recharge"], creators: ["cr-biohack", "cr-fitfam"], retailers: ["Amazon"] }
    },
    {
      slug: "our-place",
      name: "Our Place",
      category: "Home",
      market: "US",
      positioning: "The Always Pan \u2014 one beautiful pan that replaces eight tools.",
      steal: "A single hero SKU with a name can launch a whole brand.",
      connections: 5,
      parts: [
        part("positioning", "Positioning", "Thoughtfully designed cookware for modern, multicultural kitchens."),
        part("audience", "Audience", "Design-conscious home cooks and gifting buyers."),
        part("angle", "Angle", "One hero product (the Always Pan) plus beautiful colorways."),
        part("product", "Product format", "Pastel, photogenic cookware in signature colors."),
        part("voice", "Brand voice", "Warm, inclusive, design-led."),
        part("distribution", "Distribution", "DTC + own retail + select wholesale.")
      ],
      uses: { designStudio: "ag-order", fulfillment: "vd-shipbob", software: ["sw-shopify", "sw-yotpo"], creators: ["cr-foodtok", "cr-dewy"] }
    }
  ];
  function getBrand(slug) {
    return brands.find((b) => b.slug === slug);
  }

  // ../brandbrain/app/api/ask/route.ts
  var runtime = "nodejs";
  var maxDuration = 120;
  var LIBRARY = brands.map((b) => `- ${b.name} (${b.category}, ${b.market}): ${b.positioning} Steal: ${b.steal}`).join("\n");
  var SYSTEM = `You are brandbrain, a research and strategy companion for consumer (D2C) founders. You sit on top of a curated library of real brands, and you can search the web for current data.

Brands in the library:
${LIBRARY}

When you answer:
- Ground claims in how real brands actually operate; name relevant library brands when it helps.
- Use web search for anything time-sensitive or absent from the library (current ad spend, recent launches, prices). Prefer cited facts over guesses, and say when something is an estimate.
- Be concise and concrete \u2014 a founder wants the decision, not an essay. Lead with the answer.
- When you name a REAL brand, wrap it so the founder can click to research it AND see at a glance what it is. Format: [[Brand|domain|one short line on what it is]]. The domain and description are optional \u2014 include them when you know them. All valid: [[Brand]], [[Brand|brand.com]], [[Brand|brand.com|cult-status chilli crisp brand]], or [[Brand||what it is]] (empty middle when you know the description but not the domain). Keep the description under ~8 words, factual, no marketing fluff. Wrap each brand the FIRST time you name it; don't wrap generic terms, categories or the founder's own brand. Cite web sources as normal markdown links [label](url) \u2014 keep those separate from brand wraps.
- Sentence case. No emoji, no hashtags.`;
  function buildPrompt(req2) {
    const lines = [];
    const history = (req2.history ?? []).filter((h) => h?.q && h?.a).slice(-6);
    if (history.length) {
      lines.push("Earlier in this conversation (most recent last):");
      for (const h of history) lines.push(`Q: ${h.q}
A: ${h.a}`);
      lines.push("\nUse it for context and follow-ups, then answer the new question.\n");
    }
    lines.push((req2.question ?? "").trim());
    return lines.join("\n");
  }
  async function POST(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return new Response("Invalid request.", { status: 400 });
    }
    if (!body.question?.trim()) {
      return new Response("Ask a question.", { status: 400 });
    }
    const stream = runClaudeStream(buildPrompt(body), {
      system: SYSTEM,
      allowedTools: ["WebSearch", "WebFetch"],
      timeoutMs: 12e4
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-accel-buffering": "no"
      }
    });
  }

  // ../brandbrain/app/api/img/route.ts
  var route_exports2 = {};
  __export(route_exports2, {
    GET: () => GET,
    dynamic: () => dynamic,
    runtime: () => runtime2
  });
  var runtime2 = "nodejs";
  var dynamic = "force-dynamic";
  function isPrivateHost(host2) {
    const h = host2.toLowerCase().replace(/^\[|\]$/g, "");
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
    if (h === "::1" || h.startsWith("fd") || h.startsWith("fe80")) return true;
    const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (m) {
      const a = Number(m[1]), b = Number(m[2]);
      if (a === 10 || a === 127 || a === 0) return true;
      if (a === 169 && b === 254) return true;
      if (a === 192 && b === 168) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
    }
    return false;
  }
  function allowed(url2) {
    try {
      const u = new URL(url2);
      return u.protocol === "https:" && !!u.host && !isPrivateHost(u.host);
    } catch {
      return false;
    }
  }
  async function GET(req2) {
    const url2 = new URL(req2.url).searchParams.get("url");
    if (!url2 || !allowed(url2)) return new Response("Forbidden", { status: 403 });
    try {
      const r = await fetch(url2, { redirect: "follow", headers: { accept: "image/*" } });
      if (!r.ok) return new Response("Upstream error", { status: 502 });
      const ct = r.headers.get("content-type") || "";
      if (!ct.startsWith("image/")) return new Response("Not an image", { status: 415 });
      const buf = await r.arrayBuffer();
      if (buf.byteLength > 12e6) return new Response("Too large", { status: 413 });
      return new Response(buf, {
        headers: {
          "content-type": ct || "image/png",
          "cache-control": "public, max-age=86400"
        }
      });
    } catch {
      return new Response("Fetch failed", { status: 502 });
    }
  }

  // ../brandbrain/app/api/os/ads/route.ts
  var route_exports3 = {};
  __export(route_exports3, {
    POST: () => POST2,
    maxDuration: () => maxDuration2,
    runtime: () => runtime3
  });
  var runtime3 = "nodejs";
  var maxDuration2 = 240;
  var SYSTEM2 = "You are brandbrain's paid-media researcher. You have READ-ONLY access to the user's connected Meta Ads MCP tools. Only ever READ \u2014 never create, update, pause, or spend on anything. Make as FEW tool calls as possible. Only report REAL ads, advertisers, and numbers that the tools actually return \u2014 never invent an advertiser, an ad, or a benchmark. Output JSON only. Sentence case. No emoji.";
  var str = (v) => typeof v === "string" ? v.trim() : "";
  function researchPrompt(brand) {
    const category = str(brand.category) || "this consumer product category";
    const market = str(brand.market);
    const competitors = (brand.competitors ?? []).map(str).filter(Boolean);
    const lines = [
      `Use the Meta Ad Library search tool (ads_library_search) to find REAL, currently-running ads for consumer brands in this category: ${category}.`,
      competitors.length ? `Prioritise these competitors if they are advertising: ${competitors.join(", ")}.` : `Focus on the leading brands and challengers actually running ads in this category.`,
      market ? `Search in the market country "${market}" where the tool supports a country filter.` : "",
      brand.audience ? `Audience context (for relevance, not a filter): ${str(brand.audience)}.` : "",
      "Return 5 to 8 REAL ads. For each, capture: the advertiser (page / brand name), a short snippet of the ad's primary text, the format (image / video / carousel) if the tool reports it, and the ad's Meta Ad Library permalink / URL if the tool provides one.",
      "Do NOT invent ads or advertisers. Only include ads the tool actually returned. If fewer than 5 real ads exist, return what is real.",
      "",
      "Return ONLY this JSON, nothing else:",
      '{"ads":[{"advertiser":"...","text":"...","format":"...","url":"https://..."}]}'
    ];
    return lines.filter(Boolean).join("\n");
  }
  function benchmarkPrompt(brand) {
    const category = str(brand.category) || "this consumer product category";
    const market = str(brand.market);
    const lines = [
      `Use the industry benchmark tool (ads_insights_industry_benchmark) to get REAL Meta advertising benchmark bands for this category: ${category}.`,
      market ? `Market country: ${market}, where the tool supports it.` : "",
      "Report bands the tool actually returns \u2014 typically CPM, CTR, and if available CPC or cost per result. Keep values as the tool reports them (ranges are fine).",
      "Do NOT invent benchmarks. If the tool returns no usable benchmark data, return an empty array.",
      "",
      "Return ONLY this JSON, nothing else:",
      '{"benchmarks":[{"label":"CPM","value":"..."},{"label":"CTR","value":"..."}]}'
    ];
    return lines.filter(Boolean).join("\n");
  }
  async function POST2(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }
    if (body === null || typeof body !== "object") {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }
    const action = body.action === "benchmark" ? "benchmark" : "research";
    const brand = body.brand ?? {};
    const prompt5 = action === "benchmark" ? benchmarkPrompt(brand) : researchPrompt(brand);
    const opts = {
      mcp: true,
      model: "claude-haiku-4-5",
      system: SYSTEM2,
      timeoutMs: 21e4
    };
    const unreachable = () => Response.json(
      { error: "Couldn\u2019t pull ad research right now \u2014 connect Meta or try again." },
      { status: 503 }
    );
    if (action === "benchmark") {
      let text2 = await runClaude(prompt5, opts);
      let parsed2 = text2 ? extractJson(text2) : null;
      if (!parsed2 || !Array.isArray(parsed2.benchmarks)) {
        text2 = await runClaude(prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
        parsed2 = text2 ? extractJson(text2) : null;
      }
      if (!parsed2 || !Array.isArray(parsed2.benchmarks)) return unreachable();
      const benchmarks = parsed2.benchmarks.map((b) => ({ label: str(b?.label), value: str(b?.value) })).filter((b) => b.label && b.value).slice(0, 6);
      return Response.json({ benchmarks });
    }
    let text = await runClaude(prompt5, opts);
    let parsed = text ? extractJson(text) : null;
    if (!parsed || !Array.isArray(parsed.ads)) {
      text = await runClaude(prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed || !Array.isArray(parsed.ads)) return unreachable();
    const ads = parsed.ads.map((a) => ({
      advertiser: str(a?.advertiser),
      text: str(a?.text),
      format: str(a?.format),
      url: /^https?:\/\//i.test(str(a?.url)) ? str(a?.url) : ""
    })).filter((a) => a.advertiser && (a.text || a.url)).slice(0, 8);
    if (ads.length === 0) return unreachable();
    return Response.json({ ads });
  }

  // ../brandbrain/app/api/os/briefing/route.ts
  var route_exports4 = {};
  __export(route_exports4, {
    POST: () => POST3,
    maxDuration: () => maxDuration3,
    runtime: () => runtime4
  });
  var runtime4 = "nodejs";
  var maxDuration3 = 90;
  var SYSTEM3 = (name) => `You are the operating clone for the brand "${name}" \u2014 you run it for the founder and you speak in the first person ("I"). You are given the brand's REAL current state. Write a short briefing: where the brand stands, what you've already prepared for the founder, and the single most important next move. 3-4 sentences, plain and direct, in the founder's corner. Do NOT invent numbers, metrics, or progress not in the state given. No hype, no filler, sentence case, no emoji. Output only the briefing.`;
  async function POST3(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const b = body.brand ?? {};
    const s2 = body.state ?? {};
    const name = (b.name || "the brand").trim();
    const facts = [
      b.gap && `The brand's opening: ${b.gap}.`,
      b.market && `Market: ${b.market}.`,
      b.stage && `Stage: ${b.stage}.`,
      s2.tasksTotal != null && `Launch runbook: ${s2.tasksDone ?? 0} of ${s2.tasksTotal} tasks done.`,
      s2.groupsPending?.length && `Still open: ${s2.groupsPending.join(", ")}.`,
      s2.draftsReady ? `You have already drafted ${s2.draftsReady} thing(s) waiting for the founder to approve.` : `No drafts are waiting yet.`,
      typeof s2.connected === "boolean" && (s2.connected ? `The Shopify store is connected and live.` : `The store is NOT connected yet \u2014 so there is no live sales pulse.`),
      s2.storePreviews && !s2.connected && `Storefront previews are generated and ready to claim.`,
      s2.hasLogo === false && `No brand visuals/logo generated yet.`,
      s2.pulse && `Today's real store pulse: ${s2.pulse.orders ?? "\u2014"} orders, ${s2.pulse.sales ?? "\u2014"} sales, top product ${s2.pulse.topProduct ?? "\u2014"}.`,
      s2.attention?.length && `Flagged: ${s2.attention.join("; ")}.`
    ].filter(Boolean).join("\n");
    const prompt5 = `Here is ${name}'s real state right now:
${facts}

Write the briefing.`;
    const grounded = body.grounded === true;
    const briefing = await runClaude(prompt5, { system: SYSTEM3(name), allowedTools: grounded ? ["WebSearch", "WebFetch"] : void 0, effort: "low", timeoutMs: grounded ? 14e4 : 6e4 });
    if (!briefing) return Response.json({ error: "Couldn\u2019t read the brand right now \u2014 try again." }, { status: 503 });
    return Response.json({ briefing: briefing.trim(), grounded });
  }

  // ../brandbrain/app/api/os/draft/route.ts
  var route_exports5 = {};
  __export(route_exports5, {
    POST: () => POST4,
    maxDuration: () => maxDuration4,
    runtime: () => runtime5
  });
  var runtime5 = "nodejs";
  var maxDuration4 = 120;
  var SYSTEM4 = (name) => `You are brandbrain's drafting agent for the brand "${name}". You write in the brand's EXACT voice and you NEVER send, post, or publish \u2014 you produce a DRAFT the founder reviews and sends themselves. Do not invent facts, prices, product names, or people not given to you. Sentence case, no emoji. Output only the draft (markdown), no preamble.`;
  var clean = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  async function POST4(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const kind = ["content-draft", "outreach-draft", "ad-copy", "task-draft"].includes(String(body.kind)) ? body.kind : "task-draft";
    const b = body.brand ?? {};
    const name = clean(b.name) || "the brand";
    const taskTitle = clean(body.task?.title) || "the task";
    const ctx = [
      `Brand: ${name}.`,
      b.positioning && `Positioning: ${b.positioning}.`,
      b.audience && `Audience: ${b.audience}.`,
      b.voice && `Voice \u2014 write exactly like this: ${b.voice}.`,
      b.market && `Market: ${b.market} (use its currency/context if money or places come up).`,
      b.gap && `The opening it owns: ${b.gap}.`,
      body.task?.detail && `Task context: ${body.task.detail}.`
    ].filter(Boolean).join(" ");
    const instruction = kind === "outreach-draft" ? `Draft a short, warm, specific outreach email for: "${taskTitle}". Give a **Subject:** line then the body. Keep it tight \u2014 a real person will read it. It is a DRAFT the founder sends; do not fabricate a signature, a name, or terms not given.` : kind === "ad-copy" ? `Draft ad copy for: "${taskTitle}". Give **Primary text** (2-3 lines), a **Headline** (under 40 characters), and a **Description** (one line). In the brand voice.` : kind === "content-draft" ? `Draft 3 ready-to-post social captions for: "${taskTitle}". In the brand voice, each 1-3 lines. Add a couple of on-brand hashtags only where they fit. Number them 1-3.` : (
      // task-draft — a first pass at ANY task, taken as far as a draft can honestly go for review
      `Take this task as far as you can toward done, as a DRAFT for the founder to review: "${taskTitle}". Produce the actual deliverable where it's writable (copy, a message, a spec, a checklist, an outline), or a concrete, specific action plan with the exact steps, options, and decisions the founder needs to make where it isn't. Be genuinely useful \u2014 no vague advice. In the brand voice. Do NOT invent facts, prices, names, vendors, or numbers you weren't given; where a real input is missing, mark it clearly as [needs: \u2026] rather than making it up. Keep it tight and skimmable (headings/bullets).`
    );
    const steer = clean(body.steer);
    const redirect = steer ? `

The founder reviewed your last draft and wants you to redirect it: "${steer}". Rewrite the draft to honour that \u2014 don't just append, re-draft it.` : "";
    const prompt5 = `${ctx}

${instruction}${redirect}`;
    const draft = await runClaude(prompt5, { system: SYSTEM4(name), effort: "low", timeoutMs: 9e4 });
    if (!draft) return Response.json({ error: "Couldn\u2019t draft that right now \u2014 try again." }, { status: 503 });
    return Response.json({ draft: draft.trim() });
  }

  // ../brandbrain/app/api/os/gmail/route.ts
  var route_exports6 = {};
  __export(route_exports6, {
    POST: () => POST5,
    maxDuration: () => maxDuration5,
    runtime: () => runtime6
  });
  var runtime6 = "nodejs";
  var maxDuration5 = 240;
  var clean2 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  async function POST5(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const subject = clean2(body.subject);
    const draftBody = clean2(body.body);
    if (!subject || !draftBody) return Response.json({ error: "Nothing to draft \u2014 prepare the outreach first" }, { status: 400 });
    const brandName = clean2(body.brandName) || "the brand";
    const to = clean2(body.to);
    if (!to) return Response.json({ error: "Add the recipient's email \u2014 Gmail needs a To address to draft" }, { status: 400 });
    const PROMPT3 = `You are saving ONE email DRAFT to ${brandName}'s Gmail Drafts, using the connected Gmail MCP tools. This is the ONLY thing you may do.

STRICT RULES \u2014 a violation is a failure:
- Call exactly ONE tool: the Gmail create-draft tool. Make no other tool call.
- NEVER send. NEVER read, search, list, open, label, unlabel, or delete any mail \u2014 do not call get_thread, search_threads, list_drafts, list_labels, create_label, label_message, label_thread, or any read/label/delete tool.
- Use ONLY the recipient given below \u2014 do not invent, add, or guess any other recipient.
- If a create-draft tool is unavailable or Gmail is not connected/authenticated, STOP and return the error object. Never fake a success and never substitute a different tool.

Create the draft with:
- To: ${to}
- Subject: ${subject}
- Body (verbatim, keep the line breaks):
${draftBody}

Grounding \u2014 cite or honest-error. Return the REAL draft id the create-draft tool returns; never invent one.

Return ONLY this JSON, nothing else:
{"draftId":"<the real id from the create-draft tool>"}
On failure return exactly: {"error":"<short honest reason>"}`;
    const opts = { mcp: true, model: "claude-haiku-4-5", timeoutMs: 11e4 };
    let text = await runClaude(PROMPT3, opts);
    let parsed = text ? extractJson(text) : null;
    if (!parsed?.draftId && !parsed?.error) {
      text = await runClaude(PROMPT3 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
      parsed = text ? extractJson(text) : null;
    }
    const draftId = clean2(parsed?.draftId);
    if (!draftId || /[<>\s]/.test(draftId)) {
      return Response.json(
        { error: parsed?.error || "Couldn\u2019t reach your Gmail \u2014 is Gmail connected in Claude Code?" },
        { status: 503 }
      );
    }
    return Response.json({ draftId });
  }

  // ../brandbrain/app/api/os/investors/route.ts
  var route_exports7 = {};
  __export(route_exports7, {
    POST: () => POST6,
    maxDuration: () => maxDuration6,
    runtime: () => runtime7
  });
  var runtime7 = "nodejs";
  var maxDuration6 = 240;
  var SYSTEM5 = `You are brandbrain's investor scout. You find the REAL venture firms that back consumer / D2C brands, and the SPECIFIC partner at each firm who actually leads deals in this space \u2014 for THIS brand's category, stage and geography. You research everything via web search and you CITE by only surfacing what you can verify. Hard rule (cite-or-omit): a firm, a partner name, a LinkedIn url, a website, a check size, or a portfolio brand appears ONLY if it is real and verifiable \u2014 NEVER invent a VC firm, a person, a link, a deal, or a number. Be market-aware: for an Indian brand favour Indian consumer VCs (e.g. Fireside Ventures, DSG Consumer Partners, Sauce.vc, Sixth Sense Ventures, Elevation Capital, Peak XV); for a US brand favour US consumer VCs (e.g. Forerunner, VMG Partners, Imaginary Ventures, a16z consumer). Prefer firms whose public thesis or portfolio actually matches this category and market. Be honest, not promotional. Sentence case, no emoji. Output ONLY the JSON asked for.`;
  var cleanStr = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var httpUrl = (v) => {
    const s2 = String(v ?? "").trim();
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  var strList = (v, max) => (Array.isArray(v) ? v : [v]).map(cleanStr).filter((s2) => !!s2).slice(0, max);
  async function POST6(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const brand = body.brand ?? {};
    const category = cleanStr(brand.category);
    const market = cleanStr(brand.market);
    const steer = cleanStr(body.steer);
    const ctx = [
      `Brand: ${brand.name || "(unnamed)"}.`,
      category && `Category: ${category}.`,
      market && `Market / geography: ${market}.`,
      cleanStr(brand.gap) && `The opening it's going after: ${cleanStr(brand.gap)}.`,
      cleanStr(brand.positioning) && `Positioning: ${cleanStr(brand.positioning)}.`,
      cleanStr(brand.stage) && `Company stage: ${cleanStr(brand.stage)}.`,
      cleanStr(brand.raise) && `The raise being planned: ${cleanStr(brand.raise)}.`
    ].filter(Boolean).join(" ");
    const marketLine = market ? `Prioritise firms that actively invest in ${market} and its consumer market. Anchor check sizes to the currency and norms of ${market}; global consumer VCs are fine only when they genuinely invest there.` : `State the geography each firm invests in.`;
    const steerLine = steer ? `

The founder adds: ${steer}
Weight your picks toward this.` : "";
    const prompt5 = `Research the real, relevant venture investors for this consumer / D2C brand, so the founder never has to type VC names by hand.

${ctx}

${marketLine}${steerLine}

Search VC firm websites, their team / partner pages, their portfolio pages, LinkedIn, and credible funding-announcement coverage. Prefer NAMED firms with a public thesis or portfolio that matches this category and market.

Return 6-8 relevant investors. For EACH, give:
- firm: the real firm name.
- partner: the specific person at that firm who leads consumer / this-category deals (a real name you can verify from their team page or a deal announcement) \u2014 omit if you can't find who.
- focus: one line on their thesis / what they back.
- stage: the stage they write at (e.g. "Seed\u2013Series A"), if known.
- check: the check size they typically write (e.g. "$500k\u2013$2M"), if known.
- whyFit: one line on why THIS brand specifically fits them (their category / stage / geography match).
- linkedin: a real LinkedIn url for that partner (or the firm), if you can find it \u2014 else omit.
- url: the firm's real website url \u2014 else omit.
- recent: 1-2 real, recently-funded, relevant portfolio brands they backed in this space.

CITE-OR-OMIT: every firm, partner, link and portfolio brand MUST be real and verifiable via your search. If you cannot verify a partner name, a LinkedIn, a website or a portfolio brand, LEAVE THAT FIELD OUT \u2014 never invent one. Better to return fewer, real, well-matched investors than to pad with guesses.

Return ONLY this JSON:
{"investors":[{"firm":"Firm name","partner":"Person name","focus":"...","stage":"Seed\u2013Series A","check":"$500k\u2013$2M","whyFit":"...","linkedin":"https://linkedin.com/in/real","url":"https://firm.com","recent":["Brand A","Brand B"]}]}`;
    const opts = {
      system: SYSTEM5,
      allowedTools: ["WebSearch", "WebFetch"],
      effort: "low",
      timeoutMs: 21e4
    };
    let parsed = null;
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2e3));
      const pr = attempt === 0 ? prompt5 : prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.";
      const text = await runClaude(pr, opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t research investors right now \u2014 try again." }, { status: 503 });
    const arr5 = (v) => Array.isArray(v) ? v : [];
    const investors = arr5(parsed.investors).map((i) => {
      const recent = strList(i.recent, 2);
      return {
        firm: cleanStr(i.firm) || "",
        partner: cleanStr(i.partner),
        focus: cleanStr(i.focus) || "",
        stage: cleanStr(i.stage),
        check: cleanStr(i.check),
        whyFit: cleanStr(i.whyFit) || "",
        linkedin: httpUrl(i.linkedin),
        url: httpUrl(i.url),
        recent: recent.length ? recent : void 0
      };
    }).filter((i) => !!i.firm && !!i.focus && !!i.whyFit).slice(0, 8);
    if (!investors.length)
      return Response.json({ error: "Couldn\u2019t research investors right now \u2014 try again." }, { status: 503 });
    return Response.json({ investors });
  }

  // ../brandbrain/app/api/os/network/route.ts
  var route_exports8 = {};
  __export(route_exports8, {
    POST: () => POST7,
    maxDuration: () => maxDuration7,
    runtime: () => runtime8
  });
  var runtime8 = "nodejs";
  var maxDuration7 = 120;
  var SYSTEM6 = `You are brandbrain's network scout for consumer (D2C) founders. You surface REAL, well-known creators and adjacent brands a founder could partner with \u2014 people and brands you are confident actually exist. You NEVER invent a creator, a handle, a brand, a domain, or a follower/engagement number: if you are not sure an entity is real, you OMIT it. You never give precise follower counts or engagement percentages \u2014 reach is only ever a rough qualitative band (e.g. "nano", "micro \xB7 ~10-50k", "mid-tier") clearly understood as an estimate. Suggest only genuinely relevant matches; a shorter honest list beats a padded one. Sentence case, no emoji, no hashtags. Output ONLY the JSON asked for.`;
  var clean3 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var domain = (v) => clean3(v)?.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  var arr = (v) => Array.isArray(v) ? v : [];
  function brandContext(b) {
    return [
      b.name && `Brand: ${b.name}.`,
      b.category && `Category: ${b.category}.`,
      b.market && `Market: ${b.market} (anchor to creators/brands that actually operate here; include real local names, not only global Western ones).`,
      b.audience && `Audience: ${b.audience}.`,
      b.positioning && `Positioning: ${b.positioning}.`,
      b.range && `Range: ${b.range}.`,
      b.gap && `The opening it owns: ${b.gap}.`
    ].filter(Boolean).join(" ");
  }
  function prompt(b, steer) {
    const ctx = brandContext(b);
    const steerLine = steer?.trim() ? `

The founder added this steer \u2014 let it shape who you surface (honour it): "${steer.trim()}".` : "";
    return `${ctx || "A consumer (D2C) brand."}

Scout this brand's network: real CREATORS to work with and adjacent BRANDS to collaborate with. Use your own knowledge \u2014 do NOT search the web.${steerLine}

creators: ~6 REAL creators/influencers who genuinely fit this brand's category and audience \u2014 the kind a founder could brief for UGC, a campaign, an ongoing ambassadorship, or a collection. Only creators you are confident are real; give a real @handle and platform ONLY where you actually know them, else omit those fields. reach is a rough qualitative band, never a precise number.
brands: ~6 REAL adjacent, NON-COMPETING brands that share this audience \u2014 the kind a founder could co-market, bundle, or run a collection collab with. Include a real website domain (e.g. "brand.com") ONLY where you know it, for the logo. Do NOT list direct competitors.

Return ONLY this JSON:
{"creators":[{"name":"real creator's name or handle-name","kind":"creator","handle":"@handle if you truly know it, else omit","platform":"instagram|tiktok|youtube","fit":"one line: why they fit THIS brand \u2014 audience/aesthetic/values overlap","reach":"coarse band, e.g. 'micro \xB7 ~10-50k' or 'mid-tier' \u2014 an estimate, keep it vague","roleFit":"UGC|Campaign|Ambassador|Collection partner"}],"brands":[{"name":"real brand","kind":"brand","domain":"brand.com if you know it, else omit","fit":"one line: why the audiences overlap and it's a natural collab","reach":"coarse band or scale read if known, else omit","roleFit":"Co-marketing|Collection collab|Bundle"}]}

Real or absent: every name, handle and domain must be one you are confident is real \u2014 if you are unsure an entity exists, LEAVE IT OUT rather than guessing. Never fabricate a handle, a domain, or a follower/engagement figure. If you genuinely can't fill one list, return it empty.`;
  }
  function sanitize(kind, list, roles) {
    const roleSet = roles.map((r) => r.toLowerCase());
    return arr(list).map((x) => x).map((x) => {
      const roleFitRaw = clean3(x.roleFit);
      const roleFit = roleFitRaw && roleSet.includes(roleFitRaw.toLowerCase()) ? roles[roleSet.indexOf(roleFitRaw.toLowerCase())] : void 0;
      const platformRaw = clean3(x.platform)?.toLowerCase();
      const platform = platformRaw && ["instagram", "tiktok", "youtube"].includes(platformRaw) ? platformRaw : void 0;
      const handleRaw = clean3(x.handle);
      const handle = kind === "creator" && handleRaw ? handleRaw.startsWith("@") ? handleRaw : `@${handleRaw}` : void 0;
      return {
        name: clean3(x.name) || "",
        kind,
        handle,
        platform: kind === "creator" ? platform : void 0,
        // Creators omit domain (per spec); brands carry it for the favicon logo.
        domain: kind === "brand" ? domain(x.domain) : void 0,
        fit: clean3(x.fit) || "",
        reach: clean3(x.reach),
        roleFit
      };
    }).filter((e) => e.name && e.fit).slice(0, 8);
  }
  var CREATOR_ROLES = ["UGC", "Campaign", "Ambassador", "Collection partner"];
  var BRAND_ROLES = ["Co-marketing", "Collection collab", "Bundle"];
  async function POST7(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const brand = body.brand ?? {};
    const grounded = body.grounded === true;
    const opts = {
      system: SYSTEM6,
      allowedTools: grounded ? ["WebSearch", "WebFetch"] : void 0,
      effort: "low",
      timeoutMs: grounded ? 14e4 : 6e4
    };
    const p = prompt(brand, body.steer);
    let creators = [];
    let brands2 = [];
    let ok2 = false;
    for (let attempt = 0; attempt < 3 && !ok2; attempt++) {
      const text = await runClaude(
        attempt === 0 ? p : p + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences, no trailing text.",
        opts
      );
      const parsed = text ? extractJson(text) : null;
      if (!parsed) continue;
      creators = sanitize("creator", parsed.creators, CREATOR_ROLES);
      brands2 = sanitize("brand", parsed.brands, BRAND_ROLES);
      if (creators.length || brands2.length) ok2 = true;
    }
    if (!ok2) {
      return Response.json(
        { error: "Couldn\u2019t discover network candidates right now \u2014 try again." },
        { status: 503 }
      );
    }
    return Response.json({ creators, brands: brands2, grounded });
  }

  // ../brandbrain/app/api/os/pipeline/route.ts
  var route_exports9 = {};
  __export(route_exports9, {
    POST: () => POST8,
    maxDuration: () => maxDuration8,
    runtime: () => runtime9
  });
  var runtime9 = "nodejs";
  var maxDuration8 = 120;
  var SYSTEM7 = `You are brandbrain's paid-creative strategist. You generate sharp, testable ad strategy \u2014 ideal-customer profiles, message angles, and scroll-stopping hooks \u2014 for one specific D2C brand. Ground everything in the brand's own positioning, gap, and audience; make each item distinct and worth testing. You NEVER invent factual claims, statistics, prices, or real people or brands \u2014 creative strategy is about who to target and how to say it, not claims of fact. Sentence case, no emoji. Output only the JSON, no preamble.`;
  var clean4 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var STAGE_INSTRUCTION = {
    audience: `Generate 3-4 DISTINCT ideal-customer profiles (ICPs) for this brand. Each is a short label (e.g. "The at-home nail enthusiast") plus a one-line description of who they are and what they want. Go beyond demographics to real motivations \u2014 the job they're hiring the product for. Ground them in the brand's audience and category.`,
    angle: `Given the selected audience, generate 3-4 DISTINCT message angles tailored to that audience and the brand's positioning and gap. Each is a short title (e.g. "Transformation / before-after", "Ingredient & tech", "Usage benefits", "Problem \u2192 solution", "Founder story") plus a one-line description of the angle's argument \u2014 the case it makes to this audience.`,
    hook: `Given the selected audience and angle, generate 3-4 DISTINCT scroll-stopping hooks. Each is a punchy title (e.g. "From flaky to flawless") plus a 1-2 line description of the creative concept \u2014 what the viewer sees or reads in the first moment that stops the scroll.`
  };
  async function POST8(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const stage = ["audience", "angle", "hook"].includes(String(body.stage)) ? body.stage : "audience";
    const b = body.brand ?? {};
    const name = clean4(b.name) || "the brand";
    const ctx = [
      `Brand: ${name}.`,
      clean4(b.category) && `Category: ${clean4(b.category)}.`,
      clean4(b.market) && `Market: ${clean4(b.market)} (use its context if places or channels come up).`,
      clean4(b.product) && `Product: ${clean4(b.product)}.`,
      clean4(b.positioning) && `Positioning: ${clean4(b.positioning)}.`,
      clean4(b.gap) && `The opening it owns: ${clean4(b.gap)}.`,
      clean4(b.audience) && `Audience: ${clean4(b.audience)}.`,
      clean4(b.voice) && `Voice: ${clean4(b.voice)}.`
    ].filter(Boolean).join(" ");
    const upstream = [];
    if (stage === "angle" || stage === "hook") {
      const aud = clean4(body.context?.audience);
      if (aud) upstream.push(`Selected audience to target: ${aud}.`);
    }
    if (stage === "hook") {
      const ang = clean4(body.context?.angle);
      if (ang) upstream.push(`Selected message angle: ${ang}.`);
    }
    const steer = clean4(body.steer);
    const redirect = steer ? ` The founder added this steer \u2014 let it shape the items: "${steer}".` : "";
    const base = [
      ctx,
      upstream.length ? upstream.join(" ") : "",
      STAGE_INSTRUCTION[stage] + redirect,
      `Return ONLY this JSON: {"items":[{"title":"...","desc":"..."}]}. Keep each title short and each desc to one or two lines \u2014 no padding.`
    ].filter(Boolean).join("\n\n");
    const grounded = body.grounded === true;
    let parsed = null;
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      const prompt5 = attempt === 0 ? base : base + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences, no trailing text.";
      const text = await runClaude(prompt5, { system: SYSTEM7, allowedTools: grounded ? ["WebSearch", "WebFetch"] : void 0, effort: "low", timeoutMs: grounded ? 14e4 : 6e4 });
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t generate that \u2014 try again." }, { status: 503 });
    const raw = Array.isArray(parsed.items) ? parsed.items : [];
    const items = raw.map((it) => it).map((it) => ({ title: String(it?.title ?? "").trim(), desc: clean4(it?.desc) })).filter((it) => it.title).slice(0, 6);
    if (!items.length) return Response.json({ error: "Couldn\u2019t generate that \u2014 try again." }, { status: 503 });
    return Response.json({ items });
  }

  // ../brandbrain/app/api/os/pulse/route.ts
  var route_exports10 = {};
  __export(route_exports10, {
    POST: () => POST9,
    maxDuration: () => maxDuration9,
    runtime: () => runtime10
  });
  var runtime10 = "nodejs";
  var maxDuration9 = 180;
  var PROMPT = `You have access to the user's connected Shopify MCP tools. READ ONLY \u2014 do not create, update, change, or delete anything. Make as FEW tool calls as possible.

Do this:
1. Get the connected store's name and currency (get-shop-info).
2. Get today's orders (list recent orders; count how many are from today and sum today's total sales in the store currency). If analytics queries are available, one query for today's sales is fine instead.
3. If it's visible from the same data, note the best-selling / most-ordered product title today.

Return ONLY this JSON, nothing else \u2014 use REAL numbers from the store, never estimates:
{"pulse":{"store":"...","currency":"...","todayOrders":0,"todaySales":"<number with currency>","topProduct":"... or null","note":"one honest line on how the day looks vs a typical day, ONLY if the data supports it"}}
If the store is unreachable or has no data, return {"pulse":null}.`;
  async function POST9() {
    const opts = { mcp: true, model: "claude-haiku-4-5", timeoutMs: 15e4 };
    let text = await runClaude(PROMPT, opts);
    let parsed = text ? extractJson(text) : null;
    if (!parsed) {
      text = await runClaude(PROMPT + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
      parsed = text ? extractJson(text) : null;
    }
    const p = parsed?.pulse;
    if (!p || !p.store) {
      return Response.json(
        { error: "Couldn\u2019t reach your connected store \u2014 is Shopify connected in Claude Code?" },
        { status: 503 }
      );
    }
    return Response.json({
      pulse: {
        store: String(p.store),
        currency: p.currency ? String(p.currency) : void 0,
        todayOrders: typeof p.todayOrders === "number" ? p.todayOrders : void 0,
        todaySales: p.todaySales ? String(p.todaySales) : void 0,
        topProduct: p.topProduct ? String(p.topProduct) : void 0,
        note: p.note ? String(p.note) : void 0,
        at: Date.now()
      }
    });
  }

  // ../brandbrain/app/api/os/report/route.ts
  var route_exports11 = {};
  __export(route_exports11, {
    POST: () => POST10,
    maxDuration: () => maxDuration10,
    runtime: () => runtime11
  });
  var runtime11 = "nodejs";
  var maxDuration10 = 180;
  var SYSTEM8 = (name) => `You are brandbrain's reporting agent for the brand "${name}". You write investor-facing reports in the brand's voice, and you NEVER send or publish \u2014 you produce a report the founder reviews and shares themselves. You MUST NOT invent facts, prices, or numbers. CRITICAL honesty rule: every quantitative figure that is not a real, given or pulled number MUST be marked "[estimate]" inline, right next to the figure \u2014 a missing data connection must never block generation, but placeholders must always be visible. Sentence case, no emoji. Output markdown only, no preamble.`;
  var KINDS = ["mis", "investor-update", "financial-model"];
  var clean5 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var SPEC = {
    mis: `Write a monthly management information statement (MIS). Sections:
## Headline metrics \u2014 revenue, orders, average order value (AOV), gross margin, and CAC / blended CAC where knowable.
## Metrics table \u2014 a markdown table of those metrics (metric \xB7 value \xB7 notes).
## Trend commentary \u2014 2-4 tight lines on how the month is trending and why, only where the data supports it.
## What to watch \u2014 3-5 bullets of the risks or levers to watch next.`,
    "financial-model": `Write a simple 12-month financial model outline. Sections:
## Assumptions \u2014 a block listing price point, COGS %, monthly volume ramp, ad spend, and target margin. Ground each assumption in the given pricing / validation where present; mark every assumed figure [estimate].
## Projection \u2014 a markdown table by month (or by quarter if that reads cleaner) with columns: period \xB7 revenue \xB7 COGS \xB7 gross profit \xB7 marketing \xB7 net. Every projected figure is [estimate].
## Break-even \u2014 2-3 lines on when the model reaches break-even and what has to be true for it.`,
    "investor-update": `Write a short monthly investor update (email / memo), in the brand voice. Sections:
## TL;DR \u2014 2-3 lines.
## Traction \u2014 the numbers (mark [estimate] where not pulled from a real source).
## Product \u2014 what shipped or is shipping.
## Team & ops \u2014 the operating notes.
## Asks \u2014 what you need from investors.
## Runway \u2014 the cash position and runway. Keep the whole thing skimmable.`
  };
  async function POST10(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const kind = KINDS.includes(body.kind) ? body.kind : "mis";
    const connected = body.connected === true;
    const b = body.brand ?? {};
    const name = clean5(b.name) || "the brand";
    const ctx = [
      `Brand: ${name}.`,
      b.positioning && `Positioning: ${b.positioning}.`,
      b.audience && `Audience: ${b.audience}.`,
      b.voice && `Voice \u2014 write exactly like this: ${b.voice}.`,
      b.market && `Market: ${b.market} (use its currency/context for any money or places).`,
      b.gap && `The opening it owns: ${b.gap}.`,
      b.pricing && `Decided pricing: ${b.pricing}.`,
      b.range && `Product range: ${b.range}.`,
      b.budget && `Launch budget: ${b.budget}.`,
      b.validation && `Grounded market/economics facts (use these as real numbers where they apply): ${b.validation}.`,
      clean5(body.uploaded) && `The founder pasted this data to ground the numbers (treat any figure here as REAL, not an estimate):
${clean5(body.uploaded)}`
    ].filter(Boolean).join(" ");
    const steer = clean5(body.steer);
    const redirect = steer ? `

The founder reviewed your last report and wants you to redirect it: "${steer}". Rewrite the report to honour that \u2014 don't just append, re-draft it.` : "";
    const spec = SPEC[kind];
    const canUseReal = connected && (kind === "mis" || kind === "financial-model");
    if (canUseReal) {
      const realPrompt = `${ctx}

You have access to the user's connected Shopify MCP tools. READ ONLY \u2014 do not create, update, change, or delete anything. Make as FEW tool calls as possible:
1. Get the connected store's name and currency (get-shop-info).
2. Pull real revenue, order count, AOV, and top products for a recent window (e.g. the last 30 days) via run-analytics-query (ShopifyQL).

Then write the report below using those REAL numbers, in the store's currency. Do NOT put [estimate] on any figure that came from Shopify \u2014 those are real. Any figure you still have to assume (e.g. a forward projection, COGS, a margin you weren't given) MUST be marked [estimate] inline.
If the store is unreachable or returns no usable data, do not fabricate \u2014 write the report from the decided pricing / range / validation instead and mark every derived figure [estimate].

${spec}${redirect}`;
      const opts = { mcp: true, model: "claude-haiku-4-5", timeoutMs: 15e4 };
      let text2 = await runClaude(realPrompt, { ...opts, system: SYSTEM8(name) });
      if (!text2) {
        text2 = await runClaude(
          realPrompt + "\n\nReturn ONLY the report markdown \u2014 no tool-call chatter, no preamble.",
          { ...opts, system: SYSTEM8(name) }
        );
      }
      if (text2 && text2.trim()) return Response.json({ report: text2.trim() });
    }
    const note = `Start with a single short italic line noting this is a pre-launch estimate to be replaced with real numbers once the store is connected (e.g. *Pre-launch estimate \u2014 replace with real figures once the store is connected.*).`;
    const estimatePrompt = `${ctx}

There is no live store data to pull. Build the report below from the decided pricing, range, budget, and any validation facts (and the pasted data if given). Every quantitative figure you derive MUST be marked "[estimate]" inline, right next to it. Only figures the founder actually gave you (or that appear in pasted data) are real \u2014 leave those unmarked. Never invent a brand name, vendor, or fact.
${note}

${spec}${redirect}`;
    const text = await runClaude(estimatePrompt, { system: SYSTEM8(name), effort: "low", timeoutMs: 12e4 });
    if (!text) return Response.json({ error: "Couldn\u2019t generate that report right now \u2014 try again." }, { status: 503 });
    return Response.json({ report: text.trim() });
  }

  // ../brandbrain/app/api/research/brand/route.ts
  var route_exports12 = {};
  __export(route_exports12, {
    POST: () => POST11,
    maxDuration: () => maxDuration11,
    runtime: () => runtime12
  });

  // examples/brandbrain-port/shims/node-fs.mjs
  var mem = /* @__PURE__ */ new Map();
  async function mkdir() {
  }
  async function readFile(p) {
    if (mem.has(p)) return mem.get(p);
    const e = new Error(`ENOENT: ${p}`);
    e.code = "ENOENT";
    throw e;
  }
  async function writeFile(p, data) {
    mem.set(p, data);
  }

  // examples/brandbrain-port/shims/node-path.mjs
  function join(...parts) {
    return parts.filter((p) => p != null && p !== "").join("/").replace(/\/{2,}/g, "/");
  }

  // examples/brandbrain-port/.build/lib/research.ts
  var CACHE_DIR = join(process.cwd(), ".cache", "research");
  var SYSTEM9 = `You are brandbrain's competitor-teardown researcher. You research REAL consumer (D2C) brands and report only what you can actually support.

Hard rules:
- Use web search/fetch to find facts. Cite ONLY URLs that appeared in your search/fetch results \u2014 never invent or guess a URL.
- For any claim you cannot find a source for, you may still include it, but leave its "source" empty ("") \u2014 do not attach a made-up source.
- Do not invent partners, creators, or relationships. Only list agencies, vendors, software, creators, or retailers the brand is genuinely reported to use; if you find none, return an empty list.
- Sentence case. No emoji. Be concise and concrete.
- Output only the requested JSON \u2014 no prose, no markdown code fences.`;
  function prompt2(r) {
    return [
      `Research the consumer brand "${r.name}" (${r.category}, ${r.market}). Search the web for current, sourced facts.`,
      "",
      `Return ONLY this JSON:`,
      `{`,
      `  "positioning": "one-sentence positioning", "positioningSource": "url or empty",`,
      `  "parts": [{"label": "Audience|Angle|Product format|Brand voice|Distribution", "value": "...", "source": "url or empty"}],`,
      `  "partners": [{"name": "...", "type": "Growth agency|Design|PR|Co-packer|Packaging|3PL|Software|Creator|Retailer", "role": "what they do for the brand", "source": "url or empty"}],`,
      `  "sources": [{"title": "...", "url": "..."}]`,
      `}`,
      `Cover the parts you can support (aim for audience, angle, product format, brand voice, distribution). Only include partners you can actually verify. Every "url" must be a real URL from your search results.`
    ].join("\n");
  }
  async function readCache(slug) {
    try {
      const raw = await readFile(join(CACHE_DIR, `brand-${slug}.json`), "utf8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  async function writeCache(data) {
    try {
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(join(CACHE_DIR, `brand-${data.slug}.json`), JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.error("[research] cache write failed:", err);
    }
  }
  var str2 = (v) => String(v ?? "").trim();
  var url = (v) => {
    const s2 = str2(v);
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  async function researchBrand(r, opts = {}) {
    if (!opts.refresh) {
      const cached = await readCache(r.slug);
      if (cached) return cached;
    }
    const text = await runClaude(prompt2(r), {
      system: SYSTEM9,
      allowedTools: ["WebSearch", "WebFetch"],
      timeoutMs: 15e4
    });
    const parsed = text ? extractJson(text) : null;
    if (!parsed) return null;
    const data = {
      slug: r.slug,
      name: r.name,
      category: r.category,
      market: r.market,
      positioning: str2(parsed.positioning),
      positioningSource: url(parsed.positioningSource),
      parts: (Array.isArray(parsed.parts) ? parsed.parts : []).map((p) => ({ label: str2(p.label), value: str2(p.value), source: url(p.source) })).filter((p) => p.label && p.value),
      partners: (Array.isArray(parsed.partners) ? parsed.partners : []).map((p) => ({ name: str2(p.name), type: str2(p.type), role: str2(p.role), source: url(p.source) })).filter((p) => p.name),
      sources: (Array.isArray(parsed.sources) ? parsed.sources : []).map((s2) => ({ title: str2(s2.title), url: url(s2.url) ?? "" })).filter((s2) => s2.url),
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (!data.positioning && data.parts.length === 0) return null;
    await writeCache(data);
    return data;
  }

  // ../brandbrain/app/api/research/brand/route.ts
  var runtime12 = "nodejs";
  var maxDuration11 = 160;
  async function POST11(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const brand = getBrand(body.slug ?? "");
    if (!brand) return Response.json({ error: "Unknown brand" }, { status: 404 });
    const research = await researchBrand(
      { slug: brand.slug, name: brand.name, category: brand.category, market: brand.market },
      { refresh: body.refresh === true }
    );
    if (!research) {
      return Response.json(
        { error: "Couldn\u2019t research that brand \u2014 is Claude Code signed in?" },
        { status: 503 }
      );
    }
    return Response.json(research);
  }

  // ../brandbrain/app/api/studio/analogue/route.ts
  var route_exports13 = {};
  __export(route_exports13, {
    POST: () => POST12,
    maxDuration: () => maxDuration12,
    runtime: () => runtime13
  });
  var runtime13 = "nodejs";
  var maxDuration12 = 140;
  var SYSTEM10 = `You are brandbrain, a strategist who reasons by structural analogy for consumer (D2C) founders. You find a brand from a DIFFERENT category that already pulled off the same structural move the founder could make (e.g. design-led disruption of a dated, commoditised category), and translate its playbook. Every analogue brand must be REAL and named accurately \u2014 never invent one. If no genuinely comparable disruptor exists, say so (confidence "none"); a forced analogue is worse than none. Sentence case, no emoji. Output ONLY the JSON asked for.`;
  var cleanStr2 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var domain2 = (v) => cleanStr2(v)?.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  var arr2 = (v) => Array.isArray(v) ? v : [];
  function summarise(c, gap) {
    const cat = c.category?.name ? `Category: ${c.category.name} \u2014 ${c.category.scope || ""}` : "";
    const beh = (c.behaviour ?? []).slice(0, 5).map((b) => `- ${b}`).join("\n");
    const players = (c.players ?? []).map((p) => `${p.brand} (${p.kind})${p.note ? `: ${p.note}` : ""}`).join("\n");
    const g = gap?.title ? `
Chosen gap: ${gap.title} \u2014 ${gap.rationale}` : "";
    return [cat, beh && `How it behaves:
${beh}`, players && `Players:
${players}`, g].filter(Boolean).join("\n");
  }
  async function POST12(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const c = body.canvas;
    if (!c || !c.category?.name && !c.players?.length) {
      return Response.json({ error: "No canvas to analogise from" }, { status: 400 });
    }
    const steerLine = body.steer?.trim() ? `

The founder added this steer \u2014 honour it when choosing the analogue (e.g. a category to draw from, or a brand to avoid): "${body.steer.trim()}".` : "";
    const prompt5 = `Here is the market:
${summarise(c, body.gap)}${steerLine}

Find ONE real brand from a DIFFERENT category that already made the structural move this brand could make \u2014 the kind of move the chosen gap implies (e.g. design-led disruption of a dated/commoditised category, premium-accessible repricing, identity over function). Real, correctly-named brands only (think Away/luggage, Lenskart/eyewear, boAt/audio, Mokobara/luggage, Liquid Death/water, Glossier/beauty, Oatly/milk \u2014 but pick the BEST structural fit, not a famous name).

Return ONLY this JSON:
{"brand":"the real cross-category brand","category":"its own (different) category","domain":"brand.com","thesis":"a one-liner: 'be the <brand> of <this category>' phrased naturally","eli5":"THE SAME idea in plain words, self-contained, for a founder who has NEVER heard of this brand: in 1-2 sentences say what that brand actually did/became, then what that means THIS brand should do. No jargon, no insider terms, no name-dropping without explaining. A smart 12-year-old should get it.","whyItMatches":["2-4 SHORT reasons the structures rhyme \u2014 punchy phrases, max ~14 words each, NOT paragraphs"],"moves":[{"play":"the move that worked, in a short phrase","translated":"what it means for this brand, ONE tight sentence"}],"confidence":"strong|loose|none"}

Give 3-4 moves. Use confidence "strong" only for a genuine structural rhyme; "loose" if partial; "none" (and leave brand empty) if there is no honest analogue \u2014 do not force one.`;
    const grounded = body.grounded === true;
    const opts = { system: SYSTEM10, allowedTools: grounded ? ["WebSearch", "WebFetch"] : void 0, effort: "low", timeoutMs: grounded ? 14e4 : 6e4 };
    let text = await runClaude(prompt5, opts);
    let parsed = text ? extractJson(text) : null;
    if (!parsed) {
      text = await runClaude(prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t reason an analogue" }, { status: 503 });
    const confidence = ["strong", "loose", "none"].includes(String(parsed.confidence)) ? String(parsed.confidence) : "none";
    const brand = cleanStr2(parsed.brand);
    if (!brand || confidence === "none") {
      return Response.json({ analogue: null });
    }
    const moves = arr2(parsed.moves).filter((m) => !!m && typeof m === "object").map((m) => ({ play: cleanStr2(m.play) || "", translated: cleanStr2(m.translated) || "" })).filter((m) => m.play && m.translated).slice(0, 4);
    const analogue = {
      brand,
      category: cleanStr2(parsed.category) || "",
      domain: domain2(parsed.domain),
      thesis: cleanStr2(parsed.thesis) || "",
      eli5: cleanStr2(parsed.eli5),
      whyItMatches: arr2(parsed.whyItMatches).filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean).slice(0, 5),
      moves,
      confidence
    };
    if (!analogue.moves.length || !analogue.whyItMatches.length) {
      return Response.json({ analogue: null });
    }
    return Response.json({ analogue: { ...analogue, grounded } });
  }

  // ../brandbrain/app/api/studio/brief/route.ts
  var route_exports14 = {};
  __export(route_exports14, {
    POST: () => POST13,
    maxDuration: () => maxDuration13,
    runtime: () => runtime14
  });

  // examples/brandbrain-port/shims/claude-session.mjs
  var STUDIO_SYSTEM = `You are brandbrain, a launch & growth strategist for consumer (D2C) brands, running a guided brand build for a founder in one continuous conversation.

Across this conversation you expand their idea into a brief, then generate OPTIONS for each piece of the brand \u2014 name, positioning, audience, voice, visual identity, competitors, pricing, product range, suppliers \u2014 as structured cards they pick from. Each turn tells you exactly what to produce and the JSON shape to return.

Rules:
- Remember the brief and the decisions locked earlier in this conversation; build on them, never contradict them.
- Be sharp and specific \u2014 concrete names, numbers and a real point of view, never generic filler. Each option is a genuinely different direction.
- When you cite a reference brand, use a REAL brand and its real domain; never invent a brand, a domain, or a URL. Cite a source url only if you actually found it via web search; otherwise omit it.
- Sentence case. No emoji, no hashtags. Keep text tight \u2014 these render as compact cards, not essays.
- Output ONLY the JSON the turn asks for. No prose, no markdown code fences.`;
  async function sessionSend(sessionId, prompt5) {
    const provider2 = getProvider();
    if (!provider2) return null;
    try {
      const r = await provider2.request({
        method: "claude_session",
        params: { op: "send", sessionId, prompt: prompt5, system: STUDIO_SYSTEM, effort: "low" }
      });
      return typeof r?.text === "string" ? r.text : null;
    } catch {
      return null;
    }
  }
  function endSession(sessionId) {
    const provider2 = getProvider();
    if (!provider2) return;
    provider2.request({ method: "claude_session", params: { op: "end", sessionId } }).catch(() => {
    });
  }

  // ../brandbrain/app/api/studio/brief/route.ts
  var runtime14 = "nodejs";
  var maxDuration13 = 180;
  async function POST13(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const idea = (body.idea ?? "").trim();
    if (!idea) return Response.json({ error: "Describe your idea" }, { status: 400 });
    const sessionId = body.sessionId || "default";
    const market = (body.market ?? "").trim();
    const marketLine = market ? `The founder is launching in this target market: "${market}". Use it as the brief's market and let it inform the audience, demographics and price tier (local context).

` : "";
    const prompt5 = `My brand idea: ${idea}

` + marketLine + `Expand it into a sharp, specific brief \u2014 infer and commit to sensible specifics, never blank. Do not use web search. Return ONLY this JSON:
{"productIdea":"the product in a phrase","category":"category","audience":"who it's for","demographics":"age/gender/income/region in a phrase","priceTier":"Value|Mid|Premium","market":"primary market","vibe":"3-5 comma-separated brand keywords","positioningHint":"one-line angle to explore"}`;
    let text = await sessionSend(sessionId, prompt5);
    let parsed = text ? extractJson(text) : null;
    if (!parsed) {
      text = await sessionSend(sessionId, prompt5 + "\n\nReturn ONLY the JSON object \u2014 nothing else.");
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) {
      return Response.json({ error: "Couldn\u2019t read that \u2014 is Claude Code signed in?" }, { status: 503 });
    }
    const str5 = (v, d = "") => typeof v === "string" && v.trim() ? v.trim() : d;
    const tier = ["Value", "Mid", "Premium"].includes(str5(parsed.priceTier)) ? str5(parsed.priceTier) : "Mid";
    const brief = {
      productIdea: str5(parsed.productIdea, idea),
      category: str5(parsed.category),
      audience: str5(parsed.audience),
      demographics: str5(parsed.demographics),
      priceTier: tier,
      market: market || str5(parsed.market),
      // the founder's explicit target market wins over inference
      vibe: str5(parsed.vibe),
      positioningHint: str5(parsed.positioningHint)
    };
    return Response.json({ brief });
  }

  // ../brandbrain/app/api/studio/canvas/route.ts
  var route_exports15 = {};
  __export(route_exports15, {
    POST: () => POST14,
    maxDuration: () => maxDuration14,
    runtime: () => runtime15
  });

  // examples/brandbrain-port/.build/lib/studio/spec.ts
  function gapScore(c) {
    const s2 = 0.3 * c.demand + 0.25 * c.sparsity + 0.25 * c.vulnerability + 0.2 * c.feasibility - 0.2 * c.risk;
    return Math.max(0, Math.min(1, s2));
  }
  var FAST = "claude-haiku-4-5";
  var PHASES = [
    {
      id: "identity",
      name: "Identity",
      icon: "sparkles",
      stage: "Shape",
      studio: "brand",
      tasks: [
        {
          id: "positioning",
          phase: "identity",
          title: "Positioning",
          blurb: "Distinct ways to own the gap you chose.",
          fields: "title = a 2-4 word label for the angle; body = a one-sentence positioning statement that claims the chosen gap, in PLAIN words a beginner instantly gets \u2014 no jargon, no clever metaphors, no insider terms; bullets = [the category wedge / enemy it wins on]; reference = a real brand that plays this angle well, with its domain.",
          web: false,
          select: "one",
          count: 4,
          deps: [],
          model: FAST
        },
        {
          id: "audience",
          phase: "identity",
          title: "Audience",
          blurb: "Sharp target segments, not demographics dumps.",
          fields: "title = a named persona in a phrase; body = who they are and the tension they feel; chips = 2-4 short demographic/psychographic tags.",
          web: false,
          select: "one",
          count: 4,
          deps: ["positioning"],
          model: FAST
        },
        {
          id: "name",
          phase: "identity",
          title: "Brand name",
          blurb: "Names that fit the positioning and audience you locked, with a quick domain read.",
          fields: "title = the brand name; subtitle = a 5-word reason it fits the positioning; meta = [{label:'.com', value:'likely / risky'}].",
          web: false,
          select: "one",
          count: 6,
          deps: ["positioning", "audience"],
          model: FAST
        },
        {
          id: "voice",
          phase: "identity",
          title: "Story & voice",
          blurb: "An origin in a breath plus rules a copywriter can follow.",
          fields: "title = the voice in a phrase; body = a 40-word origin story; chips = 3 voice attributes; meta = [{label:'We say', value:'...'},{label:'We never', value:'...'}]; reference = a real brand with this voice + domain.",
          web: false,
          select: "one",
          count: 3,
          deps: ["positioning", "name"],
          model: FAST
        },
        {
          id: "identity",
          phase: "identity",
          title: "Visual identity",
          blurb: "Distinct directions \u2014 palette, type, mood \u2014 you can see.",
          fields: "title = the direction name; palette = 4-5 colors as {name, hex} (real hex codes); chips = 4 mood words; meta = [{label:'Type', value:'a font pairing'},{label:'Logo', value:'a one-line logo direction'}]; reference = a real brand whose look this echoes + domain.",
          web: false,
          select: "one",
          count: 3,
          deps: ["positioning", "voice"],
          model: FAST
        }
      ]
    },
    {
      id: "market",
      name: "Market",
      icon: "compass",
      stage: "Shape",
      studio: "brand",
      tasks: [
        {
          id: "competitors",
          phase: "market",
          title: "Competitor deep-dive",
          blurb: "Real rivals across the whole field \u2014 traditional to new-age \u2014 with live prices, scale and sources.",
          fields: "Each card is one real competitor. BE EXHAUSTIVE and span the WHOLE field: cover at least 3 sub-categories AND the full spectrum \u2014 traditional/heritage players, mass-market, premium, and new-age/indie/DTC disruptors (include notable REGIONAL brands for the home market, not just well-known Western names). Do not omit the old guard or the scrappy upstarts; prioritise rivals nearest the founder's chosen gap. title = brand name; subtitle = its tier + sub-category (e.g. 'new-age \xB7 design-led'); reference = that brand with its domain (for the logo) and a url; meta = [{label:'Price', value:'range'},{label:'Range', value:'product/size range'},{label:'Popularity', value:'a real signal \u2014 followers, funding, retail'}]; bullets = [its positioning, the weakness/white-space you can exploit]; source = a real url.",
          web: true,
          select: "many",
          count: 6,
          deps: ["positioning"]
        },
        {
          id: "pricing",
          phase: "market",
          title: "Pricing",
          blurb: "A price ladder benchmarked to the real set.",
          fields: "title = a ladder name (e.g. 'Good / better / best'); meta = [{label:'Good', value:'price'},{label:'Better', value:'price'},{label:'Best', value:'price'}] \u2014 all prices in the target market's local currency, benchmarked to the real local set; bullets = [the anchor logic, a launch intro offer that protects margin].",
          web: true,
          select: "one",
          count: 3,
          deps: ["competitors", "positioning"]
        }
      ]
    },
    {
      id: "product",
      name: "Product",
      icon: "boxes",
      stage: "Shape",
      studio: "brand",
      tasks: [
        {
          id: "format",
          phase: "product",
          title: "Product form",
          blurb: "The physical forms your product can take \u2014 pick every format your launch range should span.",
          fields: `Each card is a PHYSICAL FORM / PACKAGING FORMAT the product could take in THIS category \u2014 the real thing on a shelf, not a make-strategy. BE EXHAUSTIVE: cover the FULL spread of genuinely different formats a brand here could pick, from the mainstream to the emerging (e.g. a drink: slim can / glass bottle / PET bottle / tetra / pouch / concentrate / powder; skincare: tube / glass jar / pump bottle / dropper / sachet / stick / bar; food: pouch / jar / bar / box / tin / bottle). The founder can pick SEVERAL \u2014 a launch range often spans multiple forms \u2014 so make each a distinct, standalone option that could stand on its own or combine with others. Frame each for the category, the gap and the audience. title = the format in 2-4 words (e.g. 'Slim 250ml can'); body = one line on why it fits the brand + its trade-off (cost, shelf presence, sustainability, shippability); chips = a material or size cue (e.g. 'aluminium', '250ml'); meta = [{label:'Market', value:'how big this FORM is WITHIN the category right now \u2014 a rough share-of-category read plus momentum, e.g. "~1/3 of category, rising" or "niche but fast-growing" or "dominant, flat". A DIRECTIONAL estimate to convey relative scale \u2014 never an invented precise market-size figure'},{label:'Feel', value:'premium / everyday / clinical'},{label:'Cost', value:'low / med / high'}]; reference = a real brand known for this exact format + domain.`,
          web: false,
          select: "many",
          count: 8,
          deps: ["positioning", "audience"],
          model: FAST
        },
        {
          id: "range",
          phase: "product",
          title: "Launch range",
          blurb: "A focused range with a clear hero, options to choose from.",
          fields: "title = the range concept; subtitle = the hero SKU; bullets = 3-4 supporting SKUs and why each earns a slot; chips = ['hero: <name>']; keep the range deliberately small for a launch. Anchor it in the core sub-categories of the market, the chosen gap, and the locked product form(s) \u2014 when several forms were chosen, the range should span them (each SKU in one of the chosen forms).",
          web: false,
          select: "one",
          count: 3,
          deps: ["positioning", "audience", "format"],
          model: FAST
        }
      ]
    },
    {
      id: "sourcing",
      name: "Sourcing",
      icon: "truck",
      stage: "Shape",
      studio: "launch",
      tasks: [
        {
          id: "sourcing_route",
          phase: "sourcing",
          title: "Sourcing approach",
          blurb: "How you'll actually make it \u2014 the strategy before the vendors.",
          fields: "Each card is a MAKE / SOURCING STRATEGY for THIS product category, not a specific vendor. Cover the genuinely different routes a founder in this category could take \u2014 e.g. source each component/ingredient separately and assemble/contract-manufacture; commission a finished PRIVATE-LABEL / white-label product to your spec; or take a READY stock product and brand/sticker it. Frame each for the category. title = the strategy in 2-4 words; body = when it fits and the trade-off (control vs cost vs speed vs MOQ); meta = [{label:'MOQ', value:'typical range'},{label:'Speed', value:'to first run'},{label:'Control', value:'low/med/high'}]; reference = a real brand known to have built this way + domain.",
          web: false,
          select: "one",
          count: 4,
          deps: ["range"]
        },
        {
          id: "suppliers",
          phase: "sourcing",
          title: "Suppliers & vendors",
          blurb: "Real vendors for your route \u2014 specialism, MOQ, and who else uses them.",
          fields: "Each card is a REAL vendor, manufacturer, co-packer or sourcing directory that fits the chosen sourcing approach and this category \u2014 real names/directories only, never invented. title = the vendor or directory; subtitle = where they're based / their type; body = what they specialise in and the trade-off; meta = [{label:'MOQ', value:'typical range'},{label:'Lead', value:'weeks to first run'}]; chips = the product categories they serve; reference = a REAL brand known to source from them (only if genuinely known \u2014 omit otherwise, never guess); source = a real directory/marketplace/vendor url. Do NOT fabricate a contact person; leave it out unless it is publicly listed.",
          web: false,
          select: "many",
          count: 6,
          deps: ["sourcing_route"],
          kind: "vendor"
        }
      ]
    },
    {
      id: "launch",
      name: "Launch",
      icon: "zap",
      stage: "Launch",
      studio: "launch",
      tasks: [
        { id: "ecommerce", phase: "launch", title: "Store", blurb: "How your storefront should be built to convert.", fields: "title = a store approach in 2-4 words; body = the homepage and section structure in a sentence; bullets = 3-4 must-have sections or trust elements; reference = a real brand whose store does this well + domain.", web: false, select: "one", count: 3, deps: ["positioning", "audience"], model: FAST },
        { id: "social", phase: "launch", title: "Social launch", blurb: "Your launch presence and content pillars.", fields: "title = a content pillar or grid concept; body = what you post and why; bullets = 3 example post ideas; reference = a real brand with a strong launch social + domain.", web: false, select: "one", count: 3, deps: ["positioning", "voice"], model: FAST },
        { id: "ads", phase: "launch", title: "Ad concepts", blurb: "Paid concepts to test at launch.", fields: "title = the concept name; body = the hook and angle; meta = [{label:'Format', value:'9:16 UGC / 4:5 static'}]; bullets = [the primary text, the headline]; reference = a real brand running this style + domain.", web: false, select: "many", count: 4, deps: ["positioning", "audience"], model: FAST },
        { id: "content", phase: "launch", title: "Content & UGC", blurb: "Organic content and UGC ideas.", fields: "title = a content or UGC format; body = the idea in a line; chips = ['UGC' or 'organic']; reference = a real brand whose content this echoes + domain.", web: false, select: "many", count: 4, deps: ["audience", "voice"], model: FAST },
        {
          id: "budget",
          phase: "launch",
          title: "Launch budget",
          blurb: "What it costs to get to launch \u2014 a realistic money plan, scenario by scenario.",
          fields: "Each card is a launch-budget SCENARIO (e.g. 'Lean launch', 'Standard launch'). title = the scenario name; subtitle = the all-in total + how long it lasts (e.g. '~\u20B96L \xB7 first 90 days'); meta = the line items as {label, value} in the TARGET MARKET'S LOCAL CURRENCY \u2014 cover [{label:'Inventory / first production run', value:'\u2026'},{label:'Website & tooling', value:'\u2026'},{label:'Branding & creative', value:'\u2026'},{label:'Paid ads (first 60 days)', value:'\u2026'},{label:'Ops, shipping & buffer', value:'\u2026'}], grounded in the chosen range, pricing and channels; bullets = [what this budget realistically gets you to, the biggest risk if you under-fund it]. Keep numbers honest and order-of-magnitude right for the market \u2014 never invent false precision.",
          web: false,
          select: "one",
          count: 3,
          deps: ["pricing", "range"],
          model: FAST
        }
      ]
    },
    {
      id: "grow",
      name: "Grow",
      icon: "git-branch",
      stage: "Grow",
      studio: "launch",
      tasks: [
        { id: "creators", phase: "grow", title: "Creator collabs", blurb: "Types of creators to seed and partner with.", fields: "title = a creator archetype (e.g. 'skincare educators'); body = why they fit and how to approach them; reference = a real brand known for working with this type + domain. Do NOT invent specific creator handles \u2014 describe the archetype.", web: false, select: "many", count: 4, deps: ["audience"], model: FAST },
        { id: "influencers", phase: "grow", title: "Influencer collabs", blurb: "Influencer tiers and angles worth paying for.", fields: "title = an influencer tier or angle (e.g. 'mid-tier wellness'); body = the play and a rough expectation; reference = a real brand that ran this well + domain. Do not invent specific handles.", web: false, select: "many", count: 3, deps: ["audience", "positioning"], model: FAST },
        { id: "brandcollabs", phase: "grow", title: "Brand collabs", blurb: "Real brands a collab could make sense with.", fields: "Each card is a REAL brand to potentially collaborate with. title = the brand; reference = that brand + its domain; body = why the collab makes sense (audience overlap, complementary product). Use only real brands.", web: false, select: "many", count: 4, deps: ["audience", "positioning"], model: FAST },
        { id: "channels", phase: "grow", title: "Channels", blurb: "Where to sell beyond your own store.", fields: "title = a channel (e.g. quick-commerce, marketplace, wholesale, retail, subscription); body = the fit and the trade-off; reference = a real brand that won on this channel + domain. Consider how the channel fit differs across the market's sub-categories.", web: false, select: "many", count: 4, deps: ["positioning", "audience"], model: FAST },
        { id: "events", phase: "grow", title: "Events & activations", blurb: "Ways to show up in the real world.", fields: "title = an event or activation idea; body = what it is and why it fits the brand; reference = a real brand that did something like it + domain.", web: false, select: "many", count: 3, deps: ["positioning", "audience"], model: FAST }
      ]
    },
    // ───────────────────────── ideabrain · studio "idea" ─────────────────────────
    // The decision POOL for an IDEA (a startup/product thesis). Templates (IDEA_TEMPLATES, below) pick
    // an ordered subset per category, so a marketplace idea walks different decisions than a consumer
    // app or a retail concept. Same generic /api/studio engine — new decisions need no new routes.
    // Deps are kept shallow (≤ "problem", which every template includes first) so any template is
    // dependency-safe regardless of which tasks it selects. Grounded tasks (web:true) pull live signal.
    {
      id: "idea-thesis",
      name: "Thesis",
      icon: "target",
      stage: "Shape",
      studio: "idea",
      tasks: [
        { id: "problem", phase: "idea-thesis", title: "The problem", blurb: "Sharp, real ways to frame the pain this idea removes.", fields: "title = the problem in a phrase; body = who feels it and how acute it is, in plain words a stranger instantly gets \u2014 no jargon; bullets = [the concrete moment the pain bites].", web: false, select: "one", count: 4, deps: [], model: FAST },
        { id: "who", phase: "idea-thesis", title: "Beachhead user", blurb: "The specific first user to win \u2014 not everyone, someone.", fields: "title = the first user in a phrase; body = who they are and why they're the right wedge to start with; chips = 2-4 short segment tags.", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "insight", phase: "idea-thesis", title: "The insight", blurb: "The non-obvious reason this can work now when the obvious version hasn't.", fields: "title = the insight in a phrase; body = the wedge \u2014 the non-obvious thing that's true here that most people miss, one tight sentence; bullets = [the assumption most people get wrong].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "whynow", phase: "idea-thesis", title: "Why now", blurb: "The shift that makes this newly possible \u2014 grounded in what's actually changed.", fields: "title = the enabling shift in a phrase; body = the tech, behaviour or regulatory change that makes this possible NOW and wasn't before; bullets = [a concrete, recent signal the shift is real].", web: true, select: "one", count: 4, deps: [], model: FAST },
        { id: "alternatives", phase: "idea-thesis", title: "Alternatives", blurb: "What people actually do today \u2014 real incumbents, workarounds and substitutes.", fields: "Each card is a REAL current alternative (an incumbent product, a manual workaround, or a substitute). title = the alternative; reference = the real product/company + its domain; body = where it falls short for this user. Use only real, verifiable options.", web: true, select: "many", count: 5, deps: ["problem"] }
      ]
    },
    {
      id: "idea-market",
      name: "Market",
      icon: "compass",
      stage: "Shape",
      studio: "idea",
      tasks: [
        // marketplace / platform
        { id: "mkt-supply", phase: "idea-market", title: "Supply side", blurb: "Who provides the inventory or service \u2014 and the wedge to get them on first.", fields: "title = the supplier in a phrase; body = who supplies the inventory/service and the concrete wedge to onboard the first ones; bullets = [why an early supplier says yes before there's demand].", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "mkt-demand", phase: "idea-market", title: "Demand side", blurb: "Who buys, and why they'd switch from what they do today.", fields: "title = the buyer in a phrase; body = who buys, the job they hire the marketplace for, and why they'd switch from today's option; chips = 2-4 buyer segment tags.", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        // b2b saas
        { id: "saas-icp", phase: "idea-market", title: "ICP", blurb: "The ideal customer profile, sharp \u2014 size, role, trigger.", fields: "title = the ICP in a phrase; body = the company size, the role who feels the pain, and the trigger that makes them buy; chips = 2-4 firmographic tags.", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "saas-wedge", phase: "idea-market", title: "Wedge", blurb: "The narrow entry point that lands the first deals before you expand.", fields: "title = the wedge in a phrase; body = the sharp, narrow first use-case that closes deals fast; bullets = [why they'd buy this one thing right now].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        // feature of an existing product
        { id: "feat-users", phase: "idea-market", title: "Which users", blurb: "The slice of the existing base this feature serves first.", fields: "title = the user segment in a phrase; body = the slice of the EXISTING product's users this serves first, and why them; chips = 2-4 segment tags.", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "feat-fit", phase: "idea-market", title: "Product fit", blurb: "Why this belongs in the existing product \u2014 not just 'nice to have'.", fields: "title = the strategic fit in a phrase; body = how it fits the existing product's core job and roadmap, and the behaviour it plugs into; bullets = [the existing behaviour it extends].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        // retail / physical space
        { id: "retail-concept", phase: "idea-market", title: "Concept & format", blurb: "The store concept and why it's worth a physical visit.", fields: "title = the format in a phrase; body = the concept and the reason it's worth visiting in person in an online world; bullets = [the experience you can't get online].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "retail-location", phase: "idea-market", title: "Location strategy", blurb: "Where, the catchment, and why footfall there converts.", fields: "title = the location strategy in a phrase; body = the site type and catchment you target and why footfall there converts; chips = 2-4 site-type cues.", web: true, select: "one", count: 4, deps: ["problem"], model: FAST }
      ]
    },
    {
      id: "idea-plan",
      name: "Plan",
      icon: "git-branch",
      stage: "Shape",
      studio: "idea",
      tasks: [
        // shared
        { id: "solution", phase: "idea-plan", title: "MVP shape", blurb: "The smallest thing that proves the thesis \u2014 not the full vision.", fields: "title = the MVP in 2-4 words; body = the smallest build that would prove the thesis, in plain words; bullets = [the one feature it cannot ship without].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "model", phase: "idea-plan", title: "Business model", blurb: "How it makes money \u2014 who pays, for what.", fields: "title = the model in a phrase; body = the revenue mechanism in one clear sentence; meta = [{label:'who pays', value:'for what, roughly how much'}].", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "gtm", phase: "idea-plan", title: "First 100 users", blurb: "The concrete go-to-market wedge \u2014 one channel, not 'marketing'.", fields: "title = the go-to-market wedge in a phrase; body = how you get the first 100 users through ONE concrete channel; bullets = [the specific first move you'd make on monday].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "moat", phase: "idea-plan", title: "Moat", blurb: "Why this gets harder to copy as it grows.", fields: "title = the defensibility in a phrase; body = why this compounds and gets harder to copy over time (network effects, data, brand, switching cost); bullets = [the thing that compounds].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        // marketplace / platform
        { id: "mkt-coldstart", phase: "idea-plan", title: "Cold start", blurb: "Which side you seed first, and how you beat the chicken-and-egg.", fields: "title = the cold-start move in a phrase; body = which side you seed first and the concrete tactic to break the chicken-and-egg; bullets = [the single-player value before the network exists].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "mkt-liquidity", phase: "idea-plan", title: "Path to liquidity", blurb: "The narrow slice where you concentrate to actually transact.", fields: "title = the beachhead slice in a phrase; body = the narrow geo/vertical where you concentrate density until transactions reliably happen; bullets = [what 'liquid' looks like here].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "mkt-take", phase: "idea-plan", title: "Take rate & model", blurb: "How the marketplace earns per transaction.", fields: "title = the monetization in a phrase; body = how it earns per transaction (take rate, listing fee, subscription) and why that's right here; meta = [{label:'take', value:'the rate/fee and who pays it'}].", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "mkt-trust", phase: "idea-plan", title: "Trust & safety", blurb: "How strangers transact safely \u2014 quality, disputes, guarantees.", fields: "title = the trust mechanism in a phrase; body = how you make strangers transact safely \u2014 quality control, reviews, guarantees, disputes; bullets = [the biggest trust risk and how you contain it].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        // consumer app
        { id: "app-loop", phase: "idea-plan", title: "Core loop", blurb: "The repeated action that delivers value every session.", fields: "title = the core loop in a phrase; body = the repeated action a user takes that delivers value each session (trigger \u2192 action \u2192 reward); bullets = [the single action the whole app orbits].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "app-retention", phase: "idea-plan", title: "Retention hook", blurb: "What genuinely brings them back tomorrow \u2014 not a push notification.", fields: "title = the retention hook in a phrase; body = the real reason a user returns tomorrow and next week; bullets = [the reason to return that compounds with use].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "app-platform", phase: "idea-plan", title: "Platform & surface", blurb: "iOS, Android, web \u2014 and why that surface first.", fields: "title = the platform in a phrase; body = the surface(s) you build first and why that fits this user and use case; chips = 2-4 surface cues.", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "app-distribution", phase: "idea-plan", title: "Distribution", blurb: "The growth engine \u2014 virality, App Store, content, referral.", fields: "title = the growth wedge in a phrase; body = the specific distribution engine and why it's cheap right now; bullets = [the first channel and the move to test it].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "app-monetization", phase: "idea-plan", title: "Monetization", blurb: "Free, subscription, in-app or ads \u2014 and when you charge.", fields: "title = the model in a phrase; body = what you charge for and at what moment; meta = [{label:'charges', value:'who pays what, when'}].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        // feature of an existing product
        { id: "feat-adoption", phase: "idea-plan", title: "Adoption", blurb: "How the existing base discovers and actually uses it.", fields: "title = the adoption wedge in a phrase; body = how you drive uptake within the current base (surfacing, defaults, onboarding); bullets = [the moment you introduce it].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "feat-buildbuy", phase: "idea-plan", title: "Build vs buy", blurb: "Build in-house, buy/integrate, or partner \u2014 and why.", fields: "title = the call in a phrase; body = build, buy or partner and the honest reason; meta = [{label:'lean', value:'build / buy / partner + why'}].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        // retail
        { id: "retail-unit", phase: "idea-plan", title: "Unit economics", blurb: "The per-store maths: footfall \u2192 conversion \u2192 basket \u2192 contribution.", fields: "title = the unit economics in a phrase; body = the per-store maths after rent and staff \u2014 footfall, conversion, basket, contribution; meta = [{label:'per store', value:'rough monthly revenue vs cost'}].", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "retail-ops", phase: "idea-plan", title: "Ops & supply", blurb: "How the store actually runs \u2014 staffing, inventory, supply.", fields: "title = the ops model in a phrase; body = how the store runs day to day and the hard part; bullets = [the operational risk that bites at scale].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "retail-footfall", phase: "idea-plan", title: "Driving footfall", blurb: "The local go-to-market that fills the store.", fields: "title = the footfall engine in a phrase; body = the local GTM that fills the store \u2014 launch, community, partnerships, digital-to-store; bullets = [the first-week move].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "retail-expansion", phase: "idea-plan", title: "Expansion model", blurb: "How one location becomes many \u2014 or deliberately stays few.", fields: "title = the expansion model in a phrase; body = the repeatable playbook and capital per store to go from one to many; bullets = [what must be true to open store #2].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        // b2b saas
        { id: "saas-motion", phase: "idea-plan", title: "Sales motion", blurb: "Product-led, sales-led or hybrid \u2014 and why for this ICP.", fields: "title = the motion in a phrase; body = PLG, sales-led or hybrid and why it fits this ICP and price point; bullets = [the first repeatable way you close].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "saas-pricing", phase: "idea-plan", title: "Pricing & packaging", blurb: "The value metric you charge on, and the tiers.", fields: "title = the pricing in a phrase; body = the value metric (seats, usage, outcomes) and the tiers; meta = [{label:'charges', value:'the metric + rough price'}].", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "saas-integration", phase: "idea-plan", title: "Integration moat", blurb: "The data or workflow lock-in that compounds.", fields: "title = the moat in a phrase; body = the data, workflow or integration lock-in that raises switching cost over time; bullets = [what gets stickier with use].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "saas-expand", phase: "idea-plan", title: "Land & expand", blurb: "How accounts grow after the first deal \u2014 the path to >100% NRR.", fields: "title = the expansion motion in a phrase; body = how an account grows (seats, use cases, departments) toward net revenue retention above 100%; bullets = [the natural second sale].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        // hardware / physical product
        { id: "hw-bom", phase: "idea-plan", title: "Unit cost (BOM)", blurb: "The bill of materials and landed cost per unit.", fields: "title = the cost story in a phrase; body = the rough landed cost per unit and the biggest cost driver; meta = [{label:'unit cost', value:'rough COGS per unit'}].", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "hw-manufacturing", phase: "idea-plan", title: "Manufacturing", blurb: "How and where it's made, and the hardest part to get right.", fields: "title = the make story in a phrase; body = how and where it's made, the supply chain, and the hardest part; bullets = [the manufacturing risk].", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "hw-margin", phase: "idea-plan", title: "Margin & price", blurb: "Retail price vs unit cost \u2014 whether the maths works.", fields: "title = the margin in a phrase; body = the retail price vs unit cost and the honest gross margin; meta = [{label:'price \u2192 margin', value:'price and rough gross margin'}].", web: true, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "hw-channel", phase: "idea-plan", title: "Channel", blurb: "D2C, retail or distribution \u2014 and why that channel first.", fields: "title = the channel in a phrase; body = how it reaches buyers and why that channel first; bullets = [the first channel and its trade-off].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "hw-capital", phase: "idea-plan", title: "Capital & inventory", blurb: "The cash to build stock and fund the cycle before revenue.", fields: "title = the capital reality in a phrase; body = the cash to build inventory and fund the cash-conversion cycle before revenue catches up; bullets = [the capital gate before you can scale].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST }
      ]
    },
    {
      id: "idea-prove",
      name: "Prove",
      icon: "trending-up",
      stage: "Shape",
      studio: "idea",
      tasks: [
        { id: "risks", phase: "idea-prove", title: "Riskiest assumption", blurb: "The one belief that, if wrong, kills it \u2014 and the cheapest way to test it.", fields: "title = the riskiest assumption in a phrase; body = the single belief the whole idea rests on that could be false; bullets = [the cheapest experiment that would test it fast].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "milestones", phase: "idea-prove", title: "Next proof-point", blurb: "The concrete result to hit before building or raising more.", fields: "title = the next proof-point in a phrase; body = the specific outcome to reach next that would de-risk the idea; meta = [{label:'target', value:'the number or outcome to hit'}].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        // feature of an existing product
        { id: "feat-cannibal", phase: "idea-prove", title: "Cannibalization", blurb: "What existing behaviour or revenue this could eat \u2014 and whether it's worth it.", fields: "title = the cannibalization risk in a phrase; body = what existing behaviour or revenue this could eat and whether the trade is worth it; bullets = [the metric you'd watch to catch it].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "feat-metric", phase: "idea-prove", title: "Success metric", blurb: "The one number that proves the feature earns its place.", fields: "title = the metric in a phrase; body = the single number that proves it belongs (adoption %, retention lift, revenue); meta = [{label:'target', value:'the number that means success'}].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST },
        { id: "feat-rollout", phase: "idea-prove", title: "Rollout", blurb: "How you ship it \u2014 internal \u2192 beta \u2192 % \u2192 default, with a gate at each step.", fields: "title = the rollout in a phrase; body = the staged rollout and the gate at each step; bullets = [the guardrail that halts a bad rollout].", web: false, select: "one", count: 4, deps: ["problem"], model: FAST }
      ]
    }
  ];
  var TASKS = PHASES.flatMap(
    (p) => p.tasks.map((t) => ({ ...t, stage: p.stage, studio: p.studio }))
  );
  var LEAD_TASKS = [
    {
      id: "founder",
      phase: "approach",
      stage: "Shape",
      studio: "brand",
      title: "Founder wedge",
      blurb: "Why you're the one to build this \u2014 the credibility only you have.",
      fields: "title = the founder angle in a phrase; body = the unfair credibility this founder has (lived experience, expertise, access) in one tight sentence; bullets = [what you can claim that no competitor can]; reference = a real founder-led brand whose founder IS the wedge + domain.",
      web: false,
      select: "one",
      count: 4,
      deps: [],
      model: FAST
    },
    {
      id: "origin",
      phase: "approach",
      stage: "Shape",
      studio: "brand",
      title: "Origin story",
      blurb: "The founding moment the brand is told through.",
      fields: "title = the story angle in a phrase; body = the founding moment in 1-2 tight sentences; bullets = [the emotional truth it carries]; reference = a real story-led brand + domain.",
      web: false,
      select: "one",
      count: 4,
      deps: [],
      model: FAST
    },
    {
      id: "hero",
      phase: "approach",
      stage: "Shape",
      studio: "brand",
      title: "Hero ingredient",
      blurb: "The one ingredient, material or format that's the reason to believe.",
      fields: "title = the hero ingredient / material / format; body = why it's superior and defensible, one sentence; meta = [{label:'Why it wins', value:'...'}]; reference = a real ingredient-led brand built on one hero input + domain.",
      web: false,
      select: "one",
      count: 4,
      deps: [],
      model: FAST
    },
    {
      id: "enemy",
      phase: "approach",
      stage: "Shape",
      studio: "brand",
      title: "The enemy",
      blurb: "The broken status quo this brand exists to kill.",
      fields: "title = the enemy / problem in a punchy phrase; body = why the status quo is broken, one sentence; bullets = [the specific failures of the incumbents]; reference = a real problem/enemy-led brand + domain.",
      web: false,
      select: "one",
      count: 4,
      deps: [],
      model: FAST
    }
  ];
  var PATHS = [
    {
      id: "founder",
      name: "Founder-led",
      blurb: "You are the wedge \u2014 your story and credibility lead.",
      lead: "founder",
      lens: "This brand leads with the FOUNDER \u2014 their lived credibility is the reason to believe. Frame every option around the founder's voice, story and authority.",
      example: "Fly By Jing"
    },
    {
      id: "story",
      name: "Story-led",
      blurb: "A founding narrative people retell carries the brand.",
      lead: "origin",
      lens: "This brand leads with its ORIGIN STORY \u2014 a narrative people retell. Frame every option around that story and the emotion it carries.",
      example: "Oatly"
    },
    {
      id: "ingredient",
      name: "Ingredient-led",
      blurb: "One hero ingredient or format is the reason to believe.",
      lead: "hero",
      lens: "This brand leads with a HERO INGREDIENT/format \u2014 the product itself is the wedge. Frame every option around that single superior input.",
      example: "Graza"
    },
    {
      id: "problem",
      name: "Problem-led",
      blurb: "A sharp enemy and the problem you kill lead.",
      lead: "enemy",
      lens: "This brand leads with a PROBLEM/ENEMY \u2014 it exists to kill a broken status quo. Frame every option around that problem and who suffers it.",
      example: "Liquid Death"
    }
  ];
  var PATH_BY_ID = Object.fromEntries(PATHS.map((p) => [p.id, p]));
  var TASK_BY_ID = Object.fromEntries(
    [...TASKS, ...LEAD_TASKS].map((t) => [t.id, t])
  );
  var getTask = (id) => TASK_BY_ID[id];
  var DEFAULT_SEQUENCE = TASKS.map((t) => t.id);
  var IDEA_TEMPLATES = [
    {
      id: "general",
      label: "General idea",
      icon: "sparkles",
      hint: "A startup or product idea that doesn't fit a specific shape yet.",
      tasks: ["problem", "who", "insight", "whynow", "alternatives", "solution", "model", "gtm", "moat", "risks", "milestones"]
    },
    {
      id: "marketplace",
      label: "Marketplace / platform",
      icon: "columns",
      hint: "Two-sided: connects buyers and sellers (e.g. a marketplace for ad slots).",
      tasks: ["problem", "mkt-demand", "insight", "whynow", "alternatives", "mkt-supply", "mkt-coldstart", "mkt-liquidity", "solution", "mkt-take", "mkt-trust", "gtm", "moat", "risks", "milestones"]
    },
    {
      id: "app",
      label: "Consumer app",
      icon: "target",
      hint: "A mobile or web app people use directly.",
      tasks: ["problem", "who", "insight", "whynow", "alternatives", "solution", "app-loop", "app-retention", "app-platform", "app-distribution", "app-monetization", "moat", "risks", "milestones"]
    },
    {
      id: "feature",
      label: "Feature of an existing product",
      icon: "git-branch",
      hint: "A new feature inside a product/brand that already exists.",
      tasks: ["problem", "feat-users", "feat-fit", "insight", "alternatives", "solution", "feat-adoption", "feat-buildbuy", "feat-cannibal", "feat-metric", "feat-rollout", "risks"]
    },
    {
      id: "retail",
      label: "Retail / physical space",
      icon: "store",
      hint: "A store, cafe, pop-up or other physical space.",
      tasks: ["problem", "who", "whynow", "alternatives", "retail-concept", "retail-location", "retail-unit", "retail-ops", "retail-footfall", "model", "retail-expansion", "risks", "milestones"]
    },
    {
      id: "saas",
      label: "B2B SaaS",
      icon: "boxes",
      hint: "Software sold to teams or businesses.",
      tasks: ["problem", "saas-icp", "saas-wedge", "insight", "whynow", "alternatives", "solution", "saas-motion", "saas-pricing", "saas-integration", "saas-expand", "moat", "risks", "milestones"]
    },
    {
      id: "hardware",
      label: "Hardware / physical product",
      icon: "wallet",
      hint: "A physical device or manufactured product.",
      tasks: ["problem", "who", "insight", "whynow", "alternatives", "solution", "hw-bom", "hw-manufacturing", "hw-margin", "hw-channel", "hw-capital", "moat", "risks", "milestones"]
    }
  ];
  var IDEA_TEMPLATE_BY_ID = Object.fromEntries(
    IDEA_TEMPLATES.map((t) => [t.id, t])
  );

  // ../brandbrain/app/api/studio/canvas/route.ts
  var runtime15 = "nodejs";
  var maxDuration14 = 240;
  var STUDIO_SYSTEM2 = `You are brandbrain, a market analyst for consumer (D2C) founders. You map a market from a one-line idea so the founder understands the field before deciding anything. Be sharp and concrete. Every brand, domain, price and signal must be REAL \u2014 never invent a brand, domain, url or statistic; if you can't verify a number, describe it qualitatively. Sentence case, no emoji, no hashtags. Output ONLY the JSON asked for.`;
  var cleanStr3 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var domain3 = (v) => cleanStr3(v)?.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  var httpUrl2 = (v) => {
    const s2 = String(v ?? "").trim();
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  var arr3 = (v) => Array.isArray(v) ? v : [];
  function prompt3(idea, brief, steer) {
    const ctx = brief?.productIdea ? `
Working brief: ${brief.productIdea} \u2014 ${brief.category || ""}, ${brief.market || ""}, ${brief.priceTier || ""} tier.` : "";
    const steerLine = steer?.trim() ? `

The founder added this steer \u2014 let it shape and EXPAND the research (e.g. include the players/segments they point to): "${steer.trim()}".` : "";
    const market = brief?.market?.trim();
    const marketLine = market ? `

The founder is launching in: ${market}. ANCHOR the field to this market \u2014 the segments, the players and the pricing must reflect what actually exists in ${market}. Include the real LOCAL/regional brands that matter there (not only global Western names), and read price tiers in its local context. You may still plot a few globally notable players for reference, but ${market} is the home field the gap is judged against.` : "";
    return `Map the market for this idea: "${idea}".${ctx}${marketLine}${steerLine}

Build a MARKET CANVAS the founder reads before making any brand decision. Use your own deep knowledge of this market \u2014 do NOT search the web. Every brand and domain must be REAL and from your knowledge; never invent one. Give signals qualitatively (e.g. "category leader", "fast-growing DTC", "stocked at Sephora") rather than precise figures you can't stand behind, and omit anything you're unsure of.

Return ONLY this JSON:
{"category":{"name":"the real category/arena this idea sits in","scope":"one line on what's in and out","size":"market size / TAM \u2014 a rough figure if you genuinely know it (e.g. '~$8B globally, est.') else qualitative ('large, mainstream'); NEVER invent a precise number","growth":"momentum read \u2014 e.g. 'fast-growing, double-digit' or 'flat/mature'","maturity":"emerging|growing|mature|declining","frequency":"usage frequency \u2014 how often it's bought/used, e.g. 'daily ritual' / 'weekly' / 'occasional, seasonal'","channels":["where the category sells \u2014 e.g. quick-commerce, marketplaces, D2C, modern trade, temples/local"],"fundingHeat":"investor interest \u2014 e.g. 'hot, several funded DTC entrants' / 'cool, founder-funded'","takeaway":"one sharp line: the headline opportunity in this category"},"map":{"x":{"label":"a dimension","low":"the 0 end","high":"the 1 end"},"y":{"label":"a dimension","low":"the 0 end","high":"the 1 end"}},"behaviour":["3-5 SHORT punchy insight lines, max ~12 words each \u2014 NOT paragraphs"],"segments":[{"name":"a sub-category / format","tag":"core|adjacent|expansion","note":"4-8 words"}],"players":[{"brand":"real brand","domain":"brand.com","kind":"incumbent|entrant","tier":"legacy|mass|premium|newage","segment":"which sub-category","note":"what it nailed + its weakness, max ~14 words","price":"if known","signal":"a qualitative scale/size read if known","founded":"year established (e.g. '2017') \u2014 ONLY if you confidently know it, else omit; never guess","funding":"funding read if known \u2014 'VC-backed' / '$X raised, est.' / 'bootstrapped'; else omit","x":0.0-1.0,"y":0.0-1.0}],"gaps":[{"title":"a 2-5 word opening","rationale":"one line why it's open","demand":0.0-1.0,"sparsity":0.0-1.0,"vulnerability":0.0-1.0,"feasibility":0.0-1.0,"risk":0.0-1.0,"x":0.0-1.0,"y":0.0-1.0}],"sources":[]}

map: pick the TWO dimensions that best SEPARATE this market (e.g. price accessible\u2192luxury, functional\u2192design-led, mass\u2192niche). Give EVERY player an x,y (0\u20131) on those axes, spread realistically. Place each gap's x,y in the WHITE SPACE where few players sit \u2014 that's the visual opening. segments: cover the real breadth (4-6), not just the obvious format. players: BE EXHAUSTIVE \u2014 the founder needs the WHOLE field, not a sample. Aim for 12-16 REAL brands spanning every segment AND the full spectrum, tagging each with tier: "legacy" = traditional / heritage / regional names; "mass" = mass-market; "premium" = established premium/modern; "newage" = indie / DTC / new-age disruptors. You MUST include players from ALL FOUR tiers where they exist \u2014 do not omit the old-guard traditional players, and do not omit scrappy new-age upstarts (the ones founders most often miss). Include notable REGIONAL/local brands for the idea's home market, not only the well-known Western names (e.g. for an Indian idea, the Indian new-age D2C players). gaps: ALWAYS give at least 3 (ideally 3-4) genuinely distinct openings \u2014 never just one; the founder must have real choices. behaviour: short, punchy, scannable \u2014 never paragraphs. For each gap estimate honestly (0\u20131): demand = is demand for it rising; sparsity = how unoccupied it is; vulnerability = how weak the nearest incumbents are; feasibility = how buildable/sourceable it is; risk = regulatory/seasonality/fad risk.`;
  }
  function sanitize2(raw) {
    const cat = raw.category ?? {};
    const maturity = ["emerging", "growing", "mature", "declining"].includes(String(cat.maturity)) ? String(cat.maturity) : void 0;
    const category = {
      name: cleanStr3(cat.name) || "",
      scope: cleanStr3(cat.scope) || "",
      size: cleanStr3(cat.size),
      growth: cleanStr3(cat.growth),
      maturity,
      frequency: cleanStr3(cat.frequency),
      channels: arr3(cat.channels).map((x) => String(x ?? "").trim()).filter(Boolean).slice(0, 6),
      fundingHeat: cleanStr3(cat.fundingHeat),
      takeaway: cleanStr3(cat.takeaway)
    };
    if (!category.name) return null;
    const num012 = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : void 0;
    };
    const axis = (a) => {
      const o = a ?? {};
      const label = cleanStr3(o.label);
      return label ? { label, low: cleanStr3(o.low) || "", high: cleanStr3(o.high) || "" } : void 0;
    };
    const rawMap = raw.map ?? {};
    const mx = axis(rawMap.x);
    const my = axis(rawMap.y);
    const map = mx && my ? { x: mx, y: my } : void 0;
    const behaviour = arr3(raw.behaviour).map((x) => String(x ?? "").trim()).filter(Boolean).slice(0, 6);
    const segments = arr3(raw.segments).map((x) => x).map((x) => ({
      name: cleanStr3(x.name) || "",
      tag: ["core", "adjacent", "expansion"].includes(String(x.tag)) ? String(x.tag) : "adjacent",
      note: cleanStr3(x.note) || ""
    })).filter((s2) => s2.name).slice(0, 8);
    const players = arr3(raw.players).map((x) => x).map((x) => ({
      brand: cleanStr3(x.brand) || "",
      domain: domain3(x.domain),
      kind: String(x.kind) === "entrant" ? "entrant" : "incumbent",
      tier: ["legacy", "mass", "premium", "newage"].includes(String(x.tier)) ? String(x.tier) : void 0,
      segment: cleanStr3(x.segment) || "",
      note: cleanStr3(x.note) || "",
      price: cleanStr3(x.price),
      signal: cleanStr3(x.signal),
      founded: cleanStr3(x.founded),
      funding: cleanStr3(x.funding),
      url: httpUrl2(x.url),
      x: num012(x.x),
      y: num012(x.y)
    })).filter((p) => p.brand).slice(0, 18);
    const gaps = arr3(raw.gaps).map((x) => x).map((x) => {
      const g = { title: cleanStr3(x.title) || "", rationale: cleanStr3(x.rationale) || "", x: num012(x.x), y: num012(x.y) };
      const d = num012(x.demand), s2 = num012(x.sparsity), v = num012(x.vulnerability), f = num012(x.feasibility), r = num012(x.risk);
      if ([d, s2, v, f, r].every((n) => n !== void 0)) {
        const components = { demand: d, sparsity: s2, vulnerability: v, feasibility: f, risk: r };
        g.components = components;
        g.score = gapScore(components);
      }
      return g;
    }).filter((g) => g.title).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 4);
    const sources = arr3(raw.sources).map((x) => httpUrl2(x)).filter((u) => !!u).slice(0, 8);
    if (!players.length && !segments.length) return null;
    return { category, map, behaviour, segments, players, gaps, sources };
  }
  async function POST14(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const idea = (body.idea ?? body.brief?.productIdea ?? "").trim();
    if (!idea) return Response.json({ error: "Describe your idea" }, { status: 400 });
    const grounded = body.grounded === true;
    const opts = {
      system: STUDIO_SYSTEM2,
      allowedTools: grounded ? ["WebSearch", "WebFetch"] : void 0,
      effort: "low",
      timeoutMs: grounded ? 14e4 : 6e4
    };
    const p = prompt3(idea, body.brief, body.steer);
    let text = await runClaude(p, opts);
    let parsed = text ? extractJson(text) : null;
    let canvas = parsed ? sanitize2(parsed) : null;
    if (!canvas) {
      text = await runClaude(p + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
      parsed = text ? extractJson(text) : null;
      canvas = parsed ? sanitize2(parsed) : null;
    }
    if (!canvas) {
      return Response.json(
        { error: "Couldn\u2019t map that market \u2014 is Claude Code signed in?" },
        { status: 503 }
      );
    }
    return Response.json({ canvas: { ...canvas, grounded } });
  }

  // ../brandbrain/app/api/studio/clone/route.ts
  var route_exports16 = {};
  __export(route_exports16, {
    POST: () => POST15,
    maxDuration: () => maxDuration15,
    runtime: () => runtime16
  });
  var runtime16 = "nodejs";
  var maxDuration15 = 240;
  var SYSTEM11 = `You are brandbrain's brand-cloning researcher. You read a REAL consumer brand's website and public information and extract its brand system into a structured starting point another founder can adapt. Extract ONLY from what is real on the site and in public info \u2014 never invent positioning, prices, product names, or colours you cannot actually see. Colours must be the brand's REAL hex values from the site. Sentence case, no emoji. Output ONLY the JSON object asked for, no prose, no code fences.`;
  var SYSTEM_OWN = `You are brandbrain's brand-import researcher. The founder is pointing you at THEIR OWN brand's website: read it (and public info) and reconstruct their EXISTING brand system exactly as it is today \u2014 this becomes their brand's working foundation inside brandbrain, so fidelity beats flattery. Keep their real name, their real story, their real claims, prices, SKUs and colours; where the site is thin, extract less rather than embellish. Never invent positioning, prices, product names, or colours you cannot actually see. Colours must be the brand's REAL hex values from the site. Sentence case, no emoji. Output ONLY the JSON object asked for, no prose, no code fences.`;
  var s = (v) => {
    const t = String(v ?? "").trim();
    return t || void 0;
  };
  var hex = (v) => {
    const t = String(v ?? "").trim();
    return /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(t) ? t : void 0;
  };
  var strArr = (v) => {
    const a = (Array.isArray(v) ? v : []).map(s).filter((x) => !!x);
    return a.length ? a : void 0;
  };
  var metaArr = (v) => {
    const a = (Array.isArray(v) ? v : []).map((m) => m && typeof m === "object" ? { label: s(m.label), value: s(m.value) } : null).filter((m) => !!m && !!m.label && !!m.value);
    return a.length ? a : void 0;
  };
  var domainOf = (url2) => {
    try {
      return new URL(/^https?:\/\//i.test(url2) ? url2 : `https://${url2}`).hostname.replace(/^www\./, "");
    } catch {
      return url2.replace(/^www\./, "").split("/")[0];
    }
  };
  async function POST15(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const raw = s(body.url);
    const own = body.own === true;
    if (!raw) return Response.json({ error: own ? "Give your brand's website link." : "Give a website link to clone." }, { status: 400 });
    const domain5 = domainOf(raw);
    const url2 = /^https?:\/\//i.test(raw) ? raw : `https://${domain5}`;
    const market = s(body.market);
    const prompt5 = (own ? `This is the founder's OWN existing brand: ${url2}

Fetch that page (and a couple of its key pages \u2014 about, products, shop \u2014 if linked), and use public info, to reconstruct the brand's real system AS IT IS \u2014 their actual name, story, positioning, prices and range. This becomes their working foundation, not a starting point to adapt.

` : `Clone the brand at this website: ${url2}

Fetch that page (and a couple of its key pages \u2014 about, products, shop \u2014 if linked), and use public info, to read the brand's real system. Then extract it into a starting point another founder can adapt.

`) + (market ? `The founder is relaunching a version of this in this market: ${market}. Frame pricing/currency and context for that market where relevant.

` : "") + `Return ONLY this JSON:
{
  "source": {"name": "the brand's name", "domain": "${domain5}"},
  "brief": {"productIdea":"what they sell, one line","category":"the category","audience":"who it's for","demographics":"age/segment cues","priceTier":"Value|Mid|Premium","market":"${market || "their core market"}","vibe":"the aesthetic/tone in a few words","positioningHint":"their positioning in a phrase"},
  "path": "founder|story|ingredient|problem \u2014 which approach this brand actually leads with",
  "gap": {"title":"the market opening this brand occupies, 2-5 words","rationale":"why it's a real opening, grounded in what they do"},
  "decisions": {
    "positioning": {"title":"their positioning in 2-4 words","body":"the positioning statement in one tight sentence"},
    "audience": {"title":"the core audience in a phrase","body":"who they are and what they want, one sentence"},
    "voice": {"title":"their voice in 2-3 words","body":"how the brand talks, one sentence","bullets":["a real tone rule or phrase they use"]},
    "identity": {"title":"the visual identity in 2-4 words","palette":[{"name":"colour name","hex":"#RRGGBB \u2014 the REAL brand colour from the site"}]},
    "pricing": {"title":"their price ladder in a phrase","meta":[{"label":"Good","value":"real price"},{"label":"Better","value":"real price"},{"label":"Best","value":"real price"}]},
    "format": {"title":"the hero product form in 2-4 words","subtitle":"size/material cue","body":"why this form, one line","chips":["material or size cue"]},
    "range": {"title":"the range concept","subtitle":"the hero SKU","bullets":["a real SKU in the range","another real SKU"]},
    "lead": {"title":"the brand's leading angle (its founder wedge / origin story / hero ingredient / enemy, matching \\"path\\")","body":"that angle in one tight sentence"}
  }
}

Hard rules: colours are the brand's REAL hex values (3-5 of them). Prices are REAL (or omit that meta row). Do not invent SKUs, names, or claims. If the site can't be read, still give your best public-knowledge extraction, but never fabricate specifics.`;
    const opts = { system: own ? SYSTEM_OWN : SYSTEM11, allowedTools: ["WebSearch", "WebFetch"], effort: "low", timeoutMs: 21e4 };
    let text = await runClaude(prompt5, opts);
    let parsed = text ? extractJson(text) : null;
    if (!parsed) {
      text = await runClaude(prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t read that brand \u2014 check the link and try again." }, { status: 503 });
    const src = parsed.source ?? {};
    const sourceName = s(src.name) || domain5;
    const source = { name: sourceName, domain: domain5 };
    const b = parsed.brief ?? {};
    const tier = s(b.priceTier);
    const brief = {
      productIdea: s(b.productIdea) || `A brand like ${sourceName}`,
      category: s(b.category) || "",
      audience: s(b.audience) || "",
      demographics: s(b.demographics) || "",
      priceTier: tier === "Value" || tier === "Premium" ? tier : "Mid",
      market: market || s(b.market) || "",
      vibe: s(b.vibe) || "",
      positioningHint: s(b.positioningHint) || ""
    };
    const pathRaw = s(parsed.path);
    const path = ["founder", "story", "ingredient", "problem"].includes(String(pathRaw)) ? pathRaw : "problem";
    const leadTaskId = PATHS.find((p) => p.id === path).lead;
    const g = parsed.gap ?? {};
    const gap = s(g.title) ? { title: s(g.title), rationale: s(g.rationale) || "" } : void 0;
    const d = parsed.decisions ?? {};
    const ref = { brand: sourceName, domain: domain5 };
    const locks = {};
    const put = (taskId, build) => {
      const rawCard = d[taskId === leadTaskId ? "lead" : taskId];
      if (!rawCard) return;
      const built = build(rawCard);
      const title = built ? s(built.title) : void 0;
      if (built && title) locks[taskId] = { ...built, id: `${taskId}-${own ? "import" : "clone"}`, title, reference: ref };
    };
    put("positioning", (r) => ({ title: s(r.title), body: s(r.body) }));
    put("audience", (r) => ({ title: s(r.title), body: s(r.body) }));
    put("voice", (r) => ({ title: s(r.title), body: s(r.body), bullets: strArr(r.bullets) }));
    put("identity", (r) => {
      const palette = (Array.isArray(r.palette) ? r.palette : []).map((p) => p && typeof p === "object" ? { name: s(p.name) || "", hex: hex(p.hex) } : null).filter((p) => !!p && !!p.hex);
      return { title: s(r.title), palette: palette.length ? palette : void 0 };
    });
    put("pricing", (r) => ({ title: s(r.title), meta: metaArr(r.meta) }));
    put("format", (r) => ({ title: s(r.title), subtitle: s(r.subtitle), body: s(r.body), chips: strArr(r.chips) }));
    put("range", (r) => ({ title: s(r.title), subtitle: s(r.subtitle), bullets: strArr(r.bullets) }));
    put(leadTaskId, (r) => ({ title: s(r.title), body: s(r.body) }));
    if (Object.keys(locks).length < 3) {
      return Response.json({ error: own ? "Couldn\u2019t read enough from your site \u2014 check the link (or try your about/shop page)." : "Couldn\u2019t extract enough from that brand \u2014 try a different link." }, { status: 503 });
    }
    return Response.json({ source, brief, path, gap, locks });
  }

  // ../brandbrain/app/api/studio/connect/route.ts
  var route_exports17 = {};
  __export(route_exports17, {
    POST: () => POST16,
    maxDuration: () => maxDuration16,
    runtime: () => runtime17
  });
  var runtime17 = "nodejs";
  var maxDuration16 = 180;
  var PROMPT2 = `You have access to the user's connected Shopify MCP tools. READ ONLY \u2014 do not create, update, change, or delete anything. Make as FEW tool calls as possible (one for the store, one for products).

Do this:
1. Get the connected Shopify store (name, domain, currency, country, plan).
2. Get up to 6 product titles from the store.

Then infer a brand brief from this REAL data \u2014 what the brand sells, who it's for, its tier and market. Only use what the data actually shows; do not invent.

Return ONLY this JSON, nothing else:
{"connected":{"store":"...","domain":"...","currency":"...","country":"...","plan":"...","productCount":0,"sampleProducts":["..."]},
 "brief":{"productIdea":"...","category":"...","audience":"...","demographics":"...","priceTier":"Value|Mid|Premium","market":"...","vibe":"...","positioningHint":"..."}}`;
  var ok = (p) => !!p?.connected?.store && !!p.brief;
  async function POST16(req2) {
    let sessionId = "default";
    try {
      const body = await req2.json();
      if (body?.sessionId) sessionId = String(body.sessionId);
    } catch {
    }
    const opts = { mcp: true, model: "claude-haiku-4-5", timeoutMs: 15e4 };
    let text = await runClaude(PROMPT2, opts);
    let parsed = text ? extractJson(text) : null;
    if (!ok(parsed)) {
      text = await runClaude(PROMPT2 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!ok(parsed)) {
      return Response.json(
        { error: "Couldn\u2019t reach your connected store \u2014 is Shopify connected in Claude Code?" },
        { status: 503 }
      );
    }
    const str5 = (v, d = "") => typeof v === "string" && v.trim() ? v.trim() : d;
    const tier = ["Value", "Mid", "Premium"].includes(str5(parsed.brief.priceTier)) ? str5(parsed.brief.priceTier) : "Mid";
    const brief = {
      productIdea: str5(parsed.brief.productIdea, parsed.connected.store),
      category: str5(parsed.brief.category),
      audience: str5(parsed.brief.audience),
      demographics: str5(parsed.brief.demographics),
      priceTier: tier,
      market: str5(parsed.brief.market, str5(parsed.connected.country)),
      vibe: str5(parsed.brief.vibe),
      positioningHint: str5(parsed.brief.positioningHint)
    };
    const briefLines = [
      `Product / idea: ${brief.productIdea}`,
      `Category: ${brief.category}`,
      `Audience: ${brief.audience}`,
      `Demographics: ${brief.demographics}`,
      `Price tier: ${brief.priceTier}`,
      `Market: ${brief.market}`,
      `Vibe: ${brief.vibe}`,
      `Positioning hint: ${brief.positioningHint}`
    ].join("\n");
    void sessionSend(
      sessionId,
      `This brand build is seeded from a real connected store (${parsed.connected.store}). Remember this brief for everything that follows; do not contradict it:
${briefLines}

Reply with just "ok".`
    ).catch(() => {
    });
    return Response.json({ connected: parsed.connected, brief });
  }

  // ../brandbrain/app/api/studio/deepen/route.ts
  var route_exports18 = {};
  __export(route_exports18, {
    POST: () => POST17,
    maxDuration: () => maxDuration17,
    runtime: () => runtime18
  });
  var runtime18 = "nodejs";
  var maxDuration17 = 240;
  var SYSTEM12 = `You are brandbrain's grounding researcher. You verify facts about a real consumer brand using web search, and you CITE every claim. Hard rule (cite-or-omit): include a fact ONLY if a real web source backs it \u2014 never guess, never state a number you didn't find. If a brand is obscure and little is verifiable, say so honestly (set thin true) rather than inventing detail. Sentence case, no emoji. Output ONLY the JSON asked for.`;
  var SYSTEM_VENDOR = `You are brandbrain's sourcing researcher. You verify facts about a real supplier, manufacturer, co-packer or sourcing directory using web search, and you CITE every claim. Hard rule (cite-or-omit): include a fact ONLY if a real web source backs it \u2014 never guess an MOQ, lead time or contact you didn't find, and never invent which brands use them. If little is verifiable, say so honestly (set thin true). Sentence case, no emoji. Output ONLY the JSON asked for.`;
  var cleanStr4 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var httpUrl3 = (v) => {
    const s2 = String(v ?? "").trim();
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  var httpUrls = (v) => (Array.isArray(v) ? v : [v]).map(httpUrl3).filter((u) => !!u);
  async function POST17(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const brand = (body.brand ?? "").trim();
    if (!brand) return Response.json({ error: "No brand to research" }, { status: 400 });
    const isVendor = body.kind === "vendor";
    const ctx = [body.domain && `domain ${body.domain}`, body.segment && `\u2014 ${body.segment}`, body.category && `(${body.category})`].filter(Boolean).join(" ");
    const prompt5 = isVendor ? `Research the real supplier / manufacturer / directory "${brand}"${ctx ? ` \u2014 ${ctx}` : ""} on the web and return VERIFIED, CITED facts a founder would want before reaching out.

Search for: whether they're legitimate/verified, what they actually make and for which product categories, typical MOQ, typical lead time, how to contact them (a publicly-listed email/form/portal only), and which REAL brands are known to source from them (from "manufactured by"/"made by" disclosures, packaging, press or the vendor's own client list).

CITE-OR-OMIT: every fact must carry at least one REAL source url you actually found. Never invent an MOQ, lead time, contact or a brand-who-uses-them \u2014 leave it out if unverified. If little is verifiable, return few/no facts and set "thin": true.

CORROBORATE: prefer facts confirmed by 2+ INDEPENDENT sources (different websites); list all corroborating urls in that fact's "sources" array.

Return ONLY this JSON:
{"summary":"one grounded sentence on who this supplier is","facts":[{"label":"MOQ|Lead time|Specialism|Verification|Contact|Used by|...","value":"the verified value","sources":["https://real-source"],"confidence":"high|medium|low"}],"thin":false}

Use confidence "high" only for a clearly-sourced fact; "low" for a single weak source. Give 3-6 facts if the data supports it. Do NOT include a fact without a real source url.` : `Research the real consumer brand "${brand}"${ctx ? ` \u2014 ${ctx}` : ""} on the web and return VERIFIED, CITED facts a founder would want when sizing it up as a competitor.

Search for: price range, scale/popularity (funding, revenue, followers, retail footprint), what it's known for / positioning, and a real weakness or white-space a new brand could exploit.

CITE-OR-OMIT: every fact must carry at least one REAL source url you actually found. If you cannot verify something, leave it out \u2014 do not estimate or invent. If little is verifiable about this brand, return few/no facts and set "thin": true.

CORROBORATE: prefer facts you can confirm from 2+ INDEPENDENT sources (different websites). List ALL the corroborating source urls in that fact's "sources" array \u2014 a fact backed by two independent sites is far stronger than one.

Return ONLY this JSON:
{"summary":"one grounded sentence on what this brand is and its standing","facts":[{"label":"Price|Scale|Funding|Positioning|Weakness|...","value":"the verified value","sources":["https://real-source"],"confidence":"high|medium|low"}],"thin":false}

Use confidence "high" only for a clearly-sourced fact; "low" for a single weak source. Give 3-6 facts if the data supports it. Do NOT include a fact without a real source url.`;
    const opts = {
      system: isVendor ? SYSTEM_VENDOR : SYSTEM12,
      allowedTools: ["WebSearch", "WebFetch"],
      effort: "low",
      timeoutMs: 21e4
    };
    let text = await runClaude(prompt5, opts);
    let parsed = text ? extractJson(text) : null;
    if (!parsed) {
      text = await runClaude(prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t research that brand" }, { status: 503 });
    const host2 = (u) => {
      try {
        return new URL(u).hostname.replace(/^www\./, "");
      } catch {
        return u;
      }
    };
    const facts = (Array.isArray(parsed.facts) ? parsed.facts : []).map((f) => f).map((f) => {
      const sources = Array.from(new Set(httpUrls(f.sources)));
      const independent = new Set(sources.map(host2)).size;
      let confidence = ["high", "medium", "low"].includes(String(f.confidence)) ? String(f.confidence) : "low";
      if (confidence === "high" && independent < 2) confidence = "medium";
      return { label: cleanStr4(f.label) || "", value: cleanStr4(f.value) || "", sources, confidence };
    }).filter((f) => f.label && f.value && f.sources.length > 0).slice(0, 8);
    const allSources = Array.from(new Set(facts.flatMap((f) => f.sources))).slice(0, 10);
    const profile = {
      brand,
      domain: cleanStr4(body.domain),
      summary: cleanStr4(parsed.summary),
      facts,
      sources: allSources,
      thin: facts.length === 0 || parsed.thin === true
    };
    return Response.json({ profile });
  }

  // ../brandbrain/app/api/studio/end/route.ts
  var route_exports19 = {};
  __export(route_exports19, {
    POST: () => POST18,
    runtime: () => runtime19
  });
  var runtime19 = "nodejs";
  async function POST18(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ ok: false }, { status: 400 });
    }
    if (body.sessionId) endSession(body.sessionId);
    return Response.json({ ok: true });
  }

  // ../brandbrain/app/api/studio/gaps/route.ts
  var route_exports20 = {};
  __export(route_exports20, {
    POST: () => POST19,
    maxDuration: () => maxDuration18,
    runtime: () => runtime20
  });
  var runtime20 = "nodejs";
  var maxDuration18 = 120;
  var SYSTEM13 = `You are brandbrain, a strategist finding white space for a consumer (D2C) founder. You propose openings grounded in the real market landscape you're given \u2014 never generic, never invented. Sentence case, no emoji. Output ONLY the JSON asked for.`;
  function summarise2(c) {
    const cat = c.category?.name ? `Category: ${c.category.name} \u2014 ${c.category.scope || ""}` : "";
    const segs = (c.segments ?? []).map((s2) => `${s2.name} [${s2.tag}]`).join(", ");
    const players = (c.players ?? []).map((p) => `${p.brand} (${p.kind}, ${p.segment})${p.note ? `: ${p.note}` : ""}`).join("\n");
    return [cat, segs && `Segments: ${segs}`, players && `Players:
${players}`].filter(Boolean).join("\n");
  }
  async function POST19(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const c = body.canvas;
    if (!c || !c.category?.name && !c.players?.length && !c.segments?.length) {
      return Response.json({ error: "No canvas to ground openings in" }, { status: 400 });
    }
    const steer = body.input?.trim() ? `

The founder added this steer \u2014 let it shape the openings: "${body.input.trim()}".` : "";
    const avoid = body.existing?.length ? `

Already proposed (give genuinely DIFFERENT ones): ${body.existing.map((t) => `"${t}"`).join(", ")}.` : "";
    const shifts = (body.trends?.trends ?? []).slice(0, 4).map((t) => `${t.dimension ? `${t.dimension}: ` : ""}${t.shift || t.opportunity || ""}`.trim()).filter(Boolean);
    const trendLens = shifts.length || body.trends?.whitespace ? `

Where preference is shifting in this category \u2014 favour openings that ride these, not ones the market is leaving behind:
${shifts.map((s2) => `- ${s2}`).join("\n")}${body.trends?.whitespace ? `
The opening they point to: ${body.trends.whitespace}.` : ""}` : "";
    const picked = (body.pickedShifts ?? []).map((s2) => String(s2 ?? "").trim()).filter(Boolean).slice(0, 6);
    const pickedLens = picked.length ? `

The founder PERSONALLY resonates with these shifts \u2014 weight the openings hard toward them:
${picked.map((s2) => `- ${s2}`).join("\n")}` : "";
    const prompt5 = `Here is the market landscape:
${summarise2(c)}${trendLens}${pickedLens}

Propose 3 fresh openings (white space) a new brand could own \u2014 each grounded in a real weakness or absence in the landscape above.${steer}${avoid}

For each, estimate honestly (0\u20131): demand (rising?), sparsity (unoccupied?), vulnerability (incumbents weak?), feasibility (buildable?), risk (regulatory/fad?).
Return ONLY: {"gaps":[{"title":"a 2-5 word opening","rationale":"one line why it's open","demand":0.0-1.0,"sparsity":0.0-1.0,"vulnerability":0.0-1.0,"feasibility":0.0-1.0,"risk":0.0-1.0}]}`;
    const grounded = body.grounded === true;
    const opts = { system: SYSTEM13, allowedTools: grounded ? ["WebSearch", "WebFetch"] : void 0, effort: "low", timeoutMs: grounded ? 14e4 : 6e4 };
    let text = await runClaude(prompt5, opts);
    let parsed = text ? extractJson(text) : null;
    if (!parsed) {
      text = await runClaude(prompt5 + "\n\nReturn ONLY the JSON object \u2014 nothing else.", opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t generate openings" }, { status: 503 });
    const num012 = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : void 0;
    };
    const gaps = (Array.isArray(parsed.gaps) ? parsed.gaps : []).map((g) => g).map((g) => {
      const out = { title: String(g.title ?? "").trim(), rationale: String(g.rationale ?? "").trim() };
      const d = num012(g.demand), s2 = num012(g.sparsity), v = num012(g.vulnerability), f = num012(g.feasibility), r = num012(g.risk);
      if ([d, s2, v, f, r].every((n) => n !== void 0)) {
        const components = { demand: d, sparsity: s2, vulnerability: v, feasibility: f, risk: r };
        out.components = components;
        out.score = gapScore(components);
      }
      return out;
    }).filter((g) => g.title).slice(0, 4);
    return Response.json({ gaps });
  }

  // ../brandbrain/app/api/studio/inspiration/route.ts
  var route_exports21 = {};
  __export(route_exports21, {
    POST: () => POST20,
    maxDuration: () => maxDuration19,
    runtime: () => runtime21
  });
  var runtime21 = "nodejs";
  var maxDuration19 = 180;
  var cleanStr5 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var httpUrl4 = (v) => {
    const s2 = String(v ?? "").trim();
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  async function POST20(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const task = getTask(body.decisionId ?? "");
    if (!task) return Response.json({ error: "Unknown decision" }, { status: 400 });
    const sessionId = body.sessionId || "default";
    const b = body.brief ?? {};
    const prompt5 = `Social proof for the "${task.title}" decision. Brand context: ${b.productIdea || "(infer)"} \u2014 ${b.category || ""}, vibe ${b.vibe || ""}.

Show 5 REAL consumer brands (a mix of big, well-known and smaller/indie, ideally in or near this category) and how each one handled its "${task.title}". Use only real brands and their real domains \u2014 never invent a brand or a domain. Keep each take to one sharp sentence. Do not use web search.

Return ONLY: {"brands":[{"brand":"...","domain":"brand.com","take":"how they did it, one line"}]}`;
    let text = await sessionSend(sessionId, prompt5);
    let parsed = text ? extractJson(text) : null;
    if (!parsed) {
      text = await sessionSend(sessionId, prompt5 + "\n\nReturn ONLY the JSON object \u2014 nothing else.");
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "inspiration_failed", brands: [] }, { status: 503 });
    const raw = Array.isArray(parsed.brands) ? parsed.brands : [];
    const brands2 = raw.map((r) => r).map((r) => ({
      brand: String(r.brand ?? "").trim(),
      domain: cleanStr5(r.domain)?.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
      take: String(r.take ?? "").trim(),
      url: httpUrl4(r.url)
    })).filter((r) => r.brand && r.take).slice(0, 6);
    return Response.json({ brands: brands2 });
  }

  // ../brandbrain/app/api/studio/path-suggest/route.ts
  var route_exports22 = {};
  __export(route_exports22, {
    POST: () => POST21,
    maxDuration: () => maxDuration20,
    runtime: () => runtime22
  });
  var runtime22 = "nodejs";
  var maxDuration20 = 120;
  var SYSTEM14 = `You are brandbrain, advising a consumer (D2C) founder which strategic approach fits their brand. The four approaches: founder-led (the founder's lived credibility leads), story-led (a founding narrative leads), ingredient-led (a hero ingredient or format leads), problem-led (a sharp problem/enemy leads). Judge the best fit for THIS brand from its brief and gap, and give a tight, specific, brand-relevant reason for each. Output ONLY the JSON asked for.`;
  var str3 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  async function POST21(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const b = body.brief ?? {};
    if (!b.productIdea && !b.category) return Response.json({ error: "No brief" }, { status: 400 });
    const briefLine = [
      `Product: ${b.productIdea || "(infer)"}`,
      `Category: ${b.category || ""}`,
      `Audience: ${b.audience || ""}`,
      `Vibe: ${b.vibe || ""}`,
      `Angle: ${b.positioningHint || ""}`
    ].filter(Boolean).join(" \xB7 ");
    const gapLine = body.gap?.title ? `
Chosen gap: ${body.gap.title} \u2014 ${body.gap.rationale || ""}` : "";
    const prompt5 = `Brand: ${briefLine}${gapLine}

Which approach fits best, and why does each fit (or not) THIS brand? Reasons must be specific to this brand \u2014 name its actual gap/ingredient/audience, not generic. Each reason \u2264 16 words.

Return ONLY: {"recommended":"founder|story|ingredient|problem","notes":{"founder":"...","story":"...","ingredient":"...","problem":"..."}}`;
    let text = await runClaude(prompt5, { system: SYSTEM14, effort: "low", timeoutMs: 9e4 });
    let parsed = text ? extractJson(text) : null;
    if (!parsed) {
      text = await runClaude(prompt5 + "\n\nReturn ONLY the JSON object \u2014 nothing else.", { system: SYSTEM14, effort: "low", timeoutMs: 9e4 });
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t suggest a path" }, { status: 503 });
    const ids = PATHS.map((p) => p.id);
    const recommended = ids.includes(String(parsed.recommended)) ? String(parsed.recommended) : null;
    const rawNotes = parsed.notes ?? {};
    const notes = {};
    for (const p of PATHS) {
      const n = str3(rawNotes[p.id]);
      if (n) notes[p.id] = n;
    }
    return Response.json({ recommended, notes });
  }

  // ../brandbrain/app/api/studio/route.ts
  var route_exports23 = {};
  __export(route_exports23, {
    POST: () => POST22,
    maxDuration: () => maxDuration21,
    runtime: () => runtime23
  });
  var runtime23 = "nodejs";
  var maxDuration21 = 180;
  var newId = (taskId) => `${taskId}-${crypto.randomUUID().slice(0, 8)}`;
  var httpUrl5 = (v) => {
    const s2 = String(v ?? "").trim();
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  var hex2 = (v) => {
    const s2 = String(v ?? "").trim();
    return /^#?[0-9a-f]{6}$/i.test(s2) ? s2.startsWith("#") ? s2 : `#${s2}` : void 0;
  };
  var cleanStr6 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var cleanArr = (v) => Array.isArray(v) ? v.map((x) => String(x ?? "").trim()).filter(Boolean).slice(0, 6) : void 0;
  function briefText(b) {
    return [
      `Product / idea: ${b.productIdea || "(infer)"}`,
      `Category: ${b.category || "(infer)"}`,
      `Audience: ${b.audience || "(infer)"}`,
      `Demographics: ${b.demographics || "(infer)"}`,
      `Price tier: ${b.priceTier || "Mid"}`,
      `Market: ${b.market || "(infer)"}`,
      `Vibe: ${b.vibe || "(infer)"}`,
      `Positioning hint: ${b.positioningHint || "(infer)"}`
    ].join("\n");
  }
  async function POST22(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const task = getTask(body.taskId ?? "");
    if (!task) return Response.json({ error: "Unknown task" }, { status: 400 });
    const sessionId = body.sessionId || "default";
    const brief = body.brief ?? {};
    const selections = body.selections ?? {};
    const lines = [
      `The founder's INITIAL idea (a starting spark \u2014 history, NOT the spec):`,
      briefText(brief),
      `This idea has since been SHAPED by the decisions below. Where they differ from the initial idea, the DECISIONS WIN. Critically: do NOT reintroduce angles, features or benefits from the initial idea that the decisions have moved away from \u2014 if something isn't reflected in the positioning, audience, gap or the decided brand, it is NOT part of this brand, so leave it out entirely.`,
      ""
    ];
    const decided = (body.decided ?? []).map((d) => ({ label: String(d?.label ?? "").trim(), value: String(d?.value ?? "").trim() })).filter((d) => d.label && d.value);
    if (decided.length) {
      lines.push("The brand as DECIDED so far \u2014 this is the source of truth; every option must fit it:");
      lines.push(...decided.map((d) => `- ${d.label}: ${d.value}`));
      lines.push("");
    }
    const market = brief.market?.trim();
    if (market) {
      lines.push(
        `Target market: ${market}. Anchor every market-specific claim \u2014 competitors, prices, channels, regional context \u2014 to ${market}: use its local currency for prices and the real brands/retailers/platforms that operate there. (Trends and cross-category analogues may still draw on global examples.)`,
        ""
      );
    }
    if (body.gap?.title) {
      lines.push(`The founder is going after this gap in the market \u2014 every option must serve it:`);
      lines.push(`"${body.gap.title}" \u2014 ${body.gap.rationale ?? ""}`.trim());
      lines.push("");
    }
    if (body.path && PATH_BY_ID[body.path]) {
      lines.push(PATH_BY_ID[body.path].lens);
      lines.push("");
    }
    const rivals = (body.rivals ?? []).map((r) => String(r ?? "").trim()).filter(Boolean).slice(0, 6);
    if (rivals.length) {
      lines.push(`The founder benchmarks against these direct rivals \u2014 position against them, don't blend in: ${rivals.join(", ")}.`);
      lines.push("");
    }
    const picked = (body.pickedShifts ?? []).map((s2) => String(s2 ?? "").trim()).filter(Boolean).slice(0, 6);
    if (picked.length) {
      lines.push(`The founder personally resonates with these shifts \u2014 lean HARD into them, make the options embody them:`);
      lines.push(...picked.map((s2) => `- ${s2}`));
      lines.push("");
    }
    if (body.analogue?.brand && body.analogue.moves?.length) {
      const plays = body.analogue.moves.slice(0, 3).map((m) => m.play).filter(Boolean);
      lines.push(`Cross-category analogue to borrow from: ${body.analogue.thesis || body.analogue.brand}.`);
      if (plays.length) lines.push(`Apply its winning plays where they fit: ${plays.join("; ")}.`);
      lines.push("");
    }
    if (body.trends?.trends?.length || body.trends?.whitespace) {
      const shifts = (body.trends.trends ?? []).slice(0, 4).map((t) => `${t.dimension ? `${t.dimension}: ` : ""}${t.shift || t.opportunity || ""}`.trim()).filter(Boolean);
      lines.push(`Emerging shifts in this category \u2014 lean options toward where preference is heading, not where it's been:`);
      if (shifts.length) lines.push(...shifts.map((s2) => `- ${s2}`));
      if (body.trends.whitespace) lines.push(`The opening they point to: ${body.trends.whitespace}.`);
      lines.push("");
    }
    const ctx = [];
    for (const depId of task.deps) {
      const picked2 = selections[depId];
      if (picked2 && picked2.length) {
        const dep = getTask(depId);
        ctx.push(
          `${dep?.title ?? depId} \u2014 locked: ${picked2.map((c) => `${c.title}${c.body ? ` (${c.body})` : ""}`).join("; ")}`
        );
      }
    }
    if (ctx.length) {
      lines.push("Decisions already locked \u2014 build on these, do not contradict them:");
      lines.push(...ctx.map((c) => `- ${c}`));
      lines.push("");
    }
    if (body.steer?.trim()) {
      lines.push(`The founder added this steer \u2014 let it directly shape the options (honour it, don't ignore it): "${body.steer.trim()}".`);
      lines.push("");
    }
    lines.push(`Generate ${task.count} options for "${task.title}". ${task.fields}`);
    lines.push(task.web ? "Search the web for real, current data and cite real source urls." : "Do not use web search \u2014 generate from your knowledge.");
    lines.push("Keep every field tight and glanceable: body = one sentence max; bullets = short phrases, not sentences; no padding or preamble. A card is scanned, not read.");
    lines.push("");
    lines.push(
      `Return ONLY this JSON: {"cards":[{"title":"...","subtitle":"...","body":"...","bullets":["..."],"chips":["..."],"palette":[{"name":"...","hex":"#RRGGBB"}],"meta":[{"label":"...","value":"..."}],"reference":{"brand":"...","domain":"...","url":"..."},"source":"..."}]}. Include only the fields named for this task; omit the rest.`
    );
    const prompt5 = lines.join("\n");
    let parsed = null;
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      const p = attempt === 0 ? prompt5 : prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences, no trailing text.";
      const text = await sessionSend(sessionId, p);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ cards: [], error: "generation_failed" }, { status: 503 });
    const raw = Array.isArray(parsed.cards) ? parsed.cards : [];
    const cards = raw.map((c) => c).map((c) => {
      const ref = c.reference;
      const palette = Array.isArray(c.palette) ? c.palette.map((p) => ({ name: String(p?.name ?? "").trim(), hex: hex2(p?.hex) })).filter((p) => !!p.hex).slice(0, 6) : void 0;
      const meta = Array.isArray(c.meta) ? c.meta.map((m) => ({ label: String(m?.label ?? "").trim(), value: String(m?.value ?? "").trim() })).filter((m) => m.label && m.value).slice(0, 6) : void 0;
      const card = {
        id: newId(task.id),
        title: String(c.title ?? "").trim(),
        subtitle: cleanStr6(c.subtitle),
        body: cleanStr6(c.body),
        bullets: cleanArr(c.bullets),
        chips: cleanArr(c.chips),
        palette: palette && palette.length ? palette : void 0,
        meta: meta && meta.length ? meta : void 0,
        reference: ref?.brand ? {
          brand: String(ref.brand).trim(),
          domain: cleanStr6(ref.domain)?.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
          url: httpUrl5(ref.url)
        } : void 0,
        source: httpUrl5(c.source)
      };
      return card;
    }).filter((c) => c.title).slice(0, task.count);
    return Response.json({ cards });
  }

  // ../brandbrain/app/api/studio/shelf/route.ts
  var route_exports24 = {};
  __export(route_exports24, {
    POST: () => POST23,
    maxDuration: () => maxDuration22,
    runtime: () => runtime24
  });
  var runtime24 = "nodejs";
  var maxDuration22 = 240;
  var SYSTEM15 = `You are brandbrain's product-shelf researcher. You find the REAL products selling in a category using web search, and you CITE every one. Hard rule (cite-or-omit): include a product ONLY if you found a real listing with a real url \u2014 never invent a product, price, rating, or image url. Only include an "image" if it is the actual product image url you saw on the page (an og:image or product photo); if you didn't see one, leave it out. Prefer what's genuinely popular/bestselling. Sentence case, no emoji. Output ONLY the JSON asked for.`;
  var cleanStr7 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var httpUrl6 = (v) => {
    const s2 = String(v ?? "").trim();
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  async function ogImage(pageUrl) {
    try {
      const u = new URL(pageUrl);
      if (u.protocol !== "https:") return void 0;
      const host2 = u.hostname.toLowerCase();
      if (host2 === "localhost" || host2.endsWith(".local") || /^(10|127|0)\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\./.test(host2)) return void 0;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6e3);
      const r = await fetch(pageUrl, {
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "user-agent": "Mozilla/5.0 (compatible; brandbrain/1.0; +https://brandbrain.app)", accept: "text/html,application/xhtml+xml" }
      }).finally(() => clearTimeout(timer));
      if (!r.ok || !(r.headers.get("content-type") || "").includes("text/html")) return void 0;
      const html = (await r.text()).slice(0, 3e5);
      const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image(?::src)?)["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i);
      let img = m?.[1]?.trim();
      if (!img) return void 0;
      if (img.startsWith("//")) img = "https:" + img;
      else if (img.startsWith("/")) img = u.origin + img;
      return /^https:\/\//i.test(img) ? img : void 0;
    } catch {
      return void 0;
    }
  }
  async function POST23(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const category = cleanStr7(body.category);
    const market = cleanStr7(body.market);
    if (!category) return Response.json({ error: "No category to search the shelf for." }, { status: 400 });
    const marketLine = market ? `Focus on ${market}: use its marketplaces (e.g. Amazon.${market === "India" ? "in" : "*"}, quick-commerce like Blinkit/Zepto/Instamart, Nykaa, and local D2C sites) and its currency.` : `Use the major marketplaces and the product's local currency.`;
    const prompt5 = `Find the REAL products a founder would see today searching the "${category}" category \u2014 what's popular / bestselling on Amazon, quick-commerce, Google Shopping and the leading direct-to-consumer sites.${body.gap ? ` They're going after this opening: ${body.gap}.` : ""}${body.positioning ? ` Their positioning: ${body.positioning}.` : ""}

${marketLine}

For each product give: the product name, the brand, the price (with currency), the marketplace/site it's on, its rating if shown (e.g. "4.3 (2.1k)"), the product/listing url, and the product image url IF you actually see one on the page (og:image / product photo).

CITE-OR-OMIT: only include a product with a real listing url you found. Never invent a product, price, rating, or image. Only include "image" when it's a real image url you saw \u2014 omit it otherwise (a missing image is fine and honest).

SPEED: prioritise returning the product LIST quickly. Include an "image" only when the url appears directly in your search results \u2014 do NOT open every product page just to hunt for an image; a product with no image is fine.

Aim for 8-12 real products spanning the price range and the different marketplaces. Return ONLY this JSON:
{"products":[{"name":"...","brand":"...","price":"...","marketplace":"...","rating":"...","image":"https://...","url":"https://..."}]}`;
    const opts = {
      system: SYSTEM15,
      allowedTools: ["WebSearch", "WebFetch"],
      effort: "low",
      timeoutMs: 21e4
    };
    let parsed = null;
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2e3));
      const pr = attempt === 0 ? prompt5 : prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.";
      const text = await runClaude(pr, opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t load the shelf right now \u2014 try again." }, { status: 503 });
    const products = (Array.isArray(parsed.products) ? parsed.products : []).map((p) => p).map((p) => ({
      name: cleanStr7(p.name) || "",
      brand: cleanStr7(p.brand),
      price: cleanStr7(p.price),
      marketplace: cleanStr7(p.marketplace),
      rating: cleanStr7(p.rating),
      image: httpUrl6(p.image),
      url: httpUrl6(p.url) || ""
    })).filter((p) => p.name && p.url).slice(0, 12);
    await Promise.all(products.filter((p) => !p.image).map(async (p) => {
      p.image = await ogImage(p.url);
    }));
    return Response.json({ products });
  }

  // ../brandbrain/app/api/studio/store/route.ts
  var route_exports25 = {};
  __export(route_exports25, {
    POST: () => POST24,
    maxDuration: () => maxDuration23,
    runtime: () => runtime25
  });
  var runtime25 = "nodejs";
  var maxDuration23 = 300;
  function describe(b) {
    const palette = (b.palette ?? []).map((p) => `${p.name ?? ""} ${p.hex ?? ""}`.trim()).filter(Boolean).join(", ");
    return [
      `Brand name: "${b.name}".`,
      b.idea && `What it sells: ${b.idea}.`,
      b.category && `Category: ${b.category}.`,
      b.range && `Launch range: ${b.range}.`,
      b.audience && `Audience: ${b.audience}.`,
      b.demographics && `Demographics: ${b.demographics}.`,
      b.market && `Home market: ${b.market}.`,
      b.positioning && `Positioning: ${b.positioning}`,
      b.identity && `Visual identity: ${b.identity}`,
      palette && `Palette: ${palette}.`,
      b.vibe && `Vibe: ${b.vibe}.`,
      b.approach && `Chosen storefront approach: ${b.approach}.`
    ].filter(Boolean).join(" ");
  }
  async function POST24(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const b = body.brand ?? {};
    if (!b.name) return Response.json({ error: "Describe the brand first" }, { status: 400 });
    const prompt5 = `You have the founder's connected Shopify MCP tools, including get-new-store-previews. The founder is creating a BRAND-NEW store for a NEW brand \u2014 NOT an existing/connected store \u2014 so it is correct to set userUnderstandsNewStoreOnly:true WITHOUT asking. Do NOT call any shop-scoped tool (get-shop-info, search-products, etc.) \u2014 only get-new-store-previews.

Compress this brand into the three required keyword fields (each a comma-delimited phrase, max 78 chars, grounded ONLY in the brand below \u2014 no invented attributes):
- productOrService, targetAudience, brandStyle. Set "locale" from the target market's primary language.

Brand: ${describe(b)}

Call get-new-store-previews once with those fields + userUnderstandsNewStoreOnly:true. It takes a few minutes \u2014 wait for the previews to finish. When you have them, reply with ONLY this JSON and nothing else: {"previews":[{"title":"<a short label for this preview>","image":"<https preview image url>","url":"<the preview / claim-a-new-store url>"}]}. Include every preview returned. If you genuinely cannot (no Shopify MCP, or it failed), reply with {"previews":[]}.`;
    const text = await runClaude(prompt5, { mcp: true, timeoutMs: 285e3 });
    const parsed = text ? extractJson(text) : null;
    const raw = Array.isArray(parsed?.previews) ? parsed.previews : [];
    const httpUrl10 = (v) => {
      const s2 = String(v ?? "").trim();
      return /^https?:\/\//i.test(s2) ? s2 : void 0;
    };
    const previews = raw.map((p) => p).map((p) => ({ title: String(p.title ?? "").trim() || "Store preview", image: httpUrl10(p.image), url: httpUrl10(p.url) })).filter((p) => p.url || p.image).slice(0, 3);
    if (!previews.length) {
      return Response.json(
        { error: "Couldn\u2019t generate store previews \u2014 is Shopify connected to your Claude Code?" },
        { status: 503 }
      );
    }
    return Response.json({ previews });
  }

  // ../brandbrain/app/api/studio/story/route.ts
  var route_exports26 = {};
  __export(route_exports26, {
    POST: () => POST25,
    maxDuration: () => maxDuration24,
    runtime: () => runtime26
  });
  var runtime26 = "nodejs";
  var maxDuration24 = 120;
  var SYSTEM16 = `You are brandbrain, a sharp, warm brand strategist onboarding a consumer (D2C) founder. You're uncovering the GAP they personally lived \u2014 the moment they hit it, the alternatives they tried, why those fell short, and who else feels it. Ask ONE incisive question at a time; never interrogate in bulk. Once you genuinely understand the gap (usually after 2\u20133 of their answers), stop asking and synthesise. Infer only from what they told you \u2014 never invent facts. Output ONLY the JSON asked for, no prose outside it.`;
  var str4 = (v, d = "") => typeof v === "string" && v.trim() ? v.trim() : d;
  async function POST25(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const messages = (body.messages ?? []).filter((m) => m?.text?.trim());
    if (!messages.length) return Response.json({ error: "Say something first" }, { status: 400 });
    const founderTurns = messages.filter((m) => m.role === "founder").length;
    const transcript = messages.map((m) => `${m.role === "founder" ? "Founder" : "You"}: ${m.text.trim()}`).join("\n");
    const mustSynthesise = founderTurns >= 4;
    const prompt5 = `Conversation so far:
${transcript}

` + (mustSynthesise ? `You now have enough. SYNTHESISE \u2014 do not ask another question.
` : `Decide: do you understand the gap well enough to synthesise, or do you need one more answer?
`) + `If you need more, return {"done":false,"question":"your single warm next question"}.
If you understand enough, return {"done":true,"summary":"the lived gap in 1-2 sentences","gap":{"title":"the lived gap as a 2-5 word opening","rationale":"one line: why this opening is real, from what they lived"},"brief":{"productIdea":"the product in a phrase","category":"category","audience":"who it's for","demographics":"age/gender/income/region in a phrase","priceTier":"Value|Mid|Premium","market":"primary market","vibe":"3-5 comma-separated keywords","positioningHint":"the SPECIFIC unsolved gap they lived, as a one-line angle"}}.
Return ONLY the JSON.`;
    let text = await runClaude(prompt5, { system: SYSTEM16, effort: "low", timeoutMs: 9e4 });
    let parsed = text ? extractJson(text) : null;
    if (!parsed) {
      text = await runClaude(prompt5 + "\n\nReturn ONLY the JSON object \u2014 nothing else.", { system: SYSTEM16, effort: "low", timeoutMs: 9e4 });
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t follow that \u2014 try again." }, { status: 503 });
    const done = parsed.done === true || mustSynthesise;
    if (!done) {
      const question = str4(parsed.question);
      if (!question) return Response.json({ done: false, question: "Tell me a bit more \u2014 what did you try, and where did it fall short?" });
      return Response.json({ done: false, question });
    }
    const b = parsed.brief ?? {};
    const tier = ["Value", "Mid", "Premium"].includes(str4(b.priceTier)) ? str4(b.priceTier) : "Mid";
    const brief = {
      productIdea: str4(b.productIdea),
      category: str4(b.category),
      audience: str4(b.audience),
      demographics: str4(b.demographics),
      priceTier: tier,
      market: str4(b.market),
      vibe: str4(b.vibe),
      positioningHint: str4(b.positioningHint)
    };
    if (!brief.productIdea) {
      return Response.json({ done: false, question: "Got it. In one line \u2014 what would you actually make to solve that?" });
    }
    const g = parsed.gap ?? {};
    const gapTitle = str4(g.title);
    const gap = gapTitle ? { title: gapTitle, rationale: str4(g.rationale) } : null;
    return Response.json({ done: true, summary: str4(parsed.summary), brief, gap });
  }

  // ../brandbrain/app/api/studio/trends/route.ts
  var route_exports27 = {};
  __export(route_exports27, {
    POST: () => POST26,
    maxDuration: () => maxDuration25,
    runtime: () => runtime27
  });
  var runtime27 = "nodejs";
  var maxDuration25 = 180;
  var SYSTEM17 = `You are brandbrain, a consumer-trends analyst for D2C founders. You read how buyer PREFERENCE in a category is shifting \u2014 not generic macro fluff, but concrete, category-specific change a founder can build on. Every brand and domain you cite must be REAL and from your own knowledge; never invent a brand, domain or statistic. Describe momentum qualitatively. Sentence case, no emoji, no hashtags. Output ONLY the JSON asked for.`;
  var cleanStr8 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var domain4 = (v) => cleanStr8(v)?.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  var httpUrl7 = (v) => {
    const s2 = String(v ?? "").trim();
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  var arr4 = (v) => Array.isArray(v) ? v : [];
  var num01 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5;
  };
  function context(canvas, brief) {
    const cat = canvas?.category?.name ? `Category: ${canvas.category.name}${canvas.category.scope ? ` \u2014 ${canvas.category.scope}` : ""}` : brief?.category ? `Category: ${brief.category}` : "";
    const segs = (canvas?.segments ?? []).map((s2) => s2.name).filter(Boolean).join(", ");
    const players = (canvas?.players ?? []).map((p) => p.brand).filter(Boolean).slice(0, 12).join(", ");
    const market = brief?.market ? `Home market: ${brief.market}` : "";
    const audience = brief?.audience ? `Audience: ${brief.audience}` : "";
    return [cat, segs && `Segments: ${segs}`, players && `Players already mapped: ${players}`, market, audience].filter(Boolean).join("\n");
  }
  function prompt4(idea, canvas, brief, steer) {
    const steerLine = steer?.trim() ? `

The founder added this steer \u2014 let it refocus the trend read: "${steer.trim()}".` : "";
    const market = brief?.market?.trim();
    const lensLine = market ? `Take a GLOBAL view to spot the shifts \u2014 the leading edge can emerge anywhere (US, Europe, Korea, Japan, India, wherever it's first). For each, note in the insight whether it has already landed in ${market} or is still emerging there, since that's where this founder launches. Do not limit the shifts to ${market}; the point is to import what's coming.` : `Take a GLOBAL view \u2014 the leading edge of a shift can emerge anywhere; surface what's coming, not just what's local.`;
    return `The founder's idea: "${idea}".
${context(canvas, brief)}${steerLine}

Read how CONSUMER PREFERENCE in this exact category is shifting right now \u2014 the changes a founder could ride to launch something new. Use your own deep knowledge; do NOT search the web. ${lensLine} Cover the dimensions that actually move buyers in THIS category \u2014 choose from and adapt: design / aesthetic, form factor / format, fragrance or flavour profile, materials / ingredients, ritual / how it's used, values / ethics, price-value expectations, distribution / how it's discovered. Skip dimensions that don't apply; don't force all of them.

Return ONLY this JSON:
{"trends":[{"dimension":"the axis of change (e.g. Form factor, Fragrance, Design, Ritual, Values)","shift":"the changing preference phrased 'from X \u2192 to Y'","insight":"one tight line on what's driving it / why now (max ~16 words)","opportunity":"the specific new product or angle this shift opens for a founder here (max ~16 words)","signal":"a REAL brand riding this shift, or a qualitative proof","domain":"thatbrand.com if you named one","heat":0.0-1.0}, ...],"whitespace":"one line: the new thing these shifts COLLECTIVELY point to \u2014 the something-new before deciding anything","sources":[]}

Rules: 4-6 trends, each genuinely distinct and specific to this category (not "consumers want sustainability" generic). shift MUST use the "from X \u2192 to Y" form. heat = how fast this preference is moving (0\u20131). opportunity must be concrete and buildable, not a platitude. Every named brand and domain must be REAL \u2014 omit signal/domain rather than invent. whitespace ties them together into the new opening.`;
  }
  function sanitize3(raw, category) {
    const trends = arr4(raw.trends).map((x) => x).map((x) => ({
      dimension: cleanStr8(x.dimension) || "",
      shift: cleanStr8(x.shift) || "",
      insight: cleanStr8(x.insight) || "",
      opportunity: cleanStr8(x.opportunity) || "",
      signal: cleanStr8(x.signal),
      domain: domain4(x.domain),
      heat: num01(x.heat)
    })).filter((t) => t.dimension && t.shift && t.opportunity).slice(0, 6);
    if (!trends.length) return null;
    const sources = arr4(raw.sources).map((x) => httpUrl7(x)).filter((u) => !!u).slice(0, 8);
    return { category, trends, whitespace: cleanStr8(raw.whitespace), sources };
  }
  async function POST26(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const idea = (body.idea ?? body.brief?.productIdea ?? "").trim();
    if (!idea) return Response.json({ error: "Describe your idea" }, { status: 400 });
    const category = body.canvas?.category?.name || body.brief?.category || "this category";
    const grounded = body.grounded === true;
    const opts = { system: SYSTEM17, allowedTools: grounded ? ["WebSearch", "WebFetch"] : void 0, effort: "low", timeoutMs: grounded ? 14e4 : 6e4 };
    const p = prompt4(idea, body.canvas, body.brief, body.steer);
    let text = await runClaude(p, opts);
    let parsed = text ? extractJson(text) : null;
    let trends = parsed ? sanitize3(parsed, category) : null;
    if (!trends) {
      text = await runClaude(p + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.", opts);
      parsed = text ? extractJson(text) : null;
      trends = parsed ? sanitize3(parsed, category) : null;
    }
    if (!trends) {
      return Response.json({ error: "Couldn\u2019t read the category trends \u2014 is Claude Code signed in?" }, { status: 503 });
    }
    return Response.json({ trends: { ...trends, grounded } });
  }

  // ../brandbrain/app/api/studio/validate/route.ts
  var route_exports28 = {};
  __export(route_exports28, {
    POST: () => POST27,
    maxDuration: () => maxDuration26,
    runtime: () => runtime28
  });
  var runtime28 = "nodejs";
  var maxDuration26 = 240;
  var SYSTEM18 = `You are brandbrain's market-validation analyst. You pressure-test a founder's brand against reality using web search, and you CITE every grounded claim. Hard rule (cite-or-omit): a grounded fact appears ONLY if a real web source backs it \u2014 never invent a market size, growth rate, competitor price or statistic. The unit-economics section is the ONE exception: it is an explicit ESTIMATE from the given price and category norms, clearly flagged, never presented as fact. Be honest, not flattering \u2014 surface the weak numbers too. Sentence case, no emoji. Output ONLY the JSON asked for.`;
  var cleanStr9 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var httpUrl8 = (v) => {
    const s2 = String(v ?? "").trim();
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  var httpUrls2 = (v) => (Array.isArray(v) ? v : [v]).map(httpUrl8).filter((u) => !!u);
  var host = (u) => {
    try {
      return new URL(u).hostname.replace(/^www\./, "");
    } catch {
      return u;
    }
  };
  var SECTION_KEYS = ["market_size", "demand", "pricing", "unit_economics", "defensibility"];
  var TITLES = {
    market_size: "Market size",
    demand: "Demand",
    pricing: "Pricing check",
    unit_economics: "Unit economics",
    defensibility: "Defensibility"
  };
  async function POST27(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const category = cleanStr9(body.category);
    const market = cleanStr9(body.market);
    if (!category) return Response.json({ error: "Finish the brand first \u2014 no category to validate." }, { status: 400 });
    const ctx = [
      `Brand: ${body.name || "(unnamed)"}.`,
      `Category: ${category}.`,
      market && `Market: ${market}.`,
      body.audience && `Audience: ${body.audience}.`,
      body.gap && `The opening it's going after: ${body.gap}.`,
      body.positioning && `Positioning: ${body.positioning}.`,
      body.pricing && `Chosen pricing: ${body.pricing}.`,
      body.sourcing && `Sourcing route: ${body.sourcing}.`,
      body.format && `Product form: ${body.format}.`,
      body.marketSize && `The market canvas already noted: ${body.marketSize} (verify / sharpen this with real sources).`
    ].filter(Boolean).join(" ");
    const marketLine = market ? `Anchor every market number to ${market}: use its local currency and real sources/retailers/platforms operating there. Global figures are fine only when clearly labelled as global.` : `State the geography each number refers to.`;
    const prompt5 = `Pressure-test this brand against reality and return a grounded validation for a founder about to raise or launch.

${ctx}

${marketLine}

Search hard for SPECIFIC, CITED figures \u2014 a real number with its year and geography beats a vague "large and growing". Prefer named sources (market-research reports, industry bodies, credible news, company filings, live product pages).

Produce these five sections:
1. market_size (GROUNDED) \u2014 give TAM, and SAM/SOM where derivable, each as a real figure with its currency, year and geography, from a named report/source (e.g. Statista, Grand View, IBEF, Nielsen, a news figure). If only a global figure exists, label it global and reason a market-specific slice. No invented precision \u2014 but do not settle for adjectives when a number is findable.
2. demand (GROUNDED) \u2014 is the category actually growing and is this specific opening real? Cite hard signals: a category CAGR / growth %, search or sales-trend data, funding into the space, a named cultural shift \u2014 with the number and source.
3. pricing (GROUNDED) \u2014 is the chosen price competitive? Pull the REAL current prices of 2-3 named competitor products (with the price and product-page source) and say plainly whether the chosen price sits below / at / above the set.
4. unit_economics (ESTIMATE) \u2014 from the chosen retail price and an ESTIMATED COGS for this category + sourcing route + form, give: retail price, estimated COGS, estimated gross margin %, and one line on whether the margin supports paid acquisition. This section is an estimate: no citations, confidence low, and the note MUST say it's an estimate to verify with real vendor quotes.
5. defensibility (GROUNDED where possible) \u2014 what protects this opening (or the honest risk that it doesn't); cite any real evidence (incumbent moves, copycats, barriers).

CITE-OR-OMIT (grounded sections only): every grounded fact carries at least one REAL source url you actually found. If you can't verify a number, leave it out or say so in the section note \u2014 never estimate inside a grounded section. CORROBORATE: prefer facts confirmed by 2+ independent sources; list all urls in that fact's "sources".

Return ONLY this JSON:
{"headline":"one honest line on how real/fundable this looks","sections":[{"key":"market_size","kind":"grounded","verdict":"one honest line","facts":[{"label":"TAM","value":"...","sources":["https://real"],"confidence":"high|medium|low"}],"note":"optional caveat / what couldn't be verified"}]}
Each fact "label" is a SHORT tag of 1-4 words (e.g. "TAM", "Category CAGR", "IRIS price") \u2014 never a sentence; the detail goes in "value". Include all five sections in the order above with the exact keys. Use confidence "high" only for a clearly, independently-sourced fact.`;
    const opts = {
      system: SYSTEM18,
      allowedTools: ["WebSearch", "WebFetch"],
      effort: "low",
      timeoutMs: 21e4
    };
    let parsed = null;
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2e3));
      const pr = attempt === 0 ? prompt5 : prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.";
      const text = await runClaude(pr, opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t validate this brand right now \u2014 try again." }, { status: 503 });
    const rawSections = Array.isArray(parsed.sections) ? parsed.sections : [];
    const byKey = /* @__PURE__ */ new Map();
    for (const s2 of rawSections) {
      const k = String(s2?.key ?? "");
      if (SECTION_KEYS.includes(k)) byKey.set(k, s2);
    }
    const sections = SECTION_KEYS.map((key) => {
      const s2 = byKey.get(key);
      const isEstimate = key === "unit_economics";
      const rawFacts = s2 && Array.isArray(s2.facts) ? s2.facts : [];
      const facts = rawFacts.map((f) => {
        const sources = Array.from(new Set(httpUrls2(f.sources)));
        const independent = new Set(sources.map(host)).size;
        let confidence = ["high", "medium", "low"].includes(String(f.confidence)) ? String(f.confidence) : "low";
        if (isEstimate) confidence = "low";
        else if (confidence === "high" && independent < 2) confidence = "medium";
        return { label: cleanStr9(f.label) || "", value: cleanStr9(f.value) || "", sources, confidence };
      }).filter((f) => f.label && f.value && (isEstimate || f.sources.length > 0)).slice(0, 6);
      return {
        key,
        title: TITLES[key],
        kind: isEstimate ? "estimate" : "grounded",
        verdict: cleanStr9(s2?.verdict),
        facts,
        note: cleanStr9(s2?.note)
      };
    }).filter((s2) => s2.facts.length > 0 || s2.verdict || s2.note);
    const allSources = Array.from(new Set(sections.flatMap((s2) => s2.facts.flatMap((f) => f.sources)))).slice(0, 16);
    const validation = {
      headline: cleanStr9(parsed.headline),
      sections,
      sources: allSources
    };
    return Response.json({ validation });
  }

  // ../brandbrain/app/api/studio/vc-lens/route.ts
  var route_exports29 = {};
  __export(route_exports29, {
    POST: () => POST28,
    maxDuration: () => maxDuration27,
    runtime: () => runtime29
  });
  var runtime29 = "nodejs";
  var maxDuration27 = 240;
  var SYSTEM19 = `You are brandbrain's investor-lens analyst. You mine what venture investors PUBLICLY publish \u2014 sector/state-of-market reports and "why we invested" / thesis memos \u2014 and you CITE every claim with a real url you found via search. Hard rule (cite-or-omit): a thesis, a funded brand, a firm, or a number appears ONLY if a real, verifiable web source backs it. NEVER invent a VC firm, a report, a funded company, a thesis, or a url. Favour consumer / D2C-focused investors who actually write about this space (e.g. Forerunner, VMG, CircleUp, L Catterton, Imaginary, a16z consumer; in India: Fireside Ventures, DSG Consumer Partners, Sauce.vc, Sixth Sense, Elevation, Peak XV). Be honest, not promotional. Sentence case, no emoji. Output ONLY the JSON asked for.`;
  var cleanStr10 = (v) => {
    const s2 = String(v ?? "").trim();
    return s2 || void 0;
  };
  var httpUrl9 = (v) => {
    const s2 = String(v ?? "").trim();
    return /^https?:\/\//i.test(s2) ? s2 : void 0;
  };
  var domainOf2 = (v) => {
    const s2 = String(v ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(s2) ? s2 : void 0;
  };
  async function POST28(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const category = cleanStr10(body.category);
    const market = cleanStr10(body.market);
    if (!category) return Response.json({ error: "No category yet \u2014 build the market canvas first." }, { status: 400 });
    const ctx = [
      `Brand: ${body.name || "(unnamed)"}.`,
      `Category: ${category}.`,
      market && `Market / geography: ${market}.`,
      body.audience && `Audience: ${body.audience}.`,
      body.gap && `The opening it's going after: ${body.gap}.`,
      body.positioning && `Positioning: ${body.positioning}.`
    ].filter(Boolean).join(" ");
    const marketLine = market ? `Prioritise investors active in ${market} and its consumer market where they exist; global consumer-VC theses are fine when clearly relevant. Anchor any market number to ${market} or label it global.` : `State the geography each claim refers to.`;
    const prompt5 = `Research what venture investors publicly say about this category, for a founder about to build and raise.

${ctx}

${marketLine}

Search VC firm websites, their sector/"state of" reports, their "why we invested" and thesis posts, and credible funding-announcement coverage. Prefer NAMED firms and REAL, linkable sources.

Return three things:
1. theses \u2014 3-5 real investor theses on THIS space: what a named VC firm publicly argues is happening / worth backing here. Each carries the firm and the real source url (their report or memo).
2. funded \u2014 3-6 REAL brands recently funded in this space, each a one-line note (round / what they do / why it's a comp), the notable investor if known, the brand's website domain if known, and a real source url for the raise.
3. signals \u2014 3-5 market / why-now facts that come FROM VC writing (a category size or CAGR they cite, a named behavioural shift, a "why now") \u2014 each a short label, the value, and the real source url.

CITE-OR-OMIT: every item MUST carry a real source url you actually found. If you cannot verify something, leave it out \u2014 do not invent a firm, a brand, a thesis, or a link. Better to return fewer, real items than pad with guesses.

Return ONLY this JSON:
{"headline":"one line on how investors frame this category","theses":[{"claim":"...","investor":"Firm name","url":"https://real"}],"funded":[{"brand":"...","note":"...","investor":"Firm","domain":"brand.com","url":"https://real"}],"signals":[{"label":"Category CAGR","value":"...","url":"https://real"}]}`;
    const opts = {
      system: SYSTEM19,
      allowedTools: ["WebSearch", "WebFetch"],
      effort: "low",
      timeoutMs: 21e4
    };
    let parsed = null;
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2e3));
      const pr = attempt === 0 ? prompt5 : prompt5 + "\n\nReturn ONLY the JSON object \u2014 no prose, no code fences.";
      const text = await runClaude(pr, opts);
      parsed = text ? extractJson(text) : null;
    }
    if (!parsed) return Response.json({ error: "Couldn\u2019t pull the investor lens right now \u2014 try again." }, { status: 503 });
    const arr5 = (v) => Array.isArray(v) ? v : [];
    const theses = arr5(parsed.theses).map((t) => ({ claim: cleanStr10(t.claim) || "", investor: cleanStr10(t.investor) || "", url: httpUrl9(t.url) || "" })).filter((t) => !!t.claim && !!t.investor && !!t.url).slice(0, 6);
    const funded = arr5(parsed.funded).map((f) => ({ brand: cleanStr10(f.brand) || "", note: cleanStr10(f.note) || "", investor: cleanStr10(f.investor), domain: domainOf2(f.domain), url: httpUrl9(f.url) || "" })).filter((f) => !!f.brand && !!f.url).slice(0, 8);
    const signals = arr5(parsed.signals).map((s2) => ({ label: cleanStr10(s2.label) || "", value: cleanStr10(s2.value) || "", url: httpUrl9(s2.url) || "" })).filter((s2) => !!s2.label && !!s2.value && !!s2.url).slice(0, 6);
    const sources = Array.from(/* @__PURE__ */ new Set([...theses.map((t) => t.url), ...funded.map((f) => f.url), ...signals.map((s2) => s2.url)])).slice(0, 16);
    const lens = { headline: cleanStr10(parsed.headline), theses, funded, signals, sources };
    return Response.json({ lens });
  }

  // ../brandbrain/app/api/studio/visual/route.ts
  var route_exports30 = {};
  __export(route_exports30, {
    POST: () => POST29,
    maxDuration: () => maxDuration28,
    runtime: () => runtime30
  });
  var runtime30 = "nodejs";
  var maxDuration28 = 240;
  var aspect = (kind) => kind === "logo" ? "1:1" : kind === "moodboard" || kind === "palette" ? "16:9" : "4:5";
  function artDirection(b) {
    const palette = (b.palette ?? []).map((p) => `${p.name ?? ""} ${p.hex ?? ""}`.trim()).filter(Boolean).join(", ");
    return [
      `Brand name: "${b.name}".`,
      b.idea && `Product: ${b.idea}.`,
      b.gap && `The opening it owns: ${b.gap}.`,
      b.positioning && `Positioning: ${b.positioning}`,
      b.identity && `Visual identity direction: ${b.identity}`,
      palette && `Brand palette \u2014 use these EXACT colours as the dominant palette, no others: ${palette}.`,
      b.format && `Product FORM \u2014 the packaging is a "${b.format}". This is a FIXED product decision: render the product in exactly this form and package type. Do NOT substitute a different container (no bottle if it's a can, no can if it's a jar, etc.).`,
      b.vibe && `Vibe: ${b.vibe}.`,
      b.range && `Launch range: ${b.range}.`,
      b.market && `Home market: ${b.market}.`,
      `Hold ONE consistent art-direction across every asset for this brand \u2014 the same palette, lighting, texture and mood \u2014 so all of the brand's visuals read as a single coherent system.`
    ].filter(Boolean).join(" ");
  }
  function describe2(kind, b) {
    const ctx = artDirection(b);
    if (kind === "palette")
      return `A clean brand PALETTE & style reference board \u2014 abstract colour fields, soft gradients and material textures built ONLY from the exact brand colours below, giving each colour meaningful space. A pure colour-and-mood anchor: absolutely NO product, NO text, NO logo, NO people. ${ctx}`;
    if (kind === "logo")
      return `A clean, modern brand LOGO / wordmark for this brand \u2014 just the mark on a simple on-brand background, no product, no photo, crisp and graphic, works as an app icon and on packaging. ${ctx}`;
    if (kind === "moodboard")
      return `A brand MOODBOARD / key visual that captures the FEEL of this brand \u2014 atmospheric, editorial, on-brand colours and textures, evocative, NO text or logo. ${ctx}`;
    if (kind === "product")
      return `A premium PRODUCT / packaging mockup for this brand \u2014 the actual product packaging rendered on-brand, studio commercial photography, deck-worthy. ${ctx}`;
    if (kind === "ad")
      return `A scroll-stopping social AD creative / key visual for this brand's PAID campaign, made for an Instagram/Meta feed or story placement \u2014 thumb-stopping, premium commercial photography, on-brand palette, strong single focal subject with clean negative space where a short headline could sit. It must VISUALISE the specific ad concept given in the art direction below. No fake logos or garbled text in the image. ${ctx}`;
    return `A striking HERO key visual / product shot for this brand \u2014 premium commercial photography, on-brand, good enough for a pitch-deck cover. ${ctx}`;
  }
  async function POST29(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const kind = ["hero", "logo", "product", "moodboard", "palette", "ad"].includes(String(body.kind)) ? body.kind : "hero";
    const b = body.brand ?? {};
    if (!b.name) return Response.json({ error: "Describe the brand first" }, { status: 400 });
    const refJobId = typeof body.refJobId === "string" && body.refJobId.trim() ? body.refJobId.trim() : null;
    const steer = typeof body.steer === "string" && body.steer.trim() ? body.steer.trim() : null;
    const steerClause = steer ? ` FOUNDER'S ART DIRECTION (highest priority \u2014 honour this exactly, over any default you'd otherwise pick): ${steer}.` : "";
    const refClause = refJobId ? `

CONSISTENCY REFERENCE: this brand already has a generated visual \u2014 job id "${refJobId}". Reuse it as a style/image reference so the new image carries the SAME palette, lighting, texture and mood. Call models_explore for "marketing_studio_image" to find the correct medias[].role for a style/image reference, then pass medias: [{ "value": "${refJobId}", "role": "<that role>" }] into generate_image. Match the brand's LOOK \u2014 do not copy its composition or subject. If the model exposes no reference-media role, skip the reference and rely on the brief alone.` : "";
    const prompt5 = `You have the Higgsfield image tools available via MCP (generate_image, job_display, models_explore). Generate exactly ONE image with generate_image using model "marketing_studio_image" and aspect_ratio "${aspect(kind)}", count 1.

Image brief: ${describe2(kind, b)}${steerClause}${refClause}

generate_image returns a pending job \u2014 then poll job_display with that job id until its status is "completed", and read the final hosted image URL from the result (the raw png url). Do not give up while it is merely pending/in_progress; wait for completion. When you have the final URL, reply with ONLY this JSON and nothing else: {"url":"<the final https image url>","jobId":"<the generate_image job id>"}. If you genuinely cannot generate it (no image tool, or it failed), reply with {"url":null}.`;
    const text = await runClaude(prompt5, { mcp: true, timeoutMs: 22e4 });
    const parsed = text ? extractJson(text) : null;
    const url2 = typeof parsed?.url === "string" && /^https?:\/\//i.test(parsed.url) ? parsed.url : null;
    const jobId = typeof parsed?.jobId === "string" && parsed.jobId.trim() ? parsed.jobId.trim() : null;
    if (!url2) {
      return Response.json(
        { error: "Couldn\u2019t generate the visual \u2014 is Higgsfield connected to your Claude Code?" },
        { status: 503 }
      );
    }
    return Response.json({ url: url2, kind, jobId });
  }

  // ../brandbrain/app/api/vendors/route.ts
  var route_exports31 = {};
  __export(route_exports31, {
    GET: () => GET2,
    PUT: () => PUT,
    dynamic: () => dynamic2,
    runtime: () => runtime31
  });

  // examples/adapter/claude_storage.mjs
  var WORKSPACE_KEY = "workspace";
  var VENDORS_KEY = "vendors";
  async function req(params) {
    const provider2 = getProvider() || await whenProvider();
    if (!provider2) throw new Error("no provider \u2014 call setProvider(window.claude) after connect");
    return provider2.request({ method: "claude_storage", params });
  }
  async function storageGet(key) {
    const r = await req({ op: "get", key });
    return r?.value ?? null;
  }
  async function storageSet(key, value) {
    await req({ op: "set", key, value });
  }
  var workspaceRead = false;
  var vendorsRead = false;
  var workspaceLost = false;
  async function readWorkspace() {
    let raw;
    try {
      raw = await storageGet(WORKSPACE_KEY);
    } catch (err) {
      workspaceLost = true;
      throw err;
    }
    workspaceRead = true;
    try {
      sessionStorage.removeItem("sb:rehydrated");
    } catch {
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  async function writeWorkspace(data) {
    if (!workspaceRead) return;
    const brands2 = Array.isArray(data?.brands) ? data.brands : [];
    if (brands2.length === 0) {
      const existing = await readWorkspace();
      if (existing && Array.isArray(existing.brands) && existing.brands.length > 0) return;
    }
    await storageSet(WORKSPACE_KEY, JSON.stringify({ ...data, savedAt: data?.savedAt ?? nowSafe() }));
  }
  async function readVendors() {
    const raw = await storageGet(VENDORS_KEY);
    vendorsRead = true;
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  async function writeVendors(data) {
    if (!vendorsRead) return;
    const count = data?.vendors && typeof data.vendors === "object" ? Object.keys(data.vendors).length : 0;
    if (count === 0) {
      const existing = await readVendors();
      if (existing && existing.vendors && Object.keys(existing.vendors).length > 0) return;
    }
    await storageSet(VENDORS_KEY, JSON.stringify({ ...data, savedAt: data?.savedAt ?? nowSafe() }));
  }
  function nowSafe() {
    try {
      return Date.now();
    } catch {
      return 0;
    }
  }

  // ../brandbrain/app/api/vendors/route.ts
  var runtime31 = "nodejs";
  var dynamic2 = "force-dynamic";
  async function GET2() {
    const stored = await readVendors();
    return Response.json({ vendors: stored?.vendors ?? {} });
  }
  async function PUT(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const vendors = body.vendors && typeof body.vendors === "object" && !Array.isArray(body.vendors) ? body.vendors : {};
    try {
      await writeVendors({ vendors, savedAt: Date.now() });
      return Response.json({ ok: true, count: Object.keys(vendors).length });
    } catch {
      return Response.json({ error: "Couldn\u2019t persist the vendor book" }, { status: 500 });
    }
  }

  // ../brandbrain/app/api/workspace/route.ts
  var route_exports32 = {};
  __export(route_exports32, {
    GET: () => GET3,
    PUT: () => PUT2,
    dynamic: () => dynamic3,
    runtime: () => runtime32
  });
  var runtime32 = "nodejs";
  var dynamic3 = "force-dynamic";
  async function GET3() {
    const workspace = await readWorkspace();
    return Response.json({ workspace });
  }
  async function PUT2(req2) {
    let body;
    try {
      body = await req2.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const brands2 = Array.isArray(body.brands) ? body.brands : [];
    const activeId = typeof body.activeId === "string" ? body.activeId : null;
    try {
      await writeWorkspace({ brands: brands2, activeId, savedAt: Date.now() });
      return Response.json({ ok: true, count: brands2.length });
    } catch {
      return Response.json({ error: "Couldn\u2019t persist the workspace" }, { status: 500 });
    }
  }

  // examples/brandbrain-port/routes-entry.mjs
  var routes = {
    "/api/ask": route_exports,
    "/api/img": route_exports2,
    "/api/os/ads": route_exports3,
    "/api/os/briefing": route_exports4,
    "/api/os/draft": route_exports5,
    "/api/os/gmail": route_exports6,
    "/api/os/investors": route_exports7,
    "/api/os/network": route_exports8,
    "/api/os/pipeline": route_exports9,
    "/api/os/pulse": route_exports10,
    "/api/os/report": route_exports11,
    "/api/research/brand": route_exports12,
    "/api/studio/analogue": route_exports13,
    "/api/studio/brief": route_exports14,
    "/api/studio/canvas": route_exports15,
    "/api/studio/clone": route_exports16,
    "/api/studio/connect": route_exports17,
    "/api/studio/deepen": route_exports18,
    "/api/studio/end": route_exports19,
    "/api/studio/gaps": route_exports20,
    "/api/studio/inspiration": route_exports21,
    "/api/studio/path-suggest": route_exports22,
    "/api/studio": route_exports23,
    "/api/studio/shelf": route_exports24,
    "/api/studio/store": route_exports25,
    "/api/studio/story": route_exports26,
    "/api/studio/trends": route_exports27,
    "/api/studio/validate": route_exports28,
    "/api/studio/vc-lens": route_exports29,
    "/api/studio/visual": route_exports30,
    "/api/vendors": route_exports31,
    "/api/workspace": route_exports32
  };
  function mount(provider2) {
    if (provider2) setProvider(provider2);
    const app = createApp(routes);
    installFetchShim(app);
    return app;
  }
  if (typeof window !== "undefined") window.__switchboardRoutes = { mount, paths: Object.keys(routes) };
})();
