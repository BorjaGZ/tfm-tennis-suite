# 🎾 Tennis Suite

**Trabajo Fin de Máster — Máster en Desarrollo con IA E.II**

| | |
|---|---|
| **Autor** | Borja García Zapardiel |
| **Tutor** | Brais Moure |
| **Institución** | BIG School |
| **Máster** | Máster en Desarrollo con IA E.II |
| **Fecha de entrega** | Julio 2026 |

---

## 📋 Descripción del proyecto

Tennis Suite es una aplicación web multi-herramienta desarrollada como Trabajo Fin de Máster, cuyo objetivo es demostrar la utilización de los conocimientos adquiridos durante el Máster en Desarrollo con IA para el desarrollo de una aplicación de software completa y funcional.

La aplicación agrupa un conjunto de mini aplicaciones orientadas al análisis de tenis y apuestas deportivas, permitiendo al usuario gestionar stakes, analizar estadísticas, entrenar modelos predictivos y generar contenido visual para redes sociales.

Todo el desarrollo ha sido realizado con asistencia de Inteligencia Artificial, utilizando Claude (Anthropic) como herramienta principal de desarrollo, lo que constituye el núcleo del enfoque metodológico del TFM.

---

## 🚀 Mini aplicaciones

### 1. 💰 Gestor de Stakes
Calculadora de stakes basada en porcentaje del bankroll con control de límites de recalculo y evolución histórica.

- Introduce tu bankroll disponible y calcula automáticamente los tres niveles de stake
- Stake 1 = 1% del bank · Stake 2 = 2% · Stake 3 = 3% — redondeados a 1 decimal
- Muestra los límites de recalculo: +10% (límite superior) y -10% (límite inferior)
- Comprobador de bank actual: introduce el valor al cierre de jornada y avisa si se ha superado algún límite con opción de recalculo automático
- Barra visual de posición del bank actual entre los dos límites
- **EXPORTAR** — guarda el registro actual en `data/gestor_stakes.xlsx` con fecha, bank y stakes
- **VER HISTORIAL** — muestra la evolución completa del bankroll desde el Excel

### 2. 📊 Super Analizador
Analiza un archivo Excel de estadísticas históricas y genera los rangos óptimos de probabilidad por stake.

- Sube o reemplaza tu archivo `estadisticas.xlsx` desde la propia web
- Busca combinaciones de 3 rangos no solapados (S1, S1.5, S2) que maximicen el beneficio con ≥60% de acierto
- Modo fallback automático si no se alcanzan los objetivos
- Genera una fórmula Excel lista para copiar y pegar

### 3. 🧠 Entrenamiento Modelo
Selecciona los 9 partidos clave para el reentrenamiento del modelo predictivo siguiendo la metodología 3-3-3.

- Lee el archivo `entrenamiento_modelo.xlsx` subido por el usuario
- Selecciona 3 SI de mayor probabilidad, 3 NO de mayor probabilidad y 3 SI de menor probabilidad
- Muestra la selección agrupada y el resto de partidos
- Exporta el resultado en formato TXT listo para usar con el prompt de reentrenamiento

### 4. 🎨 Generador de Tarjetas
Genera tarjetas visuales de partidos para compartir en redes sociales.

- Formulario con los datos del partido (jugadores, torneo, fecha, hora, ganador, probabilidad, cuota)
- Todos los campos son opcionales
- 7 diseños disponibles con selector visual
- Genera la tarjeta en formato PNG 1080×1920 (story 9:16) lista para descargar

### 5. 📈 Calculadora de Value
Determina si una apuesta tiene value y qué stake aplicar.

- Introduce la probabilidad estimada y la cuota de la casa
- Calcula el valor esperado, el edge y la cuota mínima necesaria
- Se integra automáticamente con el Super Analizador para usar los rangos reales del modelo
- Recomienda el stake óptimo según los rangos calculados

