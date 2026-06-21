# MODELO_TIERRA_BATIDA_V11.0

---

## 1. PRINCIPIOS FUNDAMENTALES (REGLAS DE ORO)

En tierra batida la dinámica difiere radicalmente de las pistas rápidas. El sistema se basa en los siguientes principios **innegociables y jerarquizados**:

1. **La consistencia supera a la potencia:** Minimizar errores no forzados y sostener rallies largos es el factor predictivo número uno. Un jugador con ENF elevados pierde estructura incluso con mejor saque.
2. **El saque solo importa cuando es débil:** Un gran primer saque no garantiza la victoria en arcilla, pero un saque débil (< 55% de puntos ganados con 1er saque, o > 8% de dobles faltas) es una vulnerabilidad explotable de forma casi sistemática.
3. **El resto dicta el ganador:** El jugador con mejor rendimiento al resto —especialmente atacando el primer servicio rival— tiene ventaja estructural. **En caso de empate estadístico, apoyar siempre al mejor restador.**
4. **La tierra batida amplifica la fatiga:** Partidos largos, torneos con muchos sets jugados en días previos y condiciones de calor/humedad deben aplicarse como penalización explícita sobre las estadísticas base.

---

## 2. ALGORITMO DE PUNTUACIÓN PONDERADA

### 2.1 Métricas y Pesos

Aplicar a **estadísticas en tierra batida** (prioridad absoluta). Si la muestra es inferior a 3 partidos en arcilla, completar con datos de todas las superficies ponderados al 40%.

| # | Métrica | Peso | Umbral Positivo | Alerta Roja |
|:--|:--------|:----:|:----------------|:------------|
| 1 | Puntos ganados restando 1er saque | **25%** | > 45% | < 38% |
| 2 | Puntos ganados con 2do saque propio | **22%** | > 52% | < 44% |
| 3 | Puntos ganados restando 2do saque | **18%** | > 55% | < 47% |
| 4 | Puntos ganados con 1er saque propio | **15%** | > 65% | < 55% |
| 5 | Break Points convertidos (atacando) | **10%** | > 42% | < 30% |
| 6 | Break Points salvados (defendiendo) | **6%** | > 55% | < 40% |
| 7 | Ratio Aces / Dobles Faltas | **4%** | > 2.0 | < 0.8 |

**Total: 100%**

### 2.2 Cálculo de Puntuación Normalizada

Para cada jugador (A y B):

```
Score(jugador) = Σ [ (valor_métrica / umbral_positivo) × peso ]
```

El jugador con mayor Score es el candidato base al que apoya el modelo.

### 2.3 Diferencial Mínimo para Confianza Alta

| Diferencial de Score | Nivel de Confianza |
|:---------------------|:-------------------|
| > 15 puntos          | Alta (70%–80%)     |
| 8 – 15 puntos        | Media (60%–69%)    |
| < 8 puntos           | Baja (51%–59%)     |

---

## 3. IDENTIFICACIÓN DE "FALSOS FAVORITOS"

Las cuotas sobreestiman frecuentemente a jugadores por ranking o inercia de mercado, ignorando su vulnerabilidad estructural en arcilla.

### 3.1 Condiciones de Falso Favorito (las 3 deben cumplirse simultáneamente)

- La probabilidad implícita de la cuota es **> 78%**.
- El jugador tiene **< 57% de puntos ganados con 1er saque** en sus últimos 4 partidos en arcilla.
- El rival tiene **> 43% de puntos ganados restando el primer servicio** del favorito.

### 3.2 Condición Adicional de Alerta (basta con 1)

- El favorito lleva **> 10 sets jugados** en los últimos 5 días.
- El favorito procede de superficie rápida (indoor/hierba) en las últimas 2 semanas sin transición.
- El favorito tiene **> 6% de dobles faltas** en su media reciente.

**Acción ante Falso Favorito:** Descartar apuesta a favor del favorito. Buscar victoria directa del *underdog* o hándicap de juegos si el diferencial de cuota ofrece valor esperado positivo.

---

## 4. PERFILES DE MATCHUP Y AJUSTES

La interacción entre estilos altera las estadísticas base. Aplicar los siguientes ajustes **sobre el Score calculado** del jugador favorecido por el matchup:

| Matchup | Ventaja Estructural | Ajuste de Score |
|:--------|:--------------------|:----------------|
| Grinder vs. Big Server | Grinder | +8 pts si su resto sobre 2do saque > 55% |
| Grinder vs. Grinder | El que tiene menor tasa de ENF | +5 pts al más consistente |
| Táctico vs. Power | Táctico | +6 pts si su 2do saque propio > 54% |
| Agresivo de Línea vs. Defensor | Defensor | +4 pts en tierra batida lenta (condiciones pesadas) |
| Ambos Big Servers | El mejor restador | +7 pts al que supera el 42% en resto de 1er saque |

---

## 5. AJUSTES CONTEXTUALES (Modificadores Externos)

Aplicar **antes de emitir la probabilidad final**, sobre el Score del candidato ganador:

