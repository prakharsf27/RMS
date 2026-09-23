/**
 * Central notification navigation mapper for TalentFlow AI.
 * Maps notifications to the correct application routes based on user role and content context.
 */

export function getNotificationRoute(notification, userRole = 'candidate') {
  if (!notification) return { path: '/dashboard', label: 'View Dashboard' };

  // Explicit route if present on the notification object
  if (notification.targetRoute || notification.route) {
    return {
      path: notification.targetRoute || notification.route,
      label: notification.actionLabel || 'View Details'
    };
  }

  const type = (notification.type || notification.entityType || '').toLowerCase();
  const subject = (notification.subject || '').toLowerCase();
  const message = (notification.message || '').toLowerCase();
  const fullText = `${subject} ${message} ${type}`;
  const entityId = notification.entityId || notification.relatedId || notification.jobId || notification.candidateId;

  // ─── 1. Admin Role Mapping ───
  if (userRole === 'admin') {
    if (fullText.includes('verification') || fullText.includes('verify') || fullText.includes('bypass') || fullText.includes('credential')) {
      return { path: '/verification', label: 'Review Verification Queue' };
    }
    if (fullText.includes('audit') || fullText.includes('security') || fullText.includes('breach') || fullText.includes('event')) {
      return { path: '/audit', label: 'View Security Audit Logs' };
    }
    if (fullText.includes('user') || fullText.includes('registered') || fullText.includes('member') || fullText.includes('account')) {
      return { path: '/candidates', label: 'Manage Users' };
    }
    if (fullText.includes('job') || fullText.includes('listing') || fullText.includes('opening')) {
      return { path: '/jobs', label: 'Platform Jobs' };
    }
    if (fullText.includes('report') || fullText.includes('analytic') || fullText.includes('metric')) {
      return { path: '/reports', label: 'Platform Reports' };
    }
    if (fullText.includes('message') || fullText.includes('chat')) {
      return { path: '/messages', label: 'Open Messages' };
    }
  }

  // ─── 2. Recruiter Role Mapping ───
  if (userRole === 'recruiter') {
    if (fullText.includes('application') || fullText.includes('applied') || fullText.includes('pipeline') || fullText.includes('funnel')) {
      return {
        path: entityId ? `/applications?appId=${entityId}` : '/applications',
        label: 'View in Pipeline'
      };
    }
    if (fullText.includes('candidate') || fullText.includes('applicant') || fullText.includes('profile')) {
      return {
        path: entityId ? `/candidates?candidateId=${entityId}` : '/candidates',
        label: 'View Candidate'
      };
    }
    if (fullText.includes('interview') || fullText.includes('schedule') || fullText.includes('round') || fullText.includes('meeting')) {
      return {
        path: entityId ? `/interviews?interviewId=${entityId}` : '/interviews',
        label: 'Interview Schedule'
      };
    }
    if (fullText.includes('message') || fullText.includes('chat') || fullText.includes('conversation')) {
      return {
        path: entityId ? `/messages?recipientId=${entityId}` : '/messages',
        label: 'Open Conversation'
      };
    }
    if (fullText.includes('job') || fullText.includes('listing') || fullText.includes('opening') || fullText.includes('post')) {
      return {
        path: entityId ? `/jobs?jobId=${entityId}` : '/jobs',
        label: 'Job Postings'
      };
    }
    if (fullText.includes('company') || fullText.includes('verified') || fullText.includes('profile')) {
      return { path: '/company', label: 'Company Profile' };
    }
    if (fullText.includes('report') || fullText.includes('analytic') || fullText.includes('metric')) {
      return { path: '/reports', label: 'Hiring Analytics' };
    }
  }

  // ─── 3. Candidate Role Mapping ───
  if (fullText.includes('interview') || fullText.includes('schedule') || fullText.includes('meeting') || fullText.includes('round')) {
    return {
      path: entityId ? `/interviews?interviewId=${entityId}` : '/interviews',
      label: 'My Interviews'
    };
  }
  if (fullText.includes('application') || fullText.includes('applied') || fullText.includes('status') || fullText.includes('stage') || fullText.includes('offer') || fullText.includes('hired') || fullText.includes('screening')) {
    return {
      path: entityId ? `/applications?appId=${entityId}` : '/applications',
      label: 'Application Tracker'
    };
  }
  if (fullText.includes('message') || fullText.includes('recruiter') || fullText.includes('chat')) {
    return {
      path: entityId ? `/messages?recipientId=${entityId}` : '/messages',
      label: 'Open Messages'
    };
  }
  if (fullText.includes('resume') || fullText.includes('bullet') || fullText.includes('score')) {
    return { path: '/resume-ai', label: 'Resume AI Studio' };
  }
  if (fullText.includes('ats') || fullText.includes('checker') || fullText.includes('keyword')) {
    return { path: '/recruiter-inbox', label: 'ATS Simulator' };
  }
  if (fullText.includes('mock') || fullText.includes('practice') || fullText.includes('simulator')) {
    return { path: '/interview-simulator', label: 'Mock Interview' };
  }
  if (fullText.includes('career') || fullText.includes('roadmap') || fullText.includes('path') || fullText.includes('growth')) {
    return { path: '/career-path', label: 'Career Path' };
  }
  if (fullText.includes('job') || fullText.includes('match') || fullText.includes('opening') || fullText.includes('position')) {
    return {
      path: entityId ? `/jobs?jobId=${entityId}` : '/jobs',
      label: 'Browse Matching Jobs'
    };
  }

  // ─── Default Fallback ───
  return { path: '/dashboard', label: 'View Dashboard' };
}
