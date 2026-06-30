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
    title: "Estores enrollables lisos",
    content:
      "Los estores enrollables lisos están disponibles en varios colores: blanco, beige, gris, negro y crudo. " +
      "Para medir el hueco de tu ventana, mide el ancho y alto exactos en milímetros del hueco o del marco donde quieras instalarlo (interior o exterior), e indícanos si el montaje será dentro del hueco o sobre la pared. " +
      "El precio orientativo es de aproximadamente 25-35€ por m², variando según el tejido elegido (translúcido, opaco o blackout). " +
      "El plazo de fabricación es de 2-3 días laborables antes del envío.",
  },
  {
    category: "producto",
    title: "Estores enrollables digitales (personalizados con foto)",
    content:
      "Los estores enrollables digitales se personalizan con la imagen, foto o diseño que nos envíes. " +
      "Para garantizar buena calidad de impresión, la foto debe tener una resolución mínima de 300 ppp (píxeles por pulgada) al tamaño final del estor; recomendamos imágenes de al menos 3000x2000 píxeles. " +
      "Aceptamos formatos JPG, PNG y PDF. Los estores digitales están disponibles en acabado translúcido o blackout. " +
      "El precio orientativo es de 35-45€ por m², algo superior al estor liso por el proceso de impresión digital. " +
      "El plazo de fabricación es de 3-4 días laborables, ya que incluye revisión y aprobación del diseño antes de imprimir.",
  },
  {
    category: "producto",
    title: "Colchas",
    content:
      "Nuestras colchas están disponibles en tallas 90, 105, 135, 150 y 180 cm (adaptadas al ancho de cama). " +
      "Los materiales disponibles son algodón 100%, mezcla de algodón-poliéster y modelos acolchados (boutí). " +
      "Cuidados: se recomienda lavado a máquina en frío (30°), no usar lejía y secar a baja temperatura o al aire para conservar mejor los colores y la forma.",
  },
  {
    category: "producto",
    title: "Fundas de sofá",
    content:
      "Las fundas de sofá están disponibles para medidas estándar de 1, 2, 3 y hasta 4 plazas, así como modelos en chaise longue. " +
      "Recomendamos medir el ancho total del respaldo y el fondo del asiento antes de elegir la talla. " +
      "Los materiales disponibles incluyen tejidos elásticos ajustables y tejidos antimanchas. " +
      "Instrucciones de lavado: lavado a máquina en frío (30°), sin lejía, secado a baja temperatura; se recomienda plancharlas ligeramente húmedas para eliminar arrugas.",
  },
  {
    category: "producto",
    title: "Fundas nórdicas",
    content:
      "Las fundas nórdicas están disponibles en tallas 90, 105, 135, 150 y 180/200 cm, a juego con funda de almohada. " +
      "Los rellenos disponibles (si se compran en pack) son fibra hueca siliconada de diferentes gramajes (250g, 300g y 400g) para distintas estaciones. " +
      "Cuidados: lavado a máquina en frío (30°), no usar lejía, secado a baja temperatura. Se recomienda lavar antes del primer uso.",
  },
  {
    category: "envio",
    title: "Plazos y condiciones de envío",
    content:
      "El plazo total estimado de entrega es de 2-3 días de fabricación más 24-48h de transporte una vez el pedido sale de nuestro almacén (algo mayor para productos personalizados como los estores digitales). " +
      "Trabajamos con transportistas de referencia nacional y todos los envíos incluyen número de seguimiento que recibirás por email/SMS en cuanto el pedido sea recogido por el transportista. " +
      "El envío es gratuito a partir de 60€ de compra; por debajo de ese importe se aplica un coste de envío estándar calculado en el checkout según destino.",
  },
  {
    category: "devolucion",
    title: "Política de devoluciones",
    content:
      "Los productos estándar (no personalizados) tienen un plazo de devolución de 30 días naturales desde la recepción del pedido, siempre que el artículo esté sin usar y en su embalaje original. " +
      "Los productos a medida o personalizados (como estores enrollables a medida o estores digitales con foto) no admiten devolución salvo que exista un defecto de fabricación, dado que se fabrican específicamente para cada cliente. " +
      "Para iniciar una devolución o notificar un defecto, contacta con nuestro equipo indicando el número de pedido.",
  },
  {
    category: "faq",
    title: "Métodos de pago y seguridad",
    content:
      "Aceptamos pago con tarjeta de crédito/débito (Visa, Mastercard), PayPal y transferencia bancaria. " +
      "Todos los pagos con tarjeta se procesan de forma segura mediante pasarelas de pago certificadas, sin que almacenemos los datos de tu tarjeta en nuestros servidores. " +
      "Recibirás la factura de tu pedido por email automáticamente tras confirmarse el pago.",
  },
  {
    category: "empresa",
    title: "Contacto y horario de atención",
    content:
      "Puedes contactar con El Hogar de Tus Sueños por email o teléfono. " +
      "Nuestro horario de atención al cliente es de lunes a viernes, en horario comercial. " +
      "Para consultas urgentes sobre pedidos en curso, indícanos siempre tu número de pedido para agilizar la respuesta.",
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
