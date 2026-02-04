export type ProjectStatus =
  | "active"
  | "planned"
  | "backlog"
  | "completed"
  | "cancelled"

export type PriorityLevel = "urgent" | "high" | "medium" | "low"

export type ProjectTask = {
  id: string
  name: string
  assignee: string
  status: "todo" | "in-progress" | "done"
  startDate: Date
  endDate: Date
}

export type ProjectFile = {
  id: string
  name: string
  size: string
  type: "pdf" | "zip" | "figma" | "doc" | "image"
}

export type ProjectDetail = {
  description: string
  inScope: string[]
  outOfScope: string[]
  expectedOutcomes: string[]
  keyFeatures: {
    p0: string[]
    p1: string[]
    p2: string[]
  }
  estimate: string
  dueDate: string
  daysRemaining: number
  group: string
  label: string
  pic: { name: string; avatar: string }
  support: { name: string; avatar: string }[]
  quickLinks: ProjectFile[]
  location?: string
  sprints?: string
  lastSync?: string
}

export type Project = {
  id: string
  name: string
  taskCount: number
  progress: number
  startDate: Date
  endDate: Date
  status: ProjectStatus
  priority: PriorityLevel
  tags: string[]
  members: string[]
  client?: string
  typeLabel?: string
  durationLabel?: string
  tasks: ProjectTask[]
  detail?: ProjectDetail
}

// Status configuration helper
export function getStatusConfig(status: ProjectStatus) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        dot: "bg-teal-600",
        pill: "text-teal-700 border-teal-200 bg-teal-50"
      }
    case "planned":
      return {
        label: "Planned",
        dot: "bg-zinc-900",
        pill: "text-zinc-900 border-zinc-200 bg-zinc-50"
      }
    case "backlog":
      return {
        label: "Backlog",
        dot: "bg-orange-600",
        pill: "text-orange-700 border-orange-200 bg-orange-50"
      }
    case "completed":
      return {
        label: "Completed",
        dot: "bg-blue-600",
        pill: "text-blue-700 border-blue-200 bg-blue-50"
      }
    case "cancelled":
      return {
        label: "Cancelled",
        dot: "bg-rose-600",
        pill: "text-rose-700 border-rose-200 bg-rose-50"
      }
    default:
      return {
        label: status,
        dot: "bg-zinc-400",
        pill: "text-zinc-700 border-zinc-200 bg-zinc-50"
      }
  }
}

// Fixed reference date for stable demo timeline
const _today = new Date(2024, 0, 23) // 23 Jan 2024
const _base = new Date(_today.getFullYear(), _today.getMonth(), _today.getDate() - 7)
const _d = (offsetDays: number) => new Date(_base.getFullYear(), _base.getMonth(), _base.getDate() + offsetDays)

