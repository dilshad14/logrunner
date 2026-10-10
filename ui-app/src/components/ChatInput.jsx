import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Calendar, Clock, Globe, Database, Settings, CheckSquare, Square } from 'lucide-react';

export default function ChatInput({ onSendMessage, isLoading, clusters = [], onOpenSettings }) {
  const [text, setText] = useState('');
  const [orderDetail, setOrderDetail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timezone, setTimezone] = useState('SGT');
  const [selectedClusterNames, setSelectedClusterNames] = useState([]);
  const textareaRef = useRef(null);

  // Sync selected clusters when clusters list changes
  useEffect(() => {
    if (clusters && clusters.length > 0) {
      setSelectedClusterNames(prev => {
        const availableNames = clusters.map(c => c.clusterName);
        if (prev.length === 0) {
          // Default: select all configured clusters
          return availableNames;
        }
        // Keep valid previously selected clusters plus any new clusters
        return prev.filter(name => availableNames.includes(name));
      });
    } else {
      setSelectedClusterNames([]);
    }
  }, [clusters]);

  const handleToggleCluster = (name) => {
    setSelectedClusterNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleSelectAll = () => {
    if (selectedClusterNames.length === clusters.length) {
      setSelectedClusterNames([]);
    } else {
      setSelectedClusterNames(clusters.map(c => c.clusterName));
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if ((trimmed || orderDetail.trim()) && !isLoading) {
      const activeClusters = clusters.filter(c => selectedClusterNames.includes(c.clusterName));

      onSendMessage({
        text: trimmed,
        orderDetail: orderDetail.trim(),
        startDate,
        endDate,
        timezone,
        selectedClusters: activeClusters
      });
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '52px';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    e.target.style.height = '52px';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
  };

  return (
    <div className="input-container">
      {/* Data Sources Selection Bar */}
      <div className="datasources-container">
        <div className="datasources-header">
          <div className="datasources-title">
            <Database size={14} className="datasources-icon" />
            <span>Data Sources</span>
          </div>
          {clusters.length > 0 && (
            <button
              type="button"
              className="datasources-toggle-all-btn"
              onClick={handleSelectAll}
            >
              {selectedClusterNames.length === clusters.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {clusters.length === 0 ? (
          <div className="datasources-empty-hint">
            <span>No data sources configured yet.</span>
            <button type="button" className="inline-settings-btn" onClick={onOpenSettings}>
              <Settings size={13} />
              Add Clusters in Settings
            </button>
          </div>
        ) : (
          <div className="cluster-checkboxes-list">
            {clusters.map((cluster) => {
              const isChecked = selectedClusterNames.includes(cluster.clusterName);
              return (
                <label
                  key={cluster.clusterName}
                  className={`cluster-checkbox-pill ${isChecked ? 'active' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleCluster(cluster.clusterName)}
                    disabled={isLoading}
                  />
                  {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
                  <span className="cluster-name-text">{cluster.clusterName}</span>
                  <span className="cluster-type-mini-badge">{cluster.type}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Parameter Grid */}
      <div className="param-grid">
        <div className="param-field">
          <label className="param-label">
            <FileText size={12} />
            Order / Txn Ref
          </label>
          <input
            type="text"
            className="param-input"
            placeholder="e.g. ORD-99410 or TXN-4412"
            value={orderDetail}
            onChange={(e) => setOrderDetail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="param-field">
          <label className="param-label">
            <Calendar size={12} />
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            className="param-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="param-field">
          <label className="param-label">
            <Clock size={12} />
            End Date & Time
          </label>
          <input
            type="datetime-local"
            className="param-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="param-field">
          <label className="param-label">
            <Globe size={12} />
            Timezone
          </label>
          <select
            className="param-select"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={isLoading}
          >
            <option value="SGT">SGT</option>
            <option value="UCT">UCT</option>
          </select>
        </div>
      </div>

      {/* Query Text Area & Send Button */}
      <div className="input-box">
        <textarea
          ref={textareaRef}
          className="text-area"
          placeholder="Ask LogRunner AI about log correlation, order failures, AWS CloudWatch / ELK traces... (Shift+Enter to send)"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button 
          className="send-btn" 
          onClick={handleSend} 
          disabled={(!text.trim() && !orderDetail.trim()) || isLoading}
          title="Send (Shift+Enter)"
        >
          <Send size={18} />
          Send
        </button>
      </div>
    </div>
  );
}
