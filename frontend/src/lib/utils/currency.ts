/**
 * Format amount in Nigerian Naira
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Calculate Paystack fee (1.5% + ₦100)
 */
export function calculatePaystackFee(amount: number): number {
  return (amount * 0.015) + 100
}

/**
 * Calculate amount after Paystack fee deduction
 */
export function calculateAmountAfterFee(amount: number): number {
  return amount - calculatePaystackFee(amount)
}

/**
 * Parse Naira string to number
 */
export function parseNaira(nairaString: string): number {
  return parseFloat(nairaString.replace(/[₦,\s]/g, ''))
}
