// Geolocalización: primero cabeceras Vercel (sin rate limits), luego ipapi.co como fallback

export interface GeoInfo {
  country: string | null;
  countryCode: string | null;
  city: string | null;
}

const COUNTRY_NAMES: Record<string, string> = {
  ES: "España", MX: "México", AR: "Argentina", CO: "Colombia", CL: "Chile",
  PE: "Perú", VE: "Venezuela", EC: "Ecuador", BO: "Bolivia", UY: "Uruguay",
  PY: "Paraguay", CR: "Costa Rica", PA: "Panamá", DO: "República Dominicana",
  GT: "Guatemala", HN: "Honduras", SV: "El Salvador", NI: "Nicaragua",
  CU: "Cuba", PR: "Puerto Rico", US: "Estados Unidos", GB: "Reino Unido",
  FR: "Francia", DE: "Alemania", IT: "Italia", PT: "Portugal", NL: "Países Bajos",
  BE: "Bélgica", CH: "Suiza", AT: "Austria", PL: "Polonia", RO: "Rumanía",
  SE: "Suecia", NO: "Noruega", DK: "Dinamarca", FI: "Finlandia", IE: "Irlanda",
  CA: "Canadá", AU: "Australia", NZ: "Nueva Zelanda", JP: "Japón", CN: "China",
  IN: "India", BR: "Brasil", ZA: "Sudáfrica", MA: "Marruecos",
};

// Extrae geo de las cabeceras que Vercel inyecta en producción (sin API externa)
export function lookupGeoFromVercelHeaders(headers: Headers): GeoInfo | null {
  const countryCode = headers.get("x-vercel-ip-country");
  if (!countryCode || countryCode.length !== 2) return null;

  const rawCity = headers.get("x-vercel-ip-city");
  const city = rawCity ? decodeURIComponent(rawCity) : null;

  return {
    country: COUNTRY_NAMES[countryCode.toUpperCase()] ?? countryCode,
    countryCode: countryCode.toUpperCase(),
    city,
  };
}

// Fallback: ipapi.co (para desarrollo local donde no hay cabeceras Vercel)
export async function lookupGeoByIp(ip: string): Promise<GeoInfo> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { country: null, countryCode: null, city: null };
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { country: null, countryCode: null, city: null };

    const data = await res.json();
    if (data.error) return { country: null, countryCode: null, city: null };

    return {
      country: data.country_name ?? null,
      countryCode: data.country_code ?? null,
      city: data.city ?? null,
    };
  } catch {
    return { country: null, countryCode: null, city: null };
  }
}

// Función principal: Vercel headers primero, ipapi.co como fallback
export async function lookupGeo(ip: string, headers?: Headers): Promise<GeoInfo> {
  if (headers) {
    const vercelGeo = lookupGeoFromVercelHeaders(headers);
    if (vercelGeo) return vercelGeo;
  }
  return lookupGeoByIp(ip);
}

export function countryCodeToFlag(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0))
  );
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "127.0.0.1";
}
