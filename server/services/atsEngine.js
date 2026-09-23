const { COMMON_SKILLS } = require('./resumeParser');

/**
 * Deterministic ATS Scoring and Analysis Engine
 */
function analyzeATS(parsedResume, jobDescriptionParsed = null) {
  const { contact, summary, skills = [], experience = [], education = [], rawText = '' } = parsedResume;

  // 1. Contact & Structure (Weight: 10%)
  let contactScore = 0;
  if (contact?.email) contactScore += 35;
  if (contact?.phone) contactScore += 30;
  if (contact?.name && contact.name !== 'Candidate') contactScore += 20;
  if (contact?.linkedin || contact?.github) contactScore += 15;
  contactScore = Math.min(100, contactScore);

  // 2. Format & Section Compatibility (Weight: 10%)
  let formatScore = 40; // Base parseable text
  if (summary && summary.length > 30) formatScore += 15;
  if (experience && experience.length > 0) formatScore += 20;
  if (education && education.length > 0) formatScore += 15;
  if (skills && skills.length >= 3) formatScore += 10;
  formatScore = Math.min(100, formatScore);

  // 3. Keywords & Skills Coverage (Weights: 30% keywords, 20% skills)
  const targetSkills = jobDescriptionParsed?.requiredSkills?.length > 0
    ? jobDescriptionParsed.requiredSkills
    : ['React', 'TypeScript', 'Next.js', 'Node.js', 'RESTful APIs', 'Git', 'Testing'];

  const lowerSkills = skills.map(s => s.toLowerCase());
  const matchedSkills = [];
  const missingSkills = [];

  targetSkills.forEach(req => {
    if (lowerSkills.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const skillsMatchRatio = targetSkills.length > 0 ? (matchedSkills.length / targetSkills.length) : 0.8;
  const skillsScore = Math.round(Math.min(100, Math.max(30, skillsMatchRatio * 100)));

  // Keywords Coverage (30%)
  const targetKeywords = jobDescriptionParsed?.keywords || targetSkills;
  const lowerText = rawText.toLowerCase();
  const matchedKeywords = targetKeywords.filter(k => lowerText.includes(k.toLowerCase()));
  const missingKeywords = targetKeywords.filter(k => !lowerText.includes(k.toLowerCase())).slice(0, 6);
  const keywordScore = Math.round(Math.min(100, Math.max(35, (matchedKeywords.length / Math.max(1, targetKeywords.length)) * 100)));

  // 4. Experience Relevance (Weight: 20%)
  let expScore = 50;
  let metricCount = 0;
  let actionVerbCount = 0;
  const actionVerbs = ['architected', 'optimized', 'engineered', 'spearheaded', 'delivered', 'designed', 'built', 'reduced', 'increased', 'led'];

  experience.forEach(exp => {
    (exp.bullets || []).forEach(b => {
      if (/\d+[%kKmM]?/i.test(b)) metricCount++;
      if (actionVerbs.some(v => b.toLowerCase().includes(v))) actionVerbCount++;
    });
  });

  expScore += Math.min(25, metricCount * 8);
  expScore += Math.min(25, actionVerbCount * 6);
  const experienceScore = Math.min(100, expScore);

  // 5. Other Relevance (Education/Certifications, Weight: 10%)
  let otherScore = 50;
  if (education.length > 0) otherScore += 30;
  if (parsedResume.certifications?.length > 0) otherScore += 20;
  otherScore = Math.min(100, otherScore);

  // Weighted Total Overall Score
  const overallScore = Math.round(
    (contactScore * 0.10) +
    (formatScore * 0.10) +
    (keywordScore * 0.30) +
    (skillsScore * 0.20) +
    (experienceScore * 0.20) +
    (otherScore * 0.10)
  );

  // Formatting warnings
  const formattingWarnings = [];
  if (!contact?.phone) formattingWarnings.push("No contact phone number detected in header.");
  if (!contact?.linkedin) formattingWarnings.push("LinkedIn profile URL missing; modern recruiters favor direct verified profiles.");
  if (metricCount < 2) formattingWarnings.push("Bullet points lack quantifiable metrics (e.g. percentages, delivery times, scale numbers).");

  // Strengths
  const strengths = [];
  if (matchedSkills.length >= 3) strengths.push(`Verified coverage of core required competencies: ${matchedSkills.slice(0, 3).join(', ')}.`);
  if (metricCount >= 2) strengths.push("Strong inclusion of quantifiable business and technical metrics in role descriptions.");
  if (formatScore >= 80) strengths.push("Clean section hierarchy categorized without encoding artifacts.");

  // Improvements
  const improvements = [];
  if (missingSkills.length > 0) improvements.push(`Incorporate high-priority missing skills: ${missingSkills.slice(0, 3).join(', ')}.`);
  if (metricCount < 3) improvements.push("Enhance experience bullets using the Action Verb + Metric + Business Outcome formula.");
  if (!summary || summary.length < 50) improvements.push("Add a targeted 2–3 sentence professional summary tailored to the target role.");

  return {
    overallScore,
    contactScore,
    formatScore,
    keywordScore,
    skillsScore,
    experienceScore,
    otherScore,
    matchedSkills,
    missingSkills,
    missingKeywords,
    formattingWarnings,
    strengths,
    improvements
  };
}

/**
 * Deterministic Bullet Enhancer
 * Takes an original bullet and transforms it into an impact-oriented formulation
 */
function enhanceBullet(originalBullet, targetRole = 'Software Engineer') {
  const bullet = originalBullet.trim();
  const lower = bullet.toLowerCase();

  // If already high metric
  if (/\d+%/i.test(bullet) && /architected|engineered|spearheaded/i.test(bullet)) {
    return {
      original: bullet,
      enhanced: bullet,
      metric: "High Metric Density",
      verb: "Engineered",
      explanation: "This bullet already uses strong active verbs and measurable outcomes."
    };
  }

  let enhanced = bullet;
  let verb = "Engineered";
  let metric = "+35% Performance Gain";

  if (lower.includes('bug') || lower.includes('fix') || lower.includes('component') || lower.includes('ui')) {
    verb = "Architected";
    metric = "+42% Velocity & -28% Bug Rate";
    enhanced = `Architected reusable component systems and modernized UI workflows, reducing regression defects by 28% and accelerating sprint delivery velocity by 42%.`;
  } else if (lower.includes('api') || lower.includes('backend') || lower.includes('database') || lower.includes('server')) {
    verb = "Optimized";
    metric = "<50ms Latency & 450k Queries";
    enhanced = `Engineered resilient RESTful endpoints and optimized database query execution, reducing P99 API latency below 50ms across high-throughput services.`;
  } else if (lower.includes('test') || lower.includes('qa') || lower.includes('coverage')) {
    verb = "Implemented";
    metric = "88% Test Coverage";
    enhanced = `Implemented comprehensive end-to-end automated testing suites, elevating production release stability and test coverage to 88%.`;
  } else {
    verb = "Spearheaded";
    metric = "+30% Operational Efficiency";
    enhanced = `Spearheaded delivery of core engineering initiatives, improving cross-functional system efficiency and reliability by 30%.`;
  }

  return {
    original: bullet,
    enhanced,
    metric,
    verb,
    explanation: "Enhanced using the Google XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]."
  };
}

module.exports = {
  analyzeATS,
  enhanceBullet
};
