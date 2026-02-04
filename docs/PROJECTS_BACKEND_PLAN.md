# Projects Backend Implementation Plan

## FASE 1: ANALYSE HUIDIGE STAAT

### 1.1 Huidige Database Schema (Prisma)

**Bestaande tabellen:**
| Tabel | Beschrijving | Relevant voor Projects? |
|-------|--------------|------------------------|
| `User` | Gebruikers met roles (user/admin) | Ja - Owner, PIC, Support |
| `Session` | Sessies met activeWorkspaceId | Ja - Workspace context |
| `Workspace` | Multi-tenancy container | Ja - Projects horen bij workspace |
| `WorkspaceMember` | User-Workspace relatie met Role | Ja - RBAC voor projects |
| `WorkspaceInvitation` | Uitnodigingen | Nee |
| `ImageProject` | AI image processing | Nee - apart systeem |
| `Image` | AI processed images | Nee - apart systeem |

**Bestaande RBAC Roles (WorkspaceMember):**
```
OWNER   - Volledige toegang
ADMIN   - Beheer toegang
MEMBER  - Standaard toegang
VIEWER  - Alleen lezen
```

### 1.2 Huidige Mock Data Structuur (`lib/data/projects.ts`)

**Project Card View Data:**
```typescript
{
  id: string
  name: string                    // "Fintech Mobile App Redesign"
  taskCount: number               // 4
  progress: number                // 35 (percentage)
  startDate: Date
  endDate: Date
  status: ProjectStatus           // active|planned|backlog|completed|cancelled
  priority: PriorityLevel         // urgent|high|medium|low
  tags: string[]                  // ["frontend", "feature"]
  members: string[]               // ["jason duong"]
  client?: string                 // "Acme Bank"
  typeLabel?: string              // "MVP"
  durationLabel?: string          // "2 weeks"
  tasks: ProjectTask[]
  detail?: ProjectDetail
}
```

**Project Detail Data:**
```typescript
{
  description: string             // Rich text beschrijving
  inScope: string[]               // Wat wel in scope is
  outOfScope: string[]            // Wat niet in scope is
  expectedOutcomes: string[]      // Verwachte resultaten
  keyFeatures: {
    p0: string[]                  // Must-have features
    p1: string[]                  // Should-have features
    p2: string[]                  // Nice-to-have features
  }
  estimate: string                // "1 months"
  dueDate: string                 // "31 dec 2025"
  daysRemaining: number           // 21
  group: string                   // "None"
  label: string                   // "Design"
  pic: { name, avatar }           // Person In Charge
  support: { name, avatar }[]     // Support team members
  quickLinks: ProjectFile[]       // Attached files
  location?: string               // "Australia"
  sprints?: string                // "MVP 2 weeks"
  lastSync?: string               // "Just now"
}
```

**Project Task Data:**
```typescript
{
  id: string
  name: string                    // "Audit existing flows"
  assignee: string                // "JD"
  status: "todo"|"in-progress"|"done"
  startDate: Date
  endDate: Date
}
```

**Project File Data:**
```typescript
{
  id: string
  name: string                    // "Proposal.pdf"
  size: string                    // "13.0 MB"
  type: "pdf"|"zip"|"figma"|"doc"|"image"
}
```

### 1.3 Wizard Data (uit `project-wizard/types.ts`)

**Wizard specifieke velden:**
```typescript
{
  mode: 'quick'|'guided'
  intent: 'delivery'|'experiment'|'internal'
  successType: 'deliverable'|'metric'|'undefined'
  deliverables: { id, title, dueDate }[]
  metrics: { id, name, target }[]
  deadlineType: 'none'|'target'|'fixed'
  deadlineDate?: string
  ownerId?: string
  contributorIds: string[]
  stakeholderIds: string[]
  contributorOwnerships: { accountId, access }[]
  stakeholderOwnerships: { accountId, access }[]
  structure: 'linear'|'milestones'|'multistream'
  addStarterTasks: boolean
}
```

---

## FASE 2: COMPLETE DATA REQUIREMENTS

### 2.1 Alle Project Datapunten (Geconsolideerd)

