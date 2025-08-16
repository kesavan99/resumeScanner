import React from 'react';
import { MatchResult } from '../types';

interface MatchPercentageCardProps {
  result: MatchResult;
}

const MatchPercentageCard: React.FC<MatchPercentageCardProps> = ({ result }) => {
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPercentageBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 border-green-200';
    if (percentage >= 60) return 'bg-yellow-100 border-yellow-200';
    if (percentage >= 40) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`card border-2 ${getPercentageBg(result.percentage)}`}>
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${getPercentageColor(result.percentage)} mb-2`}>
          {result.percentage}%
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Match Score</h3>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(result.percentage)}`}
            style={{ width: `${result.percentage}%` }}
          ></div>
        </div>
        
        <p className="text-gray-700 leading-relaxed">{result.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {result.matchedSkills.length}
          </div>
          <div className="text-sm text-gray-600">Skills Matched</div>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {result.missingSkills.length}
          </div>
          <div className="text-sm text-gray-600">Skills Missing</div>
        </div>
      </div>
    </div>
  );
};

export default MatchPercentageCard;
