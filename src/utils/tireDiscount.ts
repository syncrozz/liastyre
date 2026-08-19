import { Tire } from "../types/tyre";

export interface TirePriceDetails {
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  savings: number;
  discountLabel: string;
}

export function getTirePriceDetails(tire: Tire): TirePriceDetails {
  const originalPrice =
    tire.originalPrice && tire.originalPrice > 0
      ? tire.originalPrice
      : tire.marketPrice;

  let discountPercent = tire.discountPercent || 0;
  let finalPrice = tire.marketPrice;
  let hasDiscount = Boolean(
    tire.isDiscounted ||
      discountPercent > 0 ||
      (tire.discountPrice && tire.discountPrice > 0 && tire.discountPrice < originalPrice)
  );

  if (discountPercent > 0) {
    hasDiscount = true;
    finalPrice = Math.round(originalPrice * (1 - discountPercent / 100));
  } else if (tire.discountPrice && tire.discountPrice > 0 && tire.discountPrice < originalPrice) {
    hasDiscount = true;
    finalPrice = tire.discountPrice;
    discountPercent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  } else if (tire.isDiscounted) {
    hasDiscount = true;
    discountPercent = 10;
    finalPrice = Math.round(originalPrice * 0.9);
  } else {
    hasDiscount = false;
    finalPrice = originalPrice;
    discountPercent = 0;
  }

  const savings = Math.max(0, originalPrice - finalPrice);
  const discountLabel =
    tire.discountLabel || (hasDiscount ? `Diskaun ${discountPercent}%` : "");

  return {
    originalPrice,
    finalPrice,
    hasDiscount,
    discountPercent,
    savings,
    discountLabel,
  };
}
