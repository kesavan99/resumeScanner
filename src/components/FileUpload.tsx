import React, { useCallback } from 'react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, isLoading }) => {
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const getSupportedFormats = () => {
    return '.pdf,.doc,.docx,.txt';
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resume</h3>
        <p className="text-sm text-gray-600 mb-2">
          Upload your resume in PDF, DOC, DOCX, or TXT format
        </p>
        <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2">
          <strong>💡 Best Results:</strong> Use Word (.docx) or text (.txt) files for most accurate text extraction. 
          PDF files may have variable results depending on format.
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isLoading 
            ? 'border-gray-200 bg-gray-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {selectedFile ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">
              ✓ {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              Size: {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              Drag and drop your resume here, or{' '}
              <label className="text-primary-600 hover:text-primary-700 cursor-pointer font-medium">
                browse files
                <input
                  type="file"
                  className="hidden"
                  accept={getSupportedFormats()}
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">
              Supports PDF, DOC, DOCX, TXT (Max 10MB)
            </p>
          </div>
        )}

        {isLoading && (
          <div className="mt-4">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-sm text-gray-600">Processing file...</span>
            </div>
          </div>
        )}
      </div>

      {selectedFile && !isLoading && (
        <button
          onClick={() => onFileSelect(selectedFile)}
          className="mt-4 btn-secondary w-full"
        >
          Change File
        </button>
      )}
    </div>
  );
};

export default FileUpload;
