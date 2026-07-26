<div align="center">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/shield-halved.svg" width="80" height="80" alt="Shield Icon">
  <h1 align="center">Sujaga (ಸುಜಾಗ)</h1>
  <p align="center">
    <strong>Advanced Crime Intelligence & Analytics Platform for Karnataka State Police</strong>
  </p>
  <p align="center">
    <a href="https://sujaga-ksp-50044365246.development.catalystappsail.in" target="_blank">🌐 Live AppSail Prototype</a> •
    <a href="#quick-start--demo-guide">Quick Demo Guide</a> •
    <a href="#core-features--architecture">Features</a> •
    <a href="#api-reference">API Documentation</a>
  </p>
</div>

---

## 📖 Project Overview & How to Access

**Sujaga** is a zero-leakage, Zoho-native crime intelligence platform designed for the **Karnataka State Police (KSP)**. It unifies fragmented FIRs, suspect rosters, victim records, and case timelines into a single connected graph with an interactive AI assistant (**Zia**).

### 🚀 Live Web Access Links
- **Live Deployed Prototype (Zoho Catalyst AppSail):**  
  👉 **[https://sujaga-ksp-50044365246.development.catalystappsail.in](https://sujaga-ksp-50044365246.development.catalystappsail.in)**
- **Public GitHub Repository:**  
  👉 **[https://github.com/Snarenkumar/Sujaga-zoho.git](https://github.com/Snarenkumar/Sujaga-zoho.git)**

---

## 🎯 Quick Start & Live Demo Guide

When testing the live application on Catalyst AppSail or locally, follow these 3 steps:

### 1️⃣ Data Entry & Live Zoho Sheet API Sync (`/fir/entry`)
- Navigate to **Data Entry** from the navbar.
- Click the **"🏍️ Chain Snatching (Trigger Live Alert)"** preset button to auto-fill the form.
- Click **Submit FIR → Run Live Sync & MO Match**.
- **What Happens:** The record writes live to **Zoho Sheet API v2** and instantly displays a **Red Cross-District Alert** connecting the entry to a 94% matching FIR filed in Mysuru 18 days ago!

### 2️⃣ Zia Assistant, Evidence Trail & PDF Export (`/chat`)
- Navigate to **Zia Chat**.
- Click quick prompts like *"Chain snatching in Mysuru"* or *"Highest risk accused"*.
- Switch language using the **EN / ಕನ್ನಡ** toggle button in the top navigation bar.
- Click **📄 Download as PDF** to generate an official timestamped vector transcript (`sujaga-chat-transcript.pdf`).

### 3️⃣ Supervisor Command Center (`/dashboard`)
- Navigate to **Dashboard**.
- Inspect aggregate KPIs, crime trends, and geospatial 3km hotspot clusters.
- Scroll down to the **Socio-Demographic Crime Correlation** panel comparing crime density against urbanization %, migration index, and unemployment rates.

---

## 🏗 Core Features & Architecture

1. **2-Way Live Zoho Sheet API Sync:** Every FIR registered on `/fir/entry` is automatically appended to a live **Zoho Sheet API** spreadsheet (`Sheet1`) via REST requests.
2. **Semantic MO Fingerprinting:** Detects repeat offenders by analyzing crime descriptions and modus operandi intent—not just literal keywords.
3. **Court-Ready Explainable AI (XAI):** Provides transparent weighted scores (55% MO, 30% GPS Proximity, 15% Time Window) for legal admissibility in court.
4. **Decaying Criminal Graph:** Association links in the `/network` view dynamically adjust thickness and opacity based on the recency of criminal links.
5. **Private Cloud Sovereignty:** Deployed 100% on **Zoho Catalyst AppSail** with zero third-party LLM API calls, keeping all police data inside Zoho's enterprise cloud boundary.

---

## 🔌 API Reference

The application serves data via internal JSON REST endpoints defined in `server.js`:

| Endpoint | Method | Description |
|---|---|---|
| `/api/firs` | GET | Retrieves all live FIR records from Zoho Sheet & session memory |
| `/api/socio-demographic` | GET | Retrieves socio-economic indicator benchmarks per district |
| `/api/accused` | GET | Retrieves known offender roster with risk scores & associates |
| `/api/hotspots` | GET | Dynamically calculates 3km geospatial clusters via Haversine formula |
| `/api/network` | GET | Constructs node & edge structures for `vis-network` graph rendering |
| `/api/evidence/:matchId` | GET | Returns side-by-side FIR evidence comparison and weighted scores |

---

## 🚀 Running Locally

```bash
# 1. Clone repository
git clone https://github.com/Snarenkumar/Sujaga-zoho.git
cd Sujaga-zoho

# 2. Install dependencies
npm install

# 3. Start local development server
npm start
```
Open **`http://localhost:9000`** in your browser!

---

<div align="center">
  <p>⚡ Powered by Zoho Ecosystem (Catalyst, Sheet API v2, Directory Audit) · KSP Intelligence Prototype</p>
</div>
