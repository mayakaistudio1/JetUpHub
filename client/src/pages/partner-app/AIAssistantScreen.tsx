import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Loader2, UserPlus, CalendarPlus, PhoneCall, FileText, Target, Sparkles } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPartnerAuthHeader } from "./partnerAuth";

interface Message { role: "user" | "assistant"; content: string; }

export default function AIAssistantScreen({ telegramId, partnerName }: { telegramId: string; partnerName: string }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { id: "followup-attended", label: t('pa.ai.action.followupAttended.label'), icon: UserPlus, prompt: t('pa.ai.action.followupAttended.prompt') },
    { id: "followup-noshow", label: t('pa.ai.action.followupNoshow.label'), icon: Target, prompt: t('pa.ai.action.followupNoshow.prompt') },
    { id: "invite-next", label: t('pa.ai.action.inviteNext.label'), icon: CalendarPlus, prompt: t('pa.ai.action.inviteNext.prompt') },
    { id: "book-call", label: t('pa.ai.action.bookCall.label'), icon: PhoneCall, prompt: t('pa.ai.action.bookCall.prompt') },
    { id: "send-info", label: t('pa.ai.action.sendInfo.label'), icon: FileText, prompt: t('pa.ai.action.sendInfo.prompt') },
    { id: "qualify", label: t('pa.ai.action.qualify.label'), icon: Sparkles, prompt: t('pa.ai.action.qualify.prompt') },
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/partner-app/ai-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t('pa.ai.error') }]);
    }
    setSending(false);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7]">
      <div className="px-5 pt-5 pb-3 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Bot className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{t('pa.ai.title')}</h2>
            <p className="text-[11px] text-gray-400">{t('pa.ai.subtitle')}</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('pa.ai.greeting').replace('{name}', partnerName.split(" ")[0])}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  onClick={() => sendMessage(action.prompt)}
                  className="bg-white rounded-xl p-3 text-left active:bg-gray-50 transition-colors"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  data-testid={`ai-action-${action.id}`}
                >
                  <action.icon className="w-4 h-4 text-blue-500 mb-1.5" />
                  <p className="text-[11px] font-medium text-gray-700 leading-tight">{action.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white text-gray-700 rounded-bl-md"
              }`}
              style={msg.role === "assistant" ? { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" } : undefined}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white rounded-bl-md" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-400">{t('pa.ai.thinking')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-shrink-0 px-5 pb-3 pt-2 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('pa.ai.placeholder')}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 px-3 py-2 outline-none"
            disabled={sending}
            data-testid="input-ai-message"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-blue-600 disabled:opacity-30 active:bg-blue-700 transition-colors"
            data-testid="button-send-ai"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
