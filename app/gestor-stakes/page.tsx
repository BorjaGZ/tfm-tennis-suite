"use client";

import { useState } from "react";

interface Resultado {
  stake1: number;
  stake2: number;
  stake3: number;
  limitesSuperior: number;
  limitesInferior: number;
}

interface RegistroHistorial {
  fecha: string;
  bank: number;
  stake1: number;
  stake2: number;
  stake3: number;
  limiteSuperior: number;
  limiteInferior: number;
}

export default function GestorStakes() {
  const [bank, setBank]                   = useState("");
  const [bankActual, setBankActual]       = useState("");
  const [resultado, setResultado]         = useState<Resultado | null>(null);
  const [error, setError]                 = useState("");
  const [historial, setHistorial]         = useState<RegistroHistorial[]>([]);
  const [verHistorial, setVerHistorial]   = useState(false);
  const [cargandoH, setCargandoH]         = useState(false);
  const [exportando, setExportando]       = useState(false);
  const [exportOk, setExportOk]           = useState(false);

  const calcular = () => {
    setError("");
    setResultado(null);
    setExportOk(false);

    const b = parseFloat(bank.replace(",", "."));
    if (isNaN(b) || b <= 0) {
      setError("Introduce un bank válido mayor que 0.");
      return;
    }

    setResultado({
      stake1:          Math.round(b * 0.01 * 10) / 10,
      stake2:          Math.round(b * 0.02 * 10) / 10,
      stake3:          Math.round(b * 0.03 * 10) / 10,
      limitesSuperior: b * 1.10,
      limitesInferior: b * 0.90,
    });
    setBankActual("");
  };

  const resetear = () => {
    setBank("");
    setBankActual("");
    setResultado(null);
    setError("");
    setExportOk(false);
    setVerHistorial(false);
  };

  const exportar = async () => {
    if (!resultado) return;
    setExportando(true);
    try {
      const b = parseFloat(bank.replace(",", "."));
      const res = await fetch("/api/gestor-stakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank:           b,
          stake1:         resultado.stake1,
          stake2:         resultado.stake2,
          stake3:         resultado.stake3,
          limiteSuperior: resultado.limitesSuperior,
          limiteInferior: resultado.limitesInferior,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExportOk(true);
      setTimeout(() => setExportOk(false), 3000);
    } catch (e: any) {
      setError(e.message ?? "Error al exportar.");
    } finally {
      setExportando(false);
    }
  };

  const cargarHistorial = async () => {
    if (verHistorial) { setVerHistorial(false); return; }

    // Reset antes de mostrar el historial
    setBank("");
    setBankActual("");
    setResultado(null);
    setError("");
    setExportOk(false);

    setCargandoH(true);
    try {
      const res  = await fetch("/api/gestor-stakes");
      const data = await res.json();
      setHistorial(data.historial ?? []);
      setVerHistorial(true);
    } catch {
      setError("Error al cargar el historial.");
    } finally {
      setCargandoH(false);
    }
  };

  const bankActualNum = parseFloat(bankActual.replace(",", "."));
  const bankBaseNum   = parseFloat(bank.replace(",", "."));
  const superaLimite  = resultado && !isNaN(bankActualNum) && bankActual !== "" &&
    (bankActualNum >= resultado.limitesSuperior || bankActualNum <= resultado.limitesInferior);
  const subioBankActual = resultado && !isNaN(bankActualNum) && bankActual !== "";
  const variacion       = subioBankActual ? ((bankActualNum - bankBaseNum) / bankBaseNum) * 100 : null;

  const inputStyle: React.CSSProperties = {
    background: "var(--ts-bg-primary)",
    border: "1px solid var(--ts-border-default)",
    borderRadius: "var(--ts-radius)",
    color: "#fff",
    fontSize: "16px",
    padding: "12px 16px",
    width: "100%",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div>
      {/* Nav */}
      <nav className="ts-nav">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="ts-nav-brand">🎾 TENNIS SUITE</a>
            <span className="ts-nav-section">Gestor de Stakes</span>
          </div>
        </div>
      </nav>

      <div className="container-xl py-5 px-4">

        <span className="ts-label">Calculadora</span>
        <h1 className="ts-page-title">
          Gestor de <span className="ts-highlight-lime">Stakes</span>
        </h1>
        <p className="ts-text-muted-custom mb-5">
          Calcula tus stakes según el 1%, 2% y 3% de tu bankroll y controla los límites de recalculo.
        </p>

        <div className="row g-4">

          {/* Columna izquierda */}
          <div className="col-12 col-lg-5">
            <div className="ts-card mb-4">
              <span className="ts-label ts-label-muted mb-4 d-block">Bankroll base</span>

              <div className="mb-4">
                <label className="ts-input-label">Bank disponible (€)</label>
                <input
                  type="text"
                  placeholder="ej: 300"
                  value={bank}
                  onChange={(e) => { setBank(e.target.value); setResultado(null); setBankActual(""); setExportOk(false); }}
                  style={inputStyle}
                />
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", marginTop: "6px" }}>
                  S1 = 1% · S2 = 2% · S3 = 3% del bank
                </p>
              </div>

              {error && <div className="ts-alert-error mb-4">{error}</div>}

              {/* Botones principales */}
              <div className="d-flex gap-3 mb-3">
                <button className="ts-btn-primary flex-grow-1" onClick={calcular}>
                  CALCULAR
                </button>
                <button className="ts-btn-secondary" onClick={resetear}>
                  RESET
                </button>
              </div>

              {/* Botones secundarios */}
              <div className="d-flex gap-3">
                <button
                  className="ts-btn-secondary flex-grow-1"
                  onClick={exportar}
                  disabled={!resultado || exportando}
                  style={{ fontSize: "12px", padding: "10px", color: exportOk ? "var(--ts-accent-green)" : undefined, borderColor: exportOk ? "rgba(76,175,80,0.4)" : undefined }}
                >
                  {exportando ? "EXPORTANDO..." : exportOk ? "✓ EXPORTADO" : "EXPORTAR"}
                </button>
                <button
                  className="ts-btn-secondary flex-grow-1"
                  onClick={cargarHistorial}
                  disabled={cargandoH}
                  style={{ fontSize: "12px", padding: "10px" }}
                >
                  {cargandoH ? "CARGANDO..." : verHistorial ? "OCULTAR HISTORIAL" : "VER HISTORIAL"}
                </button>
              </div>
            </div>

            {/* Comprobador de límites */}
            {resultado && (
              <div className="ts-card">
                <span className="ts-label ts-label-muted mb-3 d-block">Comprobador de límites</span>
                <p style={{ fontSize: "13px", color: "var(--ts-text-muted)", marginBottom: "16px", lineHeight: 1.6 }}>
                  Introduce tu bank al final de la jornada para comprobar si has superado los límites.
                </p>
                <label className="ts-input-label">Bank actual (€)</label>
                <input
                  type="text"
                  placeholder="ej: 315"
                  value={bankActual}
                  onChange={(e) => setBankActual(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: superaLimite
                      ? "rgba(255,68,68,0.5)"
                      : subioBankActual
                      ? "rgba(76,175,80,0.5)"
                      : "var(--ts-border-default)",
                  }}
                />

                {subioBankActual && !isNaN(bankActualNum) && variacion !== null && (
                  <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)" }}>Variación</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px", fontWeight: 700, color: variacion >= 0 ? "var(--ts-accent-green)" : "#ff6666" }}>
                      {variacion >= 0 ? "+" : ""}{variacion.toFixed(2)}%
                    </span>
                  </div>
                )}

                {superaLimite && !isNaN(bankActualNum) && (
                  <div style={{ marginTop: "16px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "var(--ts-radius)", padding: "16px" }}>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, color: "#ff8888", margin: "0 0 8px 0" }}>
                      ⚠ LÍMITE SUPERADO
                    </p>
                    <p style={{ fontSize: "13px", color: "rgba(255,136,136,0.8)", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                      {bankActualNum >= resultado.limitesSuperior
                        ? "Tu bank ha subido un 10% o más. Se recomienda recalcular los stakes."
                        : "Tu bank ha bajado un 10% o más. Se recomienda recalcular los stakes."
                      }
                    </p>
                    <button
                      className="ts-btn-primary"
                      style={{ fontSize: "12px", padding: "10px 16px" }}
                      onClick={() => { setBank(bankActualNum.toString()); setBankActual(""); setResultado(null); setExportOk(false); }}
                    >
                      RECALCULAR CON €{bankActualNum.toFixed(2)}
                    </button>
                  </div>
                )}

                {subioBankActual && !superaLimite && !isNaN(bankActualNum) && (
                  <div style={{ marginTop: "16px", background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: "var(--ts-radius)", padding: "14px 16px" }}>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "var(--ts-accent-green)", margin: 0 }}>
                      ✓ Bank dentro de los límites. No es necesario recalcular.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <div className="col-12 col-lg-7">
            {!resultado && !verHistorial && (
              <div className="ts-empty-state">
                <span className="ts-empty-icon">💰</span>
                <span className="ts-label ts-label-muted">El resultado aparecerá aquí</span>
              </div>
            )}

            {resultado && (
              <div>
                {/* Stakes */}
                <div className="ts-card ts-card-accent-lime mb-4">
                  <span className="ts-label mb-3 d-block">Stakes calculados</span>
                  <div className="row g-3 mb-4">
                    {[
                      { label: "Stake 1", pct: "1%", value: resultado.stake1,  color: "var(--ts-accent-lime)" },
                      { label: "Stake 2", pct: "2%", value: resultado.stake2,  color: "var(--ts-accent-green)" },
                      { label: "Stake 3", pct: "3%", value: resultado.stake3,  color: "var(--ts-accent-green)" },
                    ].map((s) => (
                      <div key={s.label} className="col-4">
                        <div className="ts-stat-box">
                          <span className="ts-stat-label">{s.label}</span>
                          <p className="ts-stat-value" style={{ color: s.color, fontSize: "32px" }}>
                            €{s.value.toFixed(1)}
                          </p>
                          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", marginTop: "6px", marginBottom: 0 }}>
                            {s.pct} del bank
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ts-totals-box">
                    <div className="ts-total-row">
                      <span className="ts-total-label">Bank base</span>
                      <span className="ts-total-value" style={{ color: "var(--ts-accent-lime)" }}>
                        €{bankBaseNum.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Límites */}
                <div className="ts-card">
                  <span className="ts-label ts-label-muted mb-3 d-block">Límites de recalculo (±10%)</span>

                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div className="ts-stat-box" style={{ border: "1px solid rgba(76,175,80,0.3)" }}>
                        <span className="ts-stat-label">Límite superior</span>
                        <p className="ts-stat-value" style={{ color: "var(--ts-accent-green)", fontSize: "28px" }}>
                          €{resultado.limitesSuperior.toFixed(2)}
                        </p>
                        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", marginTop: "6px", marginBottom: 0 }}>
                          +10% del bank
                        </p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="ts-stat-box" style={{ border: "1px solid rgba(255,68,68,0.3)" }}>
                        <span className="ts-stat-label">Límite inferior</span>
                        <p className="ts-stat-value" style={{ color: "#ff6666", fontSize: "28px" }}>
                          €{resultado.limitesInferior.toFixed(2)}
                        </p>
                        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", marginTop: "6px", marginBottom: 0 }}>
                          -10% del bank
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Barra visual */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#ff6666" }}>€{resultado.limitesInferior.toFixed(0)}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-accent-lime)", fontWeight: 700 }}>€{bankBaseNum.toFixed(0)} (base)</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-accent-green)" }}>€{resultado.limitesSuperior.toFixed(0)}</span>
                    </div>
                    <div style={{ height: "8px", borderRadius: "100px", background: "linear-gradient(90deg, #ff444433, var(--ts-bg-primary) 40%, var(--ts-bg-primary) 60%, rgba(76,175,80,0.3))", border: "1px solid var(--ts-border-default)", position: "relative" }}>
                      {subioBankActual && !isNaN(bankActualNum) && (
                        <div style={{
                          position: "absolute", top: "-4px",
                          left: `${Math.min(100, Math.max(0, ((bankActualNum - resultado.limitesInferior) / (resultado.limitesSuperior - resultado.limitesInferior)) * 100))}%`,
                          transform: "translateX(-50%)",
                          width: "16px", height: "16px", borderRadius: "50%",
                          background: superaLimite ? "#ff4444" : "var(--ts-accent-green)",
                          border: "2px solid var(--ts-bg-secondary)",
                        }} />
                      )}
                      <div style={{ position: "absolute", top: "-4px", left: "50%", transform: "translateX(-50%)", width: "16px", height: "16px", borderRadius: "50%", background: "var(--ts-accent-lime)", border: "2px solid var(--ts-bg-secondary)" }} />
                    </div>
                    {subioBankActual && !isNaN(bankActualNum) && (
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: superaLimite ? "#ff8888" : "var(--ts-accent-green)", marginTop: "8px", textAlign: "center" }}>
                        ● Bank actual: €{bankActualNum.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Historial */}
            {verHistorial && (
              <div className="ts-card" style={{ borderTop: "2px solid var(--ts-accent-lime)" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="ts-label mb-0">Evolución del bankroll</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)", border: "1px solid var(--ts-border-default)", borderRadius: "4px", padding: "3px 10px" }}>
                    {historial.length} registros
                  </span>
                </div>

                {historial.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px" }}>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "var(--ts-text-muted)" }}>
                      No hay registros todavía. Pulsa EXPORTAR para guardar el primero.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--ts-border-default)" }}>
                          {["Fecha", "Bank", "S1", "S2", "S3", "Lím. Sup.", "Lím. Inf."].map((h) => (
                            <th key={h} style={{ padding: "10px 12px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...historial].reverse().map((r, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding: "10px 12px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)" }}>{r.fecha}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "var(--ts-accent-lime)" }}>€{r.bank.toFixed(2)}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: "#fff" }}>€{r.stake1.toFixed(1)}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: "#fff" }}>€{r.stake2.toFixed(1)}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: "#fff" }}>€{r.stake3.toFixed(1)}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: "var(--ts-accent-green)", fontFamily: "'Space Mono', monospace", fontSize: "11px" }}>€{r.limiteSuperior.toFixed(2)}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: "#ff6666", fontFamily: "'Space Mono', monospace", fontSize: "11px" }}>€{r.limiteInferior.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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