"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { sendEnquiry, type EnquiryState } from "./actions";
import { BtnArrow } from "@/components/Icons";

const NEEDS = [
  { v: "project", label: "A new project or upgrade" },
  { v: "automation", label: "Control panels or automation" },
  { v: "refrigeration", label: "Industrial refrigeration" },
  { v: "safety", label: "Machine safety assessment" },
  { v: "labour", label: "On-site labour" },
  { v: "other", label: "Something else" },
];

const ALIAS: Record<string, string> = { electrical: "project", labour: "labour" };

export function EnquiryForm() {
  const params = useSearchParams();
  const pre = params.get("need") ?? "project";
  const initialNeed = NEEDS.some((n) => n.v === pre) ? pre : (ALIAS[pre] ?? "project");
  const [state, action, pending] = useActionState<EnquiryState, FormData>(sendEnquiry, { ok: false });

  if (state.ok) {
    return (
      <div className="form-done" role="status">
        <p className="label eyebrow">Enquiry received</p>
        <h3 className="h3" style={{ marginTop: 20 }}>
          Thanks. An engineer will be in touch.
        </h3>
        <p className="muted" style={{ marginTop: 16 }}>
          If something is down right now, call the breakdown line on (03) 9738 0528.
        </p>
      </div>
    );
  }

  const e = state.errors ?? {};
  const v = state.values ?? {};

  return (
    <form action={action} className="form" noValidate>
      <div className="field">
        <label htmlFor="f-name">Your name</label>
        <input id="f-name" name="name" autoComplete="name" defaultValue={v.name} aria-invalid={!!e.name} aria-describedby={e.name ? "e-name" : undefined} />
        {e.name && <span id="e-name" className="err">{e.name}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-company">Company</label>
        <input id="f-company" name="company" autoComplete="organization" defaultValue={v.company} />
      </div>
      <div className="field">
        <label htmlFor="f-email">Email</label>
        <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={v.email} aria-invalid={!!e.email} aria-describedby={e.email ? "e-email" : undefined} />
        {e.email && <span id="e-email" className="err">{e.email}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-phone">
          Phone <span className="muted">(optional)</span>
        </label>
        <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={v.phone} aria-invalid={!!e.phone} aria-describedby={e.phone ? "e-phone" : undefined} />
        {e.phone && <span id="e-phone" className="err">{e.phone}</span>}
      </div>
      <fieldset className="field field--full">
        <legend>What do you need?</legend>
        <div className="opts">
          {NEEDS.map((n) => (
            <label key={n.v} className="opt">
              <input type="radio" name="need" value={n.v} defaultChecked={(v.need ?? initialNeed) === n.v} />
              <span>{n.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field field--full">
        <label htmlFor="f-msg">Tell us about the site</label>
        <textarea id="f-msg" name="message" defaultValue={v.message} aria-invalid={!!e.message} aria-describedby={e.message ? "e-msg" : "h-msg"} />
        {e.message ? <span id="e-msg" className="err">{e.message}</span> : <span id="h-msg" className="help">Location, what is installed today, and what you need to change.</span>}
      </div>
      <div aria-hidden="true" style={{ position: "absolute", left: -9999 }}>
        <label htmlFor="f-web">Website</label>
        <input id="f-web" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form__foot">
        <p>For a breakdown, call (03) 9738 0528. Do not use this form.</p>
        <button className="btn" type="submit" disabled={pending} aria-busy={pending}>
          <span>{pending ? "Sending…" : "Send enquiry"}</span>
          <BtnArrow />
        </button>
      </div>
    </form>
  );
}
