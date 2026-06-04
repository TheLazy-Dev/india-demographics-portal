# 🇮🇳 India Demographics Portal (2011 – 2026)

An interactive, high-fidelity data exploration dashboard displaying actual census figures (2011) and official decennial projections (2012 – 2026) for population, gender distributions, literacy rates, and social categories across Indian States and Union Territories.

Built as a single-page application using pure **HTML5**, **Vanilla CSS3**, and modern **ES6+ JavaScript**.

---

## 🌟 Key Features

*   **Interactive Metrics Dashboard**: Instantly views Projected Population, Male/Female counts, and Sex Ratio. Displays color-coded trend indicators (`▲` / `▼`) showing metric progression compared to the 2011 baseline.
*   **Dual Numbering Systems**: Toggle formats dynamically between the **Millions** scale (Western format) and **Lakhs / Crores** (Indian numbering system) with immediate UI recalculations.
*   **Dynamic SVG Trend Graphs**: Features custom line charts representing population growth curve and sex ratio trajectory. Supports debounced hover data points and interactive tooltips.
*   **Debounced Hover Previews**: Hover suggestions in the search autocomplete bar or rows in the data table to instantly preview any region's demographics on the charts and metric cards without changing your permanent selection.
*   **Synchronized Search Autocomplete**: Search for any State or UT with smart keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`) and automatic table row highlighting.
*   **Census Pause & Resume Timeline**: A namespaced, vertical chronology tracing the 2021 Census pause due to COVID-19, boundary extensions, 2-phase resumption decisions, and the roadmap for the first **Digital Census of India in 2027**.
*   **Modern Premium Aesthetic**: Dark-themed layout featuring glassmorphism cards, HSL-tailored colors, smooth animations, fluid typography, and clean micro-interactions.
*   **Fully Mobile Responsive**: Incorporates responsive grids, collapsing multi-columns (e.g. literacy comparison, references grid), compressed padding layouts, and a native `ResizeObserver` engine that redraws SVG graphs immediately on device orientation or viewport size changes.

---

## 📁 Project Structure

```text
india-demographics-portal/
├── index.html        # Dashboard structure, alert notices, timeline & markup
├── styles.css        # Premium typography, color variables, animations & responsive media queries
├── app.js            # Dashboard controller, math formatting, debounced previews & ResizeObserver
├── data.js           # Comprehensive datasets (2011-2026 projections) for all States & UTs
└── README.md         # Document index & user guide
```

---

## 🛠️ Technology Stack

*   **Markup**: Semantic HTML5 structures.
*   **Styles**: Pure Vanilla CSS3 utilizing Custom Properties, CSS transitions, keyframe animations, Flexbox, and CSS Grids. Responsive breakpoints support screens down to `320px` width.
*   **Logic**: Modern Vanilla JavaScript (ES6+), leveraging Event Delegation, dynamic SVGs, debounced callbacks, and `ResizeObserver` API. No heavy frameworks or external chart library dependencies.

---

## 📊 Official Projections & Sources

The data presented is based on official publications and projections:
*   **Projections methodology**: Computed via the *Cohort Component Method* by the **Technical Group on Population Projections** (Ministry of Health and Family Welfare, Govt. of India).
*   **Census Pause References**: Official Press Information Bureau (PIB) announcements by the Ministry of Home Affairs (MHA) and Wikipedia resources.

---

## 🚀 How to Run Locally

Since this dashboard uses modern ES modules for imports:
1. Clone or download this project directory.
2. Open the directory in your terminal.
3. Start a local static file server (for example, using Python or Node.js):
   ```bash
   # Using Python 3
   python3 -m http.server 8080

   # Or using Node.js (npx)
   npx http-server -p 8080
   ```
4. Open your browser and navigate to `http://localhost:8080`.
