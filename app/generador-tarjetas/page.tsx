"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import { DISENOS, CamposTarjeta, cargarTemplate, sustituirPlaceholders } from "@/lib/tarjetas/generator";

export default function GeneradorTarjetas() {
  const [campos, setCampos] = useState<CamposTarjeta>({});
  const [disenoId, setDisenoId] = useState("diseno1");
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");

  const actualizar = (campo: keyof CamposTarjeta, valor: string) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }));
  };

  const generar = async () => {
    setError("");
    setImagenUrl(null);
    setGenerando(true);

    try {
      const diseno = DISENOS.find((d) => d.id === disenoId);
      if (!diseno) throw new Error("Diseño no encontrado.");

      const htmlTemplate = await cargarTemplate(diseno.templatePath);
      const htmlFinal = sustituirPlaceholders(htmlTemplate, campos);

      // Crear iframe oculto
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "1080px";
      iframe.style.height = "1920px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      // Escribir HTML en el iframe
      const doc = iframe.contentDocument!;
      doc.open();
      doc.write(htmlFinal);
      doc.close();

      // Esperar a que carguen las fuentes
      await new Promise((r) => setTimeout(r, 1500));

      // Capturar con html2canvas
      const canvas = await html2canvas(doc.body, {
        width: 1080,
        height: 1920,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      document.body.removeChild(iframe);
      setImagenUrl(canvas.toDataURL("image/png"));
    } catch (e) {
      setError("Error al generar la tarjeta. Inténtalo de nuevo.");
      console.error(e);
    } finally {
      setGenerando(false);
    }
  };

  const descargar = () => {
    if (!imagenUrl) return;
    const link = document.createElement("a");
    link.href = imagenUrl;
    link.download = `tennis-card-${Date.now()}.png`;
    link.click();
  };

  const campos_config = [
    { key: "jugador1",    label: "Jugador 1",    placeholder: "ej: Carlos Alcaraz",  type: "text" },
    { key: "jugador2",    label: "Jugador 2",    placeholder: "ej: Novak Djokovic",  type: "text" },
    { key: "torneo",      label: "Torneo",       placeholder: "ej: Roland Garros",   type: "text" },
    { key: "fecha",       label: "Fecha",        placeholder: "ej: 06 Jun 2025",     type: "text" },
    { key: "hora",        label: "Hora",         placeholder: "ej: 14:30",           type: "text" },
    { key: "ganador",     label: "Ganador estimado", placeholder: "ej: Alcaraz",     type: "text" },
    { key: "probabilidad",label: "Probabilidad", placeholder: "ej: 74%",             type: "text" },
    { key: "cuota",       label: "Cuota",        placeholder: "ej: 1.85",            type: "text" },
  ] as const;

  return (
    <div>
      {/* Nav */}
      <nav className="ts-nav">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="ts-nav-brand">🎾 TENNIS SUITE</a>
            <span className="ts-nav-section">Generador de Tarjetas</span>
          </div>
        </div>
      </nav>

      <div className="container-xl py-5 px-4">

        {/* Cabecera */}
        <span className="ts-label">Diseño</span>
        <h1 className="ts-page-title">
          Generador de <span className="ts-highlight-lime">Tarjetas</span>
        </h1>
        <p className="ts-text-muted-custom mb-5">
          Rellena los campos, elige un diseño y genera tu tarjeta para redes sociales.
        </p>

        <div className="row g-4">

          {/* Columna izquierda — Formulario */}
          <div className="col-12 col-lg-6">

            {/* Campos */}
            <div className="ts-card mb-4">
              <span className="ts-label ts-label-muted mb-4 d-block">Datos del partido</span>
              <div className="row g-3">
                {campos_config.map(({ key, label, placeholder }) => (
                  <div key={key} className="col-12 col-sm-6">
                    <label className="ts-input-label">{label}</label>
                    <input
                      type="text"
                      className="ts-input"
                      placeholder={placeholder}
                      value={campos[key] ?? ""}
                      onChange={(e) => actualizar(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Selector de diseño — dropdown */}
            <div className="ts-card mb-4">
              <span className="ts-label ts-label-muted mb-3 d-block">Elige un diseño</span>
              <select
                value={disenoId}
                onChange={(e) => setDisenoId(e.target.value)}
                className="ts-input"
                style={{ cursor: "pointer", appearance: "auto" }}
              >
                {DISENOS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} — {d.descripcion}
                  </option>
                ))}
              </select>
              {/* Preview del diseño seleccionado */}
              {(() => {
                const d = DISENOS.find((d) => d.id === disenoId);
                if (!d) return null;
                return (
                  <div style={{
                    marginTop: "12px",
                    background: d.bgColor,
                    border: `1px solid ${d.acento}44`,
                    borderLeft: `3px solid ${d.acento}`,
                    borderRadius: "var(--ts-radius)",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: d.acento, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "13px", margin: "0 0 2px 0", color: d.acento }}>{d.nombre}</p>
                      <p style={{ fontSize: "11px", color: "var(--ts-text-muted)", margin: 0 }}>{d.descripcion}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Error */}
            {error && <div className="ts-alert-error mb-4">{error}</div>}

            {/* Botón generar */}
            <button
              className="ts-btn-primary"
              onClick={generar}
              disabled={generando}
            >
              {generando ? "GENERANDO..." : "GENERAR TARJETA"}
            </button>
          </div>

          {/* Columna derecha — Preview */}
          <div className="col-12 col-lg-6">
            {!imagenUrl ? (
              <div className="ts-empty-state">
                <span className="ts-empty-icon">🎨</span>
                <span className="ts-label ts-label-muted">
                  {generando ? "Generando tu tarjeta..." : "La tarjeta aparecerá aquí"}
                </span>
              </div>
            ) : (
              <div className="ts-card ts-card-accent-lime">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="ts-label mb-0" style={{ color: "var(--ts-accent-green)" }}>
                    ✓ Tarjeta generada
                  </span>
                  <button className="ts-btn-primary" style={{ width: "auto", padding: "10px 24px" }} onClick={descargar}>
                    DESCARGAR PNG
                  </button>
                </div>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center",
                  background: "var(--ts-bg-primary)",
                  borderRadius: "var(--ts-radius)",
                  padding: "16px",
                }}>
                  <img
                    src={imagenUrl}
                    alt="Tarjeta generada"
                    style={{
                      height: "500px",
                      width: "auto",
                      borderRadius: "8px",
                      display: "block",
                    }}
                  />
                </div>
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