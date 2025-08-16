import React from 'react';

interface ManualResumeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const ManualResumeInput: React.FC<ManualResumeInputProps> = ({ 
  value, 
  onChange, 
  onSubmit 
}) => {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Resume Entry</h3>
        <p className="text-sm text-gray-600">
          Having trouble with file upload? Copy and paste your resume content here:
        </p>
      </div>

      <textarea
        className="input-field resize-none"
        rows={15}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your resume content here...

Include:
• Your name and contact information
• Professional summary
• Technical skills (programming languages, frameworks, tools)
• Work experience with specific technologies used
• Education and certifications
• Notable projects and achievements

Example:
John Doe, Software Engineer
Skills: JavaScript, React, Node.js, Python, AWS, Docker
Experience: 5 years developing web applications..."
        style={{ minHeight: '300px' }}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Characters: {value.length} | Words: {value.trim() ? value.trim().split(/\s+/).length : 0}
        </div>
        
        {value.trim().length > 50 && (
          <button
            onClick={onSubmit}
            className="btn-primary text-sm px-4 py-2"
          >
            Use This Text
          </button>
        )}
      </div>
    </div>
  );
};

export default ManualResumeInput;
