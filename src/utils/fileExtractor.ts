import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with a stable version and local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

// Function to clean up extracted text that might have spacing issues
const cleanExtractedText = (text: string): string => {
  // Check if text has spacing issues (every character separated by space)
  const hasSpacingIssues = text.includes(' e ') || text.includes(' a ') || text.includes(' i ');
  
  if (hasSpacingIssues) {
    console.log('DEBUG: Detected text with spacing issues, attempting to fix...');
    // Remove single character words followed by spaces (common in broken PDF extraction)
    let cleaned = text.replace(/\s+([a-z])\s+/gi, '$1');
    // Remove excessive spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    console.log('DEBUG: Cleaned text preview:', cleaned.substring(0, 200));
    return cleaned;
  }
  
  return text;
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      
      fullText += pageText + ' ';
    }

    const cleanText = fullText.trim();
    
    console.log('DEBUG: PDF extraction successful');
    console.log('DEBUG: Raw extracted text length:', cleanText.length);
    console.log('DEBUG: Raw first 500 chars:', cleanText.substring(0, 500));
    
    // Clean up the extracted text
    const finalText = cleanExtractedText(cleanText);
    
    console.log('DEBUG: Final cleaned text length:', finalText.length);
    console.log('DEBUG: Final first 500 chars:', finalText.substring(0, 500));
    
    if (!finalText || finalText.length < 50) {
      throw new Error('Unable to extract sufficient text from PDF. The PDF might be image-based or protected.');
    }
    
    return finalText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    // Provide a helpful fallback message
    const fallbackText = `PDF Processing Note: ${file.name}

We encountered an issue extracting text from your PDF file. This could be because:
- The PDF contains images instead of selectable text
- The PDF has security restrictions
- The file format is not compatible

For the best experience, please:
1. Use a Word document (.docx) or text file (.txt) instead, OR
2. Copy the text content from your PDF and paste it below:

COMMON RESUME CONTENT TO INCLUDE:
- Name and contact information
- Professional summary
- Technical skills (JavaScript, Python, React, Node.js, AWS, etc.)
- Work experience with specific technologies used
- Education and certifications
- Notable projects and achievements

You can paste this information in the text area below for analysis.`;
    
    return fallbackText;
  }
};

export const extractTextFromDOC = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length < 10) {
      throw new Error('Document appears to be empty or unreadable');
    }
    
    return result.value.trim();
  } catch (error) {
    console.error('DOC extraction error:', error);
    throw new Error('Failed to extract text from Word document. Please ensure the file is not corrupted and try again.');
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword' ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc')
  ) {
    return extractTextFromDOC(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return file.text();
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.');
  }
};
