"use client";

/**
 * BookingForm — multi-step customer intake.
 *
 * Step 1: ZIP code → validates against serviceAreas. Out-of-area soft-captures.
 * Step 2: Issue selection (visual chips). Emergency surfaces immediate call CTA.
 * Step 3: Name, phone, email, SMS consent, optional description + callback time.
 * Step 4: Confirmation. Includes call-now fallback + customer SMS receipt note.
 *
 * Posts to POST /api/lead.
 * ZIP and service can be pre-loaded via props (used by the home hero
 * and any "Schedule [Service]" link).
 */

import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  Phone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Droplet,
  Pipette,
  Thermometer,
  Wrench,
  Flame,
  Zap,
  HelpCircle,
} from "lucide-react";
import { serviceAreas } from "@/content/service-areas";
import { siteSettings } from "@/content/site-settings";

type Step = 1 | 2 | 3 | 4;

type ServiceOption = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  emergency?: boolean;
  description: string;
};

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "leak",
    label: "Leak",
    icon: Droplet,
    description: "Pipe, fixture, or slab leak",
  },
  {
    id: "clog",
    label: "Clog or Backup",
    icon: Pipette,
    description: "Drain, toilet, or sewer backup",
  },
  {
    id: "water-heater",
    label: "Water Heater",
    icon: Thermometer,
    description: "No hot water, replacement, install",
  },
  {
    id: "sewer-lateral",
    label: "Sewer Line",
    icon: Wrench,
    description: "Lateral, mainline, camera inspection",
  },
  {
    id: "no-hot-water",
    label: "No Hot Water",
    icon: Flame,
    description: "Heater out, pilot won't light",
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: Zap,
    emergency: true,
    description: "Active flooding, no water, gas smell",
  },
  {
    id: "other",
    label: "Something Else",
    icon: HelpCircle,
    description: "We'll figure it out together",
  },
];

interface BookingFormProps {
  initialZip?: string;
  initialService?: string;
  sourcePage?: string;
}

interface FormState {
  zip: string;
  zipValidated: boolean;
  serviceArea: { city: string; slug: string } | null;
  outOfArea: boolean;
  service: string;
  serviceLabel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredCallbackTime: string;
  briefDescription: string;
  smsConsent: boolean;
}

const initialFormState = (initialZip = "", initialService = ""): FormState => {
  const matchedService = SERVICE_OPTIONS.find((s) => s.id === initialService);
  return {
    zip: initialZip,
    zipValidated: false,
    serviceArea: null,
    outOfArea: false,
    service: matchedService?.id ?? "",
    serviceLabel: matchedService?.label ?? "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredCallbackTime: "",
    briefDescription: "",
    smsConsent: true,
  };
};

