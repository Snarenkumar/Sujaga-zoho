<div align="center">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/shield-halved.svg" width="80" height="80" alt="Shield Icon">
  <h1 align="center">Sujaga (ಸುಜಾಗ)</h1>
  <p align="center">
    <strong>Advanced Crime Intelligence & Analytics Platform</strong>
  </p>
  <p align="center">
    <a href="#project-overview">Overview</a> •
    <a href="#premium-ui-design">UI Design</a> •
    <a href="#architecture--features">Architecture</a> •
    <a href="#api-reference">API Documentation</a> •
    <a href="#running-the-project">Run</a>
  </p>
</div>

---

## 📖 Project Overview

**Sujaga** is a next-generation crime intelligence prototype designed for modern law enforcement. It serves as a central hub for Data Entry, Investigators, and Supervisors to track incidents, visualize hidden criminal networks, and identify geographic crime hotspots in real-time. 

Built initially as a prototype for the Karnataka Police Hackathon, it has since been overhauled with a highly polished, state-of-the-art interface that looks and functions like top-tier security software.

---

## 🎨 Premium UI Design (Neo-Glassmorphism)

The entire application features a custom-built **Neo-Glassmorphism** dark mode aesthetic. This ensures the application doesn't just work well, but feels like an immersive, high-end intelligence portal.

### Key UI Enhancements:
- **Immersive Landing Portal (`index.ejs`):** A custom-designed hero section featuring glowing background orbs, high-quality FontAwesome SVG icons, and frosted-glass access terminals that animate dynamically on hover.
- **Deep Obsidian Theme:** A meticulously chosen color palette anchored by an obsidian background (`#060913`), neon cyan (`#38BDF8`), and rose (`#F43F5E`) accents.
- **High-Fidelity Data Visualization:**
  - **Chart.js:** Custom gradients, smooth tension splines, and hidden gridlines for sleek, uncluttered data representation.
  - **Leaflet Maps:** Utilizes `CartoDB DarkMatter` tiles paired with glowing, semi-transparent circle markers to give geographic hotspots a covert, radar-like feel.
  - **Network Graphs:** Custom-styled `vis-network` canvas with deep space backgrounds, glowing node borders based on risk levels, and dynamic edge opacity based on the recency of criminal associations.
- **Typography:** Uses the premium **Plus Jakarta Sans** font for optimal legibility and a modern tech feel.

---

## 🏗 Architecture & Features

The platform is built on **Node.js + Express.js** utilizing **EJS** for server-side templating. Data is currently driven by in-memory Mock JSON stores (`/data` directory), simulating a real-time database without needing external dependencies for the demo.

### Core Modules
1. **Data Entry Portal:** Form interfaces designed for officers to quickly log FIRs. The system actively scans incoming text (e.g., Modus Operandi keywords like `chain`, `pulsar`) and instantly triggers cross-district matches.
2. **Investigator Chat (Zia):** A simulated AI assistant interface where investigators can run queries to surface hidden connections and evidence trails.
3. **Supervisor Command Center:** An overarching dashboard displaying aggregate statistics, risk scoreboards, and multi-dimensional charts tracking crime by type and district.

---

## 🔌 API Reference

The application serves data to the frontend widgets via a robust set of internal JSON APIs defined in `server.js`.

### `GET /api/firs`
- **Description:** Retrieves all FIR records.
- **Returns:** An array combining the baseline JSON FIR data with any newly submitted `sessionFirs` from the current runtime session.

### `GET /api/accused`
- **Description:** Retrieves the database of known offenders.
- **Returns:** An array of objects containing suspect profiles, aliases, risk scores, and known associate IDs.

### `GET /api/hotspots`
- **Description:** Dynamically calculates crime clusters using geospatial data.
- **Logic:** Implements the **Haversine formula** to measure distances between all FIR coordinates. If 3 or more incidents occur within a 3km radius, it forms a cluster.
- **Returns:** Array of `cluster` objects, outlining the central latitude/longitude, total incident count, and primary crime type of the area.

### `GET /api/network`
- **Description:** Constructs node and edge structures required by the `vis-network` visualization engine.
- **Logic:** Iterates through accused profiles. Generates edges (links) between suspects if they share a `known_associate_id` OR if they have been booked in the exact same FIR. 
- **Returns:** `{ nodes: [...], edges: [...] }` containing specialized meta-data like `risk_score` and `last_seen_days_ago` which dictates edge thickness and opacity on the frontend.

### `GET /api/evidence/:matchId`
- **Description:** Retrieves the evidence trail comparing two linked FIRs.
- **Returns:** The specific MO match object alongside the full records for `fir1` and `fir2`.

### `GET /api/stats`
- **Description:** Aggregates real-time statistics for the Supervisor dashboard.
- **Returns:** 
  ```json
  {
    "totalFirs": 145,
    "openCases": 32,
    "highRiskOffenders": 12,
    "crossDistrictMatches": 5
  }
  ```
  *(Note: High-risk offenders are defined in the backend as any profile with a `risk_score >= 70`)*

---

## 🚀 Running the Project

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed on your machine.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   node server.js
   ```
   *(Note: For development with auto-reload, use `npm run dev`)*

3. **Access the Application:**
   The application is configured to run on Port `3001`. Open your browser and navigate to:
   **[http://localhost:3001](http://localhost:3001)**

---

<div align="center">
  <p>⚡ Powered by Zoho Ecosystem · KSP Intelligence Prototype</p>
</div>
