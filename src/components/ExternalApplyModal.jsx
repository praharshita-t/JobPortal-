import React from 'react';
import { X, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ExternalApplyModal({
  job,
  isOpen,
  onClose
}) {
  if (!isOpen || !job) return null;

  const hasUrl = !!job.application_url;

  const handleOpenLink = () => {
    if (hasUrl) {
      window.open(job.application_url, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-lg" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px' }}
      >
        <div className="modal-header">
          <div>
            <div className="label-eyebrow" style={{ color: 'var(--color-charcoal-soft)', marginBottom: '4px' }}>
              External Application Portal
            </div>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.85rem', margin: 0 }}>
              {hasUrl ? 'Leaving CampusMatch AI' : 'Application Link Unavailable'}
            </h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px', gap: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-charcoal)', margin: '0 0 4px 0' }}>
              {job.title}
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-secondary)' }}>
              <strong>{job.company || 'Unspecified Organization'}</strong> &bull; {job.domain}
            </div>
          </div>

          {hasUrl ? (
            <div style={{ backgroundColor: 'var(--warm-offwhite)', border: '1px solid var(--color-gray-border)', padding: '16px', borderRadius: '4px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-charcoal)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                You are leaving CampusMatch AI to apply directly on the original opportunity website:
              </p>
              <div style={{ wordBreak: 'break-all', backgroundColor: '#F3F4F6', padding: '10px 12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#1E293B', border: '1px solid #E2E8F0' }}>
                {job.application_url}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)', margin: '10px 0 0 0' }}>
                All referral parameters, query strings, and tracking tokens are strictly preserved as supplied in the official announcement.
              </p>
            </div>
          ) : (
            <div className="eligibility-alert-fail">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
                <AlertCircle size={16} />
                <span>No Official Application URL Available</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>
                This record is an informational lead (e.g. Park+ hiring bulletin). Per institutional accuracy guidelines, no application link was published, and we do not invent fake URLs.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {hasUrl ? (
              <button 
                className="btn btn-primary"
                onClick={handleOpenLink}
              >
                <span>Continue to Official Application</span>
                <ExternalLink size={16} />
              </button>
            ) : (
              <button 
                className="btn btn-secondary"
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                Apply Disabled (Lead Only)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
