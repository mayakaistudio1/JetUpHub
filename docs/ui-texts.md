# Partner Mini App — All UI Texts (DE / EN / RU)

All texts extracted from `client/src/contexts/LanguageContext.tsx` and hardcoded strings in screen components. Keys follow the format used in the `t()` function.

---

## Partner App Shell & Auth (`pa.*` namespace)

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.dashboard` | Dashboard | Dashboard | Дашборд |
| `pa.meetings` | Meetings | Meetings | Встречи |
| `pa.statistics` | Statistik | Statistics | Статистика |
| `pa.ai` | KI | AI | ИИ |
| `pa.login.title` | JetUP Partner Hub | JetUP Partner Hub | JetUP Partner Hub |
| `pa.login.subtitle` | Melde dich mit deinem Telegram-Konto an, um auf die Partner App zuzugreifen. | Sign in with your Telegram account to access the Partner App. | Войдите через Telegram, чтобы получить доступ к Partner App. |
| `pa.login.openTelegram` | In Telegram öffnen | Open in Telegram | Открыть в Telegram |
| `pa.login.botHint` | Der Bot öffnet die Partner App direkt in Telegram mit automatischer Authentifizierung. | The bot will open the Partner App directly in Telegram with automatic authentication. | Бот откроет Partner App прямо в Telegram с автоматической авторизацией. |
| `pa.login.manualHint` | Bereits Zugang? Gib deine Telegram-ID ein: | Already have access? Enter your Telegram ID: | Уже есть доступ? Введите ваш Telegram ID: |
| `pa.logout` | Abmelden | Logout | Выйти |

### Registration

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.register.title` | Partner-Registrierung | Partner Registration | Регистрация партнёра |
| `pa.register.subtitle` | Fülle deine Daten aus, um ein Partnerkonto zu erstellen. | Fill in your details to create a partner account. | Заполните данные для создания партнёрского аккаунта. |
| `pa.register.name` | Vollständiger Name | Full Name | Полное имя |
| `pa.register.cu` | CU-Nummer | CU Number | Номер CU |
| `pa.register.phone` | Telefon (optional) | Phone (optional) | Телефон (необязательно) |
| `pa.register.email` | E-Mail (optional) | Email (optional) | E-Mail (необязательно) |
| `pa.register.submit` | Registrieren | Register | Зарегистрироваться |
| `pa.register.success` | Registrierung erfolgreich! | Registration successful! | Регистрация прошла успешно! |

---

## Dashboard Screen (`pa.*`)

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.welcomeBack` | Willkommen zurück | Welcome back | С возвращением |
| `pa.totalInvited` | Eingeladen gesamt | Total Invited | Всего приглашено |
| `pa.totalAttended` | Teilgenommen | Attended | Посетило |
| `pa.conversionRate` | Konversion | Conversion | Конверсия |
| `pa.totalEvents` | Events | Events | Событий |
| `pa.totalAttendees` | Teilnehmer gesamt | Total Attendees | Всего участников |
| `pa.attendanceRate` | Anwesenheitsrate | Attendance Rate | Показатель посещаемости |
| `pa.upcomingScheduled` | Nächste Termine | Upcoming Scheduled | Предстоящие |
| `pa.highEngagement` | Hohes Engagement | High engagement | Высокая вовлечённость |
| `pa.keepInviting` | Weiter einladen | Keep inviting | Продолжайте приглашать |
| `pa.noDataYet` | Noch keine Daten | No data yet | Данных пока нет |
| `pa.next7days` | Nächste 7 Tage | Next 7 days | Следующие 7 дней |
| `pa.seeAll` | Alle anzeigen | See all | Показать все |
| `pa.upcomingMeetings` | Bevorstehende Meetings | Upcoming Meetings | Предстоящие встречи |
| `pa.noMeetings` | Keine geplanten Meetings | No meetings scheduled | Встреч не запланировано |
| `pa.viewInvite` | Anzeigen & Einladen | View & Invite | Просмотр и приглашение |
| `pa.sent` | gesendet | sent | отправлено |
| `pa.registered` | registriert | registered | зарегистрировано |
| `pa.noEventsYet` | Noch keine Events | No events yet | Событий пока нет |
| `pa.createFirstInvite` | Erste Einladung erstellen | Create your first invite | Создать первое приглашение |
| `pa.getStarted` | Loslegen | Get Started | Начать |

---

## Webinars / Invite Flow Screen (`pa.*`)

### Invite Type Selection

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.inviteType` | Wie möchtest du einladen? | How would you like to invite? | Как хотите пригласить? |
| `pa.personalAI` | Persönliche KI-Einladung | Personal AI Invite | Персональное AI-приглашение |
| `pa.personalAIDesc` | KI erstellt eine personalisierte Chat-Einladung | AI creates a personalized chat invitation | ИИ создаёт персональное чат-приглашение |
| `pa.socialShare` | Social Invite | Social Invite | Социальное приглашение |
| `pa.socialShareDesc` | Teile über Messenger und soziale Netzwerke | Share via messengers and social networks | Поделитесь через мессенджеры и соцсети |
| `pa.back` | Zurück | Back | Назад |

