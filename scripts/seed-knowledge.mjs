// Seed de la base de conocimiento (knowledge_base) para el RAG.
// Uso: node --env-file=.env.local scripts/seed-knowledge.mjs
// Es seguro volver a ejecutarlo: vacía la tabla y la vuelve a poblar.

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import ws from "ws";

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = "text-embedding-3-small";

const documents = [

  // ─── NAVEGACIÓN Y CATEGORÍAS ──────────────────────────────────────────────
  {
    category: "faq",
    title: "Categorías y URLs de la tienda El Hogar de Tus Sueños",
    content:
      "La tienda online está en https://www.elhogardetusuenos.com. " +
      "Estores lisos (Clear, Dark, Night, Screen): https://www.elhogardetusuenos.com/categorias/2 " +
      "Estores digitales cocina: https://www.elhogardetusuenos.com/categorias/9 " +
      "Estores digitales ciudades: https://www.elhogardetusuenos.com/categorias/6 " +
      "Estores digitales paisajes: https://www.elhogardetusuenos.com/categorias/7 " +
      "Estores digitales infantiles: https://www.elhogardetusuenos.com/categorias/8 " +
      "Estores digitales zen: https://www.elhogardetusuenos.com/categorias/10 " +
      "Estores digitales estampados/fantasía: https://www.elhogardetusuenos.com/categorias/12 " +
      "Estores digitales juveniles: https://www.elhogardetusuenos.com/categorias/22 " +
      "Estores digitales varios: https://www.elhogardetusuenos.com/categorias/11 " +
      "Fundas nórdicas: https://www.elhogardetusuenos.com/categorias/14 " +
      "Ropa de cama (sábanas, bajeras, fundas almohada): https://www.elhogardetusuenos.com/categorias/15 " +
      "Edredones/rellenos nórdicos: https://www.elhogardetusuenos.com/categorias/16 " +
      "Colchas y plaids dormitorio: https://www.elhogardetusuenos.com/categorias/17 " +
      "Fundas de cojín: https://www.elhogardetusuenos.com/categorias/21 " +
      "Fundas de sofá elásticas: https://www.elhogardetusuenos.com/categorias/20 " +
      "Mantas y multiusos salón: https://www.elhogardetusuenos.com/categorias/23 " +
      "Accesorios y piezas para estores: https://www.elhogardetusuenos.com/categorias/19",
  },

  // ─── ESTORES LISOS ────────────────────────────────────────────────────────
  {
    category: "producto",
    title: "Estores enrollables lisos — colores, tipos y tallas (Happystor y Blindecor)",
    content:
      "Categoría: https://www.elhogardetusuenos.com/categorias/2. " +
      "Todos los estores lisos se fabrican a medida; el cliente indica ancho y alto exactos. " +
      "Tipos disponibles:\n" +
      "• Happystor Clear (traslúcido liso): Blanco óptico, Crudo, Beige, Topo, Gris Marrón, Naranja, Burdeos, Marfil, Lila, Pistacho, Celeste, Morado, Rosa, Marrón Pastel, Verde Pastel, Gris Pastel. Tallas 50x175 a 180x250 cm. https://www.elhogardetusuenos.com/productos/9001-happystor-clear-estor-enrollable-tejido-traslucido-liso\n" +
      "• Happystor Night (noche y día): Crema, Crudo, Gris, Negro, Violeta, Rosa, Celeste, Beige, Marrón, Antracita. 50x180 a 180x250. https://www.elhogardetusuenos.com/productos/9000-happystor-night-estor-enrollable-noche-y-dia\n" +
      "• Happystor Wave (noche y día): Crema, Gris, Marrón, Beige. 50x180 a 180x180. https://www.elhogardetusuenos.com/productos/9012-happystor-wave-estor-enrollable-noche-y-dia\n" +
      "• Happystor TriNight (noche y día bicolor): Gris-Pistacho, Marrón-Crema, Marrón-Gris, Marrón-Violeta. https://www.elhogardetusuenos.com/productos/9011-happystor-trinight-estor-enrollable-noche-y-dia\n" +
      "• Happystor Day (noche y día): Crema, Crudo, Gris, Negro, Violeta. https://www.elhogardetusuenos.com/productos/9006-happystor-day-estor-enrollable-noche-y-dia\n" +
      "• Happystor Nature (aspecto lino traslúcido): color Lino. 50x200 a 180x200. https://www.elhogardetusuenos.com/productos/9005-happystor-nature-estor-enrollable-tejido-traslucio-liso-lino\n" +
      "• Happystor Light (tejido screen): Maquillaje, Marengo, Antracita, Marfil. https://www.elhogardetusuenos.com/productos/867\n" +
      "• Happystor Dark (opaco liso): Crudo, Beige, Marfil, Topo, Gris Marrón, Naranja, Burdeos, Pistacho, Violeta. https://www.elhogardetusuenos.com/productos/866\n" +
      "• Happystor Door Clear (EasyFix sin taladro, traslúcido): Crudo, Beige, Marfil, Topo, Gris, Plata, Naranja, Burdeos, Lila, Pistacho. 37x180 a 140x180. https://www.elhogardetusuenos.com/productos/9008-happystor-door-clear-estor-enrollable-easyfix-traslucido-liso\n" +
      "• Happystor Door Dark (EasyFix, opaco): Crudo, Beige, Marfil, Topo, Gris, Plata, Naranja, Burdeos, Pistacho, Violeta. https://www.elhogardetusuenos.com/productos/9009-happystor-door-dark-estor-enrollable-easyfix-tejido-opaco-liso\n" +
      "• Happystor Door N&D (EasyFix, noche y día): Crema, Crudo, Gris, Negro, Violeta, Rosa, Celeste, Pistacho, Lila. https://www.elhogardetusuenos.com/productos/9007-happystor-door-n-d-estor-enrollable-easyfix-noche-y-dia\n" +
      "• Blindecor Ara (gama amplia traslúcido): Blanco óptico, Crudo, Beige, Marfil, Topo, Gris Marrón, Gris Plata, Naranja, Burdeos, Lila, Pistacho, Celeste, Morado, Rosa, Marrón Pastel, Verde Pastel, Gris Pastel. 80x175 a 180x250. https://www.elhogardetusuenos.com/productos/6001-estor-enrollable-ara-blindecor\n" +
      "• Blindecor Draco (opaco): Crudo, Beige, Marfil, Topo, Gris, Plata, Naranja, Burdeos, Pistacho, Violeta. https://www.elhogardetusuenos.com/productos/6002-estor-enrollable-draco-blindecor\n" +
      "• Blindecor Iris: Marfil, Gris, Naranja, Burdeos, Pistacho, Violeta. https://www.elhogardetusuenos.com/productos/6004-estor-enrollable-iris-blindecor\n" +
      "• Blindecor Egeo (screen): Maquillaje, Marengo, Antracita, Marfil. https://www.elhogardetusuenos.com/productos/6003-estor-enrollable-egeo-blindecor\n" +
      "• Blindecor Vela: Crema, Beige, Gris, Negro, Violeta. https://www.elhogardetusuenos.com/productos/6006-estor-enrollable-vela-blindecor\n" +
      "• Blindecor Linen (lino): Lino. 80x200 a 180x200. https://www.elhogardetusuenos.com/productos/6005-estor-enrollable-linen-blindecor\n" +
      "• Blindecor Lira (noche y día): Crema, Crudo, Gris, Negro, Violeta, Rosa, Celeste, Beige, Marrón, Antracita. https://www.elhogardetusuenos.com/productos/6000-estor-enrollable-lira-blindecor",
  },

  // ─── ESTORES DIGITALES: INFORMACIÓN GENERAL ───────────────────────────────
  {
    category: "producto",
    title: "Estores enrollables digitales — cómo funcionan, tallas y precio",
    content:
      "Los estores digitales tienen una imagen/estampado impreso sobre tejido traslúcido. " +
      "Hay dos tipos: (1) diseños predefinidos del catálogo (cocina, paisajes, ciudades, infantil, zen, fantasía, juvenil, varios) y (2) estores con foto personalizada del cliente. " +
      "Tallas estándar en todas las categorías digitales: de 80x180 cm a 200x180 cm, y de 80x250 cm a 200x250 cm, en incrementos de 5 cm. Tirador: Izquierda o Derecha. " +
      "Para fotos personalizadas del cliente: el equipo confirma los requisitos técnicos al hacer el pedido. Precio base ~55€ con descuentos habituales aplicados. " +
      "Servicio de ajuste de fotografía: 30,25€ (https://www.elhogardetusuenos.com/productos/diseno-personalizado). " +
      "Marcas disponibles: Happystor y Blindecor.",
  },

  // ─── ESTORES DIGITALES: COCINA (frutas, flores, plantas) ─────────────────
  {
    category: "producto",
    title: "Estores digitales cocina — frutas, flores y plantas (parte 1)",
    content:
      "Categoría estores cocina: https://www.elhogardetusuenos.com/categorias/9. " +
      "Productos con motivos de frutas, flores y plantas:\n" +
      "• Cítricos/naranjas con hojas, acuarela (HSCC91027): https://www.elhogardetusuenos.com/productos/9786-happystor-hscc91027-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Naranjas partidas en filas con hojas (HSCC58025): https://www.elhogardetusuenos.com/productos/9781-happystor-hscc58025-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Rodajas de lima verde en columnas (HSCC58023): https://www.elhogardetusuenos.com/productos/9779-happystor-hscc58023-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Salpicadura de agua con lima (HSCC58022): https://www.elhogardetusuenos.com/productos/9778-happystor-hscc58022-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Ramas de flores silvestres rosa/lila (HSCC58021): https://www.elhogardetusuenos.com/productos/9777-happystor-hscc58021-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Plantas colgantes y macetas en estanterías, dibujo lineal verde (HSCC58020): https://www.elhogardetusuenos.com/productos/9776-happystor-hscc58020-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Seis macetas de plantas colgantes (HSCC58017): https://www.elhogardetusuenos.com/productos/9773-happystor-hscc58017-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Manojos de hierbas secas colgadas (HSCC58015): https://www.elhogardetusuenos.com/productos/9771-happystor-hscc58015-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Flores amarillas y hojas otoñales (HSCC91037): https://www.elhogardetusuenos.com/productos/9714-happystor-hscc91037-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Patrón mosaico frutas y verduras variadas (HSCC58014): https://www.elhogardetusuenos.com/productos/9770-happystor-hscc58014-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Mosaico circular frutas coloridas (HSCC58012): https://www.elhogardetusuenos.com/productos/9711-happystor-hscc58012-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Fresas y flores rosas en mosaico (HSCC58010): https://www.elhogardetusuenos.com/productos/9709-happystor-hscc58010-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Fresas rojas grandes minimalista (HSCC58009): https://www.elhogardetusuenos.com/productos/9708-happystor-hscc58009-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Frambuesas/moras rojas (HSCC58008): https://www.elhogardetusuenos.com/productos/9707-happystor-hscc58008-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Patrón limones con hojas azul turquesa (HSCC58007): https://www.elhogardetusuenos.com/productos/9706-happystor-hscc58007-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Manzanas rojas con salpicadura agua verde (HSCC67988): https://www.elhogardetusuenos.com/productos/9624-happystor-hscc67988-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Frutas y batidos/smoothies en vasos (HSCC76680): https://www.elhogardetusuenos.com/productos/9610-happystor-hscc76680-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Tomates cherry en ramita minimalista (HSCCExc058006): https://www.elhogardetusuenos.com/productos/9596-happystor-hsccexc058006-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Flores rojas/naranjas en esquinas (HSCCExc058005): https://www.elhogardetusuenos.com/productos/9595-happystor-hsccexc058005-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Frutos rojos sobre encimera con plantas (HSCCExc058004): https://www.elhogardetusuenos.com/productos/9594-happystor-hsccexc058004-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cítricos en rodajas sobre encimera (HSCCExc058003): https://www.elhogardetusuenos.com/productos/9593-happystor-hsccexc058003-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Verduras y guindillas frescas (HSCCExc058002): https://www.elhogardetusuenos.com/productos/9592-happystor-hsccexc058002-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Franja vertical de frutos rojos cayendo (HSCC91020): https://www.elhogardetusuenos.com/productos/9536-happystor-hscc91020-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Hojas y helechos acuarela azul (Hojas): https://www.elhogardetusuenos.com/productos/9534-happystor-hojas-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Flores en acuarela azul (Flores): https://www.elhogardetusuenos.com/productos/9533-happystor-flores-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Limones amarillos con lunares negros patrón (HSCC6822): https://www.elhogardetusuenos.com/productos/9515-happystor-hscc6822-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cebolletas y tomates cherry frescos (Blindecor W-C-90709): https://www.elhogardetusuenos.com/productos/6743-blindecor-w-c-90709-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Kiwi y frutas con salpicadura agua (Blindecor W-C-89827): https://www.elhogardetusuenos.com/productos/6742-blindecor-w-c-89827-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Manzana verde con salpicadura (Blindecor W-C-78404): https://www.elhogardetusuenos.com/productos/6741-blindecor-w-c-78404-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Lima verde con salpicadura azul (Blindecor W-C-72178): https://www.elhogardetusuenos.com/productos/6740-blindecor-w-c-72178-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Grosellas y rodaja de limón bodegón (Blindecor W-C-30079): https://www.elhogardetusuenos.com/productos/6724-blindecor-w-c-30079-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Fresas cayendo en agua fondo azul (Blindecor W-C-03198): https://www.elhogardetusuenos.com/productos/6723-blindecor-w-c-03198-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Manzanas verdes con hojas y salpicadura (Blindecor W-C-27275): https://www.elhogardetusuenos.com/productos/6704-blindecor-w-c-27275-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Cerezas rojas en salpicadura (Blindecor W-C-15698): https://www.elhogardetusuenos.com/productos/6703-blindecor-w-c-15698-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Limón con salpicadura y hoja verde (Blindecor T2-C-39177): https://www.elhogardetusuenos.com/productos/6597-blindecor-t2-c-39177-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Manzanas rojas en racimo (Blindecor T2-C-67585): https://www.elhogardetusuenos.com/productos/6589-blindecor-t2-c-67585-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Mosaico de frutas y verduras coloridas (Blindecor T2-C-37743): https://www.elhogardetusuenos.com/productos/6592-blindecor-t2-c-37743-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Naranja y cubito de hielo en salpicadura (Blindecor W-C-56290): https://www.elhogardetusuenos.com/productos/6705-blindecor-w-c-56290-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Rodaja naranja con salpicadura fondo azul (Blindecor T2-C-01437): https://www.elhogardetusuenos.com/productos/6587-blindecor-t2-c-01437-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido",
  },

  // ─── ESTORES DIGITALES: COCINA (cubiertos, utensilios, café, otros) ────────
  {
    category: "producto",
    title: "Estores digitales cocina — cubiertos, utensilios, gatos y otros motivos (parte 2)",
    content:
      "Categoría estores cocina: https://www.elhogardetusuenos.com/categorias/9. " +
      "Productos con cubiertos, utensilios de cocina y otros motivos:\n" +
      "• Cubiertos: 3 cubiertos estilizados fondo blanco (HSCC20503): https://elhogardetusuenos.com/productos/9698-happystor-hscc20503-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cubiertos dorados patrón repetido (HSCC82794): https://www.elhogardetusuenos.com/productos/9623-happystor-hscc82794-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cubiertos de colores variados patrón (HSCC82159): https://www.elhogardetusuenos.com/productos/9622-happystor-hscc82159-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cubiertos en degradado rojo/naranja/dorado (HSCC72436): https://www.elhogardetusuenos.com/productos/9609-happystor-hscc72436-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cubiertos de colores arcoíris dispersos (HSCC0838): https://www.elhogardetusuenos.com/productos/9513-happystor-hscc0838-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cubiertos dibujo lineal rosa/rojo fondo blanco (HSCC8478): https://www.elhogardetusuenos.com/productos/9512-happystor-hscc8478-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cubertería antigua estilo vintage sepia (Blindecor T1-C-39402): https://www.elhogardetusuenos.com/productos/6598-blindecor-t1-c-39402-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Lluvia de cubiertos de colores cayendo (Blindecor T2-C-77627): https://www.elhogardetusuenos.com/productos/6593-blindecor-t2-c-77627-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Tenedor y cuchara dibujo lineal verde y rojo (Blindecor T1-C-69443): https://www.elhogardetusuenos.com/productos/6588-blindecor-t1-c-69443-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Utensilios (cucharas, espátulas) en colores pastel (HSCC58019): https://www.elhogardetusuenos.com/productos/9775-happystor-hscc58019-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Botellas de aceite/vinagre en estante de madera (HSCC58018): https://www.elhogardetusuenos.com/productos/9774-happystor-hscc58018-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Botellas y tarros en fila dibujo lineal verde (HSCC58029): https://www.elhogardetusuenos.com/productos/9785-happystor-hscc58029-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Patrón iconos de cocina (botellas, tarros, utensilios) variados (HSCC58013): https://www.elhogardetusuenos.com/productos/9712-happystor-hscc58013-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Especias y hierbas en tarritos, tonos marrón (HSCC58024): https://www.elhogardetusuenos.com/productos/9780-happystor-hscc58024-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Verduras y especias (ajo, guindilla, cebolla) bodegón (HSCC91029): https://www.elhogardetusuenos.com/productos/9713-happystor-hscc91029-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Estantería con tazas y cerámica verde/azul (HSCC91003): https://www.elhogardetusuenos.com/productos/9532-happystor-hscc91003-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Estantería con plantas en macetas (HSCC91002): https://www.elhogardetusuenos.com/productos/9531-happystor-hscc91002-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Estantería con tarros de especias (HSCC91001): https://www.elhogardetusuenos.com/productos/9530-happystor-hscc91001-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Taza café formada por iconos de cocina, dibujo lineal azul (Taza): https://www.elhogardetusuenos.com/productos/9535-happystor-taza-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cartel MENÚ estilo pizarra con cubiertos (HSCC4648): https://www.elhogardetusuenos.com/productos/9510-happystor-hscc4648-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Taza de café negra junto a papel arrugado (Blindecor T2-C-63763): https://www.elhogardetusuenos.com/productos/6591-blindecor-t2-c-63763-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Dos tazas con peces tropicales saltando (Blindecor T3-C-51282): https://www.elhogardetusuenos.com/productos/6590-blindecor-t3-c-51282-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Copas de vino blanco sobre mesa elegante (Blindecor W-C-03667): https://www.elhogardetusuenos.com/productos/6739-blindecor-w-c-03667-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Copas de vino vacías en fila, cristal (Blindecor T1-C-00980): https://www.elhogardetusuenos.com/productos/6586-blindecor-t1-c-00980-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Gatos ilustrados en fila sobre estante (HSCC58016): https://www.elhogardetusuenos.com/productos/9772-happystor-hscc58016-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Gato marrón enroscado ilustración circular (HSCC20502): https://www.elhogardetusuenos.com/productos/9697-happystor-hscc20502-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cactus kawaii en macetas (HSCC80060): https://www.elhogardetusuenos.com/productos/9614-happystor-hscc80060-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cactus en maceta ilustración realista (HSCC80010): https://www.elhogardetusuenos.com/productos/9611-happystor-hscc80010-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Sushi y palillos sobre rayas diagonales negras (HSCC4447): https://www.elhogardetusuenos.com/productos/9509-happystor-hscc4447-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Sushi/onigiri kawaii con caritas (HSCC80040): https://www.elhogardetusuenos.com/productos/9613-happystor-hscc80040-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Miel cayendo desde cucharón de madera (HSCC91031): https://www.elhogardetusuenos.com/productos/9617-happystor-hscc91031-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Verduras saltando de olla de cobre (HSCC91030): https://www.elhogardetusuenos.com/productos/9616-happystor-hscc91030-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Cuenco ensalada con verduras frescas (HSCC03754): https://www.elhogardetusuenos.com/productos/9619-happystor-hscc03754-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Hamburguesa gourmet sobre encimera (HSCCExc058001): https://www.elhogardetusuenos.com/productos/9591-happystor-hsccexc058001-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Regadera y macetas estilo rústico/jardín (Blindecor T2-C-43536): https://www.elhogardetusuenos.com/productos/6594-blindecor-t2-c-43536-estor-enrollable-estampado-digital-basic-cocina-tejido-traslucido\n" +
      "• Plantas y macetas en alféizar, cocina colorida (HSCC58028): https://www.elhogardetusuenos.com/productos/9784-happystor-hscc58028-estor-enrollable-estampado-digital-cocina-tejido-traslucido\n" +
      "• Patrón floral rojo/rosa con hojas verdes (HSCC80020): https://www.elhogardetusuenos.com/productos/9612-happystor-hscc80020-estor-enrollable-estampado-digital-cocina-tejido-traslucido",
  },


  // ─── ESTORES DIGITALES: PAISAJES (playa, mar, tropical) ──────────────────
  {
    category: "producto",
    title: "Estores digitales paisajes — playa, mar, tropical y cascadas (parte 1)",
    content:
      "Categoría estores paisajes: https://www.elhogardetusuenos.com/categorias/7. " +
      "Todos los temas son fotográficos (no dibujados). Productos con playa, mar, cascadas y naturaleza tropical:\n" +
      "• Cala tropical Seychelles, aguas turquesas, acantilados (HSCP93019): https://www.elhogardetusuenos.com/productos/9826-happystor-hscp93019-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Siluetas palmeras desde abajo, cielo azul vintage (HSCP93018): https://www.elhogardetusuenos.com/productos/9825-happystor-hscp93018-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Playa tropical al atardecer, silueta hoja de palmera (HSCP93022): https://www.elhogardetusuenos.com/productos/9829-happystor-hscp93022-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Playa tropical con palmeras inclinadas, Maldivas (HSCPExc038005): https://www.elhogardetusuenos.com/productos/9584-happystor-hscpexc038005-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Orilla de playa con olas, agua turquesa clara (HSCPExc038004): https://www.elhogardetusuenos.com/productos/9583-happystor-hscpexc038004-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Playa Tailandia con embarcadero, barca longtail roja (HSCPExc038003): https://www.elhogardetusuenos.com/productos/9582-happystor-hscpexc038003-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Playa Railay Tailandia, barcos longtail, roca caliza (HSCP2078): https://www.elhogardetusuenos.com/productos/9507-happystor-hscp2078-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Playa soleada turquesa, cielo azul nubes (HSCP93003): https://www.elhogardetusuenos.com/productos/9556-happystor-hscp93003-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Pan de Azúcar Río de Janeiro al atardecer (HSCP20303): https://www.elhogardetusuenos.com/productos/9694-happystor-hscp20303-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Velero blanco en bahía turquesa (Blindecor T3-P-98791): https://www.elhogardetusuenos.com/productos/6574-blindecor-t3-p-98791-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Velero blanco navegando mar turquesa (Blindecor T3-P-51466): https://www.elhogardetusuenos.com/productos/6570-blindecor-t3-p-51466-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Atardecer colorido con espigón de madera en el mar (Blindecor T3-P-76817): https://www.elhogardetusuenos.com/productos/6571-blindecor-t3-p-76817-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Playa al atardecer con tumbonas y sombrilla (Blindecor T3-P-90996): https://www.elhogardetusuenos.com/productos/6565-blindecor-t3-p-90996-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Playa marea baja al atardecer, reflejo en arena mojada (Blindecor T3-P-72600): https://www.elhogardetusuenos.com/productos/6572-blindecor-t3-p-72600-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Playa palmeras al atardecer (Blindecor W-P-77231): https://www.elhogardetusuenos.com/productos/6757-blindecor-w-p-77231-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Playa palmeras turquesa (Blindecor W-P-08770): https://www.elhogardetusuenos.com/productos/6754-blindecor-w-p-08770-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Playa dos barcas de madera, acantilado con vegetación (Blindecor T3-P-01226): https://www.elhogardetusuenos.com/productos/6567-blindecor-t3-p-01226-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Laguna turquesa rodeada de acantilados, Phang Nga (Blindecor W-P-41791): https://www.elhogardetusuenos.com/productos/6714-blindecor-w-p-41791-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Playa Railay, acantilados calizos, barcos longtail (Blindecor T3-P-01453): https://www.elhogardetusuenos.com/productos/6575-blindecor-t3-p-01453-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Playa Railay, barcos longtail en fila (Blindecor T3-P-32078): https://www.elhogardetusuenos.com/productos/6569-blindecor-t3-p-32078-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Rocas costeras tipo 12 Apóstoles, Australia (Blindecor T3-P-33841): https://www.elhogardetusuenos.com/productos/6566-blindecor-t3-p-33841-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Acantilado rocoso junto al mar, olas azules (HSCP20301): https://www.elhogardetusuenos.com/productos/9692-happystor-hscp20301-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Faro blanco en costa rocosa/dunas (HSCP20302): https://www.elhogardetusuenos.com/productos/9693-happystor-hscp20302-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Faro blanco sobre costa al atardecer (Blindecor T3-P-43567): https://www.elhogardetusuenos.com/productos/6579-blindecor-t3-p-43567-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Ola de mar rompiendo, cresta de espuma azul turquesa (Blindecor T3-P-82223): https://www.elhogardetusuenos.com/productos/6583-blindecor-t3-p-82223-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Cascada escalonada turquesa, tipo Erawan Tailandia (W-P-53313): https://www.elhogardetusuenos.com/productos/6730-blindecor-w-p-53313-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Cascada turquesa entre vegetación tropical (Blindecor T3-P-00227): https://www.elhogardetusuenos.com/productos/6580-blindecor-t3-p-00227-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Cascada turquesa en bosque tropical (Blindecor T3-P-96217): https://www.elhogardetusuenos.com/productos/6573-blindecor-t3-p-96217-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Doble cascada entre follaje otoñal rojo/naranja (Blindecor T3-P-18804): https://www.elhogardetusuenos.com/productos/6576-blindecor-t3-p-18804-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Cascada entre rocas en selva tropical (Blindecor T3-P-59381): https://www.elhogardetusuenos.com/productos/6582-blindecor-t3-p-59381-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Cascada en paisaje volcánico Islandia (HSCPExc038002): https://www.elhogardetusuenos.com/productos/9581-happystor-hscpexc038002-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Cascada en bosque otoñal, follaje naranja/rojo (HSCP93015): https://www.elhogardetusuenos.com/productos/9822-happystor-hscp93015-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Cascada ancha entre bosque de otoño (HSCP93014): https://www.elhogardetusuenos.com/productos/9821-happystor-hscp93014-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Lago con cascadas, bosque otoñal, tipo Plitvice (Blindecor W-P-78813): https://www.elhogardetusuenos.com/productos/6712-blindecor-w-p-78813-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Escalera de piedra entre vegetación tropical (Blindecor T3-P-46510): https://www.elhogardetusuenos.com/productos/6578-blindecor-t3-p-46510-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido",
  },

  // ─── ESTORES DIGITALES: PAISAJES (bosques, montañas, flores, otros) ───────
  {
    category: "producto",
    title: "Estores digitales paisajes — bosques, montañas, flores y atardeceres (parte 2)",
    content:
      "Categoría estores paisajes: https://www.elhogardetusuenos.com/categorias/7. " +
      "Productos con bosques, montañas, flores de campo y atardeceres:\n" +
      "• Vista aérea cielo con nubes desde avión (HSCP93026): https://www.elhogardetusuenos.com/productos/9833-happystor-hscp93026-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Bosque otoñal con arroyo entre hojas naranjas/amarillas (HSCP93025): https://www.elhogardetusuenos.com/productos/9832-happystor-hscp93025-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Dosel bosque frondoso verde con luz solar (HSCP93023): https://www.elhogardetusuenos.com/productos/9830-happystor-hscp93023-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Arroyo rocoso entre bosque verde musgoso (HSCP93020): https://www.elhogardetusuenos.com/productos/9827-happystor-hscp93020-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Cordillera nevada con bosque de pinos, paisaje alpino (HSCP93017): https://www.elhogardetusuenos.com/productos/9824-happystor-hscp93017-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Cañón arenisca naranja/rojo tipo Antelope Canyon (HSCP93016): https://www.elhogardetusuenos.com/productos/9823-happystor-hscp93016-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Cañón arenisca ondulada naranja (HSCP6482): https://www.elhogardetusuenos.com/productos/9508-happystor-hscp6482-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Paisaje montañas Escocia, colinas verdes, árbol solitario (HSCP6000): https://www.elhogardetusuenos.com/productos/9506-happystor-hscp6000-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Paisaje montañas Rocosas canadienses, bosque y río (HSCP93012): https://www.elhogardetusuenos.com/productos/9819-happystor-hscp93012-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Monte Fuji al amanecer con reflejo perfecto en lago (Blindecor T3-P-30761): https://www.elhogardetusuenos.com/productos/6564-blindecor-t3-p-30761-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Atardecer sobre marisma con hierbas altas, cielo morado (HSCP93007): https://www.elhogardetusuenos.com/productos/9814-happystor-hscp93007-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Atardecer dorado con espigas a contraluz (HSCP93021): https://www.elhogardetusuenos.com/productos/9828-happystor-hscp93021-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Atardecer panorámico sobre lago, reflejo del sol (Blindecor T3-P-87817): https://www.elhogardetusuenos.com/productos/6585-blindecor-t3-p-87817-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Campo de girasoles con sol dorado (HSCP93011): https://www.elhogardetusuenos.com/productos/9818-happystor-hscp93011-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Campo de girasoles con rayos de luz vertical (HSCP93005): https://www.elhogardetusuenos.com/productos/9558-happystor-hscp93005-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Campo de flores silvestres/lavanda morada y blanca (HSCP93010): https://www.elhogardetusuenos.com/productos/9817-happystor-hscp93010-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Campo de amapolas rojas al atardecer (HSCP93009): https://www.elhogardetusuenos.com/productos/9816-happystor-hscp93009-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Amapolas rojas y flores silvestres bajo cielo azul (HSCPExc038001): https://www.elhogardetusuenos.com/productos/9580-happystor-hscpexc038001-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Acuarela de amapolas rojas, estilo dibujado (HSCP93008): https://www.elhogardetusuenos.com/productos/9815-happystor-hscp93008-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Campo de flores diente de León bajo sol (Blindecor W-P-45048): https://www.elhogardetusuenos.com/productos/6713-blindecor-w-p-45048-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Flores de lavanda moradas con bokeh dorado (HSCP93002): https://www.elhogardetusuenos.com/productos/9555-happystor-hscp93002-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Vilano de diente de León contra atardecer dorado (HSCP93001): https://www.elhogardetusuenos.com/productos/9554-happystor-hscp93001-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Diente de León blanco y negro monocromo (Blindecor T3-P-04238): https://www.elhogardetusuenos.com/productos/6577-blindecor-t3-p-04238-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Tulipanes de colores (amarillo, rojo, naranja, rosa) (HSCP93004): https://www.elhogardetusuenos.com/productos/9557-happystor-hscp93004-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Ramas de cerezo sakura rosa en primer plano (HSCP93006): https://www.elhogardetusuenos.com/productos/9559-happystor-hscp93006-estor-enrollable-estampado-digital-paisajes-tejido-traslucido\n" +
      "• Bosque otoñal con follaje dorado y camino de tierra (Blindecor T3-P-89238): https://www.elhogardetusuenos.com/productos/6584-blindecor-t3-p-89238-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Bosque otoñal con follaje dorado iluminado por sol (Blindecor T3-P-84320): https://www.elhogardetusuenos.com/productos/6581-blindecor-t3-p-84320-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Pasarela de madera entre árboles otoñales naranjas (Blindecor W-P-56224): https://www.elhogardetusuenos.com/productos/6756-blindecor-w-p-56224-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Bosque árboles altos desde abajo con luz solar (Blindecor W-P-48493): https://www.elhogardetusuenos.com/productos/6755-blindecor-w-p-48493-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Bosque verde frondoso con haces de luz y camino (Blindecor T3-P-58742): https://www.elhogardetusuenos.com/productos/6563-blindecor-t3-p-58742-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Parque otoñal, árboles naranjas/rojos, sol entre ramas (Blindecor W-P-37235): https://www.elhogardetusuenos.com/productos/6729-blindecor-w-p-37235-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Pasarela madera junto a arroyo con musgo (Blindecor T3-P-97413): https://www.elhogardetusuenos.com/productos/6568-blindecor-t3-p-97413-estor-enrollable-estampado-digital-paisajes-basic-tejido-traslucido\n" +
      "• Estor especial 225x130cm: Cascada bosque otoñal (producto/868): https://www.elhogardetusuenos.com/productos/868",
  },

  // ─── ESTORES DIGITALES: CIUDADES ─────────────────────────────────────────
  {
    category: "producto",
    title: "Estores digitales ciudades — Nueva York, París, Londres, Roma, Santorini y más",
    content:
      "Categoría estores ciudades: https://www.elhogardetusuenos.com/categorias/6. " +
      "35 productos con fotografías e ilustraciones de ciudades del mundo. " +
      "Nueva York (12 productos):\n" +
      "• Silueta Brooklyn Bridge + Estatua de la Libertad B&N (HSCU92004): https://www.elhogardetusuenos.com/productos/9686-happystor-hscu92004-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Diseño tipográfico 'NEW YRK CTY' minimalista negro (HSCU80020): https://www.elhogardetusuenos.com/productos/9685-happystor-hscu80020-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Brooklyn Bridge desde el paseo, gente caminando (HSCU12902): https://www.elhogardetusuenos.com/productos/9605-happystor-hscu12902-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Calle con taxis amarillos y rascacielos día lluvioso (HSCUExc018004): https://www.elhogardetusuenos.com/productos/9569-happystor-hscuexc018004-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Vista aérea skyline Empire State (HSCUExc018003): https://www.elhogardetusuenos.com/productos/9568-happystor-hscuexc018003-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Estatua de la Libertad sepia, primer plano (HSCU9058): https://www.elhogardetusuenos.com/productos/9503-happystor-hscu9058-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Brooklyn Bridge en sepia, cables y arcos góticos (HSCU4181): https://www.elhogardetusuenos.com/productos/9502-happystor-hscu4181-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Flatiron Building B&N con reloj de calle (HSCU9460): https://www.elhogardetusuenos.com/productos/9501-happystor-hscu9460-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Brooklyn Bridge y skyline al atardecer dorado (Blindecor W-U-96383): https://www.elhogardetusuenos.com/productos/6738-blindecor-w-u-96383-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Estatua de la Libertad + rascacielos + bandera, doble exposición (Blindecor W-U-66615): https://www.elhogardetusuenos.com/productos/6737-blindecor-w-u-66615-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• 'NEW YORK' formado por fotos icónicas (taxi, Brooklyn) collage (Blindecor W-U-52667): https://www.elhogardetusuenos.com/productos/6701-blindecor-w-u-52667-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Flatiron B&N con nieve en la calle (Blindecor T2-U-59460): https://www.elhogardetusuenos.com/productos/6559-blindecor-t2-u-59460-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Times Square con carteles luminosos y taxis (Blindecor T3-U-45109): https://www.elhogardetusuenos.com/productos/6552-blindecor-t3-u-45109-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Estatua de la Libertad sepia cuerpo completo (Blindecor T2-U-79058): https://www.elhogardetusuenos.com/productos/6556-blindecor-t2-u-79058-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "París (4 productos):\n" +
      "• Torre Eiffel entre árboles otoñales junto al Sena (HSCU40244): https://www.elhogardetusuenos.com/productos/9606-happystor-hscu40244-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Torre Eiffel de día, cielo azul despejado (HSCUExc018002): https://www.elhogardetusuenos.com/productos/9567-happystor-hscuexc018002-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Torre Eiffel desde muelle de madera junto al Sena (Blindecor W-U-30108): https://www.elhogardetusuenos.com/productos/6721-blindecor-w-u-30108-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Torre Eiffel con cerezo en flor rosa, atardecer (Blindecor T3-U-59201): https://www.elhogardetusuenos.com/productos/6554-blindecor-t3-u-59201-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "Londres (2 productos):\n" +
      "• Big Ben + Parlamento en B&N con autobús rojo en color (HSCU02290): https://www.elhogardetusuenos.com/productos/9607-happystor-hscu02290-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Cabina telefónica roja con Big Ben al fondo (Blindecor T3-U-14817): https://www.elhogardetusuenos.com/productos/6561-blindecor-t3-u-14817-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "Santorini/Grecia (3 productos):\n" +
      "• Santorini: casas blancas de Oia al atardecer (HSCU13413): https://www.elhogardetusuenos.com/productos/9608-happystor-hscu13413-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Santorini: molino de viento blanco al atardecer (Blindecor T3-U-27436): https://www.elhogardetusuenos.com/productos/6560-blindecor-t3-u-27436-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Santorini: iglesias cúpulas azules con crucero (Blindecor T3-U-05725): https://www.elhogardetusuenos.com/productos/6557-blindecor-t3-u-05725-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "Italia (4 productos):\n" +
      "• Roma: el Coliseo al atardecer, cielo turquesa (HSCUExc018001): https://www.elhogardetusuenos.com/productos/9566-happystor-hscuexc018001-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Venecia: Puente de Rialto iluminado de noche (Blindecor W-U-00982): https://www.elhogardetusuenos.com/productos/6700-blindecor-w-u-00982-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Burano: callejón casas de colores vivos (Blindecor T3-U-11289): https://www.elhogardetusuenos.com/productos/6558-blindecor-t3-u-11289-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Cinque Terre/Vernazza: pueblo costero colorido (Blindecor W-U-53586): https://www.elhogardetusuenos.com/productos/6702-blindecor-w-u-53586-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Pueblo mediterráneo con buganvillas y gato (Blindecor T3-U-62004): https://www.elhogardetusuenos.com/productos/6555-blindecor-t3-u-62004-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "Oporto (3 productos):\n" +
      "• Oporto: tranvía amarillo en calle empedrada (Blindecor W-U-06220): https://www.elhogardetusuenos.com/productos/6769-blindecor-w-u-06220-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Oporto: Ribeira colorida junto al río Duero (Blindecor W-U-89196): https://www.elhogardetusuenos.com/productos/6722-blindecor-w-u-89196-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Oporto: Ribeira al anochecer, luces reflejadas (Blindecor T3-U-82869): https://www.elhogardetusuenos.com/productos/6551-blindecor-t3-u-82869-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "Otros:\n" +
      "• Ámsterdam: fachadas holandesas en acuarela al atardecer (HSCU92005): https://www.elhogardetusuenos.com/productos/9687-happystor-hscu92005-estor-enrollable-estampado-digital-ciudades-tejido-traslucido\n" +
      "• Shanghái: skyline Torre de la Perla Oriental al atardecer (Blindecor W-U-34322): https://www.elhogardetusuenos.com/productos/6735-blindecor-w-u-34322-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• San Francisco: Golden Gate al atardecer/noche (Blindecor T3-U-70905): https://www.elhogardetusuenos.com/productos/6553-blindecor-t3-u-70905-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido\n" +
      "• Collage ciudades europeas en acuarela (Blindecor W-U-57737): https://www.elhogardetusuenos.com/productos/6736-blindecor-w-u-57737-estor-enrollable-estampado-digital-ciudades-basic-tejido-traslucido",
  },

  // ─── ESTORES DIGITALES: ZEN ───────────────────────────────────────────────
  {
    category: "producto",
    title: "Estores digitales zen — piedras, flores, bambú, orquídeas y naturaleza serena",
    content:
      "Categoría estores zen: https://www.elhogardetusuenos.com/categorias/10. " +
      "58 productos con motivos zen, minimalistas y de naturaleza serena. " +
      "Piedras zen y cairns:\n" +
      "• Flor de loto rosa sobre piedras zen con banco japonés (HSCZ94019): https://www.elhogardetusuenos.com/productos/9839-happystor-hscz94019-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Torre piedras zen (cairn) gris con flor rosa encima (HSCZ94018): https://www.elhogardetusuenos.com/productos/9838-happystor-hscz94018-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Torre piedras zen con reflejo en agua, tonos grises (HSCZ78011): https://www.elhogardetusuenos.com/productos/9744-happystor-hscz78011-estor-enrollable-estampado-digital-zentejido-traslucido\n" +
      "• Torre piedras zen sencilla en blanco y negro (HSCZ78007): https://www.elhogardetusuenos.com/productos/9740-happystor-hscz78007-estor-enrollable-estampado-digital-zentejido-traslucido\n" +
      "• Piedras zen con margarita blanca y reflejo en agua (HSCZ05359): https://www.elhogardetusuenos.com/productos/9682-happystor-hscz05359-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Piedras zen negras con flores blancas de jazmín (HSCZ94008): https://www.elhogardetusuenos.com/productos/9680-happystor-hscz94008-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Torre piedras en playa de guijarros, mar de fondo (HSCZExc078003): https://www.elhogardetusuenos.com/productos/9599-happystor-hsczexc078003-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Piedras zen con orquídea azul colgante (HSCZ7973): https://www.elhogardetusuenos.com/productos/9524-happystor-hscz7973-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Piedras zen negras con orquídeas blancas y vela, ambiente spa (HSCZ5911): https://www.elhogardetusuenos.com/productos/9523-happystor-hscz5911-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Piedras zen con hoja/brote verde de bambú (HSCZ2617): https://www.elhogardetusuenos.com/productos/9521-happystor-hscz2617-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Orquídeas rosas con piedras negras y velas (Blindecor W-Z-66950): https://www.elhogardetusuenos.com/productos/6733-blindecor-w-z-66950-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Orquídeas blancas y rosas sobre piedras negras (Blindecor W-Z-81465): https://www.elhogardetusuenos.com/productos/6720-blindecor-w-z-81465-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Piedras negras zen con orquídea rosa y vela sobre madera spa (Blindecor T3-Z-93993): https://www.elhogardetusuenos.com/productos/6611-blindecor-t3-z-93993-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Piedras zen negras con orquídea rosa y reflejo en agua (Blindecor T3-Z-83884, T2-Z-31987, T2-Z-55): varios productos similares — ver categoría\n" +
      "• Jardín zen arena rastrillada en espiral con piedra (Blindecor W-Z-14991): https://www.elhogardetusuenos.com/productos/6719-blindecor-w-z-14991-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Jardín zen arena rastrillada en líneas onduladas (Blindecor T2-Z-85735): https://www.elhogardetusuenos.com/productos/6606-blindecor-t2-z-85735-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Ondas concéntricas en agua, efecto gota, B&N (HSCZ94017): https://www.elhogardetusuenos.com/productos/9837-happystor-hscz94017-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Ondas blancas tipo arena zen con mariposa sobre piedra (Blindecor T2-Z-29607): https://www.elhogardetusuenos.com/productos/6613-blindecor-t2-z-29607-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "Flores y orquídeas:\n" +
      "• Flor de loto rosa/morada silueta contra atardecer sobre lago (HSCZ94016): https://www.elhogardetusuenos.com/productos/9836-happystor-hscz94016-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Flor de loto blanca flotando en agua con reflejo (Blindecor W-Z-16040): https://www.elhogardetusuenos.com/productos/6767-blindecor-w-z-16040-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Flor de loto blanca con agua cayendo entre bambú (Blindecor W-Z-04625): https://www.elhogardetusuenos.com/productos/6734-blindecor-w-z-04625-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Orquídea rosa fucsia con reflejo en agua (HSCZ39344): https://www.elhogardetusuenos.com/productos/9683-happystor-hscz39344-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Orquídea rosa en maceta junto a ventana (HSCZExc078002): https://www.elhogardetusuenos.com/productos/9598-happystor-hsczexc078002-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Orquídea rosa junto a bambú y piedras zen (HSCZ94005): https://www.elhogardetusuenos.com/productos/9564-happystor-hscz94005-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Flor tipo orquídea blanca minimalista (HSCZ78004): https://www.elhogardetusuenos.com/productos/9737-happystor-hscz78004-estor-enrollable-estampado-digital-zentejido-traslucido\n" +
      "• Flores de hortensia azul sobre piedras blancas (HSCZ94003): https://www.elhogardetusuenos.com/productos/9562-happystor-hscz94003-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Flor de azafrán/crocus morada sobre fondo blanco (HSCZ20703): https://www.elhogardetusuenos.com/productos/9703-happystor-hscz20703-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Flor morada crocus sobre piedras con reflejo (Blindecor W-Z-04502): https://www.elhogardetusuenos.com/productos/6765-blindecor-w-z-04502-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Ramas de cerezo sakura rosa pálido (HSCZExc078001): https://www.elhogardetusuenos.com/productos/9597-happystor-hsczexc078001-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Flor peonía rosa pálido sobre fondo envejecido beige (HSCZ70338): https://www.elhogardetusuenos.com/productos/9684-happystor-hscz70338-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Flor blanca tipo lirio/jazmín sobre fondo blanco (HSCZ28020): https://www.elhogardetusuenos.com/productos/9681-happystor-hscz28020-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "Bambú y naturaleza zen:\n" +
      "• Juncos/hierbas altas acuarela azul, caligrafía oriental (HSCZ78012): https://www.elhogardetusuenos.com/productos/9745-happystor-hscz78012-estor-enrollable-estampado-digital-zentejido-traslucido\n" +
      "• Pluma de ave sobre fondo beige, minimalista (HSCZ78010): https://www.elhogardetusuenos.com/productos/9743-happystor-hscz78010-estor-enrollable-estampado-digital-zentejido-traslucido\n" +
      "• Tallos de bambú verde con piedras zen blancas (HSCZ5905): https://www.elhogardetusuenos.com/productos/9522-happystor-hscz5905-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Hojas bambú sobre torre piedras zen blancas con reflejo (HSCZ94004): https://www.elhogardetusuenos.com/productos/9563-happystor-hscz94004-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Bambú con piedras y agua turquesa (Blindecor W-Z-28223): https://www.elhogardetusuenos.com/productos/6718-blindecor-w-z-28223-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Bosque de bambú junto a lago, tonos azules/grises (Blindecor W-Z-47466): https://www.elhogardetusuenos.com/productos/6768-blindecor-w-z-47466-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Estatua de Buda con bambú y piedras zen (HSCZ94006): https://www.elhogardetusuenos.com/productos/9565-happystor-hscz94006-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Dunas de arena onduladas tipo jardín zen (HSCZ78005): https://www.elhogardetusuenos.com/productos/9738-happystor-hscz78005-estor-enrollable-estampado-digital-zentejido-traslucido\n" +
      "• Hierba verde con gotas de rocío, primer plano macro (HSCZ94002): https://www.elhogardetusuenos.com/productos/9561-happystor-hscz94002-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Gotas de agua sobre planta acuática, primer plano (Blindecor W-Z-01287): https://www.elhogardetusuenos.com/productos/6764-blindecor-w-z-01287-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Paisaje montañas verdes/azules envueltas en niebla (HSCZ94001): https://www.elhogardetusuenos.com/productos/9560-happystor-hscz94001-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Montañas entre niebla/nubes bajas (Blindecor T2-Z-28489): https://www.elhogardetusuenos.com/productos/6605-blindecor-t2-z-28489-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Skyline urbano siluetas de rascacielos B&N abstracto (HSCZ20702): https://www.elhogardetusuenos.com/productos/9702-happystor-hscz20702-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Silueta persona en cima montaña al atardecer, brazos alzados (HSCZ20701): https://www.elhogardetusuenos.com/productos/9701-happystor-hscz20701-estor-enrollable-estampado-digital-zen-tejido-traslucido\n" +
      "• Horizonte de mar en calma, cielo azul, minimalista (HSCZ78009): https://www.elhogardetusuenos.com/productos/9742-happystor-hscz78009-estor-enrollable-estampado-digital-zentejido-traslucido\n" +
      "• Acantilado costero al atardecer, tonos morados/azules (HSCZ78008): https://www.elhogardetusuenos.com/productos/9741-happystor-hscz78008-estor-enrollable-estampado-digital-zentejido-traslucido\n" +
      "• Primer plano hojas de palmera en sepia/beige (HSCZ78006): https://www.elhogardetusuenos.com/productos/9739-happystor-hscz78006-estor-enrollable-estampado-digital-zentejido-traslucido\n" +
      "• Embarcadero madera sobre mar turquesa, montaña al fondo (Blindecor T3-Z-52322): https://www.elhogardetusuenos.com/productos/6608-blindecor-t3-z-52322-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Embarcadero de madera con farolas al atardecer rosa/azul (Blindecor T3-Z-51211): https://www.elhogardetusuenos.com/productos/6603-blindecor-t3-z-51211-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Embarcadero lago en calma al atardecer, tonos azules (Blindecor T3-Z-40961): https://www.elhogardetusuenos.com/productos/6600-blindecor-t3-z-40961-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Atardecer sobre el mar, sol en el horizonte naranja (Blindecor T3-Z-53213): https://www.elhogardetusuenos.com/productos/6610-blindecor-t3-z-53213-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Atardecer con nubes dramáticas azul y naranja (Blindecor T3-Z-21744): https://www.elhogardetusuenos.com/productos/6609-blindecor-t3-z-21744-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Lago violeta/púrpura al anochecer (Blindecor T3-Z-35294): https://www.elhogardetusuenos.com/productos/6604-blindecor-t3-z-35294-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Piedras en orilla del mar con amanecer dorado (Blindecor T3-Z-88379): https://www.elhogardetusuenos.com/productos/6601-blindecor-t3-z-88379-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido\n" +
      "• Piedras zen blancas apiladas con hoja verde bambú (Blindecor T2-Z-93926): https://www.elhogardetusuenos.com/productos/6599-blindecor-t2-z-93926-estor-enrollable-estampado-digital-basic-zen-tejido-traslucido",
  },


  // ─── ESTORES DIGITALES: INFANTILES (animales, bebé, unicornios) ───────────
  {
    category: "producto",
    title: "Estores digitales infantiles — animales, unicornios, bebé y motivos tiernos (parte 1)",
    content:
      "Categoría estores infantiles: https://www.elhogardetusuenos.com/categorias/8. " +
      "144 productos con diseños para habitaciones de niños. Todos de 80x180 a 200x250 cm en pasos de 5cm, tirador Izquierda o Derecha. " +
      "Animales de safari y selva:\n" +
      "• Fila de animales safari en acuarela pastel: cebra, mono, elefante, jirafa, león, hipopótamo (HSCI28047): https://www.elhogardetusuenos.com/productos/9797-happystor-hsci28047-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Animales safari boceto B&N (elefante, jirafa) (HSCIExc28026): https://www.elhogardetusuenos.com/productos/9759-happystor-hsciexc28026-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Jirafa y animales safari boceto con arcoíris (HSCIExc28027): https://www.elhogardetusuenos.com/productos/9760-happystor-hsciexc28027-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Caras animales asomando: ciervo, león, jirafa, hipopótamo, tigre (HSCI28051): https://www.elhogardetusuenos.com/productos/9801-happystor-hsci28051-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Tortuga verde con torre de animales encima (HSCI91949): https://www.elhogardetusuenos.com/productos/9631-happystor-hsci91949-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Animales safari en jeep rojo por la sabana (Blindecor T3-I-20808): https://www.elhogardetusuenos.com/productos/6518-blindecor-t3-i-20808-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Escena de selva/jungla con tucán, mono, elefante, cebra (Blindecor T3-I-52680): https://www.elhogardetusuenos.com/productos/6524-blindecor-t3-i-52680-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Animales: jirafa, elefante, tortuga, pájaro rosa, ballena (Blindecor T2-I-67743): https://www.elhogardetusuenos.com/productos/6523-blindecor-t2-i-67743-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Tren con animales (jirafa, cebra, elefante, león) en vagones (Blindecor W-I-49663): https://www.elhogardetusuenos.com/productos/6706-blindecor-w-i-49663-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Dos jirafas de dibujos animados, madre e hija (Blindecor T2-I-11482): https://www.elhogardetusuenos.com/productos/6529-blindecor-t2-i-11482-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Jirafa amarilla de dibujos saludando (Blindecor T2-I-71812): https://www.elhogardetusuenos.com/productos/6525-blindecor-t2-i-71812-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Jirafa ilustración clásica infantil, amarilla (Blindecor W-I-54168): https://www.elhogardetusuenos.com/productos/6745-blindecor-w-i-54168-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Jirafa primer plano con lazo rosa, fondo verde lunares (Blindecor W-I-07156): https://www.elhogardetusuenos.com/productos/6708-blindecor-w-i-07156-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Jirafa con conejito en escalera midiendo altura (HSCI28043): https://www.elhogardetusuenos.com/productos/9793-happystor-hsci28043-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Animales en barco/arca tipo arca de Noé: león, cebra, jirafa (Blindecor T3-I-95810): https://www.elhogardetusuenos.com/productos/6526-blindecor-t3-i-95810-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Ballena rosa con corona de flores, medusas y mariposas (HSCI28041): https://www.elhogardetusuenos.com/productos/9791-happystor-hsci28041-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Ballena azul/gris con corona dorada, peces naranjas y azules (HSCI28040): https://www.elhogardetusuenos.com/productos/9790-happystor-hsci28040-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Ballena azul pastel con texto 'lovely' (HSCI20201): https://www.elhogardetusuenos.com/productos/9690-happystor-hsci20201-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Búho posado en rama con estrellas (HSCI97003): https://www.elhogardetusuenos.com/productos/9546-happystor-hsci97003-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Patrón búhos de colores sobre lunares y estrellas pasteles (Blindecor W-I-51615): https://www.elhogardetusuenos.com/productos/6707-blindecor-w-i-51615-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Patrón búhos azules pequeños sobre fondo blanco (Blindecor T2-I-76613): https://www.elhogardetusuenos.com/productos/6522-blindecor-t2-i-76613-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Zorros naranjas repetidos con atrapasueños (HSCI28018): https://www.elhogardetusuenos.com/productos/9722-happystor-hsci28018-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Zorro rodeado de hojas y ramas, tonos tierra (HSCI97001): https://www.elhogardetusuenos.com/productos/9544-happystor-hsci97001-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Zorro con lazo rosa y auriculares, notas musicales (HSCI80010): https://www.elhogardetusuenos.com/productos/9627-happystor-hsci80010-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Erizo con abejas y panal de miel, dibujo lineal (HSCI06662): https://www.elhogardetusuenos.com/productos/9654-happystor-hsci06662-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Conejo boceto lineal 'la vie est belle' con lunares rosas (HSCI66281): https://www.elhogardetusuenos.com/productos/9656-happystor-hsci66281-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Cocodrilos verdes con iconos de selva (HSCI28021): https://www.elhogardetusuenos.com/productos/9725-happystor-hsci28021-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Mapache con corazones, tonos grises/marrones (HSCI97002): https://www.elhogardetusuenos.com/productos/9545-happystor-hsci97002-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "Unicornios y fantasía:\n" +
      "• Cara unicornio dorado con corona de flores y texto 'Unicorn' (HSCI28050): https://www.elhogardetusuenos.com/productos/9800-happystor-hsci28050-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Unicornios/ciervos en B&N con corazones (HSCIExc028010): https://www.elhogardetusuenos.com/productos/9579-happystor-hsciexc028010-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Caticorn: gato con cuerno unicornio, arcoíris y nubes (HSCI80483): https://www.elhogardetusuenos.com/productos/9655-happystor-hsci80483-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Hada/bailarina con tutú rosa y alas (HSCIExc28032): https://www.elhogardetusuenos.com/productos/9765-happystor-hsciexc28032-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Hada de pelo rosa volando sobre golondrina entre flores (HSCI98008): https://www.elhogardetusuenos.com/productos/9646-happystor-hsci98008-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Bebé dragón morado con mariposas de colores (Blindecor T2-I-31368): https://www.elhogardetusuenos.com/productos/6528-blindecor-t2-i-31368-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Sirenas y peces geométrico nórdico, azul petróleo y mostaza (HSCI98009): https://www.elhogardetusuenos.com/productos/9647-happystor-hsci98009-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "Dinosaurios (muy buscados):\n" +
      "• Dinosaurios siluetas en contorno negro, varias especies (HSCI28038): https://www.elhogardetusuenos.com/productos/9788-happystor-hsci28038-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Dinosaurios y cactus coloridos estilo tropical (HSCIExc28029): https://www.elhogardetusuenos.com/productos/9762-happystor-hsciexc28029-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Dinosaurios en azul/turquesa con texto 'DINO' patrón (HSCI97020): https://www.elhogardetusuenos.com/productos/9637-happystor-hsci97020-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Dinosaurios en verde/morado/gris con cactus, pasteles (HSCI97007): https://www.elhogardetusuenos.com/productos/9549-happystor-hsci97007-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Dinosaurios de colores sobre fondo azul turquesa (Blindecor T3-I-68463): https://www.elhogardetusuenos.com/productos/6516-blindecor-t3-i-68463-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido",
  },

  // ─── ESTORES DIGITALES: INFANTILES (espacio, vehículos, abecedario, otros) ─
  {
    category: "producto",
    title: "Estores digitales infantiles — espacio, vehículos, abecedario, arcoíris y patrones (parte 2)",
    content:
      "Categoría estores infantiles: https://www.elhogardetusuenos.com/categorias/8. " +
      "Espacio y aventura nocturna:\n" +
      "• Luna creciente azul oscuro con estrellas doradas y farolillo (HSCI28049): https://www.elhogardetusuenos.com/productos/9799-happystor-hsci28049-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Estrellas, luna y cohetes colgando, tema espacial (HSCI97004): https://www.elhogardetusuenos.com/productos/9547-happystor-hsci97004-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Pequeñas figuras de astronautas en filas, gris claro (HSCI97006): https://www.elhogardetusuenos.com/productos/9548-happystor-hsci97006-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Niños en cohete verde volando por cielo nocturno (Blindecor T3-I-28602): https://www.elhogardetusuenos.com/productos/6527-blindecor-t3-i-28602-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Niño mirando por telescopio hacia estrellas amarillas (HSCI98005): https://www.elhogardetusuenos.com/productos/9643-happystor-hsci98005-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Elefante azul con gorro de fiesta sobre pila de libros y estrellas (HSCI98004): https://www.elhogardetusuenos.com/productos/9642-happystor-hsci98004-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Elefante gris durmiendo bajo luna con conejito encima (HSCI98003): https://www.elhogardetusuenos.com/productos/9641-happystor-hsci98003-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Elefantito en acuarela sobre luna creciente alcanzando estrella (HSCI28042): https://www.elhogardetusuenos.com/productos/9792-happystor-hsci28042-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Nube azul de la que cuelgan planeta, estrellas, sol, luna (HSCI28045): https://www.elhogardetusuenos.com/productos/9795-happystor-hsci28045-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Osito con gorro de dormir sobre luna creciente amarilla (Blindecor T2-I-56827): https://www.elhogardetusuenos.com/productos/6521-blindecor-t2-i-56827-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Bebé dormido sobre nube blanca con estrellas, fondo azul (Blindecor T2-I-52681): https://www.elhogardetusuenos.com/productos/6502-blindecor-t2-i-52681-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Niño en pijama y gato blanco en tejado bajo luna y estrellas (HSCI98007): https://www.elhogardetusuenos.com/productos/9645-happystor-hsci98007-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Niño montado a caballito sobre gato gris bajo luna (HSCI98001): https://www.elhogardetusuenos.com/productos/9640-happystor-hsci98001-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Ovejitas sobre fondo azul cielo con nubes y estrellas (HSCI97023): https://www.elhogardetusuenos.com/productos/9657-happystor-hsci97023-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "Vehículos y transporte:\n" +
      "• Helicópteros y aviones de colores con nubes (HSCI98002): https://www.elhogardetusuenos.com/productos/9658-happystor-hsci98002-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Coches y vehículos de colores, patrón tipo tráfico (HSCI97016): https://www.elhogardetusuenos.com/productos/9634-happystor-hsci97016-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Niño marinero navegando en barca con foca, náutico (HSCI97015): https://www.elhogardetusuenos.com/productos/9729-happystor-hsci97015-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Niño marinero de pie con camiseta de rayas, náutico (HSCI80040): https://www.elhogardetusuenos.com/productos/9689-happystor-hsci80040-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Autobús escolar amarillo 'School Bus' con niños y globos (HSCI06846): https://www.elhogardetusuenos.com/productos/9648-happystor-hsci06846-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "Abecedario y educativo:\n" +
      "• Abecedario letras mayúsculas y minúsculas A-Z + números 1-10, colores (HSCI97027): https://www.elhogardetusuenos.com/productos/9808-happystor-hsci97027-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Abecedario letras multicolor arcoíris (HSCIExc28025): https://www.elhogardetusuenos.com/productos/9758-happystor-hsciexc28025-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Abecedario letras en azul marino fondo blanco, sobrio (HSCI28011): https://www.elhogardetusuenos.com/productos/9715-happystor-hsci28011-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "Arcoíris, corazones y globos:\n" +
      "• Arcoíris kawaii con sol y nube sonrientes (HSCI28039): https://www.elhogardetusuenos.com/productos/9789-happystor-hsci28039-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Arcoíris pastel repetidos en tonos rosados (HSCI28022): https://www.elhogardetusuenos.com/productos/9726-happystor-hsci28022-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Arcoíris pastel repetidos con nubes y corazones (HSCIExc28034): https://www.elhogardetusuenos.com/productos/9767-happystor-hsciexc28034-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Globos aerostáticos de colores con animalitos en cesta (HSCI28052): https://www.elhogardetusuenos.com/productos/9802-happystor-hsci28052-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Globo aerostático entre nubes, cielo celeste (HSCIExc28035): https://www.elhogardetusuenos.com/productos/9768-happystor-hsciexc28035-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Globos aerostáticos con monos viajando, fondo azul pastel (HSCIExc28028): https://www.elhogardetusuenos.com/productos/9761-happystor-hsciexc28028-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Globos aerostáticos en tonos beige/tostado, neutros (HSCI97009): https://www.elhogardetusuenos.com/productos/9551-happystor-hsci97009-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Corazones en acuarela pastel esparcidos (HSCI28054): https://www.elhogardetusuenos.com/productos/9804-happystor-hsci28054-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Nube rosa sonriente kawaii de la que caen corazones (HSCI28053): https://www.elhogardetusuenos.com/productos/9803-happystor-hsci28053-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Corazones rosas colgando de ramas sobre crema (Blindecor W-I-27276): https://www.elhogardetusuenos.com/productos/6726-blindecor-w-i-27276-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "Patrones y personajes varios:\n" +
      "• Estrellas kawaii sonrientes en pastel con lunares (HSCI28055): https://www.elhogardetusuenos.com/productos/9805-happystor-hsci28055-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Estrellas boceto a mano negro/blanco/amarillo (HSCI97024): https://www.elhogardetusuenos.com/productos/9807-happystor-hsci97024-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Monstruos dibujos animados azul/turquesa/rosa, texto 'MONSTER' (HSCI97021): https://www.elhogardetusuenos.com/productos/9638-happystor-hsci97021-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Robots rosa/rojo y azul con corazones, patrón (HSCI97022): https://www.elhogardetusuenos.com/productos/9639-happystor-hsci97022-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Monos azules y amarillos, patrón repetido (HSCI97018): https://www.elhogardetusuenos.com/productos/9636-happystor-hsci97018-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Gatos y perros de colores (rosa, turquesa, amarillo) patrón (HSCI2387): https://www.elhogardetusuenos.com/productos/9505-happystor-hsci2387-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Alicia en el País de las Maravillas sobre taza de té con corazones (HSCI75719): https://www.elhogardetusuenos.com/productos/9649-happystor-hsci75719-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Mapa de aventuras infantil: castillo, río, globo aerostático (HSCIExc28031): https://www.elhogardetusuenos.com/productos/9764-happystor-hsciexc28031-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Niña bailarina con tutú rosa sobre gran corazón rosa (HSCI84829): https://www.elhogardetusuenos.com/productos/9630-happystor-hsci84829-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Oveja durmiendo con pijama de rayas y texto 'ZZZ' (Blindecor W-I-60513): https://www.elhogardetusuenos.com/productos/6746-blindecor-w-i-60513-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Casita de pájaros y arbolito con pájaros, cielo azul con sol (Blindecor W-I-93570): https://www.elhogardetusuenos.com/productos/6725-blindecor-w-i-93570-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Niños cogidos de la mano entre flores, cielo azul (Blindecor T1-I-78216): https://www.elhogardetusuenos.com/productos/6530-blindecor-t1-i-78216-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Niño volando cometa de colores entre nubes (HSCI98006): https://www.elhogardetusuenos.com/productos/9644-happystor-hsci98006-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Escena habitación de bebé: luna, estrellas, cochecito, osito y globo (HSCI51200): https://www.elhogardetusuenos.com/productos/9626-happystor-hsci51200-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Iconos de bebé: ropita, biberón, sonajero, letras ABC, pastel (Blindecor T2-I-10983): https://www.elhogardetusuenos.com/productos/6507-blindecor-t2-i-10983-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• 'It's a girl': guirnalda con chupetes, biberón y accesorios bebé (Blindecor T2-I-93053): https://www.elhogardetusuenos.com/productos/6505-blindecor-t2-i-93053-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Niña boceto lineal con texto 'love' y lazo rosa (HSCI80030): https://www.elhogardetusuenos.com/productos/9688-happystor-hsci80030-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• León de dibujos animados en marco sobre fondo rosa con lunares (HSCIExc28033): https://www.elhogardetusuenos.com/productos/9766-happystor-hsciexc28033-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Pueblo de casitas en tonos rosa/rojo, patrón ciudad infantil (HSCI97017): https://www.elhogardetusuenos.com/productos/9635-happystor-hsci97017-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Escena de granja: ovejas, gallinas, conejos, casita (Blindecor T3-I-07937): https://www.elhogardetusuenos.com/productos/6514-blindecor-t3-i-07937-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Rana tocando violín entre juncos, estanque (Blindecor W-I-20294): https://www.elhogardetusuenos.com/productos/6744-blindecor-w-i-20294-estor-enrollable-estampado-digital-infantil-basic-tejido-traslucido\n" +
      "• Gatos/zorros multicolor (rosa, turquesa, amarillo, naranja) en filas folk (HSCI12387): https://www.elhogardetusuenos.com/productos/9653-happystor-hsci12387-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Cielo azul con nubes blancas y pájaros volando (HSCI97010): https://www.elhogardetusuenos.com/productos/9552-happystor-hsci97010-estor-enrollable-estampado-digital-infantil-tejido-traslucido\n" +
      "• Niña regando flores con texto 'I love my garden' (HSCI79010): https://www.elhogardetusuenos.com/productos/9651-happystor-hsci79010-estor-enrollable-estampado-digital-infantil-tejido-traslucido",
  },

  // ─── ESTORES DIGITALES: JUVENILES ────────────────────────────────────────
  {
    category: "producto",
    title: "Estores digitales juveniles — deporte, música, skate, arte y mapas",
    content:
      "Categoría estores juveniles: https://www.elhogardetusuenos.com/categorias/22. " +
      "57 productos para habitaciones de adolescentes y jóvenes. " +
      "Deportes extremos y acción:\n" +
      "• Skater: nube de palabras deportivas + silueta skater saltando (HSCJ16047): https://www.elhogardetusuenos.com/productos/9664-happystor-hscj16047-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Skate: texto 'SKATE' grafiti + tabla de skate roja y amarilla (HSCJExc048005): https://www.elhogardetusuenos.com/productos/9589-happystor-hscjexc048005-estor-enrollable-estampado-digital-juvenil-tejido-traslucido\n" +
      "• Skater saltando en truco con estela de colores (Blindecor T2-J-40672): https://www.elhogardetusuenos.com/productos/6536-blindecor-t2-j-40672-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Skater nube de palabras 'success' (Blindecor W-J-16047): https://www.elhogardetusuenos.com/productos/6711-blindecor-w-j-16047-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• BMX: ciclista en salto/truco, silueta naranja/negra, fondo urbano (Blindecor W-J-87564): https://www.elhogardetusuenos.com/productos/6709-blindecor-w-j-87564-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• BMX: ciclista en salto fondo verde/turquesa neón (Blindecor T2-J-86114): https://www.elhogardetusuenos.com/productos/6545-blindecor-t2-j-86114-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• BMX: ciclista en salto fondo azul/gris, texto 'SPORT' (Blindecor T2-J-29882): https://www.elhogardetusuenos.com/productos/6539-blindecor-t2-j-29882-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Motocross: moto en salto con fuego/humo, 'EXTREME SPORT' (Blindecor T3-J-46931): https://www.elhogardetusuenos.com/productos/6542-blindecor-t3-j-46931-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Motocross: motociclista en truco, fondo circular de colores (Blindecor T2-J-15064): https://www.elhogardetusuenos.com/productos/6541-blindecor-t2-j-15064-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Snowboard: snowboarder en salto, texto 'Snow' con estela multicolor (Blindecor T2-J-27908): https://www.elhogardetusuenos.com/productos/6543-blindecor-t2-j-27908-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Fútbol: balón de fútbol entrando en portería (HSCJExc048001): https://www.elhogardetusuenos.com/productos/9585-happystor-hscjexc048001-estor-enrollable-estampado-digital-juvenil-tejido-traslucido\n" +
      "• Futbolista/deportista saltando con balón y estela multicolor (Blindecor T2-J-37724): https://www.elhogardetusuenos.com/productos/6544-blindecor-t2-j-37724-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "Música, baile y arte:\n" +
      "• Rock Concert: cartel estilo grunge B&N con guitarra (HSCJ10851): https://www.elhogardetusuenos.com/productos/9663-happystor-hscj10851-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Rock: guitarra eléctrica y músico rockero con notas musicales (Blindecor T2-J-66807): https://www.elhogardetusuenos.com/productos/6538-blindecor-t2-j-66807-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Bailarín silueta multicolor psicodélica haciendo el pino (HSCJ27849): https://www.elhogardetusuenos.com/productos/9666-happystor-hscj27849-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Festival: siluetas gente bailando con mariposas, degradado colores (HSCJ20978): https://www.elhogardetusuenos.com/productos/9665-happystor-hscj20978-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Festival: siluetas personas bailando con salpicaduras de pintura (Blindecor W-J-45957): https://www.elhogardetusuenos.com/productos/6752-blindecor-w-j-45957-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Gimnasta/bailarina en pose en remolino de pintura turquesa (Blindecor W-J-22126): https://www.elhogardetusuenos.com/productos/6751-blindecor-w-j-22126-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Dance: bailarín en salto con ropa a rayas, texto 'DanceST' (Blindecor T2-J-37728): https://www.elhogardetusuenos.com/productos/6540-blindecor-t2-j-37728-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Holi: silueta persona saltando con salpicaduras de pintura de colores (Blindecor T2-J-47778): https://www.elhogardetusuenos.com/productos/6549-blindecor-t2-j-47778-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Holi: siluetas personas saltando en el aire con pintura multicolor (Blindecor T2-J-29414): https://www.elhogardetusuenos.com/productos/6548-blindecor-t2-j-29414-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Grafiti: texto tipo pintada en letras de colores con salpicaduras (Blindecor T2-J-42503): https://www.elhogardetusuenos.com/productos/6547-blindecor-t2-j-42503-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Explosión de color: salpicadura abstracta sobre fondo blanco (Blindecor W-J-44356): https://www.elhogardetusuenos.com/productos/6710-blindecor-w-j-44356-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Bailarina en salto con estela de pintura multicolor (Blindecor T2-J-37673): https://www.elhogardetusuenos.com/productos/6546-blindecor-t2-j-37673-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Lápices de colores arcoíris con trazos garabateados (Blindecor T2-J-57425): https://www.elhogardetusuenos.com/productos/6534-blindecor-t2-j-57425-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Gadgets tecnológicos: auriculares, cámara, teléfono, gafas, skate, doodle colorido (Blindecor T2-J-87318): https://www.elhogardetusuenos.com/productos/6535-blindecor-t2-j-87318-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Siluetas de niños bailando/jugando en colores vivos (Blindecor W-J-81396): https://www.elhogardetusuenos.com/productos/6753-blindecor-w-j-81396-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "Mapas, viajes y motivos variados:\n" +
      "• Mapamundi en acuarela con colores vivos arcoíris (HSCJ80050): https://www.elhogardetusuenos.com/productos/9809-happystor-hscj80050-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Mapamundi en tonos grises, estilo dibujo técnico (HSCJ96003): https://www.elhogardetusuenos.com/productos/9695-happystor-hscj96003-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Señales de carretera/postes de dirección con nombres de ciudades (HSCJExc048006): https://www.elhogardetusuenos.com/productos/9590-happystor-hscjexc048006-estor-enrollable-estampado-digital-juvenil-tejido-traslucido\n" +
      "• Highway 79: cartel vintage tipo señal autopista americana (HSCJ80070): https://www.elhogardetusuenos.com/productos/9672-happystor-hscj80070-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• American Products: logo vintage gasolinera americana grunge (HSCJ80060): https://www.elhogardetusuenos.com/productos/9671-happystor-hscj80060-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Asfalto/carretera: textura pavimento gris con marcas viales (HSCJ96008): https://www.elhogardetusuenos.com/productos/9673-happystor-hscj96008-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Tigre blanco en ilustración B&N detallada (HSCJ96006): https://www.elhogardetusuenos.com/productos/9812-happystor-hscj96006-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Gato silueta minimalista negro sobre blanco (HSCJ96005): https://www.elhogardetusuenos.com/productos/9811-happystor-hscj96005-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Panda retrato puntillista B&N (HSCJ98003): https://www.elhogardetusuenos.com/productos/9677-happystor-hscj98003-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Zapatillas tipo Converse en franjas verticales de colores (Blindecor W-J-59128): https://www.elhogardetusuenos.com/productos/6727-blindecor-w-j-59128-estor-enrollable-estampado-digital-basic-juvenil-tejido-traslucido\n" +
      "• Zapatillas deportivas multicolor patrón repetido (Blindecor: patines básico juvenil): https://www.elhogardetusuenos.com/productos/6533-estor-enrollable-blindecor-basic-juvenil-zapatillas\n" +
      "• Patines de ruedas (roller skates) blancos/rosas, estilo vintage: https://www.elhogardetusuenos.com/productos/6532-estor-traslucido-patines-basic-juvenil\n" +
      "• Rayos/relámpagos en zigzag amarillo/mostaza sobre blanco (HSCJ96007): https://www.elhogardetusuenos.com/productos/9813-happystor-hscj96007-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Noria/rueda de la fortuna silueta minimalista negra (HSCJ96004): https://www.elhogardetusuenos.com/productos/9810-happystor-hscj96004-estor-enrollable-estampado-digital-juveniles-tejido-traslucido\n" +
      "• Plumas de colores en abanico, estilo boho colorido (HSCJExc048004): https://www.elhogardetusuenos.com/productos/9588-happystor-hscjexc048004-estor-enrollable-estampado-digital-juvenil-tejido-traslucido",
  },

  // ─── ESTORES DIGITALES: ESTAMPADOS FANTASÍA ──────────────────────────────
  {
    category: "producto",
    title: "Estores digitales estampados/fantasía — geométrico, mármol, botánico, flores y rayas",
    content:
      "Categoría estores estampados y fantasía: https://www.elhogardetusuenos.com/categorias/12. " +
      "56 productos con diseños decorativos modernos para cualquier habitación. " +
      "Geométricos y mármol:\n" +
      "• Zigzag/chevron blanco y negro líneas finas — 7 colores: Negro, Amarillo, Marrón, Rojo, Verde, Azul, Lila (ZIGY): https://www.elhogardetusuenos.com/productos/9867-happystor-zigy-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Chevron/flechas B&N a gran escala tipo 'V' — 7 colores disponibles (DELTA): https://www.elhogardetusuenos.com/productos/9866-happystor-delta-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Mármol abstracto naranja/ágata, vetas onduladas beige y blanco (SAHARA): https://www.elhogardetusuenos.com/productos/9863-happystor-sahara-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Pinceladas/vetas diagonales blanco y gris, efecto mármol (RODAS): https://www.elhogardetusuenos.com/productos/9862-happystor-rodas-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Mármol abstracto lila/morado y blanco, vetas fluidas (NEBULA): https://www.elhogardetusuenos.com/productos/9858-happystor-nebula-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Mármol abstracto azul, gris y dorado, vetas fluidas (CASCADA): https://www.elhogardetusuenos.com/productos/9843-happystor-cascada-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Mármol/ágata turquesa y dorado, vetas fluidas (AQUA): https://www.elhogardetusuenos.com/productos/9840-happystor-aqua-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Mosaico/ladrillo irregular gris y beige (MYKONOS): https://www.elhogardetusuenos.com/productos/9857-happystor-mykonos-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Enrejado/ogee geométrico verde sobre fondo blanco (ITAKA): https://www.elhogardetusuenos.com/productos/9852-happystor-itaka-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Ikat/paisley azul y blanco, motivos ornamentales curvos (LARISA): https://www.elhogardetusuenos.com/productos/9854-happystor-larisa-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Ondas/pliegues geométrico blanco 3D tono sobre tono (ONDARA): https://www.elhogardetusuenos.com/productos/9861-happystor-ondara-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Ondas/cintas onduladas blancas 3D (ATENAS): https://www.elhogardetusuenos.com/productos/9842-happystor-atenas-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Damasco floral sutil beige/crema tono sobre tono (ARGOS): https://www.elhogardetusuenos.com/productos/9841-happystor-argos-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Trenzado/cestería beige/crema geométrico sutil (EGINA): https://www.elhogardetusuenos.com/productos/9848-happystor-egina-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Zigzag/chevron en gris y azul (Deco 1): https://www.elhogardetusuenos.com/productos/9746-happystor-deco-1-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Zigzag/chevron pastel: rosa, negro, lila, blanco (ZigZag): https://www.elhogardetusuenos.com/productos/9537-happystor-zigzag-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Diamantes/rombos en pastel: turquesa, rosa, lila (Diamantes): https://www.elhogardetusuenos.com/productos/9538-happystor-diamantes-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Triángulos/mosaico en degradado gris a blanco (Flores 1): https://www.elhogardetusuenos.com/productos/9539-happystor-flores-1-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Cuadro vichy/tejido fino beige/crema (Vichy): https://www.elhogardetusuenos.com/productos/9529-happystor-vichy-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Pequeños lunares/motas beige sobre blanco (Motas): https://www.elhogardetusuenos.com/productos/9527-happystor-motas-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Pequeños puntos/lunares grises sobre blanco (IOS): https://www.elhogardetusuenos.com/productos/9851-happystor-ios-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Estrellas/motas azul oscuro y gris sobre blanco (DELFOS): https://www.elhogardetusuenos.com/productos/9847-happystor-delfos-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Estrellas pequeñas azul claro sobre blanco (Stars): https://www.elhogardetusuenos.com/productos/9528-happystor-stars-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Rayas verticales finas crema/beige sobre blanco (Listas): https://www.elhogardetusuenos.com/productos/9755-happystor-listas-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Rayas finas verticales azul claro/celeste, pinstripe sutil (MilRayas): https://www.elhogardetusuenos.com/productos/9526-happystor-milrayas-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Abanicos/conchas gris y blanco (Acacia): https://www.elhogardetusuenos.com/productos/9704-happystor-acacia-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Medallones florales lila/gris sobre blanco (Amelia): https://www.elhogardetusuenos.com/productos/9705-happystor-amelia-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Mandala ornamental azul sobre blanco (Mandala): https://www.elhogardetusuenos.com/productos/9756-happystor-mandala-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "Botánico y floral:\n" +
      "• Hojas/plumas blancas sobre fondo rosa palo/malva (TRIPOLI): https://www.elhogardetusuenos.com/productos/9865-happystor-tripoli-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Hojas verde oscuro y bayas blancas sobre fondo terracota (SIROS): https://www.elhogardetusuenos.com/productos/9864-happystor-siros-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Hojas tropicales y flores naranja/verde azulado, borde inferior (NISYROS): https://www.elhogardetusuenos.com/productos/9859-happystor-nisyros-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Flores de lirio dibujo lineal gris claro sobre blanco, monocromo (LESBOS): https://www.elhogardetusuenos.com/productos/9855-happystor-lesbos-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Pequeñas hojas/plumas terracota sobre fondo blanco (KIOS): https://www.elhogardetusuenos.com/productos/9853-happystor-kios-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Flores iris azul/gris sobre celeste claro, acuarela (IKARIA): https://www.elhogardetusuenos.com/productos/9850-happystor-ikaria-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Flores margarita dibujo lineal blanco sobre blanco, sutil (ELISE): https://www.elhogardetusuenos.com/productos/9849-happystor-elise-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Peonías/rosas dibujo lineal B&N estilo botánico clásico (CITERA): https://www.elhogardetusuenos.com/productos/9844-happystor-citera-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Formas orgánicas/hojas blancas sutil relieve (OLIMPIA): https://www.elhogardetusuenos.com/productos/9860-happystor-olimpia-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Corazones/formas geométricas pequeñas naranjas sobre blanco (MICENAS): https://www.elhogardetusuenos.com/productos/9856-happystor-micenas-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Malla/puntos muy sutil blanco sobre blanco (CRETA): https://www.elhogardetusuenos.com/productos/9846-happystor-creta-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Rejilla/puntos muy sutil blanco sobre blanco (CORINTIO): https://www.elhogardetusuenos.com/productos/9845-happystor-corintio-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Helechos/hojas ilustradas en colores variados: rojo, verde, naranja (HSCFExc078003): https://www.elhogardetusuenos.com/productos/9602-happystor-hscfexc078003-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Flores turquesa y amarillo con hojas verdes (HSCFExc078002): https://www.elhogardetusuenos.com/productos/9601-happystor-hscfexc078002-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Pequeñas flores/racimos morado y naranja (HSCFExc078001): https://www.elhogardetusuenos.com/productos/9600-happystor-hscfexc078001-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Rosas dibujo lineal negro con detalles rosa/naranja, boceto botánico (Flores 2): https://www.elhogardetusuenos.com/productos/9543-happystor-flores-2-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Hojas tropicales monstera/palma verde sobre blanco (Hojas 2): https://www.elhogardetusuenos.com/productos/9542-happystor-hojas-2-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Bosque de pinos en verdes, degradado hacia blanco arriba (Bosque): https://www.elhogardetusuenos.com/productos/9541-happystor-bosque-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Ramas y hojas dibujo lineal fino gris sobre blanco (Hojas 1): https://www.elhogardetusuenos.com/productos/9540-happystor-hojas-1-estor-enrollable-estampado-digital-fantasia-tejido-traslucido\n" +
      "• Ramas y hojas gris/verde oliva sobre blanco (Hojas 6): https://www.elhogardetusuenos.com/productos/9754-happystor-hojas-6-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Ramas y hojas gris oscuro sobre blanco (Hojas 5): https://www.elhogardetusuenos.com/productos/9753-happystor-hojas-5-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Hojas/plumas mostaza sobre blanco (Hojas 4): https://www.elhogardetusuenos.com/productos/9752-happystor-hojas-4-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Pequeñas hojas y ramas verdes sobre blanco (Hojas 3): https://www.elhogardetusuenos.com/productos/9751-happystor-hojas-3-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Hojas de palmera en acuarela azul/turquesa claro (Palmeras): https://www.elhogardetusuenos.com/productos/9757-happystor-palmeras-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Pequeños tulipanes/flores rosas sobre blanco (Tulipanes): https://www.elhogardetusuenos.com/productos/9750-happystor-tulipanes-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Pequeñas flores azules dispersas sobre blanco (Jade): https://www.elhogardetusuenos.com/productos/9749-happystor-jade-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Dalias/flores azules grandes estilo acuarela (Dalia): https://www.elhogardetusuenos.com/productos/9748-happystor-dalia-estor-enrollable-estampado-digital-fantasiatejido-traslucido\n" +
      "• Pinceladas verticales multicolor: turquesa, naranja, rosa, acuarela (Deco 2): https://www.elhogardetusuenos.com/productos/9747-happystor-deco-2-estor-enrollable-estampado-digital-fantasiatejido-traslucido",
  },

  // ─── ESTORES DIGITALES: VARIOS ────────────────────────────────────────────
  {
    category: "producto",
    title: "Estores digitales varios — abstracto, arte, mariposas, música, naturaleza y más",
    content:
      "Categoría estores varios: https://www.elhogardetusuenos.com/categorias/11. " +
      "38 productos con motivos variados — arte abstracto, fotografías artísticas, naturaleza y más. " +
      "Abstracto y arte digital:\n" +
      "• Explosión de pintura multicolor splash arcoíris sobre blanco (HSCV80030): https://www.elhogardetusuenos.com/productos/9835-happystor-hscv80030-estor-enrollable-estampado-digital-varios-tejido-traslucido\n" +
      "• Mármol abstracto rosa, malva y turquesa, fluid art (HSCV68008): https://www.elhogardetusuenos.com/productos/9834-happystor-hscv68008-estor-enrollable-estampado-digital-varios-tejido-traslucido\n" +
      "• Mármol abstracto rosa/malva/turquesa, mismo estilo (HSCV20601): https://www.elhogardetusuenos.com/productos/9700-happystor-hscv20601-estor-enrollable-estampado-digital-varios-tejido-traslucido\n" +
      "• Mandala/medallón oriental marrón y beige, mosaico marroquí (HSCV68006): https://www.elhogardetusuenos.com/productos/9735-happystor-hscv68006-estor-enrollable-estampado-digital-variostejido-traslucido\n" +
      "• Geometría low-poly triángulos facetados azules (HSCV99001): https://www.elhogardetusuenos.com/productos/9679-happystor-hscv99001-estor-enrollable-estampado-digital-varios-tejido-traslucido\n" +
      "• Geometría low-poly triángulos azul, verde y blanco (HSCV1575): https://www.elhogardetusuenos.com/productos/9516-happystor-hscv1575-estor-enrollable-estampado-digital-varios-tejido-traslucido\n" +
      "• Cintas abstractas verdes y azules con destellos bokeh (HSCV4340): https://www.elhogardetusuenos.com/productos/9520-happystor-hscv4340-estor-enrollable-estampado-digital-varios-tejido-traslucido\n" +
      "• Líneas y círculos abstractos magenta/rosa sobre lila (HSCV6892): https://www.elhogardetusuenos.com/productos/9519-happystor-hscv6892-estor-enrollable-estampado-digital-varios-tejido-traslucido\n" +
      "• Cinta/onda fluida degradado de morado a verde (HSCV3103): https://www.elhogardetusuenos.com/productos/9518-happystor-hscv3103-estor-enrollable-estampado-digital-varios-tejido-traslucido\n" +
      "• Cinta arcoíris retorcida (rojo, naranja, verde, azul) sobre blanco (Blindecor T3-V-48034): https://www.elhogardetusuenos.com/productos/6625-blindecor-t3-v-48034-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Onda abstracta fluida líneas magenta/púrpura sobre gris (Blindecor W-V-04485): https://www.elhogardetusuenos.com/productos/6759-blindecor-w-v-04485-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Onda/remolino colores arcoíris (rosa, amarillo, verde) sobre blanco (Blindecor W-V-15744): https://www.elhogardetusuenos.com/productos/6760-blindecor-w-v-15744-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Cinta/onda rojo, naranja y amarillo efecto fluido (Blindecor W-V-28517): https://www.elhogardetusuenos.com/productos/6731-blindecor-w-v-28517-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Humo/tinta colores naranja, morado y azul sobre blanco (Blindecor W-V-14658): https://www.elhogardetusuenos.com/productos/6715-blindecor-w-v-14658-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Humo/tinta arcoíris (rojo, naranja, amarillo, verde) fluyendo (Blindecor T2-V-74464): https://www.elhogardetusuenos.com/productos/6615-blindecor-t2-v-74464-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Humo/tinta colores fríos (azul, morado) sobre blanco (Blindecor T1-V-63775): https://www.elhogardetusuenos.com/productos/6614-blindecor-t1-v-63775-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Espiral hipnótica blanco y negro, óptico tipo remolino (Blindecor T3-V-82773): https://www.elhogardetusuenos.com/productos/6616-blindecor-t3-v-82773-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Esferas metálicas plateadas B&N formando patrón geométrico (Blindecor T3-V-X9150): https://www.elhogardetusuenos.com/productos/6623-blindecor-t3-v-x9150-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "Naturaleza y fotografía artística:\n" +
      "• Floral botánico blanco con hojas verdes y flores pequeñas, delicado (HSCV68007): https://www.elhogardetusuenos.com/productos/9736-happystor-hscv68007-estor-enrollable-estampado-digital-variostejido-traslucido\n" +
      "• Sol boho con rayos mostaza/dorado sobre blanco, bohemio (HSCV68005): https://www.elhogardetusuenos.com/productos/9734-happystor-hscv68005-estor-enrollable-estampado-digital-variostejido-traslucido\n" +
      "• Arcoíris boho pastel (rosa, melocotón, verde salvia) en dormitorio infantil (HSCV68003): https://www.elhogardetusuenos.com/productos/9732-happystor-hscv68003-estor-enrollable-estampado-digital-variostejido-traslucido\n" +
      "• Flores azul/lila con mariposas sobre blanco, botánico delicado (HSCV68002): https://www.elhogardetusuenos.com/productos/9731-happystor-hscv68002-estor-enrollable-estampado-digital-variostejido-traslucido\n" +
      "• Flores azul/lila con mariposas en escena de cocina (HSCV68001): https://www.elhogardetusuenos.com/productos/9730-happystor-hscv68001-estor-enrollable-estampado-digital-variostejido-traslucido\n" +
      "Ilustración lineal rosas y mariposas B&N (HSCV68004): https://www.elhogardetusuenos.com/productos/9733-happystor-hscv68004-estor-enrollable-estampado-digital-variostejido-traslucido\n" +
      "• Jardín zen japonés arena rastrillada, piedras y mariposa naranja (Blindecor W-V-80852): https://www.elhogardetusuenos.com/productos/6716-blindecor-w-v-80852-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "Fotografía vintage y retro:\n" +
      "• Mariposa/polilla en textura grunge sepia, silueta grande vintage (Blindecor W-V-80853): https://www.elhogardetusuenos.com/productos/6763-blindecor-w-v-80853-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Bicicleta antigua apoyada en pared/puerta rústica, sepia (Blindecor W-V-61663): https://www.elhogardetusuenos.com/productos/6762-blindecor-w-v-61663-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Guitarra fusionada con teclado de piano, sepia/naranja (Blindecor W-V-35696): https://www.elhogardetusuenos.com/productos/6761-blindecor-w-v-35696-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Pareja de delfines B&N con patrón tribal/ornamental (Blindecor W-V-56766): https://www.elhogardetusuenos.com/productos/6732-blindecor-w-v-56766-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Zapato de tacón silueta negra con flores rosas (Blindecor W-V-92958): https://www.elhogardetusuenos.com/productos/6717-blindecor-w-v-92958-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Farolillos de papel chinos multicolor colgando de noche, Hoi An (Blindecor T3-V-89698): https://www.elhogardetusuenos.com/productos/6624-blindecor-t3-v-89698-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Paraguas rojo destacando entre paraguas grises, B&N (Blindecor T3-V-82490): https://www.elhogardetusuenos.com/productos/6622-blindecor-t3-v-82490-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Vías de tren en campo, sepia/vintage rural (Blindecor T3-V-06325): https://www.elhogardetusuenos.com/productos/6621-blindecor-t3-v-06325-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Locomotora de vapor antigua B&N con humo, retro ferroviario (Blindecor T3-V-27795): https://www.elhogardetusuenos.com/productos/6620-blindecor-t3-v-27795-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Bicicleta roja vintage en campo de trigo dorado al atardecer (Blindecor T3-V-02299): https://www.elhogardetusuenos.com/productos/6619-blindecor-t3-v-02299-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Farola de hierro forjado junto al mar, niebla romántica vintage (Blindecor T2-V-X4614): https://www.elhogardetusuenos.com/productos/6618-blindecor-t2-v-x4614-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido\n" +
      "• Piezas de ajedrez en B&N: rey y peones en fila, foto artística (HSCV37019): https://www.elhogardetusuenos.com/productos/9678-happystor-hscv37019-estor-enrollable-estampado-digital-varios-tejido-traslucido\n" +
      "• Perfil de rostro femenino con labios rojos, ilustración moda boceto (Blindecor T2-V-90982): https://www.elhogardetusuenos.com/productos/6617-blindecor-t2-v-90982-estor-enrollable-estampado-digital-basic-varios-tejido-traslucido",
  },

  // ─── FUNDAS NÓRDICAS ──────────────────────────────────────────────────────
  {
    category: "producto",
    title: "Fundas nórdicas — tallas, diseños, colores y precios",
    content:
      "Categoría fundas nórdicas: https://www.elhogardetusuenos.com/categorias/14. " +
      "26 productos. Tallas: 90 cm (cama 90), 135 cm (cama 135), 150 cm (cama 150), 180 cm (cama 180), 200 cm (cama 200). " +
      "La mayoría llevan funda de almohada incluida. Lavado máquina 40°C. " +
      "Diseños disponibles:\n" +
      "• BOHO CHIC — flores/hojas tonos naturales, percal algodón: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• BLOSSOM — flores rosas y lilas acuarela pastel, fondo blanco: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• BLUE STRIPES — rayas anchas azul marino y blanco, nórdico: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• CACTUS — cactus y plantas verdes sobre fondo blanco, juvenil: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• COPO DE NIEVE GRIS — copos de nieve blancos sobre fondo gris: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• CUADROS GRIS VERDE — cuadros/tartán gris y verde suave: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• DOGS — perros bulldogs/razas boceto B&N, juvenil: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• FLAMINGO — flamencos rosados con hojas tropicales: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• FOLK ANIMALS — animales estilo folk escandinavo, multicolor: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• GEOMETRIC — formas geométricas modernas gris y blanco: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• HOJAS VERDE — grandes hojas tropicales verdes sobre blanco: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• LEOPARD — estampado leopardo natural/terracota: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• LLUVIA DE ESTRELLAS — estrellas doradas/amarillas sobre azul noche: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• LUNA STAR — luna creciente y estrellas blancas sobre gris: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• MARIPOSAS — mariposas acuarela multicolor sobre blanco: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• MICROFIBRA LISA — colores lisos: blanco, gris perla, azul, verde: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• MONSTERA — hojas monstera tropical verde oscuro sobre blanco: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• MULTICOLOR GEOMÉTRICO — rombos/patchwork multicolor festivo: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• NARWHAL — narwhal/ballenas ilustradas, fondo azul, infantil: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• NORDIC BEAR — osos polares en estilo escandinavo: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• PATCHWORK — cuadros tipo patchwork colorido, fondo blanco: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• RETRO FLORAL — flores retro vintage, tonos naranja y mostaza: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• ROSA MENTA — diseño bicolor rosa y menta, líneas y punto: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• STARS AZUL — estrellas en gris y blanco sobre azul: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• TROPICAL — hojas tropicales y flores grandes, verde y rosa: https://www.elhogardetusuenos.com/categorias/14\n" +
      "• UNICORNIO — unicornios y arcoíris en pastel, infantil: https://www.elhogardetusuenos.com/categorias/14\n" +
      "Medidas de funda nórdica según cama: cama 90 → funda 90x200 cm; cama 135 → 135x200 cm; cama 150 → 150-160x220 cm; cama 180/200 → 200-220x240 cm.",
  },

  // ─── ROPA DE CAMA ────────────────────────────────────────────────────────
  {
    category: "producto",
    title: "Ropa de cama — sábanas, bajeras, encimeras y fundas de almohada",
    content:
      "Categoría ropa de cama: https://www.elhogardetusuenos.com/categorias/15. " +
      "49 productos. Percal de algodón o microfibra. Lavado a 40°C. " +
      "Juegos de sábanas (bajera + encimera + funda almohada), tallas 90/105/135/150/180/200 cm:\n" +
      "• Juego BOHO CHIC flores naturales, • Juego BLOSSOM flores acuarela pastel, • Juego BLUE STRIPES rayas azul marino, " +
      "• Juego CACTUS plantas verde/blanco, • Juego FLAMINGO flamencos rosas, • Juego GEOMETRIC gris/blanco moderno, " +
      "• Juego HOJAS VERDE tropical, • Juego LEOPARD estampado leopardo, • Juego LUNA STAR luna y estrellas gris, " +
      "• Juego MARIPOSAS acuarela multicolor, • Juego MICROFIBRA LISA (blanco/gris/azul/verde), " +
      "• Juego MONSTERA hoja tropical verde oscuro, • Juego NORDIC BEAR osos escandinavo, " +
      "• Juego RETRO FLORAL naranja/mostaza vintage, • Juego TROPICAL hojas grandes verde/rosa, " +
      "• Juego UNICORNIO unicornios pastel: https://www.elhogardetusuenos.com/categorias/15\n" +
      "Sábanas bajeras sueltas: ajustable microfibra o algodón percal, colores blanco/gris/beige/azul, tallas 90 a 200 cm. " +
      "Encimeras sueltas: percal lisa blanco/crema/gris/azul/beige. " +
      "Fundas almohada: 50x75 y 50x90 cm percal algodón; 50x70 cm microfibra. " +
      "Medidas bajera: cama 90 → 90x200+30 cm; cama 135 → 135x200+30 cm; cama 150 → 150x200+30 cm; cama 180 → 180x200+30 cm.",
  },

  // ─── EDREDONES ───────────────────────────────────────────────────────────
  {
    category: "producto",
    title: "Edredones y rellenos nórdicos — gramajes, tallas y cuidados",
    content:
      "Categoría edredones/rellenos nórdicos: https://www.elhogardetusuenos.com/categorias/16. " +
      "4 productos. Rellenos para usar con funda nórdica. Tallas disponibles: 90, 105, 135, 150, 180, 200 cm. " +
      "• Edredón fibra 200 gr/m² — verano y entretiempo (cálido), ligero: https://www.elhogardetusuenos.com/categorias/16\n" +
      "• Edredón fibra 300 gr/m² — invierno medio, equilibrado: https://www.elhogardetusuenos.com/categorias/16\n" +
      "• Edredón fibra 400 gr/m² — invierno intenso, muy cálido: https://www.elhogardetusuenos.com/categorias/16\n" +
      "• Edredón nórdico reversible — anverso blanco, reverso gris: https://www.elhogardetusuenos.com/categorias/16\n" +
      "Guía de gramaje: 200 gr → primavera/verano; 300 gr → otoño/primavera; 400 gr → invierno. " +
      "El tamaño del edredón debe coincidir con el de la funda nórdica. " +
      "Lavado en lavadora (programa delicado 30°C) si la capacidad es suficiente; edredones grandes mejor en lavandería.",
  },

  // ─── COLCHAS Y PLAIDS ────────────────────────────────────────────────────
  {
    category: "producto",
    title: "Colchas dormitorio y plaids — modelos, colores y medidas",
    content:
      "Categoría colchas y plaids: https://www.elhogardetusuenos.com/categorias/17. " +
      "5 productos. Colchas bouti/acolchadas reversibles para cubrir la cama. " +
      "• Colcha bouti FOLK — geométrico folk, reversible: https://www.elhogardetusuenos.com/categorias/17\n" +
      "• Colcha bouti TROPICAL — hojas tropicales verde/blanco, reversible: https://www.elhogardetusuenos.com/categorias/17\n" +
      "• Colcha bouti LEOPARD — estampado leopardo natural, reversible beige: https://www.elhogardetusuenos.com/categorias/17\n" +
      "• Colcha bouti GEOMETRIC — geométrico moderno gris/blanco, reversible: https://www.elhogardetusuenos.com/categorias/17\n" +
      "• Plaid/manta sofá — textura rústica tonos naturales/grises: https://www.elhogardetusuenos.com/categorias/17\n" +
      "Tallas: cama 90 → 180x260 cm; cama 135 → 230x260 cm; cama 150 → 240x260 cm; cama 180 → 260x260 cm; cama 200 → 280x260 cm. " +
      "Cuidados: lavado 30°C programa delicado, no secadora.",
  },

  // ─── FUNDAS DE COJÍN ─────────────────────────────────────────────────────
  {
    category: "producto",
    title: "Fundas de cojín decorativas — modelos, colores y medidas",
    content:
      "Categoría fundas de cojín: https://www.elhogardetusuenos.com/categorias/21. " +
      "12 productos. Fundas decorativas sin relleno. Cierre cremallera oculta. Lavado 30°C. " +
      "Medidas: 50x50 cm, 45x45 cm, 30x50 cm (lumbar). " +
      "• Funda cojín BOHO CHIC flores naturales acuarela, 50x50 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín TROPICAL hojas monstera verde, 50x50 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín FLAMINGO flamencos rosas, 50x50 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín GEOMETRIC gris y blanco, 50x50 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín FOLK ANIMALS animales folk multicolor, 50x50 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín LEOPARD estampado leopardo terracota, 50x50 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín RETRO FLORAL flores vintage naranja/mostaza, 50x50 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín MARIPOSAS acuarela multicolor, 45x45 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín LUNA STAR luna y estrellas gris/blanco, 45x45 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín CACTUS plantas verde/blanco, 45x45 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín lumbar RAYAS AZUL rayas azul/blanco, 30x50 cm: https://www.elhogardetusuenos.com/categorias/21\n" +
      "• Funda cojín lumbar BOHO rayas y flecos, 30x50 cm: https://www.elhogardetusuenos.com/categorias/21",
  },

  // ─── FUNDAS DE SOFÁ ──────────────────────────────────────────────────────
  {
    category: "producto",
    title: "Fundas de sofá elásticas — modelos, medidas y colores",
    content:
      "Categoría fundas de sofá elásticas: https://www.elhogardetusuenos.com/categorias/20. " +
      "7 productos (algunos pueden estar sin stock, consultar disponibilidad). " +
      "Material: tela elástica spandex/poliéster muy resistente. Se ajusta mediante gomas elásticas en la base. " +
      "Colores disponibles: crema, gris, azul, verde, chocolate. " +
      "• Funda sofá 1 plaza (sofás 70-110 cm ancho): https://www.elhogardetusuenos.com/categorias/20\n" +
      "• Funda sofá 2 plazas (sofás 130-190 cm ancho): https://www.elhogardetusuenos.com/categorias/20\n" +
      "• Funda sofá 3 plazas (sofás 190-230 cm ancho): https://www.elhogardetusuenos.com/categorias/20\n" +
      "• Funda sofá 4 plazas/chaise longue: https://www.elhogardetusuenos.com/categorias/20\n" +
      "• Funda sillón individual: https://www.elhogardetusuenos.com/categorias/20\n" +
      "• Funda chaise longue izquierda: https://www.elhogardetusuenos.com/categorias/20\n" +
      "• Funda chaise longue derecha: https://www.elhogardetusuenos.com/categorias/20\n" +
      "Para medir: ancho total del asiento + respaldo. Lavado 30°C.",
  },

  // ─── MANTAS Y MULTIUSOS ──────────────────────────────────────────────────
  {
    category: "producto",
    title: "Mantas y multiusos salón — modelos y usos",
    content:
      "Categoría mantas y multiusos salón: https://www.elhogardetusuenos.com/categorias/23. " +
      "3 productos. Mantas decorativas para sofá o pie de cama. " +
      "• Manta sofá chenilla suave — crema, gris, azul noche, verde botella, terracota — 130x170 cm: https://www.elhogardetusuenos.com/categorias/23\n" +
      "• Manta rústica cuadros escocés — tartán bicolor con flecos en extremos — 130x170 cm: https://www.elhogardetusuenos.com/categorias/23\n" +
      "• Manta boho flecos — estilo macramé trenzado, crema/natural — 130x160 cm: https://www.elhogardetusuenos.com/categorias/23\n" +
      "Usos: tapar el sofá, decorar pie de cama, manta para noches de frío. Lavado suave 30°C.",
  },

  // ─── ACCESORIOS PARA ESTORES ─────────────────────────────────────────────
  {
    category: "producto",
    title: "Accesorios para estores enrollables — soportes, cadenas y recambios",
    content:
      "Categoría accesorios para estores: https://www.elhogardetusuenos.com/categorias/19. " +
      "8 productos. Recambios y accesorios de instalación. " +
      "• Soporte de techo para estor (montaje en techo en lugar de pared/marco): https://www.elhogardetusuenos.com/categorias/19\n" +
      "• Soporte doble para estor (dos estores en el mismo hueco): https://www.elhogardetusuenos.com/categorias/19\n" +
      "• Cadena de mando recambio beige/blanco, 150 cm: https://www.elhogardetusuenos.com/categorias/19\n" +
      "• Cadena de mando recambio gris, 150 cm: https://www.elhogardetusuenos.com/categorias/19\n" +
      "• Tope/clip seguridad para cadena (normativa infantil): https://www.elhogardetusuenos.com/categorias/19\n" +
      "• Varilla de aluminio recambio tubo enrollador: https://www.elhogardetusuenos.com/categorias/19\n" +
      "• Tapa lateral/embellecedor casete estor (recambio): https://www.elhogardetusuenos.com/categorias/19\n" +
      "• Kit tornillos y tacos para instalación de estores: https://www.elhogardetusuenos.com/categorias/19\n" +
      "Si tienes dudas sobre qué accesorio necesitas, indícanos la marca y modelo del estor.",
  },

  // ─── ENVÍOS ──────────────────────────────────────────────────────────────
  {
    category: "envio",
    title: "Envíos — plazos, transportistas, seguimiento y coste",
    content:
      "Plazos de entrega: los estores enrollables se fabrican a medida — 2-3 días laborables de fabricación + 24-48 h de transporte = total 4-5 días laborables. " +
      "Los textiles (fundas nórdicas, ropa de cama, colchas, fundas de cojín) se envían en 24-48 h hábiles. " +
      "Coste de envío: GRATUITO a partir de 50€ en pedidos a Península. " +
      "Canarias, Baleares, Ceuta y Melilla: consultar coste adicional. " +
      "Transportistas: GLS, Seur o MRW según zona. " +
      "Seguimiento: email con número de seguimiento cuando el pedido salga. " +
      "Consultar pedido en https://www.elhogardetusuenos.com o contactando con nosotros.",
  },

  // ─── DEVOLUCIONES ────────────────────────────────────────────────────────
  {
    category: "devolucion",
    title: "Devoluciones y cambios — política según tipo de producto",
    content:
      "Productos estándar (textiles, mantas, fundas, ropa de cama en stock): " +
      "30 días desde la recepción para devolver en perfecto estado con embalaje original sin usar. " +
      "El envío de devolución corre a cargo del cliente salvo defecto de fábrica. " +
      "Productos a medida (estores enrollables personalizados con tus medidas): " +
      "NO se aceptan devoluciones ni cambios salvo defecto de fabricación o llegada dañada. " +
      "En ese caso contactar en las primeras 48 h con foto del defecto. " +
      "Proceso de devolución: contactar por email o chat con número de pedido y motivo → recibir instrucciones → " +
      "reembolso por el mismo método de pago en 5-10 días hábiles.",
  },

  // ─── PAGOS ───────────────────────────────────────────────────────────────
  {
    category: "faq",
    title: "Métodos de pago, seguridad y facturación",
    content:
      "Métodos de pago aceptados: tarjeta de crédito/débito (Visa, Mastercard, American Express), PayPal, transferencia bancaria, Bizum. " +
      "Seguridad: pagos con cifrado SSL, no almacenamos datos de tarjeta, pasarela PCI DSS certificada. " +
      "Factura: se envía automáticamente por email al finalizar el pedido. " +
      "Factura empresa/autónomo: indicar datos fiscales en las notas del pedido o contactar tras el pedido.",
  },

  // ─── CONTACTO ────────────────────────────────────────────────────────────
  {
    category: "empresa",
    title: "Contacto, atención al cliente y horario",
    content:
      "El Hogar de Tus Sueños — tienda online de textiles para el hogar y estores a medida. " +
      "Web: https://www.elhogardetusuenos.com. " +
      "Horario de atención: lunes a viernes de 9:00 a 18:00 h (hora España). " +
      "Formas de contacto: " +
      "• Este chat (asistente IA disponible 24/7). Para hablar con una persona escribe 'quiero hablar con una persona'. " +
      "• Email: contacto@elhogardetusuenos.com — respuesta en 24 h hábiles. " +
      "Para dudas sobre medidas de estores, indícanos el ancho y alto del hueco y te asesoramos sin compromiso. " +
      "Para estores digitales con foto propia, contáctanos para el proceso de envío de imagen.",
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
