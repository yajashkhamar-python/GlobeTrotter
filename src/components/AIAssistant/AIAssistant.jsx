import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchApi } from '../../services/api';
import './AIAssistant.css';

export default function AIAssistant({ tripId, tripName, onClose, onApplySuccess }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi! I'm your AI Travel Copilot. How can I help you improve your ${tripName || 'trip'}?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "Improve My Itinerary",
    "Make My Trip More Relaxed",
    "Reduce My Trip Budget",
    "Find Better Activities"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text, isRetry = false) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    
    if (!isRetry) {
      setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
      setInput('');
    } else {
      setMessages(prev => prev.filter(m => !m.isError));
    }
    
    setIsLoading(true);

    try {
      const history = messages.filter(m => m.role !== 'system' && !m.isError);
      
      const res = await fetchApi('/ai-assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ tripId, message: userMessage, history })
      });

      if (res.success) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: res.response,
          proposedChanges: res.proposedChanges 
        }]);
      } else {
        const isTemp = res.message.includes('503') || res.message.includes('429');
        const msg = isTemp ? "Gemini is temporarily busy. Please try again in a moment." : `Sorry, I encountered an error: ${res.message}`;
        setMessages(prev => [...prev, { role: 'ai', text: msg, isError: true, retryText: userMessage }]);
        if (!isRetry) setInput(userMessage);
      }
    } catch (err) {
      console.error("AI Assistant frontend error:", err);
      const isTemp = err.message.includes('503') || err.message.includes('429');
      const msg = isTemp ? "Gemini is temporarily busy. Please try again in a moment." : `Sorry, I failed to reach the server. Error: ${err.message}`;
      setMessages(prev => [...prev, { role: 'ai', text: msg, isError: true, retryText: userMessage }]);
      if (!isRetry) setInput(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = async (changes, msgIndex) => {
    setApplying(true);
    try {
      const res = await fetchApi('/ai-assistant/apply-changes', {
        method: 'POST',
        body: JSON.stringify({ tripId, changes })
      });
      if (res.success) {
        // Mark changes as applied in UI
        setMessages(prev => {
          const newMsg = [...prev];
          newMsg[msgIndex] = { ...newMsg[msgIndex], applied: true };
          return newMsg;
        });
        if (onApplySuccess) onApplySuccess();
      } else {
        alert(res.message || 'Failed to apply changes');
      }
    } catch (err) {
      alert('Error applying changes');
    } finally {
      setApplying(false);
    }
  };

  const handleDiscardChanges = (msgIndex) => {
    setMessages(prev => {
      const newMsg = [...prev];
      newMsg[msgIndex] = { ...newMsg[msgIndex], discarded: true };
      return newMsg;
    });
  };

  return (
    <div className="ai-assistant-overlay" onClick={onClose}>
      <div className="ai-assistant-panel" onClick={e => e.stopPropagation()}>
        <div className="ai-header">
          <div>
            <div className="ai-header-title">
              <Sparkles size={24} color="var(--color-primary)" />
              AI Travel Copilot
            </div>
            <div className="ai-header-subtitle">
              Your personal travel planning assistant for {tripName}.
            </div>
          </div>
          <button className="ai-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="ai-chat-area">
          {messages.length === 1 && (
            <div className="ai-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="ai-suggestion-chip" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`ai-message-wrapper ${msg.role}`}>
              <div className={`ai-message ${msg.role}`}>
                {msg.role === 'ai' && !msg.isError ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
              
              {msg.proposedChanges && msg.proposedChanges.length > 0 && !msg.applied && !msg.discarded && (
                <div className="ai-preview-card">
                  <h4 className="ai-preview-title">Suggested Itinerary Changes</h4>
                  <div className="ai-preview-list">
                    {msg.proposedChanges.map((change, idx) => (
                      <div key={idx} className="ai-preview-item">
                        <div className="ai-preview-action">
                          <span className={`ai-badge ${change.action}`}>{change.action.toUpperCase()}</span>
                          <span className="ai-preview-date">{change.date} | {change.city}</span>
                        </div>
                        {change.action === 'replace' ? (
                          <div className="ai-preview-replace">
                            <span className="ai-old-act">{change.old_activity_name}</span>
                            <span className="ai-arrow">➔</span>
                            <span className="ai-new-act">{change.activity_name}</span>
                          </div>
                        ) : (
                          <div className="ai-preview-act">{change.activity_name}</div>
                        )}
                        {change.explanation && <div className="ai-preview-exp">{change.explanation}</div>}
                      </div>
                    ))}
                  </div>
                  <div className="ai-preview-actions">
                    <button className="ai-btn-discard" onClick={() => handleDiscardChanges(i)} disabled={applying}>Discard</button>
                    <button className="ai-btn-apply" onClick={() => handleApplyChanges(msg.proposedChanges, i)} disabled={applying}>
                      {applying ? 'Applying...' : 'Apply Selected Changes'}
                    </button>
                  </div>
                </div>
              )}
              
              {msg.applied && <div className="ai-status-text success">Changes applied successfully.</div>}
              {msg.discarded && <div className="ai-status-text">Suggestions discarded.</div>}
              {msg.isError && msg.retryText && (
                <button 
                  className="ai-btn-apply" 
                  style={{ marginTop: '8px' }}
                  onClick={() => handleSend(msg.retryText, true)}
                  disabled={isLoading}
                >
                  Retry Request
                </button>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="ai-message ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} className="lucide-spin" /> Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-input-area">
          <input 
            type="text" 
            className="ai-input" 
            placeholder="Ask AI to improve your trip..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            disabled={isLoading}
          />
          <button 
            className="ai-send-btn" 
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
