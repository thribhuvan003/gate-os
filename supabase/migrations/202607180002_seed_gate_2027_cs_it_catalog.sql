-- Shared catalog seed only. This does not create users, profiles, invitations, or study data.
-- The 2027 record is a reviewed working catalog and must be updated in a later migration
-- when the examination authority publishes the final 2027 syllabus.

insert into public.exams (code, name)
values ('GATE', 'Graduate Aptitude Test in Engineering')
on conflict (code) do update set name = excluded.name;

insert into public.branches (exam_id, code, name)
select exams.id, 'CS-IT', 'Computer Science and Information Technology'
from public.exams
where exams.code = 'GATE'
on conflict (exam_id, code) do update set name = excluded.name;

insert into public.exam_versions (exam_id, branch_id, label, year, status)
select exams.id, branches.id, 'GATE 2027 CS/IT working catalog', 2027, 'draft'
from public.exams
join public.branches on branches.exam_id = exams.id
where exams.code = 'GATE' and branches.code = 'CS-IT'
on conflict (branch_id, year) do update
  set label = excluded.label,
      status = excluded.status;

with subject_seed(code, name, short_name, position) as (
  values
    ('GA', 'General Aptitude', 'GA', 10),
    ('EM', 'Engineering Mathematics', 'Maths', 20),
    ('DL', 'Digital Logic', 'DL', 30),
    ('COA', 'Computer Organization and Architecture', 'COA', 40),
    ('PDSA', 'Programming, Data Structures and Algorithms', 'PDSA', 50),
    ('TOC', 'Theory of Computation', 'TOC', 60),
    ('CD', 'Compiler Design', 'CD', 70),
    ('OS', 'Operating Systems', 'OS', 80),
    ('DBMS', 'Databases', 'DBMS', 90),
    ('CN', 'Computer Networks', 'CN', 100)
)
insert into public.subjects (branch_id, code, name, short_name, position)
select branches.id, subject_seed.code, subject_seed.name, subject_seed.short_name, subject_seed.position
from subject_seed
cross join public.branches
join public.exams on exams.id = branches.exam_id
where exams.code = 'GATE' and branches.code = 'CS-IT'
on conflict (branch_id, code) do update
  set name = excluded.name,
      short_name = excluded.short_name,
      position = excluded.position;

with section_seed(subject_code, code, name, position) as (
  values
    ('GA', 'VERBAL', 'Verbal Ability', 10),
    ('GA', 'NUMERICAL', 'Numerical Ability', 20),
    ('EM', 'DISCRETE', 'Discrete Mathematics', 10),
    ('EM', 'CALCULUS', 'Calculus', 20),
    ('EM', 'LINEAR', 'Linear Algebra', 30),
    ('EM', 'PROBABILITY', 'Probability and Statistics', 40),
    ('DL', 'BOOLEAN', 'Boolean Algebra and Combinational Circuits', 10),
    ('DL', 'SEQUENTIAL', 'Sequential Circuits', 20),
    ('COA', 'MACHINE', 'Machine Instructions and Addressing', 10),
    ('COA', 'DATAPATH', 'Datapath and Control', 20),
    ('COA', 'MEMORY', 'Memory Hierarchy and I/O', 30),
    ('PDSA', 'PROGRAMMING', 'Programming', 10),
    ('PDSA', 'DATA_STRUCTURES', 'Data Structures', 20),
    ('PDSA', 'ALGORITHMS', 'Algorithms', 30),
    ('TOC', 'AUTOMATA', 'Automata Theory', 10),
    ('TOC', 'FORMAL', 'Formal Languages', 20),
    ('TOC', 'COMPUTABILITY', 'Computability and Complexity', 30),
    ('CD', 'LEXICAL', 'Lexical and Syntax Analysis', 10),
    ('CD', 'SEMANTICS', 'Semantic Analysis and Runtime Environments', 20),
    ('CD', 'OPTIMIZATION', 'Code Generation and Optimization', 30),
    ('OS', 'PROCESSES', 'Processes and Threads', 10),
    ('OS', 'SCHEDULING', 'CPU Scheduling and Synchronization', 20),
    ('OS', 'MEMORY', 'Memory Management', 30),
    ('OS', 'STORAGE', 'Storage and File Systems', 40),
    ('DBMS', 'MODELING', 'Data Modeling and Relational Algebra', 10),
    ('DBMS', 'SQL', 'SQL and Database Design', 20),
    ('DBMS', 'TRANSACTIONS', 'Transactions and Recovery', 30),
    ('CN', 'LAYERS', 'Layered Architecture and Data Link', 10),
    ('CN', 'NETWORK', 'Network and Internet Layers', 20),
    ('CN', 'TRANSPORT', 'Transport and Application Layers', 30)
)
insert into public.sections (subject_id, code, name, position)
select subjects.id, section_seed.code, section_seed.name, section_seed.position
from section_seed
join public.subjects on subjects.code = section_seed.subject_code
join public.branches on branches.id = subjects.branch_id
join public.exams on exams.id = branches.exam_id
where exams.code = 'GATE' and branches.code = 'CS-IT'
on conflict (subject_id, code) do update
  set name = excluded.name,
      position = excluded.position;

