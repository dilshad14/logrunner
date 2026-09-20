import React, { useEffect, useRef } from 'react';
import { Terminal, Search, Activity, Cpu } from 'lucide-react';
import ChatMessage from './ChatMessage';

export default function ChatInteractionList({ messages, isLoading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-list">
      {messages.length === 0 && (
        <div className="empty-state">
          <Terminal size={48} className="empty-icon" />
          <div className="empty-title">LogRunner Production Support AI</div>
          <div className="empty-subtitle">
            Query CloudWatch, ELK, and application trace logs. Provide an Order or Transaction ID and set a date/time window above to correlate log events and identify root causes instantly.
          </div>
        </div>
      )}
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg} />
      ))}
      {isLoading && (
        <div className="loading-indicator">
          <Cpu size={16} className="pulse" />
          LogRunner AI is correlating log traces and analyzing stacktraces...
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
