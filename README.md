# RFUT D'OR — Ranked-Choice Awards Platform

> **"THE ROAD TO D'OR — Your vote. Your rankings. Your legacy."**

A prestigious, luxury awards voting platform built for the **RFUT** gaming community. The platform empowers verified Discord community members to rank their Top 10 nominees from a pool of 20–30 candidates using an immutable, cryptographically authenticated single-use code mechanism.

Inspired by the heritage and prestige of the **Ballon d'Or** ceremony, RFUT D'OR features an editorial aesthetic with warm charcoal backgrounds, subtle metallic gold accents, and clean typography.

---

## 🏛 Visual Identity & Design System

The application is built on a refined, minimalist luxury palette:

- **Primary Background**: `#0B0A08`
- **Secondary Background**: `#15130F`
- **Card Background**: `#191710`
- **Primary Gold**: `#D4AF57`
- **Champagne Gold**: `#E8D5A3`
- **Primary Typography**: `#F5F0E6`
- **Secondary Typography**: `#A69D8B`
- **Subtle Borders**: `#383020`

### Typography Hierarchy
- **Headings & Titles**: `Oswald` (Clean uppercase editorial styling)
- **Body & Controls**: `Manrope` / `Inter`
- **Identifiers & Codes**: `JetBrains Mono` / Monospace

---

## 🎮 Key Features

### 1. Voter Experience
- **Ceremony Access Portal**: Minimal luxury landing page with formatted code entry (`RFUT-XXXX-XXXX`) and instant cryptographic verification.
- **Stage 1 — Candidate Shortlist**: Interactive responsive grid of DOR candidates with live counter (`SELECTED: X / 10`), search filters, and profile accolades.
- **Stage 2 — Top 10 Ranking Engine**: Drag-and-drop sortable list powered by `@dnd-kit` with keyboard and touch accessibility controls. Highlights the podium positions (1st in Gold, 2nd in Champagne Gold, 3rd in Bronze Gold).
- **Stage 3 — Confirmation & Sealing**: Dignified irreversible submission notice with explicit acknowledgement.
- **Stage 4 — Official Ballot Receipt**: Confetti celebration and immutable receipt stamp with timestamp. Live standings remain strictly confidential until the official announcement.

### 2. Streamlined Admin Console
- **Minimalist Overview**:
  - **4 Essential Statistics**: Total Eligible Voters, Votes Submitted, Pending Votes, Total Nominees.
  - **Voting Gate Control**: One-click toggle between **OPEN** and **CLOSED** with instant backend enforcement.
  - **Ceremony Confidentiality**: Clearly marks standings as confidential and provides one-click winner announcement.
- **Voters & Codes**:
  - Issue single codes or bulk-generate codes with CSV export.
  - Salted SHA-256 hashes (`codeHash`) stored in MongoDB; zero permanent plaintext code retention.
- **Ballot Inspector**: Complete audit of all sealed ballots and individual Top 10 choices.
- **Nominee Roster**: Manage shortlist candidates, photos, and descriptions with deletion safeguards.
- **Private Results & Tie-Breaking Engine**:
  - Championship podium: 1st (Gold Champion), 2nd (Champagne Gold), 3rd (Bronze Gold).
  - Automated tie-breaker logic:
    $$\text{Total Points} \longrightarrow \text{1st Place Votes} \longrightarrow \text{2nd Place Votes} \longrightarrow \text{3rd Place Votes} \longrightarrow \text{Tied}$$
  - Export final standings as CSV.

---

## 🏆 Points Distribution Table

Each ballot allocates exactly **67 points** distributed across 10 distinct ranks:

| Rank | Placement | Points Awarded |
|:---:|:---|:---:|
| **1st** | First Place (Gold) | **15 pts** |
| **2nd** | Second Place (Champagne Gold) | **12 pts** |
| **3rd** | Third Place (Bronze Gold) | **10 pts** |
| **4th** | Fourth Place | **8 pts** |
| **5th** | Fifth Place | **7 pts** |
| **6th** | Sixth Place | **5 pts** |
| **7th** | Seventh Place | **4 pts** |
| **8th** | Eighth Place | **3 pts** |
| **9th** | Ninth Place | **2 pts** |
| **10th** | Tenth Place | **1 pt** |
| **Total** | **Top 10 Aggregate** | **67 pts** |

---

## 🛠 Technology Stack

### Frontend (`client/`)
- **React 19** + **Vite 6**
- **Tailwind CSS v3** with custom luxury awards tokens
- **Framer Motion** for smooth, subtle transitions
- **@dnd-kit/core** & **@dnd-kit/sortable** for drag-and-drop ranking
- **Lucide React** for icons
- **Axios** with JWT interceptors
- **Sonner** for notifications
- **Canvas-Confetti** for ballot celebration

### Backend (`server/`)
- **Node.js** (ES Modules)
- **Express.js**
- **MongoDB** & **Mongoose 8** (Primary connection + automatic embedded persistent fallback)
- **JSON Web Tokens (JWT)** for role-separated sessions
- **bcryptjs** for admin password hashing
- **Node Crypto Module** for CSPRNG code generation and SHA-256 code hashing
- **Helmet** & **CORS** security headers
- **Express Rate Limit** to prevent brute-force code verification

---

## 🚀 Quick Start Guide

### 1. Install & Seed
```bash
npm run seed
```
This initializes the database with 20 nominees, sample voters across Regular, Staff, and Journo categories, 4 sample ballots, and exports available test codes to `server/seed_codes.csv`.

### 2. Run Locally
Open two terminal windows:
```bash
# Terminal 1 — Backend REST API (Port 5000)
npm run dev:server

# Terminal 2 — Frontend App (Port 5173)
npm run dev:client
```

Access in your browser:
- **Voter Portal**: [http://localhost:5173](http://localhost:5173)
- **Admin Console**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## 🔑 Test Credentials

### Admin Login
- **URL**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Username**: `admin`
- **Password**: `AdminPassword123!`

### Unused Test Codes
Available in [server/seed_codes.csv](file:///c:/Users/hp/Downloads/rfut_dor/server/seed_codes.csv).
Examples:
- `RFUT-3JYF-PUHD` (`CyberPanda#1005` — Regular Member)
- `RFUT-YT5V-9QA2` (`DarkMatter#1006` — Regular Member)
- `RFUT-FGUN-T9Y5` (`SilverBullet#1007` — Regular Member)
- `RFUT-QFBK-F35H` (`CosmicVoyager#1008` — Regular Member)

---

## 🧪 Automated Testing
```bash
npm run test:api
```
23 automated tests verifying cryptographic code validation, candidate privacy, scoring algorithms, and re-voting blocks.
