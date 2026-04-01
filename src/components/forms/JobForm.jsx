import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export const JobForm = ({ onSubmit, onCancel, initialData = null, isSubmitting = false }) => {

  const [formData, setFormData] = useState(initialData || {
    title: "",
    department: "",
    location: "",
    type: "Full-Time",
    salary: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', padding: '0.5rem 0' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Role Essentials</h3>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Define the core parameters of this recruitment requirement.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <Input
          label="Job Title"
          name="title"
          placeholder="e.g. Senior Backend Architect"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <Input
          label="Department"
          name="department"
          placeholder="e.g. Core Platform"
          value={formData.department}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <Input
          label="Work Location"
          name="location"
          placeholder="e.g. Remote (Global)"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Engagement Type</label>
            <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={{
                    padding: '0 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    height: '52px',
                    width: '100%',
                    appearance: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                }}
            >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
            </select>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginTop: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Compensation & Details</h3>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Set the expectations for potential candidates.</p>
      </div>

      <Input
        label="Salary Range (Optional)"
        name="salary"
        placeholder="e.g. $140,000 - $180,000"
        value={formData.salary}
        onChange={handleChange}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Detailed Job Narrative</label>
        <textarea
          name="description"
          placeholder="Outline the mission, technical stack, responsibilities, and benefits of joining TalentFlow..."
          value={formData.description}
          onChange={handleChange}
          required
          style={{
            minHeight: '180px',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            resize: 'vertical',
            lineHeight: '1.6',
            fontSize: '0.95rem',
            transition: 'border-color 0.2s'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <Button variant="ghost" type="button" onClick={onCancel} style={{ fontSize: '1rem' }}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} style={{ padding: '0 2rem', fontSize: '1rem', fontWeight: 600 }}>

          {isSubmitting ? "Syncing..." : (initialData ? "Apply Changes" : "Post Opportunity")}
        </Button>
      </div>
    </form>
  );
};

