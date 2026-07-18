import type { CatalogSection, CatalogSubject, CatalogTopic, GateCatalog } from "@/types";

import { assertValidGateCatalog } from "./helpers";

const EXAM_ID = "gate-cs-it";
const VERSION_ID = "gate-cs-it-2026-baseline";
const SOURCE_URL = "https://gate2026.iitg.ac.in/doc/GATE2026_Syllabus/CS_2026_Syllabus.pdf";
const GA_SOURCE_URL = "https://gate2026.iitg.ac.in/doc/GATE2026_Syllabus/GA_2026_Syllabus.pdf";

const subject = (
  id: string,
  order: number,
  code: string,
  name: string,
  shortName: string,
): CatalogSubject => ({ id, examId: EXAM_ID, order, code, name, shortName });

const section = (id: string, subjectId: string, order: number, name: string): CatalogSection => ({
  id,
  subjectId,
  order,
  name,
});

const topic = (
  id: string,
  subjectId: string,
  sectionId: string,
  order: number,
  name: string,
  officialText: string,
): CatalogTopic => ({
  id,
  versionId: VERSION_ID,
  subjectId,
  sectionId,
  order,
  name,
  officialText,
});

const subjects = [
  subject("ga", 1, "GA", "General Aptitude", "GA"),
  subject("engineering-mathematics", 2, "EM", "Engineering Mathematics", "Maths"),
  subject("digital-logic", 3, "DL", "Digital Logic", "DL"),
  subject("computer-organization", 4, "COA", "Computer Organization and Architecture", "COA"),
  subject("programming-data-structures", 5, "PDS", "Programming and Data Structures", "PDS"),
  subject("algorithms", 6, "ALGO", "Algorithms", "Algorithms"),
  subject("theory-of-computation", 7, "TOC", "Theory of Computation", "TOC"),
  subject("compiler-design", 8, "CD", "Compiler Design", "Compiler"),
  subject("operating-systems", 9, "OS", "Operating Systems", "OS"),
  subject("databases", 10, "DBMS", "Databases", "DBMS"),
  subject("computer-networks", 11, "CN", "Computer Networks", "CN"),
] as const;

const sections = [
  section("ga-verbal", "ga", 1, "Verbal Aptitude"),
  section("ga-quantitative", "ga", 2, "Quantitative Aptitude"),
  section("ga-analytical", "ga", 3, "Analytical Aptitude"),
  section("ga-spatial", "ga", 4, "Spatial Aptitude"),
  section("em-discrete-mathematics", "engineering-mathematics", 1, "Discrete Mathematics"),
  section("em-linear-algebra", "engineering-mathematics", 2, "Linear Algebra"),
  section("em-calculus", "engineering-mathematics", 3, "Calculus"),
  section("em-probability-statistics", "engineering-mathematics", 4, "Probability and Statistics"),
  section("digital-logic-core", "digital-logic", 1, "Digital Logic"),
  section("coa-core", "computer-organization", 1, "Computer Organization and Architecture"),
  section("pds-core", "programming-data-structures", 1, "Programming and Data Structures"),
  section("algorithms-core", "algorithms", 1, "Algorithms"),
  section("toc-core", "theory-of-computation", 1, "Theory of Computation"),
  section("compiler-core", "compiler-design", 1, "Compiler Design"),
  section("os-core", "operating-systems", 1, "Operating Systems"),
  section("dbms-core", "databases", 1, "Databases"),
  section("cn-core", "computer-networks", 1, "Computer Networks"),
] as const;

