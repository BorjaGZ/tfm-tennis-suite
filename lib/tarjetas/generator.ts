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