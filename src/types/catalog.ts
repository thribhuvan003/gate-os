export type CatalogExamCode = "CS";

export interface CatalogSource {
  label: string;
  url: string;
  accessedAt: string;
}

export interface CatalogExam {
  id: string;
  code: CatalogExamCode;
  name: string;
  branchName: string;
}

export interface CatalogVersion {
  id: string;
  examId: string;
  baselineYear: number;
  targetYear: number;
  status: "baseline-pending-official-release" | "official" | "superseded";
  label: string;
  source: CatalogSource;
}

export interface CatalogSubject {
  id: string;
  examId: string;
  order: number;
  code: string;
  name: string;
  shortName: string;
}

export interface CatalogSection {
  id: string;
  subjectId: string;
  order: number;
  name: string;
}

export interface CatalogTopic {
  id: string;
  versionId: string;
  subjectId: string;
  sectionId: string;
  order: number;
  name: string;
  officialText: string;
}

export interface GateCatalog {
  exam: CatalogExam;
  version: CatalogVersion;
  subjects: readonly CatalogSubject[];
  sections: readonly CatalogSection[];
  topics: readonly CatalogTopic[];
}

export interface CatalogValidationIssue {
  code:
    | "duplicate-id"
    | "invalid-id"
    | "invalid-order"
    | "orphan-subject"
    | "orphan-section"
    | "wrong-version"
    | "empty-value";
  entity: "exam" | "version" | "subject" | "section" | "topic";
  id: string;
  message: string;
}
