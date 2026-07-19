import { SyllabusClient } from "@/components/os/syllabus-client";
import type { SyllabusSubject } from "@/components/workspace";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type ExamVersionRow = { id: string; branch_id: string };
type SubjectRow = { id: string; name: string; short_name: string; code: string; position: number };
type SectionRow = { id: string; subject_id: string; name: string; position: number };
type TopicRow = { id: string; section_id: string; name: string; position: number };
type ProgressRow = { topic_id: string; completed_at: string | null; pyq_ready_at: string | null };

export default async function SyllabusPage() {
  const clientResult = await getServerSupabaseClient();
  let examVersionId = "";
  let initialSubjects: SyllabusSubject[] = [];

  if (clientResult.value) {
    const { data: versionData } = await clientResult.value
      .from("exam_versions")
      .select("id,branch_id")
      .eq("year", 2027)
      .maybeSingle();
    const version = versionData as ExamVersionRow | null;

    if (version) {
      examVersionId = version.id;
      const { data: subjectData } = await clientResult.value
        .from("subjects")
        .select("id,name,short_name,code,position")
        .eq("branch_id", version.branch_id)
        .order("position");
      const subjects = (subjectData ?? []) as SubjectRow[];
      const subjectIds = subjects.map((subject) => subject.id);
      const { data: sectionData } = subjectIds.length
        ? await clientResult.value.from("sections").select("id,subject_id,name,position").in("subject_id", subjectIds).order("position")
        : { data: [] };
      const sections = (sectionData ?? []) as SectionRow[];
      const sectionIds = sections.map((section) => section.id);
      const { data: topicData } = sectionIds.length
        ? await clientResult.value.from("topics").select("id,section_id,name,position").in("section_id", sectionIds).order("position")
        : { data: [] };
      const topics = (topicData ?? []) as TopicRow[];
      const { data: progressData } = await clientResult.value
        .from("syllabus_progress")
        .select("topic_id,completed_at,pyq_ready_at")
        .eq("exam_version_id", version.id);
      const progressByTopic = new Map((progressData ?? []).map((progress) => {
        const row = progress as ProgressRow;
        return [row.topic_id, row];
      }));

      initialSubjects = subjects.map((subject) => ({
        id: subject.id,
        title: subject.name,
        shortLabel: subject.short_name || subject.code,
        description: `${subject.code} · versioned GATE 2027 working catalog`,
        sections: sections
          .filter((section) => section.subject_id === subject.id)
          .map((section) => ({
            id: section.id,
            title: section.name,
            topics: topics
              .filter((topic) => topic.section_id === section.id)
              .map((topic) => {
                const progress = progressByTopic.get(topic.id);
                return {
                  id: topic.id,
                  title: topic.name,
                  complete: Boolean(progress?.completed_at),
                  pyqReady: Boolean(progress?.pyq_ready_at),
                };
              }),
          })),
      }));
    }
  }

  return <SyllabusClient examVersionId={examVersionId} initialSubjects={initialSubjects} />;
}
