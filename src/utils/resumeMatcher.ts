import { MatchResult, SkillCategory } from '../types';

// Common technical skills and keywords
const TECHNICAL_SKILLS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
  'scala', 'r', 'matlab', 'sql', 'html', 'css', 'sass', 'less',
  
  // Frameworks & Libraries
  'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js', 'express', 'nestjs', 'django', 'flask',
  'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'material-ui',
  
  // Databases
  'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'cassandra',
  'dynamodb', 'firebase', 'supabase',
  
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions', 'terraform',
  'ansible', 'nginx', 'apache', 'linux', 'ubuntu', 'centos',
  
  // Tools & Technologies
  'git', 'webpack', 'vite', 'babel', 'eslint', 'prettier', 'jest', 'cypress', 'selenium', 'postman',
  'figma', 'sketch', 'photoshop', 'illustrator',
  
  // Soft Skills
  'leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking', 'project management',
  'agile', 'scrum', 'kanban', 'mentoring', 'collaboration'
];

const SKILL_CATEGORIES: { [key: string]: string[] } = {
  'Programming Languages': [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'
  ],
  'Frontend Technologies': [
    'react', 'angular', 'vue', 'html', 'css', 'sass', 'bootstrap', 'tailwind', 'jquery', 'webpack', 'vite'
  ],
  'Backend Technologies': [
    'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net', 'nestjs'
  ],
  'Databases': [
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'firebase'
  ],
  'Cloud & DevOps': [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'linux', 'nginx'
  ],
  'Testing & Quality': [
    'jest', 'cypress', 'selenium', 'unit testing', 'integration testing', 'test driven development'
  ]
};

export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const extractSkills = (text: string): string[] => {
  const normalizedText = normalizeText(text);
  console.log('DEBUG: Normalized text for skill extraction:', normalizedText.substring(0, 300));
  
  const words = normalizedText.split(' ');
  const phrases: string[] = [];
  
  // Extract single words and common phrases
  for (let i = 0; i < words.length; i++) {
    phrases.push(words[i]);
    if (i < words.length - 1) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }
    if (i < words.length - 2) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }
  
  const foundSkills = TECHNICAL_SKILLS.filter(skill => {
    const normalizedSkill = normalizeText(skill);
    
    // Skip very short skills that can cause false positives
    if (normalizedSkill.length <= 1) {
      return false;
    }
    
    const isFound = phrases.some(phrase => {
      // For short skills (2-3 chars), require exact word match
      if (normalizedSkill.length <= 3) {
        // Split by spaces and check if any word exactly matches
        const words = phrase.split(' ');
        return words.includes(normalizedSkill);
      }
      
      // For longer skills, allow partial matches
      // Exact match
      if (phrase === normalizedSkill) return true;
      
      // Contains match (but be more careful with short matches)
      if (phrase.includes(normalizedSkill) && normalizedSkill.length > 3) return true;
      if (normalizedSkill.includes(phrase) && phrase.length > 3) return true;
      
      return false;
    });
    
    if (isFound) {
      console.log(`DEBUG: Found skill "${skill}" in text`);
    }
    
    return isFound;
  });
  
  console.log('DEBUG: All found skills:', foundSkills);
  return Array.from(new Set(foundSkills));
};

export const calculateMatch = (resumeText: string, jobDescriptionText: string): MatchResult => {
  console.log('DEBUG: Full resume text length:', resumeText.length);
  console.log('DEBUG: Resume text preview (first 500 chars):', resumeText.substring(0, 500));
  console.log('DEBUG: Job description text length:', jobDescriptionText.length);
  console.log('DEBUG: Job description preview (first 300 chars):', jobDescriptionText.substring(0, 300));
  
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescriptionText);
  
  console.log('DEBUG: Resume skills found:', resumeSkills);
  console.log('DEBUG: Job skills found:', jobSkills);
  
  if (jobSkills.length === 0) {
    return {
      percentage: 0,
      matchedSkills: [],
      missingSkills: [],
      matchedKeywords: [],
      missingKeywords: [],
      summary: 'No skills found in job description'
    };
  }
  
  const matchedSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
  const missingSkills = jobSkills.filter(skill => !resumeSkills.includes(skill));
  
  console.log('DEBUG: Matched skills:', matchedSkills);
  console.log('DEBUG: Missing skills:', missingSkills);
  console.log('DEBUG: Calculation:', matchedSkills.length, '/', jobSkills.length);
  
  // Calculate keywords beyond technical skills
  const resumeWords = normalizeText(resumeText).split(' ');
  const jobWords = normalizeText(jobDescriptionText).split(' ')
    .filter(word => word.length > 3); // Filter out short words
  
  const matchedKeywords = resumeWords.filter(word => jobWords.includes(word));
  const missingKeywords = jobWords
    .filter(word => !resumeWords.includes(word))
    .slice(0, 10); // Limit to top 10 missing keywords
  
  // Calculate percentage based on skills match
  const percentage = Math.round((matchedSkills.length / jobSkills.length) * 100);
  
  console.log('DEBUG: Final percentage:', percentage);
  
  let summary = '';
  if (percentage >= 80) {
    summary = 'Excellent match! Your resume aligns very well with the job requirements.';
  } else if (percentage >= 60) {
    summary = 'Good match! Consider highlighting more relevant skills from the job description.';
  } else if (percentage >= 40) {
    summary = 'Fair match. Focus on developing or highlighting the missing skills.';
  } else {
    summary = 'Limited match. Consider gaining experience in the required skills.';
  }
  
  return {
    percentage,
    matchedSkills,
    missingSkills,
    matchedKeywords: Array.from(new Set(matchedKeywords)).slice(0, 10),
    missingKeywords: Array.from(new Set(missingKeywords)),
    summary
  };
};

export const categorizeSkills = (matchedSkills: string[], missingSkills: string[]): SkillCategory[] => {
  return Object.entries(SKILL_CATEGORIES).map(([category, categorySkills]) => {
    const matched = matchedSkills.filter(skill => 
      categorySkills.some(catSkill => 
        normalizeText(skill).includes(normalizeText(catSkill)) ||
        normalizeText(catSkill).includes(normalizeText(skill))
      )
    );
    
    const missing = missingSkills.filter(skill => 
      categorySkills.some(catSkill => 
        normalizeText(skill).includes(normalizeText(catSkill)) ||
        normalizeText(catSkill).includes(normalizeText(skill))
      )
    );
    
    return {
      category,
      skills: categorySkills,
      matched,
      missing
    };
  }).filter(category => category.matched.length > 0 || category.missing.length > 0);
};
