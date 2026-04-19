module.exports=[97856,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(8406),e=a.i(92759);let f=(0,a.i(70106).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);var g=a.i(21374),h=a.i(33508),i=a.i(4720),j=a.i(16201);let k=`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

.rai-root { display:flex; height:calc(100vh - 100px); border-radius: 16px; overflow:hidden; background:#080d1a; font-family:'Outfit',sans-serif; color:#e2e8f0; }
@media (max-width: 1024px) { 
  .rai-root { flex-direction: column; height: auto; min-height: calc(100vh - 80px); }
  .rai-chat { width: 100% !important; min-width: 0 !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.07); height: 500px; }
  .rai-resume-panel { width: 100%; height: 600px; }
}
.rai-root *,:before,:after { box-sizing:border-box; margin:0; padding:0; }
.rai-root ::-webkit-scrollbar { width:4px; }
.rai-root ::-webkit-scrollbar-thumb { background:rgba(99,102,241,.4); border-radius:2px; }

/* Chat panel */
.rai-chat { width:420px; min-width:420px; display:flex; flex-direction:column; border-right:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.015); }
.rai-hdr { padding:16px 18px; border-bottom:1px solid rgba(255,255,255,.07); flex-shrink:0; }
.rai-bot-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.rai-avatar { width:36px; height:36px; border-radius:12px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; animation:pulseGlow 3s ease-in-out infinite; flex-shrink:0; }
@keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.2)} }
.rai-dot { width:6px; height:6px; border-radius:50%; background:#34d399; animation:blink 2s ease-in-out infinite; display:inline-block; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }
.rai-tabs { display:flex; gap:6px; }
.rai-tab { padding:6px 12px; border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:#64748b; transition:all .2s; }
.rai-tab:hover { background:rgba(255,255,255,.06); color:#94a3b8; }
.rai-tab.active { background:rgba(99,102,241,.2); border-color:rgba(99,102,241,.4); color:#818cf8; }

/* Messages */
.rai-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; }
.rai-msg { display:flex; gap:9px; animation:msgIn .25s ease both; }
@keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.rai-msg.user { flex-direction:row-reverse; }
.rai-msg-av { width:28px; height:28px; border-radius:9px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; margin-top:2px; }
.rai-msg-av.bot { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; }
.rai-msg-av.user { background:linear-gradient(135deg,#334155,#475569); color:#94a3b8; }
.rai-bubble { max-width:82%; padding:10px 14px; border-radius:14px; font-size:13px; line-height:1.6; }
.rai-bubble.bot { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); color:#cbd5e1; border-top-left-radius:4px; }
.rai-bubble.user { background:linear-gradient(135deg,rgba(99,102,241,.3),rgba(139,92,246,.3)); border:1px solid rgba(99,102,241,.25); color:#e2e8f0; border-top-right-radius:4px; }
.rai-bubble.streaming::after { content:'▋'; color:#818cf8; animation:cursorBlink .7s ease-in-out infinite; }
@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
.rai-bubble strong { color:#c7d2fe; font-weight:600; }
.rai-bubble ul { padding-left:16px; margin-top:4px; }
.rai-bubble li { margin-bottom:3px; }
.rai-time { font-size:10px; color:#334155; margin-top:4px; padding:0 4px; }
.rai-typing { display:flex; gap:4px; align-items:center; padding:4px 0; }
.rai-typing span { width:6px; height:6px; border-radius:50%; background:#6366f1; animation:dotBounce 1.2s ease-in-out infinite; }
.rai-typing span:nth-child(2) { animation-delay:.2s; }
.rai-typing span:nth-child(3) { animation-delay:.4s; }
@keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }

/* Quick actions */
.rai-qas { padding:0 16px 10px; display:flex; flex-wrap:wrap; gap:6px; flex-shrink:0; }
.rai-qa { padding:6px 11px; border-radius:8px; font-size:11px; font-weight:500; cursor:pointer; border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03); color:#64748b; transition:all .2s; }
.rai-qa:hover { background:rgba(99,102,241,.12); border-color:rgba(99,102,241,.3); color:#818cf8; }

/* Paste area */
.rai-paste { padding:10px 14px; margin:0 16px 10px; border-radius:10px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); }
.rai-paste-lbl { font-size:10px; font-weight:600; color:#475569; letter-spacing:.8px; margin-bottom:6px; }
.rai-paste-ta { width:100%; height:90px; padding:8px; border-radius:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:#94a3b8; font-size:11px; font-family:'Outfit',sans-serif; resize:none; outline:none; line-height:1.5; }
.rai-paste-ta:focus { border-color:rgba(99,102,241,.4); }
.rai-paste-ta::placeholder { color:#2d3748; }
.rai-paste-btn { margin-top:8px; padding:7px 14px; border-radius:8px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none; color:white; font-size:12px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .2s; }

/* Input area */
.rai-input-area { padding:12px 16px 14px; border-top:1px solid rgba(255,255,255,.07); flex-shrink:0; }
.rai-input-wrap { position:relative; }
.rai-textarea { width:100%; padding:11px 44px 11px 14px; border-radius:12px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); color:#e2e8f0; font-size:13px; font-family:'Outfit',sans-serif; resize:none; outline:none; min-height:46px; max-height:120px; transition:all .2s; line-height:1.5; }
.rai-textarea:focus { border-color:rgba(99,102,241,.5); background:rgba(255,255,255,.07); box-shadow:0 0 0 3px rgba(99,102,241,.1); }
.rai-textarea::placeholder { color:#334155; }
.rai-send { position:absolute; right:8px; bottom:8px; width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none; color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
.rai-send:hover { transform:scale(1.05); box-shadow:0 4px 16px rgba(99,102,241,.5); }
.rai-send:disabled { opacity:.4; cursor:not-allowed; transform:none; }
.rai-hints { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.rai-hint { padding:4px 10px; border-radius:6px; font-size:10px; font-weight:500; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); color:#334155; cursor:pointer; transition:all .2s; }
.rai-hint:hover { background:rgba(99,102,241,.1); border-color:rgba(99,102,241,.25); color:#6366f1; }

/* Resume panel */
.rai-resume-panel { flex:1; min-width:0; display:flex; flex-direction:column; background:#0f1629; position:relative; }
.rai-resume-hdr { padding:14px 20px; border-bottom:1px solid rgba(255,255,255,.07); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
.rai-resume-title { font-size:14px; font-weight:700; color:#e2e8f0; }
.rai-resume-sub { font-size:11px; color:#475569; }
.rai-resume-actions { display:flex; gap:8px; align-items:center; }
.rai-rbtn { padding:7px 14px; border-radius:9px; font-size:12px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .2s; display:flex; align-items:center; gap:5px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:#64748b; }
.rai-rbtn:hover { background:rgba(255,255,255,.08); color:#e2e8f0; }
.rai-rbtn.primary { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; border:none; }
.rai-rbtn.primary:hover { box-shadow:0 6px 20px rgba(99,102,241,.4); transform:translateY(-1px); }
.rai-ats { padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; display:flex; align-items:center; gap:4px; }
.rai-preview-wrap { flex:1; overflow-y:auto; padding:20px; display:flex; justify-content:center; align-items:flex-start; }
.rai-doc-empty { width:100%; max-width:680px; min-height:500px; background:rgba(255,255,255,.03); border:2px dashed rgba(255,255,255,.08); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; font-family:'Outfit',sans-serif; }
.rai-empty-icon { width:56px; height:56px; border-radius:16px; background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.2); display:flex; align-items:center; justify-content:center; }
.rai-doc { width:100%; max-width:680px; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.5); }
/* Resume doc inner styles */
.r-hdr { padding:32px 36px 22px; background:linear-gradient(135deg,#1e1b4b,#312e81); color:white; }
.r-name { font-family:'DM Serif Display',serif; font-size:30px; font-weight:400; letter-spacing:-.5px; margin-bottom:4px; line-height:1.15; }
.r-tagline { font-family:'Outfit',sans-serif; font-size:14px; color:rgba(199,210,254,.85); margin-bottom:14px; }
.r-contact { display:flex; flex-wrap:wrap; gap:14px; font-family:'Outfit',sans-serif; font-size:12px; color:rgba(199,210,254,.7); }
.r-body { padding:24px 36px 32px; display:flex; flex-direction:column; gap:20px; }
.r-sec-title { font-family:'Outfit',sans-serif; font-size:10px; font-weight:700; letter-spacing:2px; color:#6366f1; text-transform:uppercase; margin-bottom:10px; padding-bottom:6px; border-bottom:1.5px solid #e0e7ff; }
.r-exp { margin-bottom:14px; }
.r-exp:last-child { margin-bottom:0; }
.r-exp-hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:3px; }
.r-exp-role { font-family:'DM Serif Display',serif; font-size:15px; color:#1e293b; }
.r-exp-date { font-family:'Outfit',sans-serif; font-size:11px; color:#94a3b8; white-space:nowrap; margin-top:2px; }
.r-exp-company { font-family:'Outfit',sans-serif; font-size:12px; color:#6366f1; font-weight:600; margin-bottom:6px; }
.r-bullets { list-style:none; padding:0; }
.r-bullets li { font-family:'Outfit',sans-serif; font-size:12.5px; color:#475569; line-height:1.6; padding-left:14px; position:relative; margin-bottom:3px; }
.r-bullets li::before { content:'▸'; position:absolute; left:0; color:#6366f1; font-size:10px; top:2px; }
.r-skills { display:flex; flex-wrap:wrap; gap:6px; }
.r-skill { padding:4px 10px; border-radius:6px; font-family:'Outfit',sans-serif; font-size:11px; font-weight:600; background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; }
.r-skill.hl { background:#ede9fe; color:#5b21b6; border-color:#ddd6fe; }
.r-summary { font-family:'Outfit',sans-serif; font-size:13px; color:#475569; line-height:1.7; }
.r-edu-row { display:flex; justify-content:space-between; align-items:flex-start; }
.r-edu-deg { font-family:'DM Serif Display',serif; font-size:14px; color:#1e293b; }
.r-edu-school { font-family:'Outfit',sans-serif; font-size:12px; color:#6366f1; font-weight:500; }
.r-edu-date { font-family:'Outfit',sans-serif; font-size:11px; color:#94a3b8; }
/* JD overlay */
.rai-jd-overlay { position:absolute; inset:0; background:rgba(8,13,26,.96); backdrop-filter:blur(10px); z-index:10; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn .2s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.rai-jd-card { width:100%; max-width:500px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:18px; padding:24px; }
.rai-jd-ta { width:100%; height:180px; padding:12px; border-radius:12px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); color:#e2e8f0; font-size:12px; font-family:'Outfit',sans-serif; resize:none; outline:none; line-height:1.6; }
.rai-jd-ta:focus { border-color:rgba(99,102,241,.5); box-shadow:0 0 0 3px rgba(99,102,241,.1); }
.rai-jd-ta::placeholder { color:#334155; }
`,l=[{id:"build",label:"🛠 Build",desc:"Create from scratch"},{id:"tailor",label:"🎯 Tailor",desc:"Match to JD"},{id:"improve",label:"⚡ Improve",desc:"Enhance existing"}],m={build:["Tell me about yourself","Add work experience","Add education","Add skills section","Generate summary"],tailor:["Paste my current resume","Add job description","Match JD keywords","Strengthen bullets","ATS score check"],improve:["Make more concise","Quantify my achievements","Add action verbs","Fix weak phrases","ATS optimization"]},n={build:`👋 **Welcome to ResumeAI!** I'll help you craft a standout resume from scratch.

Let's start simple — **tell me your name and the type of role you're targeting.** I'll build a professional, ATS-optimized resume as we talk.

Already have a resume? Click **📄 Paste My Resume** to let me improve it.`,tailor:`🎯 **Tailoring Mode activated!**

I'll optimize your resume for a specific job description to maximize your ATS match score.

**Step 1:** Paste your current resume below.
**Step 2:** Share the job description.
**Step 3:** Watch me rewrite every bullet and keyword to match.`,improve:`⚡ **Improvement Mode!**

Paste your existing resume and I'll:
- **Strengthen** weak bullets with impact metrics
- **Add** ATS keywords you're missing
- **Rewrite** generic phrases with power verbs
- **Score** it against best-practice standards

Paste your resume to get started!`},o={build:`You are ResumeAI, an expert resume writer for TalentFlow. Help users build professional, ATS-optimized resumes through natural conversation.

IMPORTANT: When you have enough info to generate/update the resume, ALWAYS include structured JSON like this:
\`\`\`resume-json
{
  "name": "Full Name",
  "tagline": "Target Job Title",
  "email": "email@example.com",
  "phone": "+1 555-000-0000",
  "location": "City, State",
  "linkedin": "linkedin.com/in/username",
  "summary": "2-3 sentence ATS-optimized professional summary",
  "experience": [
    {
      "role": "Job Title",
      "company": "Company",
      "date": "Jan 2022 – Present",
      "bullets": ["Led X initiative resulting in Y% improvement in Z", "Built and scaled..."]
    }
  ],
  "education": [{ "degree": "B.S. Computer Science", "school": "State University", "date": "2019" }],
  "skills": {
    "highlighted": ["React", "TypeScript"],
    "regular": ["Node.js", "SQL", "AWS"]
  },
  "atsScore": 82
}
\`\`\`

Converse naturally. Ask focused questions. Generate JSON as soon as you have name + role + 1 experience. Update JSON with every new detail.`,tailor:`You are ResumeAI in Tailoring Mode. You analyze job descriptions and optimize resumes for ATS + recruiter appeal.

When given a resume and JD, output tailored version as:
\`\`\`resume-json
{ ...same format, atsScore reflecting JD match... }
\`\`\`

Key actions: mirror exact JD keywords in bullets, reorder skills to match JD priority, add inferred skills, quantify achievements, match job title in tagline.`,improve:`You are ResumeAI in Improvement Mode. Analyze pasted resumes and make them significantly better.

Output improved JSON with atsScore. Focus on: strong action verbs (Led, Architected, Drove, Delivered), quantified achievements (%, $, users, time saved), ATS keyword density, modern formatting.`},p=()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});function q({data:a}){if(!a)return(0,b.jsxs)("div",{className:"rai-doc-empty",children:[(0,b.jsx)("div",{className:"rai-empty-icon",children:(0,b.jsx)(i.FileText,{size:26,color:"#6366f1"})}),(0,b.jsx)("div",{style:{fontSize:16,fontWeight:600,color:"#475569"},children:"No resume yet"}),(0,b.jsx)("div",{style:{fontSize:13,color:"#334155",textAlign:"center",maxWidth:280,lineHeight:1.5},children:"Chat with the AI to build a fresh resume or paste your existing one"})]});let{name:c,tagline:d,email:e,phone:f,location:g,linkedin:h,summary:j,experience:k=[],education:l=[],skills:m={}}=a;return(0,b.jsxs)("div",{className:"rai-doc",children:[(0,b.jsxs)("div",{className:"r-hdr",children:[(0,b.jsx)("div",{className:"r-name",children:c}),d&&(0,b.jsx)("div",{className:"r-tagline",children:d}),(0,b.jsxs)("div",{className:"r-contact",children:[e&&(0,b.jsxs)("span",{children:["✉ ",e]}),f&&(0,b.jsxs)("span",{children:["📱 ",f]}),g&&(0,b.jsxs)("span",{children:["📍 ",g]}),h&&(0,b.jsxs)("span",{children:["💼 ",h]})]})]}),(0,b.jsxs)("div",{className:"r-body",children:[j&&(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"r-sec-title",children:"Professional Summary"}),(0,b.jsx)("div",{className:"r-summary",children:j})]}),k.length>0&&(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"r-sec-title",children:"Experience"}),k.map((a,c)=>(0,b.jsxs)("div",{className:"r-exp",children:[(0,b.jsxs)("div",{className:"r-exp-hdr",children:[(0,b.jsx)("div",{className:"r-exp-role",children:a.role}),(0,b.jsx)("div",{className:"r-exp-date",children:a.date})]}),(0,b.jsx)("div",{className:"r-exp-company",children:a.company}),(0,b.jsx)("ul",{className:"r-bullets",children:(a.bullets||[]).map((a,c)=>(0,b.jsx)("li",{children:a},c))})]},c))]}),(m.highlighted?.length||m.regular?.length)&&(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"r-sec-title",children:"Skills"}),(0,b.jsxs)("div",{className:"r-skills",children:[(m.highlighted||[]).map((a,c)=>(0,b.jsx)("span",{className:"r-skill hl",children:a},c)),(m.regular||[]).map((a,c)=>(0,b.jsx)("span",{className:"r-skill",children:a},c))]})]}),l.length>0&&(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"r-sec-title",children:"Education"}),l.map((a,c)=>(0,b.jsxs)("div",{className:"r-edu-row",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"r-edu-deg",children:a.degree}),(0,b.jsx)("div",{className:"r-edu-school",children:a.school})]}),(0,b.jsx)("div",{className:"r-edu-date",children:a.date})]},c))]})]})]})}a.s(["default",0,function(){let[a,i]=(0,c.useState)("build"),[r,s]=(0,c.useState)([]),[t,u]=(0,c.useState)(""),[v,w]=(0,c.useState)(!1),[x,y]=(0,c.useState)(null),[z,A]=(0,c.useState)(""),[B,C]=(0,c.useState)([]),[D,E]=(0,c.useState)(!1),[F,G]=(0,c.useState)(""),[H,I]=(0,c.useState)(!1),[J,K]=(0,c.useState)(""),[L,M]=(0,c.useState)(null),[N,O]=(0,c.useState)(null),P=(0,c.useRef)(null),Q=(0,c.useRef)(null),R=(0,c.useRef)(B);R.current=B,(0,c.useEffect)(()=>{let a=document.createElement("style");return a.textContent=k,document.head.appendChild(a),()=>document.head.removeChild(a)},[]),(0,c.useEffect)(()=>{s([{id:1,role:"bot",text:n[a],time:p()}]),C([]),y(null),A(""),E("build"!==a),M(null),O(null)},[a]),(0,c.useEffect)(()=>{P.current&&(P.current.scrollTop=P.current.scrollHeight)},[r]);let S=(0,c.useCallback)((a,b,c={})=>{s(d=>[...d,{id:Date.now()+Math.random(),role:a,text:b,time:p(),...c}])},[]),T=(0,c.useCallback)(async(b,c="")=>{w(!0);let d=[...R.current,{role:"user",content:c?b+"\n\n"+c:b}];C(d);let e=Date.now();s(a=>[...a,{id:e,role:"bot",typing:!0,time:p()}]);try{let b=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4e3,system:o[a]+(z?`

User's existing resume:
${z}`:""),messages:d})}),c=await b.json();if(s(a=>a.filter(a=>a.id!==e)),c.error){S("bot",`⚠️ API error: ${c.error.message}`),w(!1);return}let f=c.content?.[0]?.text||"";C(a=>[...a,{role:"assistant",content:f}]);let g=f.match(/```resume-json\n([\s\S]*?)\n```/),h=f.replace(/```resume-json\n[\s\S]*?\n```/,"").trim();if(h||(h="✅ Your resume has been updated! Check the preview →"),g)try{let a=JSON.parse(g[1]);y(a),O(p()),a.atsScore&&M(a.atsScore)}catch(a){}let i=h.split(" "),j=Date.now();s(a=>[...a,{id:j,role:"bot",text:"",streaming:!0,time:p()}]);let k=0,l=()=>{k<i.length?(k=Math.min(k+4,i.length),s(a=>a.map(a=>a.id===j?{...a,text:i.slice(0,k).join(" ")}:a)),setTimeout(l,25)):(s(a=>a.map(a=>a.id===j?{...a,streaming:!1}:a)),w(!1))};l()}catch(a){s(a=>a.filter(a=>a.id!==e)),S("bot",`⚠️ Connection error: ${a.message}

Make sure your Anthropic API key is configured.`),w(!1)}},[a,z,S]),U=()=>{if(!t.trim()||v)return;let a=t.trim();u(""),S("user",a),T(a)};return(0,b.jsxs)("div",{className:"rai-root",children:[(0,b.jsxs)("div",{className:"rai-chat",children:[(0,b.jsxs)("div",{className:"rai-hdr",children:[(0,b.jsxs)("div",{className:"rai-bot-row",children:[(0,b.jsx)("div",{className:"rai-avatar",children:(0,b.jsx)(d.Sparkles,{size:18,color:"white"})}),(0,b.jsxs)("div",{style:{flex:1},children:[(0,b.jsx)("div",{style:{fontSize:14,fontWeight:700,color:"#e2e8f0"},children:"ResumeAI by TalentFlow"}),(0,b.jsxs)("div",{style:{fontSize:11,color:"#475569",display:"flex",alignItems:"center",gap:4},children:[(0,b.jsx)("span",{className:"rai-dot"})," Online & ready"]})]})]}),(0,b.jsx)("div",{className:"rai-tabs",children:l.map(c=>(0,b.jsx)("div",{className:`rai-tab${a===c.id?" active":""}`,onClick:()=>!v&&i(c.id),children:c.label},c.id))})]}),(0,b.jsx)("div",{className:"rai-msgs",ref:P,children:r.map(a=>(0,b.jsxs)("div",{className:`rai-msg${"user"===a.role?" user":""}`,children:[(0,b.jsx)("div",{className:`rai-msg-av ${a.role}`,children:"bot"===a.role?"✨":"PS"}),(0,b.jsxs)("div",{children:[a.typing?(0,b.jsx)("div",{className:"rai-bubble bot",children:(0,b.jsxs)("div",{className:"rai-typing",children:[(0,b.jsx)("span",{}),(0,b.jsx)("span",{}),(0,b.jsx)("span",{})]})}):(0,b.jsx)("div",{className:`rai-bubble ${a.role}${a.streaming?" streaming":""}`,dangerouslySetInnerHTML:"bot"===a.role?{__html:a.text.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/`(.*?)`/g,'<code style="background:rgba(99,102,241,.2);padding:1px 5px;border-radius:4px;font-size:11px;color:#a5b4fc;font-family:monospace">$1</code>').replace(/^[-•]\s(.+)/gm,"<li>$1</li>").replace(/<li>/g,"</ul><ul><li>").replace("</ul>","").replace(/\n\n/g,"<br><br>").replace(/\n/g,"<br>")}:void 0,children:"user"===a.role?a.text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):void 0}),(0,b.jsx)("div",{className:`rai-time${"user"===a.role?" ":""}`,style:"user"===a.role?{textAlign:"right"}:{},children:a.time})]})]},a.id))}),(0,b.jsx)("div",{className:"rai-qas",children:m[a].map(a=>(0,b.jsx)("div",{className:"rai-qa",onClick:()=>{v||(S("user",a),T(a))},children:a},a))}),D&&(0,b.jsxs)("div",{className:"rai-paste",children:[(0,b.jsx)("div",{className:"rai-paste-lbl",children:"PASTE YOUR EXISTING RESUME"}),(0,b.jsx)("textarea",{className:"rai-paste-ta",placeholder:"Paste your resume text here (any format — plain text, copied from PDF/Word)...",value:F,onChange:a=>G(a.target.value)}),(0,b.jsxs)("div",{style:{display:"flex",gap:8,marginTop:8},children:[(0,b.jsx)("button",{className:"rai-paste-btn",onClick:()=>{F.trim()&&(A(F.trim()),G(""),E(!1),S("user",`[Pasted resume — ${F.split("\n").length} lines]`),T("I pasted my existing resume. Please analyze it and show me an improved version. My resume:\n\n"+F))},children:"Submit Resume →"}),(0,b.jsx)("button",{onClick:()=>E(!1),style:{padding:"7px 12px",borderRadius:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",color:"#64748b",fontSize:12,cursor:"pointer",fontFamily:"Outfit,sans-serif"},children:"Cancel"})]})]}),(0,b.jsxs)("div",{className:"rai-input-area",children:[(0,b.jsxs)("div",{className:"rai-input-wrap",children:[(0,b.jsx)("textarea",{ref:Q,className:"rai-textarea",rows:1,placeholder:"Ask me to build, tailor, or improve your resume...",value:t,onChange:a=>u(a.target.value),onKeyDown:a=>{"Enter"!==a.key||a.shiftKey||(a.preventDefault(),U())}}),(0,b.jsx)("button",{className:"rai-send",onClick:U,disabled:v||!t.trim(),children:(0,b.jsx)(e.Send,{size:14})})]}),(0,b.jsxs)("div",{className:"rai-hints",children:[(0,b.jsx)("span",{className:"rai-hint",onClick:()=>I(!0),children:"📋 Paste Job Description"}),(0,b.jsx)("span",{className:"rai-hint",onClick:()=>E(!0),children:"📄 Paste My Resume"}),(0,b.jsx)("span",{className:"rai-hint",onClick:()=>{S("user","Tailor for this role"),T("Tailor my resume for better ATS performance")},children:"🎯 Tailor for role"}),(0,b.jsx)("span",{className:"rai-hint",onClick:()=>{S("user","Suggest improvements"),T("Review my resume and suggest the most impactful improvements")},children:"💡 Suggest improvements"})]})]})]}),(0,b.jsxs)("div",{className:"rai-resume-panel",children:[(0,b.jsxs)("div",{className:"rai-resume-hdr",children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:12},children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"rai-resume-title",children:"Live Resume Preview"}),(0,b.jsx)("div",{className:"rai-resume-sub",children:N?`Last updated \xb7 ${N}`:"Start chatting to generate your resume"})]}),L&&(0,b.jsxs)("div",{className:"rai-ats",style:{background:L>=80?"rgba(16,185,129,.15)":L>=60?"rgba(245,158,11,.15)":"rgba(239,68,68,.15)",border:`1px solid ${L>=80?"rgba(16,185,129,.3)":L>=60?"rgba(245,158,11,.3)":"rgba(239,68,68,.3)"}`,color:L>=80?"#34d399":L>=60?"#fbbf24":"#f87171"},children:[(0,b.jsx)(j.CheckCircle,{size:11})," ATS: ",L,"%"]})]}),(0,b.jsxs)("div",{className:"rai-resume-actions",children:[(0,b.jsxs)("button",{className:"rai-rbtn",onClick:()=>{if(!x)return;let{name:a,tagline:b,email:c,phone:d,location:e,summary:f,experience:g=[],education:h=[],skills:i={}}=x,j=`${a}
${b}
${c} | ${d} | ${e}

SUMMARY
${f}

EXPERIENCE
`;g.forEach(a=>{j+=`${a.role} — ${a.company} (${a.date})
`,(a.bullets||[]).forEach(a=>j+=`• ${a}
`),j+="\n"}),h.forEach(a=>j+=`${a.degree}, ${a.school} (${a.date})
`);let k=[...i.highlighted||[],...i.regular||[]];k.length&&(j+=`
SKILLS
${k.join(" • ")}`),navigator.clipboard.writeText(j).then(()=>alert("Resume copied to clipboard!"))},disabled:!x,children:[(0,b.jsx)(f,{size:12})," Copy"]}),(0,b.jsxs)("button",{className:"rai-rbtn primary",onClick:()=>I(!0),children:[(0,b.jsx)(g.Star,{size:12})," Tailor to JD"]})]})]}),(0,b.jsx)("div",{className:"rai-preview-wrap",children:(0,b.jsx)(q,{data:x})}),H&&(0,b.jsx)("div",{className:"rai-jd-overlay",children:(0,b.jsxs)("div",{className:"rai-jd-card",children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14},children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:16,fontWeight:700,color:"#e2e8f0",marginBottom:4},children:"🎯 Tailor to Job Description"}),(0,b.jsx)("div",{style:{fontSize:12,color:"#475569"},children:"Paste the JD — AI will optimize your resume to match it"})]}),(0,b.jsx)("button",{onClick:()=>I(!1),style:{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b",fontSize:18},children:(0,b.jsx)(h.X,{size:15})})]}),(0,b.jsx)("textarea",{className:"rai-jd-ta",placeholder:`Senior Frontend Engineer at Stripe

Requirements:
• 5+ years React / TypeScript
• Performance optimization experience
• Strong CSS & testing skills

Responsibilities:
• Build scalable web applications
• Collaborate with design...`,value:J,onChange:a=>K(a.target.value)}),(0,b.jsxs)("div",{style:{display:"flex",gap:10,marginTop:12},children:[(0,b.jsx)("button",{onClick:()=>I(!1),style:{flex:1,padding:10,borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#64748b",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Outfit,sans-serif"},children:"Cancel"}),(0,b.jsx)("button",{onClick:()=>{if(!J.trim())return;I(!1);let a=x?"Please tailor my resume for this job description:\n\n"+J:"I want to target this role. Build/optimize my resume for:\n\n"+J;S("user","[Job Description pasted]"),T(a),K("")},style:{flex:2,padding:10,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Outfit,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6},children:"✨ Tailor My Resume"})]})]})})]})]})}],97856)}];

//# sourceMappingURL=src_views_ResumeAI_jsx_0x38mb~._.js.map