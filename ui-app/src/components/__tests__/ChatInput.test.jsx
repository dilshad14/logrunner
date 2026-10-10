import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ChatInput from '../ChatInput';

describe('ChatInput', () => {
  const dummyClusters = [
    {
      clusterName: 'prod-elk',
      type: 'Elastic',
      elasticConfig: { serverUrl: 'http://localhost:9200', apiKey: '', indexName: 'logs-*' }
    }
  ];

  it('calls onSendMessage when Shift+Enter is pressed and passes selectedClusters with default SGT timezone', async () => {
    const mockSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} clusters={dummyClusters} />);
    
    const textarea = screen.getByPlaceholderText(/Shift\+Enter to send/i);
    await user.type(textarea, 'Fetch order logs{Shift>}{Enter}{/Shift}');
    
    expect(mockSend).toHaveBeenCalledWith({
      text: 'Fetch order logs',
      orderDetail: '',
      startDate: '',
      endDate: '',
      timezone: 'SGT',
      selectedClusters: dummyClusters
    });
  });

  it('does not call onSendMessage when just Enter is pressed', async () => {
    const mockSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} clusters={dummyClusters} />);
    
    const textarea = screen.getByPlaceholderText(/Shift\+Enter to send/i);
    await user.type(textarea, 'Hello World{Enter}');
    
    expect(mockSend).not.toHaveBeenCalled();
    expect(textarea.value).toContain('\n');
  });

  it('renders order detail, date range and restricted SGT / UCT timezone inputs with SGT default', () => {
    const mockSend = vi.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} clusters={dummyClusters} />);

    expect(screen.getByPlaceholderText(/ORD-99410 or TXN-4412/i)).toBeTruthy();
    expect(screen.getByDisplayValue('SGT')).toBeTruthy();
    expect(screen.getByText('prod-elk')).toBeTruthy();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0].textContent).toBe('SGT');
    expect(options[1].textContent).toBe('UCT');
  });
});

