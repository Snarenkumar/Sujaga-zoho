<div align="center">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/shield-halved.svg" width="80" height="80" alt="Shield Icon">
  <h1 align="center">Sujaga (ಸುಜಾಗ)</h1>
  <p align="center">
    <strong>Advanced Crime Intelligence & Analytics Platform</strong>
  </p>
  <p align="center">
    <a href="#key-features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#demo-flow">Demo Flow</a>
  </p>
</div>

---

Sujaga is a next-generation crime intelligence prototype designed for modern law enforcement. Built with a premium, high-performance UI, it empowers agencies to detect cross-district Modus Operandi (MO) matches, visualize criminal networks, and identify crime hotspots in real-time.

## ✨ Key Features

- **🛡️ Cross-District MO Matching:** Automated text analysis to link similar incidents across different jurisdictions instantly.
- **📊 Premium Analytics Dashboard:** High-quality, interactive charts (powered by Chart.js) visualizing crime trends, district distributions, and risk scores.
- **🗺️ Interactive Hotspot Mapping:** Dark-themed, covert-style mapping (Leaflet + CartoDB) to pinpoint crime clusters and geographic patterns.
- **🕸️ Dynamic Network Graphs:** Physics-based criminal network visualization (vis-network) revealing hidden associations and shared incidents.
- **💬 Proactive AI Assistant:** Integrated chat interface simulating intelligent query responses and proactive alerts.

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, HTML5, Vanilla JS, CSS3 (Neo-Glassmorphism UI)
- **Data Visualization:** Chart.js, Leaflet.js, vis-network
- **Data Layer:** In-memory Mock JSON data (No external DB required for demo)

## 🚀 Quick Start

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the server:**
   ```bash
   npm start
   ```
   *(For development with auto-reload, use `npm run dev`)*

3. **View the app:**
   Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

## 📱 Demo Flow

1. **Role Selection:** Start at the landing page and select a role (Data Entry, Investigator, or Supervisor).
2. **FIR Submission:** Enter an FIR. Using keywords like `chain`, `two-wheeler`, or `pulsar` will trigger a live cross-district MO match.
3. **Investigator Chat:** Interact with the assistant; a proactive alert will appear automatically after ~5 seconds.
4. **Supervisor Command Center:** Review beautiful analytics, risk scoreboards, and cross-district stats.
5. **Geospatial & Network Analysis:** Explore the dark-themed Hotspot Map and the physics-enabled Network Graph for deep insights.

---

<div align="center">
  <p>Built for the Karnataka Police Hackathon • Prototype Phase</p>
</div>
