"use server";

export type EnquiryState = {
  ok: boolean;
  errors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
  values?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  const get = (k: string) => String(form.get(k) ?? "").trim();
  const values = {
    name: get("name"),
    company: get("company"),
    email: get("email"),
    phone: get("phone"),
    need: get("need"),
    message: get("message"),
  };

  // Honeypot: real people never fill this.
  if (get("website")) return { ok: true };

  const errors: EnquiryState["errors"] = {};
  if (!values.name) errors.name = "Tell us who to reply to.";
  if (!EMAIL.test(values.email)) errors.email = "Enter an email address like name@company.com.";
  if (values.phone && values.phone.replace(/[^\d]/g, "").length < 8) errors.phone = "Check the phone number.";
  if (values.message.length < 10) errors.message = "A sentence or two about the site and the scope helps us reply properly.";
  if (Object.keys(errors).length) return { ok: false, errors, values };

  // Delivery is not wired yet: connect the client's mail service (for example Resend or SMTP)
  // to info@deacam.com.au before launch. Until then enquiries are logged server-side only.
  console.info("[enquiry]", JSON.stringify(values));
  return { ok: true };
}
