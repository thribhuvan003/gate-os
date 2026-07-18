import type {
  CatalogSection,
  CatalogTopic,
  CatalogValidationIssue,
  GateCatalog,
} from "@/types";

const STABLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isStableCatalogId(value: string): boolean {
  return STABLE_ID.test(value);
}

export function isCatalogVersionPendingOfficialRelease(catalog: GateCatalog): boolean {
  return catalog.version.status === "baseline-pending-official-release";
}

export function getSectionsForSubject(
  catalog: GateCatalog,
  subjectId: string,
): readonly CatalogSection[] {
  return catalog.sections
    .filter((section) => section.subjectId === subjectId)
    .toSorted((left, right) => left.order - right.order);
}

export function getTopicsForSection(
  catalog: GateCatalog,
  sectionId: string,
): readonly CatalogTopic[] {
  return catalog.topics
    .filter((topic) => topic.sectionId === sectionId)
    .toSorted((left, right) => left.order - right.order);
}

export function getTopicsForSubject(
  catalog: GateCatalog,
  subjectId: string,
): readonly CatalogTopic[] {
  return catalog.topics
    .filter((topic) => topic.subjectId === subjectId)
    .toSorted((left, right) => left.order - right.order);
}

export function findCatalogTopic(
  catalog: GateCatalog,
  topicId: string,
): CatalogTopic | undefined {
  return catalog.topics.find((topic) => topic.id === topicId);
}

function validateStableId(
  issues: CatalogValidationIssue[],
  entity: CatalogValidationIssue["entity"],
  id: string,
): void {
  if (!isStableCatalogId(id)) {
    issues.push({
      code: "invalid-id",
      entity,
      id,
      message: `${entity} id must be lowercase kebab-case.`,
    });
  }
}

function validateUniqueIds(
  issues: CatalogValidationIssue[],
  entity: CatalogValidationIssue["entity"],
  values: readonly { id: string }[],
): void {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value.id)) {
      issues.push({
        code: "duplicate-id",
        entity,
        id: value.id,
        message: `${entity} id is duplicated.`,
      });
    }
    seen.add(value.id);
  }
}

export function validateGateCatalog(catalog: GateCatalog): readonly CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  const entities = [
    ["subject", catalog.subjects],
    ["section", catalog.sections],
    ["topic", catalog.topics],
  ] as const;

  validateStableId(issues, "exam", catalog.exam.id);
  validateStableId(issues, "version", catalog.version.id);

  for (const [entity, values] of entities) {
    validateUniqueIds(issues, entity, values);
    for (const value of values) {
      validateStableId(issues, entity, value.id);
    }
  }

  const subjectIds = new Set(catalog.subjects.map((subject) => subject.id));
  const sectionIds = new Set(catalog.sections.map((section) => section.id));

  for (const subject of catalog.subjects) {
    if (subject.examId !== catalog.exam.id) {
      issues.push({
        code: "orphan-subject",
        entity: "subject",
        id: subject.id,
        message: "Subject must belong to the catalog exam.",
      });
    }
    if (!subject.name.trim() || !subject.shortName.trim() || !subject.code.trim()) {
      issues.push({
        code: "empty-value",
        entity: "subject",
        id: subject.id,
        message: "Subject labels must not be empty.",
      });
    }
  }

  for (const section of catalog.sections) {
    if (!subjectIds.has(section.subjectId)) {
      issues.push({
        code: "orphan-section",
        entity: "section",
        id: section.id,
        message: "Section must belong to a catalog subject.",
      });
    }
    if (section.order < 1 || !Number.isInteger(section.order) || !section.name.trim()) {
      issues.push({
        code: "invalid-order",
        entity: "section",
        id: section.id,
        message: "Section must have a positive integer order and a name.",
      });
    }
  }

  for (const topic of catalog.topics) {
    if (!subjectIds.has(topic.subjectId) || !sectionIds.has(topic.sectionId)) {
      issues.push({
        code: "orphan-section",
        entity: "topic",
        id: topic.id,
        message: "Topic must belong to a catalog subject and section.",
      });
    }
    if (topic.versionId !== catalog.version.id) {
      issues.push({
        code: "wrong-version",
        entity: "topic",
        id: topic.id,
        message: "Topic must belong to the catalog version.",
      });
    }
    if (topic.order < 1 || !Number.isInteger(topic.order) || !topic.name.trim() || !topic.officialText.trim()) {
      issues.push({
        code: "empty-value",
        entity: "topic",
        id: topic.id,
        message: "Topic must have a positive order, name, and official text.",
      });
    }
  }

  return issues;
}

export function assertValidGateCatalog(catalog: GateCatalog): void {
  const issues = validateGateCatalog(catalog);
  if (issues.length > 0) {
    throw new Error(`Invalid GATE catalog: ${issues.map((issue) => issue.message).join(" ")}`);
  }
}
