import React, { useState } from 'react';
import Header from './components/Header';
import ChatInteractionList from './components/ChatInteractionList';
import ChatInput from './components/ChatInput';
import { sendChatMessage } from './services/chatService';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (inputObj) => {
    let rawText = typeof inputObj === 'string' ? inputObj : inputObj.text;
    let paramsSummary = [];

    if (typeof inputObj === 'object' && inputObj !== null) {
      if (inputObj.orderDetail) paramsSummary.push(`Order/Txn Ref: ${inputObj.orderDetail}`);
      if (inputObj.startDate) paramsSummary.push(`Start Time: ${inputObj.startDate}`);
      if (inputObj.endDate) paramsSummary.push(`End Time: ${inputObj.endDate}`);
      if (inputObj.timezone) paramsSummary.push(`Timezone: ${inputObj.timezone}`);
    }

    let userPromptText = rawText;
    if (paramsSummary.length > 0) {
      userPromptText = `[Search Scope: ${paramsSummary.join(' | ')}]\n${rawText || 'Correlate and analyze system logs for this order/transaction.'}`;
    }

    const userMsg = { role: 'user', content: userPromptText };
    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userPromptText, historyForApi);
      const fullReply = response.reply || '';

      // Stream word-by-word into the UI
      setIsLoading(false);
      
      const words = fullReply.match(/\S+|\s+/g) || [fullReply];
      let currentContent = '';
      
      // Initialize assistant message as streaming
      const assistantIndex = messages.length + 1; // user is at messages.length
      setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

      let wordIdx = 0;
      const streamInterval = setInterval(() => {
        if (wordIdx < words.length) {
          currentContent += words[wordIdx];
          wordIdx++;
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1] = {
              role: 'assistant',
              content: currentContent,
              isStreaming: wordIdx < words.length
            };
            return next;
          });
        } else {
          clearInterval(streamInterval);
        }
      }, 15);

    } catch (err) {
      setIsLoading(false);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: '**Error**: ' + err.message, isStreaming: false }
      ]);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <ChatInteractionList messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}

export default App;
