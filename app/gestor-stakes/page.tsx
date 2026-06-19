"use client";

import { useState } from "react";

interface Resultado {
  stake1: number;
  stake2: number;
  stake3: number;
  totalStake1: number;
  totalStake2: number;
  totalStake3: number;
  totalInvertido: number;
  sobrante: number;
  decimales: boolean;
}

export default function GestorStakes() {
  const [cantidad, setCantidad] = useState("");
  const [numStake1, setNumStake1] = useState("");
  const [numStake2, setNumStake2] = useState("");
  const [numStake3, setNumStake3] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState("");

  const calcular = () => {
    setError("");
    setResultado(null);

    const total = parseFloat(cantidad.replace(",", "."));
    const n1 = parseInt(numStake1) || 0;
    const n2 = parseInt(numStake2) || 0;
    const n3 = parseInt(numStake3) || 0;

    if (isNaN(total) || total <= 0) {
      setError("Introduce una cantidad válida mayor que 0.");
      return;
    }
    if (n1 + n2 + n3 === 0) {
      setError("Debe haber al menos un partido.");
      return;
    }

    const factorTotal = n1 + 2 * n2 + 3 * n3;
    const stake1Exacto = total / factorTotal;

    let stake1 = Math.floor(stake1Exacto);
    let decimales = false;

    if (stake1 === 0) {
      stake1 = Math.floor(stake1Exacto * 10) / 10;
      decimales = true;
    }

    if (stake1 === 0) {
      setError(`La cantidad €${total.toFixed(2)} es demasiado pequeña. Se necesita al menos €${(factorTotal * 0.1).toFixed(1)}.`);
      return;
    }

    const stake2Exacto = 2 * stake1Exacto;
    const stake3Exacto = 3 * stake1Exacto;

    const stake2 = decimales ? Math.floor(stake2Exacto * 10) / 10 : Math.floor(stake2Exacto);
    const stake3 = decimales ? Math.floor(stake3Exacto * 10) / 10 : Math.floor(stake3Exacto);

    const totalStake1 = n1 * stake1;
    const totalStake2 = n2 * stake2;
    const totalStake3 = n3 * stake3;
    const totalInvertido = totalStake1 + totalStake2 + totalStake3;
    const sobrante = total - totalInvertido;

    setResultado({ stake1, stake2, stake3, totalStake1, totalStake2, totalStake3, totalInvertido, sobrante, decimales });
  };

  const resetear = () => {
    setCantidad("");
    setNumStake1("");
    setNumStake2("");
    setNumStake3("");
    setResultado(null);
    setError("");
  };

  const fmt = (n: number, dec: boolean) => dec ? n.toFixed(1) : n.toFixed(0);

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

      {/* Contenido */}
      <div className="container-xl py-5 px-4">

        {/* Cabecera */}
        <span className="ts-label">Calculadora</span>
        <h1 className="ts-page-title">
          Gestor de <span className="ts-highlight-lime">Stakes</span>
        </h1>
        <p className="ts-text-muted-custom mb-5">
          Distribuye tu bankroll entre partidos según niveles de stake.
        </p>

        {/* Grid dos columnas */}
        <div className="row g-4">

          {/* Formulario */}
          <div className="col-12 col-lg-5">
            <div className="ts-card">
              <span className="ts-label ts-label-muted mb-4 d-block">Datos de entrada</span>

              {/* Cantidad */}
              <div className="mb-4">
                <label className="ts-input-label">Dinero disponible (€)</label>
                <input
                  type="text"
                  className="ts-input"
                  placeholder="ej: 100 o 100,50"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>

              {/* Partidos por stake */}
              <div className="mb-4">
                <label className="ts-input-label mb-3 d-block">Número de partidos por stake</label>
                <div className="row g-3">
                  <div className="col-4">
                    <label className="ts-input-label" style={{ color: "var(--ts-accent-lime)" }}>Stake 1</label>
                    <input type="number" min="0" placeholder="0" className="ts-input"
                      value={numStake1} onChange={(e) => setNumStake1(e.target.value)} />
                  </div>
                  <div className="col-4">
                    <label className="ts-input-label" style={{ color: "var(--ts-accent-green)" }}>Stake 2</label>
                    <input type="number" min="0" placeholder="0" className="ts-input"
                      value={numStake2} onChange={(e) => setNumStake2(e.target.value)} />
                  </div>
                  <div className="col-4">
                    <label className="ts-input-label" style={{ color: "var(--ts-accent-green)" }}>Stake 3</label>
                    <input type="number" min="0" placeholder="0" className="ts-input"
                      value={numStake3} onChange={(e) => setNumStake3(e.target.value)} />
                  </div>
                </div>
                <small className="ts-label-muted ts-label mt-2 d-block" style={{ fontSize: "10px" }}>
                  S2 = 2 × S1 · S3 = 3 × S1
                </small>
              </div>

              {/* Error */}
              {error && <div className="ts-alert-error mb-4">{error}</div>}

              {/* Botones */}
              <div className="d-flex gap-3">
                <button className="ts-btn-primary flex-grow-1" onClick={calcular}>CALCULAR</button>
                <button className="ts-btn-secondary" onClick={resetear}>RESET</button>
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="col-12 col-lg-7">
            {!resultado ? (
              <div className="ts-empty-state">
                <span className="ts-empty-icon">📊</span>
                <span className="ts-label ts-label-muted">El resultado aparecerá aquí</span>
              </div>
            ) : (
              <div className="ts-card ts-card-accent-lime">

                <span className="ts-label" style={{ color: resultado.decimales ? "#ffaa44" : "var(--ts-accent-green)" }}>
                  {resultado.decimales ? "⚠ Modo con decimales" : "✓ Distribución óptima"}
                </span>

                {/* Stakes */}
                <div className="row g-3 mb-4">
                  {[
                    { label: "Stake 1", value: fmt(resultado.stake1, resultado.decimales), color: "var(--ts-accent-lime)" },
                    { label: "Stake 2", value: fmt(resultado.stake2, resultado.decimales), color: "var(--ts-accent-green)" },
                    { label: "Stake 3", value: fmt(resultado.stake3, resultado.decimales), color: "var(--ts-accent-green)" },
                  ].map((s) => (
                    <div key={s.label} className="col-4">
                      <div className="ts-stat-box">
                        <span className="ts-stat-label">{s.label}</span>
                        <p className="ts-stat-value" style={{ color: s.color }}>€{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="ts-divider" />

                {/* Desglose */}
                <span className="ts-label ts-label-muted mb-3 d-block">Desglose</span>
                {[
                  { n: parseInt(numStake1) || 0, stake: resultado.stake1, total: resultado.totalStake1, label: "Stake 1" },
                  { n: parseInt(numStake2) || 0, stake: resultado.stake2, total: resultado.totalStake2, label: "Stake 2" },
                  { n: parseInt(numStake3) || 0, stake: resultado.stake3, total: resultado.totalStake3, label: "Stake 3" },
                ].filter(r => r.n > 0).map((r) => (
                  <div key={r.label} className="ts-result-row">
                    <span style={{ color: "var(--ts-text-muted)" }}>
                      {r.n} partidos × €{fmt(r.stake, resultado.decimales)} ({r.label})
                    </span>
                    <strong>€{r.total.toFixed(2)}</strong>
                  </div>
                ))}

                <hr className="ts-divider" />

                {/* Totales */}
                <div className="ts-totals-box">
                  <div className="ts-total-row">
                    <span className="ts-total-label">Total invertido</span>
                    <span className="ts-total-value ts-highlight-lime">€{resultado.totalInvertido.toFixed(2)}</span>
                  </div>
                  <div className="ts-total-row">
                    <span className="ts-total-label">Sobrante</span>
                    <span className="ts-total-value ts-highlight-green">€{resultado.sobrante.toFixed(2)}</span>
                  </div>
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