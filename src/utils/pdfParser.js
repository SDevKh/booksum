import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Use local worker bundled by Vite instead of fetching from external CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts pages from a PDF file client-side.
 * Limits parsing to the first 100 pages to prevent memory issues and huge payloads.
 * @returns {Promise<string[]>} Array of text content for each page
 */
export const extractPagesFromPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const pages = [];
    const numPages = Math.min(pdf.numPages, 100); // limit to 100 pages
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      pages.push(pageText.trim());
    }
    
    return pages;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract pages from PDF: ' + error.message);
  }
};

/**
 * Splits plain text content into pages of approximately 350 words.
 * @param {string} text - Raw text content
 * @returns {string[]} Array of page texts
 */
export const extractPagesFromTxt = (text) => {
  if (!text) return [];
  const words = text.split(/\s+/);
  const wordsPerPage = 350;
  const pages = [];
  
  for (let i = 0; i < words.length; i += wordsPerPage) {
    const pageText = words.slice(i, i + wordsPerPage).join(' ');
    pages.push(pageText.trim());
  }
  
  return pages;
};
