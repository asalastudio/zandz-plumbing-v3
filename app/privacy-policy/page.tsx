import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/Section";
import { siteSettings } from "@/content/site-settings";

const LAST_UPDATED = "May 12, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Z and Z Plumbing collects, uses, and protects information when you contact us or use zandzplumbing.com.",
  alternates: { canonical: `${siteSettings.siteUrl}/privacy-policy/` },
  openGraph: {
    title: "Privacy Policy | Z and Z Plumbing",
    description: "How we collect, use, and protect your information.",
    url: `${siteSettings.siteUrl}/privacy-policy/`,
    type: "article",
  },
  robots: { index: true, follow: true },
};

const sections: { id: string; heading: string; body: React.ReactNode }[] = [
  {
    id: "about",
    heading: "About this policy",
    body: (
      <p>
        Z and Z Plumbing, a California-licensed plumbing contractor under CSLB number 896116, operates this website and
        provides plumbing services across the East Bay. This policy explains what information we collect when you
        contact us or use zandzplumbing.com, what we do with it, and the choices you have.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    heading: "Information we collect",
    body: (
      <>
        <p>
          When you contact us by phone, by web form, or during a service visit, we may collect:
        </p>
        <ul>
          <li>Your name, phone number, email address, and service address</li>
          <li>A description of the plumbing issue or service you are requesting</li>
          <li>Preferred callback time and any access notes you share with us</li>
          <li>Payment information collected at the time of service by our field-service system</li>
        </ul>
        <p>
          When you visit zandzplumbing.com, our hosting provider and analytics tools collect standard log data such as
          browser type, device, referring URL, pages viewed, approximate location, and timestamps.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    heading: "How we use that information",
    body: (
      <ul>
        <li>To schedule, dispatch, and complete plumbing service</li>
        <li>To respond to your questions and provide quotes and follow-up communication</li>
        <li>To send service-related messages, such as appointment confirmations and post-job review requests</li>
        <li>To improve the website and understand how visitors use it</li>
        <li>To comply with legal, tax, and contractor-licensing requirements in California</li>
      </ul>
    ),
  },
  {
    id: "providers",
    heading: "Tools and service providers",
    body: (
      <>
        <p>
          We use a small set of standard business tools to operate. Each one receives only the information it needs:
        </p>
        <ul>
          <li>Customer relationship management for lead intake and contact records</li>
          <li>Field-service management for dispatch, invoicing, and post-job communication</li>
          <li>Website hosting and analytics for the public site</li>
          <li>Phone and SMS providers for inbound and outbound calls and messages</li>
        </ul>
        <p>
          These providers process information on our behalf and are contractually limited to that purpose. We do not
          sell personal information.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and analytics",
    body: (
      <p>
        The website uses cookies and similar technologies to remember preferences and to measure traffic. You can
        control or block these in your browser settings. Blocking analytics cookies will not affect your ability to use
        the site or to schedule service.
      </p>
    ),
  },
  {
    id: "your-choices",
    heading: "Your choices",
    body: (
      <>
        <p>
          You can ask us to access, correct, or delete the personal information we hold about you by emailing{" "}
          <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a> or calling{" "}
          <a href={`tel:${siteSettings.phoneTel}`}>{siteSettings.phone}</a>. We will respond within a reasonable time
          and may need to verify your identity before acting on a request.
        </p>
        <p>
          California residents have additional rights under the California Consumer Privacy Act, including the right to
          know what categories of personal information we have collected, the right to request deletion, and the right
          not to be discriminated against for exercising these rights.
        </p>
      </>
    ),
  },
  {
    id: "children",
    heading: "Children",
    body: (
      <p>
        The website is intended for adults. We do not knowingly collect personal information from anyone under 13. If
        you believe a child has provided us with personal information, please contact us so we can remove it.
      </p>
    ),
  },
  {
    id: "security",
    heading: "Security",
    body: (
      <p>
        We use reasonable administrative and technical safeguards to protect personal information. No system is
        perfectly secure, and we cannot guarantee that information transmitted over the internet will be free from
        unauthorized access.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy from time to time. When we do, we will revise the &ldquo;last updated&rdquo; date at
        the top of the page. Material changes will be announced on the homepage for a reasonable period.
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

export default function PrivacyPolicyPage() {
  return (
    <Section bg="white" size="lg" narrow>
      <SectionHeading
        eyebrow="Legal"
        title="Privacy Policy"
        description={`How Z and Z Plumbing collects, uses, and protects information when you contact us or use zandzplumbing.com. Last updated ${LAST_UPDATED}.`}
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
          <Link href="/terms/" className="font-bold text-[#F96302] underline">
            Terms of Service
          </Link>
          .
        </p>
      </article>
    </Section>
  );
}
