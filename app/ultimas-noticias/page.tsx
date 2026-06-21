"use client";

import { useState, useEffect } from "react";

interface Noticia {
  titular: string;
  resumen: string;
  categoria: string;
}

interface Respuesta {
  fecha: string;
  noticias: Noticia[];
}

type Estado = "cargando" | "resultado" | "error";

export default function UltimasNoticias() {
  const [estado, setEstado]       = useState<Estado>("cargando");
  const [datos, setDatos]         = useState<Respuesta | null>(null);
  const [error, setError]         = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>("");

  useEffect(() => { cargarNoticias(); }, []);

  const cargarNoticias = async () => {
    setEstado("cargando");
    setError("");
    try {
      const res  = await fetch("/api/ultimas-noticias");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDatos(data);
      setUltimaActualizacion(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
      setEstado("resultado");
    } catch (e: any) {
      setError(e.message ?? "Error al obtener noticias.");
      setEstado("error");
    }
  };

  const categoriaColor = (categoria: string) => {
    switch (categoria.toUpperCase()) {
      case "ATP":        return { color: "var(--ts-accent-lime)",  border: "var(--ts-border-lime)" };
      case "WTA":        return { color: "#f472b6",                border: "rgba(244,114,182,0.3)" };
      case "GRAND SLAM": return { color: "var(--ts-accent-green)", border: "var(--ts-border-green)" };
      default:           return { color: "#60a5fa",                border: "rgba(96,165,250,0.3)" };
    }
  };

  return (
    <div>
      {/* Nav */}
      <nav className="ts-nav">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="ts-nav-brand">🎾 TENNIS SUITE</a>
            <span className="ts-nav-section">Últimas Noticias</span>
          </div>
        </div>
      </nav>

      <div className="container-xl py-5 px-4">

        {/* Cabecera */}
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-2">
          <div>
            <span className="ts-label">IA · Tiempo Real</span>
            <h1 className="ts-page-title">
              Últimas <span className="ts-highlight-lime">Noticias</span>
            </h1>
          </div>
          <button
            className="ts-btn-secondary"
            onClick={cargarNoticias}
            disabled={estado === "cargando"}
            style={{ marginTop: "8px", padding: "10px 20px", fontSize: "12px" }}
          >
            {estado === "cargando" ? "ACTUALIZANDO..." : "↻ ACTUALIZAR"}
          </button>
        </div>

        <div className="d-flex align-items-center gap-3 mb-5">
          <p className="ts-text-muted-custom mb-0">
            Noticias del día obtenidas en tiempo real mediante Gemini AI con Google Search.
          </p>
          {ultimaActualizacion && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-accent-green)", whiteSpace: "nowrap" }}>
              ✓ {ultimaActualizacion}
            </span>
          )}
        </div>

        {/* Cargando */}
        {estado === "cargando" && (
          <div>
            <div className="d-flex align-items-center gap-3 mb-4">
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "var(--ts-text-muted)" }}>
                ⏳ Consultando Gemini AI...
              </span>
            </div>
            <div className="row g-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="col-12 col-md-6 col-xl-4">
                  <div className="ts-card" style={{ minHeight: "180px", opacity: 0.4 }}>
                    <div style={{ background: "var(--ts-border-default)", borderRadius: "4px", height: "12px", width: "60px", marginBottom: "16px" }} />
                    <div style={{ background: "var(--ts-border-default)", borderRadius: "4px", height: "20px", width: "90%", marginBottom: "12px" }} />
                    <div style={{ background: "var(--ts-border-default)", borderRadius: "4px", height: "14px", width: "100%", marginBottom: "8px" }} />
                    <div style={{ background: "var(--ts-border-default)", borderRadius: "4px", height: "14px", width: "80%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {estado === "error" && (
          <div className="ts-alert-error mb-4 d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button className="ts-btn-secondary ms-3" onClick={cargarNoticias} style={{ padding: "6px 16px", fontSize: "12px" }}>
              Reintentar
            </button>
          </div>
        )}

        {/* Noticias */}
        {estado === "resultado" && datos && (
          <div>
            {/* Fecha */}
            <div className="mb-4">
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "var(--ts-text-muted)", letterSpacing: "1px" }}>
                📅 {datos.fecha}
              </span>
            </div>

            {/* Grid de noticias */}
            <div className="row g-4">
              {datos.noticias.map((noticia, i) => {
                const cat = categoriaColor(noticia.categoria);
                return (
                  <div key={i} className="col-12 col-md-6 col-xl-4">
                    <div className="ts-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>

                      {/* Número + categoría */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "28px", fontWeight: 900, color: "var(--ts-text-faint)", lineHeight: 1 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", fontWeight: 700, color: cat.color, border: `1px solid ${cat.border}`, borderRadius: "4px", padding: "3px 10px", letterSpacing: "1px", textTransform: "uppercase" }}>
                          {noticia.categoria}
                        </span>
                      </div>

                      {/* Línea de acento */}
                      <div style={{ height: "2px", background: cat.color, borderRadius: "2px", marginBottom: "16px", opacity: 0.6 }} />

                      {/* Titular */}
                      <h2 style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.4, marginBottom: "12px", color: "#fff", flex: 1 }}>
                        {noticia.titular}
                      </h2>

                      {/* Resumen */}
                      <p style={{ fontSize: "13px", color: "var(--ts-text-muted)", lineHeight: 1.6, margin: 0 }}>
                        {noticia.resumen}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer info */}
            <div className="mt-5 text-center">
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "var(--ts-text-faint)", letterSpacing: "1px" }}>
                Noticias generadas por Gemini 2.0 Flash con Google Search · Tennis Suite
              </span>
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