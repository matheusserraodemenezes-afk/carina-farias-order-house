export function isOfflinePreview(hostname: string) {
  const host = hostname.toLowerCase(); const first = host.split(".")[0] ?? "";
  return ((host.endsWith(".lovable.app") || host.endsWith(".gpt-eng.com") || host.endsWith(".gptengineer.run")) && (/^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(first) || /^project--.+-dev$/.test(first))) || ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"].some((domain) => host === domain || host.endsWith(`.${domain}`));
}
export async function registerOfflinePanel() {
  if (!("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD || window.self !== window.top || isOfflinePreview(window.location.hostname) || new URLSearchParams(window.location.search).get("sw") === "off") {
    for (const registration of await navigator.serviceWorker.getRegistrations()) {
      const worker = registration.active ?? registration.waiting ?? registration.installing;
      if (worker && new URL(worker.scriptURL).pathname === "/sw.js") await registration.unregister();
    }
    return;
  }
  const { registerSW } = await import("virtual:pwa-register"); registerSW({ immediate: true });
}