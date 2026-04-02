import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { FileUp, Link as LinkIcon, CheckCircle2 } from "lucide-react";

export const ApplyForm = ({ onSubmit, jobTitle, company, isSubmitting = false }) => {
  const [method, setMethod] = useState("upload"); // upload or link
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [formData, setFormData] = useState({
    resumeUrl: "",
    resumeFile: null,
    linkedIn: "",
    coverLetter: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resumeFile") {
        const file = files[0];
        setFormData(prev => ({ ...prev, resumeFile: file }));
        simulateUpload(file);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const simulateUpload = (file) => {
    if (!file) return;
    setIsUploaded(false);
    setUploadProgress(0);
    const interval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setIsUploaded(true);
                return 100;
            }
            return prev + 10;
        });
    }, 150);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (method === "upload" && !isUploaded) {
        alert("Please wait for the resume to finish uploading.");
        return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.25rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#fff', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', flexShrink: 0 }}>
          {company?.logo ? (
            <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{company?.name?.[0] || '?'}</span>
          )}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>Applying for: {jobTitle}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>at {company?.name}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button 
            type="button" 
            variant={method === 'upload' ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setMethod('upload')}
            style={{ flex: 1, height: '36px' }}
        >
            <FileUp size={14} /> Upload PDF
        </Button>
        <Button 
            type="button" 
            variant={method === 'link' ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setMethod('link')}
            style={{ flex: 1, height: '36px' }}
        >
            <LinkIcon size={14} /> Resume Link
        </Button>
      </div>

      {method === 'link' ? (
        <Input
          name="resumeUrl"
          placeholder="Link to hosted resume (Drive, Dropbox, etc.)"
          value={formData.resumeUrl}
          onChange={handleChange}
          required
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: '12px', 
                padding: '1rem', 
                textAlign: 'center',
                position: 'relative',
                backgroundColor: 'var(--bg-elevated)'
            }}>
                <input 
                    type="file" 
                    name="resumeFile" 
                    onChange={handleChange} 
                    accept=".pdf,.doc,.docx"
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    required={!formData.resumeFile}
                />
                {formData.resumeFile ? (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <FileUp size={20} className="text-gradient" />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formData.resumeFile.name} (Uploaded)</span>
                        {isUploaded && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                   </div>
                ) : (
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        <FileUp size={24} style={{ margin: '0 auto 0.25rem', opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>Click or drag to upload</p>
                    </div>
                )}
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--border-color)', borderRadius: '1.5px' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.2s' }}></div>
                </div>
            )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
        <Input
          label="LinkedIn Profile"
          name="linkedIn"
          placeholder="https://linkedin.com/in/..."
          value={formData.linkedIn}
          onChange={handleChange}
          required
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cover Letter</label>
          <textarea
            name="coverLetter"
            placeholder="Tell us why you are a great fit..."
            value={formData.coverLetter}
            onChange={handleChange}
            style={{
              minHeight: '80px',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              resize: 'vertical',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <Button type="submit" disabled={isSubmitting || (method === 'upload' && !isUploaded)} style={{ width: '100%', height: '44px' }}>
          {isSubmitting ? "Syncing..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
};
