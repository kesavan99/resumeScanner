"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, Trash2, Download, Clipboard, ChevronRight, Target, CheckCircle2, XCircle, Loader2, Search } from "lucide-react";
// If you plan to render charts, install recharts: npm i recharts
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";


/**
 * Next.js Resume Scanner — Frontend Only
 * -------------------------------------------------------------
 * Features
 * - Drag & drop or paste resume text
 * - Optional: load PDF text using pdfjs-dist (dynamic import) — see loadPdfText()
 * - Paste job description; click "Scan" to get:
 *    - Match Score
 *    - Matched vs Missing Keywords
 *    - Simple contact info extraction
 *    - Word count & reading time
 *    - A radar chart of competency coverage
 * - Export results as JSON
 *
 * Notes
 * - This is a pure client-side UX. Hook up your API by replacing `analyze()` with a fetch to your backend.
 * - Keep the predefined keyword bank or replace with your own per-role data.
 */

const DEFAULT_KEYWORDS = {
    "Core": ["communication", "leadership", "problem solving", "teamwork", "agile", "scrum", "mentoring"],
    "DevOps": ["aws", "azure", "gcp", "kubernetes", "docker", "terraform", "ansible", "jenkins", "gitlab ci", "github actions", "cicd", "linux", "bash"],
    "Observability": ["prometheus", "grafana", "elk", "opentelemetry", "datadog", "splunk", "new relic"],
    "Backend": ["node", "python", "java", "go", "microservices", "rest", "graphql", "sql", "postgres", "mysql", "mongodb"],
    "Frontend": ["react", "next", "typescript", "javascript", "redux", "tailwind", "html", "css"],
    "Security": ["iam", "cognito", "oauth", "okta", "sso", "owasp", "threat modeling"]
};

const SAMPLE_RESUME = `Thilipan T\nEmail: thilipan@example.com | Phone: +91 98765 43210\nDevOps Engineer with 6+ years building CI/CD on AWS. Experienced with Kubernetes, Docker, Terraform, Jenkins, GitHub Actions, Prometheus and Grafana. Automated infra as code and observability dashboards. Worked with Node, Python and PostgreSQL. Led a team of 4 in Agile environments.`;

const SAMPLE_JD = `We are hiring a Senior DevOps Engineer to drive CI/CD and cloud automation.\nMust have: Kubernetes, Docker, Terraform, AWS, Linux, Git, Prometheus/Grafana.\nNice to have: Python, Jenkins/GitHub Actions, PostgreSQL, Observability, Security best practices.`;

function tokenize(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9+.#\-\s/]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

function estimateReadingTime(words: number) {
    // ~200 wpm baseline
    return Math.max(1, Math.round(words / 200));
}

export async function loadPdfText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
}



function scoreResume(tokens: string[], jdTokens: string[], bank = DEFAULT_KEYWORDS) {
    const tokenSet = new Set(tokens);
    const jdSet = new Set(jdTokens);

    // Build keyword index
    const groups = Object.entries(bank).map(([group, keys]) => {
        const normalized = keys.map(k => k.toLowerCase());
        const matched = normalized.filter(k =>
            k.includes(" ") ? jdTokens.join(" ").includes(k) || tokens.join(" ").includes(k) : tokenSet.has(k)
        );
        const present = normalized.filter(k =>
            k.includes(" ") ? tokens.join(" ").includes(k) : tokenSet.has(k)
        );
        const requiredInJD = normalized.filter(k =>
            k.includes(" ") ? jdTokens.join(" ").includes(k) : jdSet.has(k)
        );
        const requiredMissing = requiredInJD.filter(k => !present.includes(k));

        const coverage = Math.round((present.length / normalized.length) * 100);
        const demand = Math.max(10, Math.min(100, requiredInJD.length * 12));
        const score = Math.round((coverage * 0.7 + (present.filter(k => requiredInJD.includes(k)).length / (requiredInJD.length || 1)) * 100 * 0.3));

        return { group, present: unique(present), requiredInJD: unique(requiredInJD), requiredMissing: unique(requiredMissing), coverage, demand, score };
    });

    // Global score (weighted by demand)
    const totalDemand = groups.reduce((s, g) => s + g.demand, 0) || 1;
    const weighted = Math.round(groups.reduce((s, g) => s + (g.score * g.demand), 0) / totalDemand);

    // Missing (top 10 by JD demand across groups)
    const missing = unique(groups.flatMap(g => g.requiredMissing)).slice(0, 20);
    const matched = unique(groups.flatMap(g => g.present));

    return { groups, weighted, matched, missing };
}

