#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const chromeExecutable =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = new URL(process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3100");
const configuredBasePath = process.env.SMOKE_BASE_PATH?.trim() ?? "";
const smokeBasePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";
const canonicalOrigin = new URL(
  process.env.SMOKE_CANONICAL_ORIGIN ?? "http://localhost:3000",
).origin;
const visualizationDirectory =
  process.env.SMOKE_SCREENSHOT_DIR ??
  path.join(os.tmpdir(), "kim-tai-browser-smoke");

const mobile = {
  deviceScaleFactor: 3,
  height: 844,
  mobile: true,
  name: "mobile-390",
  touch: true,
  width: 390,
};

const narrowMobile = {
  deviceScaleFactor: 2,
  height: 568,
  mobile: true,
  name: "mobile-320",
  touch: true,
  width: 320,
};

const desktop = {
  deviceScaleFactor: 1,
  height: 900,
  mobile: false,
  name: "desktop-1440",
  touch: false,
  width: 1440,
};

const results = [];
const screenshots = [];
let chrome;
let profileDirectory;
let session;

const localePath = (locale) => `${smokeBasePath}/${locale}${smokeBasePath ? "/" : ""}`;
const metadataLocalePath = (locale) => `${smokeBasePath}/${locale}/`;

function formatDetail(detail) {
  if (typeof detail === "string") return detail;
  return JSON.stringify(detail);
}

function check(label, passed, detail) {
  const result = { detail, label, passed: Boolean(passed) };
  results.push(result);
  console.log(`${result.passed ? "PASS" : "FAIL"} | ${label} | ${formatDetail(detail)}`);
  return result.passed;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitFor(predicate, description, timeout = 15_000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await delay(50);
  }

  throw new Error(
    `Timed out waiting for ${description}${lastError ? `: ${lastError.message}` : ""}`,
  );
}

class CdpSession {
  constructor(webSocketUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(webSocketUrl);
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const onError = () => reject(new Error("CDP WebSocket connection failed"));
      this.socket.addEventListener("error", onError, { once: true });
      this.socket.addEventListener(
        "open",
        () => {
          this.socket.removeEventListener("error", onError);
          resolve();
        },
        { once: true },
      );
    });

    this.socket.addEventListener("message", async (event) => {
      const raw =
        typeof event.data === "string"
          ? event.data
          : Buffer.from(await event.data.arrayBuffer()).toString("utf8");
      const message = JSON.parse(raw);

      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timer);
        if (message.error) {
          pending.reject(
            new Error(`${pending.method}: ${message.error.message} (${message.error.code})`),
          );
        } else {
          pending.resolve(message.result ?? {});
        }
        return;
      }

      const listeners = this.listeners.get(message.method);
      if (!listeners) return;
      for (const listener of listeners) listener(message.params ?? {});
    });

    this.socket.addEventListener("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer);
        pending.reject(new Error(`CDP WebSocket closed while waiting for ${pending.method}`));
      }
      this.pending.clear();
    });
  }

  call(method, params = {}, timeout = 15_000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, timeout);
      this.pending.set(id, { method, reject, resolve, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(listener);
    return () => this.listeners.get(method)?.delete(listener);
  }

  waitForEvent(method, predicate = () => true, timeout = 20_000) {
    return new Promise((resolve, reject) => {
      const remove = this.on(method, (params) => {
        if (!predicate(params)) return;
        clearTimeout(timer);
        remove();
        resolve(params);
      });
      const timer = setTimeout(() => {
        remove();
        reject(new Error(`CDP event timed out: ${method}`));
      }, timeout);
    });
  }
}