| Categorie | Veld | Type | Nullable | Beschrijving |
|-----------|------|------|----------|--------------|
| **Basis** | id | cuid | Nee | Primary key |
| | name | string | Nee | Project naam |
| | description | text | Ja | Rich text beschrijving |
| | workspaceId | string | Nee | FK naar Workspace |
| | createdById | string | Nee | FK naar User (creator) |
| **Status** | status | enum | Nee | active/planned/backlog/completed/cancelled |
| | priority | enum | Nee | urgent/high/medium/low |
| | progress | int | Nee | 0-100 percentage |
| **Timing** | startDate | datetime | Ja | Project start |
| | endDate | datetime | Ja | Project deadline |
| | estimate | string | Ja | "1 months", "2 weeks" |
| | deadlineType | enum | Nee | none/target/fixed |
| **Categorisatie** | intent | enum | Ja | delivery/experiment/internal |
| | successType | enum | Nee | deliverable/metric/undefined |
| | structure | enum | Ja | linear/milestones/multistream |
| | typeLabel | string | Ja | "MVP", "Revamp", "Audit" |
| | group | string | Ja | Project groep |
| | label | string | Ja | "Design", "Development" |
| **Client** | clientName | string | Ja | Client naam |
| | location | string | Ja | "Australia" |
| **Meta** | sprints | string | Ja | "MVP 2 weeks" |
| | lastSyncAt | datetime | Ja | Laatste sync timestamp |
| | createdAt | datetime | Nee | Aanmaak datum |
| | updatedAt | datetime | Nee | Laatste update |

### 2.2 Gerelateerde Tabellen

**ProjectMember (Many-to-Many: Project <-> User)**
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | cuid | Primary key |
| projectId | string | FK naar Project |
| userId | string | FK naar User |
| role | enum | owner/pic/contributor/stakeholder/support |
| access | enum | full_access/can_edit/can_view |
| joinedAt | datetime | Wanneer toegevoegd |

**ProjectTask**
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | cuid | Primary key |
| projectId | string | FK naar Project |
| name | string | Taak naam |
| assigneeId | string | FK naar User (nullable) |
| status | enum | todo/in_progress/done |
| startDate | datetime | Start datum |
| endDate | datetime | Eind datum |
| order | int | Sorteervolgorde |

**ProjectDeliverable**
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | cuid | Primary key |
| projectId | string | FK naar Project |
| title | string | Deliverable titel |
| dueDate | datetime | Deadline |
| completed | boolean | Afgerond? |
| order | int | Sorteervolgorde |

**ProjectMetric**
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | cuid | Primary key |
| projectId | string | FK naar Project |
| name | string | Metric naam |
| target | string | Target waarde |
| current | string | Huidige waarde |

**ProjectScope**
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | cuid | Primary key |
| projectId | string | FK naar Project |
| type | enum | in_scope/out_of_scope/outcome |
| content | string | Scope item tekst |
| order | int | Sorteervolgorde |

**ProjectFeature**
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | cuid | Primary key |
| projectId | string | FK naar Project |
| priority | enum | p0/p1/p2 |
| content | string | Feature beschrijving |
| order | int | Sorteervolgorde |

**ProjectFile**
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | cuid | Primary key |
| projectId | string | FK naar Project |
| name | string | Bestandsnaam |
| url | string | Storage URL |
| size | int | Bestandsgrootte (bytes) |
| type | enum | pdf/zip/figma/doc/image/other |
| uploadedById | string | FK naar User |
| uploadedAt | datetime | Upload datum |

**ProjectTag (Many-to-Many)**
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | cuid | Primary key |
| projectId | string | FK naar Project |
| tagId | string | FK naar Tag |

**Tag**
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | cuid | Primary key |
| workspaceId | string | FK naar Workspace |
| name | string | Tag naam |
| color | string | Hex color |

---

## FASE 3: RBAC & PERMISSIONS

### 3.1 Project-Level Permissions

| Actie | OWNER | ADMIN | MEMBER | VIEWER |
|-------|-------|-------|--------|--------|
| View projects | Yes | Yes | Yes | Yes |
| Create project | Yes | Yes | Yes | No |
| Edit own project | Yes | Yes | Yes | No |
| Edit all projects | Yes | Yes | No | No |
| Delete own project | Yes | Yes | Yes | No |
| Delete all projects | Yes | Yes | No | No |
| Manage members | Yes | Yes | No | No |
| Archive project | Yes | Yes | Yes* | No |

