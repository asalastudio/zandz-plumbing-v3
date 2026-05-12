import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/Section";
import { siteSettings } from "@/content/site-settings";

const LAST_UPDATED = "May 12, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of zandzplumbing.com and the plumbing services provided by Z and Z Plumbing.",
  alternates: { canonical: `${siteSettings.siteUrl}/terms/` },
  openGraph: {
    title: "Terms of Service | Z and Z Plumbing",
    description: "Terms that govern use of zandzplumbing.com and our services.",
    url: `${siteSettings.siteUrl}/terms/`,
    type: "article",
  },
  robots: { index: true, follow: true },
};

const sections: { id: string; heading: string; body: React.ReactNode }[] = [
  {
    id: "about",
    heading: "About these terms",
    body: (
      <p>
        These terms apply to your use of zandzplumbing.com and to the plumbing services Z and Z Plumbing provides. By
        using the site or requesting service, you agree to these terms. If you do not agree, please do not use the
        site or request service.
      </p>
    ),
  },
  {
    id: "company",
    heading: "About the company",
    body: (
      <p>
        Z and Z Plumbing is a California-licensed plumbing contractor headquartered at {siteSettings.address.full}. We
        hold California State License Board number 896116, classifications C-36 Plumbing and A General Engineering. We
        have served the East Bay since {siteSettings.foundedYear}.
      </p>
    ),
  },
  {
    id: "services",
    heading: "Services we provide",
    body: (
      <p>
        We offer residential and commercial plumbing services across the East Bay, including drain cleaning, sewer
        lateral work, repipes, water heaters, leak detection, gas lines, faucet and toilet service, and 24/7 emergency
        response. The services available at any given time depend on crew availability and the requirements of the
        job.
      </p>
    ),
  },
  {
    id: "pricing",
    heading: "Estimates, quotes, and pricing",
    body: (
      <p>
        Estimates given over the phone, by email, or through the website are preliminary and based on the information
        you provide. Final pricing is set after on-site assessment, when our technician can confirm the scope of work,
        access conditions, and any code or permit requirements. We will discuss pricing with you and obtain your
        approval before starting paid work.
      </p>
    ),
  },
  {
    id: "scheduling",
    heading: "Scheduling, cancellations, and rescheduling",
    body: (
      <ul>
        <li>Appointments are confirmed by phone, SMS, or email at the time of booking.</li>
        <li>
          We ask that you let us know as soon as possible if you need to cancel or reschedule so we can offer the slot
          to another customer.
        </li>
        <li>
          For emergency calls, we will provide an estimated arrival window and update you if conditions change.
        </li>
      </ul>
    ),
  },
  {
    id: "payment",
    heading: "Payment",
    body: (
      <p>
        Payment is due upon completion of work unless we have agreed in writing to other terms. We accept the payment
        methods listed at the time of service. Past-due balances may accrue interest at the rate permitted under
        California law.
      </p>
    ),
  },
  {
    id: "warranties",
    heading: "Warranties and limitations",
    body: (
      <>
        <p>
          We stand behind our workmanship and will return to address any issue caused by our work for the period
          described on your invoice. Manufacturer warranties on parts and equipment are governed by the manufacturer.
        </p>
        <p>
          To the extent permitted by California law, our total liability for any claim related to our services is
          limited to the amount paid for the specific work in question. We are not liable for indirect, consequential,
          or incidental damages, including loss of income or property damage caused by conditions outside our control.
        </p>
      </>
    ),
  },
  {
    id: "permits",
    heading: "Permits and code compliance",
    body: (
      <p>
        When work requires a permit from the city, county, or local utility, we will discuss the requirement with you
        before starting. Permit fees and inspection costs are typically passed through at cost.
      </p>
    ),
  },
  {
    id: "your-role",
    heading: "Your responsibilities",
    body: (
      <ul>
        <li>Provide accurate information about the issue, the property, and access conditions.</li>
        <li>Ensure that an adult is available at the property during the appointment when required.</li>
        <li>Disclose any known hazards such as unmarked utilities, asbestos, or mold so we can plan safely.</li>
        <li>Move personal belongings away from the work area when reasonably possible.</li>
      </ul>
    ),
  },
  {
    id: "website",
    heading: "Website use",
    body: (
      <p>
        You may use zandzplumbing.com for personal and business purposes related to plumbing services. You agree not
        to misuse the site, attempt to access non-public areas, scrape content for republication, or interfere with
        its operation. The content, logos, and brand on the site belong to Z and Z Plumbing and may not be copied or
        reused without written permission.
      </p>
    ),
  },
  {
    id: "third-party",
    heading: "Third-party links",
    body: (
      <p>
        The site may link to third-party websites or services. We are not responsible for the content, accuracy, or
        practices of those third parties. Your use of any linked service is governed by the terms and privacy
        policies of that service.
      </p>
    ),
  },
  {
    id: "disputes",
    heading: "Disputes and governing law",
    body: (
      <p>
        These terms are governed by the laws of the State of California. Any dispute relating to these terms or our
        services will be brought in a state or federal court located in Alameda County, California, unless we agree
        in writing to another forum or to non-binding mediation first.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    body: (
      <p>
        We may update these terms from time to time. When we do, we will revise the &ldquo;last updated&rdquo; date at
        the top of the page. Continued use of the site or our services after a change means you accept the updated
        terms.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <p>
        Z and Z Plumbing
        <br />
        {siteSettings.address.full}
        <br />
        Phone: <a href={`tel:${siteSettings.phoneTel}`}>{siteSettings.phone}</a>
        <br />
        Email: <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <Section bg="white" size="lg" narrow>
      <SectionHeading
        eyebrow="Legal"
        title="Terms of Service"
        description={`The terms that govern your use of zandzplumbing.com and the services provided by Z and Z Plumbing. Last updated ${LAST_UPDATED}.`}
      />

      {/* Table of contents */}
      <nav aria-label="On this page" className="mb-12 rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">On this page</p>
        <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-lg font-semibold text-black underline decoration-[#E5E5E5] underline-offset-4 transition-colors duration-150 hover:text-[#F96302] hover:decoration-[#F96302]"
              >
                {s.heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sections */}
      <article
        className={[
          "font-sans text-lg leading-relaxed text-[#333333] md:text-xl",
          "[&_h2]:font-display [&_h2]:text-4xl [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-black [&_h2]:mt-16 [&_h2]:mb-5 md:[&_h2]:text-5xl",
          "[&_p]:mb-6",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2.5",
          "[&_li]:text-lg [&_li]:leading-relaxed md:[&_li]:text-xl",
          "[&_a]:text-[#F96302] [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-[#e05602]",
        ].join(" ")}
      >
        {sections.map((s) => (
          <section key={s.id} id={s.id}>
            <h2>{s.heading}</h2>
            {s.body}
          </section>
        ))}

        <p className="mt-12 text-base text-[#666666]">
          See also our{" "}
          <Link href="/privacy-policy/" className="font-bold text-[#F96302] underline">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
    </Section>
  );
}
