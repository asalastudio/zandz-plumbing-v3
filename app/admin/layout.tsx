import type { Metadata } from "next";

/**
 * Bare admin shell.
 *
 * Hides the marketing site's Header, Footer, and StickyMobileCTA. those
 * live in the root layout and would otherwise render on every /admin/* page.
 * Admin pages live in /admin/(authed) (route group) with their own chrome.
 *
 * The (authed) layout enforces login. /admin/login does NOT use the (authed)
 * layout, so it renders without an auth check.
 */

export const metadata: Metadata = {
  title: "Z and Z OS · Admin",
  robots: { index: false, follow: false },
};

const HIDE_MARKETING_CHROME_CSS = `
  body > header[data-marketing="true"],
  body > footer[data-marketing="true"],
  body > [data-marketing="true"] {
    display: none !important;
  }
  body > main {
    padding: 0 !important;
  }
`;

export default function AdminBareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HIDE_MARKETING_CHROME_CSS }} />
      {children}
    </>
  );
}
