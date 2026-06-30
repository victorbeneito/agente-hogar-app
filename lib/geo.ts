// Geolocalización por IP usando ipapi.co (gratuito, sin API key)

export interface GeoInfo {
  country: string | null;
  countryCode: string | null;
  city: string | null;
}

export async function lookupGeo(ip: string): Promise<GeoInfo> {
  // IPs locales/privadas: no se puede geolocalizar (entorno de desarrollo)
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { country: null, countryCode: null, city: null };
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
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

// Convierte un código de país (ES, FR, US...) en su emoji de bandera
export function countryCodeToFlag(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

// Extrae la IP real del visitante a partir de las cabeceras de la petición
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  return "127.0.0.1";
}