### Social Share / Template Selection

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.chooseStyle` | Nachrichtenstil auswählen | Choose message style | Выберите стиль сообщения |
| `pa.chooseStyleDesc` | Wähle aus, wie deine Einladung aussehen soll | Select how your invitation will look | Выберите, как будет выглядеть ваше приглашение |
| `pa.personalInvite` | Persönliche Einladung | Personal Invite | Личное приглашение |
| `pa.socialShareTitle` | Social Share | Social Share | Социальный шеринг |
| `pa.yourLink` | Dein Einladungslink | Your invite link | Ваша ссылка для приглашения |
| `pa.messagePreview` | Nachrichtenvorschau | Message preview | Предпросмотр сообщения |
| `pa.sendVia` | Senden über | Send via | Отправить через |
| `pa.copyMessageLink` | Nachricht + Link kopieren | Copy message + link | Скопировать сообщение + ссылку |
| `pa.copied` | Kopiert! | Copied! | Скопировано! |
| `pa.allRegistrations` | Alle Registrierungen über diesen Link werden automatisch dir zugeordnet. | All registrations via this link are automatically attributed to you. | Все регистрации по этой ссылке автоматически засчитываются вам. |

### Social Share Message Templates (hardcoded in WebinarsScreen.tsx, lines 39–61)

Three templates, all hardcoded in German regardless of UI language. Labels are English identifiers.

**Professional** (id: `professional`, icon: `💼`, label: `Professional`)
```
Ich möchte Sie herzlich zu unserem exklusiven Webinar einladen:

📌 {title}
📅 {date} um {time}
🎤 Speaker: {speaker}

Melden Sie sich jetzt an:
{url}
```

**Friendly** (id: `friendly`, icon: `😊`, label: `Friendly`)
```
Hey! Ich habe ein spannendes Webinar für dich:

🎯 {title}
📅 {date}, {time}
🎤 Mit {speaker}

Schau mal rein, es lohnt sich! 👇
{url}
```

**Short** (id: `short`, icon: `⚡`, label: `Short & Direct`)
```
{title} — {date}, {time}.
Jetzt anmelden: {url}
```

> **Note:** All template text is hardcoded in German regardless of the partner's selected UI language.

### Personal AI Invite — Form

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.partnerName` | Dein Name (als Partner) | Your name (as partner) | Ваше имя (как партнёра) |
| `pa.partnerNamePlaceholder` | Name für den Interessenten | Name for the prospect | Имя для контакта |
| `pa.prospectName` | Name des Interessenten | Prospect name | Имя контакта |
| `pa.prospectNamePlaceholder` | Wie heißt die Person? | What is this person's name? | Как зовут этого человека? |
| `pa.startAI` | KI-Qualifizierung starten | Start AI Qualification | Запустить AI-квалификацию |
| `pa.skip` | Überspringen | Skip | Пропустить |
| `pa.continue` | Weiter | Continue | Продолжить |
| `pa.selected` | ausgewählt | selected | выбрано |
| `pa.generating` | Generiere... | Generating... | Генерирую... |

**"AI Invite Builder" header** (hardcoded, not in i18n):
- Title: `AI Invite Builder` (always English)
- Subtitle: prospect name

**Context input placeholder** (hardcoded):
- `z.B. baut Teams, liebt Crypto...` (always German)

**Submit/Skip button** (inline logic in WebinarsScreen.tsx):
- DE: `Senden` / `Überspringen`
- RU: `Отправить` / (skip label)
- EN: `Send` / (skip label)

