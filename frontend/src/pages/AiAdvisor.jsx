import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/aiService';
import { profileService } from '../services/profileService';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const AiAdvisor = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [criticalNotice, setCriticalNotice] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load chat history and owner's registered pets for context
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoadingHistory(true);
        const [historyData, profileData] = await Promise.all([
          aiService.getHistory(50),
          profileService.getProfile(),
        ]);

        setMessages(historyData || []);
        if (profileData?.petOwner?.pets) {
          setPets(profileData.petOwner.pets);
          if (profileData.petOwner.pets.length > 0) {
            setSelectedPetId(profileData.petOwner.pets[0].id);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize AI Chat Advisor.');
      } finally {
        setLoadingHistory(false);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    if (inputMessage.length > 1000) {
      setError('Your question must not exceed 1000 characters.');
      return;
    }

    const currentMsg = inputMessage.trim();
    setInputMessage('');
    setError('');
    setCriticalNotice(false);

    // Optimistic pending log
    const optimisticLog = {
      id: `temp-${Date.now()}`,
      questionRaw: currentMsg,
      aiResponse: null, // Loading indicator
      createdAt: new Date().toISOString(),
      pet: pets.find((p) => p.id === selectedPetId) || null,
    };

    setMessages((prev) => [...prev, optimisticLog]);
    setSending(true);

    try {
      const responseData = await aiService.askAi({
        message: currentMsg,
        petId: selectedPetId || null,
      });

      // Replace optimistic log with real saved chat log
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticLog.id ? responseData.chatLog : m))
      );

      if (responseData.isCritical) {
        setCriticalNotice(true);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'AI Health Advisor is temporarily busy. Please try again or contact our clinic hotline directly for urgent pet care.';
      setError(errorMsg);

      // Revert or replace optimistic log with error notification
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticLog.id
            ? {
                ...m,
                aiResponse: `⚠️ ${errorMsg}`,
              }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const sampleQuestions = [
    'My dog vomited twice this morning and refuses to eat. What first aid should I do?',
    'What should I feed my golden retriever to prevent gastrointestinal allergies?',
    'My cat is sneezing frequently and has mild eye discharge. Should I visit the clinic?',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Bar: Title & Pet Context Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-sm">
            ✨
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Gemini AI Pet Health Advisor</h1>
            <p className="text-xs text-slate-500">
              24/7 symptom guidance with clinical history context
            </p>
          </div>
        </div>

        {/* Pet selector */}
        {pets.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Consulting for:</span>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">General Pet Advice</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {criticalNotice && (
        <Alert
          type="error"
          message="🚨 Urgent Warning: The symptoms describe potential critical danger. If your pet exhibits severe bleeding, seizures, or difficulty breathing, please immediately proceed to the emergency triage room or call our hotline 1900-PHMS."
          className="mb-3"
          onClose={() => setCriticalNotice(false)}
        />
      )}

      {error && <Alert type="warning" message={error} className="mb-3" onClose={() => setError('')} />}

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-y-auto space-y-4">
        {loadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mb-3">
              🐾
            </div>
            <h3 className="font-semibold text-slate-700 text-base">How can I assist your pet today?</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
              Ask about symptoms, dietary advice, or first-aid care. You can pick an example query below:
            </p>
            <div className="flex flex-col gap-2 w-full max-w-lg">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(q)}
                  className="text-left text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 p-2.5 rounded-xl transition-colors"
                >
                  💡 {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((item) => (
            <div key={item.id} className="space-y-3">
              {/* User question bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                  {item.pet && (
                    <span className="block text-[10px] font-semibold text-blue-200 mb-1">
                      Patient: {item.pet.name}
                    </span>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.questionRaw}</p>
                  <span className="block text-[10px] text-blue-200 text-right mt-1">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* AI response bubble */}
              <div className="flex justify-start">
                <div className="max-w-[90%] sm:max-w-[80%] bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-1.5 text-blue-600 text-xs font-semibold mb-1.5">
                    <span>✨ Gemini Vet Advisor</span>
                  </div>
                  {item.aiResponse ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                      {item.aiResponse}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 py-2 text-slate-500 text-xs">
                      <Spinner size="sm" />
                      <span>Analyzing pet symptoms and clinical records...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="mt-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={sending}
            maxLength={1000}
            placeholder="Ask about pet symptoms, first-aid, or care recommendations..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={sending}
            disabled={!inputMessage.trim() || sending}
            className="px-5 py-3 rounded-xl"
          >
            Send
          </Button>
        </div>
        <div className="flex justify-between items-center px-1 mt-1 text-[11px] text-slate-400">
          <span>Limit: 10 queries per hour • 8-second response SLA</span>
          <span>{inputMessage.length}/1000</span>
        </div>
      </form>
    </div>
  );
};

export default AiAdvisor;
