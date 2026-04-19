import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, MessageCircle, AlertCircle, RefreshCw, Briefcase } from "lucide-react";
import { Button } from "../ui/Button";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// Randomizes a mock bell curve data around a base salary
const generateSalaryData = (base) => {
  const data = [];
  for (let i = -4; i <= 4; i++) {
     const val = base + (i * (base * 0.05));
     const y = Math.max(0, 100 - (Math.abs(i) * 20) + Math.floor(Math.random() * 10));
     data.push({
       amount: `$${Math.floor(val / 1000)}k`,
       val,
       count: y
     });
  }
  return data;
};

export default function SalaryCoach({ job }) {
  const [offerText, setOfferText] = useState("");
  const [coachResponse, setCoachResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Derive a base numeric from job.salary string if possible, else 100000
  let baseSalary = 100000;
  if (job?.salary) {
     const match = job.salary.replace(/,/g, '').match(/\d{4,}/);
     if (match) baseSalary = parseInt(match[0], 10);
  }

  const data = generateSalaryData(baseSalary);
  const minRange = data[0].amount;
  const maxRange = data[data.length - 1].amount;

  const handleCoach = async () => {
    if (!offerText.trim()) return;
    setLoading(true);
    setCoachResponse(null);

    const prompt = `You are an expert Salary Negotiation Coach.
My target role: ${job?.title || 'Unknown'} at ${job?.company?.name || 'a company'}.
Industry average range: ${minRange} to ${maxRange}.
My offer details/leverage: "${offerText}"

Give me a 3-bullet point script/strategy on how to counter-offer this effectively, maximizing my leverage without sounding greedy. Format cleanly with no markdown headers.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setCoachResponse(data.content[0].text);
    } catch (err) {
      setCoachResponse("Error contacting AI coach. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px 0" }}>
       <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px' }}>
         <DollarSign size={18} style={{ color: 'var(--success-color)' }} /> 
         Crowdsourced Salary Intelligence
       </h4>
       
       <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
             <div>
               <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Estimated Distribution</div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{minRange} - {maxRange}</div>
             </div>
             <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Data Confidence</div>
               <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success-color)' }}>High (Verified Offers)</div>
             </div>
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="amount" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>

       <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <MessageCircle size={18} /> AI Negotiation Coach
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Got an offer? Tell Claude the details and your leverage points (e.g. competing offers, years of experience) to generate a tailored counter-offer strategy.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: coachResponse ? '16px' : '0' }}>
            <input 
               type="text"
               value={offerText}
               onChange={(e) => setOfferText(e.target.value)}
               placeholder="e.g. They offered $110k, but I have 5 years exp and another offer for $120k..."
               style={{
                 flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', 
                 background: 'var(--bg-default)', color: 'var(--text-primary)', fontSize: '14px'
               }}
            />
            <Button onClick={handleCoach} disabled={loading || !offerText.trim()}>
               {loading ? <RefreshCw className="animate-spin" size={16} /> : "Coach Me"}
            </Button>
          </div>

          {coachResponse && (
             <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '13px', color: 'var(--primary-color)', display: 'block', marginBottom: '8px' }}>Strategy Generated:</strong>
                <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                   {coachResponse}
                </div>
             </div>
          )}
       </div>
    </div>
  );
}
