---
name: build-feature
description: Orchestrator that analyzes a feature request, determines which domains are involved, and spawns an agent team with the right specialists. Use when building any non-trivial feature.
disable-model-invocation: true
argument-hint: [feature description]
---

# Build Feature Orchestrator

You are the **Team Lead** for building features on Horecagrond. When invoked, you analyze the feature request and spawn the right team.

## Step 1: Analyze the Feature

For the requested feature: **$ARGUMENTS**

Determine which domains are involved by checking these criteria:

### Frontend needed?
- New UI components or pages
- Layout changes, styling updates
- Client-side interactivity (forms, modals, drag-drop)
- Map views, charts, data visualization

### Backend needed?
- New server actions or API routes
- Database queries (CRUD operations)
- Authentication/authorization changes
- Input validation (Zod schemas)

### Database needed?
- New tables or fields in Prisma schema
- Relations between models
- Migrations required

### AI/Processing needed?
- LLM integration (chatbot, text generation)
- Image processing (fal.ai)
- Video generation
- Background jobs (Trigger.dev)

### Auth needed?
- Role-based access changes
- New permissions or workspace features
- Session/token changes

## Step 2: Spawn the Team

Based on your analysis, create an agent team and spawn ONLY the teammates that are needed:

### Available Specialists

| Agent | When to spawn | Model |
|-------|--------------|-------|
| `frontend-dev` | Any UI/component/page work | Opus |
| `backend-dev` | Server actions, API routes, DB queries | Opus |
| `ai-engineer` | AI features, image processing, background jobs | Opus |
| `qa-reviewer` | After implementation, for code review | Sonnet |

### Spawn Rules
1. **Minimum team**: Only spawn agents for domains that are actually needed
2. **Always include QA**: Spawn `qa-reviewer` for any feature with >2 files changed
3. **Dependencies matter**: If frontend needs new API data, spawn backend first and set task dependencies
4. **Single domain**: If feature is purely frontend, only spawn `frontend-dev` (+ QA)

## Step 3: Create Tasks

Break the feature into tasks and assign to the right teammate:

1. Create the team with `TeamCreate`
2. Create tasks with `TaskCreate` — include clear descriptions with:
   - What to build
   - Which files to create/modify
   - Acceptance criteria
   - Dependencies on other tasks
3. Assign tasks to teammates
4. Set up dependencies (e.g., backend task blocks frontend task)

## Step 4: Coordinate

- Monitor task progress
- Resolve blockers between teammates
- When all implementation tasks are done, assign QA review
- After QA passes, verify build: `bun run build`
- Report results to user

## Example: "Add inpainting to image editor"

Analysis:
- ✅ Frontend (mask editor UI, version dialog)
- ✅ Backend (server actions for inpaint, image versions)
- ✅ AI/Processing (fal.ai inpaint job, Trigger.dev task)
- ✅ Database (image version fields in schema)
- ✅ QA review

Team:
1. Spawn `backend-dev` → Task: "Add image versioning to Prisma schema + server actions"
2. Spawn `ai-engineer` → Task: "Create inpaint Trigger.dev job with fal.ai" (blocked by backend)
3. Spawn `frontend-dev` → Task: "Build mask editor + version dialog UI" (blocked by backend)
4. Spawn `qa-reviewer` → Task: "Review all changes" (blocked by all above)

## Example: "Fix styling on property card"

Analysis:
- ✅ Frontend only (CSS/component change)
- ❌ No backend, DB, AI needed

Team:
1. Spawn `frontend-dev` → Task: "Fix property card styling"
2. Spawn `qa-reviewer` → Task: "Review styling changes"

## Decision Matrix

| Feature involves... | Spawn |
|---|---|
| Only UI/styling | frontend-dev + qa-reviewer |
| Only data/API | backend-dev + qa-reviewer |
| Only AI/processing | ai-engineer + qa-reviewer |
| UI + data | frontend-dev + backend-dev + qa-reviewer |
| UI + AI | frontend-dev + ai-engineer + qa-reviewer |
| Full stack + AI | all 4 agents |
| Database schema change | backend-dev first (others wait) + qa-reviewer |
