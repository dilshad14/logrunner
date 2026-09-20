import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ChatInput from '../ChatInput';

describe('ChatInput', () => {
  it('calls onSendMessage when Shift+Enter is pressed', async () => {
    const mockSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Shift\+Enter to send/i);
    await user.type(textarea, 'Fetch order logs{Shift>}{Enter}{/Shift}');
    
    expect(mockSend).toHaveBeenCalledWith({
      text: 'Fetch order logs',
      orderDetail: '',
      startDate: '',
      endDate: '',
      timezone: 'UTC'
    });
  });

  it('does not call onSendMessage when just Enter is pressed', async () => {
    const mockSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Shift\+Enter to send/i);
    await user.type(textarea, 'Hello World{Enter}');
    
    expect(mockSend).not.toHaveBeenCalled();
    expect(textarea.value).toContain('\n');
  });

  it('renders order detail, date range and timezone inputs', () => {
    const mockSend = vi.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);

    expect(screen.getByPlaceholderText(/ORD-99410 or TXN-4412/i)).toBeTruthy();
    expect(screen.getByDisplayValue('UTC')).toBeTruthy();
  });
});