function CircularScore({ value }: { value: number }) {
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
        <svg viewBox="0 0 140 140" className="w-36 h-36">
            <circle cx="70" cy="70" r={radius} strokeWidth="12" className="fill-none stroke-slate-200" />
            <circle
                cx="70"
                cy="70"
                r={radius}
                strokeWidth="12"
                className="fill-none stroke-current text-blue-600"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
            />
            <text x="70" y="78" textAnchor="middle" className="font-bold text-2xl fill-slate-800">{value}%</text>
        </svg>
    );
}

const DropZone: React.FC<{ onText: (t: string) => void } & React.HTMLAttributes<HTMLDivElement>> = ({ onText, className }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || !files.length) return;
        const file = files[0];
        const ext = file.name.toLowerCase().split(".").pop();

        try {
            let text = "";
            if (ext === "pdf") {
                text = await loadPdfText(file);
            } else if (ext === "docx") {
                // Use mammoth to extract text from .docx files
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                text = result.value;
            } else if (["txt", "md", "csv", "log"].includes(ext || "")) {
                text = await file.text();
            } else {
                alert("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
                return; // Exit if the file type is not supported
            }
            onText(text);
        } catch (e) {
            console.error("Error parsing file:", e);
            alert("Failed to read the file. It might be corrupted or in an unsupported format.");
        }
    }, [onText]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50 transition ${className || ""}`}
            onClick={() => inputRef.current?.click()}
        >
            <input ref={inputRef} type="file" accept=".pdf,.txt,.md,.csv,.log,.docx" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-slate-500" />
                <p className="font-medium">Drag & drop a resume (PDF/TXT) or click to browse</p>
                <p className="text-sm text-slate-500">For DOCX, paste text or connect a backend parser</p>
            </div>
        </div>
    );
};

export default function ResumeScannerPage() {
    const [resumeText, setResumeText] = useState<string>(SAMPLE_RESUME);
    const [jdText, setJdText] = useState<string>(SAMPLE_JD);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<null | ReturnType<typeof scoreResume>>(null);

    const resumeTokens = useMemo(() => tokenize(resumeText), [resumeText]);
    const jdTokens = useMemo(() => tokenize(jdText), [jdText]);

    const words = resumeTokens.length;
    const minutes = estimateReadingTime(words);
    const emails = useMemo(() => Array.from(new Set((resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []))), [resumeText]);
    const phones = useMemo(() => Array.from(new Set((resumeText.match(/\+?\d[\d \-()]{7,}\d/g) || []).map(p => p.trim()))), [resumeText]);
    const years = useMemo(() => Array.from(new Set((resumeText.match(/(\d+\+?)\s*(?:years|yrs)/gi) || []))), [resumeText]);

    const analyze = useCallback(async () => {
        setIsScanning(true);
        try {
            // If you have a backend, swap this with an API call and setResult(await resp.json())
            const r = scoreResume(resumeTokens, jdTokens, DEFAULT_KEYWORDS);
            await new Promise(res => setTimeout(res, 500)); // tiny UX delay
            setResult(r);
        } finally {
            setIsScanning(false);
        }
    }, [resumeTokens, jdTokens]);

    const exportJson = useCallback(() => {
        if (!result) return;
        const blob = new Blob([JSON.stringify({
            score: result.weighted,
            matched: result.matched,
            missing: result.missing,
            groups: result.groups
        }, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume-scan.json";
        a.click();
        URL.revokeObjectURL(url);
    }, [result]);

    const clearAll = () => {
        setResumeText("");
        setJdText("");
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
            <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <h1 className="text-xl font-semibold">Resume Scanner</h1>
                    <span className="ml-auto text-sm text-slate-500 hidden md:inline">Client-only demo • Next.js + Tailwind</span>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Inputs */}
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-slate-500" />
                            <h2 className="font-semibold">Resume</h2>
                            <button className="ml-auto text-xs px-2 py-1 rounded-full border" onClick={() => setResumeText(SAMPLE_RESUME)}>Load sample</button>
                        </div>
                        <DropZone onText={setResumeText} className="mb-4" />
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste resume text here…"
                            className="w-full h-48 md:h-64 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1"><Search className="w-4 h-4" /> {words} words</span>
                            <span>• ~{minutes} min read</span>
                            {emails.length > 0 && <span>• {emails[0]}</span>}
                            {phones.length > 0 && <span>• {phones[0]}</span>}
                            {years.length > 0 && <span>• {years[0].toLowerCase()}</span>}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-5 h-5 text-slate-500" />
                            <h2 className="font-semibold">Job Description</h2>
                            <button className="ml-auto text-xs px-2 py-1 rounded-full border" onClick={() => setJdText(SAMPLE_JD)}>Load sample</button>
                        </div>
                        <textarea
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste job description here…"
                            className="w-full h-48 md:h-64 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={analyze}
                                disabled={isScanning || !resumeText.trim() || !jdText.trim()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Scan
                            </button>
                            <button onClick={clearAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-slate-50"><Trash2 className="w-4 h-4" /> Clear</button>
                            {result && <button onClick={exportJson} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-slate-50"><Download className="w-4 h-4" /> Export JSON</button>}
                            <a
                                href="https://ui.shadcn.com/" target="_blank" rel="noreferrer"
                                className="ml-auto text-xs text-slate-500 hover:underline"
                            >Design with shadcn/ui (optional)</a>
                        </div>
                    </motion.div>
                </div>

                {/* Results */}
                {result && (
                    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Overall Match</h3>
                                {result.weighted >= 70 ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-amber-500" />}
                            </div>
                            <div className="flex items-center justify-center my-4">
                                <CircularScore value={result.weighted} />
                            </div>
                            <ul className="text-sm text-slate-600 space-y-1">
                                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Matched keywords: <span className="ml-auto font-medium">{result.matched.length}</span></li>
                                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Missing keywords: <span className="ml-auto font-medium">{result.missing.length}</span></li>
                            </ul>

                            <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Competency Coverage</h4>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={result.groups.map(g => ({ group: g.group, coverage: g.coverage }))}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="group" />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                            <RechartsTooltip />
                                            <Radar name="Coverage" dataKey="coverage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="font-semibold mb-3">Top Matches</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.matched.slice(0, 40).map((k) => (
                                        <span key={k} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-sm">
                                            <CheckCircle2 className="w-4 h-4" /> {k}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="font-semibold mb-3">Gaps to Address</h3>
                                {result.missing.length === 0 ? (
                                    <p className="text-sm text-slate-600">No obvious gaps vs the JD — great fit!</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {result.missing.map((k) => (
                                            <span key={k} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm">
                                                <XCircle className="w-4 h-4" /> {k}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm p-6 grid md:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2">Contact & Signals</h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Emails: <span className="ml-auto">{emails.slice(0, 2).join(", ") || "—"}</span></li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Phones: <span className="ml-auto">{phones.slice(0, 2).join(", ") || "—"}</span></li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Experience mentions: <span className="ml-auto">{years.slice(0, 3).join(", ") || "—"}</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Readability</h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Word count <span className="ml-auto font-medium">{words}</span></li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Est. reading time <span className="ml-auto font-medium">{minutes} min</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Tips</h4>
                                    <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                                        <li>Mirror must-have keywords from the JD in your resume summary.</li>
                                        <li>Use action verbs and quantify impact (%, $, time saved).</li>
                                        <li>Keep it concise; target 1–2 pages for most roles.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="font-semibold mb-3">Group Breakdown</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {result.groups.map(g => (
                                        <div key={g.group} className="border rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold">{g.group}</span>
                                                <span className="ml-auto text-sm text-slate-500">Coverage: {g.coverage}%</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {g.present.map(k => (
                                                    <span key={k} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs">{k}</span>
                                                ))}
                                                {g.present.length === 0 && <span className="text-xs text-slate-500">No matches found</span>}
                                            </div>
                                            {g.requiredMissing.length > 0 && (
                                                <div className="mt-1">
                                                    <div className="text-xs text-slate-500 mb-1">Missing vs JD:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {g.requiredMissing.map(k => (
                                                            <span key={k} className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">{k}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Footer */}
                <div className="mt-10 text-center text-xs text-slate-400">
                    Built with Next.js + Tailwind. Replace client-side analyze() with your API for production-grade parsing & scoring.
                </div>
            </main>
        </div>
    );
}
