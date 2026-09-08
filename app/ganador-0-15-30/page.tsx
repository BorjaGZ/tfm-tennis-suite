"use client";

import { useState } from "react";

interface Resultado {
  nombre1: string;
  nombre2: string;
  prob1: number;
  prob2: number;
  ganador: string;
  diferencial: number;
  stake: "NO APOSTAR" | "STAKE 1" | "STAKE 2" | "STAKE 3";
}

interface DatosJugador {
  nombre: string;
  primerServicio: string;
  ganado1er: string;
  ganado2do: string;
}

export default function GanadorCero1530() {
  const [j1, setJ1] = useState<DatosJugador>({ nombre: "", primerServicio: "", ganado1er: "", ganado2do: "" });
  const [j2, setJ2] = useState<DatosJugador>({ nombre: "", primerServicio: "", ganado1er: "", ganado2do: "" });
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState("");

  // Trunca a 2 decimales evitando errores de coma flotante
  const truncar2 = (v: number) => Math.trunc(v * 100 + 1e-9) / 100;

  const calcularProbabilidad = (primerServicio: number, ganado1er: number, ganado2do: number) => {
    const a = primerServicio / 100;
    const b = ganado1er / 100;
    const c = ganado2do / 100;
    const p = a * b + (1 - a) * c;
    const q = 1 - p;
    const resultado = (Math.pow(p, 4) + 4 * Math.pow(p, 4) * q + 10 * Math.pow(p, 4) * Math.pow(q, 2)) * 100;
    return truncar2(resultado);
  };

  const determinarStake = (diferencial: number): Resultado["stake"] => {
    if (diferencial < 5) return "NO APOSTAR";
    if (diferencial <= 9) return "STAKE 1";
    if (diferencial <= 14) return "STAKE 2";
    return "STAKE 3";
  };

  const validarJugador = (j: DatosJugador, etiqueta: string): number[] | null => {
    const primerServicio = parseFloat(j.primerServicio.replace(",", "."));
    const ganado1er = parseFloat(j.ganado1er.replace(",", "."));
    const ganado2do = parseFloat(j.ganado2do.replace(",", "."));

    if ([primerServicio, ganado1er, ganado2do].some((v) => isNaN(v) || v < 0 || v > 100)) {
      setError(`Revisa los valores de ${etiqueta}: deben ser porcentajes entre 0 y 100.`);
      return null;
    }
    return [primerServicio, ganado1er, ganado2do];
  };

  const calcular = () => {
    setError("");
    setResultado(null);

    const datos1 = validarJugador(j1, "Jugador 1");
    if (!datos1) return;
    const datos2 = validarJugador(j2, "Jugador 2");
    if (!datos2) return;

    const prob1 = calcularProbabilidad(datos1[0], datos1[1], datos1[2]);
    const prob2 = calcularProbabilidad(datos2[0], datos2[1], datos2[2]);

    const nombre1 = j1.nombre.trim() || "Jugador 1";
    const nombre2 = j2.nombre.trim() || "Jugador 2";
    const diferencial = truncar2(Math.abs(prob1 - prob2));
    const ganador = prob1 >= prob2 ? nombre1 : nombre2;
    const stake = determinarStake(diferencial);

    setResultado({ nombre1, nombre2, prob1, prob2, ganador, diferencial, stake });
  };

  const resetear = () => {
    setJ1({ nombre: "", primerServicio: "", ganado1er: "", ganado2do: "" });
    setJ2({ nombre: "", primerServicio: "", ganado1er: "", ganado2do: "" });
    setResultado(null);
    setError("");
  };

  const stakeColor = (stake: string) => {
    if (stake === "NO APOSTAR") return "#ff6666";
    if (stake === "STAKE 1") return "var(--ts-accent-lime)";
    return "var(--ts-accent-green)";
  };

  const CampoJugador = ({
    titulo, datos, onChange,
  }: {
    titulo: string;
    datos: DatosJugador;
    onChange: (d: DatosJugador) => void;
  }) => (
    <div className="ts-card mb-4">
      <span className="ts-label ts-label-muted mb-3 d-block">{titulo}</span>

      <div className="mb-3">
        <label className="ts-input-label">Nombre</label>
        <input
          type="text"
          className="ts-input"
          placeholder={titulo}
          value={datos.nombre}
          onChange={(e) => onChange({ ...datos, nombre: e.target.value })}
        />
      </div>

      <div className="row g-3">
        <div className="col-4">
          <label className="ts-input-label">1er servicio %</label>
          <input
            type="text"
            className="ts-input"
            placeholder="78,1"
            value={datos.primerServicio}
            onChange={(e) => onChange({ ...datos, primerServicio: e.target.value })}
          />
        </div>
        <div className="col-4">
          <label className="ts-input-label">Ganado 1er %</label>
          <input
            type="text"
            className="ts-input"
            placeholder="59,4"
            value={datos.ganado1er}
            onChange={(e) => onChange({ ...datos, ganado1er: e.target.value })}
          />
        </div>
        <div className="col-4">
          <label className="ts-input-label">Ganado 2do %</label>
          <input
            type="text"
            className="ts-input"
            placeholder="44,8"
            value={datos.ganado2do}
            onChange={(e) => onChange({ ...datos, ganado2do: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Nav */}
      <nav className="ts-nav">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="ts-nav-brand">🎾 TENNIS SUITE</a>
            <span className="ts-nav-section">Ganador 0-15-30</span>
          </div>
        </div>
      </nav>

      <div className="container-xl py-5 px-4">

        {/* Cabecera */}
        <span className="ts-label">Calculadora</span>
        <h1 className="ts-page-title">
          Ganador <span className="ts-highlight-lime">0-15-30</span>
        </h1>
        <p className="ts-text-muted-custom mb-5">
          Calcula la probabilidad de cada jugador de ganar su servicio a 0-15-30 y determina el stake recomendado según el diferencial.
        </p>

        <div className="row g-4">

          {/* Columna izquierda — Formulario */}
          <div className="col-12 col-lg-5">
            <CampoJugador titulo="Jugador 1" datos={j1} onChange={setJ1} />
            <CampoJugador titulo="Jugador 2" datos={j2} onChange={setJ2} />

            {error && <div className="ts-alert-error mb-4">{error}</div>}

            <div className="d-flex gap-3">
              <button className="ts-btn-primary flex-grow-1" onClick={calcular}>
                CALCULAR GANADOR 0-15-30
              </button>
              <button className="ts-btn-secondary" onClick={resetear}>
                RESET
              </button>
            </div>
          </div>

          {/* Columna derecha — Resultado */}
          <div className="col-12 col-lg-7">
            {!resultado ? (
              <div className="ts-empty-state">
                <span className="ts-empty-icon">🎾</span>
                <span className="ts-label ts-label-muted">El resultado aparecerá aquí</span>
              </div>
            ) : (
              <div>

                {/* Ganador */}
                <div className="ts-card ts-card-accent-lime mb-4" style={{ textAlign: "center", padding: "48px 32px" }}>
                  <span className="ts-label mb-3 d-block">Ganador estimado</span>
                  <p style={{ fontSize: "48px", margin: "0 0 16px 0" }}>🏆</p>
                  <h2 style={{ fontSize: "40px", fontWeight: 900, letterSpacing: "-1px", color: "#fff", margin: 0, lineHeight: 1.1 }}>
                    {resultado.ganador}
                  </h2>
                </div>

                {/* Probabilidades */}
                <div className="row g-3 mb-4">
                  {[
                    { label: resultado.nombre1, value: resultado.prob1, esGanador: resultado.ganador === resultado.nombre1 },
                    { label: resultado.nombre2, value: resultado.prob2, esGanador: resultado.ganador === resultado.nombre2 },
                  ].map((j) => (
                    <div key={j.label} className="col-6">
                      <div className="ts-stat-box" style={{ border: j.esGanador ? "1px solid var(--ts-accent-lime)" : undefined, height: "100%" }}>
                        <span className="ts-stat-label">{j.label}</span>
                        <p className="ts-stat-value" style={{ color: j.esGanador ? "var(--ts-accent-lime)" : "var(--ts-text-primary)", fontSize: "36px" }}>
                          {j.value.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stake recomendado */}
                <div className="ts-card mb-4" style={{ textAlign: "center", padding: "36px 32px" }}>
                  <span className="ts-label ts-label-muted mb-3 d-block">Stake recomendado</span>
                  <p style={{ fontSize: "48px", fontWeight: 900, color: stakeColor(resultado.stake), fontFamily: "'Space Mono', monospace", margin: 0, letterSpacing: "-1px" }}>
                    {resultado.stake}
                  </p>
                </div>

                {/* Valor diferenciador */}
                <div className="ts-totals-box">
                  <div className="ts-total-row">
                    <span className="ts-total-label">Valor diferenciador</span>
                    <span className="ts-total-value" style={{ color: "var(--ts-accent-lime)" }}>
                      {resultado.diferencial.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tabla de umbrales */}
                <div className="ts-card mt-4">
                  <span className="ts-label ts-label-muted mb-3 d-block">Umbrales de decisión</span>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--ts-border-default)" }}>
                        {["Diferencial", "Stake"].map((h) => (
                          <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "var(--ts-text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { rango: "< 5",     stake: "NO APOSTAR", color: "#ff6666" },
                        { rango: "5 – 9",   stake: "STAKE 1",    color: "var(--ts-accent-lime)" },
                        { rango: "10 – 14", stake: "STAKE 2",    color: "var(--ts-accent-green)" },
                        { rango: "≥ 15",    stake: "STAKE 3",    color: "var(--ts-accent-green)" },
                      ].map((r) => (
                        <tr key={r.stake} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "10px", textAlign: "center", color: "var(--ts-text-muted)" }}>{r.rango}</td>
                          <td style={{ padding: "10px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: 700, color: r.color }}>{r.stake}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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