### 6. 📰 Últimas Noticias
Noticias del día sobre tenis obtenidas en tiempo real mediante Gemini AI.

- Consulta automática al cargar la página
- Usa Gemini 2.5 Flash con Google Search (Grounding) para obtener noticias reales del día
- Muestra 6 noticias con titular, resumen y categoría (ATP / WTA / Grand Slam / Otro)
- Botón de actualización manual

### 7. 🤖 Analizador de Partido
Predice el ganador de un partido de tenis en tierra batida usando el Modelo Tierra Batida y Gemini 2.5 Flash.

- Sube dos capturas de estadísticas: todas las superficies (referencia secundaria) y tierra batida (fuente primaria)
- Gemini ejecuta el Modelo Tierra Batida aplicando las 7 métricas ponderadas, modificadores contextuales y búsqueda en tiempo real con Google Search
- Devuelve el ganador estimado y la probabilidad con nivel de confianza
- El modelo es intercambiable: basta con sustituir `data/modelo_tierra_batida.md` para actualizar a una nueva versión sin tocar código

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 15** | Framework fullstack (frontend + API Routes) |
| **TypeScript** | Tipado estático |
| **Bootstrap 5** | Sistema de grid y componentes base |
| **CSS personalizado** | Design system propio (variables, componentes) |
| **xlsx** | Lectura y escritura de archivos Excel |
| **html2canvas** | Generación de imágenes PNG desde HTML |
| **Google Fonts** | Tipografías Inter y Space Mono |
| **Gemini 2.5 Flash (Google AI)** | Noticias en tiempo real con Google Search |

---

## 📁 Estructura del proyecto

```
tfm-tennis-suite/
├── app/
│   ├── page.tsx                        # Menú principal
│   ├── layout.tsx                      # Layout global
│   ├── globals.css                     # Design system (variables CSS, componentes)
│   ├── gestor-stakes/
│   │   └── page.tsx                    # Calculadora de distribución de stakes
│   ├── super-analizador/
│   │   └── page.tsx                    # Analizador de estadísticas Excel
│   ├── entrenamiento-modelo/
│   │   └── page.tsx                    # Selección 3-3-3 para reentrenamiento
│   ├── generador-tarjetas/
│   │   └── page.tsx                    # Generador de tarjetas PNG
│   ├── calculadora-value/
│   │   └── page.tsx                    # Calculadora de value bet
│   └── api/
│       ├── super-analizador/
│       │   └── route.ts                # API: análisis Excel y subida de archivo
│       └── entrenamiento-modelo/
│           └── route.ts                # API: selección 3-3-3 y subida de archivo
├── lib/
│   └── tarjetas/
│       └── generator.ts                # Lógica: carga de templates y sustitución de placeholders
├── public/
│   └── tarjetas/                       # Templates HTML de los diseños de tarjetas
│       ├── diseno1/template.html       # Dark Pro
│       ├── diseno2/template.html       # Night Blue
│       ├── diseno3/template.html       # Red Clay
│       ├── diseno4/template.html       # White Wimbledon
│       ├── diseno5/template.html       # Golden Slam
│       ├── diseno6/template.html       # Purple Night
│       └── diseno7/template.html       # Hard Court
└── data/                               # Archivos Excel subidos por el usuario (generado en runtime)
    ├── estadisticas.xlsx
    ├── entrenamiento_modelo.xlsx
    ├── prompt_ejecucion.md             # Prompt fijo de ejecución del modelo
    ├── modelo_tierra_batida.md         # Modelo activo (intercambiable sin tocar código)    
    ├── gestor_stakes.xlsx              # Historial de evolución del bankroll 
```

---

## 🎨 Design System

La aplicación utiliza un design system propio definido en `globals.css`, basado en la estética de las tarjetas de tenis: fondo oscuro, acentos en verde neón (`#4CAF50`) y amarillo lima (`#dfff4f`), tipografía deportiva con Inter y Space Mono.

### Variables principales

