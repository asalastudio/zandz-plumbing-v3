import Link from "next/link";
import { Phone, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { siteSettings } from "@/content/site-settings";

const serviceLinks = [
  { label: "Sewer & Drain Services", href: "/services/sewer-lateral/" },
  { label: "Water & Gas Lines", href: "/services/water-heater/" },
  { label: "Emergency Plumbing", href: "/services/emergency/" },
  { label: "Repipe", href: "/services/repipe/" },
  { label: "Drain Cleaning", href: "/services/drain-cleaning/" },
  { label: "Hydrojetting", href: "/services/hydrojetting/" },
  { label: "Trenchless Solutions", href: "/services/sewer-lateral/" },
  { label: "View All Services", href: "/services/" },
];

const areaLinks = [
  { label: "Oakland", href: "/plumber-oakland-ca/" },
  { label: "Berkeley", href: "/plumber-berkeley-ca/" },
  { label: "San Leandro", href: "/plumber-san-leandro-ca/" },
  { label: "Alameda", href: "/plumber-alameda-ca/" },
  { label: "Hayward", href: "/plumber-hayward-ca/" },
  { label: "Union City", href: "/plumber-hayward-ca/" },
  { label: "Castro Valley", href: "/plumber-castro-valley-ca/" },
  { label: "See All Areas", href: "/service-areas/" },
];

const aboutLinks = [
  { label: "About Us", href: "/about/" },
  { label: "Why Choose Us", href: "/about/" },
  { label: "Our Team", href: "/about/" },
  { label: "Projects", href: "/reviews/" },
  { label: "Reviews", href: "/reviews/" },
  { label: "Careers", href: "/contact/" },
];

export function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Logo variant="light" className="mb-6" />
            <p className="text-sm text-white/60 font-semibold uppercase tracking-wide mb-4">
              The Pros Other Plumbers Call
            </p>
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-[#F96302] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href={`tel:${siteSettings.phoneTel}`}
                  className="text-[#F96302] hover:underline font-medium"
                >
                  {siteSettings.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <address className="not-italic">
                  {siteSettings.address.street}
                  <br />
                  {siteSettings.address.city}, {siteSettings.address.state}{" "}
                  {siteSettings.address.zip}
                </address>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Mon-Fri 7:00 AM - 5:00 PM<br />24/7 Emergency Service</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-4 mt-6">
              {siteSettings.social.facebook && (
                <a
                  href={siteSettings.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Z and Z Plumbing on Facebook"
                  className="text-white/40 hover:text-[#F96302] transition-colors"
                >
                  <Facebook className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
              {siteSettings.social.instagram && (
                <a
                  href={siteSettings.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Z and Z Plumbing on Instagram"
                  className="text-white/40 hover:text-[#F96302] transition-colors"
                >
                  <Instagram className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#F96302] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service area */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              Served Area
            </h3>
            <ul className="space-y-2">
              {areaLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#F96302] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About + CTA */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              About
            </h3>
            <ul className="space-y-2 mb-8">
              {aboutLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#F96302] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href="/contact/#schedule"
              className="inline-flex items-center justify-center w-full bg-[#F96302] text-white py-3 px-6 text-sm font-bold uppercase tracking-wide rounded-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
            >
              Schedule Online
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-white/40">
            {siteSettings.cslb} &mdash; C-36 Plumbing and A General Engineering. Serving the East Bay since 2003.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            <Link href="/privacy-policy/" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms/" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>&copy; {new Date().getFullYear()} Z and Z Plumbing. All rights reserved.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
