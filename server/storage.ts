import {
  type User, type InsertUser,
  type Application, type InsertApplication,
  type PromoApplication, type InsertPromoApplication,
  type DennisPromo, type InsertDennisPromo,
  type InviteEvent, type InsertInviteEvent,
  type InviteGuest, type InsertInviteGuest,
  type Partner, type InsertPartner,
  type ZoomAttendance, type InsertZoomAttendance,
  type PersonalInvite, type InsertPersonalInvite,
  type Tutorial, type InsertTutorial,
  type AmaQuestion, type InsertAmaQuestion,
  users, applications, chatSessions, chatMessages, promotions, scheduleEvents, speakers, promoApplications, dennisPromos,
  inviteEvents, inviteGuests, partners, zoomAttendance, appSettings, personalInvites, tutorials, amaQuestions,
  sofiaSessions, type SofiaSession, type InsertSofiaSession,
  sofiaDialog, type SofiaDialog, type InsertSofiaDialog,
} from "@shared/schema";
import { eq, desc, and, gte, lte, sql, count, or, isNotNull, ne } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createApplication(application: InsertApplication): Promise<Application>;
  getApplications(): Promise<Application[]>;

  createChatSession(session: { sessionId: string; language: string; type: string }): Promise<any>;
  saveChatMessage(msg: { sessionId: string; role: string; content: string }): Promise<any>;
  getChatSessions(filters?: { type?: string; dateFrom?: string; dateTo?: string }): Promise<any[]>;
  getChatSessionMessages(sessionId: string): Promise<any[]>;

  getPromotions(activeOnly?: boolean, language?: string): Promise<any[]>;
  getPromotion(id: number): Promise<any | undefined>;
  createPromotion(promo: any): Promise<any>;
  updatePromotion(id: number, promo: any): Promise<any>;
  deletePromotion(id: number): Promise<void>;

  getScheduleEvents(activeOnly?: boolean): Promise<any[]>;
  getScheduleEvent(id: number): Promise<any | undefined>;
  createScheduleEvent(event: any): Promise<any>;
  updateScheduleEvent(id: number, event: any): Promise<any>;
  deleteScheduleEvent(id: number): Promise<void>;

  createPromoApplication(application: InsertPromoApplication): Promise<PromoApplication>;
  getPromoApplications(): Promise<PromoApplication[]>;
  updatePromoApplicationStatus(id: number, status: string): Promise<PromoApplication>;
  findDuplicatePromoApplication(email: string, cuNumber: string): Promise<PromoApplication | undefined>;
  findNoMoneyApplication(email: string, cuNumber: string): Promise<PromoApplication | undefined>;
  getUnverifiedPromoApplicationByEmail(email: string, cuNumber?: string): Promise<PromoApplication | undefined>;
  markPromoApplicationVerified(id: number): Promise<PromoApplication>;
  markPromoApplicationEmailSent(id: number): Promise<PromoApplication>;
  markPromoApplicationNoMoney(id: number): Promise<PromoApplication>;
  getApplicationByEmailForNoMoney(email: string, cuNumber: string): Promise<PromoApplication | undefined>;

  getDennisPromos(activeOnly?: boolean, language?: string): Promise<DennisPromo[]>;
  getDennisPromo(id: number): Promise<DennisPromo | undefined>;
  createDennisPromo(promo: InsertDennisPromo): Promise<DennisPromo>;
  updateDennisPromo(id: number, promo: Partial<InsertDennisPromo>): Promise<DennisPromo>;
  deleteDennisPromo(id: number): Promise<void>;

  getSpeakers(activeOnly?: boolean): Promise<any[]>;
  getSpeaker(id: number): Promise<any | undefined>;
  createSpeaker(speaker: any): Promise<any>;
  updateSpeaker(id: number, speaker: any): Promise<any>;
  deleteSpeaker(id: number): Promise<void>;

  createInviteEvent(data: InsertInviteEvent): Promise<InviteEvent>;
  getInviteEventByCode(code: string): Promise<InviteEvent | undefined>;
  getInviteEventById(id: number): Promise<InviteEvent | undefined>;
  getAllInviteEvents(): Promise<(InviteEvent & { guestCount: number; clickedCount: number })[]>;
  getInviteEventsByPartnerId(partnerId: number): Promise<(InviteEvent & { guestCount: number; clickedCount: number })[]>;
  getInviteEventsByScheduleEventId(scheduleEventId: number): Promise<InviteEvent[]>;
  addInviteGuest(data: InsertInviteGuest): Promise<InviteGuest>;
  getGuestsByEventId(eventId: number): Promise<InviteGuest[]>;
  markGuestClickedZoom(guestId: number): Promise<InviteGuest>;
  getInviteGuestByToken(token: string): Promise<InviteGuest | undefined>;
  markGuestGoClicked(guestId: number): Promise<InviteGuest>;

  createPartner(data: InsertPartner): Promise<Partner>;
  getPartnerByTelegramChatId(chatId: string): Promise<Partner | undefined>;
  getPartnerById(id: number): Promise<Partner | undefined>;
  getAllPartners(): Promise<Partner[]>;
  updatePartnerStatus(id: number, status: string): Promise<Partner>;
  updatePartnerLanguage(id: number, language: string): Promise<void>;
  deletePartner(id: number): Promise<void>;

  createZoomAttendance(data: InsertZoomAttendance): Promise<ZoomAttendance>;
  getZoomAttendanceByEventId(eventId: number): Promise<ZoomAttendance[]>;

  createPersonalInvite(data: InsertPersonalInvite): Promise<PersonalInvite>;
  getPersonalInviteByCode(code: string): Promise<PersonalInvite | undefined>;
  updatePersonalInviteRegistration(id: number, data: { guestName: string; guestEmail: string; guestTelegram?: string; guestPhone?: string; reminderChannel?: string; guestLanguage?: string; preferredChannel?: string }): Promise<PersonalInvite>;
  updatePersonalInviteChatHistory(id: number, chatHistory: string): Promise<PersonalInvite>;
  updatePersonalInviteReminder(id: number, preference: string): Promise<PersonalInvite>;
  getPersonalInvitesByPartnerId(partnerId: number): Promise<PersonalInvite[]>;
  markPersonalInviteViewed(id: number): Promise<PersonalInvite>;
  getPersonalInvitesPendingReminder(): Promise<PersonalInvite[]>;
  getPersonalInvitesPendingAutoReminder(): Promise<PersonalInvite[]>;
  getPersonalInviteByGuestToken(token: string): Promise<PersonalInvite | undefined>;
  markPersonalInviteGoClicked(id: number): Promise<PersonalInvite>;
  updatePersonalInviteTelegram(id: number, telegramChatId: string): Promise<PersonalInvite>;
  markPersonalInviteReminderSent(id: number): Promise<PersonalInvite>;
  markPersonalInviteReminder24hSent(id: number): Promise<PersonalInvite>;
  getPersonalInvitesByScheduleEventId(scheduleEventId: number): Promise<PersonalInvite[]>;
  findInviteGuestByEmailAndEvent(email: string, inviteEventId: number): Promise<InviteGuest | undefined>;
  updateZoomAttendanceGuestId(attendanceId: number, inviteGuestId: number): Promise<void>;
  deleteZoomAttendanceByEventId(eventId: number): Promise<void>;

  getTutorials(activeOnly?: boolean, language?: string, category?: string, topicTag?: string): Promise<Tutorial[]>;
  getTutorial(id: number): Promise<Tutorial | undefined>;
  createTutorial(tutorial: InsertTutorial): Promise<Tutorial>;
  updateTutorial(id: number, tutorial: Partial<InsertTutorial>): Promise<Tutorial>;
  deleteTutorial(id: number): Promise<void>;

  createAmaQuestion(question: InsertAmaQuestion): Promise<AmaQuestion>;
  getAmaQuestions(): Promise<AmaQuestion[]>;
  updateAmaQuestionStatus(id: number, status: string): Promise<AmaQuestion>;

  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;

  createSofiaSession(data: InsertSofiaSession): Promise<SofiaSession>;
  getSofiaSession(sessionId: string): Promise<SofiaSession | undefined>;
  appendSofiaMessages(sessionId: string, messages: any[]): Promise<void>;
  appendSofiaPageVisit(sessionId: string, page: { path: string; at: number }): Promise<void>;
  updateSofiaSessionNotes(sessionId: string, notes: { userType?: string; finalPhase?: string; energyLevel?: string }): Promise<void>;
  endSofiaSession(sessionId: string, exitAction?: string): Promise<void>;
  getSofiaSessions(): Promise<SofiaSession[]>;

  appendSofiaDialog(entry: InsertSofiaDialog): Promise<SofiaDialog>;
  listSofiaDialog(visitorId: string, language?: string, limit?: number): Promise<SofiaDialog[]>;
  clearSofiaDialog(visitorId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db.insert(applications).values(insertApplication).returning();
    return application;
  }

  async getApplications(): Promise<Application[]> {
    return db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async createChatSession(session: { sessionId: string; language: string; type: string }): Promise<any> {
    const existing = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, session.sessionId));
    if (existing.length > 0) {
      await db.update(chatSessions).set({ updatedAt: new Date() }).where(eq(chatSessions.sessionId, session.sessionId));
      return existing[0];
    }
    const [created] = await db.insert(chatSessions).values(session).returning();
    return created;
  }

  async saveChatMessage(msg: { sessionId: string; role: string; content: string }): Promise<any> {
    const [message] = await db.insert(chatMessages).values(msg).returning();
    return message;
  }

  async getChatSessions(filters?: { type?: string; dateFrom?: string; dateTo?: string }): Promise<any[]> {
    const conditions = [];
    if (filters?.type) {
      conditions.push(eq(chatSessions.type, filters.type));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(chatSessions.createdAt, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      conditions.push(lte(chatSessions.createdAt, new Date(filters.dateTo)));
    }
    const query = db
      .select({
        id: chatSessions.id,
        sessionId: chatSessions.sessionId,
        language: chatSessions.language,
        type: chatSessions.type,
        createdAt: chatSessions.createdAt,
        updatedAt: chatSessions.updatedAt,
        messageCount: sql<number>`(SELECT COUNT(*) FROM chat_messages WHERE chat_messages.session_id = chat_sessions.session_id)`.as('messageCount'),
      })
      .from(chatSessions)
      .orderBy(desc(chatSessions.createdAt));
    if (conditions.length > 0) {
      return query.where(and(...conditions));
    }
    return query;
  }

  async getChatSessionMessages(sessionId: string): Promise<any[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.timestamp);
  }

  async getPromotions(activeOnly?: boolean, language?: string): Promise<any[]> {
    const conditions = [];
    if (activeOnly) {
      conditions.push(eq(promotions.isActive, true));
    }
    if (language) {
      conditions.push(eq(promotions.language, language));
    }
    if (conditions.length > 0) {
      return db.select().from(promotions).where(and(...conditions)).orderBy(promotions.sortOrder);
    }
    return db.select().from(promotions).orderBy(promotions.sortOrder);
  }

  async getPromotion(id: number): Promise<any | undefined> {
    const [promo] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promo;
  }

  async createPromotion(promo: any): Promise<any> {
    const [created] = await db.insert(promotions).values(promo).returning();
    return created;
  }

  async updatePromotion(id: number, promo: any): Promise<any> {
    const { id: _, createdAt, updatedAt, ...data } = promo;
    const [updated] = await db.update(promotions).set(data).where(eq(promotions.id, id)).returning();
    return updated;
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  async getScheduleEvents(activeOnly?: boolean): Promise<any[]> {
    const query = db
      .select({
        id: scheduleEvents.id,
        day: scheduleEvents.day,
        date: scheduleEvents.date,
        time: scheduleEvents.time,
        timezone: scheduleEvents.timezone,
        title: scheduleEvents.title,
        speaker: scheduleEvents.speaker,
        speakerId: scheduleEvents.speakerId,
        type: scheduleEvents.type,
        typeBadge: scheduleEvents.typeBadge,
        banner: scheduleEvents.banner,
        highlights: scheduleEvents.highlights,
        link: scheduleEvents.link,
        isActive: scheduleEvents.isActive,
        sortOrder: scheduleEvents.sortOrder,
        language: scheduleEvents.language,
        translationGroup: scheduleEvents.translationGroup,
        actionUrl: scheduleEvents.actionUrl,
        actionLabel: scheduleEvents.actionLabel,
        createdAt: scheduleEvents.createdAt,
        speakerPhoto: speakers.photo,
      })
      .from(scheduleEvents)
      .leftJoin(speakers, eq(scheduleEvents.speakerId, speakers.id))
      .orderBy(scheduleEvents.date, scheduleEvents.time);

    if (activeOnly) {
      return query.where(eq(scheduleEvents.isActive, true));
    }
    return query;
  }

  async getScheduleEvent(id: number): Promise<any | undefined> {
    const [event] = await db
      .select({
        id: scheduleEvents.id,
        day: scheduleEvents.day,
        date: scheduleEvents.date,
        time: scheduleEvents.time,
        timezone: scheduleEvents.timezone,
        title: scheduleEvents.title,
        speaker: scheduleEvents.speaker,
        speakerId: scheduleEvents.speakerId,
        type: scheduleEvents.type,
        typeBadge: scheduleEvents.typeBadge,
        banner: scheduleEvents.banner,
        highlights: scheduleEvents.highlights,
        link: scheduleEvents.link,
        isActive: scheduleEvents.isActive,
        sortOrder: scheduleEvents.sortOrder,
        language: scheduleEvents.language,
        translationGroup: scheduleEvents.translationGroup,
        actionUrl: scheduleEvents.actionUrl,
        actionLabel: scheduleEvents.actionLabel,
        createdAt: scheduleEvents.createdAt,
        speakerPhoto: speakers.photo,
      })
      .from(scheduleEvents)
      .leftJoin(speakers, eq(scheduleEvents.speakerId, speakers.id))
      .where(eq(scheduleEvents.id, id));
    return event;
  }

  async createScheduleEvent(event: any): Promise<any> {
    const [created] = await db.insert(scheduleEvents).values(event).returning();
    return created;
  }

  async updateScheduleEvent(id: number, event: any): Promise<any> {
    const { id: _, createdAt, updatedAt, ...data } = event;
    const [updated] = await db.update(scheduleEvents).set(data).where(eq(scheduleEvents.id, id)).returning();
    return updated;
  }

  async deleteScheduleEvent(id: number): Promise<void> {
    await db.delete(scheduleEvents).where(eq(scheduleEvents.id, id));
  }

  async createPromoApplication(application: InsertPromoApplication): Promise<PromoApplication> {
    const [created] = await db.insert(promoApplications).values(application).returning();
    return created;
  }

  async getPromoApplications(): Promise<PromoApplication[]> {
    return db.select().from(promoApplications).orderBy(desc(promoApplications.createdAt));
  }

  async updatePromoApplicationStatus(id: number, status: string): Promise<PromoApplication> {
    const [updated] = await db.update(promoApplications).set({ status }).where(eq(promoApplications.id, id)).returning();
    return updated;
  }

  async findDuplicatePromoApplication(email: string, cuNumber: string): Promise<PromoApplication | undefined> {
    // Step 1: Check ONLY by email whether this person's most recent record is no_money.
    // If it is, this new submission is a retry-after-topup — allow it regardless of CU matches
    // from other users who may share the same CU number in test data.
    const emailRecords = await db.select().from(promoApplications)
      .where(eq(promoApplications.email, email))
      .orderBy(desc(promoApplications.createdAt));

    const mostRecentByEmail = emailRecords[0];
    if (mostRecentByEmail && mostRecentByEmail.status === "no_money") {
      return undefined; // Retry after top-up — not a duplicate
    }

    // Step 2: Block as duplicate if any non-no_money record exists for this email OR CU.
    const [found] = await db.select().from(promoApplications)
      .where(and(
        or(eq(promoApplications.email, email), eq(promoApplications.cuNumber, cuNumber)),
        ne(promoApplications.status, "no_money")
      ))
      .limit(1);

    return found;
  }

  async findNoMoneyApplication(email: string, cuNumber: string): Promise<PromoApplication | undefined> {
    // Returns the most recent no_money record for this email/CU, used to detect retry-after-topup.
    // If the caller already confirmed no duplicate exists (i.e. no pending/verified record),
    // and this returns a result, the new submission is a legitimate retry.
    const [found] = await db.select().from(promoApplications)
      .where(and(
        or(eq(promoApplications.email, email), eq(promoApplications.cuNumber, cuNumber)),
        eq(promoApplications.status, "no_money")
      ))
      .orderBy(desc(promoApplications.createdAt))
      .limit(1);
    return found;
  }

  async getUnverifiedPromoApplicationByEmail(email: string, cuNumber?: string): Promise<PromoApplication | undefined> {
    const conditions = cuNumber
      ? and(eq(promoApplications.email, email), eq(promoApplications.cuNumber, cuNumber))
      : eq(promoApplications.email, email);
    const results = await db.select().from(promoApplications)
      .where(conditions!)
      .orderBy(desc(promoApplications.createdAt));
    return results.find(app => !app.verifiedAt && app.status !== 'duplicate' && app.status !== 'no_money');
  }

  async markPromoApplicationVerified(id: number): Promise<PromoApplication> {
    const [updated] = await db.update(promoApplications)
      .set({ status: 'approved', verifiedAt: new Date() })
      .where(eq(promoApplications.id, id))
      .returning();
    return updated;
  }

  async markPromoApplicationEmailSent(id: number): Promise<PromoApplication> {
    const [updated] = await db.update(promoApplications)
      .set({ emailSentAt: new Date() })
      .where(eq(promoApplications.id, id))
      .returning();
    return updated;
  }

  async markPromoApplicationNoMoney(id: number): Promise<PromoApplication> {
    const [updated] = await db.update(promoApplications)
      .set({ status: "no_money", noMoneyEmailSentAt: new Date() })
      .where(eq(promoApplications.id, id))
      .returning();
    return updated;
  }

  async getApplicationByEmailForNoMoney(email: string, cuNumber: string): Promise<PromoApplication | undefined> {
    const results = await db.select().from(promoApplications)
      .where(and(eq(promoApplications.email, email), eq(promoApplications.cuNumber, cuNumber)))
      .orderBy(desc(promoApplications.createdAt));
    return results.find(app => !app.noMoneyEmailSentAt && app.status !== "approved" && app.status !== "verified");
  }

  async getSpeakers(activeOnly?: boolean): Promise<any[]> {
    if (activeOnly) {
      return db.select().from(speakers).where(eq(speakers.isActive, true)).orderBy(speakers.name);
    }
    return db.select().from(speakers).orderBy(speakers.name);
  }

  async getSpeaker(id: number): Promise<any | undefined> {
    const [speaker] = await db.select().from(speakers).where(eq(speakers.id, id));
    return speaker;
  }

  async createSpeaker(speaker: any): Promise<any> {
    const [created] = await db.insert(speakers).values(speaker).returning();
    return created;
  }

  async updateSpeaker(id: number, speaker: any): Promise<any> {
    const { id: _, createdAt, updatedAt, ...data } = speaker;
    const [updated] = await db.update(speakers).set(data).where(eq(speakers.id, id)).returning();
    return updated;
  }

  async deleteSpeaker(id: number): Promise<void> {
    await db.delete(speakers).where(eq(speakers.id, id));
  }

  async getDennisPromos(activeOnly?: boolean, language?: string): Promise<DennisPromo[]> {
    const conditions = [];
    if (activeOnly) conditions.push(eq(dennisPromos.isActive, true));
    if (language) conditions.push(eq(dennisPromos.language, language));
    if (conditions.length > 0) {
      return db.select().from(dennisPromos).where(and(...conditions)).orderBy(dennisPromos.sortOrder);
    }
    return db.select().from(dennisPromos).orderBy(dennisPromos.sortOrder);
  }

  async getDennisPromo(id: number): Promise<DennisPromo | undefined> {
    const [promo] = await db.select().from(dennisPromos).where(eq(dennisPromos.id, id));
    return promo;
  }

  async createDennisPromo(promo: InsertDennisPromo): Promise<DennisPromo> {
    const [created] = await db.insert(dennisPromos).values(promo).returning();
    return created;
  }

  async updateDennisPromo(id: number, promo: Partial<InsertDennisPromo>): Promise<DennisPromo> {
    const [updated] = await db.update(dennisPromos).set(promo).where(eq(dennisPromos.id, id)).returning();
    return updated;
  }

  async deleteDennisPromo(id: number): Promise<void> {
    await db.delete(dennisPromos).where(eq(dennisPromos.id, id));
  }

  async createInviteEvent(data: InsertInviteEvent): Promise<InviteEvent> {
    const inviteCode = Math.random().toString(36).substring(2, 8);
    const [created] = await db.insert(inviteEvents).values({ ...data, inviteCode }).returning();
    return created;
  }

  async getInviteEventByCode(code: string): Promise<InviteEvent | undefined> {
    const [event] = await db.select().from(inviteEvents).where(eq(inviteEvents.inviteCode, code));
    return event;
  }

  async getInviteEventById(id: number): Promise<InviteEvent | undefined> {
    const [event] = await db.select().from(inviteEvents).where(eq(inviteEvents.id, id));
    return event;
  }

  async getAllInviteEvents(): Promise<(InviteEvent & { guestCount: number; clickedCount: number })[]> {
    const events = await db.select().from(inviteEvents).orderBy(desc(inviteEvents.createdAt));
    const results = [];
    for (const event of events) {
      const guests = await db.select().from(inviteGuests).where(eq(inviteGuests.inviteEventId, event.id));
      results.push({
        ...event,
        guestCount: guests.length,
        clickedCount: guests.filter(g => g.clickedZoom).length,
      });
    }
    return results;
  }

  async addInviteGuest(data: InsertInviteGuest): Promise<InviteGuest> {
    const token = crypto.randomUUID();
    const [created] = await db.insert(inviteGuests).values({ ...data, guestToken: token }).returning();
    return created;
  }

  async getInviteGuestByToken(token: string): Promise<InviteGuest | undefined> {
    const [guest] = await db.select().from(inviteGuests).where(eq(inviteGuests.guestToken, token));
    return guest;
  }

  async markGuestGoClicked(guestId: number): Promise<InviteGuest> {
    const [updated] = await db.update(inviteGuests)
      .set({ goClickedAt: new Date() })
      .where(eq(inviteGuests.id, guestId))
      .returning();
    return updated;
  }

  async getGuestsByEventId(eventId: number): Promise<InviteGuest[]> {
    return db.select().from(inviteGuests).where(eq(inviteGuests.inviteEventId, eventId)).orderBy(desc(inviteGuests.registeredAt));
  }

  async markGuestClickedZoom(guestId: number): Promise<InviteGuest> {
    const [updated] = await db.update(inviteGuests)
      .set({ clickedZoom: true, clickedAt: new Date() })
      .where(eq(inviteGuests.id, guestId))
      .returning();
    return updated;
  }

  async getInviteEventsByPartnerId(partnerId: number): Promise<(InviteEvent & { guestCount: number; clickedCount: number })[]> {
    const events = await db.select().from(inviteEvents)
      .where(eq(inviteEvents.partnerId, partnerId))
      .orderBy(desc(inviteEvents.createdAt));
    const results = [];
    for (const event of events) {
      const guests = await db.select().from(inviteGuests).where(eq(inviteGuests.inviteEventId, event.id));
      results.push({
        ...event,
        guestCount: guests.length,
        clickedCount: guests.filter(g => g.clickedZoom).length,
      });
    }
    return results;
  }

  async getInviteEventsByScheduleEventId(scheduleEventId: number): Promise<InviteEvent[]> {
    return db.select().from(inviteEvents)
      .where(eq(inviteEvents.scheduleEventId, scheduleEventId));
  }

  async createPartner(data: InsertPartner): Promise<Partner> {
    const [created] = await db.insert(partners).values(data).returning();
    return created;
  }

  async getPartnerByTelegramChatId(chatId: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.telegramChatId, chatId));
    return partner;
  }

  async getPartnerById(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async getAllPartners(): Promise<Partner[]> {
    return db.select().from(partners).orderBy(desc(partners.createdAt));
  }

  async updatePartnerStatus(id: number, status: string): Promise<Partner> {
    const [updated] = await db.update(partners).set({ status }).where(eq(partners.id, id)).returning();
    return updated;
  }

  async updatePartnerLanguage(id: number, language: string): Promise<void> {
    await db.update(partners).set({ language }).where(eq(partners.id, id));
  }

  async deletePartner(id: number): Promise<void> {
    await db.delete(personalInvites).where(eq(personalInvites.partnerId, id));
    await db.update(inviteEvents).set({ partnerId: null }).where(eq(inviteEvents.partnerId, id));
    await db.delete(partners).where(eq(partners.id, id));
  }

  async createZoomAttendance(data: InsertZoomAttendance): Promise<ZoomAttendance> {
    const [created] = await db.insert(zoomAttendance).values(data).returning();
    return created;
  }

  async getZoomAttendanceByEventId(eventId: number): Promise<ZoomAttendance[]> {
    return db.select().from(zoomAttendance).where(eq(zoomAttendance.inviteEventId, eventId));
  }

  async getPersonalInvitesByScheduleEventId(scheduleEventId: number): Promise<PersonalInvite[]> {
    return db.select().from(personalInvites)
      .where(eq(personalInvites.scheduleEventId, scheduleEventId));
  }

  async findInviteGuestByEmailAndEvent(email: string, inviteEventId: number): Promise<InviteGuest | undefined> {
    const [guest] = await db.select().from(inviteGuests)
      .where(and(
        eq(inviteGuests.inviteEventId, inviteEventId),
        sql`LOWER(${inviteGuests.email}) = LOWER(${email})`
      ));
    return guest;
  }

  async updateZoomAttendanceGuestId(attendanceId: number, inviteGuestId: number): Promise<void> {
    await db.update(zoomAttendance)
      .set({ inviteGuestId })
      .where(eq(zoomAttendance.id, attendanceId));
  }

  async deleteZoomAttendanceByEventId(eventId: number): Promise<void> {
    await db.delete(zoomAttendance).where(eq(zoomAttendance.inviteEventId, eventId));
  }

  async getSetting(key: string): Promise<string | null> {
    const [row] = await db.select().from(appSettings).where(eq(appSettings.key, key));
    return row ? row.value : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db
      .insert(appSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: appSettings.key, set: { value } });
  }

  async getZoomAttendanceCounts(): Promise<Record<number, number>> {
    const rows = await db.select({
      eventId: zoomAttendance.inviteEventId,
      cnt: count(),
    }).from(zoomAttendance).groupBy(zoomAttendance.inviteEventId);
    const result: Record<number, number> = {};
    for (const r of rows) {
      result[r.eventId] = r.cnt;
    }
    return result;
  }

  async createPersonalInvite(data: InsertPersonalInvite): Promise<PersonalInvite> {
    const inviteCode = "pi-" + Math.random().toString(36).substring(2, 10);
    const [created] = await db.insert(personalInvites).values({ ...data, inviteCode }).returning();
    return created;
  }

  async getPersonalInviteByCode(code: string): Promise<PersonalInvite | undefined> {
    const [invite] = await db.select().from(personalInvites).where(eq(personalInvites.inviteCode, code));
    return invite;
  }

  async updatePersonalInviteRegistration(id: number, data: { guestName: string; guestEmail: string; guestTelegram?: string; guestPhone?: string; reminderChannel?: string; guestLanguage?: string; preferredChannel?: string }): Promise<PersonalInvite> {
    const token = crypto.randomUUID();
    const [updated] = await db.update(personalInvites).set({
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestTelegram: data.guestTelegram || null,
      guestPhone: data.guestPhone || null,
      reminderChannel: data.reminderChannel || null,
      guestLanguage: data.guestLanguage || null,
      preferredChannel: data.preferredChannel || null,
      registeredAt: new Date(),
      guestToken: token,
    }).where(eq(personalInvites.id, id)).returning();
    return updated;
  }

  async updatePersonalInviteChatHistory(id: number, chatHistory: string): Promise<PersonalInvite> {
    const [updated] = await db.update(personalInvites).set({ chatHistory }).where(eq(personalInvites.id, id)).returning();
    return updated;
  }

  async updatePersonalInviteReminder(id: number, preference: string): Promise<PersonalInvite> {
    const [updated] = await db.update(personalInvites).set({ reminderPreference: preference }).where(eq(personalInvites.id, id)).returning();
    return updated;
  }

  async getPersonalInvitesByPartnerId(partnerId: number): Promise<PersonalInvite[]> {
    return db.select().from(personalInvites).where(eq(personalInvites.partnerId, partnerId)).orderBy(desc(personalInvites.createdAt));
  }

  async markPersonalInviteViewed(id: number): Promise<PersonalInvite> {
    const [updated] = await db.update(personalInvites).set({ viewedAt: new Date() }).where(eq(personalInvites.id, id)).returning();
    return updated;
  }

  async getPersonalInvitesPendingReminder(): Promise<PersonalInvite[]> {
    return db.select().from(personalInvites).where(
      and(
        isNotNull(personalInvites.registeredAt),
        isNotNull(personalInvites.reminderPreference),
        ne(personalInvites.reminderPreference, "none"),
        eq(personalInvites.reminderSent, false),
        eq(personalInvites.isActive, true),
      )
    );
  }

  async markPersonalInviteReminderSent(id: number): Promise<PersonalInvite> {
    const [updated] = await db.update(personalInvites).set({ reminderSent: true }).where(eq(personalInvites.id, id)).returning();
    return updated;
  }

  async getPersonalInviteByGuestToken(token: string): Promise<PersonalInvite | undefined> {
    const [invite] = await db.select().from(personalInvites).where(eq(personalInvites.guestToken, token));
    return invite;
  }

  async markPersonalInviteGoClicked(id: number): Promise<PersonalInvite> {
    const [updated] = await db.update(personalInvites)
      .set({ goClickedAt: new Date() })
      .where(eq(personalInvites.id, id))
      .returning();
    return updated;
  }

  async updatePersonalInviteTelegram(id: number, telegramChatId: string): Promise<PersonalInvite> {
    const [updated] = await db.update(personalInvites)
      .set({ telegramChatId, telegramNotificationsEnabled: true })
      .where(eq(personalInvites.id, id))
      .returning();
    return updated;
  }

  async getPersonalInvitesPendingAutoReminder(): Promise<PersonalInvite[]> {
    return db.select().from(personalInvites).where(
      and(
        isNotNull(personalInvites.registeredAt),
        eq(personalInvites.reminderSent, false),
        eq(personalInvites.isActive, true),
      )
    );
  }

  async markPersonalInviteReminder24hSent(id: number): Promise<PersonalInvite> {
    const [updated] = await db.update(personalInvites)
      .set({ reminder24hSent: true })
      .where(eq(personalInvites.id, id))
      .returning();
    return updated;
  }

  async getTutorials(activeOnly?: boolean, language?: string, category?: string, topicTag?: string): Promise<Tutorial[]> {
    const conditions = [];
    if (activeOnly) conditions.push(eq(tutorials.isActive, true));
    if (language) conditions.push(eq(tutorials.language, language));
    if (category) conditions.push(eq(tutorials.category, category));
    const results = conditions.length > 0
      ? await db.select().from(tutorials).where(and(...conditions)).orderBy(tutorials.sortOrder)
      : await db.select().from(tutorials).orderBy(tutorials.sortOrder);
    if (topicTag) {
      return results.filter(t => t.topicTags.includes(topicTag));
    }
    return results;
  }

  async getTutorial(id: number): Promise<Tutorial | undefined> {
    const [tutorial] = await db.select().from(tutorials).where(eq(tutorials.id, id));
    return tutorial;
  }

  async createTutorial(tutorial: InsertTutorial): Promise<Tutorial> {
    const [created] = await db.insert(tutorials).values(tutorial).returning();
    return created;
  }

  async updateTutorial(id: number, tutorial: Partial<InsertTutorial>): Promise<Tutorial> {
    const [updated] = await db.update(tutorials).set(tutorial).where(eq(tutorials.id, id)).returning();
    return updated;
  }

  async deleteTutorial(id: number): Promise<void> {
    await db.delete(tutorials).where(eq(tutorials.id, id));
  }

  async createAmaQuestion(question: InsertAmaQuestion): Promise<AmaQuestion> {
    const [created] = await db.insert(amaQuestions).values(question).returning();
    return created;
  }

  async getAmaQuestions(): Promise<AmaQuestion[]> {
    return db.select().from(amaQuestions).orderBy(desc(amaQuestions.createdAt));
  }

  async updateAmaQuestionStatus(id: number, status: string): Promise<AmaQuestion> {
    const [updated] = await db.update(amaQuestions).set({ status }).where(eq(amaQuestions.id, id)).returning();
    return updated;
  }

  async createSofiaSession(data: InsertSofiaSession): Promise<SofiaSession> {
    const existing = await db.select().from(sofiaSessions).where(eq(sofiaSessions.sessionId, data.sessionId));
    if (existing.length > 0) return existing[0];
    const [created] = await db.insert(sofiaSessions).values(data).returning();
    return created;
  }

  async getSofiaSession(sessionId: string): Promise<SofiaSession | undefined> {
    const [row] = await db.select().from(sofiaSessions).where(eq(sofiaSessions.sessionId, sessionId));
    return row;
  }

  async appendSofiaMessages(sessionId: string, messages: any[]): Promise<void> {
    if (!messages || messages.length === 0) return;
    const existing = await this.getSofiaSession(sessionId);
    if (!existing) return;
    const prev = Array.isArray(existing.messages) ? existing.messages as any[] : [];
    await db.update(sofiaSessions)
      .set({ messages: [...prev, ...messages] as any })
      .where(eq(sofiaSessions.sessionId, sessionId));
  }

  async appendSofiaPageVisit(sessionId: string, page: { path: string; at: number }): Promise<void> {
    const existing = await this.getSofiaSession(sessionId);
    if (!existing) return;
    const prev = Array.isArray(existing.pagesVisited) ? existing.pagesVisited as any[] : [];
    const last = prev[prev.length - 1];
    if (last && last.path === page.path) return;
    await db.update(sofiaSessions)
      .set({ pagesVisited: [...prev, page] as any })
      .where(eq(sofiaSessions.sessionId, sessionId));
  }

  async updateSofiaSessionNotes(sessionId: string, notes: { userType?: string; finalPhase?: string; energyLevel?: string }): Promise<void> {
    const patch: Record<string, any> = {};
    if (notes.userType !== undefined) patch.userType = notes.userType;
    if (notes.finalPhase !== undefined) patch.finalPhase = notes.finalPhase;
    if (notes.energyLevel !== undefined) patch.energyLevel = notes.energyLevel;
    if (Object.keys(patch).length === 0) return;
    await db.update(sofiaSessions).set(patch).where(eq(sofiaSessions.sessionId, sessionId));
  }

  async endSofiaSession(sessionId: string, exitAction?: string): Promise<void> {
    await db.update(sofiaSessions)
      .set({ endedAt: new Date(), ...(exitAction ? { exitAction } : {}) })
      .where(eq(sofiaSessions.sessionId, sessionId));
  }

  async getSofiaSessions(): Promise<SofiaSession[]> {
    return db.select().from(sofiaSessions).orderBy(desc(sofiaSessions.startedAt));
  }

  async appendSofiaDialog(entry: InsertSofiaDialog): Promise<SofiaDialog> {
    const [created] = await db.insert(sofiaDialog).values(entry).returning();
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await db.delete(sofiaDialog).where(
        and(eq(sofiaDialog.visitorId, entry.visitorId), lte(sofiaDialog.createdAt, cutoff))
      );
      const all = await db.select({ id: sofiaDialog.id })
        .from(sofiaDialog)
        .where(eq(sofiaDialog.visitorId, entry.visitorId))
        .orderBy(desc(sofiaDialog.id));
      if (all.length > 200) {
        const idsToDelete = all.slice(200).map((r) => r.id);
        for (const id of idsToDelete) {
          await db.delete(sofiaDialog).where(eq(sofiaDialog.id, id));
        }
      }
    } catch (e) {
      console.warn("[sofia-dialog] cleanup failed:", e);
    }
    return created;
  }

  async listSofiaDialog(visitorId: string, language?: string, limit: number = 200): Promise<SofiaDialog[]> {
    const where = language
      ? and(eq(sofiaDialog.visitorId, visitorId), eq(sofiaDialog.language, language))
      : eq(sofiaDialog.visitorId, visitorId);
    const rows = await db.select().from(sofiaDialog).where(where).orderBy(desc(sofiaDialog.id)).limit(limit);
    return rows.reverse();
  }

  async clearSofiaDialog(visitorId: string): Promise<void> {
    await db.delete(sofiaDialog).where(eq(sofiaDialog.visitorId, visitorId));
  }
}

export const storage = new DatabaseStorage();
