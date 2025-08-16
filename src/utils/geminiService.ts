import { GoogleGenerativeAI } from '@google/generative-ai';

// You'll need to get this API key from https://makersuite.google.com/app/apikey
// For demo purposes, we'll use a placeholder - users need to add their own key
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

const genAI = new GoogleGenerativeAI(API_KEY);

export interface GeminiAnalysis {
  overallAssessment: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  matchScore: number;
  keyInsights: string;
  careerAdvice: string;
}

export const analyzeWithGemini = async (
  resumeText: string, 
  jobDescription: string,
  basicMatchResult: any
): Promise<GeminiAnalysis> => {
  try {
    if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      // Return a mock analysis for demo purposes
      return getMockAnalysis(basicMatchResult);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Please analyze this resume against the job description and provide detailed insights:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

BASIC MATCH ANALYSIS:
- Match Percentage: ${basicMatchResult.percentage}%
- Matched Skills: ${basicMatchResult.matchedSkills.join(', ')}
- Missing Skills: ${basicMatchResult.missingSkills.join(', ')}

Please provide a detailed analysis in the following JSON format:
{
  "overallAssessment": "A comprehensive assessment of the candidate's fit for this role",
  "strengths": ["List of candidate's key strengths relevant to this position"],
  "improvements": ["Specific areas where the candidate should improve"],
  "recommendations": ["Actionable recommendations to improve the application"],
  "matchScore": number between 0-100 representing overall fit,
  "keyInsights": "Most important insights about this match",
  "careerAdvice": "Specific career advice for this candidate"
}

Focus on:
1. Technical skill alignment
2. Experience relevance
3. Career progression
4. Specific gaps and how to address them
5. Tailoring suggestions for this specific role

Provide actionable, specific advice rather than generic statements.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Try to parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return analysis;
      }
      
      // If JSON parsing fails, create structured response from text
      return parseTextResponse(text, basicMatchResult);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return parseTextResponse(text, basicMatchResult);
    }
  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    // Return mock analysis if API call fails
    return getMockAnalysis(basicMatchResult);
  }
};

const getMockAnalysis = (basicMatchResult: any): GeminiAnalysis => {
  return {
    overallAssessment: `Based on the analysis, this candidate shows a ${basicMatchResult.percentage}% match with the job requirements. ${
      basicMatchResult.percentage >= 80 
        ? "This is an excellent fit with strong technical alignment." 
        : basicMatchResult.percentage >= 60
        ? "This is a good match with some areas for improvement."
        : "This candidate has potential but needs significant skill development."
    }`,
    strengths: basicMatchResult.matchedSkills.length > 0 
      ? [
          `Strong foundation in ${basicMatchResult.matchedSkills.slice(0, 3).join(', ')}`,
          "Demonstrates technical competency in core areas",
          "Shows relevant experience in the technology stack"
        ]
      : ["Candidate shows potential for growth", "Good foundational knowledge", "Willingness to learn new technologies"],
    improvements: basicMatchResult.missingSkills.length > 0
      ? [
          `Need to develop skills in ${basicMatchResult.missingSkills.slice(0, 3).join(', ')}`,
          "Should focus on gaining experience with required technologies",
          "Consider taking courses or building projects in missing skill areas"
        ]
      : ["Continue building expertise in current skills", "Stay updated with industry trends"],
    recommendations: [
      "Tailor resume to highlight relevant experience more prominently",
      "Add specific projects or achievements related to the job requirements",
      "Consider adding metrics and quantifiable results to experience descriptions",
      "Optimize resume keywords to match job description terminology"
    ],
    matchScore: basicMatchResult.percentage,
    keyInsights: `The main gap is in ${basicMatchResult.missingSkills.length > 0 ? basicMatchResult.missingSkills[0] : 'advanced skills'}. Focus on building practical experience through projects or certifications.`,
    careerAdvice: "Focus on building a portfolio that demonstrates practical application of the required skills. Consider contributing to open source projects or building personal projects that showcase your abilities."
  };
};

const parseTextResponse = (text: string, basicMatchResult: any): GeminiAnalysis => {
  // Simple text parsing fallback
  const lines = text.split('\n').filter(line => line.trim());
  
  return {
    overallAssessment: lines[0] || "Analysis completed based on resume and job description match.",
    strengths: ["Technical skills alignment", "Relevant experience", "Professional background"],
    improvements: basicMatchResult.missingSkills.slice(0, 3),
    recommendations: [
      "Update resume with more relevant keywords",
      "Highlight achievements with metrics",
      "Focus on missing skills development"
    ],
    matchScore: basicMatchResult.percentage,
    keyInsights: lines.find(line => line.includes('insight') || line.includes('key')) || "Continue developing technical skills",
    careerAdvice: lines.find(line => line.includes('advice') || line.includes('recommend')) || "Focus on continuous learning and skill development"
  };
};
