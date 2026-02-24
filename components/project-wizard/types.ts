export type ProjectMode = 'quick' | 'guided'

export interface WizardAccount {
  id: string
  name: string | null
  email: string
  image?: string | null
}

export type ProjectIntent = 'delivery' | 'experiment' | 'internal'

export type SuccessType = 'deliverable' | 'metric' | 'undefined'

export type DeadlineType = 'none' | 'target' | 'fixed'

export type WorkStructure = 'linear' | 'milestones' | 'multistream'

export interface ProjectDeliverable {
  id: string
  title: string
  dueDate?: string
}

export interface ProjectMetric {
  id: string
  name: string
  target?: string
}

export type OwnershipAccessLevel = 'full_access' | 'can_edit' | 'can_view'

export interface OwnershipEntry {
  accountId: string
  access: Exclude<OwnershipAccessLevel, 'full_access'>
}

export interface ProjectData {
  mode?: ProjectMode
  title?: string
  intent?: ProjectIntent
  successType: SuccessType
  deliverables: ProjectDeliverable[]
  metrics?: ProjectMetric[]
  description?: string
  metricName?: string
  metricTarget?: string
  deadlineType: DeadlineType
  deadlineDate?: string
  ownerId?: string
  contributorIds: string[]
  stakeholderIds: string[]
  contributorOwnerships?: OwnershipEntry[]
  stakeholderOwnerships?: OwnershipEntry[]
  structure?: WorkStructure
  addStarterTasks: boolean
  /** Workspace members loaded by StepOwnership — shared with StepReview for name display */
  wizardAccounts?: WizardAccount[]
}
