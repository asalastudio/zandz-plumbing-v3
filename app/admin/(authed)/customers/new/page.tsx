import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "New Customer · Z and Z OS" };

export default function NewCustomerPage() {
  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/customers"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60 hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to customers
      </Link>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">New customer</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Add Customer
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/70">
          Manually create a customer record. Booking-form submissions create these automatically.
        </p>
      </header>

      <form
        action="/api/admin/customers"
        method="POST"
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <Field label="Full name *" name="name" required />
        <Field label="Phone (E.164 e.g. +15105551234)" name="phone_e164" type="tel" />
        <Field label="Email" name="email" type="email" />
        <Field label="HubSpot contact ID (optional)" name="hubspot_contact_id" />
        <Field label="Street address" name="street_address" full />
        <Field label="City" name="city" defaultValue="Oakland" />
        <Field label="ZIP" name="zip" />
        <Field label="Neighborhood" name="neighborhood" />
        <Field label="State" name="state" defaultValue="CA" />
        <div className="md:col-span-2">
          <label className="block text-sm font-bold uppercase tracking-[0.12em] text-white/60 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            rows={4}
            className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
          />
        </div>
        <div className="md:col-span-2 flex justify-end gap-3">
          <Link
            href="/admin/customers"
            className="inline-flex items-center bg-transparent border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-[#F96302] hover:text-[#F96302]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
          >
            Save customer
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = false,
  full = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-bold uppercase tracking-[0.12em] text-white/60 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
      />
    </div>
  );
}
