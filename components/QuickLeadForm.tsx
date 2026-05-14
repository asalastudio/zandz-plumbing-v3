"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { siteSettings } from "@/content/site-settings";

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
  briefDescription: string;
}

const initialState: QuickLeadFormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  briefDescription: "",
};

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
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof QuickLeadFormState>(key: K, value: QuickLeadFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
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
          phone: form.phone,
          email: form.email.trim(),
          zip: zip?.trim() || undefined,
          serviceInterest,
          serviceLabel,
          briefDescription: form.briefDescription.trim() || undefined,
          smsConsent: false,
          outOfArea: false,
          serviceAreaSlug,
          sourcePage:
            sourcePage ??
            (typeof window !== "undefined" ? window.location.pathname : undefined),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "We could not save that request. Please call us directly.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network hiccup. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
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
            <a
              href={`tel:${siteSettings.phoneTel}`}
              className="mt-5 inline-flex items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#1a1a1a]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call now
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-xl md:p-7", className)}
    >
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

      <div className="mt-4">
        <QuickField
          label="Quick description (optional)"
          value={form.briefDescription}
          onChange={(value) => update("briefDescription", value)}
          type="textarea"
          placeholder="Tell us what is happening."
        />
      </div>

      <div aria-live="polite" className="mt-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm leading-relaxed text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 bg-[#F96302] px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition-all hover:bg-[#d95400] disabled:cursor-not-allowed disabled:bg-[#cccccc]"
        >
          {submitting ? "Sending..." : "Request a Call Back"}
          {!submitting && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
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
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-[#666666]">
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
