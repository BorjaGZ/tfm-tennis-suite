export default function GeneradorTarjetas() {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1419", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ background: "#0a0e1a", borderBottom: "1px solid #dfff4f22", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px", fontWeight: 700, color: "#dfff4f", letterSpacing: "2px", textDecoration: "none" }}>
          🎾 TENNIS SUITE
        </a>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#ffffff44", letterSpacing: "1px" }}>
          GENERADOR DE TARJETAS
        </span>
      </nav>
      <div style={{ maxWidth: "600px", margin: "80px auto", padding: "0 32px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#dfff4f", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>
          Diseño
        </p>
        <h1 style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-1px", margin: "0 0 12px 0" }}>
          Generador de <span style={{ color: "#dfff4f" }}>Tarjetas</span>
        </h1>
        <p style={{ fontSize: "14px", color: "#ffffff55" }}>Próximamente...</p>
      </div>
    </div>
  );
}