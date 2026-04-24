import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { storage } from "../storage";
import { sendTelegramNotification, sendTelegramMessageToChat } from "./telegram-notify";
import { isZoomConfigured, syncZoomDataForEvent, testZoomConnection, saveZoomCredentialsToDb } from "./zoom-api";
import { type BotLang, detectLang, t } from "./partner-bot-texts";

const TELEGRAM_API = "https://api.telegram.org";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getPartnerBotToken(): string | undefined {
  if (isProduction()) {
    return process.env.TELEGRAM_PARTNER_BOT_TOKEN;
  }
  return process.env.TELEGRAM_PARTNER_BOT_TOKEN_DEV || process.env.TELEGRAM_PARTNER_BOT_TOKEN;
}

function getPartnerBotUsername(): string {
  return process.env.TELEGRAM_PARTNER_BOT_USERNAME || (isProduction() ? "JetUP_Partner_Bot" : "Jetup_partner_test_bot");
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
      language_code?: string;
    };
    message: {
      message_id: number;
      chat: { id: number };
    };
    data: string;
  };
}

const registrationState: Map<string, { step: string; data: any }> = new Map();

const aiConversations: Map<string, { messages: Array<{ role: "user" | "assistant" | "system"; content: string }>; eventId?: number; lang?: BotLang }> = new Map();

async function sendMessage(chatId: number | string, text: string, options?: any): Promise<any> {
  const token = getPartnerBotToken();
  if (!token) return null;

  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...options,
  };

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Bot send error:", JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error("Bot send failed:", error);
    return null;
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  const token = getPartnerBotToken();
  if (!token) return;

  await fetch(`${TELEGRAM_API}/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

async function editMessage(chatId: number, messageId: number, text: string, options?: any): Promise<void> {
  const token = getPartnerBotToken();
  if (!token) return;

  await fetch(`${TELEGRAM_API}/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      ...options,
    }),
  });
}

async function getPartnerLang(chatId: number | string, fromLangCode?: string): Promise<BotLang> {
  const detected = detectLang(fromLangCode);
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (partner && fromLangCode) {
    if (partner.language !== detected) {
      await storage.updatePartnerLanguage(partner.id, detected);
    }
    return detected;
  }
  if (partner?.language && (partner.language === "de" || partner.language === "en" || partner.language === "ru")) {
    return partner.language;
  }
  return detected;
}

async function handleStart(chatId: number, from: any, lang: BotLang): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  const baseUrl = getBaseUrl();
  const webAppUrl = `${baseUrl}/partner-app`;

  if (partner) {
    await sendMessage(chatId,
      t(lang, "welcomeBack")(partner.name),
      {
        reply_markup: JSON.stringify({
          inline_keyboard: [[{ text: t(lang, "appButton"), web_app: { url: webAppUrl } }]],
        }),
      }
    );
    return;
  }

  await sendMessage(chatId,
    t(lang, "welcomeNew"),
    {
      reply_markup: JSON.stringify({
        inline_keyboard: [[{ text: t(lang, "registerButton"), web_app: { url: webAppUrl } }]],
      }),
    }
  );
}

async function handleRegistration(chatId: number, text: string, lang: BotLang): Promise<boolean> {
  const state = registrationState.get(String(chatId));
  if (!state) return false;

  if (text.startsWith("/")) {
    registrationState.delete(String(chatId));
    return false;
  }

  if (state.step === "name") {
    state.data.name = text.trim();
    state.step = "cu";
    registrationState.set(String(chatId), state);
    await sendMessage(chatId, t(lang, "regStepCu")(state.data.name));
    return true;
  }

  if (state.step === "cu") {
    state.data.cuNumber = text.trim();
    state.step = "phone";
    registrationState.set(String(chatId), state);
    await sendMessage(chatId, t(lang, "regStepPhone"));
    return true;
  }

  if (state.step === "phone") {
    if (text.trim() !== "/skip") {
      state.data.phone = text.trim();
    }
    state.step = "email";
    registrationState.set(String(chatId), state);
    await sendMessage(chatId, t(lang, "regStepEmail"));
    return true;
  }

  if (state.step === "email") {
    if (text.trim() !== "/skip") {
      state.data.email = text.trim();
    }

    try {
      const partner = await storage.createPartner({
        telegramChatId: state.data.telegramChatId,
        telegramUsername: state.data.telegramUsername,
        name: state.data.name,
        cuNumber: state.data.cuNumber,
        phone: state.data.phone || null,
        email: state.data.email || null,
        status: "active",
        language: lang,
      });

      registrationState.delete(String(chatId));

      const baseUrl = getBaseUrl();
      const webAppUrl = `${baseUrl}/partner-app`;

      await sendMessage(chatId,
        t(lang, "regSuccess")({ name: partner.name, cuNumber: partner.cuNumber, phone: partner.phone, email: partner.email }),
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [[{ text: t(lang, "appButton"), web_app: { url: webAppUrl } }]],
          }),
        }
      );

      console.log(`New partner registered: ${partner.name} (CU: ${partner.cuNumber})`);
    } catch (error: any) {
      registrationState.delete(String(chatId));
      if (error.message?.includes("unique")) {
        await sendMessage(chatId, t(lang, "regAlreadyExists"));
      } else {
        await sendMessage(chatId, t(lang, "regError"));
      }
    }
    return true;
  }

  return false;
}


