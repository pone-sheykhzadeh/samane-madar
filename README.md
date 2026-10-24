# Obsidian Orbit — Project Management SaaS Backend & Frontend

Obsidian Orbit is a tactile dark minimalist project management SaaS application engineered for high-velocity software engineering, design, and product management teams. The backend is architected around **PostgreSQL, Supabase Authentication, and Row Level Security (RLS)**.

---

## 🚀 Architecture Overview

1. **Authentication & Session Security**:
   - Supabase GoTrue Auth integration (`email + password`, Google OAuth2, GitHub SSO).
   - Rotating hardware session preservation (`30d` token caching).
   - Automatic user profile provisioning via database trigger `handle_new_user()`.

2. **Database & Row Level Security (RLS)**:
   - Full PostgreSQL relational schema located in `supabase/schema.sql`.
   - 14 strict Row Level Security policies enforcing workspace multi-tenancy and personal data isolation:
     - `profiles`: Readable by workspace members, editable only by profile owner (`auth.uid() = id`).
     - `workspaces`: Accessible only to verified members (`is_workspace_member(workspace_id)`).
     - `projects` & `tasks`: Scoped strictly to the member's current workspace.
     - `personal_notes`: Strictly private to note creator (`user_id = auth.uid()`).
     - `messages` & `channels`: Scoped to channel and workspace participants.
     - `notifications`: Private to recipient (`user_id = auth.uid()`).

3. **Core Features**:
   - **Sprint Kanban & Tasks**: 3-column sprint board matching design (`To Do & In Progress`, `In Review & QA`, `Completed`). Advance statuses, manage priorities, tags, assignees, and due dates.
   - **Dashboard**: High-density cockpit displaying project status cards (Upcomings, Completed, In progress, Total), Google and Slack project telemetry, interactive checklist, live ticking time tracker stopwatch, and mini-calendar.
   - **Team Messenger**: Real-time channels and direct messaging (John Doe, Charmie, Jason Mandela, Sarah Jenkins, Charlie Chu), unread counters, markdown, attachments, and sync mesh indicator.
   - **Timeline / Gantt Schedule**: June 2024 sprint roadmap with multi-day bars across projects.
   - **Time Management**: Focus session stopwatch with instant logging and project tracking.
   - **Sprint Analytics & Reports**: Live statistics calculated from actual database records (completion percentage, status distribution, workload allocation per member).
   - **Personal Notes**: Private scratchpad with pinning, color accents, and full CRUD.

---

## 🛠️ Supabase Setup & Deployment Guide

### 1. Create a Supabase Project
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**, choose a region, and configure your database password.

### 2. Apply the Database Migration & RLS Policies
Navigate to the **SQL Editor** in your Supabase dashboard and execute the SQL file:
```bash
supabase/schema.sql
```
*(Or use the Supabase CLI if developing locally):*
```bash
supabase db push
# or
supabase migration up
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the following environment variables:
```ini
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

> **Note:** If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not configured, Obsidian Orbit automatically falls back to its built-in in-browser persistence engine with seeded team members and sprint telemetry, so you can test all features immediately without any manual configuration.

---

## 📦 Local Development

Run the development server:
```bash
npm run dev
```

Run TypeScript compilation check:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```
