require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment.');
  process.exit(1);
}

// Models
const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Interview = require('./models/Interview');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');

const seed = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB!\n');

    console.log('🗑️  Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    console.log('✅ Cleared old data.\n');

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('🌱 Seeding verified users...');
    // Seed standard scenario users
    const [adminUser, recruiterSarah, candidateAarav, candidateAnanya, candidateRahul, candidatePriya, recruiterMarcus, recruiterElena, recruiterDavid] = await User.insertMany([
      // Admin
      {
        fname: 'Alexander',
        lname: 'Vance',
        email: 'admin@rms.com',
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'Platform Operations Director at TalentFlow AI.',
        status: 'active',
        isDemoAccount: true,
        emailVerified: true,
        onboardingCompleted: true,
        profileCompletion: 100
      },
      // Primary Demo Recruiter (Sarah Jenkins at TalentFlow Technologies)
      {
        fname: 'Sarah',
        lname: 'Jenkins',
        email: 'recruiter@rms.com',
        password: hashedPassword,
        role: 'recruiter',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        bio: 'Lead Technical Talent Partner at TalentFlow Technologies. Specializing in high-growth engineering teams.',
        status: 'active',
        isDemoAccount: true,
        emailVerified: true,
        onboardingCompleted: true,
        profileCompletion: 100
      },
      // Primary Demo Candidate (Aarav Sharma)
      {
        fname: 'Aarav',
        lname: 'Sharma',
        email: 'candidate@rms.com',
        password: hashedPassword,
        role: 'candidate',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isDemoAccount: true,
        emailVerified: true,
        onboardingCompleted: true,
        profileCompletion: 100,
        bio: 'Senior Frontend Engineer passionate about React 19, TypeScript, and high-performance design systems.',
        professionalHeadline: 'Senior Frontend Engineer | React, TypeScript, Next.js',
        careerObjective: 'To architect scalable, accessible, and delightful web applications in an AI-first product ecosystem.',
        skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'GraphQL', 'Jest', 'System Design'],
        experienceLevel: 'experienced',
        yearsOfExperience: 6,
        phone: '+1 (555) 234-5678',
        address: 'San Francisco, CA',
        state: 'California',
        nationality: 'United States',
        links: {
          linkedin: 'https://linkedin.com/in/aaravsharma-demo',
          github: 'https://github.com/aaravsharma-demo',
          portfolio: 'https://aaravsharma.dev'
        },
        workExperience: [
          {
            title: 'Senior Frontend Engineer',
            company: 'Veloce Labs',
            location: 'San Francisco, CA',
            startDate: new Date('2022-03-01'),
            current: true,
            description: 'Spearheaded migration of legacy core product to Next.js 14, improving Largest Contentful Paint (LCP) by 42%. Built company-wide design system used across 6 web applications.'
          },
          {
            title: 'Frontend Developer',
            company: 'Elevate Cloud',
            location: 'Austin, TX',
            startDate: new Date('2019-06-01'),
            endDate: new Date('2022-02-28'),
            current: false,
            description: 'Developed real-time analytics dashboards with WebSocket pipelines. Reduced bundle sizes by 35% through dynamic code-splitting.'
          }
        ],
        education: [
          {
            degree: 'B.S. in Computer Science',
            institution: 'University of California, Berkeley',
            startYear: '2015',
            endYear: '2019',
            grade: '3.8 GPA'
          }
        ],
        status: 'active'
      },
      // Additional Fictional Candidates
      {
        fname: 'Ananya',
        lname: 'Mehta',
        email: 'ananya.mehta@example.com',
        password: hashedPassword,
        role: 'candidate',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        professionalHeadline: 'Full Stack Engineer | Node.js, React, PostgreSQL',
        skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'TypeScript'],
        yearsOfExperience: 4,
        status: 'active'
      },
      {
        fname: 'Rahul',
        lname: 'Verma',
        email: 'rahul.verma@example.com',
        password: hashedPassword,
        role: 'candidate',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        professionalHeadline: 'AI/ML Engineer | PyTorch, LLMs, Vector Search',
        skills: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'Vector DBs', 'Kubernetes'],
        yearsOfExperience: 5,
        status: 'active'
      },
      {
        fname: 'Priya',
        lname: 'Singh',
        email: 'priya.singh@example.com',
        password: hashedPassword,
        role: 'candidate',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        professionalHeadline: 'Lead Product Designer | Design Systems & SaaS UX',
        skills: ['Figma', 'Design Systems', 'UX Research', 'Rapid Prototyping', 'Accessibility'],
        yearsOfExperience: 4,
        status: 'active'
      },
      // Other Recruiters
      {
        fname: 'Marcus',
        lname: 'Chen',
        email: 'marcus@novasystems.com',
        password: hashedPassword,
        role: 'recruiter',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        fname: 'Elena',
        lname: 'Rostova',
        email: 'elena@vertexlabs.ai',
        password: hashedPassword,
        role: 'recruiter',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        fname: 'David',
        lname: 'Miller',
        email: 'david@apexcloud.io',
        password: hashedPassword,
        role: 'recruiter',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      }
    ]);

    console.log('🌱 Seeding enterprise companies...');
    const [cTalentFlow, cNova, cVertex, cApex] = await Company.insertMany([
      {
        name: 'TalentFlow Technologies',
        description: 'Next-generation AI-powered recruitment orchestration platform connecting exceptional talent with category-defining companies.',
        industry: 'Enterprise Software & AI',
        location: 'San Francisco, CA',
        website: 'https://talentflow.ai',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        cinOrGst: 'US-DEL-984210',
        country: 'United States',
        isVerified: true,
        recruiterId: recruiterSarah._id
      },
      {
        name: 'Nova Systems',
        description: 'Zero-trust infrastructure and cloud observability runtime for distributed enterprise applications.',
        industry: 'Cloud Infrastructure & Security',
        location: 'New York, NY',
        website: 'https://novasystems.io',
        logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
        cinOrGst: 'US-NY-442189',
        country: 'United States',
        isVerified: true,
        recruiterId: recruiterMarcus._id
      },
      {
        name: 'Vertex Labs',
        description: 'Pioneering multimodal foundation models and synthetic data generation for enterprise autonomy.',
        industry: 'Artificial Intelligence',
        location: 'Seattle, WA',
        website: 'https://vertexlabs.ai',
        logo: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=100&auto=format&fit=crop&q=80',
        cinOrGst: 'US-WA-881290',
        country: 'United States',
        isVerified: true,
        recruiterId: recruiterElena._id
      },
      {
        name: 'Apex Cloud',
        description: 'Ultra-low latency serverless edge compute platform built on WebAssembly and Rust.',
        industry: 'Edge Computing & Systems',
        location: 'Austin, TX',
        website: 'https://apexcloud.dev',
        logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
        cinOrGst: 'US-TX-331908',
        country: 'United States',
        isVerified: false, // For admin verification demo
        recruiterId: recruiterDavid._id
      }
    ]);

    console.log('🌱 Seeding job postings...');
    const [jobFrontend, jobFullstack, jobBackend, jobAIML, jobDesigner] = await Job.insertMany([
      {
        title: 'Senior Frontend Engineer',
        department: 'Product Engineering',
        location: 'San Francisco, CA (Hybrid / Remote)',
        type: 'Full-Time',
        salary: '$145,000 - $175,000',
        description: 'We are seeking an experienced Frontend Engineer to build intuitive, lightning-fast interfaces for TalentFlow AI. You will collaborate closely with product design and AI infrastructure teams to create state-of-the-art candidate and recruiter experiences.',
        requirements: ['React 19 / Next.js', 'TypeScript', 'Modern CSS & Design Systems', 'Web Performance Optimization', 'REST & GraphQL APIs'],
        recruiterId: recruiterSarah._id,
        status: 'active',
        applicantsCount: 18
      },
      {
        title: 'Full Stack Developer',
        department: 'Core Platform',
        location: 'New York, NY (Hybrid)',
        type: 'Full-Time',
        salary: '$130,000 - $160,000',
        description: 'Join Nova Systems to develop highly resilient security policy management portals and cloud APIs. You will own features end-to-end across our Node.js backends and modern React frontends.',
        requirements: ['React', 'Node.js / Express', 'PostgreSQL', 'Docker', 'Cloud Infrastructure'],
        recruiterId: recruiterMarcus._id,
        status: 'active',
        applicantsCount: 14
      },
      {
        title: 'Backend Engineer (Distributed Systems)',
        department: 'Platform Architecture',
        location: 'Austin, TX (Remote)',
        type: 'Full-Time',
        salary: '$150,000 - $185,000',
        description: 'Design and implement high-throughput distributed microservices for the Apex Cloud edge network. Focus on concurrency, zero-copy networking, and fault tolerance.',
        requirements: ['Go or Rust', 'Distributed Systems', 'gRPC / Protocol Buffers', 'Kubernetes', 'Redis / Kafka'],
        recruiterId: recruiterDavid._id,
        status: 'active',
        applicantsCount: 11
      },
      {
        title: 'AI/ML Engineer',
        department: 'Foundation AI',
        location: 'Seattle, WA (Remote)',
        type: 'Full-Time',
        salary: '$165,000 - $200,000',
        description: 'Build production inference pipelines and fine-tune domain-specific LLMs for recruitment intelligence and candidate evaluation.',
        requirements: ['Python', 'PyTorch', 'LLMs / Fine-tuning', 'Vector Databases', 'FastAPI'],
        recruiterId: recruiterElena._id,
        company: cVertex._id,
        status: 'active',
        applicantsCount: 22
      },
      {
        title: 'Lead Product Designer',
        department: 'Design & UX',
        location: 'San Francisco, CA (Remote)',
        type: 'Full-Time',
        salary: '$135,000 - $165,000',
        description: 'Shape the visual language, design systems, and end-to-end product design for our B2B SaaS workflow tools.',
        requirements: ['Design Systems', 'Figma', 'Prototyping', 'User Research', 'Enterprise SaaS Experience'],
        recruiterId: recruiterSarah._id,
        company: cTalentFlow._id,
        status: 'active',
        applicantsCount: 9
      }
    ]);

    console.log('🌱 Seeding coherent applications...');
    // Seed real applications that connect Candidate and Recruiter dashboards
    const [appAarav, appAnanya, appRahul, appPriya] = await Application.insertMany([
      {
        jobId: jobFrontend._id,
        candidateId: candidateAarav._id,
        status: 'interviewing', // Candidate Aarav is currently interviewing with Sarah!
        matchScore: 94,
        appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        jobId: jobFullstack._id,
        candidateId: candidateAnanya._id,
        status: 'screened',
        matchScore: 89,
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        jobId: jobAIML._id,
        candidateId: candidateRahul._id,
        status: 'applied',
        matchScore: 96,
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        jobId: jobDesigner._id,
        candidateId: candidatePriya._id,
        status: 'offered',
        matchScore: 92,
        appliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('🌱 Seeding scheduled interviews...');
    await Interview.insertMany([
      {
        applicationId: appAarav._id,
        candidateId: candidateAarav._id,
        recruiterId: recruiterSarah._id,
        jobTitle: 'Senior Frontend Engineer',
        candidateName: 'Aarav Sharma',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '14:00',
        type: 'virtual',
        location: 'https://meet.talentflow.ai/tf-sfe-aarav',
        notes: 'Round 2 Technical Architecture Deep Dive with Engineering Lead.',
        status: 'scheduled',
        feedback: 'Candidate demonstrated exceptional clarity on React performance and component decoupling in screening.'
      },
      {
        applicationId: appPriya._id,
        candidateId: candidatePriya._id,
        recruiterId: recruiterSarah._id,
        jobTitle: 'Lead Product Designer',
        candidateName: 'Priya Singh',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        time: '11:00',
        type: 'virtual',
        location: 'https://meet.talentflow.ai/tf-des-priya',
        notes: 'Final Executive Presentation.',
        status: 'completed',
        feedback: 'Outstanding portfolio walkthrough. Offer extended.'
      }
    ]);

    console.log('🌱 Seeding recruiter <-> candidate messages...');
    await Message.insertMany([
      {
        senderId: recruiterSarah._id,
        receiverId: candidateAarav._id,
        content: "Hi Aarav, thank you for submitting your application for the Senior Frontend Engineer role at TalentFlow Technologies! Our engineering team was particularly impressed by your experience with design systems and Next.js performance.",
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: candidateAarav._id,
        receiverId: recruiterSarah._id,
        content: "Hi Sarah! Thank you so much for reaching out. I've followed TalentFlow's product evolution and would love the opportunity to contribute to the platform's frontend architecture.",
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: recruiterSarah._id,
        receiverId: candidateAarav._id,
        content: "That sounds great! I've scheduled our Technical Architecture Discussion for tomorrow at 2:00 PM PST. The meeting room link is in your Interviews tab. Looking forward to speaking with you!",
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ]);

    console.log('🌱 Seeding system notifications...');
    await Notification.insertMany([
      {
        userId: candidateAarav._id,
        subject: 'Interview Scheduled: Senior Frontend Engineer',
        message: 'Your Technical Architecture Interview with Sarah Jenkins at TalentFlow Technologies is confirmed for tomorrow at 2:00 PM.',
        sender: 'TalentFlow Talent Team',
        read: false,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        userId: candidateAarav._id,
        subject: 'Application Status Updated',
        message: 'Your application for Senior Frontend Engineer has moved to the "Interview" stage.',
        sender: 'TalentFlow ATS',
        read: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        userId: recruiterSarah._id,
        subject: 'New Application Received: AI/ML Engineer',
        message: 'Rahul Verma (96% ATS Match) has submitted an application for AI/ML Engineer.',
        sender: 'TalentFlow AI Matching',
        read: false,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: adminUser._id,
        subject: 'Company Verification Audit Pending',
        message: 'Apex Cloud has submitted registration documents for platform verification.',
        sender: 'Trust & Safety',
        read: false,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ]);

    console.log('🌱 Seeding security audit logs...');
    await AuditLog.insertMany([
      {
        userId: adminUser._id,
        action: 'COMPANY_VERIFIED',
        details: 'TalentFlow Technologies credentials verified and authorized for enterprise posting.'
      },
      {
        userId: recruiterSarah._id,
        action: 'JOB_PUBLISHED',
        details: 'Published new requirement: Senior Frontend Engineer (San Francisco, CA).'
      },
      {
        userId: recruiterSarah._id,
        action: 'STAGE_UPDATED',
        details: 'Candidate Aarav Sharma advanced to Interview stage for Senior Frontend Engineer.'
      }
    ]);

    console.log('\n======================================================');
    console.log('🎉 Database Seeded Successfully with Cohesive Demo Data!');
    console.log('======================================================');
    console.log('Credentials:');
    console.log('  👤 Candidate: candidate@rms.com / password123 (Aarav Sharma)');
    console.log('  💼 Recruiter: recruiter@rms.com / password123 (Sarah Jenkins - TalentFlow Tech)');
    console.log('  🛡️ Admin:     admin@rms.com / password123 (Alexander Vance)');
    console.log('======================================================\n');

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
