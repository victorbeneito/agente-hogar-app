// Cálculo determinista de la talla base y precio orientativo de un estor digital a medida.
// Regla de https://elhogardetusuenos.com/medidas-personalizadas:
//   - largo ≤ 180 → talla de largo 180 · largo 181-250 → talla de largo 250 (el proveedor lo acorta)
//   - ancho redondeado hacia arriba al múltiplo de 5
//   - ancho < 80, ancho > 200 o largo > 250 → fuera de rango, hay que consultar al equipo
// Precios PVP (iguales en Blindecor y Happystor), de knowledge/tarifas_estores.md.

const URL_MEDIDAS = "https://elhogardetusuenos.com/medidas-personalizadas";

// Precio por ancho (los anchos van por parejas: 85 y 90 cuestan lo mismo, etc.)
const PRECIOS: Record<180 | 250, Record<number, number>> = {
  180: {
    80: 60.65, 85: 65.45, 90: 65.45, 95: 70.21, 100: 70.21, 105: 75.34, 110: 75.34, 115: 80.47,
    120: 80.47, 125: 85.32, 130: 85.32, 135: 90.03, 140: 90.03, 145: 95.44, 150: 95.44, 155: 100.15,
    160: 100.15, 165: 105.0, 170: 105.0, 175: 109.85, 180: 109.85, 185: 128.15, 190: 128.15,
    195: 133.42, 200: 133.42,
  },
  250: {
    80: 73.4, 85: 79.78, 90: 79.78, 95: 86.02, 100: 86.02, 105: 92.25, 110: 92.25, 115: 99.18,
    120: 99.18, 125: 105.42, 130: 105.42, 135: 112.49, 140: 112.49, 145: 118.72, 150: 118.72,
    155: 125.1, 160: 125.1, 165: 143.26, 170: 143.26, 175: 151.02, 180: 151.02, 185: 157.95,
    190: 157.95, 195: 164.88, 200: 164.88,
  },
};

const euros = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

// largoCm es opcional: si el cliente solo da el ancho, se valida el ancho y se pide el largo.
export function calcularEstorDigitalAMedida(anchoCm: number, largoCm?: number) {
  const tieneLargo = Number.isFinite(largoCm) && (largoCm as number) > 0;
  if (!Number.isFinite(anchoCm) || anchoCm <= 0) {
    return { error: "Medidas no válidas. Pide al cliente ancho y largo en centímetros." };
  }

  const medida = tieneLargo ? `${anchoCm}x${largoCm} cm` : `${anchoCm} cm de ancho`;

  if (anchoCm < 80 || anchoCm > 200 || (tieneLargo && (largoCm as number) > 250)) {
    return {
      se_puede_fabricar: "sí, a estudiar por el equipo",
      fuera_de_rango: true,
      medida_pedida: medida,
      indicacion:
        "Medida fuera del rango de la web (ancho 80-200 cm, largo hasta 250 cm). También se puede estudiar, " +
        "pero NO hay talla base ni precio: el cliente debe consultarlo antes de pedir por email a " +
        "info@elhogardetusuenos.com, teléfono 684 004 525 / 961 154 226 o WhatsApp https://wa.me/34684004525, " +
        "o puedes ofrecerle pasar con una persona del equipo. No des ningún precio.",
      enlace: URL_MEDIDAS,
    };
  }

  if (!tieneLargo) {
    return {
      se_puede_fabricar: "sí, a medida",
      fuera_de_rango: false,
      medida_pedida: medida,
      indicacion:
        "El ancho está dentro del rango. Pregunta al cliente el largo (alto) exacto en cm para indicarle la talla base y el precio orientativo.",
      enlace: URL_MEDIDAS,
    };
  }

  const largoBase: 180 | 250 = (largoCm as number) <= 180 ? 180 : 250;
  const anchoBase = Math.ceil(anchoCm / 5) * 5;
  const precio = PRECIOS[largoBase][anchoBase];
  const tallaBase = `${anchoBase}x${largoBase} cm`;

  return {
    se_puede_fabricar: "sí, a medida",
    fuera_de_rango: false,
    medida_pedida: medida,
    talla_base_a_elegir_en_la_web: tallaBase,
    precio_orientativo: euros(precio),
    indicacion:
      `El cliente elige en la web la talla ${tallaBase} y escribe en el campo de comentarios del pedido ` +
      `(sección "Método de envío") la medida exacta ${medida}, si hay obstáculos (radiador, mesa...) y el tipo de ventana. ` +
      "El proveedor confirma las medidas antes de fabricar y puede ajustar el presupuesto. " +
      "Los estores a medida pueden necesitar 7-15 días hábiles adicionales de fabricación.",
    enlace: URL_MEDIDAS,
  };
}
