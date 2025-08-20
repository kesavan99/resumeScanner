import React, { useState, useCallback } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ManualResumeInput from './components/ManualResumeInput';
import JobDescriptionInput from './components/JobDescriptionInput';
import MatchPercentageCard from './components/MatchPercentageCard';
import SkillsAnalysis from './components/SkillsAnalysis';
import GeminiAnalysisDisplay from './components/GeminiAnalysisDisplay';
import { ResumeData, MatchResult, GeminiAnalysis } from './types';
import { extractTextFromFile } from './utils/fileExtractor';
import { calculateMatch } from './utils/resumeMatcher';
import { analyzeWithGemini } from './utils/geminiService';
import { DocumentTextIcon, BriefcaseIcon, ChartBarIcon, PencilIcon, SparklesIcon } from '@heroicons/react/24/outline';

function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAnalyzingWithAI, setIsAnalyzingWithAI] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [inputMethod, setInputMethod] = useState<'file' | 'manual'>('file');
  const [manualResumeText, setManualResumeText] = useState<string>('');

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setError('');
    setInputMethod('file');

    try {
      const text = await extractTextFromFile(file);
      setResumeData({
        text,
        fileName: file.name
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setResumeData(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleManualSubmit = useCallback(() => {
    if (!manualResumeText.trim()) {
      setError('Please enter your resume content');
      return;
    }

    setResumeData({
      text: manualResumeText.trim(),
      fileName: 'Manual Entry'
    });
    setSelectedFile(null);
    setInputMethod('manual');
    setError('');
  }, [manualResumeText]);

  const handleAnalyze = useCallback(async () => {
    if (!resumeData || !jobDescription.trim()) {
      setError('Please upload a resume and enter a job description');
      return;
    }

    setIsProcessing(true);
    setIsAnalyzingWithAI(true);
    setError('');

    try {
      // First do basic analysis
      const result = calculateMatch(resumeData.text, jobDescription);
      setMatchResult(result);

      // Then get AI analysis
      const aiAnalysis = await analyzeWithGemini(resumeData.text, jobDescription, result);
      setGeminiAnalysis(aiAnalysis);
    } catch (err) {
      setError('Failed to analyze resume and job description');
    } finally {
      setIsProcessing(false);
      setIsAnalyzingWithAI(false);
    }
  }, [resumeData, jobDescription]);

  const handleReset = useCallback(() => {
    setResumeData(null);
    setJobDescription('');
    setMatchResult(null);
    setGeminiAnalysis(null);
    setSelectedFile(null);
    setError('');
    setManualResumeText('');
    setInputMethod('file');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Resume Matcher</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Compare • Analyze • Improve</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Indicators */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center space-x-8">
              <li className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  resumeData ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                }`}>
                  <DocumentTextIcon className={`w-5 h-5 ${resumeData ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <span className={`ml-2 text-sm font-medium ${resumeData ? 'text-primary-600' : 'text-gray-500'}`}>
                  Upload Resume
                </span>
              </li>
              
              <div className="flex-1 h-0.5 bg-gray-200">
                <div className={`h-full transition-all duration-300 ${
                  resumeData && jobDescription ? 'bg-primary-600 w-full' : 'bg-gray-200 w-0'
                }`}></div>
              </div>
              
              <li className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  jobDescription ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                }`}>
                  <BriefcaseIcon className={`w-5 h-5 ${jobDescription ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <span className={`ml-2 text-sm font-medium ${jobDescription ? 'text-primary-600' : 'text-gray-500'}`}>
                  Job Description
                </span>
              </li>
              
              <div className="flex-1 h-0.5 bg-gray-200">
                <div className={`h-full transition-all duration-300 ${
                  matchResult ? 'bg-primary-600 w-full' : 'bg-gray-200 w-0'
                }`}></div>
              </div>
              
              <li className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  matchResult ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                }`}>
                  <ChartBarIcon className={`w-5 h-5 ${matchResult ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <span className={`ml-2 text-sm font-medium ${matchResult ? 'text-primary-600' : 'text-gray-500'}`}>
                  Analysis
                </span>
              </li>
              
              <div className="flex-1 h-0.5 bg-gray-200">
                <div className={`h-full transition-all duration-300 ${
                  geminiAnalysis ? 'bg-purple-600 w-full' : 'bg-gray-200 w-0'
                }`}></div>
              </div>
              
              <li className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  geminiAnalysis ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                }`}>
                  <SparklesIcon className={`w-5 h-5 ${geminiAnalysis ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <span className={`ml-2 text-sm font-medium ${geminiAnalysis ? 'text-purple-600' : 'text-gray-500'}`}>
                  AI Insights
                </span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            {/* Input Method Toggle */}
            <div className="flex justify-center">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  onClick={() => setInputMethod('file')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                    inputMethod === 'file'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  File Upload
                </button>
                <button
                  onClick={() => setInputMethod('manual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                    inputMethod === 'manual'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Type/Paste
                </button>
              </div>
            </div>

            {/* Resume Input */}
            {inputMethod === 'file' ? (
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                isLoading={isProcessing}
              />
            ) : (
              <ManualResumeInput
                value={manualResumeText}
                onChange={setManualResumeText}
                onSubmit={handleManualSubmit}
              />
            )}
          </div>
          
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handleAnalyze}
            disabled={!resumeData || !jobDescription.trim() || isProcessing || isAnalyzingWithAI}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isAnalyzingWithAI ? 'Getting AI Insights...' : 'Analyzing...'}
              </span>
            ) : (
              <span className="flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Analyze with AI
              </span>
            )}
          </button>
          
          {(resumeData || jobDescription || matchResult || geminiAnalysis) && (
            <button
              onClick={handleReset}
              className="btn-secondary px-8 py-3 text-lg"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results Section */}
        {matchResult && (
          <div className="space-y-8">
            {/* Traditional Analysis */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Analysis Results</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <MatchPercentageCard result={matchResult} />
                </div>
                <div className="lg:col-span-2">
                  <SkillsAnalysis result={matchResult} />
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 mr-2 text-purple-600" />
                AI-Powered Insights
              </h2>
              {isAnalyzingWithAI ? (
                <GeminiAnalysisDisplay analysis={{} as GeminiAnalysis} isLoading={true} />
              ) : geminiAnalysis ? (
                <GeminiAnalysisDisplay analysis={geminiAnalysis} />
              ) : (
                <div className="card text-center py-8">
                  <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">AI analysis will appear here after basic analysis completes.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resume Preview */}
        {resumeData && (
          <div className="mt-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resume Content Preview
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {resumeData.text.substring(0, 2000)}
                  {resumeData.text.length > 2000 && '...'}
                </p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                File: {resumeData.fileName} | Characters: {resumeData.text.length}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
