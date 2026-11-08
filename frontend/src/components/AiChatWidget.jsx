import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { aiService } from '../services/aiService';
import {
  Sparkles,
  X,
  Send,
  AlertTriangle,
  Minus,
  Maximize2,
  PhoneCall,
  Trash2,
} from 'lucide-react';

const QUICK_ACTIONS = [
  { label: '🚨 Dấu hiệu cấp cứu khẩn cấp', prompt: 'Thú cưng có những dấu hiệu nguy hiểm nào cần phải đưa đi cấp cứu ngay lập tức?' },
  { label: '🤢 Nôn mửa & bỏ ăn 24h', prompt: 'Mèo/chó nhà tôi bị nôn mửa liên tục và bỏ ăn từ hôm qua, tôi cần làm gì để sơ cứu?' },
  { label: '💉 Lịch tiêm phòng & tẩy giun', prompt: 'Lịch tiêm phòng vắc-xin và tẩy giun định kỳ chuẩn cho chó mèo như thế nào?' },
  { label: '⚠️ Thức ăn ngộ độc cần tránh', prompt: 'Những loại thực phẩm quen thuộc nào của người cực kỳ nguy hiểm, gây độc cho chó mèo?' },
];

const AiChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [petType, setPetType] = useState('Canine / Feline');

  const messagesEndRef = useRef(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Xin chào ${user?.fullName ? user.fullName : 'bạn'}! Tôi là Bác sĩ Trợ lý AI của Bệnh viện Thú y PHMS.\n\nTôi có thể hỗ trợ sơ cứu khẩn cấp, đánh giá triệu chứng bệnh sơ bộ hoặc tư vấn chế độ chăm sóc cho thú cưng của bạn 24/7. Bạn đang cần tư vấn vấn đề gì?`,
          isCritical: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load chat history if user is authenticated and opens the widget
  useEffect(() => {
    if (isOpen && user && messages.length <= 1) {
      const loadHistory = async () => {
        try {
          const history = await aiService.getHistory(20);
          if (history && history.length > 0) {
            const formatted = history.map((item) => ({
              id: item.id,
              sender: 'user',
              text: item.questionRaw,
              response: item.aiResponse,
              time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));

            // Flatten into alternating user & AI messages
            const flatMessages = [];
            formatted.forEach((f) => {
              flatMessages.push({
                id: `u-${f.id}`,
                sender: 'user',
                text: f.text,
                time: f.time,
              });
              flatMessages.push({
                id: `a-${f.id}`,
                sender: 'ai',
                text: f.response,
                time: f.time,
              });
            });
            setMessages(flatMessages);
          }
        } catch (err) {
          console.warn('Could not load chat history:', err.message);
        }
      };
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, loading]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMsg.trim();
    if (!textToSend || loading) return;

    setError('');
    const userMsgObj = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    if (!customText) setInputMsg('');
    setLoading(true);

    try {
      let res;
      if (user) {
        // Authenticated AI consultation
        res = await aiService.askAi({ message: textToSend });
      } else {
        // Public guest consultation
        res = await aiService.askPublicAi({ message: textToSend, petType });
      }

      const aiText = res.chatLog?.aiResponse || res.aiResponse || 'Không nhận được phản hồi từ AI.';
      const isCritical = res.isCritical || false;

      const aiMsgObj = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        isCritical,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Không thể kết nối đến Trợ lý AI. Vui lòng thử lại.';
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Lỗi: ${errMsg}`,
          isError: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-cleared',
        sender: 'ai',
        text: 'Cuộc trò chuyện đã được làm mới. Bạn cần hỗ trợ gì về sức khỏe thú cưng?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON (Always Visible) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full border border-slate-200 shadow-md text-xs font-semibold text-slate-700 cursor-pointer hover:text-blue-600 transition-all hover:shadow-lg hover:-translate-x-1"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hỏi Bác sĩ AI 24/7</span>
          </div>
        )}

        <button
          type="button"
          aria-label="Toggle PHMS AI Health Advisor"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center ${
            isOpen
              ? 'bg-slate-800 text-white hover:bg-slate-900 ring-2 ring-slate-300'
              : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-pulse" />
              {/* Notification Ping Badge */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* 2. CHAT POPUP DRAWER / MODAL */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
            isMinimized
              ? 'bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3'
              : 'bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight flex items-center gap-1.5">
                  <span>PHMS AI Health Advisor</span>
                  <span className="text-[10px] bg-emerald-400 text-emerald-950 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-blue-100 font-medium">
                  {user ? `Xin chào, ${user.fullName}` : 'Trợ lý sơ cứu & tư vấn thú y'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-blue-100">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Làm mới cuộc trò chuyện"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Đóng cửa sổ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Pet Type Indicator for Visitors */}
              {!user && (
                <div className="bg-slate-50 border-b border-slate-200/80 px-3.5 py-1.5 flex items-center justify-between text-xs text-slate-600">
                  <span className="text-[11px] font-medium text-slate-500">Đối tượng thú cưng:</span>
                  <div className="flex gap-1.5">
                    {['Chó (Canine)', 'Mèo (Feline)', 'Thú cưng khác'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPetType(type)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                          petType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {type.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs sm:text-sm">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : msg.isError
                          ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                      }`}
                    >
                      {/* Critical Alert Warning Header */}
                      {msg.isCritical && (
                        <div className="mb-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="text-xs font-bold">Cảnh báo dấu hiệu khẩn cấp!</span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                      {msg.isCritical && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-[11px] text-rose-700 font-bold">Hotline Cấp Cứu 24/7:</span>
                          <a
                            href="tel:0359928446"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg text-xs hover:bg-rose-700 shadow-sm"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>0359 928 446</span>
                          </a>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 rounded-2xl p-3 w-fit shadow-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-xs font-medium">Bác sĩ AI đang phân tích dữ liệu y khoa...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Suggestion Chips */}
              <div className="p-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendMessage(action.prompt)}
                    className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition-all shrink-0 shadow-2xs"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                {error && (
                  <p className="text-[11px] text-rose-600 mb-1.5 font-medium px-1 truncate">{error}</p>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Mô tả triệu chứng thú cưng (vd: chó nôn mửa, mèo thở gấp...)"
                    disabled={loading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={loading || !inputMsg.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 mt-1.5 text-center leading-tight">
                  Tư vấn chỉ mang tính tham khảo sơ cứu. Trường hợp khẩn cấp hãy đến ngay phòng khám PHMS.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AiChatWidget;
