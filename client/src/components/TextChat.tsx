import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import VideoCallBar from './VideoCallBar';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'maria-chat-history';
const SESSION_KEY = 'maria-session-id';

function renderWithLinks(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      const display = part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      const label = display.length > 32 ? display.slice(0, 32) + '…' : display;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium text-blue-600"
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export default function TextChat() {
  const { language, t } = useLanguage();
  const sessionIdRef = useRef(getOrCreateSessionId());
  const isGuided = (() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search;
    if (new URLSearchParams(search).has('guided')) return true;
    const initialPath = new URLSearchParams(search).get('initialPath') || '';
    if (initialPath.includes('guided=true') || initialPath.includes('guided')) return true;
    if (window.location.hash.includes('guided')) return true;
    try {
      const stored = sessionStorage.getItem('jetup_guided');
      if (stored === 'true') return true;
    } catch {}
    return false;
  })();

  if (isGuided && typeof window !== 'undefined') {
    try { sessionStorage.setItem('jetup_guided', 'true'); } catch {}
  }
  
  const getInitialGreeting = (): ChatMessage => ({
    id: 'greeting',
    role: 'assistant',
    content: t('chat.greeting'),
    timestamp: 0,
  });

  const getInitialQuickReplies = () => {
    if (language === 'en') return ['How do I start trading?', 'What Copy-X strategies exist?', 'How do I earn as a partner?', 'Presentations & documents'];
    if (language === 'de') return ['Wie starte ich mit Trading?', 'Welche Copy‑X‑Strategien gibt es?', 'Wie verdiene ich als Partner?', 'Präsentationen & Unterlagen'];
    return ['Как начать торговать?', 'Какие стратегии Copy-X есть?', 'Как заработать как партнёр?', 'Презентации и материалы'];
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [quickReplies, setQuickReplies] = useState<string[]>(getInitialQuickReplies());
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitializedRef = useRef(false);

  const updateSuggestions = async (history: ChatMessage[]) => {
    try {
      const response = await fetch('/api/maria/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history
            .filter(m => m.id !== 'greeting')
            .map(m => ({ role: m.role, content: m.content })),
          language,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setQuickReplies(data.suggestions);
        }
      }
    } catch (error) {
      console.error('Failed to update suggestions:', error);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialQuestion = localStorage.getItem('maria-initial-question');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 1) {
          setMessages(parsed);
          updateSuggestions(parsed);
        } else {
          setMessages([{ ...getInitialGreeting(), timestamp: Date.now() }]);
          setQuickReplies(getInitialQuickReplies());
        }
      } catch (e) {
        console.error('Failed to parse chat history:', e);
        setMessages([{ ...getInitialGreeting(), timestamp: Date.now() }]);
      }
    } else {
      setMessages([{ ...getInitialGreeting(), timestamp: Date.now() }]);
      setQuickReplies(getInitialQuickReplies());
    }

    if (initialQuestion) {
      localStorage.removeItem('maria-initial-question');
      setPendingQuestion(initialQuestion);
    }
    
    isInitializedRef.current = true;
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (pendingQuestion && isInitializedRef.current && messages.length > 0 && !isLoading) {
      const question = pendingQuestion;
      setPendingQuestion(null);
      setTimeout(() => {
        handleSendPending(question);
      }, 300);
    }
  }, [pendingQuestion, messages, isLoading]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSendPending = async (text: string) => {
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/maria/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages
            .filter(m => m.id !== 'greeting')
            .map(m => ({ role: m.role, content: m.content })),
          language,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }
            if (data.done) {
              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullContent,
                timestamp: Date.now(),
              };
              const finalMessages = [...currentMessages, assistantMessage];
              setMessages(finalMessages);
              setStreamingContent('');
              updateSuggestions(finalMessages);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'en' ? 'Sorry, something went wrong. Please try again.' : language === 'de' ? 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuche es noch einmal.' : 'Извините, произошла ошибка. Попробуйте позже.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/maria/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages
            .filter(m => m.id !== 'greeting')
            .map(m => ({ role: m.role, content: m.content })),
          language,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }
            if (data.done) {
              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullContent,
                timestamp: Date.now(),
              };
              const finalMessages = [...updatedMessages, assistantMessage];
              setMessages(finalMessages);
              setStreamingContent('');
              updateSuggestions(finalMessages);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'en' ? 'Sorry, something went wrong. Please try again!' : language === 'de' ? 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuche es noch einmal.' : 'Извини, что-то пошло не так. Попробуй еще раз!',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const clearHistory = () => {
    setMessages([{ ...getInitialGreeting(), timestamp: Date.now() }]);
    setQuickReplies(getInitialQuickReplies());
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    sessionIdRef.current = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionIdRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const detectKeyboard = () => {
      const vv = window.visualViewport;
      if (vv) {
        const isKbOpen = vv.height < window.innerHeight * 0.75;
        setKeyboardOpen(isKbOpen);
      }
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', detectKeyboard);
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', detectKeyboard);
      }
    };
  }, []);

  const handleInputFocus = () => {
    setTimeout(() => {
      inputAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors" data-testid="button-back">
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
          </Link>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">M</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{t('chat.maria')}</h2>
            <span className="text-xs text-green-500 font-medium">{t('chat.online')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearHistory}
              className="text-gray-400 hover:text-destructive"
              data-testid="button-clear-chat"
            >
              <Trash2 size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Video Call Bar - Fixed at top */}
      <VideoCallBar 
        isActive={isVideoActive}
        onStart={() => setIsVideoActive(true)}
        onEnd={() => setIsVideoActive(false)}
        guided={isGuided}
        onSwitchToChat={() => setIsVideoActive(false)}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed",
                  msg.role === 'user'
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                )}
              >
                {renderWithLinks(msg.content)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming message */}
        {streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-gray-100 text-gray-800 text-[15px] leading-relaxed">
              {renderWithLinks(streamingContent)}
              <span className="inline-block w-1 h-4 ml-1 bg-gray-400 animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-100">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies - Hidden when keyboard is open to save space */}
      {!isLoading && quickReplies.length > 0 && !keyboardOpen && (
        <div className="px-4 py-2.5 bg-white border-t border-gray-50 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                className="px-3.5 py-2 text-xs font-medium bg-transparent border border-primary/40 text-primary rounded-full hover:bg-primary/5 transition-colors active:scale-95"
                data-testid={`quick-reply-${reply.slice(0, 10)}`}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div ref={inputAreaRef} className="p-4 bg-white safe-area-bottom border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
            className="flex-1 h-12 px-5 rounded-full bg-gray-50 border-none text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/20"
            data-testid="input-chat-message"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 rounded-full p-0"
            data-testid="button-send-message"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
