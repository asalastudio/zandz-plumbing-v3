import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import { siteSettings } from "@/content/site-settings";
import type { InvoiceDocumentData, InvoiceLineItem, PostalAddress } from "@/lib/invoices";

/**
 * Invoice PDF, modelled on Z and Z's ServiceTitan invoice #8641045.
 *
 * Structure is copied deliberately — customers have been receiving that layout
 * for years and it reads as professional. The one departure is colour: the
 * ServiceTitan template inherits a muted red, and this uses Hero Orange so the
 * document reads as Z and Z's own rather than as a ServiceTitan export.
 *
 * See _docs/os-buildout/invoice-document-spec.md for the full mapping.
 */

const ACCENT = "#F96302";
const INK = "#1A1A1A";
const HAIRLINE = "#CCCCCC";

// react-pdf hyphenates aggressively by default, which turned "repair/replacement"
// into "re-pair/replacement" and the column header into "EQUIP-MENT". The
// ServiceTitan reference never hyphenates, so words wrap whole instead.
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 56,
    paddingHorizontal: 46,
    fontSize: 8.8,
    lineHeight: 1.4,
    color: INK,
    fontFamily: "Helvetica",
  },

  // Header: logo left, company block right.
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  // The square faucet icon and the wide wordmark need different widths;
  // one value cannot serve both without looking wrong.
  logo: { width: 76 },
  logoWordmark: { width: 150 },
  company: { textAlign: "right", fontSize: 9, color: INK, lineHeight: 1.5 },

  // BILL TO
  blockLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  billTo: { marginTop: 20 },

  // Boxed INVOICE / INVOICE DATE, right aligned under a full-width rule.
  metaRule: { borderTopWidth: 1.5, borderTopColor: INK, marginTop: 16 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end" },
  metaCell: {
    borderWidth: 1,
    borderColor: INK,
    borderTopWidth: 0,
    paddingVertical: 7,
    paddingHorizontal: 14,
    minWidth: 132,
    alignItems: "center",
  },
  metaLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", letterSpacing: 0.6 },
  metaValueAccent: { fontSize: 9.5, color: ACCENT, marginTop: 2 },
  metaValue: { fontSize: 9.5, marginTop: 2 },

  docTitle: {
    textAlign: "center",
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 14,
  },

  // JOB ADDRESS left, terms right.
  band: { flexDirection: "row", justifyContent: "space-between" },
  bandLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  termRow: { flexDirection: "row", marginBottom: 2 },
  termLabel: { fontFamily: "Helvetica-Bold" },

  // Line-item table
  table: { marginTop: 20 },
  th: {
    flexDirection: "row",
    paddingBottom: 8,
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    letterSpacing: 1.1,
  },
  tableRule: { borderTopWidth: 0.75, borderTopColor: HAIRLINE },
  tr: { flexDirection: "row", paddingTop: 10, paddingBottom: 6 },

  colTask: { width: "13%", paddingRight: 6 },
  colDesc: { width: "47%", paddingRight: 14 },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "14%", textAlign: "right" },
  colTotal: { width: "14%", textAlign: "right" },

  bullet: { flexDirection: "row", paddingLeft: 8, marginTop: 2 },
  bulletDot: { width: 10 },

  // Totals
  totals: { marginTop: 6, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", marginBottom: 3 },
  totalLabel: {
    width: 130,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    paddingRight: 18,
  },
  totalValue: { width: 92, textAlign: "right" },
  balanceLabel: {
    width: 130,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    paddingRight: 18,
  },
  balanceValue: {
    width: 92,
    textAlign: "right",
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
  },

  // Footer as three separately-positioned fixed elements rather than one
  // absolute flex row — react-pdf drops a `fixed` View that also owns layout
  // for its children, but honours absolutely positioned Texts.
  footerRule: {
    position: "absolute",
    bottom: 44,
    left: 46,
    right: 46,
    borderTopWidth: 0.75,
    borderTopColor: HAIRLINE,
  },
  footerLeft: { position: "absolute", bottom: 30, left: 46, fontSize: 9 },
  // Anchored on both edges with the text right-aligned. Setting only `right`
  // gives the box auto width that runs off the page instead of ending at the
  // margin, which is why the page number rendered nowhere.
  footerRight: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingRight: 46,
    textAlign: "right",
    fontSize: 9,
  },
});

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AddressBlock({ address }: { address: PostalAddress }) {
  const cityLine = [address.city, address.state].filter(Boolean).join(", ");
  const lastLine = [cityLine, address.zip].filter(Boolean).join(" ");

  return (
    <View>
      {address.name ? <Text>{address.name}</Text> : null}
      {address.street ? <Text>{address.street}</Text> : null}
      {lastLine ? <Text>{`${lastLine} USA`}</Text> : null}
    </View>
  );
}

/**
 * Render a line description that may carry bullets.
 *
 * The pricebook stores scope of work as multiline text where bulleted steps
 * start with "-" or "•". Rendering those as literal hyphens in a PDF looks
 * like a data dump, so they become proper hanging bullets.
 */
function Description({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <View>
      {lines.map((line, i) => {
        const bullet = /^[-•*]\s+(.*)$/.exec(line);
        if (bullet) {
          return (
            <View key={i} style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={{ flex: 1 }}>{bullet[1]}</Text>
            </View>
          );
        }
        return (
          <Text key={i} style={i > 0 ? { marginTop: 3 } : undefined}>
            {line}
          </Text>
        );
      })}
    </View>
  );
}