export const projects: Project[] = [
  {
    id: "1",
    name: "Fintech Mobile App Redesign",
    taskCount: 4,
    progress: 35,
    startDate: _d(3),
    endDate: _d(27),
    status: "active",
    priority: "high",
    tags: ["frontend", "feature"],
    members: ["jason duong"],
    client: "Acme Bank",
    typeLabel: "MVP",
    durationLabel: "2 weeks",
    tasks: [
      { id: "1-1", name: "Audit existing flows", assignee: "JD", status: "done", startDate: _d(3), endDate: _d(10) },
      { id: "1-2", name: "Redesign onboarding & payment", assignee: "JD", status: "in-progress", startDate: _d(7), endDate: _d(12) },
      { id: "1-3", name: "Usability testing", assignee: "HP", status: "todo", startDate: _d(13), endDate: _d(19) },
      { id: "1-4", name: "Iterate based on feedback", assignee: "HP", status: "todo", startDate: _d(20), endDate: _d(27) },
    ],
    detail: {
      description: "The internal project aims to optimize user experience and interface for the PM System Core. The goal is to standardize UX, enhance usability, and create a design content repository for daily publication on social media.",
      inScope: [
        "UX research (existing users, light interviews)",
        "Core flows redesign (Onboarding, Payment, Transaction history)",
        "Design system (starter components)",
        "Usability fixes for critical flows",
      ],
      outOfScope: [
        "New feature ideation",
        "Backend logic changes",
        "Marketing landing pages",
      ],
      expectedOutcomes: [
        "Reduce payment flow steps from 6 → 4",
        "Increase task success rate (usability test) from 70% → 90%",
        "Deliver production-ready UI for MVP build",
        "Enable dev handoff without design clarification loops",
      ],
      keyFeatures: {
        p0: ["Onboarding & KYC flow", "Payment confirmation UX"],
        p1: ["Transaction history & filters", "Error / empty states"],
        p2: ["Visual polish & motion guidelines"],
      },
      estimate: "1 months",
      dueDate: "31 dec 2025",
      daysRemaining: 21,
      group: "None",
      label: "Design",
      pic: { name: "Jason D", avatar: "/avatars/jason.jpg" },
      support: [{ name: "Sarah", avatar: "/avatars/sarah.jpg" }],
      quickLinks: [
        { id: "f1", name: "Proposal.pdf", size: "13.0 MB", type: "pdf" },
        { id: "f2", name: "Wireframe Layout.zip", size: "13.0 MB", type: "zip" },
        { id: "f3", name: "UI Kit.fig", size: "13.0 MB", type: "figma" },
      ],
      location: "Australia",
      sprints: "MVP 2 weeks",
      lastSync: "Just now",
    },
  },
  {
    id: "2",
    name: "Internal PM System",
    taskCount: 6,
    progress: 20,
    startDate: _d(3),
    endDate: _d(24),
    status: "active",
    priority: "medium",
    tags: ["backend"],
    members: ["jason duong"],
    client: "Acme Corp Internal",
    typeLabel: "Improvement",
    durationLabel: "2 weeks",
    tasks: [
      { id: "2-1", name: "Define MVP scope", assignee: "PM", status: "done", startDate: _d(3), endDate: _d(5) },
      { id: "2-2", name: "Database schema", assignee: "BE", status: "in-progress", startDate: _d(6), endDate: _d(10) },
      { id: "2-3", name: "API endpoints", assignee: "BE", status: "todo", startDate: _d(11), endDate: _d(15) },
      { id: "2-4", name: "Roles & permissions", assignee: "BE", status: "todo", startDate: _d(16), endDate: _d(18) },
      { id: "2-5", name: "UI implementation", assignee: "FE", status: "todo", startDate: _d(19), endDate: _d(21) },
      { id: "2-6", name: "QA & rollout", assignee: "QA", status: "todo", startDate: _d(22), endDate: _d(24) },
    ],
  },
  {
    id: "3",
    name: "AI Learning Platform",
    taskCount: 3,
    progress: 40,
    startDate: _d(14),
    endDate: _d(28),
    status: "active",
    priority: "urgent",
    tags: ["feature", "urgent"],
    members: ["jason duong"],
    client: "Acme Learning",
    typeLabel: "Revamp",
    durationLabel: "3 weeks",
    tasks: [
      { id: "3-1", name: "Course outline", assignee: "JD", status: "done", startDate: _d(14), endDate: _d(16) },
      { id: "3-2", name: "Lesson player UI", assignee: "HP", status: "in-progress", startDate: _d(17), endDate: _d(23) },
      { id: "3-3", name: "Payment integration", assignee: "BE", status: "todo", startDate: _d(24), endDate: _d(28) },
    ],
  },
  {
    id: "4",
    name: "Internal CRM System",
    taskCount: 4,
    progress: 0,
    startDate: _d(18),
    endDate: _d(35),
    status: "backlog",
    priority: "low",
    tags: ["bug"],
    members: [],
    client: "Acme Corp Internal",
    typeLabel: "New",
    durationLabel: "—",
    tasks: [
      { id: "4-1", name: "Requirements gathering", assignee: "PM", status: "todo", startDate: _d(18), endDate: _d(21) },
      { id: "4-2", name: "Data model", assignee: "BE", status: "todo", startDate: _d(22), endDate: _d(25) },
      { id: "4-3", name: "Core screens", assignee: "FE", status: "todo", startDate: _d(26), endDate: _d(31) },
      { id: "4-4", name: "QA & UAT", assignee: "QA", status: "todo", startDate: _d(32), endDate: _d(35) },
    ],
  },
  {
    id: "5",
    name: "Ecommerce website",
    taskCount: 5,
    progress: 100,
    startDate: _d(-7),
    endDate: _d(0),
    status: "completed",
    priority: "medium",
    tags: ["frontend"],
    members: ["jason duong"],
    client: "Acme Retail",
    typeLabel: "Audit",
    durationLabel: "1 week",
    tasks: [
      { id: "5-1", name: "IA & sitemap", assignee: "JD", status: "done", startDate: _d(-7), endDate: _d(-5) },
      { id: "5-2", name: "Product listing UI", assignee: "HP", status: "done", startDate: _d(-5), endDate: _d(-3) },
      { id: "5-3", name: "Cart & checkout flow", assignee: "HP", status: "done", startDate: _d(-3), endDate: _d(-1) },
      { id: "5-4", name: "Payment gateway", assignee: "BE", status: "done", startDate: _d(-1), endDate: _d(0) },
      { id: "5-5", name: "Launch checklist", assignee: "QA", status: "done", startDate: _d(-2), endDate: _d(0) },
    ],
  },
  {
    id: "6",
    name: "Marketing Site Refresh",
    taskCount: 3,
    progress: 10,
    startDate: _d(5),
    endDate: _d(18),
    status: "planned",
    priority: "medium",
    tags: ["frontend", "feature"],
    members: ["jason duong"],
    client: "Acme Marketing",
    typeLabel: "Phase 1",
    durationLabel: "2 weeks",
    tasks: [
      { id: "6-1", name: "Landing page layout", assignee: "JD", status: "todo", startDate: _d(5), endDate: _d(9) },
      { id: "6-2", name: "Hero illustrations", assignee: "HP", status: "todo", startDate: _d(10), endDate: _d(14) },
      { id: "6-3", name: "Content QA", assignee: "QA", status: "todo", startDate: _d(15), endDate: _d(18) },
    ],
  },
  {
    id: "7",
    name: "Design System Cleanup",
    taskCount: 4,
    progress: 0,
    startDate: _d(8),
    endDate: _d(20),
    status: "planned",
    priority: "low",
    tags: ["backend"],
    members: ["jason duong"],
    client: "Acme Corp Internal",
    typeLabel: "Refactor",
    durationLabel: "1 week",
    tasks: [
      { id: "7-1", name: "Token audit", assignee: "JD", status: "todo", startDate: _d(8), endDate: _d(10) },
      { id: "7-2", name: "Component inventory", assignee: "JD", status: "todo", startDate: _d(11), endDate: _d(13) },
      { id: "7-3", name: "Deprecation plan", assignee: "PM", status: "todo", startDate: _d(14), endDate: _d(17) },
      { id: "7-4", name: "Docs update", assignee: "JD", status: "todo", startDate: _d(18), endDate: _d(20) },
    ],
  },
  {
    id: "8",
    name: "Onboarding Flow A/B Test",
    taskCount: 3,
    progress: 100,
    startDate: _d(-10),
    endDate: _d(-3),
    status: "completed",
    priority: "high",
    tags: ["feature", "urgent"],
    members: ["jason duong"],
    client: "Acme SaaS",
    typeLabel: "Experiment",
    durationLabel: "1 week",
    tasks: [
      { id: "8-1", name: "Hypothesis & metrics", assignee: "PM", status: "done", startDate: _d(-10), endDate: _d(-8) },
      { id: "8-2", name: "Variant design", assignee: "JD", status: "done", startDate: _d(-8), endDate: _d(-5) },
      { id: "8-3", name: "Analysis & learnings", assignee: "PM", status: "done", startDate: _d(-5), endDate: _d(-3) },
    ],
  },
  {
    id: "9",
    name: "Support Center Revamp",
    taskCount: 4,
    progress: 100,
    startDate: _d(-15),
    endDate: _d(-5),
    status: "completed",
    priority: "medium",
    tags: ["frontend"],
    members: ["jason duong"],
    client: "Acme Helpdesk",
    typeLabel: "Revamp",
    durationLabel: "2 weeks",
    tasks: [
      { id: "9-1", name: "Content IA", assignee: "JD", status: "done", startDate: _d(-15), endDate: _d(-13) },
      { id: "9-2", name: "Search UX", assignee: "JD", status: "done", startDate: _d(-13), endDate: _d(-10) },
      { id: "9-3", name: "Article template", assignee: "HP", status: "done", startDate: _d(-10), endDate: _d(-7) },
      { id: "9-4", name: "Rollout & feedback", assignee: "PM", status: "done", startDate: _d(-7), endDate: _d(-5) },
    ],
  },
  {
    id: "10",
    name: "Billing Dashboard Polish",
    taskCount: 2,
    progress: 100,
    startDate: _d(-6),
    endDate: _d(-1),
    status: "completed",
    priority: "low",
    tags: ["bug"],
    members: ["jason duong"],
    client: "Acme Finance",
    typeLabel: "Polish",
    durationLabel: "3 days",
    tasks: [
      { id: "10-1", name: "Error state review", assignee: "QA", status: "done", startDate: _d(-6), endDate: _d(-4) },
      { id: "10-2", name: "Charts clean-up", assignee: "JD", status: "done", startDate: _d(-3), endDate: _d(-1) },
    ],
  },
]

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

export type FilterCounts = {
  status?: Record<string, number>
  priority?: Record<string, number>
  tags?: Record<string, number>
  members?: Record<string, number>
}

export function computeFilterCounts(list: Project[]): FilterCounts {
  const res: FilterCounts = {
    status: {},
    priority: {},
    tags: {},
    members: {},
  }
  for (const p of list) {
    res.status![p.status] = (res.status![p.status] || 0) + 1
    res.priority![p.priority] = (res.priority![p.priority] || 0) + 1
    for (const t of p.tags) {
      const id = t.toLowerCase()
      res.tags![id] = (res.tags![id] || 0) + 1
    }
    if (p.members.length === 0) {
      res.members!["no-member"] = (res.members!["no-member"] || 0) + 1
    }
    if (p.members.length > 0) {
      res.members!["current"] = (res.members!["current"] || 0) + 1
    }
    if (p.members.some((m) => m.toLowerCase() === "jason duong")) {
      res.members!["jason"] = (res.members!["jason"] || 0) + 1
    }
  }
  return res
}
