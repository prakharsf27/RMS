const { extractTextFromFile, parseResumeText, parseJobDescription } = require('../services/resumeParser');
const { analyzeATS, enhanceBullet } = require('../services/atsEngine');
const User = require('../models/User');

// @desc    Parse resume from file upload or pasted text
// @route   POST /api/resume/parse
// @access  Private
exports.parseResume = async (req, res) => {
  try {
    let rawText = req.body.text;

    // If file was uploaded
    if (req.file) {
      rawText = await extractTextFromFile(req.file.path, req.file.originalname);
    }

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({ message: 'Please provide resume text or upload a valid resume file (PDF or DOCX).' });
    }

    const parsed = parseResumeText(rawText);

    // Save resume text and skills to user profile if candidate
    if (req.user && req.user.role === 'candidate') {
      const user = await User.findById(req.user._id);
      if (user) {
        if (parsed.skills?.length > 0) {
          const mergedSkills = Array.from(new Set([...(user.skills || []), ...parsed.skills]));
          user.skills = mergedSkills;
        }
        await user.save();
      }
    }

    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('Parse resume error:', error);
    res.status(500).json({ message: error.message || 'Failed to parse resume' });
  }
};

// @desc    Analyze ATS compatibility against job description
// @route   POST /api/resume/analyze-ats
// @access  Private
exports.analyzeATSCompatibility = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;

    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data is required for ATS analysis.' });
    }

    const jdParsed = jobDescription ? parseJobDescription(jobDescription) : null;
    const analysis = analyzeATS(resumeData, jdParsed);

    res.json({
      success: true,
      analysis,
      jobRole: jdParsed?.role || 'Target Role'
    });
  } catch (error) {
    console.error('ATS analysis error:', error);
    res.status(500).json({ message: error.message || 'ATS analysis failed' });
  }
};

// @desc    Enhance resume bullet point
// @route   POST /api/resume/enhance-bullet
// @access  Private
exports.enhanceResumeBullet = async (req, res) => {
  try {
    const { bullet, targetRole } = req.body;
    if (!bullet || !bullet.trim()) {
      return res.status(400).json({ message: 'Bullet text is required.' });
    }

    const result = enhanceBullet(bullet, targetRole);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tailor resume suggestions for JD without overwriting original
// @route   POST /api/resume/tailor
// @access  Private
exports.tailorResume = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription) {
      return res.status(400).json({ message: 'Both resume data and job description are required for tailoring.' });
    }

    const jdParsed = parseJobDescription(jobDescription);
    const analysis = analyzeATS(resumeData, jdParsed);

    // Generate tailored version suggestions
    const tailoredSummary = `Results-driven ${jdParsed.role} with proven expertise in ${jdParsed.requiredSkills.slice(0, 3).join(', ')}. Experienced in architecting scalable user interfaces and optimizing delivery workflows to accelerate product metrics.`;

    const tailoredSkills = Array.from(new Set([
      ...(resumeData.skills || []),
      ...jdParsed.requiredSkills
    ]));

    res.json({
      success: true,
      original: {
        summary: resumeData.summary,
        skills: resumeData.skills
      },
      suggestions: {
        missingKeywordsToIncorporate: analysis.missingKeywords,
        recommendedSkills: analysis.missingSkills
      },
      tailoredVersion: {
        role: jdParsed.role,
        summary: tailoredSummary,
        skills: tailoredSkills,
        label: "AI-Generated Tailored Draft (Review before saving)"
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
