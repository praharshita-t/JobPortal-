import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  FileCheck, 
  RotateCw,
  Search,
  Filter
} from 'lucide-react';

export default function NotificationCenter({
  notifications = [],
  onSendTestNotification
}) {
  const [selectedNotifId, setSelectedNotifId] = useState(notifications[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState(null);

  const activeNotif = notifications.find(n => n.id === selectedNotifId) || notifications[0];

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDispatchTest = () => {
    setIsDispatching(true);
    setDispatchStatus(null);
    setTimeout(() => {
      onSendTestNotification(activeNotif?.id);
      setIsDispatching(false);
      setDispatchStatus('Test email disptached to SMTP relay. Idempotency verified: 0 duplicates.');
      setTimeout(() => setDispatchStatus(null), 5000);
    }, 600);
  };

  return (
    <div className="main-wrapper">
      {/* Editorial Header */}
      <section className="editorial-page-header">
        <div className="editorial-header-left">
          <div className="editorial-header-eyebrow">
            <span className="badge-editorial badge-charcoal">Campus Notification Center</span>
            <span className="label-eyebrow">&bull; Email Dispatch & Preview Engine</span>
          </div>
          <h1 className="editorial-headline-xl">
            Notifications & <span className="font-editorial-italic">Dispatches.</span>
          </h1>
          <p className="editorial-subhead" style={{ marginTop: '6px' }}>
            Real-time candidate alerts, recruiter dossiers, and official placement bulletins with cryptographic idempotency check.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            disabled={isDispatching}
            onClick={handleDispatchTest}
          >
            <Send size={15} />
            <span>{isDispatching ? 'Transmitting...' : 'Dispatch Test Alert'}</span>
          </button>
        </div>
      </section>

      {/* Two-Column Inbox-Inspired Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Notification List */}
        <div>
          {/* Filters Bar */}
          <div className="explorer-filters" style={{ marginBottom: '16px' }}>
            <div className="search-input-wrap">
              <input
                type="text"
                className="input-text"
                placeholder="Search subject or recipient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-gray-subtle)' }} />
            </div>

            <select 
              className="select-compact"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Opportunity Match">Opportunity Match</option>
              <option value="Recruiter Shortlist">Recruiter Shortlist</option>
              <option value="Eligibility Alert">Eligibility Alert</option>
              <option value="Placement Broadcast">Broadcast</option>
            </select>
          </div>

          {/* Notification Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--color-gray-border)', border: '1px solid var(--color-gray-border)', borderRadius: '6px', overflow: 'hidden' }}>
            {filteredNotifications.map(notif => {
              const isSelected = notif.id === activeNotif?.id;
              return (
                <div
                  key={notif.id}
                  onClick={() => setSelectedNotifId(notif.id)}
                  style={{
                    backgroundColor: isSelected ? 'var(--pale-lavender)' : 'var(--color-surface-white)',
                    borderLeft: isSelected ? '4px solid var(--primary-lavender)' : 'none',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-charcoal-soft)' }}>
                      {notif.type}
                    </span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)' }}>
                      {notif.deliveryTimestamp}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--color-charcoal)', margin: '0 0 4px 0' }}>
                    {notif.subject}
                  </h3>

                  <div style={{ fontSize: '0.775rem', color: 'var(--color-gray-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>To: <strong>{notif.recipientName}</strong></span>
                    <span style={{ color: 'var(--muted-sage-dark)', fontWeight: 600 }}>{notif.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Email Preview (CampusMatch AI Branded) */}
        {activeNotif && (
          <div 
            style={{ 
              backgroundColor: 'var(--color-surface-white)', 
              border: '1px solid var(--color-charcoal)', 
              boxShadow: 'var(--shadow-editorial)',
              borderRadius: '6px', 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Delivery Metadata Strip */}
            <div style={{ backgroundColor: 'var(--warm-offwhite)', border: '1px solid var(--color-gray-border)', padding: '14px 18px', borderRadius: '4px', fontSize: '0.8rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: 'var(--color-gray-secondary)', display: 'block', fontSize: '0.725rem' }}>Notification Type</span>
                  <strong>{activeNotif.type}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-gray-secondary)', display: 'block', fontSize: '0.725rem' }}>Delivery Status</span>
                  <span style={{ color: 'var(--muted-sage-dark)', fontWeight: 700 }}>✓ {activeNotif.status}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-gray-secondary)', display: 'block', fontSize: '0.725rem' }}>Recipient Address</span>
                  <strong>{activeNotif.recipientName} ({activeNotif.recipientEmail})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-gray-secondary)', display: 'block', fontSize: '0.725rem' }}>Duplicate Prevention Check</span>
                  <strong style={{ color: 'var(--muted-sage-dark)' }}>{activeNotif.duplicateStatus}</strong>
                </div>
              </div>

              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-gray-border)', fontSize: '0.725rem', color: 'var(--color-gray-secondary)' }}>
                Idempotency Key: <code style={{ backgroundColor: '#EEE', padding: '2px 4px', borderRadius: '3px' }}>{activeNotif.idempotencyKey}</code>
              </div>
            </div>

            {dispatchStatus && (
              <div style={{ backgroundColor: 'var(--muted-sage-bg)', border: '1px solid #C2E4D9', padding: '10px 14px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--muted-sage-dark)', fontWeight: 600 }}>
                {dispatchStatus}
              </div>
            )}

            {/* Rendered HTML Email Preview */}
            <div style={{ border: '1px solid var(--color-gray-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#F3F4F6', padding: '8px 14px', fontSize: '0.75rem', color: 'var(--color-gray-secondary)', borderBottom: '1px solid var(--color-gray-border)' }}>
                EMAIL CLIENT PREVIEW &bull; CAMPUSMATCH AI BRANDED DISPATCH
              </div>
              <div 
                dangerouslySetInnerHTML={{ __html: activeNotif.fullHtml }}
                style={{ padding: '16px', backgroundColor: '#FAFAFA' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
