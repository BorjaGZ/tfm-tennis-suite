"use client";

import { useState, useRef } from "react";

interface Resultado {
  ganador: string;
  probabilidad: number;
}

type Estado = "idle" | "analizando" | "resultado" | "error";

export default function AnalizadorPartido() {
  const [estado, setEstado]       = useState<Estado>("idle");
  const [imagen1, setImagen1]     = useState<File | null>(null);
  const [imagen2, setImagen2]     = useState<File | null>(null);
  const [preview1, setPreview1]   = useState<string | null>(null);
  const [preview2, setPreview2]   = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError]         = useState("");

  const fileRef1 = useRef<HTMLInputElement | null>(null);
  const fileRef2 = useRef<HTMLInputElement | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>, num: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (num === 1) { setImagen1(file); setPreview1(url); }
    else           { setImagen2(file); setPreview2(url); }
  };

  const analizar = async () => {
    if (!imagen1 || !imagen2) {
      setError("Sube las dos imágenes antes de analizar.");
      return;
    }
    setError("");
    setResultado(null);
    setEstado("analizando");

    try {
      const formData = new FormData();
      formData.append("imagen1", imagen1);
      formData.append("imagen2", imagen2);

      const res  = await fetch("/api/analizador-partido", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      setResultado(data);
      setEstado("resultado");
    } catch (e: any) {
      setError(e.message ?? "Error al analizar el partido.");
      setEstado("error");
    }
  };

  const resetear = () => {
    setEstado("idle");
    setImagen1(null);
    setImagen2(null);
    setPreview1(null);
    setPreview2(null);
    setResultado(null);
    setError("");
  };

  const probColor = (prob: number) => {
    if (prob >= 70) return "var(--ts-accent-green)";
    if (prob >= 60) return "var(--ts-accent-lime)";
    return "#ffaa00";
  };

  const ZonaSubida = ({ num, preview, fileRef, label }: {
    num: 1 | 2;
    preview: string | null;
    fileRef: React.RefObject<HTMLInputElement | null>;
    label: string;
  }) => (
    <div>
      <label className="ts-input-label mb-2 d-block">{label}</label>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={(e) => onFile(e, num)}
        style={{ display: "none" }}
      />
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${preview ? "var(--ts-accent-green)" : "var(--ts-border-default)"}`,
          borderRadius: "var(--ts-radius)",
          padding: preview ? "8px" : "32px 16px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s",
          background: "var(--ts-bg-primary)",
          minHeight: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt={`Imagen ${num}`}
            style={{ width: "100%", borderRadius: "6px", display: "block" }}
          />
        ) : (
          <div>
            <p style={{ fontSize: "28px", margin: "0 0 8px 0" }}>📸</p>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)", margin: 0 }}>
              Haz clic para subir
            </p>
          </div>
        )}
      </div>
      {preview && (
        <button
          onClick={() => { if (num === 1) { setImagen1(null); setPreview1(null); } else { setImagen2(null); setPreview2(null); } }}
          className="ts-btn-secondary mt-2"
          style={{ padding: "4px 12px", fontSize: "11px", width: "auto" }}
        >
          ✕ Quitar
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Nav */}
      <nav className="ts-nav">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="ts-nav-brand">🎾 TENNIS SUITE</a>
            <span className="ts-nav-section">Analizador de Partido</span>
          </div>
        </div>
      </nav>

      <div className="container-xl py-5 px-4">

        {/* Cabecera */}
        <span className="ts-label ts-label-green">IA · Gemini</span>
        <h1 className="ts-page-title">
          Analizador de <span className="ts-highlight-green">Partido</span>
        </h1>
        <p className="ts-text-muted-custom mb-2">
          Sube las capturas de estadísticas de ambos jugadores y el modelo predice el ganador.
        </p>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-accent-green)", marginBottom: "40px" }}>
          ✓ Modelo Tierra Batida activo · Gemini 2.5 Flash con Google Search
        </p>

        <div className="row g-4">

          {/* Columna izquierda — Subida de imágenes */}
          <div className="col-12 col-lg-5">
            <div className="ts-card mb-4">
              <span className="ts-label ts-label-muted mb-4 d-block">Estadísticas del partido</span>

              <div className="mb-4">
                <ZonaSubida
                  num={1}
                  preview={preview1}
                  fileRef={fileRef1}
                  label="Imagen 1 — Todas las superficies (referencia secundaria)"
                />
              </div>

              <div className="mb-4">
                <ZonaSubida
                  num={2}
                  preview={preview2}
                  fileRef={fileRef2}
                  label="Imagen 2 — Tierra batida (fuente primaria)"
                />
              </div>

              {error && <div className="ts-alert-error mb-4">{error}</div>}

              <div className="d-flex gap-3">
                <button
                  className="ts-btn-primary flex-grow-1"
                  onClick={analizar}
                  disabled={estado === "analizando" || !imagen1 || !imagen2}
                >
                  {estado === "analizando" ? "ANALIZANDO..." : "ANALIZAR PARTIDO"}
                </button>
                <button className="ts-btn-secondary" onClick={resetear}>
                  RESET
                </button>
              </div>
            </div>

            {/* Info del modelo */}
            <div className="ts-card">
              <span className="ts-label ts-label-muted mb-3 d-block">Sobre el modelo</span>
              {[
                { label: "Modelo",     value: "Tierra Batida V11.0" },
                { label: "Métricas",   value: "7 variables ponderadas" },
                { label: "Algoritmo",  value: "Score ponderado + modificadores" },
                { label: "Búsqueda",   value: "Google Search en tiempo real" },
                { label: "Motor IA",   value: "Gemini 2.5 Flash" },
              ].map((item) => (
                <div key={item.label} className="ts-result-row">
                  <span style={{ color: "var(--ts-text-muted)", fontSize: "13px" }}>{item.label}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#fff" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha — Resultado */}
          <div className="col-12 col-lg-7">
            {estado === "idle" && (
              <div className="ts-empty-state">
                <span className="ts-empty-icon">🤖</span>
                <span className="ts-label ts-label-muted">
                  Sube las dos imágenes y pulsa Analizar
                </span>
              </div>
            )}

            {estado === "analizando" && (
              <div className="ts-empty-state">
                <span className="ts-empty-icon" style={{ fontSize: "48px" }}>⚙️</span>
                <span className="ts-label ts-label-green mb-2 d-block">Analizando partido...</span>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)", textAlign: "center", lineHeight: 1.8 }}>
                  Extrayendo métricas de las imágenes<br />
                  Ejecutando modelo Tierra Batida<br />
                  Consultando Google Search<br />
                  Aplicando modificadores contextuales
                </p>
              </div>
            )}

            {estado === "error" && (
              <div className="ts-empty-state">
                <span className="ts-empty-icon">❌</span>
                <div className="ts-alert-error mt-3" style={{ textAlign: "left" }}>{error}</div>
                <button className="ts-btn-secondary mt-4" onClick={resetear} style={{ padding: "10px 24px", fontSize: "12px" }}>
                  VOLVER A INTENTAR
                </button>
              </div>
            )}

            {estado === "resultado" && resultado && (
              <div>
                {/* Ganador */}
                <div className="ts-card ts-card-accent-green mb-4" style={{ textAlign: "center", padding: "52px 32px" }}>
                  <span className="ts-label ts-label-green mb-3 d-block">Predicción del modelo</span>
                  <p style={{ fontSize: "52px", margin: "0 0 16px 0" }}>🏆</p>
                  <h2 style={{ fontSize: "40px", fontWeight: 900, letterSpacing: "-1px", color: "#fff", margin: "0 0 8px 0", lineHeight: 1.1 }}>
                    {resultado.ganador}
                  </h2>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "var(--ts-text-muted)", margin: 0 }}>
                    Ganador estimado
                  </p>
                </div>

                {/* Probabilidad */}
                <div className="ts-card mb-4" style={{ textAlign: "center", padding: "40px 32px" }}>
                  <span className="ts-label ts-label-muted mb-3 d-block">Probabilidad estimada</span>
                  <p style={{ fontSize: "80px", fontWeight: 900, color: probColor(resultado.probabilidad), fontFamily: "'Space Mono', monospace", margin: "0 0 8px 0", lineHeight: 1 }}>
                    {resultado.probabilidad}%
                  </p>
                  <div style={{ background: "var(--ts-bg-primary)", borderRadius: "100px", height: "8px", margin: "16px 0 8px 0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${resultado.probabilidad}%`, background: probColor(resultado.probabilidad), borderRadius: "100px", transition: "width 0.8s ease" }} />
                  </div>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-muted)", margin: 0 }}>
                    {resultado.probabilidad >= 70 ? "Confianza alta" : resultado.probabilidad >= 60 ? "Confianza media" : "Confianza baja"}
                  </p>
                </div>

                {/* Botón nuevo análisis */}
                <button className="ts-btn-primary" onClick={resetear}>
                  NUEVO ANÁLISIS
                </button>
              </div>
            )}
          </div>
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