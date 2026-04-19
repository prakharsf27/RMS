'use client';
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.25rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                    fontSize: '0.9rem',
                    height: '48px',
                    width: '100%',
                    appearance: 'none',
                    cursor: 'pointer'
                }}
            >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
            </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
        <Input
          label="Salary Range (Optional)"
          name="salary"
          placeholder="e.g. $140k - $180k"
          value={formData.salary}
          onChange={handleChange}
        />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', paddingBottom: '0.75rem' }}>
          * Shown to candidates during initial screening.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Narrative</label>
        <textarea
          name="description"
          placeholder="Outline the mission, technical stack, and responsibilities..."
          value={formData.description}
          onChange={handleChange}
          required
          style={{
            minHeight: '100px',
            padding: '1rem',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            resize: 'vertical',
            lineHeight: '1.5',
            fontSize: '0.9rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} style={{ padding: '0 1.5rem' }}>
          {isSubmitting ? "Syncing..." : (initialData ? "Update Job" : "Post Job")}
        </Button>
      </div>
    </form>
  );
};

