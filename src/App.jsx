import { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  X,
  Send,
  Phone,
  MapPin,
  Mail,
  Stethoscope,
  HandHeart,
  Banknote,
  BookHeart,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  Users,
  ArrowUpRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  CareBot knowledge base — keyword-scored intent matching            */
/* ------------------------------------------------------------------ */
const KNOWLEDGE_BASE = [
  {
    intent: "greeting",
    keywords: ["hi", "hello", "hey", "namaste", "hola", "good morning", "good evening", "good afternoon"],
    answer:
      "Namaste 🙏 I'm CareBot, here to help you navigate Jarurat Care. You can ask me about our services, how to request help, volunteering, emergency contacts, or required documents.",
    followUps: ["What services do you offer?", "How do I request help?", "Emergency numbers?"],
  },
  {
    intent: "request_help",
    keywords: ["help", "request", "apply", "how do i", "how to", "get support", "need support", "need help", "want help"],
    answer:
      "Scroll down to the Patient Support Request form and fill it out. Our team typically responds within 24–48 hours. For genuine medical emergencies, call 102 (free ambulance) or 108 (state emergency) — don't wait for us.",
    followUps: ["What documents do I need?", "Is the service free?", "How long until I get a response?"],
  },
  {
    intent: "cost",
    keywords: ["free", "cost", "pay", "money", "charge", "fee", "price", "expensive", "afford"],
    answer:
      "Every Jarurat Care service is completely free for those in need. We're funded by donations and CSR partnerships. You will never be asked to pay us. If anyone claiming to represent us asks for money, it's a scam — please report it.",
    followUps: ["How can I donate?", "Who funds you?"],
  },
  {
    intent: "services",
    keywords: ["service", "offer", "kind of", "type of", "what do you do", "provide", "support type"],
    answer:
      "We offer four kinds of support:\n• Medical aid — treatment costs, surgeries, medicines\n• Financial assistance — for verified healthcare expenses\n• Emotional & counseling support — confidential, trained listeners\n• Health awareness camps — checkups, vaccination drives, education",
    followUps: ["How do I request medical help?", "Are counseling sessions confidential?"],
  },
  {
    intent: "emergency",
    keywords: ["emergency", "urgent", "immediate", "ambulance", "accident", "critical", "dying"],
    answer:
      "🚨 If this is a real emergency, do not wait for our response. Call:\n• 102 — Free Ambulance (Govt of India)\n• 108 — Emergency Response\n• 1098 — Child Helpline\n• 112 — Single Emergency Number\n\nAfter the person is safe, fill the support form and mark urgency as High — we'll follow up with financial/medical aid.",
    followUps: ["How do I request follow-up aid?", "What if I can't afford treatment after?"],
  },
  {
    intent: "volunteer",
    keywords: ["volunteer", "join", "help out", "contribute time", "work with", "intern"],
    answer:
      "We'd love your help. Volunteers run medical camps, drive awareness, manage logistics, and support our online presence. Email volunteers@jaruratcare.org with: your name, city, skills, and how many hours/week you can commit.",
    followUps: ["What skills do you need?", "Is this remote or in-person?"],
  },
  {
    intent: "location",
    keywords: ["location", "where", "area", "city", "available in", "operate", "based", "district"],
    answer:
      "We currently operate across Chhattisgarh, with active presence in Raipur, Bilaspur, Durg, and Korba. We accept requests from neighboring states case-by-case — please submit the form and mention your location clearly.",
    followUps: ["Do you operate in Raipur?", "Can I request from outside Chhattisgarh?"],
  },
  {
    intent: "response_time",
    keywords: ["time", "how long", "wait", "response", "when will", "reply", "get back"],
    answer:
      "Response times by urgency:\n• Standard — 24 to 48 hours\n• Urgent (marked High) — within 6 hours\n• Emergency — please call 102/108, don't wait for us\n\nYou'll receive updates via SMS and a callback on the number you provided.",
    followUps: ["How do I mark a request as urgent?", "What if I don't get a response?"],
  },
  {
    intent: "documents",
    keywords: ["document", "proof", "aadhaar", "aadhar", "id", "papers", "need to submit", "required"],
    answer:
      "For most requests we need:\n• Aadhaar card or any government photo ID\n• Medical reports, if available\n• Income proof — for financial aid only\n\nDon't have these documents? Submit the form anyway and mention it — we'll help you arrange them through our partner network.",
    followUps: ["What if I don't have Aadhaar?", "How do I share documents?"],
  },
  {
    intent: "donate",
    keywords: ["donate", "donation", "contribute", "give", "fund", "support you", "csr"],
    answer:
      "Thank you for asking. We accept individual donations via UPI (jaruratcare@upi) and CSR partnerships. All donations are 80G tax-exempt. Visit jaruratcare.org/donate or email donate@jaruratcare.org for receipts and reports.",
    followUps: ["Is my donation tax-exempt?", "How is the money used?"],
  },
  {
    intent: "contact",
    keywords: ["contact", "reach", "phone number", "email", "talk to someone", "speak", "call you"],
    answer:
      "You can reach us at:\n• Helpline — +91 771 000 0000 (10am–7pm, Mon–Sat)\n• Email — hello@jaruratcare.org\n• Office — Civil Lines, Raipur, Chhattisgarh 492001\n\nFor faster help, fill out the support form on this page.",
    followUps: ["What are your office hours?", "How do I file a complaint?"],
  },
];

/**
 * Score how well a user message matches an intent.
 * Longer keyword matches = higher confidence.
 */
function scoreIntent(message, intent) {
  const lower = message.toLowerCase();
  let score = 0;
  for (const kw of intent.keywords) {
    if (lower.includes(kw)) {
      score += kw.length; // weight by keyword specificity
    }
  }
  return score;
}

function findBestAnswer(message) {
  let best = null;
  let bestScore = 0;
  for (const intent of KNOWLEDGE_BASE) {
    const s = scoreIntent(message, intent);
    if (s > bestScore) {
      best = intent;
      bestScore = s;
    }
  }
  if (best && bestScore > 1) return best;
  return {
    intent: "fallback",
    answer:
      "I'm not sure I understood that. I can help with: how to request help, our services, costs, emergency numbers, volunteering, locations, required documents, or donations. Try asking in different words?",
    followUps: ["What services do you offer?", "How do I request help?", "Emergency numbers?"],
  };
}

/* ------------------------------------------------------------------ */
/*  Main App                                                            */
/* ------------------------------------------------------------------ */
export default function App() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans antialiased">
      <Nav />
      <Hero />
      <Services />
      <SupportForm />
      <HowItWorks />
      <Footer />
      <CareBot />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                          */
/* ------------------------------------------------------------------ */
function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FAF7F2]/85 border-b border-stone-200/70">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-baseline gap-2 group">
          <span className="font-serif text-xl text-[#134E3A] tracking-tight">Jarurat</span>
          <span className="font-serif text-xl text-[#D97706]">ज़रूरत</span>
          <span className="text-stone-400 text-sm font-light hidden sm:inline">/ Care</span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-stone-600">
          <a href="#services" className="hover:text-[#134E3A] transition">Services</a>
          <a href="#how" className="hover:text-[#134E3A] transition">How it works</a>
          <a href="#form" className="hover:text-[#134E3A] transition">Request help</a>
        </nav>
        <a
          href="#form"
          className="text-sm bg-[#134E3A] text-[#FAF7F2] px-4 py-2 rounded-full hover:bg-[#0B3325] transition flex items-center gap-1.5"
        >
          Get support <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Quiet Devanagari watermark — the signature element */}
      <div
        aria-hidden="true"
        className="absolute -right-8 top-8 sm:top-16 font-serif text-[#134E3A]/[0.05] text-[180px] sm:text-[280px] leading-none select-none pointer-events-none"
      >
        ज़रूरत
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 relative">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#134E3A] bg-[#134E3A]/[0.06] px-3 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            Healthcare access for everyone
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-stone-900">
            Healthcare support for families who need it most.
          </h1>

          <p className="mt-7 text-lg text-stone-600 max-w-2xl leading-relaxed">
            Jarurat Care is a non-profit connecting underserved families in Chhattisgarh with free
            medical aid, counseling, and health resources. No fees. No paperwork mountains. Just
            people who care, doing what they can.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <a
              href="#form"
              className="inline-flex items-center justify-center gap-2 bg-[#134E3A] text-[#FAF7F2] px-6 py-3.5 rounded-full hover:bg-[#0B3325] transition group"
            >
              Request support
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-stone-300 hover:border-stone-400 hover:bg-white transition text-stone-700"
            >
              See how we help
            </a>
          </div>

          {/* Trust microcopy */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-stone-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#134E3A]" />
              80G registered NGO
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#134E3A]" />
              24–48 hour response
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#D97706]" />
              Funded by donations
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Services                                                            */
/* ------------------------------------------------------------------ */
function Services() {
  const services = [
    {
      icon: Stethoscope,
      title: "Medical Aid",
      desc: "Treatment costs, hospital coordination, medicine arrangement for life-threatening or chronic conditions.",
    },
    {
      icon: Banknote,
      title: "Financial Help",
      desc: "Direct assistance for verified healthcare expenses — surgeries, dialysis, cancer treatment, NICU stays.",
    },
    {
      icon: BookHeart,
      title: "Counseling",
      desc: "Confidential emotional support from trained listeners. Mental health is healthcare too.",
    },
    {
      icon: HandHeart,
      title: "Awareness Camps",
      desc: "Free checkups, vaccination drives, and community health education in rural and semi-urban areas.",
    },
  ];

  return (
    <section id="services" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-2xl mb-14">
        <div className="text-xs uppercase tracking-[0.18em] text-[#D97706] mb-3">What we do</div>
        <h2 className="font-serif text-4xl sm:text-5xl text-stone-900 tracking-tight">
          How we help
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-px bg-stone-200">
        {services.map((s) => (
          <div
            key={s.title}
            className="bg-[#FAF7F2] p-8 sm:p-10 hover:bg-white transition group"
          >
            <s.icon className="w-7 h-7 text-[#134E3A] mb-5 group-hover:text-[#D97706] transition" />
            <h3 className="font-serif text-2xl text-stone-900 mb-2">{s.title}</h3>
            <p className="text-stone-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Support Request Form                                                */
/* ------------------------------------------------------------------ */
function SupportForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    city: "",
    supportType: "",
    urgency: "medium",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [referenceId, setReferenceId] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Please tell us your name";
    if (!form.phone.trim()) e.phone = "We need a phone number to reach you";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s+/g, "")))
      e.phone = "Phone number should be 10 digits";
    if (!form.age.trim()) e.age = "Required";
    else if (isNaN(Number(form.age)) || Number(form.age) < 0 || Number(form.age) > 120)
      e.age = "Enter a valid age";
    if (!form.city.trim()) e.city = "Which city or village?";
    if (!form.supportType) e.supportType = "Pick what you need help with";
    if (!form.description.trim()) e.description = "Tell us briefly what's happening";
    else if (form.description.trim().length < 20)
      e.description = "A little more detail helps us help you faster (20+ characters)";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "That doesn't look like a valid email";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const eMap = validate();
    if (Object.keys(eMap).length) {
      setErrors(eMap);
      // scroll to first error
      const firstKey = Object.keys(eMap)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStatus("submitting");

    // Simulate a backend submission — in a real deployment this would POST to an API
    setTimeout(() => {
      const ref = "JC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      setReferenceId(ref);
      setStatus("success");
    }, 1100);
  }

  function resetForm() {
    setForm({
      name: "", phone: "", email: "", age: "", city: "",
      supportType: "", urgency: "medium", description: "",
    });
    setErrors({});
    setStatus("idle");
    setReferenceId("");
  }

  if (status === "success") {
    return (
      <section id="form" className="bg-[#134E3A] text-[#FAF7F2]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF7F2]/10 mb-6">
            <CheckCircle2 className="w-7 h-7 text-[#FDE68A]" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tight mb-4">
            Request received
          </h2>
          <p className="text-[#FAF7F2]/70 mb-2 text-lg">
            Reference ID: <span className="font-mono text-[#FDE68A]">{referenceId}</span>
          </p>
          <p className="text-[#FAF7F2]/70 mb-8 max-w-xl mx-auto leading-relaxed">
            A team member will call you on <span className="text-[#FAF7F2]">+91 {form.phone}</span> within{" "}
            {form.urgency === "high" ? "6 hours" : "24–48 hours"}. Save your reference ID — you'll need
            it to check status or follow up.
          </p>
          <button
            onClick={resetForm}
            className="text-sm underline underline-offset-4 text-[#FDE68A] hover:text-[#FAF7F2]"
          >
            Submit another request
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="form" className="bg-[#134E3A] text-[#FAF7F2]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.18em] text-[#FDE68A] mb-3">Patient support request</div>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">
            Submit a support request
          </h2>
          <p className="text-[#FAF7F2]/70 mt-4 max-w-xl leading-relaxed">
            Everything you share is confidential. Fields marked with{" "}
            <span className="text-[#FDE68A]">*</span> are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7" noValidate>
          {/* Name */}
          <Field id="field-name" label="Full name" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your full name"
              className={inputClass(errors.name)}
            />
          </Field>

          {/* Phone + Age side by side */}
          <div className="grid sm:grid-cols-2 gap-7">
            <Field id="field-phone" label="Phone number" required error={errors.phone} hint="10-digit Indian number">
              <div className="flex items-stretch">
                <span className="flex items-center px-3 bg-[#FAF7F2]/10 border border-r-0 border-[#FAF7F2]/20 rounded-l-lg text-[#FAF7F2]/70 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  className={inputClass(errors.phone, "rounded-l-none")}
                />
              </div>
            </Field>

            <Field id="field-age" label="Patient's age" required error={errors.age}>
              <input
                type="number"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="e.g. 34"
                min="0"
                max="120"
                className={inputClass(errors.age)}
              />
            </Field>
          </div>

          {/* Email + City */}
          <div className="grid sm:grid-cols-2 gap-7">
            <Field id="field-email" label="Email" error={errors.email} hint="Optional, for written updates">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                className={inputClass(errors.email)}
              />
            </Field>
            <Field id="field-city" label="City or village" required error={errors.city}>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="e.g. Raipur"
                className={inputClass(errors.city)}
              />
            </Field>
          </div>

          {/* Support type */}
          <Field id="field-supportType" label="What kind of support do you need?" required error={errors.supportType}>
            <select
              value={form.supportType}
              onChange={(e) => update("supportType", e.target.value)}
              className={`${inputClass(errors.supportType)} appearance-none cursor-pointer`}
            >
              <option value="" className="text-stone-900">Choose one…</option>
              <option value="medical" className="text-stone-900">Medical aid — treatment or medicines</option>
              <option value="financial" className="text-stone-900">Financial assistance for healthcare</option>
              <option value="counseling" className="text-stone-900">Emotional support or counseling</option>
              <option value="awareness" className="text-stone-900">Health awareness / camp info</option>
              <option value="other" className="text-stone-900">Something else</option>
            </select>
          </Field>

          {/* Urgency */}
          <div>
            <label className="block text-sm text-[#FAF7F2] mb-3">
              How urgent is this?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: "low", label: "Low", sub: "Can wait a few days" },
                { v: "medium", label: "Medium", sub: "Within this week" },
                { v: "high", label: "High", sub: "Within hours" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => update("urgency", opt.v)}
                  className={`text-left p-4 rounded-lg border transition ${
                    form.urgency === opt.v
                      ? "border-[#FDE68A] bg-[#FDE68A]/10"
                      : "border-[#FAF7F2]/20 hover:border-[#FAF7F2]/40"
                  }`}
                >
                  <div className={`text-sm font-medium ${form.urgency === opt.v ? "text-[#FDE68A]" : "text-[#FAF7F2]"}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-[#FAF7F2]/60 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
            {form.urgency === "high" && (
              <div className="mt-3 flex items-start gap-2 text-sm text-[#FDE68A]/90">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  For active medical emergencies, please call <strong>102</strong> or{" "}
                  <strong>108</strong> first. Our team responds within 6 hours for High-urgency cases.
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <Field
            id="field-description"
            label="Brief description"
            required
            error={errors.description}
            hint={`${form.description.length}/500 characters`}
          >
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value.slice(0, 500))}
              rows={5}
              placeholder="Tell us what's happening, what kind of help you're looking for, and any context that helps us understand the situation."
              className={inputClass(errors.description)}
            />
          </Field>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D97706] text-stone-900 px-8 py-4 rounded-full font-medium hover:bg-[#FDE68A] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit request <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-xs text-[#FAF7F2]/50 mt-4">
              By submitting, you consent to a call from our team. We never share your information with third parties.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

function inputClass(hasError, extra = "") {
  return `w-full bg-[#FAF7F2]/5 border ${
    hasError ? "border-red-300" : "border-[#FAF7F2]/20"
  } rounded-lg px-4 py-3 text-[#FAF7F2] placeholder:text-[#FAF7F2]/30 focus:outline-none focus:border-[#FDE68A] focus:bg-[#FAF7F2]/10 transition ${extra}`;
}

function Field({ id, label, required, error, hint, children }) {
  return (
    <div id={id}>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm text-[#FAF7F2]">
          {label} {required && <span className="text-[#FDE68A]">*</span>}
        </label>
        {hint && !error && <span className="text-xs text-[#FAF7F2]/40">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-red-300">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  How It Works                                                        */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "You reach out",
      desc: "Fill the form, call our helpline, or chat with CareBot. Whatever's easiest for you right now.",
    },
    {
      n: "02",
      title: "We verify and assess",
      desc: "A volunteer calls within 24–48 hours to understand the situation and what documents are needed.",
    },
    {
      n: "03",
      title: "Aid is delivered",
      desc: "Medical, financial, or emotional support — directly, with no middlemen and no fees.",
    },
  ];
  return (
    <section id="how" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-2xl mb-14">
        <div className="text-xs uppercase tracking-[0.18em] text-[#D97706] mb-3">How it works</div>
        <h2 className="font-serif text-4xl sm:text-5xl text-stone-900 tracking-tight">
          Getting support is simple
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        {steps.map((s) => (
          <div key={s.n} className="relative">
            <div className="font-serif text-6xl text-[#D97706]/30 mb-4">{s.n}</div>
            <h3 className="font-serif text-2xl text-stone-900 mb-3">{s.title}</h3>
            <p className="text-stone-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#F0EBE0]/30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-serif text-lg text-[#134E3A]">Jarurat</span>
              <span className="font-serif text-lg text-[#D97706]">ज़रूरत</span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed max-w-xs">
              Bridging the gap between people in need and the healthcare they deserve. One request at a time.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-4">Get in touch</div>
            <ul className="space-y-2.5 text-sm text-stone-600">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#134E3A]" /> +91 771 000 0000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#134E3A]" /> hello@jaruratcare.org
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#134E3A]" /> Civil Lines, Raipur, CG
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-4">Emergency</div>
            <ul className="space-y-2 text-sm text-stone-600">
              <li><strong className="text-stone-900">102</strong> — Ambulance</li>
              <li><strong className="text-stone-900">108</strong> — Emergency Response</li>
              <li><strong className="text-stone-900">1098</strong> — Child Helpline</li>
              <li><strong className="text-stone-900">112</strong> — Single Emergency</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div>© 2026 Jarurat Care Foundation · 80G Registered · CIN U85300CT2024NPL</div>
          <div>Made with care in Chhattisgarh</div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  CareBot — the AI feature                                            */
/* ------------------------------------------------------------------ */
function CareBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Namaste 🙏 I'm CareBot. Ask me anything about Jarurat Care — services, how to request help, emergency numbers, volunteering, or documents.",
      followUps: ["What services do you offer?", "How do I request help?", "Emergency numbers?"],
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function send(text) {
    const message = text.trim();
    if (!message) return;
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setTyping(true);
    // Simulate the bot "thinking" so the UX feels real
    setTimeout(() => {
      const answer = findBestAnswer(message);
      setMessages((m) => [
        ...m,
        { role: "bot", text: answer.answer, followUps: answer.followUps },
      ]);
      setTyping(false);
    }, 550 + Math.random() * 350);
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open CareBot chat"
        className={`fixed bottom-5 right-5 z-40 bg-[#134E3A] text-[#FAF7F2] rounded-full shadow-lg shadow-[#134E3A]/20 hover:bg-[#0B3325] transition-all flex items-center gap-2 px-5 py-3.5 ${
          open ? "scale-0 opacity-0 pointer-events-none" : "scale-100"
        }`}
      >
        <Sparkles className="w-4 h-4 text-[#FDE68A]" />
        <span className="text-sm font-medium">Ask CareBot</span>
      </button>

      {/* Chat panel */}
      <div
        className={`fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 transition-all ${
          open
            ? "translate-y-0 opacity-100"
            : "translate-y-full sm:translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-[#FAF7F2] sm:rounded-2xl shadow-2xl shadow-stone-900/15 border border-stone-200 w-full sm:w-[400px] h-[80vh] sm:h-[600px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#134E3A] text-[#FAF7F2] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FDE68A]/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#FDE68A]" />
              </div>
              <div>
                <div className="font-medium text-sm">CareBot</div>
                <div className="text-xs text-[#FAF7F2]/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Usually replies instantly
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close CareBot"
              className="text-[#FAF7F2]/70 hover:text-[#FAF7F2] p-1 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i}>
                {m.role === "bot" ? (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#134E3A] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-[#FDE68A]" />
                    </div>
                    <div className="max-w-[85%]">
                      <div className="bg-white border border-stone-200 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-stone-800 whitespace-pre-line leading-relaxed">
                        {m.text}
                      </div>
                      {m.followUps && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.followUps.map((f) => (
                            <button
                              key={f}
                              onClick={() => send(f)}
                              className="text-xs bg-[#134E3A]/[0.06] hover:bg-[#134E3A]/[0.12] text-[#134E3A] px-3 py-1.5 rounded-full transition"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="bg-[#134E3A] text-[#FAF7F2] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm max-w-[85%] leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#134E3A] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-[#FDE68A]" />
                </div>
                <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-stone-200 p-3 flex items-center gap-2 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#134E3A] transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-full bg-[#134E3A] text-[#FAF7F2] flex items-center justify-center hover:bg-[#0B3325] disabled:opacity-40 transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 text-[10px] text-stone-500 text-center">
            CareBot is a rule-based assistant. For complex queries, please use the form or call our helpline.
          </div>
        </div>
      </div>
    </>
  );
}
