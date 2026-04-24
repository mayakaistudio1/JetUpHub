import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, User, Phone, HelpCircle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import amaBannerImg from "@assets/image_1775509747032.png";

const AMA_DATE = new Date("2026-04-09T17:00:00Z");

const LABELS: Record<string, {
  title: string;
  formTitle: string;
  formSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  contactLabel: string;
  contactPlaceholder: string;
  questionLabel: string;
  questionPlaceholder: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successMsg: string;
  submitAnother: string;
  ended: string;
  endedMsg: string;
  nameRequired: string;
  contactRequired: string;
  questionRequired: string;
}> = {
  de: {
    title: "AMA Session",
    formTitle: "Deine Frage einreichen",
    formSubtitle: "Wir sammeln Fragen vorab, um die wichtigsten Themen im Stream abzudecken.",
    nameLabel: "Dein Name",
    namePlaceholder: "z.B. Alex",
    contactLabel: "Kontakt",
    contactPlaceholder: "Telegram oder E-Mail",
    questionLabel: "Deine Frage",
    questionPlaceholder: "Was möchtest du Niklas fragen?",
    submit: "Frage absenden",
    submitting: "Wird gesendet...",
    successTitle: "Frage eingereicht!",
    successMsg: "Deine Frage wurde erfolgreich übermittelt. Wir sehen uns am 9. April!",
    submitAnother: "Weitere Frage stellen",
    ended: "Session beendet",
    endedMsg: "Die AMA-Session mit Niklas Freihofer hat bereits stattgefunden. Vielen Dank für deine Teilnahme!",
    nameRequired: "Name ist erforderlich",
    contactRequired: "Kontaktinformation ist erforderlich",
    questionRequired: "Bitte gib eine Frage ein",
  },
  en: {
    title: "AMA Session",
    formTitle: "Submit your question",
    formSubtitle: "We're collecting questions now to cover the most important topics on stream.",
    nameLabel: "Your Name",
    namePlaceholder: "e.g. Alex",
    contactLabel: "Contact Info",
    contactPlaceholder: "Telegram or Email",
    questionLabel: "Your Question",
    questionPlaceholder: "What would you like to ask Niklas?",
    submit: "Send Question",
    submitting: "Submitting...",
    successTitle: "Question submitted!",
    successMsg: "Your question has been successfully submitted. See you on April 9th!",
    submitAnother: "Ask another question",
    ended: "Session ended",
    endedMsg: "The AMA session with Niklas Freihofer has already taken place. Thank you for participating!",
    nameRequired: "Name is required",
    contactRequired: "Contact info is required",
    questionRequired: "Please enter a question",
  },
  ru: {
    title: "AMA Сессия",
    formTitle: "Задайте ваш вопрос",
    formSubtitle: "Мы собираем вопросы заранее, чтобы разобрать самые важные темы в эфире.",
    nameLabel: "Ваше имя",
    namePlaceholder: "напр. Алекс",
    contactLabel: "Контакт",
    contactPlaceholder: "Telegram или Email",
    questionLabel: "Ваш вопрос",
    questionPlaceholder: "Что вы хотите спросить у Никласа?",
    submit: "Отправить вопрос",
    submitting: "Отправка...",
    successTitle: "Вопрос отправлен!",
    successMsg: "Ваш вопрос успешно отправлен. Увидимся 9 апреля!",
    submitAnother: "Задать ещё вопрос",
    ended: "Сессия завершена",
    endedMsg: "AMA-сессия с Niklas Freihofer уже состоялась. Спасибо за участие!",
    nameRequired: "Имя обязательно",
    contactRequired: "Контактная информация обязательна",
    questionRequired: "Пожалуйста, введите вопрос",
  },
};

function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return { ended: true };
  return { ended: false };
}

