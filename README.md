<!-- ============================================================
  TODO before publishing:
  1. Replace YOUR-VERCEL-URL (2 places: Live Demo badge + link) with the real deployment URL.
  2. Retake screenshots in docs/screenshots/ after the UI polish (same file names).
============================================================ -->

<div align="center">

<img src="project-loop/assets/loop-logo.png" alt="LOOP — Close the loop on customer feedback" width="15%" />

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_App-EF765F?style=for-the-badge&logo=vercel&logoColor=white)](https://YOUR-VERCEL-URL.vercel.app)
[![AI Docs](https://img.shields.io/badge/AI_Docs-Read-252B2B?style=for-the-badge&logo=readthedocs&logoColor=white)](docs/ai-integration.md)

<br />

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Multi-tenant](https://img.shields.io/badge/architecture-multi--tenant-EF765F?style=flat-square)
![RBAC](https://img.shields.io/badge/access-RBAC_(3_roles)-338F63?style=flat-square)
![Grounded AI](https://img.shields.io/badge/AI-grounded_answers-8E75B2?style=flat-square)
![Status](https://img.shields.io/badge/status-active_development-F5B83D?style=flat-square)

**[✨ Features](#-features)** &nbsp;·&nbsp;
**[🖼️ Screenshots](#️-screenshots)** &nbsp;·&nbsp;
**[🏗️ Architecture](#️-architecture)** &nbsp;·&nbsp;
**[🚀 Quick Start](#-quick-start)** &nbsp;·&nbsp;
**[🔌 API](#-api-reference)** &nbsp;·&nbsp;
**[🛣️ Roadmap](#️-roadmap)**

</div>

---

## 📖 Overview

**LOOP** is a multi-tenant web platform that turns scattered customer feedback into a ranked, evidence-backed list of *what to build, fix, or improve next*.

Support tickets, app-store reviews, NPS comments, sales notes, and community posts pile up faster than any team can read them. LOOP ingests all of it, lets **Google Gemini** read and classify every item, groups similar feedback into **themes**, flags what is **spiking**, and answers plain-English questions that are **grounded in the real feedback** — with the sources cited.

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>🧠 AI that reads for you</h3>
      Every item is tagged with sentiment, a sentiment score, a theme, a category, and a one-line summary — validated with Zod before it is stored.
    </td>
    <td width="33%" valign="top">
      <h3>🏢 Built for teams</h3>
      Isolated workspaces, three roles (Admin · Analyst · Viewer), and a clean REST API where every query is scoped to the caller's workspace.
    </td>
    <td width="33%" valign="top">
      <h3>🎯 Answers you can verify</h3>
      Ask LOOP retrieves the most relevant feedback first, answers only from it, and returns the cited sources so nothing is invented.
    </td>
  </tr>
</table>

---

## ✨ Features

### Core platform

| | Feature | What you get |
|:-:|---|---|
| 🔐 | **Authentication & workspaces** | Sign-up creates a user *and* a workspace (creator becomes **Admin**). Credentials auth with bcrypt-hashed passwords and JWT sessions via Auth.js. |
| 👥 | **Role-based access control** | `ADMIN`, `ANALYST`, `VIEWER` enforced **server-side** — forbidden actions return `403`, not just a hidden button. |
| 🧑‍🤝‍🧑 | **Team management** | Admins add teammates and change roles; the last Admin of a workspace can't be demoted. |
| 📥 | **Feedback ingestion** | Single entry form, **CSV bulk import** (quoted-field safe, imported / failed / unclassified report), and a **simulated channel** that seeds realistic support, app-store, NPS, sales, and community items. |
| 📬 | **Feedback inbox** | Server-side pagination, full-text search, filters (source, sentiment, theme, status, date range), and an inline `NEW → REVIEWED → ACTIONED` workflow. |
| 📊 | **Analytics dashboard** | Stat cards, feedback volume over time, sentiment breakdown, and top customer issues — all driven by live data and the selected date range. |

### AI intelligence

| | Feature | What you get |
|:-:|---|---|
| 🏷️ | **Auto-classification** | On ingest, each item is sent to Gemini with a strict JSON schema → `sentiment`, `sentimentScore (-1…1)`, `summary`, `theme`, `category`. Results are validated and **stored**, never recomputed on page load. |
| 🧩 | **Theme clustering & trends** | Theme names are normalized so variants collapse into one theme; counts, drill-down by theme, and a trends view with **spike detection** (last 7 days vs. the previous 7). |
| 💬 | **Ask LOOP (grounded Q&A)** | Embedding-based retrieval over your workspace's feedback → top-5 sources → an answer instructed to use *only* that context, returned with its sources. |
| 📝 | **Voice-of-Customer reports** | One click generates an executive summary, theme summary, sentiment summary, key quotes, and recommended actions for a chosen period; reports are saved and **exported as a branded PDF**. |
| 🔁 | **Manual re-classify** | `POST /api/feedback/reclassify` re-runs classification and embedding for a single item. |

---

## 🖼️ Screenshots

<table>
  <tr>
    <td width="50%" align="center">
      <img src="project-loop/assets/overview.png" alt="Overview dashboard" /><br />
      <sub><b>Overview</b> — live stats, volume, sentiment & top issues</sub>
    </td>
    <td width="50%" align="center">
      <img src="project-loop/assets/inbox.png" alt="Feedback inbox" /><br />
      <sub><b>Feedback inbox</b> — search, filters, status workflow</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="project-loop/assets/analytics.png" alt="Analytics studio" /><br />
      <sub><b>Analytics</b> — trends and top customer themes</sub>
    </td>
    <td width="50%" align="center">
      <img src="project-loop/assets/ai-insights.png" alt="AI insights with trending themes" /><br />
      <sub><b>AI Insights</b> — summaries, quotes & spiking themes</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="project-loop/assets/ask-loop.png" alt="Ask LOOP grounded Q&A" /><br />
      <sub><b>Ask LOOP</b> — grounded answers with cited sources</sub>
    </td>
    <td width="50%" align="center">
      <img src="project-loop/assets/team.png" alt="Team management" /><br />
      <sub><b>Team</b> — members and role management</sub>
    </td>
  </tr>
</table>

---

## 🏗️ Architecture

LOOP is a classic three-tier app inside one Next.js codebase. The browser only talks to LOOP's own API; the API layer is the **only** thing that touches the database and Gemini, so API keys never leave the server.

```mermaid
flowchart LR
  subgraph Client["🖥️ Browser"]
    UI["Next.js App Router<br/>React 18 dashboard"]
  end

  subgraph Server["⚙️ Next.js Route Handlers"]
    AUTH["Auth.js session<br/>+ RBAC guard"]
    API["REST API<br/>Zod validation"]
    SVC["Service layer<br/>ai · themes · ask-loop"]
  end

  subgraph Data["🗄️ Data"]
    DB[("PostgreSQL<br/>Supabase · Prisma 7")]
  end

  subgraph AI["✨ Google Gemini"]
    LLM["gemini-2.5-flash"]
    EMB["gemini-embedding-001"]
  end

  UI -->|"fetch /api/*"| AUTH --> API --> SVC
  SVC -->|"every query scoped by workspaceId"| DB
  SVC --> LLM
  SVC --> EMB
```

> [!IMPORTANT]
> **Tenant isolation is a hard rule.** Every query that touches feedback, themes, reports, or users is filtered by the authenticated user's `workspaceId`. A member of one company can never read another company's rows — even by guessing an ID in the URL.

### 🧠 How Ask LOOP stays grounded

```mermaid
sequenceDiagram
  autonumber
  actor U as Team member
  participant API as /api/ask-loop
  participant E as Gemini Embeddings
  participant DB as PostgreSQL
  participant G as Gemini 2.5 Flash

  U->>API: "What are users saying about onboarding?"
  API->>E: embed question (RETRIEVAL_QUERY)
  E-->>API: query vector
  API->>DB: load workspace feedback + stored vectors
  DB-->>API: rows scoped by workspaceId
  API->>API: cosine similarity, keep top 5
  API->>G: answer using ONLY this feedback context
  G-->>API: grounded answer
  API-->>U: answer + cited feedback sources
```

| Step | Detail |
|---|---|
| **Classification** | `gemini-2.5-flash` with a JSON response schema → validated with Zod → saved on the feedback row. |
| **Embeddings** | `gemini-embedding-001` (`RETRIEVAL_DOCUMENT` for feedback, `RETRIEVAL_QUERY` for questions), stored as JSON on each feedback item. Missing vectors are filled lazily. |
| **Retrieval** | Cosine similarity over the workspace's vectors, **top 5** items become the answer context. |
| **Grounding** | The prompt instructs the model to answer using only the provided feedback and not to invent facts; sources are returned with the answer. |
| **Reports** | Stats and context are computed in code first, then Gemini writes the narrative; output is schema-validated. |

📄 Deep dive: [`docs/ai-integration.md`](docs/ai-integration.md)

---

## 🧱 Tech Stack

<div align="center">

<img src="https://skillicons.dev/icons?i=nextjs,ts,react,tailwind,prisma,postgres,supabase,vercel,nodejs,github&perline=10" alt="Tech stack icons" />

</div>

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) · React 18 · TypeScript 5 |
| **Styling** | Tailwind CSS 4 + a custom LOOP design system (`loop-dashboard.css`) |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| **Auth** | Auth.js / NextAuth v5 (Credentials, JWT sessions) · bcryptjs |
| **Validation** | Zod 4 on every API boundary and on AI output |
| **AI** | Google Gemini via `@google/genai` — `gemini-2.5-flash`, `gemini-embedding-001` |
| **Charts** | Recharts |
| **PDF export** | pdf-lib |
| **Icons** | lucide-react |
| **Deployment** | Vercel + hosted PostgreSQL |

---

## 🗄️ Data Model

```mermaid
erDiagram
  WORKSPACE ||--o{ WORKSPACE_MEMBER : "has"
  USER ||--o{ WORKSPACE_MEMBER : "belongs to"
  WORKSPACE ||--o{ FEEDBACK : "owns"
  WORKSPACE ||--o{ VOC_REPORT : "owns"
  USER ||--o{ FEEDBACK : "creates"

  WORKSPACE {
    string id PK
    string name
  }
  USER {
    string id PK
    string email UK
    string passwordHash
  }
  WORKSPACE_MEMBER {
    string id PK
    string userId FK
    string workspaceId FK
    enum role "ADMIN | ANALYST | VIEWER"
  }
  FEEDBACK {
    string id PK
    string workspaceId FK
    string content
    enum source "MANUAL | CSV | API | OTHER"
    string sentiment
    float sentimentScore
    string theme
    string category
    string summary
    string status "NEW | REVIEWED | ACTIONED"
    json embedding
    json metadata
  }
  VOC_REPORT {
    string id PK
    string workspaceId FK
    string title
    datetime periodStart
    datetime periodEnd
    string executiveSummary
    json keyQuotes
  }
```

---

## 🔐 Roles & Permissions

| Capability | 👑 Admin | 📊 Analyst | 👀 Viewer |
|---|:-:|:-:|:-:|
| View dashboard, inbox, analytics, AI insights | ✅ | ✅ | ✅ |
| Ask LOOP (grounded Q&A) | ✅ | ✅ | ✅ |
| View team & saved reports / download PDF | ✅ | ✅ | ✅ |
| Create, edit, delete feedback | ✅ | ✅ | ❌ |
| CSV import & simulated channel | ✅ | ✅ | ❌ |
| AI analyze & re-classify | ✅ | ✅ | ❌ |
| Add members & change roles | ✅ | ❌ | ❌ |

> Roles are enforced in the API through a shared `requireWorkspaceUser()` guard that returns `401` (not signed in) or `403` (role not allowed).

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 LTS or newer and **Git**
- A **PostgreSQL** database ([Supabase](https://supabase.com) or [Neon](https://neon.tech) free tier works)
- A **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1 · Clone & install

```bash
git clone https://github.com/HarsheyGolar/project-loop.git
cd project-loop/project-loop
npm install
```

### 2 · Configure environment

Create a `.env` file in the app folder (never commit it):

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"

# Google Gemini (server-side only)
GEMINI_API_KEY="your_gemini_api_key"

# Auth.js secret — generate with: openssl rand -base64 32
AUTH_SECRET="your_long_random_secret"
```

| Variable | Required | Purpose |
|---|:-:|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection used by Prisma |
| `GEMINI_API_KEY` | ✅ | Classification, embeddings, Ask LOOP, reports |
| `AUTH_SECRET` | ✅ | Signs Auth.js sessions |

### 3 · Prepare the database

```bash
npx prisma generate      # generate the Prisma client into app/generated/prisma
npx prisma db push       # apply the schema to your database
npm run seed             # create the demo workspace + 129 feedback items
npm run backfill         # compute embeddings so Ask LOOP can search the seed data
```

### 4 · Run

```bash
npm run dev
```

Open **http://localhost:3000** and sign in with a demo account below.

### 🔑 Demo accounts

The seed script creates a **Demo Company** workspace with one user per role:

| Role | Email | Password |
|---|---|---|
| 👑 Admin | `admin@loopdemo.dev` | `Demo@12345` |
| 📊 Analyst | `analyst@loopdemo.dev` | `Demo@12345` |
| 👀 Viewer | `viewer@loopdemo.dev` | `Demo@12345` |

> The seed data covers 11 themes across five channels over the last 30 days, with a few themes deliberately spiking in the most recent week so **Trending themes** has something to show.
> These credentials are for the demo workspace only — never reuse a real password.

### 🧰 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the project with ESLint |
| `npm run seed` | Seed the demo workspace, users, and feedback (re-runnable) |
| `npm run backfill` | Generate missing feedback embeddings |

---

## 🔌 API Reference

All routes require a signed-in session unless noted. Inputs are validated with Zod.

<details>
<summary><b>Click to expand the endpoint list</b></summary>

<br />

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Create a user and their workspace (creator becomes Admin) |
| `*` | `/api/auth/[...nextauth]` | Public | Auth.js sign-in / sign-out / session handlers |
| `GET` | `/api/feedback` | Any role | Paginated inbox with search, filters, status counts |
| `POST` | `/api/feedback` | Admin, Analyst | Create feedback and classify it with AI |
| `PATCH` | `/api/feedback` | Admin, Analyst | Update content, source, or status |
| `DELETE` | `/api/feedback` | Admin, Analyst | Delete a feedback item |
| `POST` | `/api/feedback/import` | Admin, Analyst | Bulk CSV import with AI classification |
| `POST` | `/api/feedback/simulate` | Admin, Analyst | Seed realistic items from a simulated channel |
| `POST` | `/api/feedback/reclassify` | Admin, Analyst | Re-run classification for one item |
| `POST` | `/api/ai/analyze` | Admin, Analyst | Stateless AI analysis of a feedback string |
| `GET` | `/api/dashboard/analytics` | Any role | Stats, volume, sentiment, and top issues for a period |
| `GET` | `/api/themes` | Any role | Theme counts and drill-down |
| `GET` | `/api/themes/trends` | Any role | Daily trends, theme trends, and spike detection |
| `POST` | `/api/ask-loop` | Any role | Grounded Q&A with cited sources |
| `GET` | `/api/reports` | Any role | List saved Voice-of-Customer reports |
| `POST` | `/api/reports` | Signed-in | Generate and save a report for a period |
| `GET` | `/api/reports/[id]/pdf` | Any role | Download a report as a branded PDF |
| `GET` | `/api/team` | Any role | List workspace members |
| `POST` | `/api/team` | Admin | Add a member with a role |
| `PATCH` | `/api/team` | Admin | Change a member's role |

**Status codes:** `400` invalid input · `401` not signed in · `403` role not allowed · `404` not found · `500` server error.

</details>

---

## 🗂️ Project Structure

<details>
<summary><b>Click to expand</b></summary>

```text
project-loop/
├── app/
│   ├── api/
│   │   ├── ai/analyze/             # Stateless Gemini classification
│   │   ├── ask-loop/               # Grounded Q&A (retrieve → answer)
│   │   ├── auth/                   # Auth.js handlers + signup
│   │   ├── dashboard/analytics/    # Stats, volume, sentiment, top issues
│   │   ├── feedback/               # CRUD · import · simulate · reclassify
│   │   ├── reports/                # VoC reports + [id]/pdf export
│   │   ├── team/                   # Members and roles
│   │   └── themes/                 # Theme counts · trends · spikes
│   ├── auth/                       # Login and signup pages
│   ├── dashboard/                  # LoopDashboard: Overview, Feedback, Analytics,
│   │                               #   AI Insights, Ask LOOP, Reports, Team, Settings
│   ├── globals.css
│   └── loop-dashboard.css          # LOOP design system
├── lib/
│   ├── ai.ts                       # Gemini: classify, embed, answer, report
│   ├── ask-loop.ts                 # Retrieval + cosine similarity
│   ├── feedback-ai.ts              # Classify-and-store helper
│   ├── themes.ts                   # Theme normalization, trends, spikes
│   ├── dashboard.ts                # Dashboard statistics
│   ├── rbac.ts                     # requireWorkspaceUser() role guard
│   ├── current-user.ts             # Session → user + workspace + role
│   └── db.ts                       # Prisma client (pg driver adapter)
├── prisma/
│   ├── schema.prisma               # Data model
│   └── seed.ts                     # Demo workspace, users, 129 feedback items
├── scripts/
│   └── backfill-embeddings.ts      # Fill missing embeddings
├── docs/
│   ├── ai-integration.md           # AI module deep dive
│   ├── assets/                     # Logo and banner
│   └── screenshots/                # README screenshots
├── auth.ts                         # Auth.js configuration
└── prisma.config.ts                # Prisma CLI configuration
```

</details>

---

## 🚢 Deployment (Vercel)

1. Push the repository to GitHub and **import it in Vercel**.
2. Set the **Root Directory** to `project-loop` (the app folder).
3. Add the environment variables: `DATABASE_URL`, `GEMINI_API_KEY`, `AUTH_SECRET`.
4. Because the Prisma client is generated (not committed), set the **Build Command** to:

   ```bash
   npx prisma generate && next build
   ```

5. Deploy, then run `npm run seed` and `npm run backfill` once against the production database to load the demo workspace.

> **Note:** CSV import and report generation call the AI provider and set `maxDuration`, so very large files are capped (50 rows per import) to stay within serverless time limits.

---

## 🛣️ Roadmap

- [x] Multi-tenant workspaces, Admin / Analyst / Viewer roles, team management
- [x] Single-entry, CSV, and simulated-channel ingestion
- [x] Inbox with server-side pagination, search, filters, and status workflow
- [x] Analytics dashboard with live charts and stat cards
- [x] AI classification, embeddings, theme normalization, and spike detection
- [x] Ask LOOP — grounded Q&A with cited sources
- [x] Voice-of-Customer reports with PDF export
- [ ] One-click **re-classify** button in the inbox UI (API is ready)
- [ ] Persist **workspace settings** (name, weekly digest)
- [ ] Middleware-based route protection for all app pages
- [ ] Canonical theme table so AI themes are merged at ingest
- [ ] Automated tests for the API layer
- [ ] Email invitations for new teammates
- [ ] Saved inbox views and sentiment-spike alerts

---

## 🙌 Acknowledgements

Built as an internship project for **Zidio Development**. Thanks to the teams behind [Next.js](https://nextjs.org), [Prisma](https://www.prisma.io), [Auth.js](https://authjs.dev), [Supabase](https://supabase.com), [Recharts](https://recharts.org), [Zod](https://zod.dev), and [Google Gemini](https://ai.google.dev).

---

---

## 👥 Meet the Team

<div align="center">

<table>
  <tr>
    <td align="center" width="33%">
      <a href="https://github.com/HarsheyGolar">
        <img src="https://github.com/HarsheyGolar.png" width="100px;" alt="Harshey Golar" style="border-radius:50%;" />
        <br />
        <sub><b>Harshey Golar</b></sub>
      </a>
      <br />
      <a href="https://github.com/HarsheyGolar" title="GitHub">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
      <a href="https://www.linkedin.com/in/harshey-golar-231087339/?isSelfProfile=true" title="LinkedIn">
        <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <br />
      <sub>Full-Stack · AI Integration</sub>
    </td>
    <td align="center" width="33%">
      <a href="https://github.com/saireddy-kamujula">
        <img src="https://github.com/saireddy-kamujula.png" width="100px;" alt="Kamjula Achyuth Sai" style="border-radius:50%;" />
        <br />
        <sub><b>Kamjula Achyuth Sai</b></sub>
      </a>
      <br />
      <a href="https://github.com/saireddy-kamujula" title="GitHub">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
      <a href="https://linkedin.com/in/kamjula-achyuth-sai" title="LinkedIn">
        <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <br />
      <sub>Frontend · UI/UX</sub>
    </td>
    <td align="center" width="33%">
      <a href="https://github.com/Gajje-Shiva">
        <img src="https://github.com/Gajje-Shiva.png" width="100px;" alt="Gajje Shiva" style="border-radius:50%;" />
        <br />
        <sub><b>Gajje Shiva</b></sub>
      </a>
      <br />
      <a href="https://github.com/Gajje-Shiva" title="GitHub">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
      <a href="https://linkedin.com/in/gajje-shiva" title="LinkedIn">
        <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <br />
      <sub>Backend · Database</sub>
    </td>
  </tr>
</table>

</div>

---

## ⭐ Support

If you find **Project LOOP** interesting or useful, please consider giving it a ⭐ — it helps others discover the project.

<div align="center">

[![Star this repo](https://img.shields.io/github/stars/HarsheyGolar/project-loop?style=social)](https://github.com/HarsheyGolar/project-loop)
[![Fork this repo](https://img.shields.io/github/forks/HarsheyGolar/project-loop?style=social)](https://github.com/HarsheyGolar/project-loop/fork)
[![Follow HarsheyGolar](https://img.shields.io/github/followers/HarsheyGolar?style=social)](https://github.com/HarsheyGolar)

</div>

---

<div align="center">

**Built with ❤️ by the LOOP Team**

*"Close the loop on customer feedback."*

</div>
