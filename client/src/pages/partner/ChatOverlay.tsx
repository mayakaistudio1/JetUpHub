import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import type { SharedMessage } from "../PartnerDigitalHub";
import { useLanguage } from "../../contexts/LanguageContext";

interface ChatOverlayProps {
  onClose: () => void;
  onTriggerPresentation: () => void;
  presentationWatched?: boolean;
  messages: SharedMessage[];
  addMessage: (msg: Omit<SharedMessage, "id">) => number;
  updateMessage: (id: number, text: string) => void;
}

async function streamDennisChat(
  chatHistory: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void,
  errorMsg: string,
  connErrorMsg: string,
  language?: string,
) {
  try {
    const res = await fetch("/api/partner/dennis/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory, language }),
    });

    if (!res.ok || !res.body) {
      onError(errorMsg);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            fullText += data.content;
            onChunk(fullText);
          }
          if (data.done) {
            onDone(data.fullContent || fullText);
            return;
          }
          if (data.error) {
            onError(data.error);
            return;
          }
        } catch {}
      }
    }
    onDone(fullText);
  } catch {
    onError(connErrorMsg);
  }
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({
  onClose,
  onTriggerPresentation,
  presentationWatched,
  messages,
  addMessage,
  updateMessage,
}) => {
  const { t, language } = useLanguage();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [followUpSent, setFollowUpSent] = useState(false);
  const [presentationOffered, setPresentationOffered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickReplies = [t('pdh.qr1'), t('pdh.qr2'), t('pdh.qr3'), t('pdh.qr4')];

  useEffect(() => {
    if (presentationWatched && !followUpSent) {
      setFollowUpSent(true);
      setTimeout(() => {
        addMessage({
          text: t('pdh.followUp'),
          sender: "ai",
        });
      }, 600);
    }
  }, [presentationWatched, followUpSent, addMessage, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartExploration = useCallback(() => {
    addMessage({
      text: t('pdh.startExploration'),
      sender: "user",
    });

    const aiMsgId = addMessage({ text: "...", sender: "ai" });
    
    updateMessage(aiMsgId, t('pdh.explorationResponse'));
    
    setTimeout(() => {
      onTriggerPresentation();
    }, 1500);
  }, [addMessage, updateMessage, onTriggerPresentation, t]);

  const buildChatHistory = useCallback((extraUserMsg?: string) => {
    const history: { role: string; content: string }[] = [];
    for (const msg of messages) {
      if (msg.type === "presentation_trigger") continue;
      history.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      });
    }
    if (extraUserMsg) {
      history.push({ role: "user", content: extraUserMsg });
    }
    return history;
  }, [messages]);

  const sendToAI = useCallback((userText: string) => {
    addMessage({ text: userText, sender: "user" });
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);
    setIsStreaming(true);

    const aiMsgId = addMessage({ text: "...", sender: "ai" });
    const history = buildChatHistory(userText);

    streamDennisChat(
      history,
      (partialText) => {
        updateMessage(aiMsgId, partialText);
      },
      (fullText) => {
        updateMessage(aiMsgId, fullText);
        setIsStreaming(false);
      },
      (error) => {
        updateMessage(aiMsgId, `${t('pdh.errorPrefix')}${error}`);
        setIsStreaming(false);
      },
      t('pdh.errorResponse'),
      t('pdh.errorConnection'),
      language,
    );
  }, [addMessage, updateMessage, buildChatHistory, userMessageCount, presentationOffered, t, language]);

  const handleQuickReply = (reply: string) => {
    sendToAI(reply);
  };

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput("");
    sendToAI(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <motion.div
        className="ph-chat-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="ph-chat-panel"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className="ph-chat-header">
          <div className="ph-chat-header-left">
            <div className="ph-chat-avatar-small">
              <img src="/dennis-photo.png" alt="Dennis" />
            </div>
            <div>
              <span className="ph-chat-name">Dennis AI</span>
              <span className="ph-chat-status">
                <span className="ph-status-dot" />
                Online
              </span>
            </div>
          </div>
          <button className="ph-chat-close" onClick={onClose} data-testid="btn-close-chat">
            <X size={18} />
          </button>
        </div>

        <div className="ph-chat-messages" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`ph-msg ${msg.sender === "user" ? "ph-msg-user" : "ph-msg-ai"}`}>
              {msg.text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i !== msg.text.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
              {msg.type === "presentation_trigger" && (
                <button
                  className="ph-presentation-trigger"
                  onClick={onTriggerPresentation}
                  data-testid="btn-open-presentation"
                >
                  <Sparkles size={16} />
                  {t('pdh.openPresentation')}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="ph-chat-quick">
          <button
            className="ph-quick-chip ph-quick-chip-primary"
            onClick={handleStartExploration}
            data-testid="btn-start-exploration"
          >
            <Sparkles size={14} />
            {t('pdh.startExploration')}
          </button>
          {userMessageCount === 0 && quickReplies.map((reply) => (
            <button
              key={reply}
              className="ph-quick-chip"
              onClick={() => handleQuickReply(reply)}
              data-testid={`chip-${reply.substring(0, 10)}`}
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="ph-chat-input-row">
          <input
            type="text"
            className="ph-chat-input"
            placeholder={t('pdh.chatPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            data-testid="input-chat"
          />
          <button className="ph-chat-send" onClick={handleSend} disabled={isStreaming} data-testid="btn-send">
            <Send size={18} />
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default ChatOverlay;
