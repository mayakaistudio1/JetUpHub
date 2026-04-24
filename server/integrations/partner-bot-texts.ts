export type BotLang = "de" | "en" | "ru";

export function detectLang(languageCode?: string): BotLang {
  if (!languageCode) return "en";
  const lc = languageCode.toLowerCase();
  if (lc.startsWith("de")) return "de";
  if (lc.startsWith("ru")) return "ru";
  return "en";
}

const texts = {
  appButton: { de: "📱 Partner App öffnen", en: "📱 Open Partner App", ru: "📱 Открыть Partner App" },
  registerButton: { de: "🚀 Jetzt registrieren", en: "🚀 Register now", ru: "🚀 Зарегистрироваться" },

  welcomeBack: {
    de: (name: string) => `👋 Willkommen zurück, <b>${name}</b>!\n\nÖffne die Partner App für Dashboard, Einladungen, Statistiken und KI-Tools.`,
    en: (name: string) => `👋 Welcome back, <b>${name}</b>!\n\nOpen the Partner App for dashboard, invitations, statistics and AI tools.`,
    ru: (name: string) => `👋 С возвращением, <b>${name}</b>!\n\nОткройте Partner App для панели управления, приглашений, статистики и ИИ-инструментов.`,
  },
  welcomeNew: {
    de: `🚀 <b>Willkommen beim JetUP Partner Bot!</b>\n\nÖffne die Partner App, um dein Profil anzulegen und loszulegen.`,
    en: `🚀 <b>Welcome to the JetUP Partner Bot!</b>\n\nOpen the Partner App to create your profile and get started.`,
    ru: `🚀 <b>Добро пожаловать в JetUP Partner Bot!</b>\n\nОткройте Partner App, чтобы создать профиль и начать работу.`,
  },

  regStepCu: {
    de: (name: string) => `👍 Danke, <b>${name}</b>!\n\n🔢 <b>Bitte gib deine CU-Nummer ein:</b>`,
    en: (name: string) => `👍 Thanks, <b>${name}</b>!\n\n🔢 <b>Please enter your CU number:</b>`,
    ru: (name: string) => `👍 Спасибо, <b>${name}</b>!\n\n🔢 <b>Введите ваш CU-номер:</b>`,
  },
  regStepPhone: {
    de: `📱 <b>Deine Telefonnummer?</b> (optional — sende /skip zum Überspringen)`,
    en: `📱 <b>Your phone number?</b> (optional — send /skip to skip)`,
    ru: `📱 <b>Ваш номер телефона?</b> (необязательно — отправьте /skip чтобы пропустить)`,
  },
  regStepEmail: {
    de: `📧 <b>Deine E-Mail-Adresse?</b> (optional — sende /skip zum Überspringen)`,
    en: `📧 <b>Your email address?</b> (optional — send /skip to skip)`,
    ru: `📧 <b>Ваш email?</b> (необязательно — отправьте /skip чтобы пропустить)`,
  },
  regSuccess: {
    de: (p: { name: string; cuNumber: string; phone?: string | null; email?: string | null }) =>
      `✅ <b>Registrierung abgeschlossen!</b>\n\n👤 Name: ${p.name}\n🔢 CU: ${p.cuNumber}\n${p.phone ? `📱 Tel: ${p.phone}\n` : ""}${p.email ? `📧 E-Mail: ${p.email}\n` : ""}\nÖffne die Partner App, um loszulegen!`,
    en: (p: { name: string; cuNumber: string; phone?: string | null; email?: string | null }) =>
      `✅ <b>Registration complete!</b>\n\n👤 Name: ${p.name}\n🔢 CU: ${p.cuNumber}\n${p.phone ? `📱 Phone: ${p.phone}\n` : ""}${p.email ? `📧 Email: ${p.email}\n` : ""}\nOpen the Partner App to get started!`,
    ru: (p: { name: string; cuNumber: string; phone?: string | null; email?: string | null }) =>
      `✅ <b>Регистрация завершена!</b>\n\n👤 Имя: ${p.name}\n🔢 CU: ${p.cuNumber}\n${p.phone ? `📱 Тел: ${p.phone}\n` : ""}${p.email ? `📧 Email: ${p.email}\n` : ""}\nОткройте Partner App, чтобы начать!`,
  },
  regAlreadyExists: {
    de: `⚠️ Du bist bereits registriert. Sende /start um fortzufahren.`,
    en: `⚠️ You are already registered. Send /start to continue.`,
    ru: `⚠️ Вы уже зарегистрированы. Отправьте /start чтобы продолжить.`,
  },
  regError: {
    de: `❌ Fehler bei der Registrierung. Bitte versuche es erneut mit /start.`,
    en: `❌ Registration error. Please try again with /start.`,
    ru: `❌ Ошибка регистрации. Попробуйте снова с /start.`,
  },

  notRegistered: {
    de: `⚠️ Du bist noch nicht registriert.`,
    en: `⚠️ You are not registered yet.`,
    ru: `⚠️ Вы ещё не зарегистрированы.`,
  },
  notRegisteredShort: { de: "Nicht registriert", en: "Not registered", ru: "Не зарегистрирован" },
  eventNotFound: { de: "Event nicht gefunden", en: "Event not found", ru: "Событие не найдено" },
  creatingLink: { de: "Erstelle Link...", en: "Creating link...", ru: "Создаю ссылку..." },
  noAccess: { de: "Kein Zugriff", en: "No access", ru: "Нет доступа" },

  inviteLinkCreated: {
    de: (title: string, date: string, time: string, speaker: string, url: string) =>
      `✅ <b>Einladungslink erstellt!</b>\n\n📋 <b>Event:</b> ${title}\n📅 ${date} | 🕐 ${time}\n🎙 Speaker: ${speaker}\n\n🔗 <b>Dein Link:</b>\n${url}\n\nTeile diesen Link mit deinen Kontakten. Du erhältst eine Benachrichtigung, wenn sich jemand registriert!`,
    en: (title: string, date: string, time: string, speaker: string, url: string) =>
      `✅ <b>Invite link created!</b>\n\n📋 <b>Event:</b> ${title}\n📅 ${date} | 🕐 ${time}\n🎙 Speaker: ${speaker}\n\n🔗 <b>Your link:</b>\n${url}\n\nShare this link with your contacts. You'll be notified when someone registers!`,
    ru: (title: string, date: string, time: string, speaker: string, url: string) =>
      `✅ <b>Ссылка-приглашение создана!</b>\n\n📋 <b>Событие:</b> ${title}\n📅 ${date} | 🕐 ${time}\n🎙 Спикер: ${speaker}\n\n🔗 <b>Ваша ссылка:</b>\n${url}\n\nПоделитесь ссылкой с контактами. Вы получите уведомление, когда кто-то зарегистрируется!`,
  },

  noEvents: {
    de: `📋 Du hast noch keine Events.`,
    en: `📋 You don't have any events yet.`,
    ru: `📋 У вас пока нет событий.`,
  },
  selectEventReport: {
    de: `📊 <b>Wähle ein Event für den Bericht:</b>`,
    en: `📊 <b>Select an event for the report:</b>`,
    ru: `📊 <b>Выберите событие для отчёта:</b>`,
  },
  eventNotFoundOrNoAccess: {
    de: `❌ Event nicht gefunden oder kein Zugriff.`,
    en: `❌ Event not found or no access.`,
    ru: `❌ Событие не найдено или нет доступа.`,
  },
  guestsLabel: { de: "Gäste", en: "Guests", ru: "Гости" },
  reportHeader: {
    de: (title: string, date: string, time: string) => `📊 <b>Event-Bericht: ${title}</b>\n📅 ${date} | 🕐 ${time}\n\n`,
    en: (title: string, date: string, time: string) => `📊 <b>Event Report: ${title}</b>\n📅 ${date} | 🕐 ${time}\n\n`,
    ru: (title: string, date: string, time: string) => `📊 <b>Отчёт по событию: ${title}</b>\n📅 ${date} | 🕐 ${time}\n\n`,
  },
  registered: { de: "Registriert", en: "Registered", ru: "Зарегистрировано" },
  zoomJoined: { de: "Zoom beigetreten", en: "Zoom joined", ru: "Присоединились в Zoom" },
  zoomNotJoined: { de: "Nicht beigetreten", en: "Not joined", ru: "Не присоединились" },
  zoomParticipantsApi: {
    de: (count: number) => `📹 <b>Zoom-Teilnehmer (API): ${count}</b>`,
    en: (count: number) => `📹 <b>Zoom Participants (API): ${count}</b>`,
    ru: (count: number) => `📹 <b>Участники Zoom (API): ${count}</b>`,
  },
  avgMin: { de: "Min.", en: "min.", ru: "мин." },
  questions: { de: "Fragen", en: "Questions", ru: "Вопросы" },
  andMore: {
    de: (n: number) => `  ... und ${n} weitere`,
    en: (n: number) => `  ... and ${n} more`,
    ru: (n: number) => `  ... и ещё ${n}`,
  },
  registeredNotOnZoom: {
    de: (n: number) => `\n⚠️ <b>Registriert, aber nicht auf Zoom (${n}):</b>`,
    en: (n: number) => `\n⚠️ <b>Registered but not on Zoom (${n}):</b>`,
    ru: (n: number) => `\n⚠️ <b>Зарегистрированы, но не в Zoom (${n}):</b>`,
  },
  onZoomNotRegistered: {
    de: (n: number) => `\n🔍 <b>Auf Zoom, aber nicht registriert (${n}):</b>`,
    en: (n: number) => `\n🔍 <b>On Zoom but not registered (${n}):</b>`,
    ru: (n: number) => `\n🔍 <b>В Zoom, но не зарегистрированы (${n}):</b>`,
  },
  zoomLinkClicked: {
    de: `\n<b>✅ Zoom-Link geklickt:</b>`,
    en: `\n<b>✅ Zoom link clicked:</b>`,
    ru: `\n<b>✅ Нажали ссылку Zoom:</b>`,
  },
  zoomLinkNotClicked: {
    de: `\n<b>❌ Nicht geklickt:</b>`,
    en: `\n<b>❌ Not clicked:</b>`,
    ru: `\n<b>❌ Не нажали:</b>`,
  },

  aiFollowupButton: { de: "🤖 KI Follow-up starten", en: "🤖 Start AI Follow-up", ru: "🤖 Запустить ИИ Follow-up" },
  zoomSyncRefresh: { de: "🔄 Zoom-Daten aktualisieren", en: "🔄 Refresh Zoom data", ru: "🔄 Обновить данные Zoom" },
  zoomSyncLoad: { de: "📹 Zoom-Daten laden", en: "📹 Load Zoom data", ru: "📹 Загрузить данные Zoom" },
  zoomSyncLoading: {
    de: (title: string) => `⏳ Lade Zoom-Teilnehmerdaten für "<b>${title}</b>"...`,
    en: (title: string) => `⏳ Loading Zoom participant data for "<b>${title}</b>"...`,
    ru: (title: string) => `⏳ Загрузка данных участников Zoom для "<b>${title}</b>"...`,
  },
  zoomSyncSuccess: {
    de: (synced: number, skipped: number) => `✅ ${synced} Teilnehmer synchronisiert!${skipped > 0 ? ` (${skipped} bereits vorhanden)` : ""}\n\nDie aktualisierten Daten findest du in der Partner App.`,
    en: (synced: number, skipped: number) => `✅ ${synced} participants synced!${skipped > 0 ? ` (${skipped} already existed)` : ""}\n\nUpdated data is available in the Partner App.`,
    ru: (synced: number, skipped: number) => `✅ ${synced} участников синхронизировано!${skipped > 0 ? ` (${skipped} уже были)` : ""}\n\nОбновлённые данные доступны в Partner App.`,
  },
  zoomSyncNoNew: {
    de: (skipped: number) => `ℹ️ Keine neuen Teilnehmerdaten gefunden.${skipped > 0 ? ` ${skipped} bereits synchronisiert.` : ""}`,
    en: (skipped: number) => `ℹ️ No new participant data found.${skipped > 0 ? ` ${skipped} already synced.` : ""}`,
    ru: (skipped: number) => `ℹ️ Новых данных не найдено.${skipped > 0 ? ` ${skipped} уже синхронизировано.` : ""}`,
  },
  zoomSyncError: {
    de: `❌ Fehler beim Laden der Zoom-Daten. Bitte versuche es später erneut.`,
    en: `❌ Error loading Zoom data. Please try again later.`,
    ru: `❌ Ошибка загрузки данных Zoom. Попробуйте позже.`,
  },

  noEventsFollowup: {
    de: `📋 Keine Events für Follow-up vorhanden.`,
    en: `📋 No events available for follow-up.`,
    ru: `📋 Нет событий для follow-up.`,
  },
  selectEventFollowup: {
    de: `🤖 <b>Für welches Event möchtest du Follow-up-Nachrichten erstellen?</b>`,
    en: `🤖 <b>For which event would you like to create follow-up messages?</b>`,
    ru: `🤖 <b>Для какого события вы хотите создать follow-up сообщения?</b>`,
  },

  aiSystemPrompt: {
    de: (event: { title: string; eventDate: string; eventTime: string }, partnerName: string, guestSummary: string) =>
      `Du bist ein KI-Assistent für JetUP Partner. Du hilfst Partnern bei der Nachbereitung von Webinaren.\n\nEventdaten:\n- Titel: ${event.title}\n- Datum: ${event.eventDate} ${event.eventTime}\n- Partner: ${partnerName}\n\nGäste und Engagement:\n${guestSummary || "Keine Gäste registriert."}\n\nDeine Aufgaben:\n1. Personalisierte Follow-up-Nachrichten für Gäste vorschlagen\n2. Recruiting- und Vertriebsnachrichten formulieren\n3. Gesprächsleitfäden für Abschlüsse bereitstellen\n4. Empfehlungen geben, welche Gäste priorisiert werden sollten\n5. Fragen des Partners zu seinen Leads beantworten\n\nAntworte immer auf Deutsch. Sei professionell, aber freundlich. Gib konkrete, umsetzbare Vorschläge.`,
    en: (event: { title: string; eventDate: string; eventTime: string }, partnerName: string, guestSummary: string) =>
      `You are an AI assistant for JetUP Partners. You help partners with webinar follow-up.\n\nEvent data:\n- Title: ${event.title}\n- Date: ${event.eventDate} ${event.eventTime}\n- Partner: ${partnerName}\n\nGuests and engagement:\n${guestSummary || "No guests registered."}\n\nYour tasks:\n1. Suggest personalized follow-up messages for guests\n2. Compose recruiting and sales messages\n3. Provide conversation guides for closing\n4. Recommend which guests to prioritize\n5. Answer partner questions about their leads\n\nAlways respond in English. Be professional but friendly. Give concrete, actionable suggestions.`,
    ru: (event: { title: string; eventDate: string; eventTime: string }, partnerName: string, guestSummary: string) =>
      `Ты ИИ-ассистент для партнёров JetUP. Ты помогаешь партнёрам с постобработкой вебинаров.\n\nДанные события:\n- Название: ${event.title}\n- Дата: ${event.eventDate} ${event.eventTime}\n- Партнёр: ${partnerName}\n\nГости и вовлечённость:\n${guestSummary || "Нет зарегистрированных гостей."}\n\nТвои задачи:\n1. Предлагать персонализированные follow-up сообщения для гостей\n2. Составлять рекрутинговые и продающие сообщения\n3. Предоставлять сценарии разговоров для закрытия\n4. Рекомендовать, каких гостей приоритизировать\n5. Отвечать на вопросы партнёра о его лидах\n\nВсегда отвечай на русском. Будь профессиональным, но дружелюбным. Давай конкретные, выполнимые предложения.`,
  },

  aiGreetingWithGuests: {
    de: (count: number, title: string, firstName: string) =>
      `Hier ist eine Übersicht deiner ${count} Gäste vom Event "${title}". Ich kann dir helfen mit:\n\n• Follow-up-Nachrichten für einzelne Gäste\n• Priorisierung der Leads\n• Recruiting-Strategien\n\nFrag mich einfach! Z.B. "Schreibe eine Follow-up-Nachricht für ${firstName}" oder "Wen soll ich zuerst kontaktieren?"`,
    en: (count: number, title: string, firstName: string) =>
      `Here's an overview of your ${count} guests from the event "${title}". I can help you with:\n\n• Follow-up messages for individual guests\n• Lead prioritization\n• Recruiting strategies\n\nJust ask! E.g. "Write a follow-up message for ${firstName}" or "Who should I contact first?"`,
    ru: (count: number, title: string, firstName: string) =>
      `Вот обзор ваших ${count} гостей с события "${title}". Я могу помочь вам с:\n\n• Follow-up сообщения для отдельных гостей\n• Приоритизация лидов\n• Стратегии рекрутинга\n\nПросто спросите! Например: "Напиши follow-up для ${firstName}" или "Кого мне контактировать первым?"`,
  },
  aiGreetingNoGuests: {
    de: (title: string) => `Für "${title}" sind noch keine Gäste registriert. Sobald sich Gäste anmelden, kann ich dir mit Follow-up-Nachrichten helfen.`,
    en: (title: string) => `No guests are registered for "${title}" yet. Once guests sign up, I can help you with follow-up messages.`,
    ru: (title: string) => `На "${title}" пока нет зарегистрированных гостей. Как только появятся гости, я помогу с follow-up сообщениями.`,
  },
  aiHeader: {
    de: (title: string) => `🤖 <b>KI Follow-up Assistent</b>\n📋 Event: ${title}\n\n`,
    en: (title: string) => `🤖 <b>AI Follow-up Assistant</b>\n📋 Event: ${title}\n\n`,
    ru: (title: string) => `🤖 <b>ИИ Follow-up Ассистент</b>\n📋 Событие: ${title}\n\n`,
  },
  aiExitHint: {
    de: `<i>Sende /exit um den Follow-up-Modus zu verlassen.</i>`,
    en: `<i>Send /exit to leave follow-up mode.</i>`,
    ru: `<i>Отправьте /exit чтобы выйти из режима follow-up.</i>`,
  },
  aiFallback: {
    de: `Entschuldigung, ich konnte keine Antwort generieren.`,
    en: `Sorry, I couldn't generate a response.`,
    ru: `Извините, не удалось сгенерировать ответ.`,
  },
  aiError: {
    de: `❌ Fehler bei der KI-Verarbeitung. Bitte versuche es erneut.`,
    en: `❌ AI processing error. Please try again.`,
    ru: `❌ Ошибка обработки ИИ. Попробуйте ещё раз.`,
  },

  helpMenu: {
    de: `📖 <b>JetUP Partner Bot — Hilfe</b>\n\nAlle Funktionen findest du in der <b>Partner App</b>:\n\n📊 Dashboard & Statistiken\n📅 Webinare & Einladungslinks\n🤖 KI-personalisierte Einladungen\n💬 KI Follow-up Assistent\n📈 Vergütungsübersicht\n\n<b>Befehle:</b>\n/start — Partner App öffnen\n/help — Diese Hilfe anzeigen`,
    en: `📖 <b>JetUP Partner Bot — Help</b>\n\nAll features are available in the <b>Partner App</b>:\n\n📊 Dashboard & Statistics\n📅 Webinars & Invite Links\n🤖 AI-personalized Invitations\n💬 AI Follow-up Assistant\n📈 Compensation Overview\n\n<b>Commands:</b>\n/start — Open Partner App\n/help — Show this help`,
    ru: `📖 <b>JetUP Partner Bot — Помощь</b>\n\nВсе функции доступны в <b>Partner App</b>:\n\n📊 Дашборд и статистика\n📅 Вебинары и ссылки-приглашения\n🤖 ИИ-персонализированные приглашения\n💬 ИИ Follow-up Ассистент\n📈 Обзор вознаграждений\n\n<b>Команды:</b>\n/start — Открыть Partner App\n/help — Показать эту помощь`,
  },

  exitFollowup: {
    de: `✅ Follow-up-Modus beendet.`,
    en: `✅ Follow-up mode ended.`,
    ru: `✅ Режим follow-up завершён.`,
  },
  openAppForFeatures: {
    de: `Öffne die Partner App für alle Funktionen:`,
    en: `Open the Partner App for all features:`,
    ru: `Откройте Partner App для доступа ко всем функциям:`,
  },
  welcomeSendStart: {
    de: `Willkommen! Sende /start um dich als Partner zu registrieren.`,
    en: `Welcome! Send /start to register as a partner.`,
    ru: `Добро пожаловать! Отправьте /start чтобы зарегистрироваться как партнёр.`,
  },

  reminderSubscribed: {
    de: (eventInfo: string) => `✅ <b>Super! Du erhältst Erinnerungen für das Webinar.</b>${eventInfo}\n\nWir benachrichtigen dich kurz vor dem Start mit deinem persönlichen Zugangslink. 🔔`,
    en: (eventInfo: string) => `✅ <b>Great! You'll receive reminders for the webinar.</b>${eventInfo}\n\nWe'll notify you shortly before it starts with your personal access link. 🔔`,
    ru: (eventInfo: string) => `✅ <b>Отлично! Вы будете получать напоминания о вебинаре.</b>${eventInfo}\n\nМы уведомим вас незадолго до начала с вашей персональной ссылкой. 🔔`,
  },
  reminderNotRegistered: {
    de: `⚠️ Du bist noch nicht für dieses Webinar registriert. Bitte vervollständige zuerst die Registrierung.`,
    en: `⚠️ You are not registered for this webinar yet. Please complete registration first.`,
    ru: `⚠️ Вы ещё не зарегистрированы на этот вебинар. Сначала завершите регистрацию.`,
  },
  reminderNotFound: {
    de: `❌ Einladungslink nicht gefunden. Bitte wende dich an deinen Partner.`,
    en: `❌ Invitation link not found. Please contact your partner.`,
    ru: `❌ Ссылка-приглашение не найдена. Обратитесь к вашему партнёру.`,
  },

  notifyPersonalInvite: {
    de: (eventTitle: string, guestName: string, guestEmail: string, guestPhone: string | undefined, inviteCode: string, time: string) =>
      `🎯 <b>Neue Registrierung (persönliche Einladung)!</b>\n\n📋 <b>Event:</b> ${eventTitle}\n👤 <b>Gast:</b> ${guestName}\n📧 <b>E-Mail:</b> ${guestEmail}\n${guestPhone ? `📱 <b>Tel:</b> ${guestPhone}\n` : ""}🔗 <b>Einladungscode:</b> ${inviteCode}\n⏰ ${time}`,
    en: (eventTitle: string, guestName: string, guestEmail: string, guestPhone: string | undefined, inviteCode: string, time: string) =>
      `🎯 <b>New registration (personal invite)!</b>\n\n📋 <b>Event:</b> ${eventTitle}\n👤 <b>Guest:</b> ${guestName}\n📧 <b>Email:</b> ${guestEmail}\n${guestPhone ? `📱 <b>Phone:</b> ${guestPhone}\n` : ""}🔗 <b>Invite code:</b> ${inviteCode}\n⏰ ${time}`,
    ru: (eventTitle: string, guestName: string, guestEmail: string, guestPhone: string | undefined, inviteCode: string, time: string) =>
      `🎯 <b>Новая регистрация (персональное приглашение)!</b>\n\n📋 <b>Событие:</b> ${eventTitle}\n👤 <b>Гость:</b> ${guestName}\n📧 <b>Email:</b> ${guestEmail}\n${guestPhone ? `📱 <b>Тел:</b> ${guestPhone}\n` : ""}🔗 <b>Код приглашения:</b> ${inviteCode}\n⏰ ${time}`,
  },
  notifyNewRegistration: {
    de: (title: string, name: string, email: string, phone: string | undefined, time: string) =>
      `🎟 <b>Neue Registrierung!</b>\n\n📋 <b>Event:</b> ${title}\n👤 <b>Gast:</b> ${name}\n📧 <b>E-Mail:</b> ${email}\n${phone ? `📱 <b>Tel:</b> ${phone}\n` : ""}⏰ ${time}`,
    en: (title: string, name: string, email: string, phone: string | undefined, time: string) =>
      `🎟 <b>New registration!</b>\n\n📋 <b>Event:</b> ${title}\n👤 <b>Guest:</b> ${name}\n📧 <b>Email:</b> ${email}\n${phone ? `📱 <b>Phone:</b> ${phone}\n` : ""}⏰ ${time}`,
    ru: (title: string, name: string, email: string, phone: string | undefined, time: string) =>
      `🎟 <b>Новая регистрация!</b>\n\n📋 <b>Событие:</b> ${title}\n👤 <b>Гость:</b> ${name}\n📧 <b>Email:</b> ${email}\n${phone ? `📱 <b>Тел:</b> ${phone}\n` : ""}⏰ ${time}`,
  },

  cmdStart: { de: "Partner App öffnen", en: "Open Partner App", ru: "Открыть Partner App" },
  cmdHelp: { de: "Hilfe anzeigen", en: "Show help", ru: "Показать помощь" },

  guestSummaryAttended: { de: "Teilgenommen", en: "Attended", ru: "Участвовал" },
  guestSummaryMin: { de: "Min.", en: "min.", ru: "мин." },
  guestSummaryQuestions: { de: "Fragen gestellt", en: "questions asked", ru: "задано вопросов" },
  guestSummaryClickedZoom: { de: "Hat Zoom-Link geklickt", en: "Clicked Zoom link", ru: "Нажал ссылку Zoom" },
  guestSummaryRegisteredNotJoined: { de: "Registriert, aber nicht beigetreten", en: "Registered but did not join", ru: "Зарегистрирован, но не присоединился" },
  personalInviteFallbackTitle: {
    de: (name: string) => name ? `AI-Einladung für ${name}` : "Persönliche Einladung",
    en: (name: string) => name ? `AI invite for ${name}` : "Personal invite",
    ru: (name: string) => name ? `AI-приглашение для ${name}` : "Персональное приглашение",
  },
} as const;

type TextsMap = typeof texts;

export function t<K extends keyof TextsMap>(lang: BotLang, key: K): TextsMap[K]["en"] {
  const entry = texts[key] as Record<BotLang, TextsMap[K]["en"]>;
  return entry[lang] ?? entry["en"];
}