### Personal Preview Screen

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.quickRepliesFor` | Schnellantworten für | Quick Replies for | Быстрые ответы для |
| `pa.regenerate` | Neu generieren | Regenerate | Перегенерировать |
| `pa.confirm` | Bestätigen | Confirm | Подтвердить |
| `pa.message` | Nachricht | Message | Сообщение |
| `pa.edit` | Bearbeiten | Edit | Редактировать |
| `pa.save` | Speichern | Save | Сохранить |
| `pa.aiWillUseMessages` | KI wird diese Nachrichten verwenden, wenn | AI will use these messages when | ИИ будет использовать эти сообщения, когда |
| `pa.opensLink` | den Link öffnet. | opens the link. | открывает ссылку. |

**Strategy labels** (inline in WebinarsScreen.tsx):

| Strategy | DE | EN | RU |
|----------|----|----|-----|
| Authority | Authority — für Leader | Authority — for Leaders | Authority — для лидеров |
| Opportunity | Opportunity — für Investoren | Opportunity — for Investors | Opportunity — для инвесторов |
| Curiosity | Curiosity — für Neugierige | Curiosity — for the Curious | Curiosity — для любопытных |
| Support | Support — für Einsteiger | Support — for Beginners | Support — для начинающих |

**DISC labels** (inline in WebinarsScreen.tsx):

| DISC | DE | EN | RU |
|------|----|----|----|
| D | D — Dominanz | D — Dominance | D — Доминирование |
| I | I — Einfluss | I — Influence | I — Влияние |
| S | S — Stabilität | S — Steadiness | S — Стабильность |
| C | C — Gewissenhaftigkeit | C — Conscientiousness | C — Добросовестность |

### Personal Share Screen

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.inviteCreated` | Persönliche Einladung erstellt | Personal Invite Created | Личное приглашение создано |
| `pa.aiWillInvite` | KI wird persönlich einladen | AI will personally invite | ИИ лично пригласит |
| `pa.personalLink` | Dein persönlicher Einladungslink | Your personal invite link | Ваша персональная ссылка |
| `pa.shareLink` | Link teilen | Share Link | Поделиться ссылкой |

**Personal share text** (hardcoded, always English):
```
Hey {prospectName}! I have a special invitation for you — check it out:
{personalInviteUrl}
```

