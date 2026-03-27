// File Upload API - Extracts text content from uploaded files
// Supports: PDF, DOCX, TXT, MD, CSV, XLSX, Images

import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse file based on type
async function parseFile(filepath, mimetype, originalFilename) {
  const ext = path.extname(originalFilename).toLowerCase();

  // Text-based files
  if (['.txt', '.md', '.csv'].includes(ext) || mimetype === 'text/plain' || mimetype === 'text/markdown' || mimetype === 'text/csv') {
    const content = fs.readFileSync(filepath, 'utf-8');
    return { type: 'text', content, filename: originalFilename };
  }

  // PDF files
  if (ext === '.pdf' || mimetype === 'application/pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const dataBuffer = fs.readFileSync(filepath);
      const data = await pdfParse(dataBuffer);
      return { type: 'pdf', content: data.text, filename: originalFilename, pages: data.numpages };
    } catch (err) {
      console.error('PDF parse error:', err);
      return { type: 'pdf', content: '', error: 'Failed to parse PDF', filename: originalFilename };
    }
  }

  // Word documents
  if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const mammoth = (await import('mammoth')).default;
      const dataBuffer = fs.readFileSync(filepath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return { type: 'docx', content: result.value, filename: originalFilename };
    } catch (err) {
      console.error('DOCX parse error:', err);
      return { type: 'docx', content: '', error: 'Failed to parse DOCX', filename: originalFilename };
    }
  }

  // Excel files
  if (ext === '.xlsx' || ext === '.xls' || mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    try {
      const XLSX = (await import('xlsx')).default;
      const dataBuffer = fs.readFileSync(filepath);
      const workbook = XLSX.read(dataBuffer, { type: 'buffer' });

      // Convert all sheets to text
      let content = '';
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        content += `## Sheet: ${sheetName}\n`;
        content += XLSX.utils.sheet_to_csv(sheet);
        content += '\n\n';
      });

      return { type: 'xlsx', content, filename: originalFilename, sheets: workbook.SheetNames };
    } catch (err) {
      console.error('XLSX parse error:', err);
      return { type: 'xlsx', content: '', error: 'Failed to parse Excel file', filename: originalFilename };
    }
  }

  // Images - return as base64 for Claude Vision
  if (mimetype?.startsWith('image/')) {
    const dataBuffer = fs.readFileSync(filepath);
    const base64 = dataBuffer.toString('base64');
    return {
      type: 'image',
      content: base64,
      mimetype,
      filename: originalFilename
    };
  }

  // Unknown file type - try to read as text
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return { type: 'unknown', content, filename: originalFilename };
  } catch {
    return { type: 'unknown', content: '', error: 'Unsupported file type', filename: originalFilename };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Handle single or multiple files
    const uploadedFiles = files.file ? (Array.isArray(files.file) ? files.file : [files.file]) : [];

    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];

    for (const file of uploadedFiles) {
      const result = await parseFile(file.filepath, file.mimetype, file.originalFilename);
      results.push(result);

      // Clean up temp file
      try {
        fs.unlinkSync(file.filepath);
      } catch (e) {
        console.error('Failed to clean up temp file:', e);
      }
    }

    return res.status(200).json({
      success: true,
      files: results
    });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