*Alleen eigen projecten

### 3.2 Project Member Roles

| Role | Beschrijving | Permissions |
|------|--------------|-------------|
| owner | Project eigenaar | Alles |
| pic | Person In Charge | Edit, manage tasks |
| contributor | Bijdrager | Edit tasks, add files |
| stakeholder | Stakeholder | View only |
| support | Support team | View, comment |

---

## FASE 4: IMPLEMENTATION CHECKLIST

### Checkpoint 1: Database Schema
- [ ] Maak `Project` model in schema.prisma
- [ ] Maak `ProjectMember` model
- [ ] Maak `ProjectTask` model
- [ ] Maak `ProjectDeliverable` model
- [ ] Maak `ProjectMetric` model
- [ ] Maak `ProjectScope` model
- [ ] Maak `ProjectFeature` model
- [ ] Maak `ProjectFile` model
- [ ] Maak `Tag` en `ProjectTag` models
- [ ] Voeg enums toe (ProjectStatus, Priority, etc.)
- [ ] Run `prisma:generate` en `prisma:push`

**Self-Review:**
- [ ] Alle FK relaties correct?
- [ ] Indexes op veelgebruikte queries?
- [ ] Cascade deletes correct?

### Checkpoint 2: Server Actions
- [ ] `createProject` - Nieuw project aanmaken
- [ ] `updateProject` - Project bijwerken
- [ ] `deleteProject` - Project verwijderen
- [ ] `getProjects` - Lijst projects voor workspace
- [ ] `getProjectById` - Enkel project met details
- [ ] `addProjectMember` - Teamlid toevoegen
- [ ] `removeProjectMember` - Teamlid verwijderen
- [ ] `updateProjectStatus` - Status wijzigen
- [ ] `createProjectTask` - Taak toevoegen
- [ ] `updateProjectTask` - Taak bijwerken
- [ ] `deleteProjectTask` - Taak verwijderen

**Self-Review:**
- [ ] Zod validation op alle inputs?
- [ ] RBAC checks in elke action?
- [ ] Workspace context check?
- [ ] Error handling consistent?

### Checkpoint 3: Frontend Integration
- [ ] Update `projects-content.tsx` om echte data te laden
- [ ] Update `project-cards-view.tsx` voor database data
- [ ] Update project detail page voor database data
- [ ] Connect `ProjectWizard` aan `createProject` action
- [ ] Implement loading states
- [ ] Implement error handling

**Self-Review:**
- [ ] Optimistic updates waar nodig?
- [ ] Loading skeletons aanwezig?
- [ ] Error boundaries?

### Checkpoint 4: Testing
- [ ] Test project creation
- [ ] Test project editing
- [ ] Test project deletion
- [ ] Test RBAC permissions
- [ ] Test workspace isolation
- [ ] Test filters en sorting
- [ ] Build passes

---

## FASE 5: FILES TO CREATE/MODIFY

### New Files:
```
prisma/schema.prisma           # Update met Project models
app/actions/projects.ts        # Server actions
lib/validations/project.ts     # Zod schemas
```

### Files to Modify:
```
components/dashboard/projects-content.tsx
components/dashboard/project-cards-view.tsx
components/dashboard/project-detail-page.tsx
components/project-wizard/ProjectWizard.tsx
lib/data/projects.ts           # Deprecate/remove mock data
```

---

## SAMENVATTING DATA MODEL

```
Workspace (1) ─────────────── (N) Project
                                    │
                                    ├── (N) ProjectMember ── (1) User
                                    ├── (N) ProjectTask
                                    ├── (N) ProjectDeliverable
                                    ├── (N) ProjectMetric
                                    ├── (N) ProjectScope
                                    ├── (N) ProjectFeature
                                    ├── (N) ProjectFile
                                    └── (N) ProjectTag ── (1) Tag
```

**Totaal: 1 hoofdtabel + 8 gerelateerde tabellen + 2 enums**
