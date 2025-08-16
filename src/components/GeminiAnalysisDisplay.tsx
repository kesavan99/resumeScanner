import React from 'react';
import { GeminiAnalysis } from '../types';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

interface GeminiAnalysisDisplayProps {
  analysis: GeminiAnalysis;
  isLoading?: boolean;
}

const GeminiAnalysisDisplay: React.FC<GeminiAnalysisDisplayProps> = ({ 
  analysis, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <div className="flex items-center">
              <SparklesIcon className="w-5 h-5 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Gemini AI is analyzing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-purple-50">
        <div className="flex items-center mb-4">
          <SparklesIcon className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">AI-Powered Analysis</h2>
          <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
            Powered by Gemini AI
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Overall Assessment</h3>
            <p className="text-gray-700 leading-relaxed">{analysis.overallAssessment}</p>
          </div>
          
          <div className={`text-center p-4 rounded-lg border ${getScoreBg(analysis.matchScore)}`}>
            <div className={`text-3xl font-bold ${getScoreColor(analysis.matchScore)} mb-1`}>
              {analysis.matchScore}%
            </div>
            <div className="text-sm text-gray-600">AI Match Score</div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
          Key Insights
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 leading-relaxed">{analysis.keyInsights}</p>
        </div>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Your Strengths
          </h3>
          
          {analysis.strengths.length > 0 ? (
            <div className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                  <p className="text-gray-700">{strength}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No specific strengths identified.</p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="card">
          <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            Areas for Improvement
          </h3>
          
          {analysis.improvements.length > 0 ? (
            <div className="space-y-3">
              {analysis.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3"></div>
                  <p className="text-gray-700">{improvement}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No major improvements needed.</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
          Actionable Recommendations
        </h3>
        
        <div className="space-y-4">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold flex items-center justify-center mr-3">
                  {index + 1}
                </span>
                <p className="text-gray-800">{recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Advice */}
      <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
          <BookOpenIcon className="w-5 h-5 mr-2" />
          Career Advice
        </h3>
        <div className="bg-white/50 rounded-lg p-4">
          <p className="text-purple-800 leading-relaxed">{analysis.careerAdvice}</p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-gray-500 py-4">
        <p>
          ✨ This analysis is generated by AI and should be used as guidance. 
          Always review recommendations in the context of your specific situation.
        </p>
      </div>
    </div>
  );
};

export default GeminiAnalysisDisplay;
