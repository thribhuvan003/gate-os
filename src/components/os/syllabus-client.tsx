"use client";

import { useState } from "react";
import { SyllabusBoard, type SyllabusSubject } from "@/components/workspace";
import { GATE_CS_IT_2026_BASELINE } from "@/lib/catalog";

const catalog = GATE_CS_IT_2026_BASELINE;

const initialSubjects: SyllabusSubject[] = catalog.subjects
  .toSorted((left, right) => left.order - right.order)
  .map((subject) => ({
    id: subject.id,
    title: subject.name,
    shortLabel: subject.shortName,
    description: `${subject.code} · official-source 2026 baseline for the GATE 2027 working catalog`,
    sections: catalog.sections
      .filter((section) => section.subjectId === subject.id)
      .toSorted((left, right) => left.order - right.order)
      .map((section) => ({
        id: section.id,
        title: section.name,
        topics: catalog.topics
          .filter((topic) => topic.sectionId === section.id)
          .toSorted((left, right) => left.order - right.order)
          .map((topic) => ({
            id: topic.id,
            title: topic.officialText === topic.name ? topic.name : `${topic.name} — ${topic.officialText}`,
            complete: false,
            pyqReady: false,
          })),
      })),
  }));

export function SyllabusClient() {
  const [subjects, setSubjects] = useState(initialSubjects);
  return (
    <SyllabusBoard
      subjects={subjects}
      onTopicChange={(topic, next) =>
        setSubjects((current) =>
          current.map((subject) => ({
            ...subject,
            sections: subject.sections.map((section) => ({
              ...section,
              topics: section.topics.map((item) => item.id === topic.id ? { ...item, ...next } : item),
            })),
          })),
        )
      }
    />
  );
}