```css
--ts-bg-primary:    #0f1419   /* Fondo principal */
--ts-bg-secondary:  #1a1f2e   /* Fondo de cards */
--ts-accent-lime:   #dfff4f   /* Acento lima */
--ts-accent-green:  #4CAF50   /* Acento verde */
--ts-font-mono:     'Space Mono', monospace
```

### Clases reutilizables

| Clase | Descripción |
|---|---|
| `.ts-nav` | Barra de navegación |
| `.ts-card` | Tarjeta de contenido |
| `.ts-btn-primary` | Botón principal (lima) |
| `.ts-btn-secondary` | Botón secundario (outline) |
| `.ts-input` | Campo de texto |
| `.ts-label` | Etiqueta uppercase monospace |
| `.ts-badge` | Badge de categoría |
| `.ts-stat-box` | Caja de estadística |
| `.ts-empty-state` | Estado vacío |
| `.ts-alert-error` | Mensaje de error |

---

## 🗂️ Diseños de tarjetas

Los templates HTML se almacenan en `public/tarjetas/` y utilizan placeholders con la sintaxis `{{CAMPO}}` que son sustituidos en runtime por los valores del formulario.

| ID | Nombre | Estilo |
|---|---|---|
| diseno1 | Dark Pro | Oscuro con degradado marrón y acentos lima |
| diseno2 | Night Blue | Azul marino con acentos cyan |
| diseno3 | Red Clay | Tierra batida, tonos naranja/rojo |
| diseno4 | White Wimbledon | Fondo crema, verde Wimbledon clásico |
| diseno5 | Golden Slam | Negro con acentos dorados |
| diseno6 | Purple Night | Morado oscuro con acentos violeta |
| diseno7 | Hard Court | Azul pista dura con acento rojo, estilo US Open |

### Placeholders disponibles

```
{{JUGADOR1}}      {{JUGADOR2}}      {{TORNEO}}
{{FECHA}}         {{HORA}}          {{GANADOR}}
{{PROBABILIDAD}}  {{CUOTA}}
```

---

## ⚙️ Instalación y ejecución local

### Requisitos previos

- Node.js v18 o superior
- npm v9 o superior
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/tfm-tennis-suite.git
cd tfm-tennis-suite

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Build de producción

```bash
npm run build
npm start
```

---

## 📊 Formato de los archivos Excel

### estadisticas.xlsx

Utilizado por el **Super Analizador** y la **Calculadora de Value**.

| Columna | Tipo | Descripción |
|---|---|---|
| Probabilidad | Decimal (0-1) | Probabilidad estimada del favorito |
| Cuota | Decimal | Cuota de la casa de apuestas |
| Resultado | SI / NO | Si el favorito ganó o no |

### entrenamiento_modelo.xlsx

Utilizado por **Entrenamiento Modelo**.

| Columna | Tipo | Descripción |
|---|---|---|
| Jugador | Texto | Nombre del jugador favorito |
| Probabilidad | Decimal (0-1) | Probabilidad estimada |
| Resultado | SI / NO | Si el favorito ganó o no |
| Circuito | Texto | ATP / WTA / Challenger M / etc. |

---

## 🔌 API Routes

### `GET /api/super-analizador`
Comprueba si existe el Excel en el servidor y ejecuta el análisis.

**Respuesta:**
```json
{
  "existe": true,
  "total": 194,
  "estrategia": {
    "m1":  { "pIni": 0.61, "pFin": 0.63, "total": 21, "pctAcierto": 61.9, "beneficio": 3.50 },
    "m15": { "pIni": 0.65, "pFin": 0.72, "total": 62, "pctAcierto": 67.7, "beneficio": 5.73 },
    "m2":  { "pIni": 0.77, "pFin": 0.80, "total": 21, "pctAcierto": 85.7, "beneficio": 8.82 },
    "beneficioTotal": 18.05,
    "formula": "=IF(AND(...",
    "exito": true
  }
}
```