async function launchChrome() {
  await stat(chromeExecutable);
  profileDirectory = await mkdtemp(path.join(os.tmpdir(), "kim-tai-cdp-"));

  const stderr = [];
  chrome = spawn(
    chromeExecutable,
    [
      "--headless=new",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-sync",
      "--hide-scrollbars",
      "--metrics-recording-only",
      "--no-default-browser-check",
      "--no-first-run",
      "--remote-allow-origins=*",
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDirectory}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  chrome.stderr.setEncoding("utf8");
  chrome.stderr.on("data", (chunk) => {
    stderr.push(chunk);
    if (stderr.join("").length > 20_000) stderr.shift();
  });

  const activePortPath = path.join(profileDirectory, "DevToolsActivePort");
  const activePort = await waitFor(
    async () => {
      if (chrome.exitCode !== null) {
        throw new Error(
          `Chrome exited with ${chrome.exitCode}: ${stderr.join("").trim()}`,
        );
      }
      try {
        const contents = await readFile(activePortPath, "utf8");
        const [port] = contents.trim().split("\n");
        return Number(port) || false;
      } catch (error) {
        if (error.code === "ENOENT") return false;
        throw error;
      }
    },
    "Chrome DevToolsActivePort",
  );

  const targetResponse = await fetch(
    `http://127.0.0.1:${activePort}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" },
  );
  if (!targetResponse.ok) {
    throw new Error(`Unable to create Chrome target: HTTP ${targetResponse.status}`);
  }
  const target = await targetResponse.json();

  session = new CdpSession(target.webSocketDebuggerUrl);
  await session.connect();
  await Promise.all([
    session.call("Page.enable"),
    session.call("Runtime.enable"),
    session.call("Network.enable"),
    session.call("Log.enable"),
  ]);

  return { activePort, target };
}

async function evaluate(expression) {
  const response = await session.call("Runtime.evaluate", {
    awaitPromise: true,
    expression,
    returnByValue: true,
    userGesture: true,
  });
  if (response.exceptionDetails) {
    const description =
      response.exceptionDetails.exception?.description ??
      response.exceptionDetails.text ??
      "Unknown browser evaluation error";
    throw new Error(description);
  }
  return response.result?.value;
}

async function setDeviceMetrics(device) {
  await session.call("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: device.deviceScaleFactor,
    height: device.height,
    mobile: device.mobile,
    screenHeight: device.height,
    screenWidth: device.width,
    width: device.width,
  });
  await session.call("Emulation.setTouchEmulationEnabled", {
    enabled: device.touch,
    maxTouchPoints: device.touch ? 5 : 1,
  });
}

async function setColorScheme(colorScheme) {
  await session.call("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-color-scheme", value: colorScheme },
      { name: "prefers-reduced-motion", value: "reduce" },
    ],
    media: "screen",
  });
}

async function clearOriginStorage() {
  await session.call("Storage.clearDataForOrigin", {
    origin: baseUrl.origin,
    storageTypes: "local_storage",
  });
}

function createTelemetry(name) {
  const requestUrls = new Map();
  const telemetry = {
    consoleErrors: [],
    exceptions: [],
    logErrors: [],
    name,
    networkFailures: [],
    responses: [],
  };

  const removers = [
    session.on("Network.requestWillBeSent", (event) => {
      requestUrls.set(event.requestId, event.request.url);
    }),
    session.on("Runtime.consoleAPICalled", (event) => {
      if (event.type !== "error" && event.type !== "warning") return;
      telemetry.consoleErrors.push({
        text: event.args
          .map((argument) => argument.value ?? argument.description ?? argument.type)
          .join(" "),
        type: event.type,
      });
    }),
    session.on("Runtime.exceptionThrown", (event) => {
      telemetry.exceptions.push(
        event.exceptionDetails?.exception?.description ??
          event.exceptionDetails?.text ??
          "Unknown exception",
      );
    }),
    session.on("Log.entryAdded", ({ entry }) => {
      if (entry.level === "error") telemetry.logErrors.push(entry.text);
    }),
    session.on("Network.loadingFailed", (event) => {
      telemetry.networkFailures.push({
        canceled: event.canceled ?? false,
        errorText: event.errorText,
        type: event.type,
        url: requestUrls.get(event.requestId) ?? "",
      });
    }),
    session.on("Network.responseReceived", (event) => {
      telemetry.responses.push({
        fromDiskCache: event.response.fromDiskCache ?? false,
        mimeType: event.response.mimeType,
        status: event.response.status,
        type: event.type,
        url: event.response.url,
      });
    }),
  ];

  return {
    data: telemetry,
    stop: () => removers.forEach((remove) => remove()),
  };
}

async function waitForPageReady() {
  await waitFor(
    async () =>
      evaluate(`document.readyState === "complete" && Boolean(document.querySelector("main"))`),
    "document readiness",
  );
  await delay(500);
}

async function navigate(pathname, name) {
  const telemetry = createTelemetry(name);
  const load = session.waitForEvent("Page.loadEventFired");
  const url = new URL(pathname, baseUrl).href;
  const navigation = await session.call("Page.navigate", { url });
  if (navigation.errorText) throw new Error(`Navigation failed: ${navigation.errorText}`);
  await load;
  await waitForPageReady();
  return telemetry;
}

async function reload(name) {
  const telemetry = createTelemetry(name);
  const load = session.waitForEvent("Page.loadEventFired");
  await session.call("Page.reload", { ignoreCache: false });
  await load;
  await waitForPageReady();
  return telemetry;
}

async function scrollThroughScreenshots() {
  const assetSelector = ".app-screenshot img, .store-button img";
  const count = await evaluate(`document.querySelectorAll("${assetSelector}").length`);
  for (let index = 0; index < count; index += 1) {
    await evaluate(`(() => {
      const image = document.querySelectorAll("${assetSelector}")[${index}];
      image?.scrollIntoView({ block: "center", inline: "nearest" });
      return Boolean(image);
    })()`);
    await delay(120);
  }
  await waitFor(
    async () =>
      evaluate(`Array.from(document.querySelectorAll("${assetSelector}")).every(
        (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
      )`),
    "all app screenshots and store badges to load",
  );
  await scrollToTop();
}

async function scrollToTop() {
  await evaluate(`(() => {
    const scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      scrollingElement.scrollTop = 0;
      scrollingElement.scrollLeft = 0;
    }
    window.scrollTo(0, 0);
    return { scrollX: window.scrollX, scrollY: window.scrollY };
  })()`);
  await waitFor(
    async () => evaluate(`Math.abs(window.scrollX) < 0.5 && Math.abs(window.scrollY) < 0.5`),
    "the page to return to the top-left corner",
  );
  await delay(100);
}

async function pageSnapshot() {
  return evaluate(`(() => {
    const isRendered = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    };
    const descriptor = (element) => ({
      ariaLabel: element.getAttribute("aria-label") || "",
      className: typeof element.className === "string" ? element.className : "",
      href: element instanceof HTMLAnchorElement ? element.href : "",
      tag: element.tagName.toLowerCase(),
      text: (element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 80),
    });
    const rgbaIsVisible = (color) =>
      color !== "transparent" && !/rgba\\([^)]*,\\s*0(?:\\.0+)?\\)$/.test(color);

    const controls = Array.from(document.querySelectorAll(
      'a[href], button, input, select, textarea, [role="button"]'
    )).filter(isRendered);
    const undersizedControls = controls.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width >= 43.5 && rect.height >= 43.5) return [];
      return [{ ...descriptor(element), height: Number(rect.height.toFixed(2)), width: Number(rect.width.toFixed(2)) }];
    });
    const unnamedControls = controls.filter((element) => {
      const name = element.getAttribute("aria-label") || element.getAttribute("title") ||
        (element.textContent || "").trim() || element.querySelector("img")?.alt;
      return !name;
    }).map(descriptor);

    const visibleBorders = Array.from(document.querySelectorAll("body *"))
      .filter(isRendered)
      .flatMap((element) => {
        const style = getComputedStyle(element);
        const edges = ["Top", "Right", "Bottom", "Left"].filter((edge) => {
          const width = Number.parseFloat(style["border" + edge + "Width"]);
          const borderStyle = style["border" + edge + "Style"];
          const color = style["border" + edge + "Color"];
          return width > 0 && borderStyle !== "none" && borderStyle !== "hidden" && rgbaIsVisible(color);
        });
        return edges.length ? [{ ...descriptor(element), edges }] : [];
      });

    const overflowingElements = Array.from(document.querySelectorAll("body *"))
      .filter((element) => isRendered(element) && !element.closest('[aria-hidden="true"]'))
      .flatMap((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.left >= -0.5 && rect.right <= document.documentElement.clientWidth + 0.5) return [];
        return [{ ...descriptor(element), left: Number(rect.left.toFixed(2)), right: Number(rect.right.toFixed(2)) }];
      })
      .slice(0, 12);

    const images = Array.from(document.querySelectorAll(".app-screenshot img")).map((image) => {
      const rect = image.getBoundingClientRect();
      return {
        alt: image.alt,
        complete: image.complete,
        currentSrc: image.currentSrc,
        inHero: Boolean(image.closest(".hero-visual")),
        naturalHeight: image.naturalHeight,
        naturalWidth: image.naturalWidth,
        renderedHeight: Number(rect.height.toFixed(2)),
        renderedWidth: Number(rect.width.toFixed(2)),
      };
    });

    const criticalSnapshot = (selector) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) return null;
      const style = getComputedStyle(element);
      const image = element.querySelector("img");
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        display: style.display,
        image: image
          ? {
              complete: image.complete,
              currentSrc: image.currentSrc,
              naturalHeight: image.naturalHeight,
              naturalWidth: image.naturalWidth,
            }
          : null,
        innerText: element.innerText.trim(),
        opacity: style.opacity,
        textContent: (element.textContent || "").trim(),
        visibility: style.visibility,
      };
    };
    const rectSnapshot = (selector) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) return null;
      const rect = element.getBoundingClientRect();
      return {
        bottom: Number(rect.bottom.toFixed(2)),
        height: Number(rect.height.toFixed(2)),
        left: Number(rect.left.toFixed(2)),
        right: Number(rect.right.toFixed(2)),
        top: Number(rect.top.toFixed(2)),
        width: Number(rect.width.toFixed(2)),
      };
    };

    const initialScrollX = window.scrollX;
    const initialScrollY = window.scrollY;
    window.scrollTo(100000, initialScrollY);
    const attemptedScrollX = window.scrollX;
    window.scrollTo(initialScrollX, initialScrollY);

    const bodyStyle = getComputedStyle(document.body);
    return {
      body: {
        backgroundColor: bodyStyle.backgroundColor,
        color: bodyStyle.color,
        scrollWidth: document.body.scrollWidth,
      },
      controls: { count: controls.length, undersized: undersizedControls, unnamed: unnamedControls },
      criticalContent: {
        brandGlyph: criticalSnapshot(".brand-glyph"),
        heroStoreButton: criticalSnapshot('[data-store-placement="hero"] .store-button'),
        mintCard: criticalSnapshot(".feature-card--mint"),
      },
      device: {
        clientHeight: document.documentElement.clientHeight,
        devicePixelRatio: window.devicePixelRatio,
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
        touchPoints: navigator.maxTouchPoints,
        visualViewportWidth: window.visualViewport?.width ?? null,
      },
      document: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        title: document.title,
      },
      images,
      featureArea: {
        screenshotCount: document.querySelectorAll("#features .app-screenshot").length,
        simulations: Array.from(document.querySelectorAll("#features .feature-simulation")).map(
          (element) => ({
            ariaLabel: element.getAttribute("aria-label") ?? "",
            role: element.getAttribute("role") ?? "",
            variant: Array.from(element.classList).find((name) =>
              name.startsWith("feature-simulation--")
            ) ?? "",
          }),
        ),
      },
      hero: {
        copy: rectSnapshot(".hero-copy"),
        grid: rectSnapshot(".hero-grid"),
        miniCards: Array.from(document.querySelectorAll(".hero-mini-card")).map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            bottom: Number(rect.bottom.toFixed(2)),
            height: Number(rect.height.toFixed(2)),
            top: Number(rect.top.toFixed(2)),
          };
        }),
        shell: rectSnapshot(".hero-shell"),
        visual: rectSnapshot(".hero-visual"),
      },
      landmarks: {
        footer: document.querySelectorAll("footer").length,
        h1: document.querySelectorAll("h1").length,
        header: document.querySelectorAll("header").length,
        main: document.querySelectorAll("main").length,
        mainId: document.querySelector("main")?.id ?? "",
        nav: document.querySelectorAll("nav").length,
      },
      locale: {
        htmlLang: document.documentElement.lang,
        languageHref: document.querySelector("a.language-button")?.href ?? "",
        languageHrefLang: document.querySelector("a.language-button")?.hreflang ?? "",
        pathname: location.pathname,
      },
      releaseSurfaces: {
        alternateLinks: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(
          (link) => ({ href: link.href, hrefLang: link.hreflang }),
        ),
        canonicalHref: document.querySelector('link[rel="canonical"]')?.href ?? "",
        iconLinks: Array.from(
          document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'),
        ).map((link) => ({ href: link.href, rel: link.rel, sizes: link.sizes.value })),
        manifestHref: document.querySelector('link[rel="manifest"]')?.href ?? "",
        robotsContent: document.querySelector('meta[name="robots"]')?.content ?? "",
        storeButtons: Array.from(document.querySelectorAll(".store-button")).map((element) => ({
          ariaDisabled: element.getAttribute("aria-disabled"),
          badge: (() => {
            const image = element.querySelector("img");
            if (!(image instanceof HTMLImageElement)) return null;
            const rect = image.getBoundingClientRect();
            return {
              alt: image.alt,
              complete: image.complete,
              currentSrc: image.currentSrc,
              naturalHeight: image.naturalHeight,
              naturalWidth: image.naturalWidth,
              renderedHeight: Number(rect.height.toFixed(2)),
              renderedWidth: Number(rect.width.toFixed(2)),
            };
          })(),
          badgeSrc: element.getAttribute("data-badge-src") ?? "",
          hasHref: element.hasAttribute("href"),
          href: element.getAttribute("href") ?? "",
          placement: element.closest("[data-store-placement]")?.getAttribute("data-store-placement") ?? "",
          platform: element.getAttribute("data-platform") ?? "",
          published: element.getAttribute("data-published"),
          rel: element.getAttribute("rel") ?? "",
          role: element.getAttribute("role"),
          tabIndex: element.tabIndex,
          tag: element.tagName.toLowerCase(),
          target: element.getAttribute("target") ?? "",
          text: (element.textContent || "").replace(/\\s+/g, " ").trim(),
        })),
      },
      overflow: {
        attemptedScrollX,
        overflowingElements,
      },
      theme: {
        colorScheme: document.documentElement.style.colorScheme,
        dark: document.documentElement.classList.contains("dark"),
        saved: localStorage.getItem("kim-tai-theme"),
        toggleAriaPressed: document.querySelector("button.control-button")?.getAttribute("aria-pressed") ?? "",
      },
      visibleBorders,
    };
  })()`);
}

function parseRgb(color) {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  return channels?.length === 3 ? channels : null;
}

function contrastRatio(foreground, background) {
  const foregroundRgb = parseRgb(foreground);
  const backgroundRgb = parseRgb(background);
  if (!foregroundRgb || !backgroundRgb) return null;
  const luminance = (channels) => {
    const linear = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const first = luminance(foregroundRgb);
  const second = luminance(backgroundRgb);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function assertTheme(snapshot, expectedDark, expectedSaved, label) {
  const ratio = contrastRatio(snapshot.body.color, snapshot.body.backgroundColor);
  check(`${label}: initial theme`, snapshot.theme.dark === expectedDark, snapshot.theme);
  check(
    `${label}: color-scheme`,
    snapshot.theme.colorScheme === (expectedDark ? "dark" : "light"),
    snapshot.theme.colorScheme,
  );
  check(`${label}: localStorage state`, snapshot.theme.saved === expectedSaved, snapshot.theme.saved);
  check(
    `${label}: canvas text contrast`,
    ratio !== null && ratio >= 4.5,
    { background: snapshot.body.backgroundColor, foreground: snapshot.body.color, ratio: ratio?.toFixed(2) },
  );
}

function isInertStoreButton(button) {
  return button.tag === "div" &&
    button.ariaDisabled === "true" &&
    !button.hasHref &&
    button.tabIndex === -1;
}

function isActiveStoreButton(button) {
  const relTokens = button.rel.toLowerCase().split(/\s+/).filter(Boolean);
  return button.tag === "a" &&
    button.hasHref &&
    Boolean(button.href) &&
    button.ariaDisabled === null &&
    button.target === "_blank" &&
    relTokens.includes("noreferrer");
}

function assertPage(snapshot, { device, expectedAlternate, expectedLang, expectedPath, label }) {
  const languagePath = snapshot.locale.languageHref
    ? new URL(snapshot.locale.languageHref).pathname
    : "";
  check(`${label}: route pathname`, snapshot.locale.pathname === expectedPath, snapshot.locale.pathname);
  check(`${label}: html lang`, snapshot.locale.htmlLang === expectedLang, snapshot.locale.htmlLang);
  check(`${label}: locale switch href`, languagePath === localePath(expectedAlternate), languagePath);
  check(
    `${label}: locale switch hreflang`,
    snapshot.locale.languageHrefLang === expectedAlternate,
    snapshot.locale.languageHrefLang,
  );
  check(
    `${label}: CDP viewport`,
    snapshot.document.clientWidth === device.width &&
      Math.abs(snapshot.device.visualViewportWidth - device.width) < 0.1 &&
      snapshot.device.devicePixelRatio === device.deviceScaleFactor,
    snapshot.device,
  );
  check(
    `${label}: touch emulation`,
    device.touch ? snapshot.device.touchPoints >= 1 : snapshot.device.touchPoints === 0,
    snapshot.device.touchPoints,
  );
  check(
    `${label}: no horizontal overflow`,
    Math.abs(snapshot.overflow.attemptedScrollX) < 0.5 &&
      snapshot.overflow.overflowingElements.length === 0,
    {
      attemptedScrollX: snapshot.overflow.attemptedScrollX,
      bodyScrollWidth: snapshot.body.scrollWidth,
      clientWidth: snapshot.document.clientWidth,
      documentScrollWidth: snapshot.document.scrollWidth,
      overflowingElements: snapshot.overflow.overflowingElements,
    },
  );
  check(
    `${label}: single H1 and landmarks`,
    snapshot.landmarks.h1 === 1 &&
      snapshot.landmarks.header === 1 &&
      snapshot.landmarks.main === 1 &&
      snapshot.landmarks.footer === 1 &&
      snapshot.landmarks.nav >= 1 &&
      snapshot.landmarks.mainId === "main-content",
    snapshot.landmarks,
  );
  check(
    `${label}: controls at least 44px`,
    snapshot.controls.undersized.length === 0,
    { count: snapshot.controls.count, undersized: snapshot.controls.undersized },
  );
  check(
    `${label}: controls have accessible names`,
    snapshot.controls.unnamed.length === 0,
    snapshot.controls.unnamed,
  );
  check(
    `${label}: store controls match their published state`,
    snapshot.releaseSurfaces.storeButtons.length === 4 &&
      snapshot.releaseSurfaces.storeButtons.every(
        (button) => button.published === "true"
          ? isActiveStoreButton(button)
          : button.published === "false" && isInertStoreButton(button),
      ),
    snapshot.releaseSurfaces.storeButtons,
  );
  const expectedStorePairs = ["hero:ios", "hero:android", "download:ios", "download:android"];
  const actualStorePairs = snapshot.releaseSurfaces.storeButtons
    .map((button) => `${button.placement}:${button.platform}`)
    .sort();
  check(
    `${label}: hero and download expose both store platforms`,
    actualStorePairs.length === expectedStorePairs.length &&
      expectedStorePairs.sort().every((pair, index) => actualStorePairs[index] === pair),
    actualStorePairs,
  );
  check(
    `${label}: official localized store badges rendered`,
    snapshot.releaseSurfaces.storeButtons.every((button) => {
      const badge = button.badge;
      if (!badge?.complete || badge.naturalWidth <= 0 || badge.naturalHeight <= 0 ||
          badge.renderedWidth <= 0 || badge.renderedHeight < 39.5 ||
          !button.badgeSrc.startsWith("/badges/")) return false;
      try {
        const renderedBadgePath = decodeURIComponent(new URL(badge.currentSrc).pathname);
        return renderedBadgePath === `${smokeBasePath}${button.badgeSrc}`;
      } catch {
        return false;
      }
    }),
    snapshot.releaseSurfaces.storeButtons.map(({ badge, badgeSrc, placement, platform }) => ({
      badge,
      badgeSrc,
      placement,
      platform,
    })),
  );
  check(
    `${label}: all three app screenshots render only in Hero`,
    snapshot.images.length === 3 &&
      snapshot.images.every(
        (image) =>
          image.complete && image.naturalWidth > 0 && image.naturalHeight > 0 &&
          image.renderedWidth > 0 && image.renderedHeight > 0 && image.inHero,
      ) &&
      snapshot.featureArea.screenshotCount === 0,
    { featureScreenshotCount: snapshot.featureArea.screenshotCount, images: snapshot.images },
  );
  check(
    `${label}: four accessible simulated visuals replace feature screenshots`,
    snapshot.featureArea.simulations.length === 4 &&
      snapshot.featureArea.simulations.every(
        (simulation) =>
          simulation.role === "img" &&
          simulation.ariaLabel.length > 0 &&
          simulation.variant.length > 0,
      ),
    snapshot.featureArea.simulations,
  );
  check(
    `${label}: no visible structural borders`,
    snapshot.visibleBorders.length === 0,
    snapshot.visibleBorders,
  );
  if (device.width >= 1200) {
    const heroRects = [
      snapshot.hero.shell,
      snapshot.hero.grid,
      snapshot.hero.copy,
      snapshot.hero.visual,
      ...snapshot.hero.miniCards,
    ];
    check(
      `${label}: full hero fits first viewport`,
      heroRects.every((rect) => rect && rect.top >= -0.5 && rect.bottom <= snapshot.device.innerHeight + 0.5),
      { hero: snapshot.hero, viewportHeight: snapshot.device.innerHeight },
    );
  }
}

function assertTelemetry(telemetry, expectedPath, label) {
  telemetry.stop();
  const documentResponse = telemetry.data.responses.find(
    (response) =>
      response.type === "Document" && new URL(response.url).pathname === expectedPath,
  );
  const imageResponses = telemetry.data.responses.filter((response) => response.type === "Image");
  const failedResponses = telemetry.data.responses.filter((response) => response.status >= 400);
  const actionableNetworkFailures = telemetry.data.networkFailures.filter(
    (failure) => !(failure.canceled && failure.errorText === "net::ERR_ABORTED"),
  );
  check(`${label}: document HTTP 200`, documentResponse?.status === 200, documentResponse ?? null);
  check(
    `${label}: no console or hydration errors`,
    telemetry.data.consoleErrors.length === 0 &&
      telemetry.data.exceptions.length === 0 && telemetry.data.logErrors.length === 0,
    {
      consoleErrors: telemetry.data.consoleErrors,
      exceptions: telemetry.data.exceptions,
      logErrors: telemetry.data.logErrors,
    },
  );
  check(
    `${label}: no failed network requests`,
    actionableNetworkFailures.length === 0 && failedResponses.length === 0 &&
      imageResponses.every((response) => response.status >= 200 && response.status < 400),
    {
      canceledRequests: telemetry.data.networkFailures.filter((failure) => failure.canceled),
      failedResponses,
      imageResponses,
      networkFailures: actionableNetworkFailures,
    },
  );
}

async function assertKeyboardFocus(label) {
  await evaluate(`document.activeElement?.blur()`);
  await session.call("Input.dispatchKeyEvent", {
    code: "Tab",
    key: "Tab",
    nativeVirtualKeyCode: 9,
    type: "keyDown",
    windowsVirtualKeyCode: 9,
  });
  await session.call("Input.dispatchKeyEvent", {
    code: "Tab",
    key: "Tab",
    nativeVirtualKeyCode: 9,
    type: "keyUp",
    windowsVirtualKeyCode: 9,
  });
  await delay(80);
  const focus = await evaluate(`(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return null;
    const rect = active.getBoundingClientRect();
    const style = getComputedStyle(active);
    return {
      className: active.className,
      boxShadow: style.boxShadow,
      href: active instanceof HTMLAnchorElement ? active.getAttribute("href") : "",
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      rect: { bottom: rect.bottom, left: rect.left, right: rect.right, top: rect.top },
      text: (active.textContent || "").trim(),
    };
  })()`);
  check(
    `${label}: first-tab skip link focus`,
    focus?.className === "skip-link" && Number.parseFloat(focus.outlineWidth) >= 3 &&
      focus.boxShadow !== "none" && focus.rect.top >= 0 && focus.rect.bottom <= mobile.height,
    focus,
  );
  await evaluate(`document.activeElement?.blur()`);
}

async function captureScreenshot(filename, label) {
  await scrollToTop();
  await delay(500);
  const { data } = await session.call("Page.captureScreenshot", {
    captureBeyondViewport: false,
    format: "png",
    fromSurface: true,
  });
  const outputPath = path.join(visualizationDirectory, filename);
  const buffer = Buffer.from(data, "base64");
  await writeFile(outputPath, buffer);
  screenshots.push({ bytes: buffer.byteLength, label, path: outputPath });
  check(`${label}: screenshot captured`, buffer.byteLength > 0, {
    bytes: buffer.byteLength,
    path: outputPath,
  });
}

async function toggleTheme(expectedDark, expectedSaved, label) {
  const clicked = await evaluate(`(() => {
    const button = document.querySelector("button.control-button");
    if (!(button instanceof HTMLButtonElement)) return false;
    button.click();
    return true;
  })()`);
  check(`${label}: theme control present`, clicked, clicked);
  await waitFor(
    async () => {
      const state = await evaluate(`({
        dark: document.documentElement.classList.contains("dark"),
        saved: localStorage.getItem("kim-tai-theme"),
        pressed: document.querySelector("button.control-button")?.getAttribute("aria-pressed")
      })`);
      return state.dark === expectedDark && state.saved === expectedSaved &&
        state.pressed === String(expectedDark);
    },
    `${label} theme toggle state`,
  );
  await delay(600);
  const snapshot = await pageSnapshot();
  check(`${label}: theme toggle/localStorage`, true, snapshot.theme);
  return snapshot;
}

function assertCriticalDarkContent(snapshot, label) {
  const { brandGlyph, heroStoreButton, mintCard } = snapshot.criticalContent;
  check(
    `${label}: brand mark and official hero store badge`,
    Boolean(brandGlyph && heroStoreButton &&
      brandGlyph.display !== "none" && brandGlyph.opacity === "1" &&
      brandGlyph.visibility === "visible" && brandGlyph.image?.complete &&
      brandGlyph.image.naturalWidth > 0 && brandGlyph.image.naturalHeight > 0 &&
      decodeURIComponent(brandGlyph.image.currentSrc).includes(
        `${smokeBasePath}/icons/kim-tai-brand-mark.png`,
      ) &&
      heroStoreButton.image?.complete && heroStoreButton.image.naturalWidth > 0 &&
      heroStoreButton.image.naturalHeight > 0 && heroStoreButton.innerText.length > 0 &&
      heroStoreButton.display !== "none" && heroStoreButton.opacity === "1" &&
      heroStoreButton.visibility === "visible"),
    { brandGlyph, heroStoreButton },
  );
  const mintRatio = mintCard
    ? contrastRatio(mintCard.color, mintCard.backgroundColor)
    : null;
  check(
    `${label}: mint-card contrast`,
    mintRatio !== null && mintRatio >= 4.5,
    {
      background: mintCard?.backgroundColor,
      foreground: mintCard?.color,
      ratio: mintRatio?.toFixed(2),
    },
  );
}

async function assertPreviewMetadata(snapshot, label) {
  const robots = snapshot.releaseSurfaces.robotsContent
    .split(",")
    .map((value) => value.trim().toLowerCase());
  check(
    `${label}: preview robots noindex`,
    robots.includes("noindex") && robots.includes("nofollow"),
    snapshot.releaseSurfaces.robotsContent,
  );

  const manifestHref = snapshot.releaseSurfaces.manifestHref;
  const manifest = manifestHref
    ? await evaluate(`(async () => {
        const response = await fetch(${JSON.stringify(manifestHref)});
        return { body: await response.json(), status: response.status };
      })()`)
    : null;
  check(
    `${label}: web manifest`,
    Boolean(manifest && manifest.status === 200 &&
      new URL(manifestHref).pathname === `${smokeBasePath}/manifest.webmanifest` &&
      manifest.body?.name === "Kim Tài - Tick Vàng Online" &&
      manifest.body?.short_name === "Kim Tài" &&
      manifest.body?.start_url === metadataLocalePath("vi") &&
      manifest.body?.scope === `${smokeBasePath}/` &&
      manifest.body?.display === "standalone" && manifest.body?.icons?.length === 2 &&
      manifest.body.icons.some((icon) =>
        icon.src === `${smokeBasePath}/icons/kim-tai-pwa-192.png` && icon.sizes === "192x192") &&
      manifest.body.icons.some((icon) =>
        icon.src === `${smokeBasePath}/icons/kim-tai-pwa-512.png` && icon.sizes === "512x512")),
    { href: manifestHref, manifest },
  );
  check(
    `${label}: browser and Apple icons`,
    snapshot.releaseSurfaces.iconLinks.some((icon) =>
      icon.rel === "icon" && new URL(icon.href).pathname ===
        `${smokeBasePath}/icons/kim-tai-favicon-32.png` && icon.sizes === "32x32") &&
      snapshot.releaseSurfaces.iconLinks.some((icon) =>
        icon.rel === "apple-touch-icon" && new URL(icon.href).pathname ===
        `${smokeBasePath}/icons/kim-tai-apple-touch-icon.png` &&
        icon.sizes === "180x180"),
    snapshot.releaseSurfaces.iconLinks,
  );
  check(
    `${label}: canonical and language alternates`,
    snapshot.releaseSurfaces.canonicalHref ===
      `${canonicalOrigin}${metadataLocalePath("vi")}` &&
      snapshot.releaseSurfaces.alternateLinks.some((link) =>
        link.hrefLang === "vi" && link.href === `${canonicalOrigin}${metadataLocalePath("vi")}`) &&
      snapshot.releaseSurfaces.alternateLinks.some((link) =>
        link.hrefLang === "en" && link.href === `${canonicalOrigin}${metadataLocalePath("en")}`),
    {
      alternates: snapshot.releaseSurfaces.alternateLinks,
      canonical: snapshot.releaseSurfaces.canonicalHref,
    },
  );
}

async function assertDefaultLocaleRedirect() {
  const telemetry = await navigate(`${smokeBasePath}/`, "default-locale-redirect");
  const pathname = await evaluate("location.pathname");
  check("Default locale redirect", pathname === localePath("vi"), pathname);
  assertTelemetry(telemetry, localePath("vi"), "Default locale redirect");
}

async function run() {
  await mkdir(visualizationDirectory, { recursive: true });
  const chromeInfo = await launchChrome();
  check("Chrome launched through CDP", true, {
    executable: chromeExecutable,
    remoteDebuggingPort: chromeInfo.activePort,
  });

  await setDeviceMetrics(mobile);
  await setColorScheme("light");
  await clearOriginStorage();
  await assertDefaultLocaleRedirect();

  const viPath = localePath("vi");
  const enPath = localePath("en");

  const viMobileTelemetry = await navigate(viPath, "vi-mobile-light");
  const viMobileInitial = await pageSnapshot();
  assertTheme(viMobileInitial, false, null, "VI mobile light");
  await captureScreenshot("kim-tai-vi-mobile-light.png", "VI mobile light");
  await assertKeyboardFocus("VI mobile light");

  const viMobileDark = await toggleTheme(true, "dark", "VI mobile dark toggle");
  assertTheme(viMobileDark, true, "dark", "VI mobile dark toggle");
  assertCriticalDarkContent(viMobileDark, "VI mobile dark");
  await captureScreenshot("kim-tai-vi-mobile-dark.png", "VI mobile dark");

  await scrollThroughScreenshots();
  const viMobilePage = await pageSnapshot();
  assertPage(viMobilePage, {
    device: mobile,
    expectedAlternate: "en",
    expectedLang: "vi-VN",
    expectedPath: viPath,
    label: "VI mobile light",
  });
  await assertPreviewMetadata(viMobilePage, "VI mobile light");
  assertTelemetry(viMobileTelemetry, viPath, "VI mobile light");

  const persistedDarkTelemetry = await reload("vi-mobile-dark-persisted");
  const persistedDark = await pageSnapshot();
  assertTheme(persistedDark, true, "dark", "VI mobile persisted dark");
  assertTelemetry(persistedDarkTelemetry, viPath, "VI mobile persisted dark");

  await toggleTheme(false, "light", "VI mobile light toggle");
  await setColorScheme("dark");
  const persistedLightTelemetry = await reload("vi-mobile-light-persisted");
  const persistedLight = await pageSnapshot();
  assertTheme(persistedLight, false, "light", "VI mobile persisted light");
  assertTelemetry(persistedLightTelemetry, viPath, "VI mobile persisted light");

  await clearOriginStorage();
  await setColorScheme("dark");
  const enMobileTelemetry = await navigate(enPath, "en-mobile-dark");
  await scrollThroughScreenshots();
  const enMobileDark = await pageSnapshot();
  assertTheme(enMobileDark, true, null, "EN mobile dark");
  assertPage(enMobileDark, {
    device: mobile,
    expectedAlternate: "vi",
    expectedLang: "en",
    expectedPath: enPath,
    label: "EN mobile dark",
  });
  assertTelemetry(enMobileTelemetry, enPath, "EN mobile dark");

  await setDeviceMetrics(narrowMobile);
  await setColorScheme("light");
  await clearOriginStorage();
  const viNarrowTelemetry = await navigate(viPath, "vi-mobile-320-light");
  await scrollThroughScreenshots();
  const viNarrowLight = await pageSnapshot();
  assertTheme(viNarrowLight, false, null, "VI mobile 320 light");
  assertPage(viNarrowLight, {
    device: narrowMobile,
    expectedAlternate: "en",
    expectedLang: "vi-VN",
    expectedPath: viPath,
    label: "VI mobile 320 light",
  });
  assertTelemetry(viNarrowTelemetry, viPath, "VI mobile 320 light");

  await setDeviceMetrics(desktop);
  await setColorScheme("light");
  await clearOriginStorage();

  const viDesktopTelemetry = await navigate(viPath, "vi-desktop-light");
  await scrollThroughScreenshots();
  const viDesktopLight = await pageSnapshot();
  assertTheme(viDesktopLight, false, null, "VI desktop light");
  assertPage(viDesktopLight, {
    device: desktop,
    expectedAlternate: "en",
    expectedLang: "vi-VN",
    expectedPath: viPath,
    label: "VI desktop light",
  });
  await captureScreenshot("kim-tai-vi-desktop-light.png", "VI desktop light");
  assertTelemetry(viDesktopTelemetry, viPath, "VI desktop light");

  const enDesktopTelemetry = await navigate(enPath, "en-desktop-light");
  await scrollThroughScreenshots();
  const enDesktopLight = await pageSnapshot();
  assertTheme(enDesktopLight, false, null, "EN desktop light");
  assertPage(enDesktopLight, {
    device: desktop,
    expectedAlternate: "vi",
    expectedLang: "en",
    expectedPath: enPath,
    label: "EN desktop light",
  });
  await captureScreenshot("kim-tai-en-desktop-light.png", "EN desktop light");
  assertTelemetry(enDesktopTelemetry, enPath, "EN desktop light");

  await setColorScheme("dark");
  await clearOriginStorage();
  const viDesktopDarkTelemetry = await navigate(viPath, "vi-desktop-dark");
  await scrollThroughScreenshots();
  const viDesktopDark = await pageSnapshot();
  assertTheme(viDesktopDark, true, null, "VI desktop dark");
  assertPage(viDesktopDark, {
    device: desktop,
    expectedAlternate: "en",
    expectedLang: "vi-VN",
    expectedPath: viPath,
    label: "VI desktop dark",
  });
  assertCriticalDarkContent(viDesktopDark, "VI desktop dark");
  assertTelemetry(viDesktopDarkTelemetry, viPath, "VI desktop dark");
}

async function cleanup() {
  if (session) {
    try {
      await session.call("Browser.close", {}, 2_000);
    } catch {
      // Chrome may close the socket before acknowledging Browser.close.
    }
  }
  if (chrome && chrome.exitCode === null) chrome.kill("SIGTERM");
  if (profileDirectory) {
    try {
      await rm(profileDirectory, { force: true, recursive: true });
    } catch {
      // The smoke result matters more than cleanup of an isolated temporary profile.
    }
  }
}

let fatalError;
try {
  await run();
} catch (error) {
  fatalError = error;
  check("Smoke runner completed", false, error.stack ?? error.message);
} finally {
  await cleanup();
}

const passed = results.filter((result) => result.passed).length;
const failed = results.filter((result) => !result.passed);
console.log(`SUMMARY | ${passed} passed | ${failed.length} failed`);
console.log(`SCREENSHOTS | ${JSON.stringify(screenshots)}`);
if (failed.length) {
  console.log(`FAILURES | ${JSON.stringify(failed)}`);
}

process.exitCode = fatalError || failed.length ? 1 : 0;