export function InvoiceDocument({
  data,
  logoDataUri,
  logoIsWordmark = false,
}: {
  data: InvoiceDocumentData;
  logoDataUri?: string;
  logoIsWordmark?: boolean;
}) {
  const { invoice, billTo, jobAddress, jobStatus, completedOn } = data;
  const items: InvoiceLineItem[] = invoice.line_items ?? [];

  const subtotal = items.reduce((s, i) => s + (i.total_cents ?? 0), 0) || invoice.amount_cents;
  // Tax is always zero for Z and Z today. The row stays for format fidelity —
  // customers expect to see it, and its absence reads as an omission.
  const tax = 0;
  const contract = subtotal + tax;
  const balance = invoice.paid_at ? 0 : contract;

  const invoiceNo = `${invoice.id}`;

  return (
    <Document
      title={`Invoice ${invoiceNo}`}
      author={siteSettings.legalName}
      subject={data.serviceLabel ?? "Plumbing services"}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {logoDataUri ? (
            // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an HTML img
            <Image src={logoDataUri} style={logoIsWordmark ? styles.logoWordmark : styles.logo} />
          ) : (
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 16 }}>
              {siteSettings.name}
            </Text>
          )}
          <View style={styles.company}>
            <Text>{`${siteSettings.legalName} Inc.`}</Text>
            <Text>
              {`${siteSettings.address.street}, ${siteSettings.address.city}, ${siteSettings.address.state} ${siteSettings.address.zip} United States`}
            </Text>
            <Text>{siteSettings.phone}</Text>
          </View>
        </View>

        <View style={styles.billTo}>
          <Text style={styles.blockLabel}>BILL TO</Text>
          <AddressBlock address={billTo} />
        </View>

        <View style={styles.metaRule} />
        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>INVOICE</Text>
            <Text style={styles.metaValueAccent}>{invoiceNo}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>INVOICE DATE</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.created_at)}</Text>
          </View>
        </View>

        <Text style={styles.docTitle}>Invoice</Text>

        <View style={styles.band}>
          <View>
            <Text style={styles.bandLabel}>JOB ADDRESS</Text>
            <AddressBlock address={jobAddress} />
          </View>
          <View>
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Completed Date: </Text>
              <Text>{formatDate(completedOn)}</Text>
            </View>
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Payment Term: </Text>
              <Text>Due Upon Receipt</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.th}>
            <Text style={styles.colTask}>TASK</Text>
            <Text style={styles.colDesc}>DESCRIPTION OF MATERIALS AND EQUIPMENT</Text>
            <Text style={styles.colQty}>QTY</Text>
            <Text style={styles.colPrice}>PRICE</Text>
            <Text style={styles.colTotal}>TOTAL</Text>
          </View>
          <View style={styles.tableRule} />

          {items.map((item, i) => (
            // Deliberately wrappable. A full scope of work runs longer than the
            // space left on page one, and wrap={false} bumped the entire row to
            // the next page, leaving the first one blank below the header.
            <View key={i} style={styles.tr}>
              <Text style={styles.colTask}>Service</Text>
              <View style={styles.colDesc}>
                <Description text={item.description ?? ""} />
                {i === items.length - 1 && jobStatus ? (
                  <Text style={{ marginTop: 6 }}>{`Status of work: ${statusLabel(jobStatus)}`}</Text>
                ) : null}
              </View>
              <Text style={styles.colQty}>{(item.quantity ?? 1).toFixed(2)}</Text>
              <Text style={styles.colPrice}>{money(item.unit_price_cents ?? 0)}</Text>
              <Text style={styles.colTotal}>{money(item.total_cents ?? 0)}</Text>
            </View>
          ))}

          <View style={styles.tableRule} />
        </View>

        {/* Never orphan the totals onto a page of their own — an invoice whose
            second page is nothing but "BALANCE DUE" looks broken. */}
        <View style={styles.totals} wrap={false}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SUB-TOTAL</Text>
            <Text style={styles.totalValue}>{money(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TAX</Text>
            <Text style={styles.totalValue}>{money(tax)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 6 }]}>
            <Text style={styles.totalLabel}>CONTRACT PRICE</Text>
            <Text style={styles.totalValue}>{money(contract)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 6 }]}>
            <Text style={styles.balanceLabel}>BALANCE DUE</Text>
            <Text style={styles.balanceValue}>{money(balance)}</Text>
          </View>
        </View>

        <View style={styles.footerRule} fixed />
        <Text style={styles.footerLeft} fixed>{`Invoice #${invoiceNo}`}</Text>
        <Text
          style={styles.footerRight}
          fixed
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );
}

function statusLabel(status: string): string {
  if (status === "complete" || status === "invoiced" || status === "paid") return "Complete";
  if (status === "on_site") return "In progress";
  return status.replace(/_/g, " ");
}

export async function renderInvoicePdf(
  data: InvoiceDocumentData,
  logoDataUri?: string,
  logoIsWordmark?: boolean
): Promise<Buffer> {
  return renderToBuffer(
    <InvoiceDocument data={data} logoDataUri={logoDataUri} logoIsWordmark={logoIsWordmark} />
  );
}
