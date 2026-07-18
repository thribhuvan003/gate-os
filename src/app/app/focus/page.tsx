import { FocusClient } from "@/components/os/focus-client";

const subjects = ["Engineering Mathematics", "Digital Logic", "COA", "Programming & Data Structures", "Algorithms", "Theory of Computation", "Compiler Design", "Operating Systems", "Databases", "Computer Networks"];

export default function FocusPage() {
  return <FocusClient subjects={subjects} />;
}
