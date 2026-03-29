import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { FileUp, Link as LinkIcon, CheckCircle2 } from "lucide-react";

export const ApplyForm = ({ onSubmit, jobTitle, isSubmitting = false }) => {
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ padding: '1.25rem', backgroundColor: 'var(--primary-light)', borderRadius: '16px', marginBottom: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 700 }}>Applying for: {jobTitle}</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Button 
            type="button" 
            variant={method === 'upload' ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setMethod('upload')}
            style={{ flex: 1 }}
        >
            <FileUp size={16} /> Upload Resume
        </Button>
        <Button 
            type="button" 
            variant={method === 'link' ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setMethod('link')}
            style={{ flex: 1 }}
        >
            <LinkIcon size={16} /> Resume Link
        </Button>
      </div>

      {method === 'link' ? (
        <Input
          label="Resume Link (Google Drive / Dropbox)"
          name="resumeUrl"
          placeholder="https://drive.google.com/..."
          value={formData.resumeUrl}
          onChange={handleChange}
          required
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upload PDF/Word Resume</label>
            <div style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: '12px', 
                padding: '1.5rem', 
                textAlign: 'center',
                position: 'relative'
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
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        <FileUp size={24} className="text-gradient" />
                        <span style={{ fontWeight: 600 }}>{formData.resumeFile.name}</span>
                        {isUploaded && <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />}
                   </div>
                ) : (
                    <div style={{ color: 'var(--text-tertiary)' }}>
                        <FileUp size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>Click or drag to upload (Max 5MB)</p>
                    </div>
                )}
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.2s', borderRadius: '2px' }}></div>
                </div>
            )}
        </div>
      )}

      <Input
        label="LinkedIn Profile"
        name="linkedIn"
        placeholder="https://linkedin.com/in/..."
        value={formData.linkedIn}
        onChange={handleChange}
        required
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Brief Intro / Cover Letter</label>
        <textarea
          name="coverLetter"
          placeholder="Tell us why you are a great fit..."
          value={formData.coverLetter}
          onChange={handleChange}
          style={{
            minHeight: '100px',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <Button type="submit" disabled={isSubmitting || (method === 'upload' && !isUploaded)}>
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
};
