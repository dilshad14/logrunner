import React from 'react';
import { Terminal, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <Terminal className="header-icon" size={24} />
        <div>
          <h1>LogRunner AI</h1>
          <span className="header-subtitle">System Log & Production Support Advisor</span>
        </div>
      </div>
      <div className="status-badge">
        <Activity size={14} className="pulse" />
        <span className="status-dot"></span>
        Log Correlation Engine Active
      </div>
    </header>
  );
}
