export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidNanp10Digits(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length !== 10) return false;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return false;
  return !/^(\d)\1{9}$/.test(digits);
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