| Contexto | Ajuste |
|:---------|:-------|
| Candidato lleva > 3 sets jugados el día anterior | −5 pts |
| Candidato en racha de > 4 victorias consecutivas en arcilla | +4 pts |
| Candidato con lesión confirmada o retirada reciente | −10 pts (forzar revisión manual) |
| Candidato sin jugar en tierra batida en > 3 semanas | −3 pts |
| H2H favorable en arcilla (> 60% de victorias directas) | +3 pts |
| Rival acaba de llegar de otro continente / jet lag | +2 pts al candidato local |
| **[NUEVO V11.0]** Candidato favorecido con 2do saque propio < 38% Y rival > 52% en 2do saque | **−12 pts al favorecido** |
| **[NUEVO V11.0]** Un jugador convierte 100% de BPs (mínimo 3 oportunidades) Y rival salva < 35% de los suyos | **+10 pts al jugador con eficiencia perfecta en BPs** |

> ⚠️ **Nota sobre el modificador de 2do saque colapsado:** Este modificador actúa como veto parcial sobre la predicción inicial. Un candidato favorecido que presenta un 2do saque por debajo del 38% en tierra batida está cediendo sistemáticamente la iniciativa en los puntos más importantes del partido, independientemente de su historial o ranking.

> ⚠️ **Nota sobre el modificador de BPs perfectos:** La eficiencia perfecta en break points (≥ 3 oportunidades) en arcilla refleja dominio táctico real en los momentos decisivos. No es ruido estadístico cuando la muestra mínima se cumple. Aplicar únicamente cuando hay confirmación de al menos 3 BPs jugados.

---

## 6. CHECKLIST DE DECISIÓN (Ejecución Obligatoria en Orden)

Ejecutar en secuencia. Cada paso puede modificar o confirmar la predicción base.

**Paso 1 — Score Base:**
> Calcular Score ponderado de ambos jugadores con estadísticas en tierra batida.

**Paso 2 — Filtro de Falso Favorito:**
> ¿El favorito de mercado cumple las 3 condiciones de la Sección 3.1? → Si sí: reclasificar como Lay.

**Paso 3 — Matchup:**
> Identificar el perfil de enfrentamiento (Sección 4) y aplicar ajuste de Score al jugador favorecido.

**Paso 4 — Guerra de Segundos Saques:**
> Calcular: `(% 2do saque propio) + (% resto 2do saque rival)` para cada jugador. El que obtenga mayor suma tiene ventaja táctica en los puntos clave.
>
> ⚠️ Si cualquiera de los dos jugadores presenta 2do saque propio < 38%, verificar si aplica el modificador de emergencia de la Sección 5.

**Paso 5 — Descarte de Espejismos:**
> ¿Las victorias recientes del favorito de cuota se explican principalmente por aces o porcentaje anormalmente alto de 1er saque? Si la muestra incluye > 3 partidos en pista rápida, descontar peso.

**Paso 6 — Ajustes Contextuales:**
> Aplicar modificadores de la Sección 5 al Score final, incluyendo los nuevos modificadores de emergencia (2do saque colapsado y BPs perfectos).

**Paso 7 — Resolución de Empate:**
> Si el diferencial de Score es < 5 puntos tras todos los ajustes: seleccionar al mejor restador (métrica #1). Si persiste empate: seleccionar al jugador con menor tasa de dobles faltas. Siempre emitir ganador.

---

## 7. CONVERSIÓN DE SCORE A PROBABILIDAD

```
Probabilidad estimada (%) = 50 + (Score_A − Score_B) × 0.35
```

- Mínimo: 51% (siempre hay ganador)
- Máximo aplicable: 85% (sin datos adicionales verificados)
- Si el modelo detecta Falso Favorito: la probabilidad del *underdog* nunca debe ser inferior al 35%

---

## 8. CASOS ESPECIALES Y LÍMITES DEL MODELO

- **Muestra insuficiente (< 3 partidos en arcilla):** Indicar explícitamente. Usar datos mixtos con ponderación reducida (40%). Reducir confianza un nivel.
- **Lesión no confirmada:** Aplicar penalización conservadora de −5 pts y señalar incertidumbre.
- **Primer torneo de la temporada en arcilla:** Descontar 3 pts al jugador con menos partidos acumulados en la superficie ese año.
- **Condiciones extremas (viento fuerte, calor > 35°C):** Favorecer al jugador con mayor % de 2do saque propio (resistencia táctica).
- **[NUEVO V11.0] Mismo jugador en partidos consecutivos:** Si un jugador fue favorecido en la predicción de un partido anterior de la misma tanda con un resultado diferente, no usar ese resultado como señal automática. Cada partido requiere evaluación independiente de sus métricas.

---

## 9. HIPÓTESIS PENDIENTES DE VALIDACIÓN (V11.0)

Las siguientes hipótesis no alcanzan el umbral de evidencia robusta pero deben monitorizarse en la siguiente tanda de partidos:

- **Hipótesis A:** Umbral de alerta roja en 2do saque propio debería bajar a 40% (desde 44%). Validar en ≥ 2 partidos adicionales.
- **Hipótesis B:** Penalización activa −4 pts cuando ratio Aces/DFs < 0.5. Validar en ≥ 2 partidos con este patrón.
- **Hipótesis C:** Resto de 1er saque > 58% como sub-umbral de "confianza garantizada Alta". Validar en ≥ 2 partidos adicionales.
- **Hipótesis D:** El circuito WTA puede requerir modificadores de umbrales propios o reducción de confianza por defecto cuando la muestra en arcilla es < 3 partidos.
- **Hipótesis E:** La zona de confianza "media" (60%-69%) puede estar sobreestimada. Explorar si los parámetros de conversión Score→Probabilidad deben comprimirse en ese rango.
