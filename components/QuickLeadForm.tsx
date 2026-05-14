"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { siteSettings } from "@/content/site-settings";
import { PhotoUploadField } from "@/components/PhotoUploadField";
import { isValidNanp10Digits } from "@/lib/phone";

interface QuickLeadFormProps {
  title?: string;
  description?: string;
  serviceInterest?: string;
  serviceLabel?: string;
  sourcePage?: string;
  zip?: string;
  serviceAreaSlug?: string;
  cityLabel?: string;
  className?: string;
}

interface QuickLeadFormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  serviceAddress: string;
  serviceCity: string;
  serviceZip: string;
  briefDescription: string;
  photo: File | null;
}

type QuickLeadStep = "contact" | "details" | "done";

function buildInitialState(zip?: string, cityLabel?: string): QuickLeadFormState {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    serviceAddress: "",
    serviceCity: cityLabel ?? "",
    serviceZip: zip ?? "",
    briefDescription: "",
    photo: null,
  };
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function firstNameOnly(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

export function QuickLeadForm({
  title = "Request a call back",
  description = "Tell us who to call. We will confirm the issue, service area, and arrival window.",
  serviceInterest = "general",
  serviceLabel = "Website plumbing request",
  sourcePage,
  zip,
  serviceAreaSlug,
  cityLabel,
  className,
}: QuickLeadFormProps) {
  const [form, setForm] = useState<QuickLeadFormState>(() => buildInitialState(zip, cityLabel));
  const [step, setStep] = useState<QuickLeadStep>("contact");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof QuickLeadFormState>(key: K, value: QuickLeadFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(buildInitialState(zip, cityLabel));
    setSubmitting(false);
    setError(null);
    setStep("contact");
  };

  const validateContact = (): boolean => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your first and last name.");
      return false;
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!isValidNanp10Digits(phoneDigits)) {
      setError("Please enter a valid US phone number.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const goToDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (validateContact()) setStep("details");
  };

  const submitLead = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError(null);

    if (!validateContact()) {
      setStep("contact");
      return;
    }

    const serviceZip = form.serviceZip.replace(/\D/g, "").slice(0, 5);
    if (serviceZip && serviceZip.length !== 5) {
      setError("Service ZIP should be 5 digits, or you can leave it blank.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.set("firstName", form.firstName.trim());
      payload.set("lastName", form.lastName.trim());
      payload.set("phone", form.phone);
      payload.set("email", form.email.trim());
      payload.set("serviceInterest", serviceInterest);
      payload.set("serviceLabel", serviceLabel);
      payload.set("smsConsent", "false");
      payload.set("outOfArea", "false");
      if (serviceZip || zip?.trim()) payload.set("zip", serviceZip || zip?.trim() || "");
      if (form.serviceAddress.trim()) payload.set("jobAddress", form.serviceAddress.trim());
      if (form.serviceCity.trim() || cityLabel) payload.set("jobCity", form.serviceCity.trim() || cityLabel || "");
      if (form.briefDescription.trim()) payload.set("briefDescription", form.briefDescription.trim());
      if (serviceAreaSlug) payload.set("serviceAreaSlug", serviceAreaSlug);
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
        setError(body?.error ?? "We could not save that request. Please call us directly.");
        return;
      }

      setStep("done");
    } catch {
      setError("Network hiccup. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "done") {
    return (
      <div className={cn("rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-xl md:p-7", className)}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-3xl font-black uppercase leading-tight tracking-tight text-black">
              Got it, {firstNameOnly(form.firstName)}.
            </p>
            <p className="mt-2 text-base leading-relaxed text-[#333333]">
              Your request is in the Z and Z dashboard. A real person will call you at{" "}
              <span className="font-semibold text-black">{form.phone}</span>.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex min-h-12 items-center justify-center border border-black px-5 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
              >
                Start another request
              </button>
              <a
                href={`tel:${siteSettings.phoneTel}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-[#1a1a1a]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call now
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-xl md:p-7", className)}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">
          Quick intake
        </p>
        <h2 className="mt-2 font-display text-4xl font-black uppercase leading-tight tracking-tight text-black">
          {title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-[#333333]">
          {description}
        </p>
        {(cityLabel || zip) && (
          <p className="mt-3 inline-flex bg-[#F5F5F5] px-3 py-2 text-sm font-semibold text-[#333333]">
            {cityLabel ? `${cityLabel} request` : "Website request"}
            {zip ? ` · ZIP ${zip}` : ""}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#555555]">
        <span className={step === "contact" ? "text-[#F96302]" : "text-black"}>1. Contact</span>
        <span className="h-px flex-1 bg-[#E5E5E5]" />
        <span className={step === "details" ? "text-[#F96302]" : "text-[#777777]"}>2. Service details</span>
      </div>

      {step === "contact" ? (
        <form onSubmit={goToDetails}>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <QuickField
              label="First name"
              value={form.firstName}
              onChange={(value) => update("firstName", value)}
              required
              autoComplete="given-name"
            />
            <QuickField
              label="Last name"
              value={form.lastName}
              onChange={(value) => update("lastName", value)}
              required
              autoComplete="family-name"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <QuickField
              label="Phone number"
              value={form.phone}
              onChange={(value) => update("phone", formatPhone(value))}
              required
              type="tel"
              autoComplete="tel"
              placeholder="(510) 555-0123"
            />
            <QuickField
              label="Email"
              value={form.email}
              onChange={(value) => update("email", value)}
              required
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <Message error={error} />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#F96302] px-6 py-4 text-sm font-bold text-white transition-all hover:bg-[#d95400]"
            >
              Continue
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <a
              href={`tel:${siteSettings.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 text-sm font-bold text-black hover:text-[#F96302]"
            >
              <Phone className="h-4 w-4 text-[#F96302]" aria-hidden="true" />
              {siteSettings.phone}
            </a>
          </div>
        </form>
      ) : (
        <form onSubmit={submitLead}>
          <div className="mt-6">
            <p className="text-base font-semibold text-black">Service location</p>
            <p className="mt-1 text-sm leading-relaxed text-[#666666]">
              Optional, but helpful. You can skip this and we will confirm it on the call.
            </p>
          </div>

          <div className="mt-4">
            <QuickField
              label="Street address (optional)"
              value={form.serviceAddress}
              onChange={(value) => update("serviceAddress", value)}
              autoComplete="street-address"
              placeholder="123 Main St"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <QuickField
              label="City (optional)"
              value={form.serviceCity}
              onChange={(value) => update("serviceCity", value)}
              autoComplete="address-level2"
              placeholder="Oakland"
            />
            <QuickField
              label="Service ZIP (optional)"
              value={form.serviceZip}
              onChange={(value) => update("serviceZip", value.replace(/\D/g, "").slice(0, 5))}
              type="text"
              autoComplete="postal-code"
              placeholder="94601"
            />
          </div>

          <div className="mt-4">
            <QuickField
              label="Quick description (optional)"
              value={form.briefDescription}
              onChange={(value) => update("briefDescription", value)}
              type="textarea"
              placeholder="Tell us what is happening."
            />
          </div>

          <div className="mt-4">
            <PhotoUploadField
              fileName={form.photo?.name}
              onChange={(file) => update("photo", file)}
              label="Add a photo"
              description="Take a photo or choose one from your library."
            />
          </div>

          <Message error={error} />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 bg-[#F96302] px-6 py-4 text-sm font-bold text-white transition-all hover:bg-[#d95400] disabled:cursor-not-allowed disabled:bg-[#cccccc]"
              >
                {submitting ? "Sending..." : "Submit request"}
                {!submitting && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => submitLead()}
                className="inline-flex items-center justify-center border border-black px-5 py-4 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Skip and submit
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("contact");
              }}
              className="text-sm font-bold text-[#555555] hover:text-black"
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Message({ error }: { error: string | null }) {
  return (
    <div aria-live="polite" className="mt-5">
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm leading-relaxed text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function QuickField({
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
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#555555]">
        {label}
        {required && <span className="ml-1 text-[#F96302]">*</span>}
      </span>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          maxLength={500}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-[#E5E5E5] bg-white px-4 py-3 text-base leading-relaxed text-black placeholder:text-[#999999] focus:border-[#F96302] focus:outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border-2 border-[#E5E5E5] bg-white px-4 py-3 text-base leading-relaxed text-black placeholder:text-[#999999] focus:border-[#F96302] focus:outline-none"
        />
      )}
    </label>
  );
}