const topics = [
  topic("ga-verbal-grammar", "ga", "ga-verbal", 1, "Basic English grammar", "Basic English grammar: tenses, articles, adjectives, prepositions, conjunctions, verb-noun agreement, and other parts of speech."),
  topic("ga-verbal-vocabulary", "ga", "ga-verbal", 2, "Vocabulary in context", "Basic vocabulary: words, idioms, and phrases in context."),
  topic("ga-verbal-reading-comprehension", "ga", "ga-verbal", 3, "Reading and comprehension", "Reading and comprehension."),
  topic("ga-verbal-narrative-sequencing", "ga", "ga-verbal", 4, "Narrative sequencing", "Narrative sequencing."),
  topic("ga-quantitative-data-interpretation", "ga", "ga-quantitative", 1, "Data interpretation", "Data interpretation: data graphs (bar graphs, pie charts, and other graphs representing data), 2- and 3-dimensional plots, maps, and tables."),
  topic("ga-quantitative-computation-estimation", "ga", "ga-quantitative", 2, "Numerical computation and estimation", "Numerical computation and estimation: ratios, percentages, powers, exponents and logarithms, permutations and combinations, and series."),
  topic("ga-quantitative-mensuration-geometry", "ga", "ga-quantitative", 3, "Mensuration and geometry", "Mensuration and geometry."),
  topic("ga-quantitative-statistics-probability", "ga", "ga-quantitative", 4, "Elementary statistics and probability", "Elementary statistics and probability."),
  topic("ga-analytical-logic", "ga", "ga-analytical", 1, "Logic", "Logic: deduction and induction."),
  topic("ga-analytical-analogy", "ga", "ga-analytical", 2, "Analogy", "Analogy."),
  topic("ga-analytical-numerical-reasoning", "ga", "ga-analytical", 3, "Numerical relations and reasoning", "Numerical relations and reasoning."),
  topic("ga-spatial-transformations", "ga", "ga-spatial", 1, "Transformation of shapes", "Transformation of shapes: translation, rotation, scaling, mirroring, assembling, and grouping."),
  topic("ga-spatial-paper-patterns", "ga", "ga-spatial", 2, "Paper folding, cutting, and patterns", "Paper folding, cutting, and patterns in 2 and 3 dimensions."),

  topic("em-discrete-logic", "engineering-mathematics", "em-discrete-mathematics", 1, "Propositional and first order logic", "Propositional and first order logic."),
  topic("em-discrete-sets-relations-functions", "engineering-mathematics", "em-discrete-mathematics", 2, "Sets, relations, and functions", "Sets, relations, functions."),
  topic("em-discrete-orders-lattices", "engineering-mathematics", "em-discrete-mathematics", 3, "Partial orders and lattices", "Partial orders and lattices."),
  topic("em-discrete-monoids-groups", "engineering-mathematics", "em-discrete-mathematics", 4, "Monoids and groups", "Monoids, Groups."),
  topic("em-discrete-graphs", "engineering-mathematics", "em-discrete-mathematics", 5, "Graphs", "Graphs: connectivity, matching, colouring."),
  topic("em-discrete-counting", "engineering-mathematics", "em-discrete-mathematics", 6, "Counting", "Combinatorics: counting."),
  topic("em-discrete-recurrence-relations", "engineering-mathematics", "em-discrete-mathematics", 7, "Recurrence relations", "Combinatorics: recurrence relations."),
  topic("em-discrete-generating-functions", "engineering-mathematics", "em-discrete-mathematics", 8, "Generating functions", "Combinatorics: generating functions."),
  topic("em-linear-matrices-determinants", "engineering-mathematics", "em-linear-algebra", 1, "Matrices and determinants", "Matrices, determinants."),
  topic("em-linear-equations", "engineering-mathematics", "em-linear-algebra", 2, "System of linear equations", "System of linear equations."),
  topic("em-linear-eigen", "engineering-mathematics", "em-linear-algebra", 3, "Eigenvalues and eigenvectors", "Eigenvalues and eigenvectors."),
  topic("em-linear-lu", "engineering-mathematics", "em-linear-algebra", 4, "LU decomposition", "LU decomposition."),
  topic("em-calculus-limits", "engineering-mathematics", "em-calculus", 1, "Limits", "Limits."),
  topic("em-calculus-continuity-differentiability", "engineering-mathematics", "em-calculus", 2, "Continuity and differentiability", "Continuity and differentiability."),
  topic("em-calculus-extrema", "engineering-mathematics", "em-calculus", 3, "Maxima and minima", "Maxima and minima."),
  topic("em-calculus-mean-value", "engineering-mathematics", "em-calculus", 4, "Mean value theorem", "Mean value theorem."),
  topic("em-calculus-integration", "engineering-mathematics", "em-calculus", 5, "Integration", "Integration."),
  topic("em-probability-random-variables", "engineering-mathematics", "em-probability-statistics", 1, "Random variables", "Random variables."),
  topic("em-probability-distributions", "engineering-mathematics", "em-probability-statistics", 2, "Probability distributions", "Uniform, normal, exponential, Poisson and binomial distributions."),
  topic("em-probability-descriptive-statistics", "engineering-mathematics", "em-probability-statistics", 3, "Descriptive statistics", "Mean, median, mode and standard deviation."),
  topic("em-probability-conditional-bayes", "engineering-mathematics", "em-probability-statistics", 4, "Conditional probability and Bayes theorem", "Conditional probability and Bayes theorem."),

  topic("dl-boolean-algebra", "digital-logic", "digital-logic-core", 1, "Boolean algebra", "Boolean algebra."),
  topic("dl-combinational-circuits", "digital-logic", "digital-logic-core", 2, "Combinational circuits", "Combinational circuits."),
  topic("dl-sequential-circuits", "digital-logic", "digital-logic-core", 3, "Sequential circuits", "Sequential circuits."),
  topic("dl-minimization", "digital-logic", "digital-logic-core", 4, "Minimization", "Minimization."),
  topic("dl-number-representations-arithmetic", "digital-logic", "digital-logic-core", 5, "Number representations and computer arithmetic", "Number representations and computer arithmetic (fixed and floating point)."),

  topic("coa-instructions-addressing", "computer-organization", "coa-core", 1, "Machine instructions and addressing modes", "Machine instructions and addressing modes."),
  topic("coa-alu-datapath-control", "computer-organization", "coa-core", 2, "ALU, data-path and control unit", "ALU, data-path and control unit."),
  topic("coa-pipelining-hazards", "computer-organization", "coa-core", 3, "Instruction pipelining and hazards", "Instruction pipelining, pipeline hazards."),
  topic("coa-memory-hierarchy", "computer-organization", "coa-core", 4, "Memory hierarchy", "Memory hierarchy: cache, main memory and secondary storage."),
  topic("coa-io-interface", "computer-organization", "coa-core", 5, "I/O interface", "I/O interface (interrupt and DMA mode)."),

  topic("pds-c", "programming-data-structures", "pds-core", 1, "Programming in C", "Programming in C."),
  topic("pds-recursion", "programming-data-structures", "pds-core", 2, "Recursion", "Recursion."),
  topic("pds-arrays", "programming-data-structures", "pds-core", 3, "Arrays", "Arrays."),
  topic("pds-stacks", "programming-data-structures", "pds-core", 4, "Stacks", "Stacks."),
  topic("pds-queues", "programming-data-structures", "pds-core", 5, "Queues", "Queues."),
  topic("pds-linked-lists", "programming-data-structures", "pds-core", 6, "Linked lists", "Linked lists."),
  topic("pds-trees", "programming-data-structures", "pds-core", 7, "Trees", "Trees."),
  topic("pds-binary-search-trees", "programming-data-structures", "pds-core", 8, "Binary search trees", "Binary search trees."),
  topic("pds-binary-heaps", "programming-data-structures", "pds-core", 9, "Binary heaps", "Binary heaps."),
  topic("pds-graphs", "programming-data-structures", "pds-core", 10, "Graphs", "Graphs."),

  topic("algo-searching", "algorithms", "algorithms-core", 1, "Searching", "Searching."),
  topic("algo-sorting", "algorithms", "algorithms-core", 2, "Sorting", "Sorting."),
  topic("algo-hashing", "algorithms", "algorithms-core", 3, "Hashing", "Hashing."),
  topic("algo-asymptotic-complexity", "algorithms", "algorithms-core", 4, "Asymptotic complexity", "Asymptotic worst case time and space complexity."),
  topic("algo-greedy", "algorithms", "algorithms-core", 5, "Greedy design", "Algorithm design techniques: greedy."),
  topic("algo-dynamic-programming", "algorithms", "algorithms-core", 6, "Dynamic programming", "Algorithm design techniques: dynamic programming."),
  topic("algo-divide-conquer", "algorithms", "algorithms-core", 7, "Divide and conquer", "Algorithm design techniques: divide-and-conquer."),
  topic("algo-graph-traversals", "algorithms", "algorithms-core", 8, "Graph traversals", "Graph traversals."),
  topic("algo-mst-shortest-paths", "algorithms", "algorithms-core", 9, "Minimum spanning trees and shortest paths", "Minimum spanning trees, shortest paths."),

  topic("toc-regular-expressions", "theory-of-computation", "toc-core", 1, "Regular expressions", "Regular expressions."),
  topic("toc-finite-automata", "theory-of-computation", "toc-core", 2, "Finite automata", "Finite automata."),
  topic("toc-context-free-grammars", "theory-of-computation", "toc-core", 3, "Context-free grammars", "Context-free grammars."),
  topic("toc-pushdown-automata", "theory-of-computation", "toc-core", 4, "Push-down automata", "Push-down automata."),
  topic("toc-regular-languages", "theory-of-computation", "toc-core", 5, "Regular languages", "Regular languages."),
  topic("toc-context-free-languages", "theory-of-computation", "toc-core", 6, "Context-free languages", "Context-free languages."),
  topic("toc-pumping-lemma", "theory-of-computation", "toc-core", 7, "Pumping lemma", "Pumping lemma."),
  topic("toc-turing-undecidability", "theory-of-computation", "toc-core", 8, "Turing machines and undecidability", "Turing machines and undecidability."),

  topic("compiler-lexical-analysis", "compiler-design", "compiler-core", 1, "Lexical analysis", "Lexical analysis."),
  topic("compiler-parsing", "compiler-design", "compiler-core", 2, "Parsing", "Parsing."),
  topic("compiler-syntax-directed-translation", "compiler-design", "compiler-core", 3, "Syntax-directed translation", "Syntax-directed translation."),
  topic("compiler-runtime-environments", "compiler-design", "compiler-core", 4, "Runtime environments", "Runtime environments."),
  topic("compiler-intermediate-code", "compiler-design", "compiler-core", 5, "Intermediate code generation", "Intermediate code generation."),
  topic("compiler-local-optimisation", "compiler-design", "compiler-core", 6, "Local optimisation", "Local optimisation."),
  topic("compiler-constant-propagation", "compiler-design", "compiler-core", 7, "Constant propagation", "Data flow analyses: constant propagation."),
  topic("compiler-liveness-analysis", "compiler-design", "compiler-core", 8, "Liveness analysis", "Data flow analyses: liveness analysis."),
  topic("compiler-common-subexpression-elimination", "compiler-design", "compiler-core", 9, "Common subexpression elimination", "Data flow analyses: common sub expression elimination."),

  topic("os-system-calls", "operating-systems", "os-core", 1, "System calls", "System calls."),
  topic("os-processes", "operating-systems", "os-core", 2, "Processes", "Processes."),
  topic("os-threads", "operating-systems", "os-core", 3, "Threads", "Threads."),
  topic("os-ipc", "operating-systems", "os-core", 4, "Inter-process communication", "Inter-process communication."),
  topic("os-concurrency-synchronization", "operating-systems", "os-core", 5, "Concurrency and synchronization", "Concurrency and synchronization."),
  topic("os-deadlock", "operating-systems", "os-core", 6, "Deadlock", "Deadlock."),
  topic("os-cpu-io-scheduling", "operating-systems", "os-core", 7, "CPU and I/O scheduling", "CPU and I/O scheduling."),
  topic("os-memory-virtual-memory", "operating-systems", "os-core", 8, "Memory management and virtual memory", "Memory management and virtual memory."),
  topic("os-file-systems", "operating-systems", "os-core", 9, "File systems", "File systems."),

  topic("dbms-er-model", "databases", "dbms-core", 1, "ER-model", "ER-model."),
  topic("dbms-relational-algebra", "databases", "dbms-core", 2, "Relational algebra", "Relational model: relational algebra."),
  topic("dbms-tuple-calculus", "databases", "dbms-core", 3, "Tuple calculus", "Relational model: tuple calculus."),
  topic("dbms-sql", "databases", "dbms-core", 4, "SQL", "Relational model: SQL."),
  topic("dbms-integrity-constraints", "databases", "dbms-core", 5, "Integrity constraints", "Integrity constraints."),
  topic("dbms-normal-forms", "databases", "dbms-core", 6, "Normal forms", "Normal forms."),
  topic("dbms-file-organization", "databases", "dbms-core", 7, "File organization", "File organization."),
  topic("dbms-indexing", "databases", "dbms-core", 8, "Indexing", "Indexing (e.g., B and B+ trees)."),
  topic("dbms-transactions-concurrency", "databases", "dbms-core", 9, "Transactions and concurrency control", "Transactions and concurrency control."),

  topic("cn-layering", "computer-networks", "cn-core", 1, "Concept of layering", "Concept of layering: OSI and TCP/IP Protocol Stacks."),
  topic("cn-switching", "computer-networks", "cn-core", 2, "Switching", "Basics of packet, circuit and virtual circuit-switching."),
  topic("cn-framing", "computer-networks", "cn-core", 3, "Framing", "Data link layer: framing."),
  topic("cn-error-detection", "computer-networks", "cn-core", 4, "Error detection", "Data link layer: error detection."),
  topic("cn-mac", "computer-networks", "cn-core", 5, "Medium Access Control", "Data link layer: Medium Access Control."),
  topic("cn-ethernet-bridging", "computer-networks", "cn-core", 6, "Ethernet bridging", "Ethernet bridging."),
  topic("cn-routing", "computer-networks", "cn-core", 7, "Routing protocols", "Routing protocols: shortest path, flooding, distance vector and link state routing."),
  topic("cn-fragmentation-ip-addressing", "computer-networks", "cn-core", 8, "Fragmentation and IP addressing", "Fragmentation and IP addressing."),
  topic("cn-ipv4-cidr", "computer-networks", "cn-core", 9, "IPv4 and CIDR notation", "IPv4, CIDR notation."),
  topic("cn-arp", "computer-networks", "cn-core", 10, "ARP", "Basics of IP support protocols (ARP)."),
  topic("cn-dhcp", "computer-networks", "cn-core", 11, "DHCP", "Basics of IP support protocols (DHCP)."),
  topic("cn-icmp", "computer-networks", "cn-core", 12, "ICMP", "Basics of IP support protocols (ICMP)."),
  topic("cn-nat", "computer-networks", "cn-core", 13, "Network Address Translation", "Network Address Translation (NAT)."),
  topic("cn-flow-congestion-control", "computer-networks", "cn-core", 14, "Flow and congestion control", "Transport layer: flow control and congestion control."),
  topic("cn-udp", "computer-networks", "cn-core", 15, "UDP", "Transport layer: UDP."),
  topic("cn-tcp", "computer-networks", "cn-core", 16, "TCP", "Transport layer: TCP."),
  topic("cn-sockets", "computer-networks", "cn-core", 17, "Sockets", "Transport layer: sockets."),
  topic("cn-application-protocols", "computer-networks", "cn-core", 18, "Application layer protocols", "Application layer protocols: DNS, SMTP, HTTP, FTP, Email."),
] as const;

export const GATE_CS_IT_2026_BASELINE: GateCatalog = {
  exam: {
    id: EXAM_ID,
    code: "CS",
    name: "Computer Science and Information Technology",
    branchName: "GATE CS/IT",
  },
  version: {
    id: VERSION_ID,
    examId: EXAM_ID,
    baselineYear: 2026,
    targetYear: 2027,
    status: "baseline-pending-official-release",
    label: "GATE CS/IT 2026 baseline — pending official GATE 2027 syllabus release",
    source: {
      label: "GATE 2026 IIT Guwahati official CS and GA syllabi",
      url: SOURCE_URL,
      accessedAt: "2026-07-18",
    },
  },
  subjects,
  sections,
  topics,
};

export const GATE_CS_IT_2026_BASELINE_SOURCES = [SOURCE_URL, GA_SOURCE_URL] as const;

assertValidGateCatalog(GATE_CS_IT_2026_BASELINE);
