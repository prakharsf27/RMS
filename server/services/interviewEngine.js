/**
 * TalentFlow Adaptive Mock Interview Simulator Engine
 * Generates dynamic questions, evaluates answers step-by-step, and produces a comprehensive debrief report.
 */

const FRESHER_QUESTION_BANK = [
  // DBMS
  {
    category: "DBMS",
    difficulty: "Medium",
    type: "conceptual",
    question: "Explain the four ACID properties in DBMS. Why is Isolation critical in a multi-user database environment, and what are dirty reads?",
    sampleAnswerCriteria: ["Atomicity", "Consistency", "Isolation", "Durability", "Dirty read explanation"]
  },
  {
    category: "DBMS",
    difficulty: "Medium",
    type: "scenario",
    question: "What is Database Normalization? Walk me through 1NF, 2NF, and 3NF with a simple example table, and explain when denormalization might be preferred.",
    sampleAnswerCriteria: ["1NF atomic values", "2NF no partial dependency", "3NF no transitive dependency", "Denormalization for read performance"]
  },
  {
    category: "DBMS",
    difficulty: "Hard",
    type: "scenario",
    question: "How does a B-Tree or B+Tree index speed up search queries, and what is the trade-off when performing high-frequency INSERT or UPDATE operations?",
    sampleAnswerCriteria: ["Logarithmic search", "Balanced tree", "Index rebalancing overhead", "Disk I/O"]
  },
  {
    category: "SQL",
    difficulty: "Medium",
    type: "coding",
    question: "Given two tables: `Employees (id, name, department_id, salary)` and `Departments (id, name)`. Write a SQL query to find the highest-paid employee in each department.",
    sampleAnswerCriteria: ["GROUP BY or window function DENSE_RANK()", "JOIN", "HAVING / MAX"]
  },
  // OOP
  {
    category: "OOP",
    difficulty: "Medium",
    type: "scenario",
    question: "Explain the difference between Method Overloading and Method Overriding in Object-Oriented Programming. Can you override a private or static method?",
    sampleAnswerCriteria: ["Compile-time vs Runtime polymorphism", "Signature differences", "Static/private cannot be overridden"]
  },
  {
    category: "OOP",
    difficulty: "Hard",
    type: "scenario",
    question: "Describe the 'Composition over Inheritance' principle. In what real-world architecture would deep inheritance hierarchies become brittle?",
    sampleAnswerCriteria: ["HAS-A vs IS-A", "Tight coupling", "Fragile base class problem"]
  },
  // DSA
  {
    category: "DSA",
    difficulty: "Medium",
    type: "coding",
    question: "How would you determine if a Singly Linked List has a cycle, using O(1) auxiliary space? Explain Floyd's Cycle-Finding Algorithm (Tortoise and Hare).",
    sampleAnswerCriteria: ["Slow and fast pointers", "O(N) time O(1) space", "Mathematical proof of convergence"]
  },
  {
    category: "DSA",
    difficulty: "Medium",
    type: "coding",
    question: "Given an unsorted integer array, explain an optimal approach to find the 'Two Sum' that add up to a target value. Compare the Hash Map vs Two-Pointer sorted approach.",
    sampleAnswerCriteria: ["Hash Map O(N) time O(N) space", "Sorting + Two-Pointer O(N log N) time O(1) space"]
  },
  // OS & Networks
  {
    category: "Operating Systems",
    difficulty: "Medium",
    type: "conceptual",
    question: "What is the key difference between a Process and a Thread? How do context switches differ between them in terms of CPU overhead and memory space?",
    sampleAnswerCriteria: ["Isolated memory vs shared memory space", "Page tables context switch overhead", "IPC vs direct variable sharing"]
  },
  {
    category: "Computer Networks",
    difficulty: "Medium",
    type: "conceptual",
    question: "Walk me through the TCP 3-way Handshake. Why is it a 3-way handshake rather than 2-way, and how does it ensure reliable sequence synchronization?",
    sampleAnswerCriteria: ["SYN, SYN-ACK, ACK", "Sequence number negotiation", "Preventing stale duplicate connection requests"]
  },
  // Behavioral
  {
    category: "Behavioral",
    difficulty: "Medium",
    type: "behavioral",
    question: "Tell me about a complex technical roadblock you faced in a project or assignment. How did you diagnose the root cause and resolve it?",
    sampleAnswerCriteria: ["STAR method", "Systematic debugging", "Clear technical resolution and lesson learned"]
  }
];

const EXPERIENCED_TOPIC_TEMPLATES = [
  {
    category: "System Design",
    difficulty: "Senior",
    question: "How would you design a high-throughput, low-latency notification and messaging service supporting 100k concurrent WebSocket connections with message persistence?"
  },
  {
    category: "Frontend Architecture",
    difficulty: "Senior",
    question: "In Next.js and modern React 19, how do you architect server-side data fetching and client-side state caching to eliminate Core Web Vitals LCP and CLS degradation?"
  },
  {
    category: "Microservices & Distributed Systems",
    difficulty: "Senior",
    question: "When decomposing a monolithic architecture into microservices, how do you handle distributed transactions and eventual consistency without using two-phase commit (2PC)?"
  },
  {
    category: "Technical Leadership & Trade-offs",
    difficulty: "Senior",
    question: "Describe a situation where you advocated for paying down critical technical debt against pressure to deliver net-new product features. How did you align stakeholders?"
  }
];

/**
 * Initializes a new adaptive interview session
 */
