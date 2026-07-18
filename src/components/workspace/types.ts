import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type WorkspaceView =
  | "home"
  | "focus"
  | "syllabus"
  | "vault"
  | "notes"
  | "revision"
  | "mistakes"
  | "goals"
  | "circles"
  | "settings";

export interface WorkspaceNavigationItem {
  id: WorkspaceView;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail?: string;
}

export interface WorkspaceGoal {
  id: string;
  title: string;
  complete: boolean;
  cadence?: "daily" | "weekly";
  dueLabel?: string;
}

export interface RevisionItem {
  id: string;
  title: string;
  subject: string;
  dueLabel: string;
  completed?: boolean;
  source?: "topic" | "note" | "reflection" | "mistake";
}

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  updatedLabel: string;
  content: string;
  kind?: "daily" | "topic";
}

export interface SyllabusTopic {
  id: string;
  title: string;
  complete: boolean;
  pyqReady?: boolean;
}

export interface SyllabusSection {
  id: string;
  title: string;
  topics: SyllabusTopic[];
}

export interface SyllabusSubject {
  id: string;
  title: string;
  shortLabel?: string;
  description?: string;
  sections: SyllabusSection[];
}

export interface VaultDocument {
  id: string;
  title: string;
  subject: string;
  tags: string[];
  updatedLabel: string;
  page?: number;
  totalPages?: number;
  pinned?: boolean;
}

export interface MistakeItem {
  id: string;
  concept: string;
  subject: string;
  source: string;
  reason: string;
  correction: string;
  nextReviewLabel: string;
}

export interface ReflectionItem {
  id: string;
  title: string;
  content: string;
  createdLabel: string;
  cadence: "hourly" | "daily";
}

export interface CircleMember {
  id: string;
  name: string;
  status?: "studying" | "away" | "offline";
}

export interface StudyCircle {
  id: string;
  name: string;
  goal: string;
  members: CircleMember[];
  activeSession?: {
    title: string;
    endsAt: string;
    reactions?: number;
  };
}

export interface WorkspaceCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}
