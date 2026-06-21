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

interface Analisis {
  existe: boolean;
  total?: number;
  estrategia?: Estrategia;
  error?: string;
}

type Estado = "cargando" | "sin-excel" | "analizando" | "resultado" | "error";

export default function SuperAnalizador() {
  const [estado, setEstado]     = useState<Estado>("cargando");
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [error, setError]       = useState("");
  const [copiado, setCopiado]   = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { comprobar(); }, []);

  const comprobar = async () => {
    setEstado("cargando");
    try {
      const res  = await fetch("/api/super-analizador");
      const data = await res.json();
      setAnalisis(data);
      if (data.error)   { setError(data.error); setEstado("error"); return; }
      if (!data.existe) { setEstado("sin-excel"); return; }
      setEstado("resultado");
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

  const subirExcel = async (file: File) => {
    setSubiendo(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res  = await fetch("/api/super-analizador", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await ejecutar();
    } catch (e: any) {
      setError(e.message ?? "Error al subir el archivo.");
      setEstado("sin-excel");
    } finally {
      setSubiendo(false);
    }
  };

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const pct = (v: number) => `${Math.round(v * 100)}%`;

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
          Analiza tus estadísticas y genera rangos óptimos de probabilidad por stake. Cuota mínima: 1,20.
        </p>

        {/* Cargando */}
        {estado === "cargando" && (
          <div className="ts-empty-state">
            <span className="ts-empty-icon">⏳</span>
            <span className="ts-label ts-label-muted">Comprobando archivo en servidor...</span>
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

        {/* Sin Excel */}
        {estado === "sin-excel" && (
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <div className="ts-card ts-card-accent-green text-center">
                <span style={{ fontSize: "40px", display: "block", marginBottom: "20px" }}>📂</span>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                  No hay Excel en el servidor
                </h2>
                <p className="ts-text-muted-custom mb-4">
                  Sube tu archivo <strong style={{ color: "#fff" }}>estadisticas.xlsx</strong> para comenzar.
                </p>
                {error && <div className="ts-alert-error mb-4">{error}</div>}
                <input type="file" accept=".xlsx,.xls" ref={fileRef}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) subirExcel(f); }}
                  style={{ display: "none" }}
                />
                <button className="ts-btn-primary" onClick={() => fileRef.current?.click()} disabled={subiendo}>
                  {subiendo ? "SUBIENDO..." : "SUBIR EXCEL"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resultado */}
        {estado === "resultado" && analisis?.estrategia && (
          <div className="row g-4">

            {/* Columna izquierda — acciones */}
            <div className="col-12 col-lg-4">
              <div className="ts-card mb-4">
                <span className="ts-label ts-label-muted mb-3 d-block">Archivo Excel</span>
                <div style={{ background: "var(--ts-bg-primary)", borderRadius: "var(--ts-radius)", padding: "14px 16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "14px", margin: "0 0 2px 0", color: "var(--ts-accent-green)" }}>
                      ✓ estadisticas.xlsx
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--ts-text-muted)", margin: 0 }}>
                      {analisis.total} apuestas · Cuota ≥ 1,20
                    </p>
                  </div>
                </div>
                <input type="file" accept=".xlsx,.xls" ref={fileRef}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) subirExcel(f); }}
                  style={{ display: "none" }}
                />
                <div className="d-flex gap-3">
                  <button className="ts-btn-primary flex-grow-1" onClick={ejecutar}>
                    RE-ANALIZAR
                  </button>
                  <button className="ts-btn-secondary" onClick={() => fileRef.current?.click()} disabled={subiendo}>
                    {subiendo ? "..." : "REEMPLAZAR"}
                  </button>
                </div>
              </div>

              {/* Estado del análisis */}
              <div className="ts-card">
                <span className="ts-label ts-label-muted mb-3 d-block">Estado</span>
                <div style={{
                  background: analisis.estrategia.exito ? "rgba(76,175,80,0.1)" : "rgba(255,170,0,0.1)",
                  border: `1px solid ${analisis.estrategia.exito ? "rgba(76,175,80,0.3)" : "rgba(255,170,0,0.3)"}`,
                  borderRadius: "var(--ts-radius)",
                  padding: "16px",
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: "28px", margin: "0 0 8px 0" }}>
                    {analisis.estrategia.exito ? "🎯" : "⚠️"}
                  </p>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, color: analisis.estrategia.exito ? "var(--ts-accent-green)" : "#ffaa00", margin: 0 }}>
                    {analisis.estrategia.exito ? "Objetivos ≥60% conseguidos" : "Modo fallback activo"}
                  </p>
                </div>

                <div className="ts-totals-box mt-3">
                  <div className="ts-total-row">
                    <span className="ts-total-label">Beneficio total</span>
                    <span className="ts-total-value" style={{ color: analisis.estrategia.beneficioTotal >= 0 ? "var(--ts-accent-lime)" : "#ff6666" }}>
                      {analisis.estrategia.beneficioTotal >= 0 ? "+" : ""}{analisis.estrategia.beneficioTotal.toFixed(2)}u
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha — resultados */}
            <div className="col-12 col-lg-8">

              {/* Tabla de stakes */}
              <div className="ts-card ts-card-accent-green mb-4">
                <span className="ts-label ts-label-green mb-3 d-block">Rangos óptimos por stake</span>
                <div style={{ overflowX: "auto" }}>
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
                        { label: "STAKE 1",   m: analisis.estrategia.m1,  color: "var(--ts-accent-lime)" },
                        { label: "STAKE 1.5", m: analisis.estrategia.m15, color: "var(--ts-accent-green)" },
                        { label: "STAKE 2",   m: analisis.estrategia.m2,  color: "var(--ts-accent-green)" },
                      ].map(({ label, m, color }) => (
                        <tr key={label} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, color }}>{label}</td>
                          <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#fff" }}>
                            {pct(m.pIni)} – {pct(m.pFin)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--ts-text-muted)" }}>{m.total}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, color: m.pctAcierto >= 60 ? "var(--ts-accent-green)" : "#ffaa00" }}>
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
              </div>

              {/* Fórmula Excel */}
              <div className="ts-card">
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
                  <code style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-accent-lime)", wordBreak: "break-all", lineHeight: 1.6, flex: 1 }}>
                    {analisis.estrategia.formula}
                  </code>
                  <button
                    onClick={() => copiar(analisis!.estrategia!.formula)}
                    style={{
                      background: copiado ? "rgba(76,175,80,0.2)" : "rgba(223,255,79,0.1)",
                      border: `1px solid ${copiado ? "rgba(76,175,80,0.4)" : "rgba(223,255,79,0.3)"}`,
                      borderRadius: "6px", padding: "8px 14px", cursor: "pointer",
                      fontFamily: "'Space Mono', monospace", fontSize: "11px",
                      color: copiado ? "var(--ts-accent-green)" : "var(--ts-accent-lime)",
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}
                  >
                    {copiado ? "✓ COPIADO" : "COPIAR"}
                  </button>
                </div>
              </div>
            </div>
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