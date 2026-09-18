import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { id: "javascript", name: "JavaScript", ext: "js" },
  { id: "python", name: "Python 3", ext: "py" },
  { id: "java", name: "Java", ext: "java" },
  { id: "cpp", name: "C++17", ext: "cpp" },
];

// Code suggestions based on problem category
const CODE_SUGGESTIONS = {
  "Basic Programming": {
    javascript: [
      "// Use a loop to iterate\nfor (let i = 0; i < n; i++) {\n  // Your code here\n}",
      "// Use Math functions\nMath.max(...array);",
      "// Parse input\nconst parsed = JSON.parse(input);"
    ],
    python: [
      "# Use a loop to iterate\nfor i in range(n):\n    # Your code here",
      "# Use max and min functions\nmax(array)",
      "# Parse input\nimport json\nparsed = json.loads(input)"
    ],
    java: [
      "// Loop through array\nfor (int i = 0; i < n; i++) {\n    // Your code here\n}",
      "// Use Math class\nMath.max(a, b);",
      "// Parse string\nInteger.parseInt(str);"
    ],
    cpp: [
      "// Loop through vector\nfor (int i = 0; i < n; i++) {\n    // Your code here\n}",
      "// Use max function\nmax(a, b);",
      "// Vector operations\nvector<int> v; v.push_back(val);"
    ]
  },
  "String Manipulation": {
    javascript: [
      "// Loop through string\nfor (let char of str) {\n  // Process char\n}",
      "// String methods\nstr.charAt(i), str.substring(start, end)",
      "// Split and join\nstr.split('').join('')"
    ],
    python: [
      "# Loop through string\nfor char in string:\n    # Process char",
      "# String slicing\nstring[start:end]",
      "# String methods\nstring.replace(), string.split()"
    ],
    java: [
      "// String charAt\nfor (int i = 0; i < str.length(); i++) {\n    char c = str.charAt(i);\n}",
      "// String methods\nstr.substring(), str.length()",
      "// StringBuilder\nStringBuilder sb = new StringBuilder();"
    ],
    cpp: [
      "// String indexing\nfor (int i = 0; i < str.length(); i++) {\n    char c = str[i];\n}",
      "// String methods\nstr.substr(), str.length()",
      "// Push and pop\nstr.push_back(c), str.pop_back();"
    ]
  },
  "Arrays": {
    javascript: [
      "// Array methods\narray.map(), array.filter(), array.reduce()",
      "// Loop and sum\nlet sum = 0;\nfor (let num of array) { sum += num; }",
      "// Find index\narray.indexOf(element), array.findIndex()"
    ],
    python: [
      "# List comprehension\n[x for x in array if condition]",
      "# List methods\narray.append(), array.sort()",
      "# Sum and max\nsum(array), max(array)"
    ],
    java: [
      "// Array loop\nfor (int i = 0; i < array.length; i++) {\n    int val = array[i];\n}",
      "// ArrayList\nArrayList<Integer> list = new ArrayList<>();",
      "// Sum using streams\narray.stream().sum()"
    ],
    cpp: [
      "// Vector loop\nfor (int i = 0; i < v.size(); i++) {\n    int val = v[i];\n}",
      "// Push and pop\nv.push_back(val), v.pop_back()",
      "// Sum\nint sum = 0; for (int x : v) sum += x;"
    ]
  },
  "Data Structures (Stack)": {
    javascript: [
      "// Stack implementation\nconst stack = [];\nstack.push(item);\nstack.pop();",
      "// Check if empty\nif (stack.length === 0) { }",
      "// Peek top\nconst top = stack[stack.length - 1];"
    ],
    python: [
      "# Stack using list\nstack = []\nstack.append(item)\nstack.pop()",
      "# Check if empty\nif not stack:",
      "# Peek\ntop = stack[-1]"
    ],
    java: [
      "// Stack class\nStack<Integer> stack = new Stack<>();\nstack.push(item);\nstack.pop();",
      "// Peek and empty\nstack.peek(), stack.isEmpty()",
      "// Size\nstack.size()"
    ],
    cpp: [
      "// Stack\nstack<int> st;\nst.push(val);\nst.pop();",
      "// Top and empty\nst.top(), st.empty()",
      "// Size\nst.size()"
    ]
  },
  "Greedy": {
    javascript: [
      "// Sort array\narray.sort((a, b) => a - b);",
      "// Iterate and update max\nlet max = 0;\nfor (let item of array) {\n  max = Math.max(max, item);\n}",
      "// Greedy selection\nwhile (condition) {\n  // Pick best option\n}"
    ],
    python: [
      "# Sort list\narr.sort()\narr.sort(reverse=True)",
      "# Iterate and track max\nmax_val = 0\nfor item in arr:\n    max_val = max(max_val, item)",
      "# While loop for greedy\nwhile condition:\n    # Pick best option"
    ],
    java: [
      "// Sort array\nArrays.sort(array);",
      "// Iterate\nfor (int item : array) {\n    // Process\n}",
      "// Collections\nCollections.sort(list);"
    ],
    cpp: [
      "// Sort\nsort(v.begin(), v.end());",
      "// Range-based loop\nfor (int item : v) {\n    // Process\n}",
      "// Priority queue\npriority_queue<int> pq;"
    ]
  }
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function Spinner({ size = 16 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      style={{
        width: size, height: size, border: `2px solid rgba(79,70,229,0.2)`,
        borderTopColor: "#4F46E5", borderRadius: "50%", display: "inline-block"
      }}
    />
  );
}

function getStarterCode(question, language) {
  return question?.defaultCode?.[language]
    || question?.boilerplate_code?.[language]
    || question?.function?.signature?.[language]
    || "";
}

export default function CompetitiveEditor(props) {
  const { company = "generic", onChangeSubmissions } = props || {};
  const [questions, setQuestions] = useState([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [language, setLanguage] = useState("javascript");
  
  // State: { [questionId_language]: string }
  const [userCodes, setUserCodes] = useState({});
  // State: { [questionId]: { passed, output, details } }
  const [testResults, setTestResults] = useState({});
  
  const [activeTab, setActiveTab] = useState("problem");
  const [outputTab, setOutputTab] = useState("output");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch dynamic questions
  useEffect(() => {
    let mounted = true;
    const fetchQuestions = async () => {
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
        const res = await fetch(`${serverUrl}/service/generate-questions?company=${company}`, { 
          method: "POST",
          credentials: "include" 
        });
        if (res.ok) {
          const data = await res.json();
          // Flatten { easy, medium, hard } into an array
          const arr = [];
          if (data.questions.easy) arr.push(data.questions.easy);
          if (data.questions.medium) arr.push(data.questions.medium);
          if (data.questions.hard) arr.push(data.questions.hard);
          if (mounted) {
            setQuestions(arr);
            setIsLoading(false);
            
            // Init default codes
            const initialCodes = {};
            arr.forEach(q => {
              LANGUAGES.forEach(l => {
                initialCodes[`${q.id}_${l.id}`] = getStarterCode(q, l.id);
              });
            });
            setUserCodes(initialCodes);
          }
        }
      } catch (err) {
        console.error("Failed to load questions", err);
        setIsLoading(false);
      }
    };
    fetchQuestions();
    return () => { mounted = false; };
  }, [company]);

  const question = questions[questionIdx];
  const currentCodeKey = question ? `${question.id}_${language}` : null;
  const code = userCodes[currentCodeKey] || getStarterCode(question, language);

  const handleCodeChange = (v) => {
    const newCodes = { ...userCodes, [currentCodeKey]: v };
    setUserCodes(newCodes);
    if (onChangeSubmissions) {
      // Build a submission array
      const submissions = questions.map(q => {
        const qLang = language;
        return {
          questionId: q.id,
          title: q.title,
          difficulty: q.difficulty,
          code: newCodes[`${q.id}_${qLang}`] || "",
          language: qLang,
          testResults: testResults[q.id]?.details || [],
          status: testResults[q.id]?.passed ? "Passed" : (testResults[q.id] ? "Failed" : "Pending")
        };
      });
      onChangeSubmissions(submissions);
    }
  };

  const handleRun = async () => {
    if (isRunning || !question) return;
    setIsRunning(true);
    setActiveTab("testcases"); // Switch to testcases to see result
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
      const payload = {
        language,
        testcases: question.testcases,
        files: [
          { name: `solution.${LANGUAGES.find(l => l.id === language)?.ext || 'txt'}`, content: code },
        ],
      };

      const res = await fetch(`${serverUrl}/service/code-runner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      
      let newTestResults = { ...testResults };
      if (res.ok && data.stdout) {
        const outputs = data.stdout.split('---ENDTEST---').map(s => s.trim()).filter(Boolean);
        const details = question.testcases.map((tc, idx) => {
          const actualOutput = outputs[idx] || (data.stderr ? data.stderr : "No Output");
          const passed = String(actualOutput).trim().toLowerCase() === String(tc.output).trim().toLowerCase();
          return { ...tc, actualOutput, passed };
        });
        const allPassed = details.every(d => d.passed);
        newTestResults[question.id] = { passed: allPassed, details, error: data.stderr };
      } else {
        newTestResults[question.id] = { passed: false, details: [], error: data.stderr || data.message || "Failed to execute" };
      }
      setTestResults(newTestResults);
      
      // Notify parent
      handleCodeChange(code); 
      
    } catch (e) {
      console.error(e);
      setTestResults({ ...testResults, [question.id]: { passed: false, error: e.message, details: [] } });
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}><Spinner size={32} /></div>;
  }

  if (!question) {
    return <div style={{ padding: 20 }}>No questions available for this company.</div>;
  }

  const result = testResults[question.id];

  return (
    <div style={{
      minHeight: "100vh", background: "#F8F5F0", fontFamily: "'Geist','Inter',system-ui,sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* ── TOP NAV ── */}
      <div style={{
        background: "#0f172a", borderBottom: "1px solid #1e293b",
        padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 16,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>
            Coding Interview
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Language picker */}
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={{
            background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155",
            borderRadius: 7, padding: "5px 10px", fontSize: 12, cursor: "pointer", outline: "none",
          }}
        >
          {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {/* ── QUESTION SELECTOR ── */}
      <div style={{
        background: "#F1ECE6", borderBottom: "1px solid #E5E7EB",
        padding: "8px 20px", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0,
      }}>
        {questions.map((q, i) => {
          const status = testResults[q.id];
          return (
          <motion.button
            key={q.id}
            onClick={() => { setQuestionIdx(i); setActiveTab("problem"); }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "6px 16px", borderRadius: 8, border: "1px solid",
              borderColor: questionIdx === i ? "#6366f1" : (status?.passed ? "#10b981" : "#E5E7EB"),
              background: questionIdx === i ? "#ede9fe" : (status?.passed ? "#d1fae5" : "#FFFFFF"),
              color: questionIdx === i ? "#4338ca" : (status?.passed ? "#047857" : "#475569"),
              fontSize: 12, fontWeight: questionIdx === i ? 700 : 500,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
            }}
          >
            Problem {i+1} {status?.passed && "✓"}
          </motion.button>
        )})}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* LEFT PANEL */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{
                background: "#FFFFFF", borderRight: "1px solid #E5E7EB",
                display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
              }}
            >
              {/* Tab bar */}
              <div style={{
                display: "flex", borderBottom: "1px solid #E5E7EB",
                background: "#F8F5F0", flexShrink: 0,
              }}>
                {[
                  { id: "problem", label: "Problem" },
                  { id: "testcases", label: "Result & Tests" },
                  { id: "hints", label: "Hints" },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
                      background: "transparent", fontSize: 12, fontWeight: 600,
                      color: activeTab === t.id ? "#4338ca" : "#64748b",
                      borderBottom: activeTab === t.id ? "2px solid #6366f1" : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >{t.label}</button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                {activeTab === "problem" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Difficulty Badge */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 12px", borderRadius: 6, width: "fit-content",
                      background: question.difficulty === "easy" ? "#dcfce7" : question.difficulty === "medium" ? "#fef3c7" : "#fee2e2",
                      color: question.difficulty === "easy" ? "#15803d" : question.difficulty === "medium" ? "#b45309" : "#991b1b",
                      fontSize: 11, fontWeight: 600
                    }}>
                      <span>{question.difficulty?.toUpperCase()}</span>
                    </div>
                    {/* Title */}
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>
                      {question.title}
                    </h2>
                    {/* Description */}
                    <div>
                      <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {question.description}
                      </p>
                    </div>
                    {/* Examples */}
                    {question.examples && question.examples.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 10px" }}>Examples</h3>
                        {question.examples.map((example, i) => (
                          <div key={i} style={{
                            padding: 10, marginBottom: 10, borderRadius: 6,
                            background: "#f3f4f6", border: "1px solid #d1d5db", fontSize: 12
                          }}>
                            <div style={{ marginBottom: 4 }}>Input: <code style={{ background: "#e5e7eb", padding: "2px 4px", borderRadius: 3, fontFamily: "monospace" }}>{example.input}</code></div>
                            <div>Output: <code style={{ background: "#e5e7eb", padding: "2px 4px", borderRadius: 3, fontFamily: "monospace" }}>{example.output}</code></div>
                          </div>
                        ))}
                      </div>
                    )}\n                    {/* Constraints */}
                    {question.constraints && question.constraints.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 10px" }}>Constraints</h3>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
                          {question.constraints.map((constraint, i) => (
                            <li key={i}>{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}\n                    {/* Code Suggestions */}
                    {question.category && CODE_SUGGESTIONS[question.category]?.[language] && (
                      <div style={{ marginTop: 12, padding: 12, backgroundColor: "#ecfdf5", border: "1px solid #86efac", borderRadius: 8 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#166534", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                          💡 Code Suggestions Available
                        </h3>
                        <p style={{ fontSize: 12, color: "#15803d", margin: "0 0 10px" }}>
                          Click the button below to insert helpful code snippets:
                        </p>
                        {CODE_SUGGESTIONS[question.category][language].map((suggestion, i) => (
                          <motion.button
                            key={i}
                            onClick={() => {
                              const currentKey = `${question.id}_${language}`;
                              const currentCode = userCodes[currentKey] || "";
                              const newCode = currentCode ? currentCode + "\n\n" + suggestion : suggestion;
                              handleCodeChange(newCode);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              display: "block", width: "100%", textAlign: "left", padding: 8, marginBottom: 8,
                              background: "#dcfce7", border: "1px solid #86efac", borderRadius: 6,
                              cursor: "pointer", transition: "all 0.15s", fontSize: 11, color: "#166534", fontWeight: 500
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#bbf7d0"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#dcfce7"; }}
                          >
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word", color: "#166534", fontFamily: "monospace", fontSize: 11 }}>
                              {suggestion}
                            </pre>
                            <span style={{ fontSize: 10, color: "#15803d", fontWeight: 600 }}>→ Click to insert</span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "testcases" && (
                  <div>
                    {result ? (
                      <div>
                        {result.error && <div style={{color: "red", background: "#fee2e2", padding: 10, borderRadius: 8, marginBottom: 10}}><pre>{result.error}</pre></div>}
                        {result.details?.map((tc, i) => (
                           <div key={i} style={{ padding: 10, border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 10, background: tc.passed ? "#dcfce7" : "#fee2e2" }}>
                              <div style={{fontWeight: "bold", marginBottom: 5}}>Test Case {i+1} {tc.passed ? "✓" : "✗"}</div>
                              <div><strong>Input:</strong> {tc.input}</div>
                              <div><strong>Expected:</strong> {tc.output}</div>
                              <div><strong>Actual:</strong> {tc.actualOutput}</div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div>Run the code to see test results.</div>
                    )}
                  </div>
                )}
                {activeTab === "hints" && (
                  <div>
                    {question.hints && question.hints.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>💡 Hints</h3>
                        {question.hints.map((hint, i) => (
                          <p key={i} style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.6, marginBottom: 8 }}>
                            <strong>Hint {i+1}:</strong> {hint}
                          </p>
                        ))}
                      </div>
                    )}
                    {question.category && CODE_SUGGESTIONS[question.category]?.[language] && (
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>💻 Code Suggestions</h3>
                        {CODE_SUGGESTIONS[question.category][language].map((suggestion, i) => (
                          <motion.button
                            key={i}
                            onClick={() => {
                              const currentKey = `${question.id}_${language}`;
                              const currentCode = userCodes[currentKey] || "";
                              const newCode = currentCode ? currentCode + "\n\n" + suggestion : suggestion;
                              handleCodeChange(newCode);
                              setActiveTab("problem");
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              display: "block", width: "100%", textAlign: "left", padding: 10, marginBottom: 8,
                              background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6,
                              cursor: "pointer", transition: "all 0.15s", fontSize: 11
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#e5e7eb"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                          >
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word", color: "#1f2937", fontFamily: "monospace" }}>
                              {suggestion}
                            </pre>
                            <span style={{ fontSize: 10, color: "#6b7280" }}>Click to insert</span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            width: 20, background: "#F1ECE6", border: "none", borderRight: "1px solid #E5E7EB",
            cursor: "pointer", color: "#94a3b8", fontSize: 10, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title={sidebarOpen ? "Hide panel" : "Show panel"}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>

        {/* RIGHT PANEL: Editor + Output */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Editor header */}
          <div style={{
            height: 44, background: "#F8F5F0", borderBottom: "1px solid #E5E7EB",
            display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 12, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              Solution.{LANGUAGES.find(l=>l.id===language)?.ext}
            </div>
            <div style={{ flex: 1 }} />

            <motion.button
              onClick={handleRun}
              disabled={isRunning}
              whileTap={!isRunning ? { scale: 0.96 } : {}}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 16px", borderRadius: 8,
                background: isRunning ? "#c7d2fe" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                color: "#ffffff", border: "none", fontSize: 12, fontWeight: 600,
                cursor: isRunning ? "not-allowed" : "pointer", boxShadow: "0 2px 4px rgba(79,70,229,0.2)",
              }}
            >
              {isRunning && <Spinner size={13} />}
              Run Code
            </motion.button>
          </div>

          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1, padding: "16px", background: "#FFFFFF", color: "#0F172A",
              border: "none", outline: "none", resize: "none", fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13, lineHeight: "1.65",
            }}
          />
        </div>
      </div>
    </div>
  );
}
