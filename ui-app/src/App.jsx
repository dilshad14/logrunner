import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatInteractionList from './components/ChatInteractionList';
import ChatInput from './components/ChatInput';
import SettingsModal from './components/SettingsModal';
import { sendChatMessage } from './services/chatService';
import { loadClusterSettings, saveClusterSettings } from './services/settingsStorage';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const loaded = loadClusterSettings();
    setClusters(loaded);
  }, []);

  const handleSaveClusters = (updatedClusters) => {
    setClusters(updatedClusters);
    saveClusterSettings(updatedClusters);
  };

  const handleSendMessage = async (inputObj) => {
    let rawText = typeof inputObj === 'string' ? inputObj : inputObj.text;
    let selectedClusters = inputObj.selectedClusters || [];
    let paramsSummary = [];

    if (typeof inputObj === 'object' && inputObj !== null) {
      if (inputObj.orderDetail) paramsSummary.push(`Order/Txn Ref: ${inputObj.orderDetail}`);
      if (inputObj.startDate) paramsSummary.push(`Start Time: ${inputObj.startDate}`);
      if (inputObj.endDate) paramsSummary.push(`End Time: ${inputObj.endDate}`);
      if (inputObj.timezone) paramsSummary.push(`Timezone: ${inputObj.timezone}`);
      if (selectedClusters.length > 0) {
        paramsSummary.push(`Data Sources: [${selectedClusters.map(c => c.clusterName).join(', ')}]`);
      }
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
      const response = await sendChatMessage({
        message: rawText || 'Correlate and analyze system logs across selected clusters.',
        orderDetail: inputObj.orderDetail,
        startDate: inputObj.startDate,
        endDate: inputObj.endDate,
        timezone: inputObj.timezone,
        selectedClusters: selectedClusters,
        history: historyForApi
      });

      const fullReply = response.reply || '';

      // Stream word-by-word into the UI
      setIsLoading(false);
      
      const words = fullReply.match(/\S+|\s+/g) || [fullReply];
      let currentContent = '';
      
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
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <ChatInteractionList messages={messages} isLoading={isLoading} />
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        clusters={clusters}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clusters={clusters}
        onSaveClusters={handleSaveClusters}
      />
    </div>
  );
}

export default App;