async function handleInviteCallback(callbackQueryId: string, chatId: number, scheduleEventId: number, messageId: number, lang: BotLang): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) {
    await answerCallbackQuery(callbackQueryId, t(lang, "notRegisteredShort"));
    return;
  }

  const scheduleEvent = await storage.getScheduleEvent(scheduleEventId);
  if (!scheduleEvent) {
    await answerCallbackQuery(callbackQueryId, t(lang, "eventNotFound"));
    return;
  }

  await answerCallbackQuery(callbackQueryId, t(lang, "creatingLink"));

  const inviteEvent = await storage.createInviteEvent({
    partnerName: partner.name,
    partnerCu: partner.cuNumber,
    partnerId: partner.id,
    scheduleEventId: scheduleEvent.id,
    zoomLink: scheduleEvent.link,
    title: scheduleEvent.title,
    eventDate: scheduleEvent.date,
    eventTime: scheduleEvent.time,
    isActive: true,
  });

  const baseUrl = getBaseUrl() || "https://jet-up.ai";
  const inviteUrl = `${baseUrl}/invite/${inviteEvent.inviteCode}`;

  await editMessage(chatId, messageId,
    t(lang, "inviteLinkCreated")(scheduleEvent.title, scheduleEvent.date, scheduleEvent.time, scheduleEvent.speaker, inviteUrl)
  );
}


