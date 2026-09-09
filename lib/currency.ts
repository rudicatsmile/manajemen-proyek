/**
 * Utilitas pemformatan mata uang Rupiah (IDR)
 */

/**
 * Format angka ke format Rupiah Indonesia, contoh: Rp 25.000.000
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") {
    return "Rp 0";
  }

  const numericValue = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;

  if (isNaN(numericValue)) {
    return "Rp 0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

/**
 * Format angka menjadi format ribuan dengan pemisah titik (tanpa prefix Rp), contoh: 25.000.000
 */
export function formatNumberWithDots(value: number | string): string {
  const cleanNumber = typeof value === "string" ? value.replace(/\D/g, "") : Math.floor(value).toString();
  if (!cleanNumber) return "";
  return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse string Rupiah/angka berpemisah titik kembali menjadi nilai murni integer/number
 */
export function parseRupiahInput(value: string | number): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleanNumber = value.replace(/\D/g, "");
  return cleanNumber ? parseInt(cleanNumber, 10) : 0;
}
