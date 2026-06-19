import Link from "next/link";

const apps = [
  {
    href: "/gestor-stakes",
    title: "Gestor de Stakes",
    desc: "Distribuye tu bankroll entre partidos según niveles de stake automáticamente.",
    badge: "Calculadora",
    accent: "#dfff4f",
    icon: "💰",
  },
  {
    href: "/super-analizador",
    title: "Super Analizador",
    desc: "Analiza tus estadísticas Excel y genera rangos óptimos de probabilidad por stake.",
    badge: "Análisis Excel",
    accent: "#4CAF50",
    icon: "📊",
  },
  {
    href: "/entrenamiento-modelo",
    title: "Entrenamiento Modelo",
    desc: "Selecciona los 9 partidos clave (3-3-3) para reentrenar tu modelo predictivo.",
    badge: "Selección IA",
    accent: "#4CAF50",
    icon: "🧠",
  },
  {
    href: "/generador-tarjetas",
    title: "Generador de Tarjetas",
    desc: "Crea tarjetas visuales de partidos para compartir en redes sociales.",
    badge: "Diseño",
    accent: "#dfff4f",
    icon: "🎨",
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1419", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Nav */}
      <nav style={{ background: "#0a0e1a", borderBottom: "1px solid #dfff4f22", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px", fontWeight: 700, color: "#dfff4f", letterSpacing: "2px" }}>
          🎾 TENNIS SUITE
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#ffffff44", letterSpacing: "1px" }}>
          TFM · DESARROLLO CON IA
        </span>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 32px 48px", borderBottom: "1px solid #ffffff11" }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#4CAF50", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>
          Trabajo Fin de Máster · IA
        </p>
        <h1 style={{ fontSize: "48px", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.1, margin: 0 }}>
          Tennis <span style={{ color: "#dfff4f" }}>Suite</span>
        </h1>
        <p style={{ fontSize: "15px", color: "#ffffff55", marginTop: "12px", letterSpacing: "0.5px" }}>
          Mini aplicaciones de tenis y apuestas deportivas
        </p>
      </div>

      {/* Grid de apps */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", padding: "40px 32px", maxWidth: "900px", margin: "0 auto" }}>
        {apps.map((app) => (
          <Link key={app.href} href={app.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "#1a1f2e", border: "1px solid #ffffff15", borderRadius: "12px", padding: "28px 24px", cursor: "pointer", position: "relative", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
              
              {/* Línea de acento superior */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: app.accent }} />
              
              {/* Icono */}
              <div style={{ fontSize: "28px", marginBottom: "16px" }}>{app.icon}</div>
              
              {/* Título */}
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px 0", color: "#fff" }}>
                {app.title}
              </h2>
              
              {/* Descripción */}
              <p style={{ fontSize: "13px", color: "#ffffff55", lineHeight: 1.6, margin: 0, flex: 1 }}>
                {app.desc}
              </p>
              
              {/* Badge */}
              <span style={{ display: "inline-block", marginTop: "16px", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: app.accent, border: `1px solid ${app.accent}44`, borderRadius: "4px", padding: "3px 10px", letterSpacing: "1px", textTransform: "uppercase" }}>
                {app.badge}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "32px", borderTop: "1px solid #ffffff11", marginTop: "20px" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#ffffff22", letterSpacing: "1px" }}>
          v1.0 · Tennis Suite
        </span>
      </div>
    </div>
  );
}