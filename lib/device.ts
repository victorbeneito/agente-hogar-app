// Detección sencilla de tipo de dispositivo y navegador a partir del User-Agent

export interface DeviceInfo {
  device: "mobile" | "desktop" | "tablet";
  browser: string;
}

export function parseUserAgent(userAgent: string | null): DeviceInfo {
  const ua = userAgent ?? "";

  let device: DeviceInfo["device"] = "desktop";
  if (/iPad|Tablet/i.test(ua)) {
    device = "tablet";
  } else if (/Mobi|Android|iPhone/i.test(ua)) {
    device = "mobile";
  }

  let browser = "Desconocido";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/OPR\//i.test(ua)) browser = "Opera";

  return { device, browser };
}
