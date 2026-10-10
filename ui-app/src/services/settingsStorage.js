const STORAGE_KEY = 'logrunner_cluster_settings';

export const DEFAULT_CLUSTERS = [
  {
    clusterName: 'Production-ELK',
    type: 'Elastic',
    elasticConfig: {
      serverUrl: 'https://elk.internal.company.com:9200',
      apiKey: '',
      indexName: 'app-orders-*'
    },
    cloudwatchConfig: {
      region: 'us-east-1',
      logGroupName: '',
      accessKeyId: '',
      secretAccessKey: ''
    }
  }
];

export function loadClusterSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CLUSTERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CLUSTERS;
  } catch (e) {
    console.error('Failed to load cluster settings from localStorage:', e);
    return DEFAULT_CLUSTERS;
  }
}

export function saveClusterSettings(clusters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clusters));
  } catch (e) {
    console.error('Failed to save cluster settings to localStorage:', e);
  }
}

export function exportSettingsFile(clusters) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clusters, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "logrunner.setting.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importSettingsFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file selected'));
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid settings file: Expected JSON array of clusters.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
