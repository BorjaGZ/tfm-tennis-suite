"use client";

import { useState, useEffect, useRef } from "react";

interface Metricas {
  total: number;
  aciertos: number;
  pctAcierto: number;
  beneficio: number;
  yield: number;
  pIni: number;
  pFin: number;
}

interface Estrategia {
  m1: Metricas;
  m15: Metricas;
  m2: Metricas;
  beneficioTotal: number;
  formula: string;
  exito: boolean;
}

interface ResultadoArchivo {
  nombre: string;
  total: number;
  estrategia: Estrategia | null;
}

interface Analisis {
  existeNormal: boolean;
  existeMini: boolean;
  normal?: ResultadoArchivo;
  mini?: ResultadoArchivo;
}

type Estado = "cargando" | "incompleto" | "listo" | "analizando" | "resultado" | "error";

export default function SuperAnalizador() {
  const [estado, setEstado]     = useState<Estado>("cargando");
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [error, setError]       = useState("");
  const [copiado, setCopiado]   = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState<"normal" | "mini" | null>(null);

  const fileNormalRef = useRef<HTMLInputElement>(null);
  const fileMiniRef   = useRef<HTMLInputElement>(null);

  useEffect(() => { comprobar(); }, []);

  const comprobar = async () => {
    setEstado("cargando");
    try {
      const res  = await fetch("/api/super-analizador");
      const data = await res.json();
      setAnalisis(data);

      if (data.error) { setError(data.error); setEstado("error"); return; }
      if (!data.existeNormal || !data.existeMini) { setEstado("incompleto"); return; }
      if (data.normal && data.mini) { setEstado("resultado"); return; }
      setEstado("listo");
    } catch {
      setError("No se pudo conectar con el servidor.");
      setEstado("error");
    }
  };

  const ejecutar = async () => {
    setEstado("analizando");
    try {
      const res  = await fetch("/api/super-analizador");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalisis(data);
      setEstado("resultado");
    } catch (e: any) {
      setError(e.message ?? "Error al analizar.");
      setEstado("error");
    }
  };

  const subirExcel = async (file: File, tipo: "normal" | "mini") => {
    setSubiendo(tipo);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", tipo);
      const res  = await fetch("/api/super-analizador", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await comprobar();
    } catch (e: any) {
      setError(e.message ?? "Error al subir el archivo.");
    } finally {
      setSubiendo(null);
    }
  };

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  // ── Componente: estado de cada Excel ──────────────────────────────────
  const ExcelStatus = ({ tipo, existe }: { tipo: "normal" | "mini"; existe: boolean }) => {
    const ref   = tipo === "normal" ? fileNormalRef : fileMiniRef;
    const label = tipo === "normal" ? "estadisticas.xlsx" : "estadisticas_mini.xlsx";
    const desc  = tipo === "normal" ? "Cuota 1.50 – 2.62" : "Cuota 1.20 – 1.49";

    return (
      <div className="ts-card mb-3" style={{ borderColor: existe ? "rgba(76,175,80,0.3)" : "rgba(255,68,68,0.2)" }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p style={{ fontWeight: 700, fontSize: "15px", margin: "0 0 4px 0", color: existe ? "var(--ts-accent-green)" : "#ff8888" }}>
              {existe ? "✓" : "✗"} {label}
            </p>
            <p className="ts-text-muted-custom mb-0" style={{ fontSize: "12px" }}>{desc}</p>
          </div>
          <div>
            <input
              type="file" accept=".xlsx,.xls" ref={ref}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) subirExcel(f, tipo); }}
              style={{ display: "none" }}
            />
            <button
              className={existe ? "ts-btn-secondary" : "ts-btn-primary"}
              style={{ padding: "8px 18px", fontSize: "12px", width: "auto" }}
              onClick={() => ref.current?.click()}
              disabled={subiendo === tipo}
            >
              {subiendo === tipo ? "SUBIENDO..." : existe ? "REEMPLAZAR" : "SUBIR"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Componente: resultado de un archivo ───────────────────────────────
  const ResultadoCard = ({ resultado, id }: { resultado: ResultadoArchivo; id: string }) => {
    const { estrategia } = resultado;
    const pct = (v: number) => `${Math.round(v * 100)}%`;

    return (
      <div className="ts-card mb-4" style={{ borderTop: "2px solid var(--ts-accent-green)" }}>

        {/* Cabecera */}
        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
          <div>
            <span className="ts-label ts-label-green mb-1 d-block">{resultado.nombre}</span>
            <span className="ts-text-muted-custom" style={{ fontSize: "13px" }}>
              {resultado.total} apuestas analizadas
            </span>
          </div>
          {estrategia && (
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: "11px",
              padding: "4px 12px", borderRadius: "4px",
              background: estrategia.exito ? "rgba(76,175,80,0.15)" : "rgba(255,170,0,0.15)",
              color: estrategia.exito ? "var(--ts-accent-green)" : "#ffaa00",
              border: `1px solid ${estrategia.exito ? "rgba(76,175,80,0.3)" : "rgba(255,170,0,0.3)"}`,
            }}>
              {estrategia.exito ? "✓ Objetivos ≥60%" : "⚠ Modo fallback"}
            </span>
          )}
        </div>

        {!estrategia ? (
          <div className="ts-alert-error">No se encontró ninguna estrategia viable con los datos actuales.</div>
        ) : (
          <>
            {/* Tabla de stakes */}
            <div style={{ overflowX: "auto", marginBottom: "24px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--ts-border-default)" }}>
                    {["Stake", "Rango Prob.", "Apuestas", "Acierto", "Beneficio", "Yield"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: h === "Stake" || h === "Rango Prob." ? "left" : "center", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "STAKE 1",   m: estrategia.m1,  color: "var(--ts-accent-lime)" },
                    { label: "STAKE 1.5", m: estrategia.m15, color: "var(--ts-accent-green)" },
                    { label: "STAKE 2",   m: estrategia.m2,  color: "var(--ts-accent-green)" },
                  ].map(({ label, m, color }) => (
                    <tr key={label} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, color }}>
                        {label}
                      </td>
                      <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#fff" }}>
                        {pct(m.pIni)} – {pct(m.pFin)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", color: "var(--ts-text-muted)" }}>{m.total}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <span style={{
                          fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700,
                          color: m.pctAcierto >= 60 ? "var(--ts-accent-green)" : "#ffaa00"
                        }}>
                          {m.pctAcierto.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "12px", color: m.beneficio >= 0 ? "var(--ts-accent-lime)" : "#ff6666", fontWeight: 700 }}>
                        {m.beneficio >= 0 ? "+" : ""}{m.beneficio.toFixed(2)}u
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "12px", color: m.yield >= 0 ? "var(--ts-accent-lime)" : "#ff6666" }}>
                        {m.yield >= 0 ? "+" : ""}{m.yield.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Beneficio total */}
            <div className="ts-totals-box mb-4">
              <div className="ts-total-row">
                <span className="ts-total-label">Beneficio total</span>
                <span className="ts-total-value" style={{ color: estrategia.beneficioTotal >= 0 ? "var(--ts-accent-lime)" : "#ff6666" }}>
                  {estrategia.beneficioTotal >= 0 ? "+" : ""}{estrategia.beneficioTotal.toFixed(2)} unidades
                </span>
              </div>
            </div>

            {/* Fórmula Excel */}
            <div>
              <span className="ts-label ts-label-muted mb-2 d-block">Fórmula para Excel</span>
              <div style={{
                background: "var(--ts-bg-primary)",
                border: "1px solid var(--ts-border-default)",
                borderRadius: "var(--ts-radius)",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
              }}>
                <code style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "11px",
                  color: "var(--ts-accent-lime)",
                  wordBreak: "break-all",
                  lineHeight: 1.6,
                  flex: 1,
                }}>
                  {estrategia.formula}
                </code>
                <button
                  onClick={() => copiar(estrategia.formula, id)}
                  style={{
                    background: copiado === id ? "rgba(76,175,80,0.2)" : "rgba(223,255,79,0.1)",
                    border: `1px solid ${copiado === id ? "rgba(76,175,80,0.4)" : "rgba(223,255,79,0.3)"}`,
                    borderRadius: "6px",
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "11px",
                    color: copiado === id ? "var(--ts-accent-green)" : "var(--ts-accent-lime)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {copiado === id ? "✓ COPIADO" : "COPIAR"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Nav */}
      <nav className="ts-nav">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="ts-nav-brand">🎾 TENNIS SUITE</a>
            <span className="ts-nav-section">Super Analizador</span>
          </div>
        </div>
      </nav>

      <div className="container-xl py-5 px-4">

        <span className="ts-label ts-label-green">Análisis Excel</span>
        <h1 className="ts-page-title">
          Super <span className="ts-highlight-green">Analizador</span>
        </h1>
        <p className="ts-text-muted-custom mb-5">
          Analiza tus estadísticas y genera rangos óptimos de probabilidad por stake.
        </p>

        {/* Cargando */}
        {estado === "cargando" && (
          <div className="ts-empty-state">
            <span className="ts-empty-icon">⏳</span>
            <span className="ts-label ts-label-muted">Comprobando archivos en servidor...</span>
          </div>
        )}

        {/* Analizando */}
        {estado === "analizando" && (
          <div className="ts-empty-state">
            <span className="ts-empty-icon">📊</span>
            <span className="ts-label ts-label-muted">Analizando datos...</span>
          </div>
        )}

        {/* Error */}
        {estado === "error" && (
          <div className="ts-alert-error mb-4">
            {error}
            <button className="ts-btn-secondary ms-3" onClick={comprobar} style={{ padding: "6px 16px", fontSize: "12px" }}>
              Reintentar
            </button>
          </div>
        )}

        {/* Gestión de archivos — siempre visible cuando hay datos */}
        {(estado === "incompleto" || estado === "listo" || estado === "resultado") && analisis && (
          <div className="row mb-5">
            <div className="col-12 col-lg-6">
              <span className="ts-label ts-label-muted mb-3 d-block">Archivos Excel</span>
              <ExcelStatus tipo="normal" existe={analisis.existeNormal} />
              <ExcelStatus tipo="mini"   existe={analisis.existeMini} />

              {analisis.existeNormal && analisis.existeMini && (
                <button className="ts-btn-primary mt-2" onClick={ejecutar}>
                  EJECUTAR ANÁLISIS
                </button>
              )}

              {(!analisis.existeNormal || !analisis.existeMini) && (
                <div className="ts-alert-error mt-3">
                  Sube los dos archivos Excel para poder ejecutar el análisis.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resultados */}
        {estado === "resultado" && analisis?.normal && analisis?.mini && (
          <div>
            <ResultadoCard resultado={analisis.normal} id="normal" />
            <ResultadoCard resultado={analisis.mini}   id="mini" />
          </div>
        )}

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