### Invite Preview Screen

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.preview.title` | Vorschau: Was der Gast sieht | Preview: What the guest will see | Предпросмотр: что увидит гость |
| `pa.preview.chatPreview` | Wie der Chat aussehen wird | How the chat will look | Как будет выглядеть чат |
| `pa.preview.eventDetails` | Webinar-Informationen | Webinar information | Информация о вебинаре |

---

## Qualification Questions (AI Qualification Flow)

Three language variants defined in `client/src/pages/partner-app/WebinarsScreen.tsx` (arrays `qualifyQuestionsEn`, `qualifyQuestionsDe`, `qualifyQuestionsRu`, lines 71–180). All questions use `multiSelect: true` except Step 4 which is free-text.

The server also exposes a German-only version at `GET /api/partner-app/ai-qualify/questions` (from `QUALIFICATION_QUESTIONS` constant in `server/partner-app-routes.ts`, lines 232–275).

### Step 1 — Relationship

**AI text:**

| Language | Text |
|----------|------|
| DE | `Um eine starke persönliche Einladung zu erstellen, muss ich die Person ein wenig verstehen.\n\nWer ist diese Person für dich? (du kannst mehrere auswählen)` |
| EN | `To create a strong personal invitation, I need to understand this person a bit.\n\nWho is this person to you? (you can select multiple)` |
| RU | `Чтобы создать сильное персональное приглашение, мне нужно немного понять этого человека.\n\nКто этот человек для вас? (можно выбрать несколько)` |

**Options:**

| Value | DE Label | EN Label | RU Label |
|-------|----------|----------|----------|
| `friend` | Freund / warmer Kontakt | Friend / warm contact | Друг / тёплый контакт |
| `business_contact` | Geschäftskontakt | Business contact | Деловой контакт |
| `mlm_leader` | MLM Leader | MLM Leader | MLM Лидер |
| `investor` | Investor-Typ | Investor type | Инвестор |
| `entrepreneur` | Unternehmer | Entrepreneur | Предприниматель |
| `cold_contact` | Kalter Kontakt | Cold contact | Холодный контакт |

### Step 2 — Motivation

**AI text:**

| Language | Text |
|----------|------|
| DE | `Gut! Und was motiviert diese Person normalerweise am meisten? (du kannst mehrere auswählen)` |
| EN | `Great! What motivates this person the most? (you can select multiple)` |
| RU | `Отлично! Что больше всего мотивирует этого человека? (можно выбрать несколько)` |

**Options:**

| Value | DE Label | EN Label | RU Label |
|-------|----------|----------|----------|
| `money_results` | Geld / Ergebnisse | Money / Results | Деньги / Результаты |
| `business_growth` | Business-Wachstum | Business growth | Рост бизнеса |
| `technology_innovation` | Technologie / Innovation | Technology / Innovation | Технологии / Инновации |
| `community_people` | Community / Menschen | Community / People | Сообщество / Люди |
| `learning_curiosity` | Lernen / Neugier | Learning / Curiosity | Обучение / Любопытство |

### Step 3 — Reaction Style

**AI text:**

| Language | Text |
|----------|------|
| DE | `Verstanden! Wie reagiert die Person normalerweise auf neue Möglichkeiten? (du kannst mehrere auswählen)` |
| EN | `Got it! How does this person usually react to new opportunities? (you can select multiple)` |
| RU | `Понял! Как этот человек обычно реагирует на новые возможности? (можно выбрать несколько)` |

**Options:**

| Value | DE Label | EN Label | RU Label |
|-------|----------|----------|----------|
| `fast_decision` | Schnelle Entscheidung | Quick decision | Быстрое решение |
| `analytical` | Analytisch / viele Fragen | Analytical / many questions | Аналитик / много вопросов |
| `skeptical` | Skeptisch | Skeptical | Скептик |
| `needs_trust` | Braucht erst Vertrauen | Needs trust first | Сначала нужно доверие |

### Step 4 — Free-text Context (optional, `multiSelect: false`, no options)

**AI text:**

| Language | Text |
|----------|------|
| DE | `Fast fertig! Gibt es noch etwas Wichtiges über die Person, das ich wissen sollte? (optional)` |
| EN | `Almost done! Is there anything else important about this person I should know? (optional)` |
| RU | `Почти готово! Есть ли что-то ещё важное об этом человеке, что мне стоит знать? (необязательно)` |

*(Free-text input, no predefined options)*

---

## Reports / Statistics Screen (`pa.*`)

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pa.yourEvents` | Deine Events | Your Events | Твои события |
| `pa.noEvents` | Noch keine Events mit deinen Einladungen. | No events with your invitations yet. | Событий с твоими приглашениями пока нет. |
| `pa.viewReport` | Bericht | Report | Отчёт |
| `pa.invites` | Einladungen | Invites | Приглашения |
| `pa.guests` | Gäste | Guests | Гости |
| `pa.attended` | Teilgenommen | Attended | Посетили |
| `pa.funnel` | Funnel | Funnel | Воронка |
| `pa.invited` | Eingeladen | Invited | Приглашено |
| `pa.clickedZoom` | Zoom-Link geklickt | Clicked Zoom | Нажали Zoom |
| `pa.guestList` | Gästeliste | Guest List | Список гостей |
| `pa.noGuests` | Noch keine Gäste registriert | No guests registered yet | Гостей пока нет |
| `pa.viewed` | Gesehen | Viewed | Просмотрено |
| `pa.personalInvitesSent` | Gesendete KI-Einladungen | Sent AI Invitations | Отправленных AI-приглашений |
| `pa.personalInvites` | KI-Einladungen | AI Invites | AI-приглашения |
| `pa.personalInviteStats` | KI-Einladungen Funnel | AI Invites Funnel | Воронка AI-приглашений |
| `pa.noPersonalInvites` | Noch keine KI-Einladungen | No AI invites yet | AI-приглашений пока нет |
| `pa.pastEvents` | Vergangene Events | Past Events | Прошедшие события |
| `pa.conversionFunnel` | Konversionsfunnel | Conversion Funnel | Воронка конверсии |
| `pa.conversionRateLabel` | Konversionsrate | Conversion rate | Коэффициент конверсии |
| `pa.clicked` | Geklickt | Clicked | Нажали |
| `pa.noShow` | Nicht erschienen | No show | Не пришли |
| `pa.questionsAsked` | Fragen gestellt | Questions asked | Задали вопросов |
| `pa.noQuestions` | Keine Fragen gestellt | No questions asked | Вопросов не задавали |

**Hardcoded German strings in ReportsScreen.tsx** (not in i18n):
- Zoom sync success: `✅ {N} Teilnehmer synchronisiert` (varies)
- Zoom sync error messages (German inline)

---

## AI Assistant Screen (hardcoded English in component)

These strings are hardcoded in `AIAssistantScreen.tsx` (lines 7–67) and are **not** in LanguageContext:

