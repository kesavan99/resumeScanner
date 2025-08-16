import React from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Paste the job description here..." 
}) => {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
        <p className="text-sm text-gray-600">
          Paste the job description to compare with your resume
        </p>
      </div>

      <textarea
        className="input-field resize-none"
        rows={12}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight: '200px' }}
      />

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Characters: {value.length}</span>
        <span>Words: {value.trim() ? value.trim().split(/\s+/).length : 0}</span>
      </div>
    </div>
  );
};

export default JobDescriptionInput;
