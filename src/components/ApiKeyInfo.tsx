import React from 'react';
import { InformationCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const ApiKeyInfo: React.FC = () => {
  const hasApiKey = process.env.REACT_APP_GEMINI_API_KEY && 
                    process.env.REACT_APP_GEMINI_API_KEY !== 'AIzaSyB43E1KSsOh9tjtVPYELhAseTW67dlMuro';

  if (hasApiKey) {
    return null; // Don't show if API key is configured
  }

  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Using Demo Mode
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            You're currently using mock AI analysis. To get real AI insights powered by Google Gemini:
          </p>
          <ol className="text-sm text-blue-700 space-y-1 mb-3">
            <li>1. Get a free API key from Google AI Studio</li>
            <li>2. Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in the project root</li>
            <li>3. Add: <code className="bg-blue-100 px-1 rounded">REACT_APP_GEMINI_API_KEY=your_key</code></li>
            <li>4. Restart the development server</li>
          </ol>
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Get API Key
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInfo;
