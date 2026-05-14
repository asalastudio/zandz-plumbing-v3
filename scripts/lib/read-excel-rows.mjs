import readExcelFile from "read-excel-file/node";

const EXCEL_EPOCH_1900 = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeHeader(value) {
  return value == null ? "" : value.toString().trim();
}

function rowIsEmpty(row) {
  return row.every((value) => value == null || value === "");
}

export async function readExcelRows(filePath, preferredSheetName) {
  const sheets = await readExcelFile(filePath);
  const selected =
    (preferredSheetName && sheets.find(({ sheet }) => sheet === preferredSheetName)) ?? sheets[0];

  if (!selected) {
    return { sheetName: "", rows: [] };
  }

  const [headerRow = [], ...dataRows] = selected.data;
  const headers = headerRow.map(normalizeHeader);
  const rows = dataRows
    .filter((row) => !rowIsEmpty(row))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        if (header) record[header] = row[index] ?? null;
      });
      return record;
    });

  return { sheetName: selected.sheet, rows };
}

export function excelSerialDateToIso(value) {
  if (!Number.isFinite(value) || value <= 0) return null;
  return new Date(EXCEL_EPOCH_1900 + Math.round(value * MS_PER_DAY)).toISOString();
}
