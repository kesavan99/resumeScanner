export interface ResumeData {
  text: string;
  fileName: string;
}

export interface JobDescription {
  text: string;
}

export interface MatchResult {
  percentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  summary: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
  matched: string[];
  missing: string[];
}

export interface GeminiAnalysis {
  overallAssessment: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  matchScore: number;
  keyInsights: string;
  careerAdvice: string;
}
