"use client";

import { useEffect } from "react";

/**
 * Progressively enhances the exported Webflow contact form so it posts securely
 * to our own API route instead of Webflow's (now-dead) endpoint.
 *
 * Strategy: attach a *capture-phase* submit handler on each form so we run before
 * webflow.js's delegated handler, then preventDefault + stopImmediatePropagation so
 * its native AJAX never fires. We keep Webflow's success/error UI (.w-form-done /
 * .w-form-fail) for a faithful experience.
 */

const CONTACT_FORM_NAME = "wf-form-EGC-Website-Contact-Form";

// Webflow field name -> our API field. Trailing "-2" variants are normalized first.
const FIELD_MAP: Record<string, "name" | "email" | "subject" | "message"> = {
  "Full-Name": "name",
  Email: "email",
  Subject: "subject",
  Message: "message",
};

function collectPayload(form: HTMLFormElement) {
  const payload: Record<string, string> = {};
  for (const el of Array.from(form.elements)) {
    const field = el as HTMLInputElement | HTMLTextAreaElement;
    if (!field.name) continue;
    const normalized = field.name.replace(/-2$/, "");
    const key = FIELD_MAP[normalized];
    if (key) payload[key] = field.value;
  }
  return payload;
}

function setState(
  form: HTMLFormElement,
  state: "idle" | "loading" | "done" | "fail"
) {
  const wrapper = (form.closest(".w-form") as HTMLElement) || form.parentElement;
  const done = wrapper?.querySelector<HTMLElement>(".w-form-done");
  const fail = wrapper?.querySelector<HTMLElement>(".w-form-fail");
  const submit = form.querySelector<HTMLInputElement | HTMLButtonElement>(
    '[type="submit"]'
  );

  if (state === "loading") {
    if (submit) {
      submit.dataset.prevValue =
        submit instanceof HTMLInputElement ? submit.value : submit.textContent || "";
      const wait = submit.getAttribute("data-wait");
      if (wait) {
        if (submit instanceof HTMLInputElement) submit.value = wait;
        else submit.textContent = wait;
      }
      submit.setAttribute("disabled", "true");
    }
    return;
  }

  // Restore the submit button label.
  if (submit) {
    submit.removeAttribute("disabled");
    const prev = submit.dataset.prevValue;
    if (prev != null) {
      if (submit instanceof HTMLInputElement) submit.value = prev;
      else submit.textContent = prev;
    }
  }

  if (state === "done") {
    form.style.display = "none";
    if (done) done.style.display = "block";
    if (fail) fail.style.display = "none";
  } else if (state === "fail") {
    if (fail) fail.style.display = "block";
  }
}

async function handleSubmit(form: HTMLFormElement, event: Event) {
  event.preventDefault();
  event.stopImmediatePropagation();

  // Native HTML5 validation first.
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const payload = collectPayload(form);
  const renderedAt = Number(form.dataset.egcTs || Date.now());

  setState(form, "loading");
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, _gotcha: "", _ts: renderedAt }),
    });
    if (res.ok) {
      setState(form, "done");
      form.reset();
    } else {
      setState(form, "fail");
    }
  } catch {
    setState(form, "fail");
  }
}

export default function FormEnhancer() {
  useEffect(() => {
    const forms = Array.from(
      document.querySelectorAll<HTMLFormElement>(
        `form[name="${CONTACT_FORM_NAME}"]`
      )
    );

    const cleanups: Array<() => void> = [];
    for (const form of forms) {
      // Stop the browser's default GET navigation and Webflow's handler.
      form.setAttribute("novalidate", "novalidate"); // we validate manually
      form.dataset.egcTs = String(Date.now());
      const listener = (e: Event) => handleSubmit(form, e);
      form.addEventListener("submit", listener, true); // capture phase
      cleanups.push(() => form.removeEventListener("submit", listener, true));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
