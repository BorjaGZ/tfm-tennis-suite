import Link from "next/link";

const apps = [
  {
    href: "/gestor-stakes",
    title: "Gestor de Stakes",
    desc: "Distribuye tu bankroll entre partidos según niveles de stake automáticamente.",
    badge: "Calculadora",
    badgeClass: "ts-badge-lime",
    accentClass: "ts-card-accent-lime",
    icon: "💰",
  },
  {
    href: "/super-analizador",
    title: "Super Analizador",
    desc: "Analiza tus estadísticas Excel y genera rangos óptimos de probabilidad por stake.",
    badge: "Análisis Excel",
    badgeClass: "ts-badge-green",
    accentClass: "ts-card-accent-green",
    icon: "📊",
  },
  {
    href: "/entrenamiento-modelo",
    title: "Entrenamiento Modelo",
    desc: "Selecciona los 9 partidos clave (3-3-3) para reentrenar tu modelo predictivo.",
    badge: "Selección IA",
    badgeClass: "ts-badge-green",
    accentClass: "ts-card-accent-green",
    icon: "🧠",
  },
  {
    href: "/generador-tarjetas",
    title: "Generador de Tarjetas",
    desc: "Crea tarjetas visuales de partidos para compartir en redes sociales.",
    badge: "Diseño",
    badgeClass: "ts-badge-lime",
    accentClass: "ts-card-accent-lime",
    icon: "🎨",
  },
];

export default function Home() {
  return (
    <div>
      {/* Nav */}
      <nav className="ts-nav">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <span className="ts-nav-brand">🎾 TENNIS SUITE</span>
            <span className="ts-nav-section">TFM · Desarrollo con IA</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-bottom py-5 text-center" style={{ borderColor: "var(--ts-border-default) !important" }}>
        <div className="container-xl px-4">
          <span className="ts-label">Trabajo Fin de Máster · IA</span>
          <h1 className="ts-page-title" style={{ fontSize: "56px" }}>
            Tennis <span className="ts-highlight-lime">Suite</span>
          </h1>
          <p className="ts-text-muted-custom mt-2">
            Mini aplicaciones de tenis y apuestas deportivas
          </p>
        </div>
      </div>

      {/* Grid de apps */}
      <div className="container-xl px-4 py-5">
        <div className="row g-4">
          {apps.map((app) => (
            <div key={app.href} className="col-12 col-sm-6 col-xl-3">
              <Link href={app.href} className="ts-app-card">
                <div className={app.accentClass} style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px" }} />
                <span className="ts-app-card-icon">{app.icon}</span>
                <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
                  {app.title}
                </h2>
                <p className="ts-text-muted-custom mb-3" style={{ fontSize: "13px", lineHeight: 1.6 }}>
                  {app.desc}
                </p>
                <span className={`ts-badge ${app.badgeClass}`}>{app.badge}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="ts-footer">
        <div className="container-xl px-4">
          <div className="d-flex justify-content-between">
            <span className="ts-footer-text">🎾 Tennis Suite</span>
            <span className="ts-footer-text">v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}