import React from 'react';
import { Terminal, Activity, Settings } from 'lucide-react';

export default function Header({ onOpenSettings }) {
  return (
    <header className="header">
      <div className="header-brand">
        <Terminal className="header-icon" size={24} />
        <div>
          <h1>LogRunner AI</h1>
          <span className="header-subtitle">System Log & Production Support Advisor</span>
        </div>
      </div>
      <div className="header-right-area">
        <div className="status-badge">
          <Activity size={14} className="pulse" />
          <span className="status-dot"></span>
          Log Correlation Engine Active
        </div>
        <button
          className="settings-btn"
          onClick={onOpenSettings}
          title="Cluster & Data Source Settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
