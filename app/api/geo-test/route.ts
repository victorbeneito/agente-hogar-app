import { NextRequest, NextResponse } from "next/server";
import { getClientIp, lookupGeo } from "@/lib/geo";

// Endpoint de diagnóstico: muestra exactamente qué cabeceras geo recibe Vercel.
// Visitar: https://agente.elhogardetusuenos.com/api/geo-test
export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const geo = await lookupGeo(ip, request.headers);

  const vercelHeaders = {
    "x-vercel-ip-country": request.headers.get("x-vercel-ip-country"),
    "x-vercel-ip-country-region": request.headers.get("x-vercel-ip-country-region"),
    "x-vercel-ip-city": request.headers.get("x-vercel-ip-city"),
    "x-vercel-ip-latitude": request.headers.get("x-vercel-ip-latitude"),
    "x-vercel-ip-longitude": request.headers.get("x-vercel-ip-longitude"),
    "x-forwarded-for": request.headers.get("x-forwarded-for"),
    "x-real-ip": request.headers.get("x-real-ip"),
  };

  return NextResponse.json({
    ip,
    geo,
    vercel_headers: vercelHeaders,
  });
}
