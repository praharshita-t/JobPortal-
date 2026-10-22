import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Check,
  ChevronRight,
  ShieldCheck,
  Building,
  GraduationCap
} from 'lucide-react';
import { api } from '../utils/api';

export default function ResumeUploadSection({
  onApplyExtraction,
  onCancel,
  currentProfile
}) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionStage, setExtractionStage] = useState(''); // 'uploading' | 'extracting' | 'analyzing'
  const [errorMessage, setErrorMessage] = useState(null);
  const [extractionResult, setExtractionResult] = useState(null);
  const [editableReview, setEditableReview] = useState(null);
  const [preserveExisting, setPreserveExisting] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setErrorMessage(null);
    setSaveSuccess(false);

    // Frontend validation: Size
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds the maximum allowable limit of 5MB.");
      return;
    }

    // Frontend validation: Extension
    const nameLower = selectedFile.name.toLowerCase();
    if (!nameLower.endsWith('.pdf') && !nameLower.endsWith('.docx')) {
      setErrorMessage("Unsupported format. Please select an authentic PDF (.pdf) or Word (.docx) resume.");
      return;
    }

    setFile(selectedFile);
    processUpload(selectedFile);
  };

  const processUpload = async (fileToUpload) => {
    setIsUploading(true);
    setExtractionResult(null);
    setErrorMessage(null);
    setUploadProgress(20);
    setExtractionStage('Uploading document to secure processing pipeline...');

    try {
      const stageTimer1 = setTimeout(() => {
        setUploadProgress(50);
        setExtractionStage('Extracting textual structure & tables (PDF / DOCX engine)...');
      }, 700);

      const stageTimer2 = setTimeout(() => {
        setUploadProgress(85);
        setExtractionStage('Normalizing academic parameters, tech inventory & project evidence...');
      }, 1500);

      const result = await api.students.uploadResume(fileToUpload);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setUploadProgress(100);
      setExtractionStage('Extraction completed successfully.');
      setIsUploading(false);

      setExtractionResult(result);

      // Pre-fill editable review state
      setEditableReview({
        full_name: result.full_name || currentProfile?.full_name || '',
        phone: result.phone || currentProfile?.phone || '',
        college: result.college || currentProfile?.college || '',
        degree: result.degree || currentProfile?.degree || 'B.Tech',
        branch: result.branch || currentProfile?.branch || 'Computer Science & Engineering',
        graduation_year: result.graduation_year || currentProfile?.graduation_year || 2026,
        cgpa: result.cgpa !== null && result.cgpa !== undefined ? result.cgpa : (currentProfile?.cgpa || ''),
        cgpa_scale: result.cgpa_scale || currentProfile?.cgpa_scale || 10.0,
        skills: [...(result.skills || [])],
        projects: [...(result.projects || [])],
        experience: [...(result.experience || [])],
        certifications: [...(result.certifications || [])],
        resume_filename: fileToUpload.name,
        extraction_metadata: {
          extractor: result.extractor,
          confidence_scores: result.confidence_scores,
          source_evidence: result.source_evidence,
          uncertain_fields: result.uncertain_fields,
          missing_fields: result.missing_fields,
          character_count: result.raw_character_count
        }
      });

    } catch (err) {
      setIsUploading(false);
      setErrorMessage(err.message || "Failed to process resume. Please ensure the file is an uncorrupted PDF or DOCX.");
    }
  };

  const handleSaveConfirmed = async () => {
    if (!editableReview) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload = {
        overwrite_existing: !preserveExisting,
        profile_data: {
          ...editableReview,
          cgpa: editableReview.cgpa ? parseFloat(editableReview.cgpa) : null,
          graduation_year: editableReview.graduation_year ? parseInt(editableReview.graduation_year) : null
        }
      };

      const updatedProfile = await api.students.confirmResume(payload);
      setIsSaving(false);
      setSaveSuccess(true);

      if (onApplyExtraction) {
        onApplyExtraction(updatedProfile);
      }
    } catch (err) {
      setIsSaving(false);
      setErrorMessage(err.message || "Failed to apply extracted profile data.");
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--warm-offwhite)', borderRadius: '6px', border: '1px solid var(--color-gray-border)', padding: '20px', marginBottom: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-editorial badge-lavender" style={{ fontSize: '0.7rem' }}>
              <Sparkles size={12} />
              Resume Intelligence
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)' }}>
              PDF or DOCX &bull; Max 5MB
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.4rem', margin: '4px 0 2px 0' }}>
            Instant Student Profile Autofill
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-charcoal-soft)', margin: 0 }}>
            Upload your technical resume to automatically populate personal records, degree credentials, verified skills, and project portfolios.
          </p>
        </div>
      </div>

      {/* Upload Dropzone (When not in review mode) */}
      {!extractionResult && !isUploading && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          style={{
            border: '2px dashed var(--primary-lavender)',
            borderRadius: '6px',
            backgroundColor: 'var(--color-surface-white)',
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileSelect(e.target.files[0])} 
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            style={{ display: 'none' }} 
          />

          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--pale-lavender)', color: 'var(--color-charcoal)', marginBottom: '10px' }}>
            <UploadCloud size={24} />
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
            Drag and drop your resume here, or <span style={{ color: '#7C3AED', textDecoration: 'underline' }}>browse files</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)', marginTop: '4px' }}>
            Supports PDF (.pdf) and Microsoft Word (.docx). Documents are parsed securely in memory and never exposed publicly.
          </div>
        </div>
      )}

      {/* Uploading & Extraction Animation */}
      {isUploading && (
        <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', borderRadius: '6px', padding: '24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--pale-lavender)', marginBottom: '12px' }}>
            <RefreshCw size={22} className="spin" style={{ color: 'var(--primary-lavender)' }} />
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-charcoal)' }}>
            {extractionStage}
          </div>
          <div style={{ width: '100%', maxWidth: '320px', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', margin: '14px auto 6px auto', overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary-lavender)', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)' }}>
            Parsing: {file?.name} ({Math.round(file?.size / 1024)} KB)
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="eligibility-alert-fail" style={{ marginTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Extraction Error:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Scanned Warning Notification */}
      {extractionResult?.warning && (
        <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '4px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{extractionResult.warning}</div>
        </div>
      )}

      {/* Review & Confirmation Screen */}
      {extractionResult && editableReview && !saveSuccess && (
        <div style={{ marginTop: '14px', backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', borderRadius: '6px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '10px', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-sage-dark)' }}>
                Extracted Intelligence Review
              </div>
              <h4 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', color: 'var(--color-charcoal)' }}>
                Confirm Profile Elements from '{file?.name}'
              </h4>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge-editorial badge-sage" style={{ fontSize: '0.7rem' }}>
                Engine: {extractionResult.extractor === 'gemini_ai' ? 'Gemini AI Vision' : 'Deterministic Heuristic'}
              </span>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => { setExtractionResult(null); setFile(null); }}
                style={{ fontSize: '0.75rem' }}
              >
                Re-upload
              </button>
            </div>
          </div>

          {/* Missing or Uncertain Fields Callout */}
          {(extractionResult.missing_fields?.length > 0 || extractionResult.uncertain_fields?.length > 0) && (
            <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 12px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.8rem', color: '#92400E' }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <AlertTriangle size={14} />
                <span>Verification Attention Required:</span>
              </div>
              <div>
                {extractionResult.missing_fields?.length > 0 && (
                  <span>Missing in resume: <strong>{extractionResult.missing_fields.join(', ')}</strong>. </span>
                )}
                {extractionResult.uncertain_fields?.length > 0 && (
                  <span>Requires user verification: <strong>{extractionResult.uncertain_fields.join(', ')}</strong>.</span>
                )}
              </div>
            </div>
          )}

          {/* Inline Edit Form for Key Parameters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Full Name
              </label>
              <input 
                type="text" 
                className="input-text" 
                value={editableReview.full_name} 
                onChange={(e) => setEditableReview({ ...editableReview, full_name: e.target.value })}
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Contact Phone
              </label>
              <input 
                type="text" 
                className="input-text" 
                value={editableReview.phone} 
                onChange={(e) => setEditableReview({ ...editableReview, phone: e.target.value })}
                placeholder="+91..."
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                College / University
              </label>
              <input 
                type="text" 
                className="input-text" 
                value={editableReview.college} 
                onChange={(e) => setEditableReview({ ...editableReview, college: e.target.value })}
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Degree
              </label>
              <input 
                type="text" 
                className="input-text" 
                value={editableReview.degree} 
                onChange={(e) => setEditableReview({ ...editableReview, degree: e.target.value })}
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Branch / Specialization
              </label>
              <input 
                type="text" 
                className="input-text" 
                value={editableReview.branch} 
                onChange={(e) => setEditableReview({ ...editableReview, branch: e.target.value })}
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Graduation Cohort Year
              </label>
              <input 
                type="number" 
                className="input-text" 
                value={editableReview.graduation_year} 
                onChange={(e) => setEditableReview({ ...editableReview, graduation_year: e.target.value })}
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Verified CGPA (Scale {editableReview.cgpa_scale})
              </label>
              <input 
                type="number" 
                step="0.01" 
                className="input-text" 
                value={editableReview.cgpa} 
                onChange={(e) => setEditableReview({ ...editableReview, cgpa: e.target.value })}
                placeholder="e.g. 8.50"
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
            </div>
          </div>

          {/* Extracted Skills Chips */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
              Extracted Technical Inventory ({editableReview.skills.length} skills detected):
            </div>
            <div className="skills-chip-group" style={{ margin: 0 }}>
              {editableReview.skills.map((s, idx) => (
                <span key={idx} className="skill-chip skill-chip-verified" style={{ fontSize: '0.75rem' }}>
                  <CheckCircle2 size={12} />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Extracted Projects Preview */}
          {editableReview.projects.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                Extracted Project Portfolios ({editableReview.projects.length} detected):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {editableReview.projects.map((p, idx) => (
                  <div key={idx} style={{ backgroundColor: 'var(--warm-offwhite)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-gray-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{p.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)', margin: '2px 0 4px 0' }}>{p.description}</div>
                    {p.technologies?.length > 0 && (
                      <div className="skills-chip-group" style={{ margin: 0 }}>
                        {p.technologies.map((t, ti) => (
                          <span key={ti} className="skill-chip skill-chip-lavender" style={{ fontSize: '0.675rem' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preservation Directive */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: 'var(--warm-offwhite)', borderRadius: '4px', marginBottom: '14px', border: '1px solid var(--color-gray-border)' }}>
            <input 
              type="checkbox" 
              id="preserveExisting" 
              checked={preserveExisting} 
              onChange={(e) => setPreserveExisting(e.target.checked)} 
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="preserveExisting" style={{ fontSize: '0.775rem', color: 'var(--color-charcoal)', cursor: 'pointer' }}>
              <strong>Preserve manual profile inputs:</strong> Merges newly extracted skills and projects without overwriting existing non-empty fields.
            </label>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => { setExtractionResult(null); setFile(null); }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveConfirmed}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isSaving ? <RefreshCw size={14} className="spin" /> : <Check size={16} />}
              <span>{isSaving ? 'Applying to Profile...' : 'Confirm & Save to Profile'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Success State */}
      {saveSuccess && (
        <div style={{ backgroundColor: 'var(--muted-sage-bg)', border: '1px solid #C2E4D9', borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--muted-sage-dark)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--muted-sage-dark)' }}>
                Profile Successfully Updated
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--color-charcoal-soft)' }}>
                Extracted credentials and technical inventory have been saved to your verified profile.
              </div>
            </div>
          </div>
          <button 
            className="btn btn-sm btn-ghost" 
            onClick={() => { setSaveSuccess(false); setExtractionResult(null); setFile(null); }}
            style={{ fontSize: '0.75rem' }}
          >
            Upload Another
          </button>
        </div>
      )}
    </div>
  );
}
