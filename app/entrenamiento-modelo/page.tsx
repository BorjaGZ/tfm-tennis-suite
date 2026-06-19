"use client";

import { useState, useEffect, useRef } from "react";

interface Registro {
  jugador: string;
  probabilidad: number;
  resultado: string;
  circuito: string;
}

interface Grupos {
  topSI: Registro[];
  topNO: Registro[];
  bottomSI: Registro[];
}

interface Analisis {
  total: number;
  seleccion: Registro[];
  resto: Registro[];
  grupos: Grupos;
}

type Estado = "cargando" | "sin-excel" | "con-excel" | "analizando" | "resultado" | "error";

export default function EntrenamientoModelo() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [error, setError] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarResto, setMostrarResto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { comprobarExcel(); }, []);

  const comprobarExcel = async () => {
    setEstado("cargando");
    try {
      const res = await fetch("/api/entrenamiento-modelo");
      const data = await res.json();
      if (data.exists && data.seleccion) {
        setAnalisis(data);
        setEstado("resultado");
      } else if (data.exists) {
        setEstado("con-excel");
      } else {
        setEstado("sin-excel");
      }
    } catch {
      setEstado("error");
      setError("No se pudo conectar con el servidor.");
    }
  };

  const ejecutarAnalisis = async () => {
    setEstado("analizando");
    try {
      const res = await fetch("/api/entrenamiento-modelo");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalisis(data);
      setEstado("resultado");
    } catch (e: any) {
      setError(e.message ?? "Error al analizar el Excel.");
      setEstado("error");
    }
  };

  const subirExcel = async (file: File) => {
    setSubiendo(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/entrenamiento-modelo", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await ejecutarAnalisis();
    } catch (e: any) {
      setError(e.message ?? "Error al subir el archivo.");
      setEstado("sin-excel");
    } finally {
      setSubiendo(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) subirExcel(file);
  };

  const exportarTxt = () => {
    if (!analisis) return;

    const lineasSeleccion = analisis.seleccion
      .map((r) => `${r.jugador},${r.probabilidad.toFixed(2)},${r.resultado},${r.circuito}`)
      .join("\n");

    const lineasResto = analisis.resto
      .map((r) => `${r.jugador},${r.probabilidad.toFixed(2)},${r.resultado},${r.circuito}`)
      .join("\n");

    const contenido =
      `--- FORMATO TEXTO PLANO PARA GENERAR NUEVO MODELO ---\n` +
      `Jugador / Favorito,Probabilidad,Resultado,Circuito\n` +
      `${lineasSeleccion}\n` +
      `\n--- RESTO DE PARTIDOS EN TEXTO PLANO PARA GENERAR NUEVO MODELO ---\n` +
      `Jugador / Favorito,Probabilidad,Resultado,Circuito\n` +
      `${lineasResto}`;

    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seleccion_333.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const badgeResultado = (resultado: string) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    background: resultado === "SI" ? "rgba(76,175,80,0.15)" : "rgba(255,68,68,0.15)",
    color: resultado === "SI" ? "#4CAF50" : "#ff6666",
    border: `1px solid ${resultado === "SI" ? "rgba(76,175,80,0.3)" : "rgba(255,68,68,0.3)"}`,
  });

  const TablaRegistros = ({ registros, grupo }: { registros: Registro[], grupo?: string }) => (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--ts-border-default)" }}>
          {grupo && <th style={{ padding: "10px 12px", textAlign: "left", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Grupo</th>}
          <th style={{ padding: "10px 12px", textAlign: "left", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Jugador</th>
          <th style={{ padding: "10px 12px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Prob.</th>
          <th style={{ padding: "10px 12px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Res.</th>
          <th style={{ padding: "10px 12px", textAlign: "left", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Circuito</th>
        </tr>
      </thead>
      <tbody>
        {registros.map((r, i) => (
          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            {grupo && (
              <td style={{ padding: "12px", color: "var(--ts-text-muted)", fontSize: "12px", fontFamily: "'Space Mono', monospace" }}>
                {grupo}
              </td>
            )}
            <td style={{ padding: "12px", color: "#fff", fontWeight: 600 }}>{r.jugador}</td>
            <td style={{ padding: "12px", textAlign: "center", color: "var(--ts-accent-lime)", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
              {r.probabilidad.toFixed(2)}
            </td>
            <td style={{ padding: "12px", textAlign: "center" }}>
              <span style={badgeResultado(r.resultado)}>{r.resultado}</span>
            </td>
            <td style={{ padding: "12px", color: "var(--ts-text-muted)", fontSize: "13px" }}>{r.circuito}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const SeleccionConGrupos = () => {
    if (!analisis) return null;
    const { topSI, topNO, bottomSI } = analisis.grupos;
    const grupos = [
      { label: "↑ SI Mayor Prob", registros: topSI, color: "#4CAF50" },
      { label: "↑ NO Mayor Prob", registros: topNO, color: "#ff6666" },
      { label: "↓ SI Menor Prob", registros: bottomSI, color: "#dfff4f" },
    ];
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--ts-border-default)" }}>
            <th style={{ padding: "10px 12px", textAlign: "left", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Grupo</th>
            <th style={{ padding: "10px 12px", textAlign: "left", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Jugador</th>
            <th style={{ padding: "10px 12px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Prob.</th>
            <th style={{ padding: "10px 12px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Res.</th>
            <th style={{ padding: "10px 12px", textAlign: "left", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Circuito</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map(({ label, registros, color }) =>
            registros.map((r, i) => (
              <tr key={`${label}-${i}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px", fontSize: "11px", fontFamily: "'Space Mono', monospace", color, whiteSpace: "nowrap" }}>
                  {label}
                </td>
                <td style={{ padding: "12px", color: "#fff", fontWeight: 600 }}>{r.jugador}</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ts-accent-lime)", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
                  {r.probabilidad.toFixed(2)}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <span style={badgeResultado(r.resultado)}>{r.resultado}</span>
                </td>
                <td style={{ padding: "12px", color: "var(--ts-text-muted)", fontSize: "13px" }}>{r.circuito}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      {/* Nav */}
      <nav className="ts-nav">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="ts-nav-brand">🎾 TENNIS SUITE</a>
            <span className="ts-nav-section">Entrenamiento Modelo</span>
          </div>
        </div>
      </nav>

      <div className="container-xl py-5 px-4">

        {/* Cabecera */}
        <span className="ts-label ts-label-green">Selección IA</span>
        <h1 className="ts-page-title">
          Entrenamiento <span className="ts-highlight-green">Modelo</span>
        </h1>
        <p className="ts-text-muted-custom mb-5">
          Selecciona los 9 partidos clave (3-3-3) para reentrenar tu modelo predictivo.
        </p>

        {/* Estado: cargando */}
        {estado === "cargando" && (
          <div className="ts-empty-state">
            <span className="ts-empty-icon">⏳</span>
            <span className="ts-label ts-label-muted">Comprobando Excel en servidor...</span>
          </div>
        )}

        {/* Estado: analizando */}
        {estado === "analizando" && (
          <div className="ts-empty-state">
            <span className="ts-empty-icon">🧠</span>
            <span className="ts-label ts-label-muted">Analizando datos...</span>
          </div>
        )}

        {/* Estado: error */}
        {estado === "error" && (
          <div className="ts-alert-error mb-4">
            {error}
            <button className="ts-btn-secondary ms-3" onClick={comprobarExcel} style={{ padding: "6px 16px", fontSize: "12px" }}>
              Reintentar
            </button>
          </div>
        )}

        {/* Estado: sin excel */}
        {estado === "sin-excel" && (
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <div className="ts-card ts-card-accent-green text-center">
                <span style={{ fontSize: "40px", display: "block", marginBottom: "20px" }}>📂</span>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                  No hay Excel en el servidor
                </h2>
                <p className="ts-text-muted-custom mb-4">
                  Sube tu archivo <strong style={{ color: "#fff" }}>entrenamiento_modelo.xlsx</strong> para comenzar.
                </p>
                {error && <div className="ts-alert-error mb-4">{error}</div>}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileRef}
                  onChange={onFileChange}
                  style={{ display: "none" }}
                />
                <button
                  className="ts-btn-primary"
                  onClick={() => fileRef.current?.click()}
                  disabled={subiendo}
                >
                  {subiendo ? "SUBIENDO..." : "SUBIR EXCEL"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estado: con excel pero sin análisis */}
        {estado === "con-excel" && (
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <div className="ts-card ts-card-accent-green text-center">
                <span style={{ fontSize: "40px", display: "block", marginBottom: "20px" }}>✅</span>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                  Excel disponible en el servidor
                </h2>
                <p className="ts-text-muted-custom mb-4">
                  Puedes ejecutar el análisis con el Excel actual o subir uno nuevo.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <button className="ts-btn-primary" onClick={ejecutarAnalisis}>
                    EJECUTAR ANÁLISIS
                  </button>
                  <input type="file" accept=".xlsx,.xls" ref={fileRef} onChange={onFileChange} style={{ display: "none" }} />
                  <button className="ts-btn-secondary" onClick={() => fileRef.current?.click()} disabled={subiendo}>
                    {subiendo ? "SUBIENDO..." : "REEMPLAZAR"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estado: resultado */}
        {estado === "resultado" && analisis && (
          <div>
            {/* Barra de acciones */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div>
                <span className="ts-label ts-label-green mb-1 d-block">✓ Análisis completado</span>
                <span className="ts-text-muted-custom" style={{ fontSize: "13px" }}>
                  {analisis.total} registros totales · 9 seleccionados · {analisis.resto.length} restantes
                </span>
              </div>
              <div className="d-flex gap-3">
                <button className="ts-btn-primary" style={{ width: "auto", padding: "10px 20px" }} onClick={exportarTxt}>
                  EXPORTAR TXT
                </button>
                <input type="file" accept=".xlsx,.xls" ref={fileRef} onChange={onFileChange} style={{ display: "none" }} />
                <button className="ts-btn-secondary" onClick={() => fileRef.current?.click()} disabled={subiendo}>
                  {subiendo ? "SUBIENDO..." : "REEMPLAZAR EXCEL"}
                </button>
              </div>
            </div>

            {/* Selección 3-3-3 */}
            <div className="ts-card ts-card-accent-green mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="ts-label ts-label-green mb-0">Selección 3-3-3 para reentrenamiento</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "var(--ts-accent-green)", border: "1px solid var(--ts-border-green)", borderRadius: "4px", padding: "3px 10px" }}>
                  9 partidos
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <SeleccionConGrupos />
              </div>
            </div>

            {/* Resto de partidos */}
            <div className="ts-card">
              <div
                className="d-flex justify-content-between align-items-center mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => setMostrarResto(!mostrarResto)}
              >
                <span className="ts-label ts-label-muted mb-0">
                  Resto de partidos
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "var(--ts-text-muted)", border: "1px solid var(--ts-border-default)", borderRadius: "4px", padding: "3px 10px", cursor: "pointer" }}>
                  {mostrarResto ? "▲ ocultar" : `▼ ver ${analisis.resto.length} partidos`}
                </span>
              </div>
              {mostrarResto && (
                <div style={{ overflowX: "auto" }}>
                  <TablaRegistros registros={analisis.resto} />
                </div>
              )}
            </div>
          </div>
        )}
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