async function handleReport(chatId: number, lang: BotLang, eventId?: number): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) {
    await sendMessage(chatId, t(lang, "notRegistered"));
    return;
  }

  if (!eventId) {
    const events = await storage.getInviteEventsByPartnerId(partner.id);
    if (events.length === 0) {
      await sendMessage(chatId, t(lang, "noEvents"));
      return;
    }

    const keyboard = events.slice(0, 10).map(event => [{
      text: `${event.title.substring(0, 35)} (${event.guestCount} ${t(lang, "guestsLabel")})`,
      callback_data: `report_${event.id}`,
    }]);

    await sendMessage(chatId, t(lang, "selectEventReport"), {
      reply_markup: { inline_keyboard: keyboard },
    });
    return;
  }

  const event = await storage.getInviteEventById(eventId);
  if (!event || event.partnerId !== partner.id) {
    await sendMessage(chatId, t(lang, "eventNotFoundOrNoAccess"));
    return;
  }

  const guests = await storage.getGuestsByEventId(event.id);
  const clicked = guests.filter(g => g.clickedZoom);
  const notClicked = guests.filter(g => !g.clickedZoom);

  let msg = t(lang, "reportHeader")(event.title, event.eventDate, event.eventTime);
  msg += `📝 ${t(lang, "registered")}: <b>${guests.length}</b>\n`;
  msg += `✅ ${t(lang, "zoomJoined")}: <b>${clicked.length}</b>\n`;
  msg += `❌ ${t(lang, "zoomNotJoined")}: <b>${notClicked.length}</b>\n`;

  const zoomData = await storage.getZoomAttendanceByEventId(event.id);
  if (zoomData.length > 0) {
    const totalDuration = zoomData.reduce((sum, z) => sum + z.durationMinutes, 0);
    const avgDuration = Math.round(totalDuration / zoomData.length);
    const totalQuestions = zoomData.reduce((sum, z) => sum + z.questionsAsked, 0);

    msg += `\n` + t(lang, "zoomParticipantsApi")(zoomData.length) + `\n`;
    msg += `⏱ Ø ${avgDuration} ${t(lang, "avgMin")}`;
    if (totalQuestions > 0) msg += ` | 💬 ${totalQuestions} ${t(lang, "questions")}`;
    msg += `\n\n`;

    for (const z of zoomData.slice(0, 15)) {
      const guestName = z.participantName || z.participantEmail;
      const matched = z.inviteGuestId ? "✅" : "❓";
      const locale = lang === "de" ? "de-DE" : lang === "ru" ? "ru-RU" : "en-GB";
      const joinStr = z.joinTime ? new Date(z.joinTime).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }) : "–";
      const leaveStr = z.leaveTime ? new Date(z.leaveTime).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }) : "–";
      msg += `  ${matched} ${guestName}\n`;
      msg += `     📧 ${z.participantEmail} | ⏱ ${joinStr}–${leaveStr} (${z.durationMinutes} ${t(lang, "avgMin")})`;
      if (z.questionsAsked > 0) msg += ` | 💬 ${z.questionsAsked}`;
      msg += `\n`;
    }
    if (zoomData.length > 15) {
      msg += t(lang, "andMore")(zoomData.length - 15) + `\n`;
    }

    const zoomEmails = new Set(zoomData.map(z => z.participantEmail.toLowerCase()));
    const registeredNotAttended = guests.filter(g => !zoomEmails.has(g.email.toLowerCase()));
    if (registeredNotAttended.length > 0) {
      msg += t(lang, "registeredNotOnZoom")(registeredNotAttended.length) + `\n`;
      registeredNotAttended.slice(0, 10).forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
    }

    const guestEmails = new Set(guests.map(g => g.email.toLowerCase()));
    const attendedNotRegistered = zoomData.filter(z => !guestEmails.has(z.participantEmail.toLowerCase()) && !z.inviteGuestId);
    if (attendedNotRegistered.length > 0) {
      msg += t(lang, "onZoomNotRegistered")(attendedNotRegistered.length) + `\n`;
      attendedNotRegistered.slice(0, 10).forEach(z => { msg += `  • ${z.participantName || z.participantEmail}\n`; });
    }
  } else {
    if (clicked.length > 0) {
      msg += t(lang, "zoomLinkClicked") + `\n`;
      clicked.forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
    }
    if (notClicked.length > 0) {
      msg += t(lang, "zoomLinkNotClicked") + `\n`;
      notClicked.forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
    }
  }

  const keyboard: Array<Array<{ text: string; callback_data: string }>> = [[{
    text: t(lang, "aiFollowupButton"),
    callback_data: `followup_${event.id}`,
  }]];

  if (isZoomConfigured()) {
    keyboard.push([{
      text: zoomData.length > 0 ? t(lang, "zoomSyncRefresh") : t(lang, "zoomSyncLoad"),
      callback_data: `zoom_sync_${event.id}`,
    }]);
  }

  await sendMessage(chatId, msg, { reply_markup: { inline_keyboard: keyboard } });
}

async function handleZoomSync(callbackQueryId: string, chatId: number, eventId: number, lang: BotLang): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) return;

  const event = await storage.getInviteEventById(eventId);
  if (!event || event.partnerId !== partner.id) {
    await answerCallbackQuery(callbackQueryId, t(lang, "noAccess"));
    return;
  }

  await answerCallbackQuery(callbackQueryId);
  await sendMessage(chatId, t(lang, "zoomSyncLoading")(event.title));

  try {
    let zoomUrl = event.zoomLink;
    if (!zoomUrl && event.scheduleEventId) {
      const se = await storage.getScheduleEvent(event.scheduleEventId);
      if (se) zoomUrl = se.link;
    }
    const result = await syncZoomDataForEvent(event.id, zoomUrl);
    if (result.error) {
      await sendMessage(chatId, `⚠️ ${result.error}`);
    } else if (result.synced > 0) {
      await sendMessage(chatId, t(lang, "zoomSyncSuccess")(result.synced, result.skipped));
    } else {
      await sendMessage(chatId, t(lang, "zoomSyncNoNew")(result.skipped));
    }
  } catch (error) {
    await sendMessage(chatId, t(lang, "zoomSyncError"));
  }
}

