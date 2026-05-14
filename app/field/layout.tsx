import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Field Mode · Z and Z OS",
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

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HIDE_MARKETING_CHROME_CSS }} />
      {children}
    </>
  );
}
