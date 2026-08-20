export interface CamposTarjeta {
  jugador1?: string;
  jugador2?: string;
  torneo?: string;
  fecha?: string;
  hora?: string;
  ganador?: string;
  probabilidad?: string;
  cuota?: string;
}

export interface Diseno {
  id: string;
  nombre: string;
  descripcion: string;
  templatePath: string;
  acento: string;
  bgColor: string;
}

export const DISENOS: Diseno[] = [
  {
    id: "diseno1",
    nombre: "Dark Pro",
    descripcion: "Fondo oscuro con degradado marrón y acentos lima. Estilo premium.",
    templatePath: "/tarjetas/diseno1/template.html",
    acento: "#dfff4f",
    bgColor: "#1a1f2e",
  },
  {
    id: "diseno2",
    nombre: "Night Blue",
    descripcion: "Azul marino profundo con acentos cyan. Estilo nocturno.",
    templatePath: "/tarjetas/diseno2/template.html",
    acento: "#00d4ff",
    bgColor: "#050d1a",
  },
  {
    id: "diseno3",
    nombre: "Red Clay",
    descripcion: "Tierra batida. Tonos naranja y rojo sobre fondo oscuro cálido.",
    templatePath: "/tarjetas/diseno3/template.html",
    acento: "#ff6400",
    bgColor: "#2d1200",
  },
  {
    id: "diseno4",
    nombre: "White Wimbledon",
    descripcion: "Estilo clásico sobre fondo crema con verde Wimbledon.",
    templatePath: "/tarjetas/diseno4/template.html",
    acento: "#005028",
    bgColor: "#f0ede6",
  },
  {
    id: "diseno5",
    nombre: "Golden Slam",
    descripcion: "Negro profundo con acentos dorados. Estilo lujo y elegancia.",
    templatePath: "/tarjetas/diseno5/template.html",
    acento: "#d4af37",
    bgColor: "#1a1400",
  },
  {
    id: "diseno6",
    nombre: "Purple Night",
    descripcion: "Morado oscuro con acentos violeta. Estilo moderno y vibrante.",
    templatePath: "/tarjetas/diseno6/template.html",
    acento: "#c084fc",
    bgColor: "#180d2e",
  },
  {
    id: "diseno7",
    nombre: "Hard Court",
    descripcion: "Azul pista dura con acento rojo. Estilo US Open.",
    templatePath: "/tarjetas/diseno7/template.html",
    acento: "#60a5fa",
    bgColor: "#002244",
  },
  {
    id: "diseno8",
    nombre: "Aerial Grass",
    descripcion: "Verde césped con líneas de pista. Inspirado en hierba desde el aire.",
    templatePath: "/tarjetas/diseno8/template.html",
    acento: "#22c55e",
    bgColor: "#0f2a0f",
  },
  {
    id: "diseno9",
    nombre: "Electric Blue",
    descripcion: "Azul eléctrico intenso con detalles amarillo neón. Estilo acción.",
    templatePath: "/tarjetas/diseno9/template.html",
    acento: "#38bdf8",
    bgColor: "#041a2e",
  },
  {
    id: "diseno10",
    nombre: "Clay Dust",
    descripcion: "Tierra batida oscura con tonos arena y luz cálida dorada.",
    templatePath: "/tarjetas/diseno10/template.html",
    acento: "#d97706",
    bgColor: "#2a1a0a",
  },
  {
    id: "diseno11",
    nombre: "Tropical Court",
    descripcion: "Cielo azul y hojas tropicales. Estilo fresco y veraniego.",
    templatePath: "/tarjetas/diseno11/template.html",
    acento: "#dfff4f",
    bgColor: "#1a4d3a",
  },
  {
    id: "diseno12",
    nombre: "Street Art",
    descripcion: "Estilo grafiti urbano con naranja y cian vibrantes.",
    templatePath: "/tarjetas/diseno12/template.html",
    acento: "#00e5ff",
    bgColor: "#0088aa",
  },
  {
    id: "diseno13",
    nombre: "Clean White",
    descripcion: "Fondo claro minimalista con acentos rojos. Estilo editorial.",
    templatePath: "/tarjetas/diseno13/template.html",
    acento: "#e63946",
    bgColor: "#f2f2f2",
  },
  {
    id: "diseno14",
    nombre: "Blue Court Classic",
    descripcion: "Pista azul y cielo despejado. Estilo limpio y deportivo.",
    templatePath: "/tarjetas/diseno14/template.html",
    acento: "#dfff4f",
    bgColor: "#1e5a99",
  },
  {
    id: "diseno15",
    nombre: "Urban Pulse",
    descripcion: "Tonos rojo y naranja intensos. Estilo urbano con energía.",
    templatePath: "/tarjetas/diseno15/template.html",
    acento: "#ffb400",
    bgColor: "#4d1f00",
  },
  {
    id: "diseno16",
    nombre: "Clay Practice",
    descripcion: "Tierra batida cálida con acentos dorados. Ambiente de entrenamiento.",
    templatePath: "/tarjetas/diseno16/template.html",
    acento: "#ffe27a",
    bgColor: "#8a3d10",
  },
   {
    id: "diseno17",
    nombre: "Vintage Wood",
    descripcion: "Estilo retro con tonos madera sobre verde suave. Elegancia clásica.",
    templatePath: "/tarjetas/diseno17/template.html",
    acento: "#8b5a2b",
    bgColor: "#d8e3d5",
  },
  {
    id: "diseno18",
    nombre: "Pro Black",
    descripcion: "Negro profundo con acentos verde lima y rojo. Estilo profesional.",
    templatePath: "/tarjetas/diseno18/template.html",
    acento: "#7cde34",
    bgColor: "#0d0d0d",
  },
    {
    id: "diseno19",
    nombre: "Neon Impact",
    descripcion: "Explosión rosa/púrpura sobre negro. Estilo impacto luminoso.",
    templatePath: "/tarjetas/diseno19/template.html",
    acento: "#ff5fd6",
    bgColor: "#14031a",
  },
  {
    id: "diseno20",
    nombre: "Vector Ace",
    descripcion: "Ilustración geométrica en teal, amarillo y coral sobre crema.",
    templatePath: "/tarjetas/diseno20/template.html",
    acento: "#5ac8be",
    bgColor: "#faf6ef",
  },
  {
    id: "diseno21",
    nombre: "Court Splash",
    descripcion: "Azul marino profundo con splash naranja intenso.",
    templatePath: "/tarjetas/diseno21/template.html",
    acento: "#ff8214",
    bgColor: "#16233d",
  },
    {
    id: "diseno22",
    nombre: "Street Beat",
    descripcion: "Grafiti urbano en verde neón y naranja sobre negro.",
    templatePath: "/tarjetas/diseno22/template.html",
    acento: "#1edc96",
    bgColor: "#1a1a1a",
  },
  {
    id: "diseno23",
    nombre: "Purple Storm",
    descripcion: "Splash de pintura morado y amarillo sobre fondo claro.",
    templatePath: "/tarjetas/diseno23/template.html",
    acento: "#5a1e8c",
    bgColor: "#f8f8f5",
  },
  {
    id: "diseno24",
    nombre: "Golden Bloom",
    descripcion: "Tonos dorados y marrones con motivo floral sutil.",
    templatePath: "/tarjetas/diseno24/template.html",
    acento: "#8a6d1a",
    bgColor: "#f0e9d5",
  },
  {
    id: "diseno25",
    nombre: "Royal Pattern",
    descripcion: "Granate y azul marino con patrón geométrico elegante.",
    templatePath: "/tarjetas/diseno25/template.html",
    acento: "#ffffff",
    bgColor: "#3d1220",
  },
  {
    id: "diseno26",
    nombre: "Teal Pop",
    descripcion: "Fondo blanco con splash teal y rosa. Estilo pop-art.",
    templatePath: "/tarjetas/diseno26/template.html",
    acento: "#0d7d8c",
    bgColor: "#ffffff",
  },
  {
    id: "diseno27",
    nombre: "Retro 80s",
    descripcion: "Estilo vintage mostaza, rojo y teal con textura de grano.",
    templatePath: "/tarjetas/diseno27/template.html",
    acento: "#d4af37",
    bgColor: "#3a2a10",
  },
  {
    id: "diseno28",
    nombre: "Cyber Tape",
    descripcion: "Cian y rosa neón sobre morado oscuro. Estilo cyberpunk.",
    templatePath: "/tarjetas/diseno28/template.html",
    acento: "#14dcff",
    bgColor: "#2a0a4d",
  },
];

export async function cargarTemplate(templatePath: string): Promise<string> {
  const res = await fetch(templatePath);
  if (!res.ok) throw new Error(`No se pudo cargar el template: ${templatePath}`);
  return res.text();
}

export function sustituirPlaceholders(html: string, campos: CamposTarjeta): string {
  return html
    .replace(/{{JUGADOR1}}/g,     campos.jugador1     ?? "")
    .replace(/{{JUGADOR2}}/g,     campos.jugador2     ?? "")
    .replace(/{{TORNEO}}/g,       campos.torneo       ?? "")
    .replace(/{{FECHA}}/g,        campos.fecha        ?? "")
    .replace(/{{HORA}}/g,         campos.hora         ?? "")
    .replace(/{{GANADOR}}/g,      campos.ganador      ?? "")
    .replace(/{{PROBABILIDAD}}/g, campos.probabilidad ?? "")
    .replace(/{{CUOTA}}/g,        campos.cuota        ?? "");
}