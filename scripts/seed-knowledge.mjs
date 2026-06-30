// Seed inicial de la base de conocimiento (knowledge_base) para el RAG.
// Uso: node --env-file=.env scripts/seed-knowledge.mjs
//
// Genera el embedding de cada documento con OpenAI y lo inserta en Supabase.
// Es seguro volver a ejecutarlo: primero vacía la tabla y vuelve a poblarla.

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import ws from "ws";

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = "text-embedding-3-small";

const documents = [
  {
    category: "producto",
    title: "Estores enrollables lisos traslúcidos (Happystor Clear)",
    content:
      "El estor enrollable Happystor Clear es un tejido traslúcido liso, disponible en dos colores: Blanco óptico y Crudo. " +
      "Precio desde 17,59€ (precio base 20,70€, con descuento habitual aplicado), variando según las medidas elegidas. " +
      "Se fabrica a medida en anchos y alturas desde 50x175 cm hasta 180x250 cm aproximadamente. " +
      "Para encargarlo correctamente, el cliente debe indicar el ancho y alto exactos del hueco o marco donde se instalará.",
  },
  {
    category: "producto",
    title: "Otros estores enrollables Happystor (Día y Noche, opacos, EasyFix)",
    content:
      "Además del Happystor Clear (traslúcido liso), la tienda tiene otras variantes de estor enrollable Happystor: " +
      "Happystor Night, Happystor Wave, Happystor TriNight y Happystor Day (tejido día y noche, con franjas que alternan zonas opacas y translúcidas), " +
      "Happystor Door Dark (opaco) y Happystor Door Clear (traslúcido), ambos con instalación EasyFix sin taladrar, " +
      "Happystor Nature (tejido traslúcido tipo lino) y Happystor Light / Happystor Dark (tejido screen y tejido opaco liso). " +
      "Los colores disponibles varían según el modelo. Si el cliente pregunta por un color o acabado concreto que no aparece aquí, " +
      "indícale que pulse el botón de hablar con una persona para que el equipo se lo confirme con el catálogo completo.",
  },
  {
    category: "producto",
    title: "Estores enrollables digitales (personalizados con foto)",
    content:
      "Los estores digitales personalizados se fabrican con tejido traslúcido sobre el que se imprime la foto o diseño que envía el cliente, " +
      "en modelos de las marcas Happystor y Blindecor. El precio base habitual es de 122,55€, con descuentos frecuentes que lo dejan en torno a 55€. " +
      "No hay publicados en la web los requisitos técnicos exactos de resolución mínima o formatos de archivo aceptados para la foto: " +
      "si el cliente pregunta por esto, indícale que el equipo le confirmará el proceso de envío de la imagen al hacer el pedido, " +
      "o que pulse el botón de hablar con una persona.",
  },
  {
    category: "producto",
    title: "Ropa de cama: fundas nórdicas, sábanas y fundas de almohada",
    content:
      "En la categoría de dormitorio hay varias líneas de ropa de cama: Juego de funda nórdica 200 hilos doble pespunte (91,80€), " +
      "Funda nórdica 300 hilos (89,00€), Juego de sábanas 200 hilos doble pespunte (71,80€), Bajera ajustable 300 hilos (54,60€), " +
      "Funda de almohada 300 hilos vainica o doble pespunte (21,40€ cada una). También hay edredones tipo stonewash (desde 28,80€) " +
      "y juegos de gama alta como el Js 300 hilos Luna/Valeria (127,20€). Los precios concretos varían según la talla de la cama.",
  },
  {
    category: "producto",
    title: "Cojines y complementos textiles",
    content:
      "También hay fundas de cojín en varios acabados: Funda de cojín 200 hilos doble pespunte (24,20€), " +
      "Funda de cojín 300 hilos vainica (34,60€), Funda de cojín jacquard (16,20€), y pies de cama (38,00€).",
  },
  {
    category: "producto",
    title: "Fundas de sofá elásticas",
    content:
      "Las fundas de sofá son elásticas y ajustables, de las marcas Belmarti (línea PatternFit: Elegant 70,12€, Milan 54,87€, Toronto 38,39€) " +
      "y Martina Home (Tívoli 50,32€, Azores 46,59€, Malta 46,59€, Tunez 32,19€). El precio varía según el modelo y el número de plazas del sofá. " +
      "También hay disponibles mantas (Manta Braids acrílico, 79,20€) y artículos multiusos (19,20€).",
  },
  {
    category: "producto",
    title: "Accesorios y piezas para estores enrollables",
    content:
      "Para los estores enrollables hay accesorios de instalación y ajuste disponibles por separado: cambio de tamaño de tubo " +
      "(de 28\" a 38\" o de 38\" a 43\", 18,15€ cada cambio), soporte de 10cm para tubo de 38\" (18,15€), soporte en forma de T " +
      "para unir dos estores de 38mm/43mm (18,15€), alargador de soporte de 12cm (4,60€), separadores de pared de 12cm (4,60€) y " +
      "9cm (4,23€). También se ofrece el servicio de modificación y ajuste de fotografía para diseños personalizados (30,25€).",
  },
  {
    category: "envio",
    title: "Plazos y costes de envío",
    content:
      "El coste de envío a la Península es de 6,95€, gratuito en compras superiores a 59,95€. El plazo es de 2-3 días para envío urgente " +
      "o de 5-10 días para envío estándar, con la empresa de transporte Envialia. A Baleares el envío cuesta 14,95€. " +
      "A Canarias, Ceuta y Melilla el envío cuesta 34,95€ con un plazo de 7-10 días a través de Correos. " +
      "Los pedidos realizados antes de las 23:00h se envían al día siguiente.",
  },
  {
    category: "devolucion",
    title: "Política de devoluciones y cambios",
    content:
      "Los productos estándar se pueden cambiar o devolver dentro de los 14 días naturales desde la recepción del pedido, " +
      "siempre que estén en perfecto estado y con su embalaje original. Los gastos de envío de la devolución corren a cargo del cliente, " +
      "salvo que el producto sea defectuoso. El reembolso cubre el coste del producto, no los gastos de envío originales. " +
      "Los productos hechos a medida (como estores enrollables a medida o personalizados con foto) NO admiten devolución, salvo defecto de fabricación. " +
      "Todos los productos cuentan con 2 años de garantía por defectos de fabricación.",
  },
  {
    category: "faq",
    title: "Métodos de pago y seguridad",
    content:
      "Se acepta pago con tarjeta de crédito/débito (a través de la pasarela segura del Banco Sabadell), PayPal, transferencia bancaria " +
      "y contrarreembolso (con un coste adicional de 3€ más el 3% del importe del pedido). Todos los datos de pago se transmiten de forma " +
      "encriptada a través de pasarelas de pago seguras; la tienda no almacena los datos de la tarjeta.",
  },
  {
    category: "empresa",
    title: "Contacto y horario de atención",
    content:
      "El Hogar de Tus Sueños atiende por teléfono en el 961 154 226 o en el móvil/WhatsApp 684 004 525, en horario de 10:00 a 14:00 " +
      "y de 17:00 a 20:00. También se puede contactar por email a info@elhogardetusuenos.com. Para pedidos se recomienda hacerlos a través " +
      "de la web para evitar confusiones. La empresa está ubicada en Partida La Solana, 30, 46870 Ontinyent (Valencia).",
  },
];

async function main() {
  console.log(`Generando embeddings para ${documents.length} documentos...`);

  await supabaseAdmin.from("knowledge_base").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  for (const doc of documents) {
    const embeddingRes = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: doc.content,
    });
    const embedding = embeddingRes.data[0].embedding;

    const { error } = await supabaseAdmin.from("knowledge_base").insert({
      title: doc.title,
      content: doc.content,
      category: doc.category,
      embedding,
    });

    if (error) {
      console.error(`Error insertando "${doc.title}":`, error);
    } else {
      console.log(`✓ ${doc.title}`);
    }
  }

  console.log("Seed completado.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