async function handleFollowup(chatId: number, lang: BotLang, eventId?: number): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) {
    await sendMessage(chatId, t(lang, "notRegistered"));
    return;
  }

  if (!eventId) {
    const events = await storage.getInviteEventsByPartnerId(partner.id);
    if (events.length === 0) {
      await sendMessage(chatId, t(lang, "noEventsFollowup"));
      return;
    }

    const keyboard = events.slice(0, 10).map(event => [{
      text: `${event.title.substring(0, 35)}`,
      callback_data: `followup_${event.id}`,
    }]);

    await sendMessage(chatId, t(lang, "selectEventFollowup"), {
      reply_markup: { inline_keyboard: keyboard },
    });
    return;
  }

  const event = await storage.getInviteEventById(eventId);
  if (!event || event.partnerId !== partner.id) {
    await sendMessage(chatId, t(lang, "eventNotFoundOrNoAccess"));
    return;
  }

  const guests = await storage.getGuestsByEventId(event.id);
  const zoomData = await storage.getZoomAttendanceByEventId(event.id);

  let guestSummary = "";
  for (const guest of guests) {
    const zoom = zoomData.find(z => z.inviteGuestId === guest.id);
    guestSummary += `- ${guest.name} (${guest.email}): `;
    if (zoom) {
      guestSummary += `${t(lang, "guestSummaryAttended")} ${zoom.durationMinutes} ${t(lang, "guestSummaryMin")}`;
      if (zoom.questionsAsked > 0) guestSummary += `, ${zoom.questionsAsked} ${t(lang, "guestSummaryQuestions")}`;
    } else if (guest.clickedZoom) {
      guestSummary += t(lang, "guestSummaryClickedZoom");
    } else {
      guestSummary += t(lang, "guestSummaryRegisteredNotJoined");
    }
    guestSummary += "\n";
  }

  const systemPrompt = t(lang, "aiSystemPrompt")(event, partner.name, guestSummary);

  const convKey = `${chatId}_followup`;
  aiConversations.set(convKey, {
    messages: [{ role: "system", content: systemPrompt }],
    eventId,
    lang,
  });

  const initialPrompt = guests.length > 0
    ? t(lang, "aiGreetingWithGuests")(guests.length, event.title, guests[0]?.name)
    : t(lang, "aiGreetingNoGuests")(event.title);

  await sendMessage(chatId,
    t(lang, "aiHeader")(event.title) +
    initialPrompt + `\n\n` +
    t(lang, "aiExitHint")
  );
}

async function handleAIMessage(chatId: number, text: string): Promise<boolean> {
  const convKey = `${chatId}_followup`;
  const conversation = aiConversations.get(convKey);
  if (!conversation) return false;
  const lang: BotLang = conversation.lang || "en";

  if (text.startsWith("/")) {
    aiConversations.delete(convKey);
    return false;
  }

  conversation.messages.push({ role: "user", content: text });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation.messages.map(m => ({ role: m.role as any, content: m.content })),
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || t(lang, "aiFallback");
    conversation.messages.push({ role: "assistant", content: reply });

    if (conversation.messages.length > 20) {
      const system = conversation.messages[0];
      conversation.messages = [system, ...conversation.messages.slice(-10)];
    }

    await sendMessage(chatId, reply);
  } catch (error) {
    console.error("AI followup error:", error);
    await sendMessage(chatId, t(lang, "aiError"));
  }

  return true;
}

async function handleHelp(chatId: number, lang: BotLang): Promise<void> {
  const baseUrl = getBaseUrl();
  const webAppUrl = `${baseUrl}/partner-app`;

  await sendMessage(chatId,
    t(lang, "helpMenu"),
    {
      reply_markup: JSON.stringify({
        inline_keyboard: [[{ text: t(lang, "appButton"), web_app: { url: webAppUrl } }]],
      }),
    }
  );
}

