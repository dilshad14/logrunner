import React, { useState, useRef } from 'react';
import { Send, FileText, Calendar, Clock, Globe } from 'lucide-react';

export default function ChatInput({ onSendMessage, isLoading }) {
  const [text, setText] = useState('');
  const [orderDetail, setOrderDetail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if ((trimmed || orderDetail.trim()) && !isLoading) {
      onSendMessage({
        text: trimmed,
        orderDetail: orderDetail.trim(),
        startDate,
        endDate,
        timezone
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
            <option value="UTC">UTC</option>
            <option value="America/New_York">EST (UTC-5)</option>
            <option value="America/Chicago">CST (UTC-6)</option>
            <option value="America/Los_Angeles">PST (UTC-8)</option>
            <option value="Europe/London">GMT (UTC+0)</option>
            <option value="Asia/Singapore">SGT (UTC+8)</option>
            <option value="Asia/Kolkata">IST (UTC+5:30)</option>
          </select>
        </div>
      </div>

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
