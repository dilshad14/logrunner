import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Download, Upload, Database, Cloud, Server, Shield } from 'lucide-react';
import { exportSettingsFile, importSettingsFile } from '../services/settingsStorage';

export default function SettingsModal({ isOpen, onClose, clusters, onSaveClusters }) {
  const [localClusters, setLocalClusters] = useState(clusters || []);
  const [activeTab, setActiveTab] = useState('datasources');
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleAddCluster = () => {
    const newCluster = {
      clusterName: `Cluster-${localClusters.length + 1}`,
      type: 'Elastic',
      elasticConfig: {
        serverUrl: '',
        apiKey: '',
        indexName: 'app-logs-*'
      },
      cloudwatchConfig: {
        region: 'us-east-1',
        logGroupName: '',
        accessKeyId: '',
        secretAccessKey: ''
      }
    };
    setLocalClusters([...localClusters, newCluster]);
  };

  const handleRemoveCluster = (index) => {
    setLocalClusters(localClusters.filter((_, i) => i !== index));
  };

  const handleClusterChange = (index, field, value) => {
    const updated = [...localClusters];
    updated[index] = { ...updated[index], [field]: value };
    setLocalClusters(updated);
  };

  const handleElasticConfigChange = (index, field, value) => {
    const updated = [...localClusters];
    const cfg = { ...(updated[index].elasticConfig || {}) };
    cfg[field] = value;
    updated[index] = { ...updated[index], elasticConfig: cfg };
    setLocalClusters(updated);
  };

  const handleCloudWatchConfigChange = (index, field, value) => {
    const updated = [...localClusters];
    const cfg = { ...(updated[index].cloudwatchConfig || {}) };
    cfg[field] = value;
    updated[index] = { ...updated[index], cloudwatchConfig: cfg };
    setLocalClusters(updated);
  };

  const handleExport = () => {
    exportSettingsFile(localClusters);
  };

  const handleImportClick = () => {
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importSettingsFile(file);
      setLocalClusters(imported);
      setImportError(null);
    } catch (err) {
      setImportError('Import failed: ' + err.message);
    }
  };

  const handleSaveAndClose = () => {
    onSaveClusters(localClusters);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-area">
            <Database size={20} className="modal-icon" />
            <div>
              <h2>LogRunner Settings</h2>
              <span className="modal-subtitle">Configure on-prem, AWS CloudWatch, and Elasticsearch clusters</span>
            </div>
          </div>
          <div className="modal-header-actions">
            <button className="secondary-btn" onClick={handleExport} title="Export settings to logrunner.setting.json">
              <Download size={15} />
              Export
            </button>
            <button className="secondary-btn" onClick={handleImportClick} title="Import settings from JSON file">
              <Upload size={15} />
              Import
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleFileChange}
            />
            <button className="close-btn" onClick={onClose} title="Close settings">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'datasources' ? 'active' : ''}`}
            onClick={() => setActiveTab('datasources')}
          >
            <Server size={15} />
            Data Sources ({localClusters.length})
          </button>
        </div>

        {importError && (
          <div className="modal-error-banner">
            {importError}
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body">
          {localClusters.length === 0 ? (
            <div className="modal-empty-state">
              <Database size={36} />
              <p>No clusters configured. Click "+ Add Cluster" below to configure Elasticsearch or AWS CloudWatch.</p>
            </div>
          ) : (
            <div className="cluster-list">
              {localClusters.map((cluster, idx) => (
                <div key={idx} className="cluster-card">
                  <div className="cluster-card-header">
                    <div className="cluster-card-title">
                      {cluster.type === 'Cloudwatch' ? <Cloud size={16} /> : <Database size={16} />}
                      <span>{cluster.clusterName || `Cluster #${idx + 1}`}</span>
                      <span className="cluster-type-badge">{cluster.type}</span>
                    </div>
                    <button
                      className="icon-danger-btn"
                      onClick={() => handleRemoveCluster(idx)}
                      title="Delete Cluster"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="cluster-fields-grid">
                    <div className="cluster-field">
                      <label>Data Source Type</label>
                      <select
                        className="modal-select"
                        value={cluster.type || 'Elastic'}
                        onChange={(e) => handleClusterChange(idx, 'type', e.target.value)}
                      >
                        <option value="Elastic">Elastic</option>
                        <option value="Cloudwatch">Cloudwatch</option>
                      </select>
                    </div>

                    <div className="cluster-field">
                      <label>Cluster Name (Friendly Reference)</label>
                      <input
                        type="text"
                        className="modal-input"
                        placeholder="e.g. prod-elk-us or staging-cloudwatch"
                        value={cluster.clusterName || ''}
                        onChange={(e) => handleClusterChange(idx, 'clusterName', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Dynamic fields based on Data Source Type */}
                  {cluster.type === 'Elastic' ? (
                    <div className="source-specific-box">
                      <div className="box-title">
                        <Server size={14} /> Elasticsearch Configuration
                      </div>
                      <div className="cluster-fields-grid">
                        <div className="cluster-field full-width">
                          <label>ElasticSearch Server URL</label>
                          <input
                            type="text"
                            className="modal-input"
                            placeholder="https://elasticsearch-cluster.company.internal:9200"
                            value={cluster.elasticConfig?.serverUrl || ''}
                            onChange={(e) => handleElasticConfigChange(idx, 'serverUrl', e.target.value)}
                          />
                        </div>
                        <div className="cluster-field">
                          <label>API Key / Token</label>
                          <input
                            type="password"
                            className="modal-input"
                            placeholder="Enter Elastic API key"
                            value={cluster.elasticConfig?.apiKey || ''}
                            onChange={(e) => handleElasticConfigChange(idx, 'apiKey', e.target.value)}
                          />
                        </div>
                        <div className="cluster-field">
                          <label>Index Name / Pattern</label>
                          <input
                            type="text"
                            className="modal-input"
                            placeholder="e.g. app-logs-* or order-service-*"
                            value={cluster.elasticConfig?.indexName || ''}
                            onChange={(e) => handleElasticConfigChange(idx, 'indexName', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="source-specific-box">
                      <div className="box-title">
                        <Cloud size={14} /> AWS CloudWatch Configuration
                      </div>
                      <div className="cluster-fields-grid">
                        <div className="cluster-field">
                          <label>AWS Region</label>
                          <input
                            type="text"
                            className="modal-input"
                            placeholder="e.g. us-east-1, ap-southeast-1"
                            value={cluster.cloudwatchConfig?.region || ''}
                            onChange={(e) => handleCloudWatchConfigChange(idx, 'region', e.target.value)}
                          />
                        </div>
                        <div className="cluster-field">
                          <label>Log Group Name</label>
                          <input
                            type="text"
                            className="modal-input"
                            placeholder="/aws/eks/order-cluster/production"
                            value={cluster.cloudwatchConfig?.logGroupName || ''}
                            onChange={(e) => handleCloudWatchConfigChange(idx, 'logGroupName', e.target.value)}
                          />
                        </div>
                        <div className="cluster-field">
                          <label>Access Key ID</label>
                          <input
                            type="password"
                            className="modal-input"
                            placeholder="AKIA..."
                            value={cluster.cloudwatchConfig?.accessKeyId || ''}
                            onChange={(e) => handleCloudWatchConfigChange(idx, 'accessKeyId', e.target.value)}
                          />
                        </div>
                        <div className="cluster-field">
                          <label>Secret Access Key</label>
                          <input
                            type="password"
                            className="modal-input"
                            placeholder="AWS Secret Key"
                            value={cluster.cloudwatchConfig?.secretAccessKey || ''}
                            onChange={(e) => handleCloudWatchConfigChange(idx, 'secretAccessKey', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button className="add-cluster-btn" onClick={handleAddCluster}>
            <Plus size={16} />
            Add Cluster
          </button>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="security-notice">
            <Shield size={14} />
            <span>Credentials are securely isolated & never passed to the LLM.</span>
          </div>
          <div className="modal-footer-btns">
            <button className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-btn" onClick={handleSaveAndClose}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