| Element | Exact text |
|---------|-----------|
| Screen title | `AI Follow-up Assistant` |
| Subtitle | `Your recruiting helper` |
| Input placeholder | `Ask the AI assistant...` |
| Thinking indicator | `Thinking...` |
| Error fallback message | `Sorry, an error occurred. Please try again.` |
| Empty state greeting | `Hi {partnerFirstName}! I'm your AI assistant for recruiting and follow-up. Choose an action or write me directly.` |

**Quick Action Chips** (6 items, labels and sent prompts):

| id | Label | Prompt sent to AI |
|----|-------|------------------|
| `followup-attended` | `Follow-up: Attendee` | `Write a follow-up message for a guest who attended the webinar and stayed the full time.` |
| `followup-noshow` | `Follow-up: No-Show` | `Write a friendly message to a guest who registered but did not attend the webinar.` |
| `invite-next` | `Invite to next event` | `Write an invitation to the next webinar for a contact who attended a previous one.` |
| `book-call` | `Suggest a call` | `Write a message to schedule a personal call with an interested contact.` |
| `send-info` | `Send materials` | `Write a message to send information materials about JetUP to a prospect.` |
| `qualify` | `Qualify interest` | `Give me 3 questions to assess a contact's interest in the JetUP partnership.` |

---

## Quick Replies — DISC-based (all 3 languages)

**File:** `server/partner-app-routes.ts`, lines 69–101

### Pre-registration Quick Replies

| DISC | DE | EN | RU |
|------|----|----|-----|
| D | Ja, interessiert · Zur Sache · Registriere mich | Yes, interested · Get to the point · Register me | Да, интересно · К делу · Зарегистрируй меня |
| I | Klingt spannend! · Erzähl mir mehr · Ja, ich will! | Sounds exciting! · Tell me more · Yes, I want in! | Звучит круто! · Расскажи ещё · Да, хочу! |
| S | Kannst du mehr erzählen? · Vielleicht · Ja, registriere mich | Can you tell me more? · Maybe · Yes, register me | Расскажи подробнее? · Может быть · Да, зарегистрируй |
| C | Was genau wird gezeigt? · Zeig mir Details · Ja, registriere mich | What exactly will be shown? · Show me details · Yes, register me | Что именно покажут? · Покажи детали · Да, зарегистрируй |
| default | Ja, registriere mich · Erzähl mir mehr · Bin mir unsicher | Yes, register me · Tell me more · Not sure yet | Да, зарегистрируй · Расскажи ещё · Пока не уверен |

### Post-registration Reminder Quick Replies

| Language | Option 1 | Option 2 | Option 3 |
|----------|----------|----------|----------|
| DE | Erinnerung 1 Stunde vorher | Erinnerung 15 Min. vorher | Keine Erinnerung nötig |
| EN | Remind me 1 hour before | Remind me 15 min before | No reminder needed |
| RU | Напомни за 1 час | Напомни за 15 минут | Напоминание не нужно |

---

## Personal Invite Page (`pi.*` namespace — guest-facing)

| Key | DE | EN | RU |
|-----|----|----|-----|
| `pi.personalInvitation` | Persönliche Einladung | Personal Invitation | Личное приглашение |
| `pi.invitedYou` | hat dich eingeladen | invited you | пригласил(а) вас |
| `pi.speaker` | Referent | Speaker | Спикер |
| `pi.date` | Datum | Date | Дата |
| `pi.time` | Uhrzeit | Time | Время |
| `pi.openInvitation` | Einladung öffnen | Open Invitation | Открыть приглашение |
| `pi.poweredBy` | Powered by JetUP | Powered by JetUP | Powered by JetUP |
| `pi.from` | von | from | от |
| `pi.preparing` | Ihre Einladung wird vorbereitet... | Preparing your invitation... | Подготовка приглашения... |
| `pi.typing` | Schreibt... | Typing... | Печатает... |
| `pi.loading` | Einladung wird geladen... | Loading invitation... | Загрузка приглашения... |
| `pi.notFound` | Einladung nicht gefunden | Invitation Not Found | Приглашение не найдено |
| `pi.notFoundDesc` | Dieser Einladungslink ist nicht mehr verfügbar. | This invitation link is no longer available. | Эта ссылка приглашения больше недоступна. |
| `pi.quickReg` | Schnelle Registrierung | Quick Registration | Быстрая регистрация |
| `pi.yourName` | Ihr Name | Your name | Ваше имя |
| `pi.yourEmail` | Ihre E-Mail | Your email | Ваш email |
| `pi.telegramOptional` | Telegram @username (optional) | Telegram @username (optional) | Telegram @username (необязательно) |
| `pi.reminderChannel` | Erinnerungskanal | Reminder channel | Канал напоминания |
| `pi.whatsapp` | WhatsApp | WhatsApp | WhatsApp |
| `pi.telegram` | Telegram | Telegram | Telegram |
| `pi.phoneNumber` | Telefonnummer | Phone number | Номер телефона |
| `pi.telegramUsername` | @username in Telegram | @username in Telegram | @username в Telegram |
| `pi.eventInfo` | Über die Veranstaltung | About the event | О мероприятии |
| `pi.confirmReg` | Registrierung bestätigen | Confirm Registration | Подтвердить регистрацию |
| `pi.typeMessage` | Nachricht eingeben... | Type a message... | Введите сообщение... |

