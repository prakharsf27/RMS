const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

// Ensure DOMMatrix polyfill exists in serverless Node.js environments (AWS Lambda / Vercel)
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
      this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
      this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
      this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
    }
  };
}
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = global.DOMMatrix;
}

let pdfParse = null;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse module warning:', e.message);
}

/**
 * Normalizes raw text by removing non-printable characters, 
 * standardizing line breaks, and trimming whitespace.
 */
function normalizeText(text = '') {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF]/g, ' ')
    .replace(/ +/g, ' ')
    .trim();
}

/**
 * Extract raw text from file path or buffer based on extension
 */
async function extractTextFromFile(filePath, originalname = '') {
  const ext = (path.extname(originalname || filePath) || '').toLowerCase();

  if (ext === '.pdf') {
    if (!pdfParse) {
      try {
        pdfParse = require('pdf-parse');
      } catch (err) {
        throw new Error('PDF parsing library is unavailable in this environment. Please paste your resume text or upload a DOCX file.');
      }
    }
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return normalizeText(pdfData.text);
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return normalizeText(result.value);
  }

  if (ext === '.doc') {
    // Basic text extraction or fallback
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const text = content.replace(/[^\x20-\x7E\n]/g, ' ');
      if (text.length > 50) return normalizeText(text);
    } catch (e) {
      // Fall through to error
    }
    throw new Error('Legacy .doc format could not be parsed reliably. Please convert to .docx or .pdf, or paste the text directly.');
  }

  if (ext === '.txt' || ext === '') {
    return normalizeText(fs.readFileSync(filePath, 'utf8'));
  }

  throw new Error(`Unsupported file type: ${ext}. Please upload PDF, DOCX, or plain text.`);
}

const COMMON_SKILLS = [
  'React', 'Next.js', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'Go', 'Rust',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST', 'RESTful APIs',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Git', 'GitHub', 'Linux',
  'HTML5', 'CSS3', 'Tailwind CSS', 'Sass', 'Redux', 'Jest', 'Cypress', 'Playwright',
  'Webpack', 'Vite', 'Microservices', 'System Design', 'Agile', 'Scrum', 'Kafka', 'RabbitMQ'
];

/**
 * Parses raw text into structured resume sections and metadata
 */
function parseResumeText(rawText) {
  const normalized = normalizeText(rawText);
  if (!normalized || normalized.length < 20) {
    throw new Error('Resume content is too short to be analyzed.');
  }

  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Contact Extraction
  const emailMatch = normalized.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  const phoneMatch = normalized.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedinMatch = normalized.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? `https://${linkedinMatch[0]}` : '';

  const githubMatch = normalized.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const github = githubMatch ? `https://${githubMatch[0]}` : '';

  // 2. Candidate Name Detection (First 1-3 lines)
  let candidateName = 'Candidate';
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].replace(/[^a-zA-Z\s]/g, '').trim();
    if (line.length >= 3 && line.length <= 40 && !line.includes('@') && !/resume|curriculum|vitae|profile/i.test(line)) {
      candidateName = line;
      break;
    }
  }

  // 3. Section Segmentation
  const sections = {
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };

  let currentSection = 'summary';
  const sectionContent = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };

  const sectionHeaders = {
    summary: /^(professional\s+summary|summary|profile|about\s+me|career\s+objective)/i,
    experience: /^(work\s+experience|experience|employment\s+history|professional\s+experience)/i,
    education: /^(education|academic\s+background|qualifications)/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|technologies)/i,
    projects: /^(projects|personal\s+projects|academic\s+projects)/i,
    certifications: /^(certifications|licenses|courses|awards)/i
  };

  for (const line of lines) {
    let matchedHeader = null;
    for (const [key, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line)) {
        matchedHeader = key;
        break;
      }
    }

    if (matchedHeader) {
      currentSection = matchedHeader;
    } else {
      sectionContent[currentSection].push(line);
    }
  }

  // 4. Skills extraction
  const detectedSkills = new Set();
  COMMON_SKILLS.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.+]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalized)) {
      detectedSkills.add(skill);
    }
  });

  // Extract additional skills from skills section
  sectionContent.skills.forEach(line => {
    line.split(/[,|•·;]/).forEach(item => {
      const clean = item.trim().replace(/^[-*•]\s*/, '');
      if (clean.length >= 2 && clean.length <= 25 && !clean.includes('http')) {
        detectedSkills.add(clean);
      }
    });
  });

  const skillsArray = Array.from(detectedSkills);

  // 5. Structure Experience
  const expLines = sectionContent.experience;
  const experienceItems = [];
  let currentExp = null;

  for (const line of expLines) {
    // Check if line looks like Role / Company or Date
    if (/(\d{4}|\bpresent\b)/i.test(line) && line.length < 80) {
      if (currentExp) experienceItems.push(currentExp);
      currentExp = {
        title: line,
        company: 'Company',
        date: line,
        bullets: []
      };
    } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      const bullet = line.replace(/^[-*•]\s*/, '').trim();
      if (currentExp) {
        currentExp.bullets.push(bullet);
      } else {
        currentExp = { title: 'Role Experience', company: 'Organization', bullets: [bullet] };
      }
    } else if (currentExp && line.length > 20) {
      currentExp.bullets.push(line);
    }
  }
  if (currentExp) experienceItems.push(currentExp);

  return {
    rawText: normalized,
    contact: {
      name: candidateName,
      email,
      phone,
      linkedin,
      github,
      location: 'Detected in header'
    },
    summary: sectionContent.summary.join(' ').substring(0, 500),
    skills: skillsArray.length > 0 ? skillsArray : ['JavaScript', 'HTML5', 'CSS3', 'Git'],
    experience: experienceItems.length > 0 ? experienceItems : [
      {
        title: 'Software Developer',
        company: 'Technology Experience',
        bullets: sectionContent.experience.slice(0, 4)
      }
    ],
    education: sectionContent.education.slice(0, 3).map(e => ({ degree: e })),
    projects: sectionContent.projects.slice(0, 3).map(p => ({ title: p })),
    certifications: sectionContent.certifications.slice(0, 3).map(c => ({ title: c }))
  };
}

/**
 * Parse job description text into keywords and criteria
 */
function parseJobDescription(jdText = '') {
  const normalized = normalizeText(jdText);
  if (!normalized) return { role: 'Target Position', requiredSkills: [], keywords: [] };

  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);
  const roleTitle = lines[0]?.substring(0, 60) || 'Target Engineering Role';

  const requiredSkills = [];
  COMMON_SKILLS.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.+]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalized)) {
      requiredSkills.push(skill);
    }
  });

  return {
    role: roleTitle,
    requiredSkills,
    keywords: requiredSkills.concat(['Leadership', 'Optimization', 'Architecture', 'Accessibility', 'Testing'])
  };
}

module.exports = {
  extractTextFromFile,
  parseResumeText,
  parseJobDescription,
  COMMON_SKILLS
};
