export type ThemeId =
  | "editorial-calm"
  | "focus-tech"
  | "soft-personal"
  | "midnight-paper";

export type MotionLevel = "full" | "subtle" | "reduced";
export type Density = "comfortable" | "compact";
export type HomeLayoutPreset = "focus" | "balanced" | "revision";

export const WORKSPACE_MODULE_IDS = [
  "home",
  "focus",
  "syllabus",
  "vault",
  "notes",
  "revision",
  "mistakes",
  "goals",
  "reflections",
  "circles",
] as const;

export type WorkspaceModuleId = (typeof WORKSPACE_MODULE_IDS)[number];

export interface WorkspacePreferences {
  themeId: ThemeId;
  fontPairId: string;
  accentId: string;
  motion: MotionLevel;
  density: Density;
  layoutPreset: HomeLayoutPreset;
  moduleOrder: WorkspaceModuleId[];
  hiddenModules: WorkspaceModuleId[];
}

export type PendingMutationOperation = "insert" | "update" | "delete";

export interface PendingMutation {
  id: string;
  userId: string;
  entity: string;
  operation: PendingMutationOperation;
  payload: unknown;
  baseVersion?: number;
  createdAt: string;
}

export type CircleRole = "owner" | "member";
export type CircleSessionStatus = "scheduled" | "active" | "completed" | "cancelled";

export interface StudyWindowDTO {
  startMinute: number;
  endMinute: number;
  daysOfWeek: number[];
}

export interface ProfileDTO {
  userId: string;
  displayName: string;
  timezone: string;
  examCode: "CS";
  targetYear: 2027;
  preferredStudyWindow: StudyWindowDTO;
  onboardingCompletedAt: string | null;
}

export interface OnboardingProfileInput {
  displayName: string;
  timezone: string;
  examCode: "CS";
  targetYear: 2027;
  preferredStudyWindow: StudyWindowDTO;
}

export interface OnboardingWorkspaceInput {
  preferences: WorkspacePreferences;
}

export interface OnboardingStudyInput {
  currentSubjectId: string;
  firstWeeklyCommitment: string;
}

export interface OnboardingDTO {
  profile: OnboardingProfileInput;
  workspace: OnboardingWorkspaceInput;
  study: OnboardingStudyInput;
}

export interface CircleMemberDTO {
  circleId: string;
  userId: string;
  role: CircleRole;
  joinedAt: string;
}

export interface CircleSessionDTO {
  id: string;
  circleId: string;
  ownerId: string;
  goal: string;
  startsAt: string;
  durationMinutes: number;
  status: CircleSessionStatus;
}
