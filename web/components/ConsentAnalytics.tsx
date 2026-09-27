"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";

function cookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((part) => part.trim());
  const hit = parts.find((part) => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

function analyticsAllowed(): boolean {
  const candidates = [cookieValue("fs-cc"), cookieValue("fs-cc-updated")];
  try {
    const stored = window.localStorage.getItem("fs-cc");
    if (stored) candidates.push(stored);
  } catch {
    // private mode
  }

  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (parsed.analytics === true || parsed.Analytics === true) return true;
      const consents = parsed.consents as Record<string, unknown> | undefined;
      if (consents?.analytics === true) return true;
    } catch {
      if (/analytics["']?\s*[:=]\s*true/i.test(raw)) return true;
    }
  }

  return /fs-cc-analytics=true/i.test(document.cookie);
}

export default function ConsentAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(analyticsAllowed());
    sync();

    const onUpdate = () => sync();
    window.addEventListener("FsCC", onUpdate);
    document.addEventListener("fs-cc", onUpdate as EventListener);

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[fs-cc="allow"], [fs-cc="deny"], [fs-cc="submit"]')) {
        window.setTimeout(sync, 50);
        window.setTimeout(sync, 400);
      }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("FsCC", onUpdate);
      document.removeEventListener("fs-cc", onUpdate as EventListener);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  if (!allowed) return null;
  return <Analytics />;
}
