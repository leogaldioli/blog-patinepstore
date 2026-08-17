import posthog from "posthog-js";
import { isKnownThirdPartyException } from "@/lib/posthog-exception-filter";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

function publicUrl(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    const url = new URL(value, window.location.origin);
    url.search = "";
    url.hash = "";
    return url.origin === window.location.origin ? url.pathname : url.toString();
  } catch {
    return value.split("?")[0].split("#")[0];
  }
}

if (token) {
  posthog.init(token, {
    api_host: "/memento",
    ui_host: "https://us.posthog.com",
    defaults: "2026-05-30",
    person_profiles: "never",
    cookieless_mode: "always",
    capture_pageview: "history_change",
    disable_session_recording: true,
    autocapture: {
      dom_event_allowlist: ["click"],
      element_allowlist: ["a", "button"],
    },
    before_send(event) {
      if (!event) return null;
      if (isKnownThirdPartyException(event.event, event.properties)) return null;
      for (const key of ["$current_url", "$referrer", "$pathname"]) {
        if (key in event.properties) event.properties[key] = publicUrl(event.properties[key]);
      }
      return event;
    },
  });
  posthog.register({
    app: "patinep_blog",
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
  });
  (window as typeof window & { posthog?: typeof posthog }).posthog = posthog;
}
