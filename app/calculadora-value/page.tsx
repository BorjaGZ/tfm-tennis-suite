"use client";

import { useState, useEffect } from "react";

interface Metricas { pIni: number; pFin: number; }
interface Rangos { m1: Metricas; m15: Metricas; m2: Metricas; }

interface Resultado {
  tieneValue: boolean;
  edge: number;
  cuotaMinima: number;
  valorEsperado: number;
  stake: "NO APOSTAR" | "STAKE 1" | "STAKE 1.5" | "STAKE 2";
  motivo: string;
}

export default function CalculadoraValue() {
  const [probabilidad, setProbabilidad] = useState("");
  const [cuota, setCuota]               = useState("");
  const [resultado, setResultado]       = useState<Resultado | null>(null);
  const [error, setError]               = useState("");
  const [rangos, setRangos]             = useState<Rangos | null>(null);
  const [cargandoRangos, setCargandoRangos] = useState(true);

  useEffect(() => {
    fetch("/api/super-analizador")
      .then((r) => r.json())
      .then((data) => {
        if (data.estrategia) setRangos(data.estrategia);
      })
      .catch(() => {})
      .finally(() => setCargandoRangos(false));
  }, []);

  const determinarStake = (probDecimal: number): { stake: Resultado["stake"]; motivo: string } => {
    if (!rangos) {
      // Fallback si no hay rangos del Super Analizador
      if (probDecimal >= 0.70) return { stake: "STAKE 2",   motivo: "Probabilidad alta. Rangos por defecto (sin datos del Super Analizador)." };
      if (probDecimal >= 0.62) return { stake: "STAKE 1.5", motivo: "Probabilidad media-alta. Rangos por defecto." };
      if (probDecimal >= 0.54) return { stake: "STAKE 1",   motivo: "Probabilidad media. Rangos por defecto." };
      return { stake: "NO APOSTAR", motivo: "Probabilidad insuficiente. Rangos por defecto." };
    }

    const { m1, m15, m2 } = rangos;
    if (probDecimal >= m2.pIni  && probDecimal <= m2.pFin)  return { stake: "STAKE 2",    motivo: `Probabilidad en rango STAKE 2 del modelo (${Math.round(m2.pIni * 100)}%–${Math.round(m2.pFin * 100)}%).` };
    if (probDecimal >= m15.pIni && probDecimal <= m15.pFin) return { stake: "STAKE 1.5",  motivo: `Probabilidad en rango STAKE 1.5 del modelo (${Math.round(m15.pIni * 100)}%–${Math.round(m15.pFin * 100)}%).` };
    if (probDecimal >= m1.pIni  && probDecimal <= m1.pFin)  return { stake: "STAKE 1",    motivo: `Probabilidad en rango STAKE 1 del modelo (${Math.round(m1.pIni * 100)}%–${Math.round(m1.pFin * 100)}%).` };
    return { stake: "NO APOSTAR", motivo: "Probabilidad fuera de todos los rangos óptimos del modelo." };
  };

  const calcular = () => {
    setError("");
    setResultado(null);

    const prob = parseFloat(probabilidad.replace(",", "."));
    const q    = parseFloat(cuota.replace(",", "."));

    if (isNaN(prob) || prob <= 0 || prob >= 100) { setError("Introduce una probabilidad válida entre 1 y 99."); return; }
    if (isNaN(q) || q <= 1)                       { setError("Introduce una cuota válida mayor que 1."); return; }
    if (q < 1.2)                                  { setError("La cuota mínima del modelo es 1,20."); return; }

    const probDecimal   = prob / 100;
    const valorEsperado = probDecimal * q;
    const tieneValue    = valorEsperado > 1;
    const edge          = (valorEsperado - 1) * 100;
    const cuotaMinima   = 1 / probDecimal;

    let { stake, motivo } = determinarStake(probDecimal);

    if (!tieneValue) {
      stake  = "NO APOSTAR";
      motivo = "No hay value. La cuota no compensa la probabilidad estimada.";
    }

    setResultado({ tieneValue, edge, cuotaMinima, valorEsperado, stake, motivo });
  };

  const resetear = () => { setProbabilidad(""); setCuota(""); setResultado(null); setError(""); };

  const stakeColor = (stake: string) => {
    if (stake === "NO APOSTAR") return "#ff6666";
    if (stake === "STAKE 1")    return "var(--ts-accent-lime)";
    return "var(--ts-accent-green)";
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--ts-bg-primary)",
    border: "1px solid var(--ts-border-default)",
    borderRadius: "var(--ts-radius)",
    color: "#fff", fontSize: "32px", fontWeight: 700,
    padding: "16px 20px", width: "100%", outline: "none",
    fontFamily: "'Space Mono', monospace", textAlign: "center",
  };

  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div>
      <nav className="ts-nav">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="ts-nav-brand">🎾 TENNIS SUITE</a>
            <span className="ts-nav-section">Calculadora de Value</span>
          </div>
        </div>
      </nav>

      <div className="container-xl py-5 px-4">

        <span className="ts-label">Value Bet</span>
        <h1 className="ts-page-title">
          Calculadora de <span className="ts-highlight-lime">Value</span>
        </h1>
        <p className="ts-text-muted-custom mb-2">
          Introduce la probabilidad estimada y la cuota para saber si hay value y qué stake aplicar.
        </p>

        {/* Aviso de rangos */}
        <div className="mb-5">
          {cargandoRangos ? (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)" }}>
              ⏳ Cargando rangos del modelo...
            </span>
          ) : rangos ? (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-accent-green)" }}>
              ✓ Rangos cargados del Super Analizador — S1: {pct(rangos.m1.pIni)}–{pct(rangos.m1.pFin)} · S1.5: {pct(rangos.m15.pIni)}–{pct(rangos.m15.pFin)} · S2: {pct(rangos.m2.pIni)}–{pct(rangos.m2.pFin)}
            </span>
          ) : (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#ffaa00" }}>
              ⚠ Sin datos del Super Analizador — usando rangos por defecto. <a href="/super-analizador" style={{ color: "#ffaa00" }}>Ejecuta el análisis primero.</a>
            </span>
          )}
        </div>

        <div className="row g-4">

          {/* Inputs */}
          <div className="col-12 col-lg-5">
            <div className="ts-card mb-4">
              <span className="ts-label ts-label-muted mb-4 d-block">Datos de la apuesta</span>

              <div className="mb-4">
                <label className="ts-input-label mb-2 d-block">Probabilidad estimada (%)</label>
                <input type="text" placeholder="ej: 68" value={probabilidad}
                  onChange={(e) => setProbabilidad(e.target.value)} style={inputStyle} />
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)", marginTop: "8px", textAlign: "center" }}>
                  Valor entre 1 y 99
                </p>
              </div>

              <div className="mb-4">
                <label className="ts-input-label mb-2 d-block">Cuota de la casa</label>
                <input type="text" placeholder="ej: 1,85" value={cuota}
                  onChange={(e) => setCuota(e.target.value)} style={inputStyle} />
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)", marginTop: "8px", textAlign: "center" }}>
                  Mínimo 1,20
                </p>
              </div>

              {error && <div className="ts-alert-error mb-4">{error}</div>}

              <div className="d-flex gap-3">
                <button className="ts-btn-primary flex-grow-1" onClick={calcular}>CALCULAR</button>
                <button className="ts-btn-secondary" onClick={resetear}>RESET</button>
              </div>
            </div>

            {/* Tabla de rangos del modelo */}
            <div className="ts-card">
              <span className="ts-label ts-label-muted mb-3 d-block">
                Rangos del modelo {rangos ? "(Super Analizador)" : "(por defecto)"}
              </span>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--ts-border-default)" }}>
                    {["Stake", "Rango prob.", "Cuota mín."].map((h) => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rangos ? [
                    { stake: "STAKE 2",    pIni: rangos.m2.pIni,  pFin: rangos.m2.pFin,  color: "var(--ts-accent-green)" },
                    { stake: "STAKE 1.5",  pIni: rangos.m15.pIni, pFin: rangos.m15.pFin, color: "var(--ts-accent-green)" },
                    { stake: "STAKE 1",    pIni: rangos.m1.pIni,  pFin: rangos.m1.pFin,  color: "var(--ts-accent-lime)" },
                    { stake: "NO APOSTAR", pIni: 0, pFin: 0, color: "#ff6666" },
                  ].map((r) => (
                    <tr key={r.stake} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: 700, color: r.color }}>{r.stake}</td>
                      <td style={{ padding: "10px", textAlign: "center", color: "var(--ts-text-muted)" }}>
                        {r.pIni > 0 ? `${pct(r.pIni)} – ${pct(r.pFin)}` : "Fuera de rangos"}
                      </td>
                      <td style={{ padding: "10px", textAlign: "center", color: "var(--ts-text-muted)" }}>
                        {r.pIni > 0 ? `${(1 / r.pFin).toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  )) : [
                    { stake: "STAKE 2",    prob: "≥ 70%",  cuotaMin: "1,43", color: "var(--ts-accent-green)" },
                    { stake: "STAKE 1.5",  prob: "62–69%", cuotaMin: "1,45", color: "var(--ts-accent-green)" },
                    { stake: "STAKE 1",    prob: "54–61%", cuotaMin: "1,64", color: "var(--ts-accent-lime)" },
                    { stake: "NO APOSTAR", prob: "< 54%",  cuotaMin: "—",    color: "#ff6666" },
                  ].map((r) => (
                    <tr key={r.stake} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: 700, color: r.color }}>{r.stake}</td>
                      <td style={{ padding: "10px", textAlign: "center", color: "var(--ts-text-muted)" }}>{r.prob}</td>
                      <td style={{ padding: "10px", textAlign: "center", color: "var(--ts-text-muted)" }}>{r.cuotaMin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resultado */}
          <div className="col-12 col-lg-7">
            {!resultado ? (
              <div className="ts-empty-state">
                <span className="ts-empty-icon">📈</span>
                <span className="ts-label ts-label-muted">El análisis aparecerá aquí</span>
              </div>
            ) : (
              <div>
                {/* Veredicto */}
                <div className="ts-card mb-4" style={{ borderTop: `2px solid ${resultado.tieneValue ? "var(--ts-accent-lime)" : "#ff6666"}`, textAlign: "center", padding: "48px 32px" }}>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "var(--ts-text-muted)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "20px" }}>Veredicto</p>
                  <p style={{ fontSize: "64px", margin: "0 0 16px 0" }}>{resultado.tieneValue ? "✅" : "❌"}</p>
                  <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-1px", color: resultado.tieneValue ? "var(--ts-accent-lime)" : "#ff6666", margin: "0 0 12px 0" }}>
                    {resultado.tieneValue ? "HAY VALUE" : "SIN VALUE"}
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--ts-text-muted)", margin: 0 }}>{resultado.motivo}</p>
                </div>

                {/* Stake recomendado */}
                <div className="ts-card mb-4" style={{ textAlign: "center", padding: "36px 32px" }}>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>Stake recomendado</p>
                  <p style={{ fontSize: "48px", fontWeight: 900, color: stakeColor(resultado.stake), fontFamily: "'Space Mono', monospace", margin: 0, letterSpacing: "-1px" }}>
                    {resultado.stake}
                  </p>
                </div>

                {/* Métricas */}
                <div className="row g-3">
                  {[
                    { label: "Valor esperado",  value: resultado.valorEsperado.toFixed(3), sub: resultado.tieneValue ? "Mayor que 1 → hay value" : "Menor que 1 → sin value", color: resultado.tieneValue ? "var(--ts-accent-lime)" : "#ff6666" },
                    { label: "Edge",             value: `${resultado.edge >= 0 ? "+" : ""}${resultado.edge.toFixed(2)}%`, sub: "Ventaja sobre la casa", color: resultado.edge >= 0 ? "var(--ts-accent-green)" : "#ff6666" },
                    { label: "Cuota mínima",     value: resultado.cuotaMinima.toFixed(2), sub: "Para que haya value", color: "var(--ts-text-primary)" },
                    { label: "Tu cuota",         value: parseFloat(cuota.replace(",", ".")).toFixed(2), sub: resultado.tieneValue ? `+${(parseFloat(cuota.replace(",", ".")) - resultado.cuotaMinima).toFixed(2)} sobre mínima` : `${(parseFloat(cuota.replace(",", ".")) - resultado.cuotaMinima).toFixed(2)} bajo mínima`, color: resultado.tieneValue ? "var(--ts-accent-lime)" : "#ff6666" },
                  ].map((m) => (
                    <div key={m.label} className="col-6">
                      <div className="ts-stat-box" style={{ height: "100%" }}>
                        <span className="ts-stat-label">{m.label}</span>
                        <p className="ts-stat-value" style={{ color: m.color, fontSize: "32px" }}>{m.value}</p>
                        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", marginTop: "8px", marginBottom: 0 }}>{m.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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