function lookupServiceArea(zip: string) {
  const z = zip.trim();
  if (!/^\d{5}$/.test(z)) return null;
  for (const area of serviceAreas) {
    if (area.zips.includes(z)) return { city: area.city, slug: area.slug };
  }
  return null;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function BookingForm({
  initialZip = "",
  initialService = "",
  sourcePage,
}: BookingFormProps) {
  const [step, setStep] = useState<Step>(initialZip ? 2 : 1);
  const [form, setForm] = useState<FormState>(() =>
    initialFormState(initialZip, initialService)
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // If we got an initialZip, auto-validate on mount so step 2 has context.
  useEffect(() => {
    if (initialZip && !form.zipValidated) {
      const match = lookupServiceArea(initialZip);
      setForm((f) => ({
        ...f,
        zipValidated: true,
        serviceArea: match,
        outOfArea: !match,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialZip]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const selectedService = useMemo(
    () => SERVICE_OPTIONS.find((s) => s.id === form.service),
    [form.service]
  );
  const isEmergency = selectedService?.emergency === true;

  const handleZipSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const z = form.zip.trim();
    if (!/^\d{5}$/.test(z)) {
      setSubmitError("Please enter a 5-digit ZIP code.");
      return;
    }
    setSubmitError(null);
    const match = lookupServiceArea(z);
    setForm((f) => ({
      ...f,
      zip: z,
      zipValidated: true,
      serviceArea: match,
      outOfArea: !match,
    }));
    setStep(2);
  };

  const handleServiceSelect = (option: ServiceOption) => {
    update("service", option.id);
    update("serviceLabel", option.label);
    // Don't auto-advance on emergency — they may want to fill the form OR call.
    if (!option.emergency) {
      setStep(3);
    }
  };

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setSubmitError("Please enter your first and last name.");
      return;
    }
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setSubmitError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/lead/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: phoneDigits,
          zip: form.zip,
          serviceInterest: form.service,
          serviceLabel: form.serviceLabel,
          preferredCallbackTime: form.preferredCallbackTime || undefined,
          briefDescription: form.briefDescription.trim() || undefined,
          smsConsent: form.smsConsent,
          outOfArea: form.outOfArea,
          serviceAreaSlug: form.serviceArea?.slug,
          sourcePage:
            sourcePage ??
            (typeof window !== "undefined" ? window.location.pathname : undefined),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(
          body?.error ?? "We couldn't submit that. Please call us directly."
        );
        setSubmitting(false);
        return;
      }

      setStep(4);
    } catch {
      setSubmitError("Network hiccup. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-2xl">
      <ProgressBar step={step} />

      <div className="mt-6 rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-2xl md:p-8">
        {step === 1 && (
          <StepZip
            zip={form.zip}
            onChange={(v) => update("zip", v)}
            onSubmit={handleZipSubmit}
            error={submitError}
          />
        )}

        {step === 2 && (
          <StepService
            serviceArea={form.serviceArea}
            outOfArea={form.outOfArea}
            zip={form.zip}
            selectedService={form.service}
            onSelect={handleServiceSelect}
            onBack={() => setStep(1)}
            onContinueEmergency={() => setStep(3)}
            isEmergency={isEmergency}
          />
        )}

        {step === 3 && (
          <StepContact
            form={form}
            update={update}
            onSubmit={handleFinalSubmit}
            onBack={() => setStep(2)}
            submitting={submitting}
            error={submitError}
            isEmergency={isEmergency}
          />
        )}

        {step === 4 && <StepConfirmation form={form} />}
      </div>

      <p className="mt-4 text-center text-xs text-[#666666]">
        Or call us directly at{" "}
        <a
          href={`tel:${siteSettings.phoneTel}`}
          className="font-semibold text-[#F96302] hover:underline"
        >
          {siteSettings.phone}
        </a>
        . 24/7 emergency.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Progress bar
// ──────────────────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  const labels = ["ZIP", "Service", "Contact", "Done"];
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const isActive = step === n;
        const isDone = step > n;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                isDone
                  ? "border-[#F96302] bg-[#F96302] text-white"
                  : isActive
                    ? "border-[#F96302] bg-white text-[#F96302]"
                    : "border-[#D8D8D8] bg-white text-[#999]",
              ].join(" ")}
            >
              {isDone ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            <span
              className={[
                "hidden text-[11px] font-bold uppercase tracking-[0.1em] sm:inline",
                isActive ? "text-black" : "text-[#999]",
              ].join(" ")}
            >
              {label}
            </span>
            {i < labels.length - 1 && (
              <div
                className={[
                  "h-px flex-1 transition-colors",
                  isDone ? "bg-[#F96302]" : "bg-[#D8D8D8]",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Step 1 — ZIP
// ──────────────────────────────────────────────────────────────────────────

function StepZip({
  zip,
  onChange,
  onSubmit,
  error,
}: {
  zip: string;
  onChange: (v: string) => void;
  onSubmit: (e?: FormEvent) => void;
  error: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-black uppercase leading-tight text-black md:text-4xl">
          Where do you need a plumber?
        </h2>
        <p className="mt-2 text-sm text-[#666] md:text-base">
          Enter your ZIP and we&apos;ll check coverage and route you to the nearest crew.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MapPin
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999]"
            strokeWidth={1.5}
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            placeholder="ZIP code"
            value={zip}
            autoFocus
            onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
            className="w-full rounded-xl border-2 border-[#E5E5E5] bg-white py-4 pl-12 pr-4 text-lg font-bold tracking-wider text-black placeholder:text-[#999] placeholder:font-normal focus:border-[#F96302] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={zip.length !== 5}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F96302] px-6 py-4 text-sm font-bold text-white transition-all hover:bg-[#d95400] disabled:cursor-not-allowed disabled:bg-[#cccccc] disabled:text-white sm:px-8"
        >
          Check coverage
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <p className="text-xs text-[#999]">
        We serve the East Bay corridor · San Leandro, Oakland, Berkeley, Alameda, Hayward,
        Castro Valley, Union City, Fremont, Newark, Dublin, Pleasanton, Walnut Creek, and Contra Costa County.
      </p>
    </form>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Step 2 — Service selection
// ──────────────────────────────────────────────────────────────────────────

function StepService({
  serviceArea,
  outOfArea,
  zip,
  selectedService,
  onSelect,
  onBack,
  onContinueEmergency,
  isEmergency,
}: {
  serviceArea: { city: string; slug: string } | null;
  outOfArea: boolean;
  zip: string;
  selectedService: string;
  onSelect: (s: ServiceOption) => void;
  onBack: () => void;
  onContinueEmergency: () => void;
  isEmergency: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Coverage result banner */}
      {serviceArea && (
        <div className="flex items-start gap-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-emerald-900">
              Yes — we serve {serviceArea.city} ({zip}).
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              Typical response: 30–60 minutes during business hours.
            </p>
          </div>
        </div>
      )}

      {outOfArea && (
        <div className="flex items-start gap-3 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              {zip} is outside our regular East Bay service area.
            </p>
            <p className="mt-1 text-xs text-amber-800">
              We can still take your info — for some jobs we travel further. Or you can call us
              directly to discuss.
            </p>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-3xl font-black uppercase leading-tight text-black md:text-4xl">
          What&apos;s the issue?
        </h2>
        <p className="mt-2 text-sm text-[#666] md:text-base">
          Pick the closest match. The crew will sort out the details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SERVICE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedService === opt.id;
          const isEmergencyChip = opt.emergency;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt)}
              className={[
                "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                isSelected
                  ? isEmergencyChip
                    ? "border-red-600 bg-red-50"
                    : "border-[#F96302] bg-[#FFF7F2]"
                  : isEmergencyChip
                    ? "border-red-200 bg-red-50/30 hover:border-red-500 hover:bg-red-50"
                    : "border-[#E5E5E5] bg-white hover:border-[#F96302] hover:bg-[#FFF7F2]",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                  isEmergencyChip ? "bg-red-600 text-white" : "bg-black text-[#F96302]",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p
                  className={[
                    "font-display text-lg font-black uppercase leading-tight",
                    isEmergencyChip ? "text-red-700" : "text-black",
                  ].join(" ")}
                >
                  {opt.label}
                </p>
                <p className="mt-1 text-xs text-[#666]">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Emergency surfaces a big call CTA + still lets you continue the form */}
      {isEmergency && (
        <div className="rounded-2xl border-2 border-red-600 bg-red-600 p-5 text-white">
          <p className="font-display text-xl font-black uppercase">Active emergency?</p>
          <p className="mt-2 text-sm text-white/90">
            Call us right now — same-day, 24/7. Don&apos;t wait on the form.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={`tel:${siteSettings.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-base font-bold text-red-700 transition-colors hover:bg-red-50"
            >
              <Phone className="h-5 w-5" /> Call {siteSettings.phone}
            </a>
            <button
              type="button"
              onClick={onContinueEmergency}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-5 py-4 text-sm font-bold text-white transition-colors hover:border-white"
            >
              Or finish the form
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 self-start text-sm font-bold text-[#666] hover:text-black"
      >
        <ChevronLeft className="h-4 w-4" /> Change ZIP
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Step 3 — Contact details
// ──────────────────────────────────────────────────────────────────────────

function StepContact({
  form,
  update,
  onSubmit,
  onBack,
  submitting,
  error,
  isEmergency,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
  submitting: boolean;
  error: string | null;
  isEmergency: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-black uppercase leading-tight text-black md:text-4xl">
          How do we reach you?
        </h2>
        <p className="mt-2 text-sm text-[#666] md:text-base">
          We&apos;ll call to confirm details and book the appointment.
        </p>
      </div>

      {isEmergency && (
        <a
          href={`tel:${siteSettings.phoneTel}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
        >
          <Phone className="h-4 w-4" /> Emergency? Call {siteSettings.phone} now
        </a>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="First name"
          value={form.firstName}
          onChange={(v) => update("firstName", v)}
          required
          autoComplete="given-name"
        />
        <Field
          label="Last name"
          value={form.lastName}
          onChange={(v) => update("lastName", v)}
          required
          autoComplete="family-name"
        />
      </div>

      <Field
        label="Phone"
        value={form.phone}
        onChange={(v) => update("phone", formatPhone(v))}
        required
        type="tel"
        autoComplete="tel"
        placeholder="(510) 555-0123"
      />

      <Field
        label="Email"
        value={form.email}
        onChange={(v) => update("email", v)}
        required
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
      />

      <Field
        label="Quick description (optional)"
        value={form.briefDescription}
        onChange={(v) => update("briefDescription", v)}
        type="textarea"
        placeholder="Anything we should know before we call?"
      />

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#555]">
          Best time to call (optional)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "asap", label: "ASAP" },
            { id: "morning", label: "Morning" },
            { id: "afternoon", label: "Afternoon" },
            { id: "evening", label: "Evening" },
          ].map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() =>
                update(
                  "preferredCallbackTime",
                  form.preferredCallbackTime === slot.id ? "" : slot.id
                )
              }
              className={[
                "rounded-lg border-2 px-2 py-2.5 text-sm font-bold transition-all",
                form.preferredCallbackTime === slot.id
                  ? "border-[#F96302] bg-[#FFF7F2] text-[#F96302]"
                  : "border-[#E5E5E5] bg-white text-[#666] hover:border-[#F96302]",
              ].join(" ")}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.smsConsent}
          onChange={(e) => update("smsConsent", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[#D8D8D8] text-[#F96302] accent-[#F96302]"
        />
        <span className="text-xs leading-relaxed text-[#666]">
          OK to text me appointment confirmations, ETAs, and a Google review request after the
          job. Message and data rates may apply. Reply STOP to opt out. We never sell your number.
        </span>
      </label>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 self-start text-sm font-bold text-[#666] hover:text-black"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F96302] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#d95400] disabled:cursor-not-allowed disabled:bg-[#cccccc]"
        >
          {submitting ? "Sending..." : "Get a call back"}
          {!submitting && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-[#555]">
        {label}
        {required && <span className="ml-1 text-[#F96302]">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-[#E5E5E5] bg-white px-4 py-3 text-sm text-black placeholder:text-[#999] focus:border-[#F96302] focus:outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border-2 border-[#E5E5E5] bg-white px-4 py-3 text-sm text-black placeholder:text-[#999] focus:border-[#F96302] focus:outline-none"
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Step 4 — Confirmation
// ──────────────────────────────────────────────────────────────────────────

function StepConfirmation({ form }: { form: FormState }) {
  return (
    <div className="flex flex-col gap-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckCircle2 className="h-9 w-9 text-emerald-600" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="font-display text-3xl font-black uppercase leading-tight text-black md:text-4xl">
          Got it, {form.firstName.split(" ")[0]}.
        </h2>
        <p className="mt-3 text-base text-[#333]">
          {form.outOfArea
            ? "We received your request — even though we don't regularly serve your area, the crew will review and reach out if we can help."
            : `Someone from Z and Z will call you at ${form.phone} within ~15 minutes during business hours. ${form.smsConsent ? "We'll also text you a confirmation." : ""}`}
        </p>
      </div>

      <div className="rounded-xl bg-[#F5F5F5] p-4 text-left text-sm">
        <p className="text-sm font-semibold text-[#555]">
          Your request
        </p>
        <dl className="mt-2 grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-[#666]">Service</dt>
          <dd className="font-semibold text-black">{form.serviceLabel}</dd>
          <dt className="text-[#666]">ZIP</dt>
          <dd className="font-semibold text-black">
            {form.zip} {form.serviceArea && `· ${form.serviceArea.city}`}
          </dd>
          <dt className="text-[#666]">Phone</dt>
          <dd className="font-semibold text-black">{form.phone}</dd>
          <dt className="text-[#666]">Email</dt>
          <dd className="break-all font-semibold text-black">{form.email}</dd>
        </dl>
      </div>

      <a
        href={`tel:${siteSettings.phoneTel}`}
        className="inline-flex items-center justify-center gap-2 self-center rounded-xl border-2 border-black bg-black px-6 py-4 text-sm font-bold text-white hover:bg-[#1a1a1a]"
      >
        <Phone className="h-4 w-4" /> Or call now: {siteSettings.phone}
      </a>
    </div>
  );
}