with topic_seed(subject_code, section_code, code, name, position) as (
  values
    ('GA', 'VERBAL', 'ENGLISH_GRAMMAR', 'English grammar', 10),
    ('GA', 'VERBAL', 'SENTENCE_COMPLETION', 'Sentence completion', 20),
    ('GA', 'VERBAL', 'VERBAL_ANALOGIES', 'Verbal analogies', 30),
    ('GA', 'VERBAL', 'WORD_GROUPS', 'Word groups', 40),
    ('GA', 'VERBAL', 'INSTRUCTIONS', 'Instructions', 50),
    ('GA', 'VERBAL', 'CRITICAL_REASONING', 'Critical reasoning', 60),
    ('GA', 'NUMERICAL', 'NUMERICAL_COMPUTATION', 'Numerical computation', 10),
    ('GA', 'NUMERICAL', 'RATIO_PROPORTION', 'Ratio and proportion', 20),
    ('GA', 'NUMERICAL', 'PERCENTAGE_POWER', 'Percentage and powers', 30),
    ('GA', 'NUMERICAL', 'PROFIT_LOSS', 'Profit and loss', 40),
    ('GA', 'NUMERICAL', 'PERMUTATION_COMBINATION', 'Permutation and combination', 50),
    ('GA', 'NUMERICAL', 'SERIES', 'Data interpretation and series', 60),
    ('EM', 'DISCRETE', 'LOGIC', 'Propositional and first-order logic', 10),
    ('EM', 'DISCRETE', 'SETS', 'Sets, relations and functions', 20),
    ('EM', 'DISCRETE', 'ORDER', 'Partial orders and lattices', 30),
    ('EM', 'DISCRETE', 'GROUPS', 'Groups and graph theory', 40),
    ('EM', 'DISCRETE', 'COMBINATORICS', 'Combinatorics', 50),
    ('EM', 'CALCULUS', 'LIMITS', 'Limits, continuity and differentiability', 10),
    ('EM', 'CALCULUS', 'MAXIMA_MINIMA', 'Maxima and minima', 20),
    ('EM', 'CALCULUS', 'INTEGRAL', 'Integral calculus', 30),
    ('EM', 'LINEAR', 'MATRICES', 'Matrices and determinants', 10),
    ('EM', 'LINEAR', 'SYSTEMS', 'Systems of linear equations', 20),
    ('EM', 'LINEAR', 'EIGEN', 'Eigenvalues and eigenvectors', 30),
    ('EM', 'PROBABILITY', 'RANDOM_VARIABLES', 'Random variables', 10),
    ('EM', 'PROBABILITY', 'DISTRIBUTIONS', 'Probability distributions', 20),
    ('EM', 'PROBABILITY', 'CONDITIONAL', 'Conditional probability and Bayes theorem', 30),
    ('EM', 'PROBABILITY', 'STATISTICS', 'Mean, median, mode and standard deviation', 40),
    ('DL', 'BOOLEAN', 'BOOLEAN_ALGEBRA', 'Boolean algebra', 10),
    ('DL', 'BOOLEAN', 'COMBINATIONAL', 'Combinational circuits', 20),
    ('DL', 'BOOLEAN', 'MINIMIZATION', 'Karnaugh maps and minimization', 30),
    ('DL', 'SEQUENTIAL', 'FLIP_FLOPS', 'Latches and flip-flops', 10),
    ('DL', 'SEQUENTIAL', 'COUNTERS', 'Counters and registers', 20),
    ('DL', 'SEQUENTIAL', 'FINITE_STATE', 'Finite state machines', 30),
    ('COA', 'MACHINE', 'INSTRUCTIONS', 'Instruction formats and addressing modes', 10),
    ('COA', 'MACHINE', 'ALU', 'ALU and arithmetic', 20),
    ('COA', 'DATAPATH', 'DATAPATH', 'Datapath design', 10),
    ('COA', 'DATAPATH', 'CONTROL', 'Control unit design', 20),
    ('COA', 'DATAPATH', 'PIPELINING', 'Pipelining and hazards', 30),
    ('COA', 'MEMORY', 'CACHE', 'Cache memory', 10),
    ('COA', 'MEMORY', 'VIRTUAL_MEMORY', 'Main and virtual memory', 20),
    ('COA', 'MEMORY', 'IO', 'I/O interface and interrupts', 30),
    ('PDSA', 'PROGRAMMING', 'C_LANGUAGE', 'C programming', 10),
    ('PDSA', 'PROGRAMMING', 'RECURSION', 'Recursion', 20),
    ('PDSA', 'DATA_STRUCTURES', 'STACK_QUEUE', 'Stacks and queues', 10),
    ('PDSA', 'DATA_STRUCTURES', 'LINKED_LISTS', 'Linked lists', 20),
    ('PDSA', 'DATA_STRUCTURES', 'TREES', 'Trees and binary search trees', 30),
    ('PDSA', 'DATA_STRUCTURES', 'HEAPS', 'Heaps', 40),
    ('PDSA', 'DATA_STRUCTURES', 'GRAPHS', 'Graphs', 50),
    ('PDSA', 'ALGORITHMS', 'SEARCH_SORT', 'Searching and sorting', 10),
    ('PDSA', 'ALGORITHMS', 'HASHING', 'Hashing', 20),
    ('PDSA', 'ALGORITHMS', 'COMPLEXITY', 'Asymptotic complexity', 30),
    ('PDSA', 'ALGORITHMS', 'DIVIDE_CONQUER', 'Divide and conquer', 40),
    ('PDSA', 'ALGORITHMS', 'GREEDY', 'Greedy algorithms', 50),
    ('PDSA', 'ALGORITHMS', 'DYNAMIC_PROGRAMMING', 'Dynamic programming', 60),
    ('TOC', 'AUTOMATA', 'FINITE_AUTOMATA', 'Finite automata', 10),
    ('TOC', 'AUTOMATA', 'REGULAR_EXPRESSIONS', 'Regular expressions', 20),
    ('TOC', 'AUTOMATA', 'PUMPING', 'Pumping lemma', 30),
    ('TOC', 'FORMAL', 'CONTEXT_FREE', 'Context-free grammars and languages', 10),
    ('TOC', 'FORMAL', 'PUSHDOWN', 'Pushdown automata', 20),
    ('TOC', 'FORMAL', 'NORMAL_FORMS', 'Normal forms', 30),
    ('TOC', 'COMPUTABILITY', 'TURING_MACHINES', 'Turing machines', 10),
    ('TOC', 'COMPUTABILITY', 'UNDECIDABILITY', 'Undecidability', 20),
    ('TOC', 'COMPUTABILITY', 'COMPLEXITY', 'P and NP complexity classes', 30),
    ('CD', 'LEXICAL', 'LEXICAL', 'Lexical analysis', 10),
    ('CD', 'LEXICAL', 'PARSING', 'Parsing and parser construction', 20),
    ('CD', 'SEMANTICS', 'SEMANTIC', 'Semantic analysis', 10),
    ('CD', 'SEMANTICS', 'RUNTIME', 'Runtime environments', 20),
    ('CD', 'OPTIMIZATION', 'INTERMEDIATE', 'Intermediate code generation', 10),
    ('CD', 'OPTIMIZATION', 'CODE_GENERATION', 'Code generation', 20),
    ('CD', 'OPTIMIZATION', 'OPTIMIZATION', 'Machine-independent optimization', 30),
    ('OS', 'PROCESSES', 'SYSTEM_CALLS', 'System calls and process states', 10),
    ('OS', 'PROCESSES', 'THREADS', 'Threads and concurrency', 20),
    ('OS', 'SCHEDULING', 'CPU_SCHEDULING', 'CPU scheduling', 10),
    ('OS', 'SCHEDULING', 'SYNCHRONIZATION', 'Synchronization and deadlocks', 20),
    ('OS', 'MEMORY', 'PAGING', 'Paging and segmentation', 10),
    ('OS', 'MEMORY', 'VIRTUAL_MEMORY', 'Virtual memory', 20),
    ('OS', 'STORAGE', 'FILE_SYSTEMS', 'File systems', 10),
    ('OS', 'STORAGE', 'DISK_SCHEDULING', 'Disk scheduling', 20),
    ('DBMS', 'MODELING', 'ER_MODEL', 'ER model', 10),
    ('DBMS', 'MODELING', 'RELATIONAL_MODEL', 'Relational model', 20),
    ('DBMS', 'MODELING', 'RELATIONAL_ALGEBRA', 'Relational algebra', 30),
    ('DBMS', 'SQL', 'SQL', 'SQL queries', 10),
    ('DBMS', 'SQL', 'NORMALIZATION', 'Integrity constraints and normal forms', 20),
    ('DBMS', 'SQL', 'INDEXING', 'File organization and indexing', 30),
    ('DBMS', 'TRANSACTIONS', 'TRANSACTIONS', 'Transactions and schedules', 10),
    ('DBMS', 'TRANSACTIONS', 'CONCURRENCY', 'Concurrency control', 20),
    ('DBMS', 'TRANSACTIONS', 'RECOVERY', 'Database recovery', 30),
    ('CN', 'LAYERS', 'OSI_TCPIP', 'OSI and TCP/IP models', 10),
    ('CN', 'LAYERS', 'DATA_LINK', 'Data link layer and error control', 20),
    ('CN', 'LAYERS', 'MAC', 'Medium access control', 30),
    ('CN', 'NETWORK', 'ROUTING', 'Routing algorithms', 10),
    ('CN', 'NETWORK', 'IP', 'IPv4, IPv6 and subnetting', 20),
    ('CN', 'NETWORK', 'INTERNET', 'Internet protocols and NAT', 30),
    ('CN', 'TRANSPORT', 'TCP_UDP', 'TCP, UDP and congestion control', 10),
    ('CN', 'TRANSPORT', 'APPLICATION', 'DNS, HTTP and application protocols', 20)
)
insert into public.topics (section_id, code, name, position)
select sections.id, topic_seed.code, topic_seed.name, topic_seed.position
from topic_seed
join public.subjects on subjects.code = topic_seed.subject_code
join public.sections on sections.subject_id = subjects.id and sections.code = topic_seed.section_code
join public.branches on branches.id = subjects.branch_id
join public.exams on exams.id = branches.exam_id
where exams.code = 'GATE' and branches.code = 'CS-IT'
on conflict (section_id, code) do update
  set name = excluded.name,
      position = excluded.position;

insert into public.exam_version_topics (exam_version_id, topic_id, is_required, position)
select exam_versions.id, topics.id, true, row_number() over (order by subjects.position, sections.position, topics.position)::smallint
from public.exam_versions
join public.branches on branches.id = exam_versions.branch_id
join public.subjects on subjects.branch_id = branches.id
join public.sections on sections.subject_id = subjects.id
join public.topics on topics.section_id = sections.id
where exam_versions.year = 2027 and branches.code = 'CS-IT'
on conflict (exam_version_id, topic_id) do update
  set is_required = excluded.is_required,
      position = excluded.position;
