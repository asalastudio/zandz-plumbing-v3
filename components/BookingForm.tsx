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

import { useState, useMemo, useRef, type FormEvent } from "react";
import {
  Phone,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
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
import { PhotoUploadField } from "@/components/PhotoUploadField";

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
  photo: File | null;
}

const initialFormState = (initialZip = "", initialService = ""): FormState => {
  const matchedService = SERVICE_OPTIONS.find((s) => s.id === initialService);
  const cleanZip = initialZip.trim();
  const hasInitialZip = /^\d{5}$/.test(cleanZip);
  const serviceArea = hasInitialZip ? lookupServiceArea(cleanZip) : null;
  return {
    zip: cleanZip,
    zipValidated: hasInitialZip,
    serviceArea,
    outOfArea: hasInitialZip && !serviceArea,
    service: matchedService?.id ?? "",
    serviceLabel: matchedService?.label ?? "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredCallbackTime: "",
    briefDescription: "",
    smsConsent: true,
    photo: null,
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
  const formShellRef = useRef<HTMLDivElement>(null);
  const hasInitialZip = /^\d{5}$/.test(initialZip.trim());
  const hasInitialService = SERVICE_OPTIONS.some((s) => s.id === initialService);
  const [step, setStep] = useState<Step>(
    hasInitialZip ? (hasInitialService ? 3 : 2) : 1
  );
  const [form, setForm] = useState<FormState>(() =>
    initialFormState(initialZip, initialService)
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const selectedService = useMemo(
    () => SERVICE_OPTIONS.find((s) => s.id === form.service),
    [form.service]
  );
  const isEmergency = selectedService?.emergency === true;

  const goToStep = (nextStep: Step) => {
    setStep(nextStep);
    window.requestAnimationFrame(() => {
      formShellRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  };

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
    goToStep(2);
  };

  const handleServiceSelect = (option: ServiceOption) => {
    update("service", option.id);
    update("serviceLabel", option.label);
    // Don't auto-advance on emergency — they may want to fill the form OR call.
    if (!option.emergency) {
      goToStep(3);
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
      const payload = new FormData();
      payload.set("firstName", form.firstName.trim());
      payload.set("lastName", form.lastName.trim());
      payload.set("email", form.email.trim());
      payload.set("phone", phoneDigits);
      payload.set("zip", form.zip);
      payload.set("serviceInterest", form.service);
      payload.set("serviceLabel", form.serviceLabel);
      payload.set("smsConsent", String(form.smsConsent));
      payload.set("outOfArea", String(form.outOfArea));
      if (form.preferredCallbackTime) payload.set("preferredCallbackTime", form.preferredCallbackTime);
      if (form.briefDescription.trim()) payload.set("briefDescription", form.briefDescription.trim());
      if (form.serviceArea?.slug) payload.set("serviceAreaSlug", form.serviceArea.slug);
      payload.set(
        "sourcePage",
        sourcePage ?? (typeof window !== "undefined" ? window.location.pathname : "")
      );
      if (form.photo) payload.set("photo", form.photo);

      const res = await fetch("/api/lead/", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(
          body?.error ?? "We couldn't submit that. Please call us directly."
        );
        setSubmitting(false);
        return;
      }

      goToStep(4);
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
    <div
      id="booking-form"
      ref={formShellRef}
      className="w-full max-w-2xl scroll-mt-32 md:scroll-mt-28"
    >
      <ProgressBar step={step} />

      <div className="mt-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-2xl md:mt-6 md:p-8">
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
            onBack={() => goToStep(1)}
            onContinueEmergency={() => goToStep(3)}
            isEmergency={isEmergency}
          />
        )}

        {step === 3 && (
          <StepContact
            form={form}
            update={update}
            onSubmit={handleFinalSubmit}
            onBack={() => goToStep(2)}
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
  const labels = ["ZIP", "Issue", "Info"];
  const activeStep = step === 4 ? 3 : step;
  return (
    <div aria-label="Booking progress">
      <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em]">
        <span className="text-[#666]">
          {step === 4 ? "Complete" : `Step ${activeStep} of 3`}
        </span>
        <span className="text-[#F96302]">
          {step === 4 ? "Done" : labels[activeStep - 1]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {labels.map((label, i) => {
          const n = (i + 1) as Step;
          const isActive = step !== 4 && activeStep === n;
          const isDone = step === 4 || activeStep > n;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-black transition-colors md:h-8 md:w-8 md:text-xs",
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
                  "text-[11px] font-black uppercase tracking-[0.1em]",
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
            autoComplete="postal-code"
            enterKeyHint="go"
            pattern="\d{5}"
            maxLength={5}
            placeholder="ZIP code"
            value={zip}
            autoFocus
            onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
            className="h-14 w-full rounded-xl border-2 border-[#E5E5E5] bg-white py-4 pl-12 pr-4 text-lg font-bold tracking-wider text-black placeholder:text-[#999] placeholder:font-normal focus:border-[#F96302] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={zip.length !== 5}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#F96302] px-6 py-4 text-base font-black text-white transition-all hover:bg-[#d95400] disabled:cursor-not-allowed disabled:bg-[#cccccc] disabled:text-white sm:px-8"
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
          Pick the closest match to continue. The crew will sort out the details.
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
                "flex min-h-[88px] items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
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
                  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg",
                  isEmergencyChip ? "bg-red-600 text-white" : "bg-black text-[#F96302]",
                ].join(" ")}
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <p
                  className={[
                    "font-display text-xl font-black uppercase leading-tight",
                    isEmergencyChip ? "text-red-700" : "text-black",
                  ].join(" ")}
                >
                  {opt.label}
                </p>
                <p className="mt-1 text-sm leading-snug text-[#666]">{opt.description}</p>
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
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-base font-black text-red-700 transition-colors hover:bg-red-50"
            >
              <Phone className="h-5 w-5" /> Call {siteSettings.phone}
            </a>
            <button
              type="button"
              onClick={onContinueEmergency}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-5 py-4 text-base font-black text-white transition-colors hover:border-white"
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
        className="inline-flex min-h-12 items-center gap-1 self-start rounded-xl border border-[#D8D8D8] bg-white px-4 text-base font-bold text-[#555] hover:text-black"
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
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 md:gap-5">
      <div>
        <h2 className="font-display text-3xl font-black uppercase leading-tight text-black md:text-4xl">
          How do we reach you?
        </h2>
        <p className="mt-2 text-sm text-[#666] md:text-base">
          We&apos;ll call to confirm details and book the appointment.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-[#FFF7F2] px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#F96302]">
          Required: name, phone, email
        </p>
        {(form.serviceLabel || form.zip) && (
          <p className="mt-3 rounded-xl bg-[#F5F5F5] px-3 py-2 text-xs font-semibold text-[#333]">
            {form.serviceLabel || "Plumbing request"}
            {form.zip && ` · ZIP ${form.zip}`}
            {form.serviceArea?.city && ` · ${form.serviceArea.city}`}
          </p>
        )}
      </div>

      {isEmergency && (
        <a
          href={`tel:${siteSettings.phoneTel}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
        >
          <Phone className="h-4 w-4" /> Emergency? Call {siteSettings.phone} now
        </a>
      )}

      <div className="grid grid-cols-2 gap-3">
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

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.smsConsent}
          onChange={(e) => update("smsConsent", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[#D8D8D8] text-[#F96302] accent-[#F96302]"
        />
        <span className="text-xs leading-snug text-[#666]">
          OK to text appointment confirmations, ETAs, and a review request after the job.
          Msg/data rates may apply. Reply STOP to opt out.
        </span>
      </label>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#F96302] px-8 py-4 text-base font-black text-white transition-all hover:bg-[#d95400] disabled:cursor-not-allowed disabled:bg-[#cccccc] sm:w-auto"
        >
          {submitting ? "Sending..." : "Request callback"}
          {!submitting && <ChevronRight className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-12 items-center gap-1 self-start rounded-xl border border-[#D8D8D8] bg-white px-4 text-base font-bold text-[#555] hover:text-black"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA]">
        <button
          type="button"
          onClick={() => setShowOptionalDetails((open) => !open)}
          aria-expanded={showOptionalDetails}
          aria-controls="booking-optional-details"
          className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span>
            <span className="block text-base font-black text-black">
              Add details or photo
            </span>
            <span className="mt-0.5 block text-sm leading-snug text-[#666]">
              Optional, but helpful for faster dispatch.
            </span>
          </span>
          <ChevronDown
            className={[
              "h-5 w-5 flex-shrink-0 text-[#F96302] transition-transform",
              showOptionalDetails ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>

        {showOptionalDetails && (
          <div
            id="booking-optional-details"
            className="flex flex-col gap-4 border-t border-[#E5E5E5] p-4"
          >
            <Field
              label="Quick description (optional)"
              value={form.briefDescription}
              onChange={(v) => update("briefDescription", v)}
              type="textarea"
              placeholder="Anything we should know before we call?"
            />

            <PhotoUploadField
              fileName={form.photo?.name}
              onChange={(file) => update("photo", file)}
              label="Add a photo"
              description="Take a photo or choose one from your library."
            />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#555]">
                Best time to call (optional)
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
          </div>
        )}
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
      <label className="mb-1.5 block text-[15px] font-bold leading-snug text-[#444]">
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
          className="w-full rounded-xl border-2 border-[#E5E5E5] bg-white px-4 py-3 text-base text-black placeholder:text-[#999] focus:border-[#F96302] focus:outline-none"
        />
      ) : (
        <input
          type={type}
          inputMode={type === "tel" ? "tel" : undefined}
          value={value}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 w-full rounded-xl border-2 border-[#E5E5E5] bg-white px-4 py-3 text-base text-black placeholder:text-[#999] focus:border-[#F96302] focus:outline-none"
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
