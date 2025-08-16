# Resume Matcher

A modern web application to analyze and compare resumes against job descriptions, providing both traditional and AI-powered insights. Built with React, TypeScript, and Tailwind CSS.

## Features
- **Resume Upload**: Supports PDF, DOC, DOCX, and TXT files. Manual text input is also available.
- **Job Description Input**: Paste or type job descriptions for comparison.
- **Skill & Keyword Matching**: Extracts and matches technical and soft skills, highlights missing and matched skills.
- **AI-Powered Analysis**: Integrates with Google Gemini AI for advanced, actionable feedback and career advice.
- **Visual Reports**: Match percentage, categorized skills, and keyword analysis with a clean, responsive UI.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm start
   ```
3. **(Optional) Enable Gemini AI:**
   - Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env` file in the project root:
     ```
     REACT_APP_GEMINI_API_KEY=your_key_here
     ```
   - Restart the dev server.

## Usage
- Upload your resume or paste it manually.
- Paste the job description.
- Click **Analyze with AI** to get both traditional and AI-powered feedback.
- Review matched/missing skills, keywords, and actionable recommendations.

## Project Structure
```
resumeScanner/
├── public/                # Static assets (HTML, icons, sample files)
├── src/
│   ├── components/        # UI components (FileUpload, SkillsAnalysis, etc.)
│   ├── utils/             # Core logic (file extraction, skill matching, AI service)
│   ├── types/             # TypeScript types/interfaces
│   ├── App.tsx            # Main app logic and state
│   └── ...
├── tailwind.config.js     # Tailwind CSS config
├── package.json           # Dependencies and scripts
└── README.md
```

## Main Logic
- **File Extraction**: `src/utils/fileExtractor.ts` handles extracting text from PDF, DOC, and TXT files, with fallbacks for problematic files.
- **Skill Matching**: `src/utils/resumeMatcher.ts` normalizes and extracts skills/keywords, calculates match percentage, and categorizes skills.
- **AI Analysis**: `src/utils/geminiService.ts` sends resume and job description to Gemini AI for advanced analysis and recommendations.
- **UI Flow**: `src/App.tsx` manages state, user input, and orchestrates analysis steps. Components display results and feedback.

## Scripts
- `npm start` – Start development server
- `npm run build` – Build for production
- `npm test` – Run tests

## Requirements
- Node.js 16+
- npm 8+

## License
MIT
