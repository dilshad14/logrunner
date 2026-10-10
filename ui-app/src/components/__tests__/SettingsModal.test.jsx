import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SettingsModal from '../SettingsModal';

describe('SettingsModal', () => {
  const mockClusters = [
    {
      clusterName: 'test-elk',
      type: 'Elastic',
      elasticConfig: { serverUrl: 'http://localhost:9200', apiKey: 'key', indexName: 'logs-*' }
    }
  ];

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SettingsModal isOpen={false} onClose={vi.fn()} clusters={mockClusters} onSaveClusters={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders clusters and buttons when isOpen is true', () => {
    render(
      <SettingsModal isOpen={true} onClose={vi.fn()} clusters={mockClusters} onSaveClusters={vi.fn()} />
    );
    expect(screen.getByText('LogRunner Settings')).toBeTruthy();
    expect(screen.getByText('Export')).toBeTruthy();
    expect(screen.getByText('Import')).toBeTruthy();
    expect(screen.getByDisplayValue('test-elk')).toBeTruthy();
  });

  it('adds a new cluster when Add Cluster is clicked', () => {
    render(
      <SettingsModal isOpen={true} onClose={vi.fn()} clusters={[]} onSaveClusters={vi.fn()} />
    );
    const addBtn = screen.getByText('Add Cluster');
    fireEvent.click(addBtn);
    expect(screen.getByDisplayValue('Cluster-1')).toBeTruthy();
  });
});
