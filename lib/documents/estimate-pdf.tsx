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
import type { EstimateDocumentData } from "@/lib/estimates";
import type { InvoiceLineItem, PostalAddress } from "@/lib/invoices";

/**
 * Estimate PDF, modelled on Z and Z's ServiceTitan estimate #8642965.
 *
 * Shares the invoice's structure and Hero Orange accent, with the differences
 * the reference shows: a company block, an ESTIMATE box, the job number, and a
 * final Customer Authorization page. The authorization language is reproduced
 * from the reference estimate, which frames the document as an estimate and not
 * a contract.
 *
 * See _docs/os-buildout/invoice-document-spec.md.
 */

const ACCENT = "#F96302";
const INK = "#1A1A1A";
const HAIRLINE = "#CCCCCC";

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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { width: 76 },
  logoWordmark: { width: 150 },
  company: { textAlign: "right", fontSize: 9, color: INK, lineHeight: 1.5 },

  blockLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  billTo: { marginTop: 20 },

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

  band: { flexDirection: "row", justifyContent: "space-between" },
  bandLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", letterSpacing: 1.1, marginBottom: 4 },
  termRow: { flexDirection: "row", marginBottom: 2 },
  termLabel: { fontFamily: "Helvetica-Bold" },

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
  grandLabel: {
    width: 130,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    paddingRight: 18,
  },
  grandValue: { width: 92, textAlign: "right", color: ACCENT, fontFamily: "Helvetica-Bold" },

  // Authorization page
  authHeading: {
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  authPara: { fontSize: 9, lineHeight: 1.6, marginBottom: 26 },
  signRow: { marginTop: 30 },
  signLabel: { fontSize: 9, color: "#888888", marginBottom: 26 },
  signRule: { borderTopWidth: 0.75, borderTopColor: INK, width: "70%" },

  footerRule: {
    position: "absolute",
    bottom: 44,
    left: 46,
    right: 46,
    borderTopWidth: 0.75,
    borderTopColor: HAIRLINE,
  },
  footerLeft: { position: "absolute", bottom: 30, left: 46, fontSize: 9 },
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

// Reproduced from the reference estimate's authorization page. It deliberately
// frames the document as an estimate and not a contract for services.
const AUTHORIZATION = `THIS IS AN ESTIMATE, NOT A CONTRACT FOR SERVICES. The summary above is furnished by ${siteSettings.legalName} Inc. as a good faith estimate of work to be performed at the location described above and is based on our evaluation and does not include material price increases or additional labor and materials which may be required should unforeseen problems arise after the work has started. I understand that the final cost of the work may differ from the estimate, perhaps materially. THIS IS NOT A GUARANTEE OF THE FINAL PRICE OF WORK TO BE PERFORMED. I agree and authorize the work as summarized on these estimated terms, and I agree to pay the full amount for all work performed.`;

export function EstimateDocument({
  data,
  logoDataUri,
  logoIsWordmark = false,
}: {
  data: EstimateDocumentData;
  logoDataUri?: string;
  logoIsWordmark?: boolean;
}) {
  const { estimate, billTo, jobAddress, jobNumber } = data;
  const items: InvoiceLineItem[] = estimate.line_items ?? [];
  const total = items.reduce((s, i) => s + (i.total_cents ?? 0), 0) || estimate.amount_cents;
  const estimateNo = `${estimate.id}`;

  return (
    <Document title={`Estimate ${estimateNo}`} author={siteSettings.legalName}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {logoDataUri ? (
            // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image is a PDF primitive
            <Image src={logoDataUri} style={logoIsWordmark ? styles.logoWordmark : styles.logo} />
          ) : (
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 16 }}>{siteSettings.name}</Text>
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
            <Text style={styles.metaLabel}>ESTIMATE</Text>
            <Text style={styles.metaValueAccent}>{estimateNo}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>ESTIMATE DATE</Text>
            <Text style={styles.metaValue}>{formatDate(estimate.created_at)}</Text>
          </View>
        </View>

        <Text style={styles.docTitle}>Home Improvement Contract</Text>

        <View style={styles.band}>
          <View>
            <Text style={styles.bandLabel}>JOB ADDRESS</Text>
            <AddressBlock address={jobAddress} />
          </View>
          <View>
            {jobNumber ? (
              <View style={styles.termRow}>
                <Text style={styles.termLabel}>Job: </Text>
                <Text>{jobNumber}</Text>
              </View>
            ) : null}
            {estimate.valid_until ? (
              <View style={styles.termRow}>
                <Text style={styles.termLabel}>Valid until: </Text>
                <Text>{formatDate(estimate.valid_until)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.th}>
            <Text style={styles.colTask}>SERVICE</Text>
            <Text style={styles.colDesc}>DESCRIPTION</Text>
            <Text style={styles.colQty}>QTY</Text>
            <Text style={styles.colPrice}>PRICE</Text>
            <Text style={styles.colTotal}>TOTAL</Text>
          </View>
          <View style={styles.tableRule} />

          {items.map((item, i) => (
            <View key={i} style={styles.tr}>
              <Text style={styles.colTask}>Service</Text>
              <View style={styles.colDesc}>
                <Description text={item.description ?? ""} />
              </View>
              <Text style={styles.colQty}>{(item.quantity ?? 1).toFixed(2)}</Text>
              <Text style={styles.colPrice}>{money(item.unit_price_cents ?? 0)}</Text>
              <Text style={styles.colTotal}>{money(item.total_cents ?? 0)}</Text>
            </View>
          ))}
          <View style={styles.tableRule} />
        </View>

        <View style={styles.totals} wrap={false}>
          <View style={[styles.totalRow, { marginTop: 6 }]}>
            <Text style={styles.grandLabel}>ESTIMATE TOTAL</Text>
            <Text style={styles.grandValue}>{money(total)}</Text>
          </View>
        </View>

        <View style={styles.footerRule} fixed />
        <Text style={styles.footerLeft} fixed>{`Estimate #${estimateNo}`}</Text>
        <Text
          style={styles.footerRight}
          fixed
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>

      {/* Customer authorization + signature */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.authHeading}>CUSTOMER AUTHORIZATION</Text>
        <Text style={styles.authPara}>{AUTHORIZATION}</Text>

        {estimate.signed_at ? (
          <View style={styles.signRow}>
            <Text style={{ fontSize: 9 }}>
              {`Accepted by ${estimate.signed_name ?? "customer"} on ${formatDate(estimate.signed_at)}`}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.signRow}>
              <Text style={styles.signLabel}>Sign here</Text>
              <View style={styles.signRule} />
            </View>
            <View style={styles.signRow}>
              <Text style={styles.signLabel}>Date</Text>
              <View style={styles.signRule} />
            </View>
          </>
        )}

        <View style={styles.footerRule} fixed />
        <Text style={styles.footerLeft} fixed>{`Estimate #${estimateNo}`}</Text>
        <Text
          style={styles.footerRight}
          fixed
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );
}

export async function renderEstimatePdf(
  data: EstimateDocumentData,
  logoDataUri?: string,
  logoIsWordmark?: boolean
): Promise<Buffer> {
  return renderToBuffer(
    <EstimateDocument data={data} logoDataUri={logoDataUri} logoIsWordmark={logoIsWordmark} />
  );
}
