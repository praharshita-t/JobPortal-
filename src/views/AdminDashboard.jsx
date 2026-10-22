import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Terminal, 
  Bell, 
  Activity,
  Layers,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';

export default function AdminDashboard({
  workflowStages = [],
  auditLogs = [],
  notifications = [],
  automationActive,
  onToggleAutomation,
  onTriggerManualMatchingCycle
}) {
  const [activeStageDetails, setActiveStageDetails] = useState(workflowStages[0] || null);
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [cycleCompletedMessage, setCycleCompletedMessage] = useState(null);

  const handleRunCycle = () => {
    setIsRunningCycle(true);
    setCycleCompletedMessage(null);
    setTimeout(() => {
      onTriggerManualMatchingCycle();
      setIsRunningCycle(false);
      setCycleCompletedMessage('Batch Matching Engine Cycle #149 Completed: 482 students re-scored across 18 drives.');
      setTimeout(() => setCycleCompletedMessage(null), 5000);
    }, 700);
  };

  return (
    <div className="main-wrapper">
      {/* Editorial Header */}
      <section className="editorial-page-header">
        <div className="editorial-header-left">
          <div className="editorial-header-eyebrow">
            <span className="badge-editorial badge-charcoal">Placement Operations Control</span>
            <span className="label-eyebrow">&bull; Directorate of Corporate Relations</span>
          </div>
          <h1 className="editorial-headline-xl">
            Operations <span className="font-editorial-italic">Control.</span>
          </h1>
          <p className="editorial-subhead" style={{ marginTop: '6px' }}>
            Lightweight recruitment orchestration console: connected pipeline integrity, automated matching cycles, and consent audit logs.
          </p>
        </div>

        {/* Automation Control Panel */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface-white)', 
            border: '1px solid var(--color-charcoal)', 
            boxShadow: 'var(--shadow-editorial)',
            padding: '16px 20px', 
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '290px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Automation Daemon
            </span>
            <span 
              style={{ 
                fontSize: '0.725rem', 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: '3px',
                backgroundColor: automationActive ? 'var(--muted-sage)' : '#FEE2E2',
                color: automationActive ? 'var(--muted-sage-dark)' : '#DC2626'
              }}
            >
              {automationActive ? 'ACTIVE (CRON: 15M)' : 'PAUSED'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn btn-sm ${automationActive ? 'btn-secondary' : 'btn-sage'}`}
              style={{ flex: 1 }}
              onClick={onToggleAutomation}
            >
              {automationActive ? <Pause size={14} /> : <Play size={14} />}
              <span>{automationActive ? 'Pause Auto' : 'Resume Auto'}</span>
            </button>

            <button 
              className="btn btn-sm btn-primary"
              disabled={isRunningCycle}
              onClick={handleRunCycle}
              title="Execute immediate deterministic matching across all active campus drives"
            >
              <RotateCw size={14} className={isRunningCycle ? 'animate-spin' : ''} />
              <span>{isRunningCycle ? 'Scoring...' : 'Trigger Cycle'}</span>
            </button>
          </div>

          {cycleCompletedMessage && (
            <div style={{ fontSize: '0.725rem', color: 'var(--muted-sage-dark)', fontWeight: 600 }}>
              ✓ {cycleCompletedMessage}
            </div>
          )}
        </div>
      </section>

      {/* Compact Operational Overview (Not identical cards, structured strip) */}
      <section className="workspace-stats-strip">
        <div className="stat-strip-cell">
          <div className="stat-strip-value">18</div>
          <div className="stat-strip-label">Active Campus Vacancies</div>
        </div>
        <div className="stat-strip-cell">
          <div className="stat-strip-value">482</div>
          <div className="stat-strip-label">Eligible Students Evaluated</div>
        </div>
        <div className="stat-strip-cell">
          <div className="stat-strip-value">96.4%</div>
          <div className="stat-strip-label">Engine Verification Accuracy</div>
        </div>
        <div className="stat-strip-cell">
          <div className="stat-strip-value" style={{ color: 'var(--muted-sage-dark)' }}>0</div>
          <div className="stat-strip-label">Unconsented Data Disclosures</div>
        </div>
      </section>

      {/* Connected 5-Stage Recruitment Workflow Section */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--color-charcoal)', paddingBottom: '8px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.65rem', margin: 0 }}>
              Recruitment Workflow Execution Pipeline
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-secondary)', marginTop: '2px' }}>
              Connected lifecycle derived from persisted backend records: Job Created &rarr; Matching &rarr; Eligibility Validation &rarr; Email Preview &rarr; Recruiter Shortlist.
            </p>
          </div>
        </div>

        {/* 5 Connected Stages */}
        <div className="workflow-connector-bar">
          {workflowStages.map((stage) => {
            const isSelected = activeStageDetails?.id === stage.id;
            return (
              <div 
                key={stage.id} 
                className={`workflow-stage-card ${stage.status} ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveStageDetails(stage)}
              >
                <div className="workflow-step-num">Step 0{stage.index}</div>
                <div className="workflow-step-name">{stage.name}</div>
                <div className="workflow-step-status" style={{ color: stage.status === 'completed' ? 'var(--muted-sage-dark)' : stage.status === 'active' ? '#4C1D95' : 'var(--color-gray-secondary)' }}>
                  {stage.status === 'completed' && <CheckCircle2 size={13} />}
                  {stage.status === 'active' && <RotateCw size={13} />}
                  <span>{stage.status.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', marginTop: '8px' }}>
                  {stage.itemsCount} Records Processed
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage Inspection Panel */}
        {activeStageDetails && (
          <div style={{ backgroundColor: 'var(--warm-offwhite)', border: '1px solid var(--color-gray-border)', padding: '18px 24px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                Stage Inspection: {activeStageDetails.name}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)' }}>
                Last Verified: {activeStageDetails.lastRun}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-soft)', margin: 0 }}>
              {activeStageDetails.details}
            </p>
          </div>
        )}
      </section>

      {/* Two Column Section: Chronological Audit Activity Feed & Notification Delivery Audit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Left: Notification Delivery & Idempotency Table */}
        <section>
          <div style={{ borderBottom: '1px solid var(--color-charcoal)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.45rem', margin: 0 }}>
              Notification Delivery & Duplicate Prevention
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)' }}>
              Idempotency Verification
            </span>
          </div>

          <div className="data-table-container">
            <table className="data-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Notification Type</th>
                  <th>Status</th>
                  <th>Idempotency Key</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(notif => (
                  <tr key={notif.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{notif.recipientName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-secondary)' }}>{notif.recipientEmail}</div>
                    </td>
                    <td>
                      <div>{notif.type}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-secondary)' }}>{notif.company}</div>
                    </td>
                    <td>
                      <span style={{ backgroundColor: 'var(--muted-sage)', color: 'var(--muted-sage-dark)', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                        {notif.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.675rem', color: 'var(--color-gray-secondary)' }}>
                        {notif.idempotencyKey.slice(0, 16)}...
                      </span>
                    </td>
                    <td style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)' }}>
                      {notif.deliveryTimestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Chronological Operations Audit Feed */}
        <section>
          <div style={{ borderBottom: '1px solid var(--color-charcoal)', paddingBottom: '8px', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.45rem', margin: 0 }}>
              Placement Security & Audit Log
            </h2>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', borderRadius: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {auditLogs.map(log => (
                <div key={log.id} style={{ borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-subtle)' }}>
                      {log.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.775rem', color: 'var(--color-gray-secondary)', margin: '0 0 4px 0' }}>
                    {log.details}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: 'var(--color-charcoal-soft)' }}>
                    <span>Actor: <strong>{log.user}</strong></span>
                    <span>&bull;</span>
                    <span style={{ fontWeight: 600, color: log.level === 'SECURITY' ? 'var(--muted-sage-dark)' : 'inherit' }}>{log.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
