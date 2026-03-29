const DB_PREFIX = "rms_mock_";

const get = (key) => {
  try {
    const data = localStorage.getItem(DB_PREFIX + key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const set = (key, value) => {
  localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
};

// Initial seed data
const initDB = () => {
  if (get("initialized")) return;

  const demoUsers = [
    {
      id: "u1",
      fname: "Admin",
      lname: "User",
      email: "admin@rms.com",
      password: "password123",
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Admin+User&background=60a5fa&color=fff",
    },
    {
      id: "u3",
      fname: "Jane",
      lname: "Recruiter",
      email: "recruiter@rms.com",
      password: "password123",
      role: "recruiter",
      avatar: "https://ui-avatars.com/api/?name=Jane+Recruiter&background=fbbf24&color=fff",
    },
    {
      id: "u4",
      fname: "Alice",
      lname: "Candidate",
      email: "candidate@rms.com",
      password: "password123",
      role: "candidate",
      avatar: "https://ui-avatars.com/api/?name=Alice+Candidate&background=f87171&color=fff",
    },
  ];

  const demoJobs = [
    {
      id: "j1",
      title: "Senior Frontend Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-Time",
      salary: "$120k - $150k",
      status: "active",
      description: "We are looking for an experienced React developer.",
      applicants: 12,
      createdAt: new Date().toISOString(),
    },
    {
      id: "j2",
      title: "Product Designer",
      department: "Design",
      location: "San Francisco, CA",
      type: "Full-Time",
      salary: "$100k - $130k",
      status: "active",
      description: "Create beautiful, user-centric designs for our core product.",
      applicants: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: "j3",
      title: "Marketing Intern",
      department: "Marketing",
      location: "New York, NY",
      type: "Internship",
      salary: "$25/hr",
      status: "closed",
      description: "Support our marketing campaigns and social media presence.",
      applicants: 24,
      createdAt: new Date(Date.now() - 864000000).toISOString(),
    },
  ];

  set("users", demoUsers);
  set("jobs", demoJobs);
  set("applications", []);
  set("interviews", []);
  set("audit", []);
  set("notifications", []);
  set("blocked_ids", []);
  set("pending_recruiters", []);
  set("initialized", true);
};

export const api = {
  initDB,
  // Auth
  login: (email, password) => {
    const users = get("users") || [];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) throw new Error("Invalid credentials");
    
    const blockedIds = get("blocked_ids") || [];
    if (blockedIds.includes(user.id)) throw new Error("Account suspended. Contact support.");
    
    if (user.role === "recruiter") {
        const pending = get("pending_recruiters") || [];
        if (pending.includes(user.id)) throw new Error("Recruiter account pending admin approval.");
    }
    
    return user;
  },
  register: (userData) => {
    const users = get("users") || [];
    if (users.find(u => u.email === userData.email)) {
       throw new Error("Email already in use");
    }
    const newUser = {
      ...userData,
      id: "u" + Date.now().toString(),
      avatar: `https://ui-avatars.com/api/?name=${userData.fname}+${userData.lname}&background=random`,
    };
    if (userData.role === "recruiter") {
        const pending = get("pending_recruiters") || [];
        set("pending_recruiters", [...pending, newUser.id]);
    }
    set("users", [...users, newUser]);
    return newUser;
  },
  
  // Jobs
  getJobs: () => get("jobs") || [],
  createJob: (job) => {
    const jobs = get("jobs") || [];
    const newJob = { ...job, id: "j" + Date.now(), applicants: 0, createdAt: new Date().toISOString() };
    set("jobs", [newJob, ...jobs]);
    return newJob;
  },
  updateJob: (id, updates) => {
    const jobs = get("jobs") || [];
    const updated = jobs.map((j) => (j.id === id ? { ...j, ...updates } : j));
    set("jobs", updated);
  },
  deleteJob: (id) => {
    const jobs = get("jobs") || [];
    set("jobs", jobs.filter(j => j.id !== id));
  },

  // Applications
  getApplications: () => get("applications") || [],
  applyForJob: (jobId, candidateId) => {
    const apps = get("applications") || [];
    const newApp = {
      id: "a" + Date.now(),
      jobId,
      candidateId,
      status: "applied", // applied, screened, interviewing, offered, rejected
      appliedAt: new Date().toISOString()
    };
    set("applications", [newApp, ...apps]);
    return newApp;
  },
  updateApplicationStatus: (id, status, updaterId) => {
    const apps = get("applications") || [];
    const updated = apps.map(a => a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a);
    set("applications", updated);
    
    // Auto-create notification if status changed to offered or rejected
    const app = apps.find(a => a.id === id);
    if (app && (status === "offered" || status === "rejected")) {
        const jobs = get("jobs") || [];
        const job = jobs.find(j => j.id === app.jobId);
        const subject = status === "offered" ? "You have been Hired!" : "Update on your application";
        const message = status === "offered" 
            ? `Congratulations! You have been hired for the ${job?.title || 'Job Posting'} role.`
            : `Thank you for your interest in the ${job?.title || 'Job Posting'} role. At this time, we will not be moving forward.`;
        
        api.createNotification(app.candidateId, message, subject, "System");
    }
  },
  deleteApplication: (id) => {
    const apps = get("applications") || [];
    set("applications", apps.filter(a => a.id !== id));
  },

  // Notifications
  getNotifications: (userId) => {
    const all = get("notifications") || [];
    return all.filter(n => n.userId === userId);
  },
  createNotification: (userId, message, subject, sender) => {
    const all = get("notifications") || [];
    const newNote = {
        id: "n" + Date.now(),
        userId,
        message,
        subject,
        sender,
        read: false,
        timestamp: new Date().toISOString()
    };
    set("notifications", [newNote, ...all]);
    return newNote;
  },
  markNotificationRead: (id) => {
    const all = get("notifications") || [];
    set("notifications", all.map(n => n.id === id ? { ...n, read: true } : n));
  },

  // Users Admin
  getUsers: () => get("users") || [],
  blockUser: (id) => {
    const blocked = get("blocked_ids") || [];
    if (!blocked.includes(id)) {
        set("blocked_ids", [...blocked, id]);
    }
  },
  unblockUser: (id) => {
    const blocked = get("blocked_ids") || [];
    set("blocked_ids", blocked.filter(bid => bid !== id));
  },
  isUserBlocked: (id) => {
    const blocked = get("blocked_ids") || [];
    return blocked.includes(id);
  },
  getPendingRecruiters: () => {
    const users = get("users") || [];
    const pending = get("pending_recruiters") || [];
    return users.filter(u => pending.includes(u.id));
  },
  approveRecruiter: (id) => {
    const pending = get("pending_recruiters") || [];
    set("pending_recruiters", pending.filter(pid => pid !== id));
  },
  rejectRecruiter: (id) => {
    const pending = get("pending_recruiters") || [];
    set("pending_recruiters", pending.filter(pid => pid !== id));
    api.deleteUser(id);
  },
  deleteUser: (id) => {
    const users = get("users") || [];
    set("users", users.filter(u => u.id !== id));
  },

  // Interviews
  getInterviews: () => get("interviews") || [],
  scheduleInterview: (data) => {
    const all = get("interviews") || [];
    const newInt = {
        ...data,
        id: "i" + Date.now(),
        status: "scheduled",
        createdAt: new Date().toISOString()
    };
    set("interviews", [newInt, ...all]);
    
    // Notify candidate
    api.createNotification(
        data.candidateId, 
        `You have a new interview scheduled for the ${data.jobTitle} position.`,
        "Interview Scheduled",
        "TalentFlow System"
    );
    
    return newInt;
  },
  updateInterviewStatus: (id, status, feedback) => {
    const all = get("interviews") || [];
    set("interviews", all.map(i => i.id === id ? { ...i, status, feedback: feedback || i.feedback } : i));
  },

  // Company
  getCompany: (recruiterId) => {
    const companies = get("companies") || [];
    return companies.find(c => c.recruiterId === recruiterId) || {
        name: "Untitled Organization",
        industry: "IT Services",
        website: "",
        email: "",
        size: "1-10",
        location: "Remote",
        description: "Add a description to attract top talent."
    };
  },
  updateCompany: (recruiterId, data) => {
    const companies = get("companies") || [];
    const index = companies.findIndex(c => c.recruiterId === recruiterId);
    if (index > -1) {
        companies[index] = { ...companies[index], ...data };
    } else {
        companies.push({ ...data, recruiterId });
    }
    set("companies", companies);
  },

  // Audit
  getAuditLogs: () => get("audit") || [],
  logAction: (userId, action, details) => {
    const logs = get("audit") || [];
    const newLog = {
      id: "log" + Date.now(),
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    set("audit", [newLog, ...logs]);
  }
};
