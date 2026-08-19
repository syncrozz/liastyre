import { Tire } from "../types/tyre";

/**
 * Returns the country of manufacture (e.g. CHINA, MALAYSIA, THAILAND, KOREA, JAPAN)
 */
export const getTireMadeIn = (tire: { brand?: string; madeIn?: string; countryOfOrigin?: string }): string => {
  if (tire.madeIn) return tire.madeIn.toUpperCase();
  if (tire.countryOfOrigin) return tire.countryOfOrigin.toUpperCase();
  
  const brand = (tire.brand || "").toUpperCase();
  if (
    brand.includes("AUTOGREEN") ||
    brand.includes("DURATURN") ||
    brand.includes("KINGBOSS") ||
    brand.includes("LANVIGATOR") ||
    brand.includes("ROVELO") ||
    brand.includes("ANCHEE") ||
    brand.includes("DURUN") ||
    brand.includes("GEPORMAX") ||
    brand.includes("AUSTONE") ||
    brand.includes("LINGLONG") ||
    brand.includes("SAILUN") ||
    brand.includes("COMPASAL") ||
    brand.includes("HILO") ||
    brand.includes("ZEETEX") ||
    brand.includes("DOUBLESTAR") ||
    brand.includes("APLUS") ||
    brand.includes("SUNFULL") ||
    brand.includes("HEADWAY") ||
    brand.includes("ROYAL BLACK")
  ) {
    return "CHINA";
  }

  if (brand.includes("MICHELIN")) return "THAILAND";
  if (brand.includes("GOODYEAR")) return "MALAYSIA";
  if (brand.includes("CONTINENTAL")) return "MALAYSIA";
  if (brand.includes("HANKOOK")) return "KOREA";
  if (brand.includes("NEXEN")) return "KOREA";
  if (brand.includes("TOYO")) return "MALAYSIA";
  if (brand.includes("BRIDGESTONE")) return "THAILAND";
  if (brand.includes("YOKOHAMA")) return "JAPAN";
  if (brand.includes("DUNLOP")) return "MALAYSIA";
  if (brand.includes("VIKING")) return "MALAYSIA";
  if (brand.includes("FALKEN")) return "THAILAND";
  if (brand.includes("KUMHO")) return "KOREA";
  if (brand.includes("MAXXIS")) return "TAIWAN";
  if (brand.includes("PIRELLI")) return "ITALY";

  return "CHINA";
};

/**
 * Returns formatted Made In and Year string, e.g. "CHINA 2026", "MALAYSIA 2026"
 */
export const getTireMadeInAndYear = (tire: { brand?: string; year?: number; madeIn?: string; countryOfOrigin?: string }): string => {
  const country = getTireMadeIn(tire);
  const year = tire.year || 2026;
  return `${country} ${year}`;
};

/**
 * Returns flag emoji for country
 */
export const getTireCountryFlag = (country: string): string => {
  const c = country.toUpperCase();
  if (c.includes("CHINA")) return "🇨🇳";
  if (c.includes("MALAYSIA")) return "🇲🇾";
  if (c.includes("THAILAND")) return "🇹🇭";
  if (c.includes("JAPAN")) return "🇯🇵";
  if (c.includes("KOREA")) return "🇰🇷";
  if (c.includes("GERMANY") || c.includes("JERMAN")) return "🇩🇪";
  if (c.includes("FRANCE") || c.includes("PERANCIS")) return "🇫🇷";
  if (c.includes("TAIWAN")) return "🇹🇼";
  if (c.includes("INDONESIA")) return "🇮🇩";
  if (c.includes("ITALY") || c.includes("ITALI")) return "🇮🇹";
  if (c.includes("USA") || c.includes("AMERIKA")) return "🇺🇸";
  return "🌐";
};
