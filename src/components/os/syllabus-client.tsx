"use client";

import { useState } from "react";
import { SyllabusBoard, type SyllabusSubject } from "@/components/workspace";

const initialSubjects: SyllabusSubject[] = [
  { id: "math", title: "Engineering Mathematics", shortLabel: "Mathematics", sections: [{ id: "discrete", title: "Discrete Mathematics", topics: ["Propositional and first-order logic", "Sets, relations and functions", "Partial orders and lattices", "Groups", "Graphs", "Combinatorics", "Recurrence relations", "Generating functions"].map((title, index) => ({ id: `math-${index}`, title, complete: false, pyqReady: false })) }] },
  { id: "dl", title: "Digital Logic", sections: [{ id: "dl-core", title: "Core concepts", topics: ["Boolean algebra", "Combinational circuits", "Sequential circuits", "Minimization", "Number representations and arithmetic"].map((title, index) => ({ id: `dl-${index}`, title, complete: false, pyqReady: false })) }] },
  { id: "coa", title: "Computer Organization and Architecture", shortLabel: "COA", sections: [{ id: "coa-core", title: "Machine organization", topics: ["Machine instructions and addressing modes", "ALU and datapath", "Control unit", "Pipelining and hazards", "Memory hierarchy", "I/O interface"].map((title, index) => ({ id: `coa-${index}`, title, complete: false, pyqReady: false })) }] },
  { id: "pds", title: "Programming and Data Structures", shortLabel: "Programming & DS", sections: [{ id: "pds-core", title: "Programming and structures", topics: ["C programming", "Recursion", "Arrays", "Stacks and queues", "Linked lists", "Trees", "Binary search trees", "Heaps", "Graphs"].map((title, index) => ({ id: `pds-${index}`, title, complete: false, pyqReady: false })) }] },
  { id: "algo", title: "Algorithms", sections: [{ id: "algo-core", title: "Design and analysis", topics: ["Asymptotic analysis", "Searching and sorting", "Hashing", "Divide and conquer", "Greedy methods", "Dynamic programming", "Graph traversals", "Minimum spanning trees", "Shortest paths"].map((title, index) => ({ id: `algo-${index}`, title, complete: false, pyqReady: false })) }] },
  { id: "toc", title: "Theory of Computation", sections: [{ id: "toc-core", title: "Languages and machines", topics: ["Regular expressions", "Finite automata", "Context-free grammars", "Push-down automata", "Regular and context-free language properties", "Turing machines", "Undecidability"].map((title, index) => ({ id: `toc-${index}`, title, complete: false, pyqReady: false })) }] },
  { id: "compiler", title: "Compiler Design", sections: [{ id: "compiler-core", title: "Compiler pipeline", topics: ["Lexical analysis", "Parsing", "Syntax-directed translation", "Runtime environments", "Intermediate code generation", "Local optimization", "Data-flow analysis"].map((title, index) => ({ id: `compiler-${index}`, title, complete: false, pyqReady: false })) }] },
  { id: "os", title: "Operating Systems", sections: [{ id: "os-core", title: "Processes and resources", topics: ["System calls", "Processes and threads", "Inter-process communication", "Concurrency and synchronization", "Deadlock", "CPU scheduling", "Memory management", "Virtual memory", "File systems"].map((title, index) => ({ id: `os-${index}`, title, complete: false, pyqReady: false })) }] },
  { id: "db", title: "Databases", sections: [{ id: "db-core", title: "Data management", topics: ["ER model", "Relational model", "Relational algebra", "Tuple calculus", "SQL", "Integrity constraints", "Normal forms", "Indexing", "Transactions and concurrency control"].map((title, index) => ({ id: `db-${index}`, title, complete: false, pyqReady: false })) }] },
  { id: "cn", title: "Computer Networks", sections: [{ id: "cn-core", title: "Network stack", topics: ["Layering and protocols", "Switching", "Data link protocols", "Ethernet", "Routing", "IPv4 and CIDR", "ARP, DHCP and ICMP", "TCP and UDP", "Application protocols"].map((title, index) => ({ id: `cn-${index}`, title, complete: false, pyqReady: false })) }] },
];

export function SyllabusClient() {
  const [subjects, setSubjects] = useState(initialSubjects);
  return <SyllabusBoard subjects={subjects} onTopicChange={(topic, next) => setSubjects((current) => current.map((subject) => ({ ...subject, sections: subject.sections.map((section) => ({ ...section, topics: section.topics.map((item) => item.id === topic.id ? { ...item, ...next } : item) })) })))} />;
}

