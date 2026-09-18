// ChatPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPanel = ({ isOpen, onClose, personalityMode }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'system', 
      text: 'Welcome to the interview! Feel free to ask questions or request clarifications.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response based on personality mode
    setTimeout(() => {
      let responseText = '';
      switch(personalityMode) {
        case 'Structured':
          responseText = "Let me provide a structured response to your question. Based on standard interview practices...";
          break;
        case 'Casual':
          responseText = "Hey! Great question! Let's chat about that. I think...";
          break;
        case 'Challenging':
          responseText = "Interesting perspective. However, have you considered the counter-argument that...";
          break;
        case 'Empathetic':
          responseText = "I understand your concern. Many candidates wonder about this. Let me help you...";
          break;
        default:
          responseText = "Thank you for your question. Here's what I can tell you...";
      }

      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-[#E5E7EB] flex flex-col z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-semibold">Interview Assistant</h3>
                <p className="text-xs text-white/80">{personalityMode} Mode</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-[#4F46E5] text-white'
                      : message.type === 'ai'
                      ? 'bg-[#F8F5F0] text-[#1F2937]'
                      : 'bg-[#E5E7EB] text-[#6B7280] text-sm italic'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-[#6B7280]'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#F8F5F0]">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a question..."
                  className="w-full p-3 bg-white border border-[#E5E7EB] rounded-lg resize-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-sm"
                  rows="2"
                />
                <p className="text-xs text-[#6B7280] mt-1">Press Enter to send, Shift+Enter for new line</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className={`p-3 rounded-lg ${
                  inputMessage.trim()
                    ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                    : 'bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed'
                } transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;