export default function AmaPage() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const l = LABELS[language] || LABELS.de;
  const countdown = useCountdown(AMA_DATE);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isNameValid = name.trim().length > 0;
  const isContactValid = contact.trim().length > 0;
  const isQuestionValid = question.trim().length > 0;
  const isFormValid = isNameValid && isContactValid && isQuestionValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError(l.nameRequired); return; }
    if (!contact.trim()) { setError(l.contactRequired); return; }
    if (!question.trim()) { setError(l.questionRequired); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/ama/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), contact: contact.trim(), question: question.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit");
      }
      setSubmitted(true);
      setName("");
      setContact("");
      setQuestion("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#0c0b1a]">
      <div className="sticky top-0 z-10 bg-[#0c0b1a]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setLocation("/")}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
            data-testid="button-back-ama"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <h1 className="text-[17px] font-extrabold text-white flex-1 tracking-tight">
            {l.title}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative w-full overflow-hidden">
            <img
              src={amaBannerImg}
              alt="AMA Session with Niklas Freihofer"
              className="w-full h-auto object-cover"
              data-testid="img-ama-banner"
            />
          </div>

          {countdown.ended ? (
            <div className="px-5 py-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 rounded-2xl p-5 text-center space-y-3 border border-white/10"
              >
                <CheckCircle2 size={32} className="text-green-400 mx-auto" />
                <h3 className="text-[16px] font-bold text-white" data-testid="text-ama-ended">{l.ended}</h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">{l.endedMsg}</p>
              </motion.div>
            </div>
          ) : (
            <div className="px-5 pt-5 pb-8">
              <div className="bg-[#131224] rounded-3xl p-5 border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-3 py-4"
                  >
                    <CheckCircle2 size={32} className="text-green-400 mx-auto" />
                    <h3 className="text-[16px] font-bold text-white" data-testid="text-ama-success">{l.successTitle}</h3>
                    <p className="text-[13px] text-gray-400 leading-relaxed">{l.successMsg}</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-[13px] font-semibold hover:bg-white/15 active:scale-95 transition-all"
                      data-testid="button-ama-another"
                    >
                      {l.submitAnother}
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-5">
                      <h2 className="text-[18px] font-bold text-white mb-1">{l.formTitle}</h2>
                      <p className="text-[13px] text-white/50 leading-relaxed">
                        {l.formSubtitle}
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[13px] font-semibold text-white/80 pl-1">{l.nameLabel}</label>
                          {isNameValid && <CheckCircle2 size={14} className="text-green-400" />}
                        </div>
                        <div className={`relative rounded-xl overflow-hidden transition-all duration-200 border ${focused === 'name' ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]/30' : 'border-white/10'} bg-[#0c0b1a]`}>
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                            <User size={18} className={focused === 'name' ? 'text-[#A855F7]' : ''} />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onFocus={() => setFocused('name')}
                            onBlur={() => setFocused(null)}
                            onChange={e => setName(e.target.value)}
                            placeholder={l.namePlaceholder}
                            className="w-full bg-transparent pl-11 pr-4 py-3.5 text-[15px] text-white focus:outline-none placeholder-white/20"
                            data-testid="input-ama-name"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[13px] font-semibold text-white/80 pl-1">{l.contactLabel}</label>
                          {isContactValid && <CheckCircle2 size={14} className="text-green-400" />}
                        </div>
                        <div className={`relative rounded-xl overflow-hidden transition-all duration-200 border ${focused === 'contact' ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]/30' : 'border-white/10'} bg-[#0c0b1a]`}>
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                            <Phone size={18} className={focused === 'contact' ? 'text-[#A855F7]' : ''} />
                          </div>
                          <input
                            type="text"
                            value={contact}
                            onFocus={() => setFocused('contact')}
                            onBlur={() => setFocused(null)}
                            onChange={e => setContact(e.target.value)}
                            placeholder={l.contactPlaceholder}
                            className="w-full bg-transparent pl-11 pr-4 py-3.5 text-[15px] text-white focus:outline-none placeholder-white/20"
                            data-testid="input-ama-contact"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[13px] font-semibold text-white/80 pl-1">{l.questionLabel}</label>
                          {isQuestionValid && <CheckCircle2 size={14} className="text-green-400" />}
                          {!isQuestionValid && focused === 'question' && question.length > 0 && <AlertCircle size={14} className="text-amber-400" />}
                        </div>
                        <div className={`relative rounded-xl overflow-hidden transition-all duration-200 border ${focused === 'question' ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]/30' : 'border-white/10'} bg-[#0c0b1a]`}>
                          <div className="absolute left-3.5 top-4 text-white/40">
                            <HelpCircle size={18} className={focused === 'question' ? 'text-[#A855F7]' : ''} />
                          </div>
                          <textarea
                            value={question}
                            onFocus={() => setFocused('question')}
                            onBlur={() => setFocused(null)}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder={l.questionPlaceholder}
                            rows={4}
                            className="w-full bg-transparent pl-11 pr-4 py-3.5 text-[15px] text-white focus:outline-none placeholder-white/20 resize-none leading-relaxed"
                            data-testid="input-ama-question"
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-[12px] text-red-400 font-medium" data-testid="text-ama-error">{error}</p>
                      )}

                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${
                            isFormValid && !submitting
                              ? "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-[0.98]"
                              : "bg-white/5 text-white/30 cursor-not-allowed"
                          }`}
                          data-testid="button-ama-submit"
                        >
                          {submitting ? (
                            <Loader2 size={18} className="animate-spin text-white/40" />
                          ) : (
                            <Send size={18} className={isFormValid ? "text-white" : "opacity-40"} />
                          )}
                          {submitting ? l.submitting : l.submit}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
