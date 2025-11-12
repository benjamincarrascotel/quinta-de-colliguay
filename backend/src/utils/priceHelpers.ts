// ============================================
// PRICE CALCULATIONS
// ============================================

export interface PriceBreakdown {
  adults: number;
  children: number;
  fullDays: number;
  halfDays: number;
  adultSubtotal: number;
  childSubtotal: number;
  total: number;
}

export const calculatePrice = (
  adults: number,
  children: number,
  fullDays: number,
  halfDays: number,
  adultPricePerDay: number,
  childPricePerDay: number
): PriceBreakdown => {
  const totalDays = fullDays + halfDays * 0.5;

  const adultSubtotal = Math.round(adults * adultPricePerDay * totalDays);
  const childSubtotal = Math.round(children * childPricePerDay * totalDays);
  const total = adultSubtotal + childSubtotal;

  return {
    adults,
    children,
    fullDays,
    halfDays,
    adultSubtotal,
    childSubtotal,
    total,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