async function handleUpdate(update: TelegramUpdate): Promise<void> {
  if (update.callback_query) {
    const { id: queryId, data, message, from } = update.callback_query;
    const chatId = message.chat.id;
    const lang = await getPartnerLang(chatId, from?.language_code);

    if (data.startsWith("invite_event_")) {
      const scheduleEventId = parseInt(data.replace("invite_event_", ""));
      await handleInviteCallback(queryId, chatId, scheduleEventId, message.message_id, lang);
    } else if (data.startsWith("report_")) {
      const eventId = parseInt(data.replace("report_", ""));
      await answerCallbackQuery(queryId);
      await handleReport(chatId, lang, eventId);
    } else if (data.startsWith("followup_")) {
      const eventId = parseInt(data.replace("followup_", ""));
      await answerCallbackQuery(queryId);
      await handleFollowup(chatId, lang, eventId);
    } else if (data.startsWith("zoom_sync_")) {
      const eventId = parseInt(data.replace("zoom_sync_", ""));
      await handleZoomSync(queryId, chatId, eventId, lang);
    } else {
      await answerCallbackQuery(queryId);
    }
    return;
  }

  if (!update.message?.text) return;

  const chatId = update.message.chat.id;
  const text = update.message.text.trim();
  const from = update.message.from;
  const lang = await getPartnerLang(chatId, from?.language_code);

  console.log(`Bot received from ${chatId} (@${from?.username}, lang=${from?.language_code}→${lang}): ${text}`);

  if (await handleRegistration(chatId, text, lang)) return;

  if (await handleAIMessage(chatId, text)) return;

  const command = text.split(" ")[0].split("@")[0].toLowerCase();
  const startParam = text.startsWith("/start ") ? text.slice(7).trim() : null;

  if (command === "/start" && startParam?.startsWith("remind_")) {
    const inviteCode = startParam.slice(7);
    try {
      const invite = await storage.getPersonalInviteByCode(inviteCode);
      if (invite && invite.registeredAt) {
        await storage.updatePersonalInviteTelegram(invite.id, String(chatId));
        let eventInfo = "";
        if (invite.scheduleEventId) {
          const se = await storage.getScheduleEvent(invite.scheduleEventId);
          if (se) eventInfo = `\n\n📅 <b>${se.title}</b>\n🕐 ${se.date || ""} ${se.time || ""} ${se.timezone || ""}`;
        }
        await sendMessage(chatId, t(lang, "reminderSubscribed")(eventInfo));
      } else if (invite) {
        await sendMessage(chatId, t(lang, "reminderNotRegistered"));
      } else {
        await sendMessage(chatId, t(lang, "reminderNotFound"));
      }
    } catch (e) {
      console.error("[Bot] remind_ handler error:", e);
    }
    return;
  }

  switch (command) {
    case "/start":
      await handleStart(chatId, from, lang);
      break;
    case "/help":
      await handleHelp(chatId, lang);
      break;
    case "/exit":
      aiConversations.delete(`${chatId}_followup`);
      await sendMessage(chatId, t(lang, "exitFollowup"));
      break;
    default: {
      const partner = await storage.getPartnerByTelegramChatId(String(chatId));
      if (partner) {
        const baseUrl = getBaseUrl();
        const webAppUrl = `${baseUrl}/partner-app`;
        await sendMessage(chatId,
          t(lang, "openAppForFeatures"),
          {
            reply_markup: JSON.stringify({
              inline_keyboard: [[{ text: t(lang, "appButton"), web_app: { url: webAppUrl } }]],
            }),
          }
        );
      } else {
        await sendMessage(chatId, t(lang, "welcomeSendStart"));
      }
    }
  }
}

function getBaseUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return process.env.PRODUCTION_URL || "https://jet-up.ai";
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return "https://jet-up.ai";
}

async function setBotCommands(): Promise<void> {
  const token = getPartnerBotToken();
  if (!token) return;

  const commands = [
    { command: "start", description: "Partner App / Open Partner App / Открыть Partner App" },
    { command: "help", description: "Hilfe / Help / Помощь" },
  ];

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands }),
    });
    console.log("Partner bot commands menu set");
  } catch (error) {
    console.error("Failed to set bot commands:", error);
  }
}

async function autoSetWebhook(): Promise<void> {
  const token = getPartnerBotToken();
  if (!token) {
    console.log(`Partner bot: no token found for ${isProduction() ? "production" : "development"} environment, skipping webhook setup`);
    return;
  }

  const baseUrl = getBaseUrl();
  const botUsername = getPartnerBotUsername();

  const webhookUrl = `${baseUrl}/api/telegram-bot/webhook`;
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const result = await res.json();
    console.log(`Partner bot webhook set: @${botUsername} → ${webhookUrl} (${isProduction() ? "PROD" : "DEV"})`, result);
  } catch (error) {
    console.error("Failed to auto-set partner bot webhook:", error);
  }

  await setBotCommands();
}

