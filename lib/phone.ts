export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidNanp10Digits(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length !== 10) return false;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return false;
  return !/^(\d)\1{9}$/.test(digits);
}

/** Human-friendly US phone display: "+15107084237" → "(510) 708-4237". */
export function formatPhone(value: string): string {
  const digits = digitsOnly(value);
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return value;
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

export function normalizeNanpToE164(value: string): string | null {
  const digits = digitsOnly(value);

  if (digits.length === 10 && isValidNanp10Digits(digits)) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    const nationalNumber = digits.slice(1);
    if (isValidNanp10Digits(nationalNumber)) {
      return `+${digits}`;
    }
  }

  return null;
}
