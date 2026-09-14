export type TikTokEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Search"
  | "AddToWishlist"
  | "Purchase";

type TikTokProperties = Record<string, unknown>;
type TikTokQueue = Array<unknown> & {
  (...args: unknown[]): void;
  methods?: string[];
  _pixelId?: string;
  _u?: string;
  _i?: Record<string, TikTokQueue>;
  _t?: Record<string, number>;
  _o?: Record<string, Record<string, unknown>>;
  setAndDefer?: (target: TikTokQueue, method: string) => void;
  instance?: (pixelId: string) => TikTokQueue;
  load?: (pixelId: string) => void;
  page?: () => void;
  track?: (event: TikTokEventName, properties?: TikTokProperties, options?: { event_id?: string }) => void;
};

declare global {
  interface Window {
    ttq?: TikTokQueue;
    TiktokAnalyticsObject?: string;
  }
}

const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "DAK3TN3C77UDHLL41DAG";
const methods = [
  "page", "track", "identify", "instances", "debug", "on", "off", "once",
  "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent",
  "revokeConsent", "grantConsent",
];

function defer(target: TikTokQueue, method: string): void {
  (target as unknown as Record<string, unknown>)[method] = (...args: unknown[]) => {
    target.push([method, ...args]);
  };
}

function setupTikTokQueue(): TikTokQueue {
  if (window.ttq) return window.ttq;

  window.TiktokAnalyticsObject = "ttq";
  const ttq = [] as unknown as TikTokQueue;
  ttq.methods = methods;
  ttq.setAndDefer = defer;
  for (const method of methods) defer(ttq, method);
  ttq.instance = (id: string) => {
    ttq._i ??= {};
    const instance = ttq._i[id] ?? (ttq._i[id] = [] as unknown as TikTokQueue);
    for (const method of methods) defer(instance, method);
    return instance;
  };
  ttq.load = (id: string) => {
    const scriptUrl = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i ??= {};
    const instance = [] as unknown as TikTokQueue;
    instance._u = scriptUrl;
    ttq._i[id] = instance;
    ttq._t ??= {};
    ttq._t[id] = Date.now();
    ttq._o ??= {};
    ttq._o[id] = {};
    ttq._pixelId = id;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `${scriptUrl}?sdkid=${encodeURIComponent(id)}&lib=ttq`;
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript);
    else document.head.appendChild(script);
  };
  window.ttq = ttq;
  return ttq;
}

export function initializeTikTokPixel(): void {
  if (typeof window === "undefined" || !pixelId) return;
  const ttq = setupTikTokQueue();
  if (ttq._pixelId === pixelId) return;
  ttq.load?.(pixelId);
  ttq.page?.();
}

export function trackTikTokEvent(
  event: TikTokEventName,
  properties: TikTokProperties = {},
  eventId?: string,
): void {
  initializeTikTokPixel();
  if (typeof window === "undefined" || !window.ttq?.track) return;
  window.ttq.track(event, properties, eventId ? { event_id: eventId } : undefined);
}
