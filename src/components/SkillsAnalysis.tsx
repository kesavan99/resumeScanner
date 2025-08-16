import React from 'react';
import { MatchResult } from '../types';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { categorizeSkills } from '../utils/resumeMatcher';

interface SkillsAnalysisProps {
  result: MatchResult;
}

const SkillsAnalysis: React.FC<SkillsAnalysisProps> = ({ result }) => {
  const skillCategories = categorizeSkills(result.matchedSkills, result.missingSkills);

  const SkillBadge: React.FC<{ skill: string; type: 'matched' | 'missing' }> = ({ skill, type }) => (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        type === 'matched'
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}
    >
      {type === 'matched' ? (
        <CheckCircleIcon className="w-4 h-4 mr-1" />
      ) : (
        <XCircleIcon className="w-4 h-4 mr-1" />
      )}
      {skill}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Skills Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          Skills Analysis
        </h3>
        
        {skillCategories.length > 0 ? (
          <div className="space-y-6">
            {skillCategories.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{category.category}</h4>
                
                {category.matched.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-green-800 mb-2">
                      ✓ Matched Skills ({category.matched.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {category.matched.map((skill, skillIndex) => (
                        <SkillBadge key={skillIndex} skill={skill} type="matched" />
                      ))}
                    </div>
                  </div>
                )}
                
                {category.missing.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-red-800 mb-2">
                      ✗ Missing Skills ({category.missing.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {category.missing.map((skill, skillIndex) => (
                        <SkillBadge key={skillIndex} skill={skill} type="missing" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No categorized skills found. Try uploading a resume and job description.</p>
          </div>
        )}
      </div>

      {/* All Skills Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="card">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            All Matched Skills ({result.matchedSkills.length})
          </h3>
          
          {result.matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.matchedSkills.map((skill, index) => (
                <SkillBadge key={index} skill={skill} type="matched" />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No matched skills found.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="card">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <XCircleIcon className="w-5 h-5 mr-2" />
            Missing Skills ({result.missingSkills.length})
          </h3>
          
          {result.missingSkills.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill, index) => (
                  <SkillBadge key={index} skill={skill} type="missing" />
                ))}
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Consider adding these skills to your resume or highlighting 
                  relevant experience that demonstrates these capabilities.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 italic">Great! No missing skills identified.</p>
          )}
        </div>
      </div>

      {/* Additional Keywords */}
      {(result.matchedKeywords.length > 0 || result.missingKeywords.length > 0) && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Keywords</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.matchedKeywords.length > 0 && (
              <div>
                <h4 className="font-medium text-green-800 mb-3">
                  Matched Keywords ({result.matchedKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {result.missingKeywords.slice(0, 10).length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-3">
                  Important Missing Keywords (Top 10)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.slice(0, 10).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsAnalysis;