export function registerPartnerBotRoutes(app: Express): void {
  autoSetWebhook();

  app.get("/api/partner-app/bot-config", (_req: Request, res: Response) => {
    res.json({ botUsername: getPartnerBotUsername() });
  });

  app.post("/api/telegram-bot/webhook", async (req: Request, res: Response) => {
    try {
      const update: TelegramUpdate = req.body;
      await handleUpdate(update);
      res.sendStatus(200);
    } catch (error) {
      console.error("Bot webhook error:", error);
      res.sendStatus(200);
    }
  });

  app.post("/api/admin/bot/set-webhook", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'] || req.body?.adminPassword;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = getPartnerBotToken();
    if (!token) {
      return res.status(400).json({ error: "TELEGRAM_PARTNER_BOT_TOKEN not set" });
    }

    const webhookUrl = req.body.webhookUrl;
    if (!webhookUrl) {
      return res.status(400).json({ error: "webhookUrl required" });
    }

    try {
      const setRes = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      });
      const result = await setRes.json();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/partners", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const allPartners = await storage.getAllPartners();
      res.json(allPartners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/zoom-sync/:eventId", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const event = await storage.getInviteEventById(Number(req.params.eventId));
      if (!event) return res.status(404).json({ error: "Event not found" });

      let zoomUrl = event.zoomLink;
      if (!zoomUrl && event.scheduleEventId) {
        const se = await storage.getScheduleEvent(event.scheduleEventId);
        if (se) zoomUrl = se.link;
      }
      const result = await syncZoomDataForEvent(event.id, zoomUrl);
      if (result.error && result.synced === 0) {
        return res.json({ synced: 0, skipped: result.skipped || 0, error: result.error });
      }
      res.json({ synced: result.synced, skipped: result.skipped || 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/zoom-test", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await testZoomConnection();
    res.json({ configured: isZoomConfigured(), ...result });
  });

  app.post("/api/admin/zoom-credentials", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { accountId, clientId, clientSecret } = req.body;
    if (!accountId || !clientId || !clientSecret) {
      return res.status(400).json({ error: "All three fields are required" });
    }

    process.env.ZOOM_ACCOUNT_ID = accountId;
    process.env.ZOOM_CLIENT_ID = clientId;
    process.env.ZOOM_CLIENT_SECRET = clientSecret;

    await saveZoomCredentialsToDb(accountId, clientId, clientSecret);

    const result = await testZoomConnection();
    res.json({ configured: true, ...result });
  });

  app.get("/api/admin/zoom-attendance/:eventId", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const attendance = await storage.getZoomAttendanceByEventId(Number(req.params.eventId));
      res.json(attendance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

export async function notifyPartnerPersonalInviteRegistration(invite: any, guestName: string, guestEmail: string, guestPhone?: string): Promise<void> {
  if (!invite.partnerId) return;

  const partner = await storage.getPartnerById(invite.partnerId);
  if (!partner) return;

  const lang: BotLang = (partner.language === "de" || partner.language === "en" || partner.language === "ru") ? partner.language : "en";

  let eventTitle = t(lang, "personalInviteFallbackTitle")(invite.prospectName || "");
  try {
    if (invite.scheduleEventId) {
      const ev = await storage.getScheduleEvent(invite.scheduleEventId);
      if (ev) eventTitle = ev.title;
    }
  } catch {}

  const time = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
  await sendTelegramMessageToChat(
    partner.telegramChatId,
    t(lang, "notifyPersonalInvite")(eventTitle, guestName, guestEmail, guestPhone, invite.inviteCode, time),
    getPartnerBotToken()
  );
}

export async function notifyPartnerNewRegistration(event: any, guest: any): Promise<void> {
  if (!event.partnerId) return;

  const partner = await storage.getPartnerById(event.partnerId);
  if (!partner) return;

  const lang: BotLang = (partner.language === "de" || partner.language === "en" || partner.language === "ru") ? partner.language : "en";
  const time = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

  await sendTelegramMessageToChat(
    partner.telegramChatId,
    t(lang, "notifyNewRegistration")(event.title, guest.name, guest.email, guest.phone, time),
    getPartnerBotToken()
  );
}
