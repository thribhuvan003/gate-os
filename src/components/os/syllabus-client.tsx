"use client";

import { useState } from "react";

import { SyllabusBoard, type SyllabusSubject, type SyllabusTopic } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

type TopicUpdate = { complete: boolean; pyqReady: boolean };

function updateTopic(subjects: SyllabusSubject[], topicId: string, next: TopicUpdate): SyllabusSubject[] {
  return subjects.map((subject) => ({
    ...subject,
    sections: subject.sections.map((section) => ({
      ...section,
      topics: section.topics.map((topic) => topic.id === topicId ? { ...topic, ...next } : topic),
    })),
  }));
}

export function SyllabusClient({ examVersionId, initialSubjects }: { examVersionId: string; initialSubjects: SyllabusSubject[] }) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [message, setMessage] = useState("");

  async function persistTopic(topic: SyllabusTopic, next: TopicUpdate) {
    const previous = { complete: topic.complete, pyqReady: Boolean(topic.pyqReady) };
    setSubjects((current) => updateTopic(current, topic.id, next));
    setMessage("");

    if (!examVersionId) {
      setSubjects((current) => updateTopic(current, topic.id, previous));
      setMessage("The GATE 2027 catalog is not available yet. Refresh after the catalog is configured.");
      return;
    }

    const clientResult = await getBrowserSupabaseClient();

    if (!clientResult.value) {
      setSubjects((current) => updateTopic(current, topic.id, previous));
      setMessage(clientResult.error);
      return;
    }

    const { data: authData } = await clientResult.value.auth.getUser();

    if (!authData.user) {
      setSubjects((current) => updateTopic(current, topic.id, previous));
      setMessage("Your session expired. Sign in again before updating your syllabus.");
      return;
    }

    const now = new Date().toISOString();
    const { error } = await clientResult.value.from("syllabus_progress").upsert({
      user_id: authData.user.id,
      exam_version_id: examVersionId,
      topic_id: topic.id,
      completed_at: next.complete ? now : null,
      pyq_ready_at: next.pyqReady ? now : null,
    }, { onConflict: "user_id,exam_version_id,topic_id" });

    if (error) {
      setSubjects((current) => updateTopic(current, topic.id, previous));
      setMessage("We could not save that change. Your previous progress was kept—please try again.");
    }
  }

  return (
    <>
      <SyllabusBoard subjects={subjects} onTopicChange={persistTopic} />
      {message ? <p className="workspace-page !pt-0 text-sm text-[var(--danger)]" role="status">{message}</p> : null}
    </>
  );
}