### `POST /api/super-analizador`
Sube o reemplaza el archivo `estadisticas.xlsx`.

**Body:** `FormData` con campo `file` (archivo xlsx).

### `GET /api/entrenamiento-modelo`
Comprueba si existe el Excel y ejecuta la selección 3-3-3.

**Respuesta:**
```json
{
  "exists": true,
  "total": 26,
  "seleccion": [...],
  "resto": [...],
  "grupos": {
    "topSI": [...],
    "topNO": [...],
    "bottomSI": [...]
  }
}
```

### `POST /api/entrenamiento-modelo`
Sube o reemplaza el archivo `entrenamiento_modelo.xlsx`.

**Body:** `FormData` con campo `file` (archivo xlsx).

### `GET /api/ultimas-noticias`
Consulta Gemini 2.5 Flash con Google Search para obtener las 6 noticias más importantes del tenis del día.

**Respuesta:**
```json
{
  "fecha": "21 de junio de 2026",
  "noticias": [
    {
      "titular": "...",
      "resumen": "...",
      "categoria": "ATP"
    }
  ]
}
```

### `POST /api/analizador-partido`
Recibe dos imágenes de estadísticas, carga el prompt y el modelo desde `data/`, y ejecuta el análisis con Gemini 2.5 Flash.

**Body:** `FormData` con campos `imagen1` e `imagen2` (imágenes PNG/JPG).

**Respuesta:**
```json
{
  "ganador": "Denis Yevseyev",
  "probabilidad": 54
}
```

### `GET /api/gestor-stakes`
Lee el historial completo de registros desde `data/gestor_stakes.xlsx`.

### `POST /api/gestor-stakes`
Añade una nueva fila al historial con fecha actual, bank y stakes calculados.

---

## 🤖 Metodología de desarrollo con IA

Este TFM tiene como eje central el uso de la Inteligencia Artificial como herramienta de desarrollo. El proceso seguido ha sido:

1. **Definición del proyecto** — Análisis de requisitos y decisiones de arquitectura asistidas por IA
2. **Selección del stack** — Next.js + TypeScript + Bootstrap recomendado y justificado por IA
3. **Desarrollo iterativo** — Cada componente, página y API Route generado con asistencia de Claude
4. **Conversión de apps Python** — Las mini apps existentes en Python fueron convertidas a TypeScript por IA
5. **Design system** — Estética y variables CSS definidas con asistencia de IA
6. **Revisión y ajuste** — El desarrollador supervisó, probó y validó cada pieza generada

### Herramientas de IA utilizadas

| Herramienta | Uso |
|---|---|
| **Claude (Anthropic)** | Desarrollo principal: código, arquitectura, documentación |

---

## 📝 Decisiones de arquitectura

### ¿Por qué Next.js?
Next.js permite tener frontend y backend en un único proyecto con las API Routes, eliminando la necesidad de un servidor separado. Su integración nativa con Vercel facilita el despliegue gratuito.

### ¿Por qué sin base de datos?
Los datos de la aplicación se almacenan en archivos Excel que el usuario sube desde la propia web. Esto simplifica la arquitectura y es suficiente para el volumen de datos manejado.

### ¿Por qué Bootstrap + CSS propio?
Bootstrap proporciona el sistema de grid responsive y los utilities base, mientras que el CSS propio define el design system visual sin depender de clases hardcodeadas en los componentes.

### ¿Por qué los templates en /public?
Los templates HTML de las tarjetas necesitan ser accesibles directamente por el navegador (el frontend los descarga para sustituir los placeholders y renderizarlos). Por tanto, `public/` es la ubicación correcta en Next.js.

La lógica de sustitución de placeholders y gestión de diseños se mantiene en `lib/tarjetas/generator.ts`, respetando la separación entre presentación y lógica de negocio.

---

## 👤 Autor

**Borja García Zapardiel**
Máster en Desarrollo con IA E.II — BIG School
Tutor: Brais Moure
Julio 2026
