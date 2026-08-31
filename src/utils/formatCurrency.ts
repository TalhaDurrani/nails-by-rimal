/**
 * Format a number as Pakistani rupees by default.
 * @param amount - The amount to format
 * @param currency - The ISO currency code, defaults to PKR.
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'PKR'): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
  }).format(amount);
}