---

## Registration Success & Reminder Messages (server-side, hardcoded)

**File:** `server/partner-app-routes.ts`, lines 1140–1148

### Registration Success Message

| Language | Text |
|----------|------|
| EN | `Great news, {name}! You're now registered for the webinar! 🎉 Would you like me to set a reminder for you?` |
| DE | `Tolle Neuigkeiten, {name}! Sie sind jetzt für das Webinar registriert! 🎉 Möchten Sie eine Erinnerung einrichten?` |
| RU | `Отличные новости, {name}! Вы зарегистрированы на вебинар! 🎉 Хотите, чтобы я напомнил вам?` |

### Reminder Confirmation Messages

**File:** `server/partner-app-routes.ts`, lines 1244–1248

| Language | 1_hour | 15_min | none |
|----------|--------|--------|------|
| EN | `Perfect! I'll remind you 1 hour before. See you at the webinar! 🙌` | `Perfect! I'll remind you 15 minutes before. See you at the webinar! 🙌` | `No problem! See you at the webinar! 🙌` |
| DE | `Perfekt! Ich erinnere Sie 1 Stunde vorher. Bis zum Webinar! 🙌` | `Perfekt! Ich erinnere Sie 15 Minuten vorher. Bis zum Webinar! 🙌` | `Kein Problem! Bis zum Webinar! 🙌` |
| RU | `Отлично! Напомню за 1 час до начала. До встречи на вебинаре! 🙌` | `Отлично! Напомню за 15 минут до начала. До встречи на вебинаре! 🙌` | `Хорошо! До встречи на вебинаре! 🙌` |

---

## Telegram Bot Messages (German only)

**File:** `server/integrations/partner-bot.ts`

All Telegram bot messages are hardcoded in German.

### /start — Existing partner

```
🤖 Hallo, {name}!

Die Partner App ist dein Workspace zum Einladen und Nachverfolgen:
• Webinare mit deinen Einladungslinks
• Registrierungen und Teilnahme verfolgen
• KI-Follow-up-Assistent nach Events

📊 Aktuelle Statistik:
Eingeladen: {invited} | Registriert: {registered}

```
[Button: 📱 Partner App öffnen]

### /start — New user

```
👋 Willkommen beim JetUP Partner Bot!

Registriere dich jetzt als Partner, um Zugang zu deiner persönlichen Partner App zu erhalten.

Sende deinen vollständigen Namen um zu starten:
```

### /help

```
📖 JetUP Partner Bot — Hilfe

Alle Funktionen findest du in der Partner App:

📊 Dashboard & Statistiken
📅 Webinare & Einladungslinks
🤖 KI-personalisierte Einladungen
💬 KI Follow-up Assistent
📈 Vergütungsübersicht

Befehle:
/start — Partner App öffnen
/help — Diese Hilfe anzeigen
```

### Partner notification — new social invite registration

```
🎟 Neue Registrierung!

📋 Event: {event.title}
👤 Gast: {guest.name}
📧 E-Mail: {guest.email}
📱 Tel: {guest.phone}   (if available)
⏰ {timestamp DE}
```

### Partner notification — new personal invite registration

```
🎯 Neue Registrierung (persönliche Einladung)!

📋 Event: {eventTitle}
👤 Gast: {guestName}
📧 E-Mail: {guestEmail}
📱 Tel: {guestPhone}   (if available)
🔗 Einladungscode: {inviteCode}
⏰ {timestamp DE}
```

### Inline bot — unknown command (registered partner)

```
Öffne die Partner App für alle Funktionen:
```
[Button: 📱 Partner App öffnen]

### Inline bot — unknown command (unregistered)

```
Willkommen! Sende /start um dich als Partner zu registrieren.
```

### Exit follow-up mode

```
✅ Follow-up-Modus beendet.
```
