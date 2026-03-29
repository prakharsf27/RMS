import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export const JobForm = ({ onSubmit, initialData = null, isSubmitting = false }) => {
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Input
          label="Job Title"
          name="title"
          placeholder="e.g. Senior Frontend Engineer"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <Input
          label="Department"
          name="department"
          placeholder="e.g. Engineering"
          value={formData.department}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Input
          label="Location"
          name="location"
          placeholder="e.g. Remote, NY"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Type</label>
            <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit'
                }}
            >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
            </select>
        </div>
      </div>

      <Input
        label="Salary Range"
        name="salary"
        placeholder="e.g. $120k - $150k"
        value={formData.salary}
        onChange={handleChange}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Description</label>
        <textarea
          name="description"
          placeholder="Describe the role, responsibilities, and requirements..."
          value={formData.description}
          onChange={handleChange}
          required
          style={{
            minHeight: '120px',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            resize: 'vertical',
            lineHeight: '1.5'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : (initialData ? "Update Requirement" : "Post Requirement")}
        </Button>
      </div>
    </form>
  );
};