function createInterviewSession({
  track = 'fresher', // 'fresher' | 'internship' | 'experienced' | 'custom'
  role = 'Software Engineer',
  company = '',
  difficulty = 'Medium',
  candidateProfile = null
}) {
  const isExperienced = track === 'experienced' || difficulty === 'Senior';
  let firstQuestion;

  if (isExperienced) {
    const candidateSkills = candidateProfile?.skills?.slice(0, 3).join(', ') || 'modern full-stack technologies';
    firstQuestion = {
      id: 1,
      category: "Architecture & Role Fundamentals",
      difficulty: difficulty || "Senior",
      question: `Welcome! Let's start with your architectural experience in ${role}. Given your background with ${candidateSkills}, how do you evaluate technology trade-offs between monolithic modularity and distributed micro-services for a high-growth platform?`
    };
  } else {
    // Fresher start
    const q = FRESHER_QUESTION_BANK[0];
    firstQuestion = {
      id: 1,
      category: q.category,
      difficulty: q.difficulty,
      question: `Welcome! To start today's interview for the ${role} position, let's explore ${q.category}: ${q.question}`
    };
  }

  return {
    sessionId: `mock_${Date.now()}`,
    track,
    role,
    company: company || 'TalentFlow Tech',
    difficulty,
    currentQuestionIndex: 0,
    currentQuestion: firstQuestion,
    transcript: []
  };
}

/**
 * Evaluates candidate answer and picks the next adaptive question
 */
function evaluateAnswerAndNext({
  session,
  candidateAnswer,
  currentQuestion
}) {
  const answer = (candidateAnswer || '').trim();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;

  // Deterministic evaluation heuristics
  let score = 50; // base score for answering
  let feedback = "";

  if (wordCount < 10) {
    score = 35;
    feedback = "Your answer was very brief. Try elaborating with specific technical mechanisms, trade-offs, and examples.";
  } else if (wordCount < 30) {
    score = 65;
    feedback = "Good fundamental point, but consider structuring your response with concrete examples and practical edge-case considerations.";
  } else {
    score = 85;
    if (/because|trade-off|for example|specifically|performance|latency|index|acid/i.test(answer)) {
      score += 10;
    }
    feedback = "Strong, articulated answer with clear technical reasoning and structured breakdown.";
  }
  score = Math.min(100, Math.max(30, score));

  // Record item into transcript
  const transcriptItem = {
    questionNumber: session.currentQuestionIndex + 1,
    question: currentQuestion.question,
    category: currentQuestion.category,
    candidateAnswer: answer,
    score,
    feedback
  };

  const updatedTranscript = [...(session.transcript || []), transcriptItem];
  const nextIndex = session.currentQuestionIndex + 1;

  // Check if session has reached total questions (e.g. 5 questions total)
  const isFinished = nextIndex >= 5;

  let nextQuestion = null;
  if (!isFinished) {
    if (session.track === 'experienced') {
      const template = EXPERIENCED_TOPIC_TEMPLATES[(nextIndex - 1) % EXPERIENCED_TOPIC_TEMPLATES.length];
      nextQuestion = {
        id: nextIndex + 1,
        category: template.category,
        difficulty: score > 80 ? "Staff/Lead" : "Senior",
        question: template.question
      };
    } else {
      // Fresher: pick next category
      const q = FRESHER_QUESTION_BANK[nextIndex % FRESHER_QUESTION_BANK.length];
      nextQuestion = {
        id: nextIndex + 1,
        category: q.category,
        difficulty: score > 80 ? "Hard" : "Medium",
        question: q.question
      };
    }
  }

  return {
    isFinished,
    lastEvaluation: { score, feedback },
    transcript: updatedTranscript,
    nextQuestionIndex: nextIndex,
    nextQuestion
  };
}

/**
 * Generates final comprehensive debrief report
 */
function generateDebriefReport(session) {
  const transcript = session.transcript || [];
  const count = Math.max(1, transcript.length);
  const totalScore = transcript.reduce((acc, item) => acc + item.score, 0);
  const overallScore = Math.round(totalScore / count);

  const technicalKnowledgeScore = Math.min(100, overallScore + 3);
  const problemSolvingScore = Math.min(100, Math.max(50, overallScore - 2));
  const communicationScore = Math.min(100, overallScore + 5);
  const roleRelevanceScore = Math.min(100, overallScore + 1);
  const answerQualityScore = overallScore;

  const strengths = [
    "Demonstrated solid grasp of core algorithmic principles and system boundaries.",
    "Articulated technical reasoning with clear active listening and structured explanations.",
    "Highlighted practical considerations when evaluating performance and data consistency."
  ];

  const weakAreas = [
    "Could provide deeper quantitative metrics when describing system scale or complexity.",
    "Expand on database transaction isolation anomalies (dirty reads, phantom reads) during edge case discussions."
  ];

  const recommendedTopics = [
    "Database Indexing Internals (B+ Trees vs Hash Indexes)",
    "Distributed Cache Invalidation Strategies (Cache-Aside, Write-Through)",
    "React 19 Server Components vs Client Hydration Bottlenecks"
  ];

  const nextPracticePlan = "Review ACID transaction isolation levels and practice two medium-difficulty DSA problems using sliding window and two-pointer paradigms.";

  return {
    overallScore,
    technicalKnowledgeScore,
    problemSolvingScore,
    communicationScore,
    roleRelevanceScore,
    answerQualityScore,
    strengths,
    weakAreas,
    recommendedTopics,
    nextPracticePlan,
    transcript
  };
}

module.exports = {
  createInterviewSession,
  evaluateAnswerAndNext,
  generateDebriefReport
};
