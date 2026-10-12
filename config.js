/* ==== SITE CONFIG — edit here only ==== */
window.SITE_CONFIG = {
  brandName: "Owlavo",          // logo always shows the Latin name
  brandNameAr: "أولافو",        // Arabic display name used in Arabic copy
  // WhatsApp number (Joud). Stored as reversed chunks and assembled only at click time
  // so it never appears as visible text or a plain href. Light obfuscation only:
  // a determined visitor can still recover it from the source or the opened URL.
  whatsappNumber: ["179", "25", "458", "3989"],
  whatsappMessageEn: "Hi Owlavo, I'd like to start a free 2-week pilot of the WhatsApp front desk.",
  whatsappMessageAr: "مرحباً أولافو، أرغب في بدء تجربة مجانية لمدة أسبوعين لموظف الاستقبال على واتساب.",
  email: "", // TODO(Joud): optional contact email

  // ---- Onboarding form (signup.html) ----
  // POST endpoint that receives the form as JSON (e.g. Formspree, a webhook, your backend).
  // Leave "" to fall back to opening the visitor's email app with the form as readable text.
  signupEndpoint: "",
  signupEmail: "owlavo@mail.grokbot.com", // mailto fallback recipient + contact for privacy/terms

  // ---- Payment (Stripe payment link: AED 2,500 one-time setup + AED 750/month; first charge AED 3,250; no VAT) ----
  // Used by the "Pay and start" buttons on signup.html and the pricing section of index.html.
  paymentLink: "https://buy.stripe.com/7sY9ATdAO3eKeiz3Ftffy00",

  // ---- Legal pages (terms.html, privacy.html) ----
  // DRAFT banner shown on legal pages. Set to false once legal review is complete.
  showDraftBanner: true,
  legalLastUpdated: "2026-10-11"
};
