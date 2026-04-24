# JetUP Partner System — Полная Архитектура

## 📋 Содержание
1. [Общий обзор](#общий-обзор)
2. [Структура базы данных](#структура-базы-данных)
3. [Компоненты системы](#компоненты-системы)
4. [Flow от начала до конца](#flow-от-начала-до-конца)
5. [Персональные AI-приглашения (DISC)](#персональные-ai-приглашения-disc)
6. [Автоматические уведомления партнеру](#автоматические-уведомления-партнеру)
7. [Визуальные примеры интерфейсов](#визуальные-примеры-интерфейсов)
8. [Интеграция с Zoom](#интеграция-с-zoom)
9. [Админка — что означают разделы](#админка)
10. [API Endpoints](#api-endpoints)
11. [Что работает и что НЕ работает](#что-работает-и-что-не-работает)

---

## 🎯 Общий обзор

**JetUP Partner System** — это экосистема для партнеров (брокеров), которая позволяет:
- Создавать персонализированные приглашения на вебинары
- Отслеживать регистрации гостей
- Анализировать посещаемость через интеграцию с Zoom
- Получать real-time уведомления в Telegram
- Использовать AI для квалификации лидов и follow-up

### Основные каналы взаимодействия:
1. **Telegram Mini App** — основной интерфейс для партнера (`@Jetup_partner_test_bot` dev, `@JetUP_Partner_Bot` prod)
2. **Telegram Bot** — уведомления и быстрые команды
3. **Web приложение** — доступ через браузер
4. **Zoom** — платформа для проведения вебинаров

---

## 🗄️ Структура базы данных

### Ключевые таблицы и их взаимосвязи

```
┌─────────────────┐
│    partners     │  ← Корневая таблица: партнеры системы
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│ invite_events   │  ← События (инвайты) созданные партнером
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐      ┌──────────────────┐
│ invite_guests   │◄─────│ zoom_attendance  │
└─────────────────┘  1:1 └──────────────────┘
   (Регистрации)        (Данные посещаемости)
```

### 1. `partners` — Партнеры
```sql
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  telegram_chat_id TEXT UNIQUE NOT NULL,  -- Идентификатор в Telegram
  telegram_username TEXT,
  name TEXT NOT NULL,                     -- Имя партнера
  cu_number TEXT NOT NULL,                -- CU номер (внутренний ID)
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Что это:** Таблица всех зарегистрированных партнеров (брокеров).

**Зачем нужно:** 
- Идентификация партнера в системе
- Привязка всех инвайтов и гостей к конкретному партнеру
- Отправка персональных уведомлений в Telegram

### 2. `invite_events` — События/Инвайты
```sql
CREATE TABLE invite_events (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER,                     -- Ссылка на партнера
  schedule_event_id INTEGER,              -- Ссылка на вебинар из расписания
  partner_name TEXT NOT NULL,
  partner_cu TEXT NOT NULL,
  zoom_link TEXT NOT NULL,                -- Ссылка на Zoom встречу
  title TEXT NOT NULL,                    -- Название вебинара
  event_date TEXT NOT NULL,               -- Дата (2026-03-20)
  event_time TEXT NOT NULL,               -- Время (19:00)
  invite_code TEXT UNIQUE NOT NULL,       -- Уникальный код (abc123)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Что это:** Конкретная инстанция инвайта, созданная партнером для определенного вебинара.

**Зачем нужно:**
- Генерация уникальной ссылки `/invite/abc123`
- Привязка регистраций к конкретному партнеру
- Отслеживание откуда пришел гость

**Пример:** Партнер "Денис" создает инвайт на вебинар "Трейдинг стратегии" → система генерирует код `d8k3j2` → ссылка `https://jet-up.ai/invite/d8k3j2`

### 3. `invite_guests` — Зарегистрированные гости
```sql
CREATE TABLE invite_guests (
  id SERIAL PRIMARY KEY,
  invite_event_id INTEGER NOT NULL,       -- К какому инвайту относится
  name TEXT NOT NULL,                     -- Имя гостя
  email TEXT NOT NULL,                    -- Email гостя
  phone TEXT,
  registered_at TIMESTAMP DEFAULT NOW(),  -- Когда зарегистрировался
  clicked_zoom BOOLEAN DEFAULT false,     -- Кликнул ли на "Присоединиться к Zoom"
  clicked_at TIMESTAMP                    -- Когда кликнул
);
```

**Что это:** Список людей, которые зарегистрировались через ссылку партнера.

**Зачем нужно:**
- Отслеживание конверсии (клик → регистрация)
- Уведомление партнера о новых регистрациях
- База для сопоставления с Zoom attendance

### 4. `zoom_attendance` — Данные посещаемости из Zoom
```sql
CREATE TABLE zoom_attendance (
  id SERIAL PRIMARY KEY,
  invite_guest_id INTEGER,                -- Связь с гостем (может быть NULL!)
  invite_event_id INTEGER NOT NULL,       -- К какому событию относится
  participant_email TEXT NOT NULL,        -- Email из Zoom
  participant_name TEXT,                  -- Имя из Zoom
  join_time TIMESTAMP,                    -- Время входа
  leave_time TIMESTAMP,                   -- Время выхода
  duration_minutes INTEGER DEFAULT 0,     -- Сколько минут был на встрече
  questions_asked INTEGER DEFAULT 0,      -- Сколько вопросов задал
  question_texts TEXT[],                  -- Тексты вопросов
  fetched_at TIMESTAMP DEFAULT NOW()
);
```

**Что это:** Реальные данные о том, кто был на вебинаре (получены из Zoom API).

**Зачем нужно:**
- Точная посещаемость (не просто "кликнул на Zoom", а "был на встрече")
- Аналитика engagement (сколько минут был, задавал ли вопросы)
- Основа для AI follow-up (персонализированные сообщения)

**Важно:** `invite_guest_id` может быть `NULL` — это "walk-in" участники, которые пришли на вебинар, но НЕ регистрировались через ссылку партнера (например, были приглашены организатором напрямую).

### 5. `personal_invites` — Персональные AI-инвайты
```sql
CREATE TABLE personal_invites (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL,
  schedule_event_id INTEGER NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  prospect_name TEXT NOT NULL,            -- Имя потенциального гостя
  prospect_type TEXT DEFAULT 'Neutral',   -- Тип отношений
  disc_type TEXT,                         -- DISC профиль (D/I/S/C)
  motivation_type TEXT,                   -- Тип мотивации
  invite_strategy TEXT,                   -- Стратегия приглашения
  generated_messages TEXT DEFAULT '[]',   -- Сгенерированные AI сообщения
  guest_name TEXT,                        -- Фактическое имя после регистрации
  guest_email TEXT,
  guest_telegram TEXT,
  guest_phone TEXT,
  reminder_channel TEXT,                  -- Канал для напоминаний
  registered_at TIMESTAMP,
  reminder_preference TEXT,
  guest_language TEXT,
  chat_history TEXT DEFAULT '[]',         -- История чата с AI
  viewed_at TIMESTAMP,                    -- Когда проспект открыл ссылку
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Что это:** Расширенная версия инвайта с AI-квалификацией лида.

**Зачем нужно:**
- Персонализированные приглашения на основе DISC-профиля
- AI-чат для вовлечения проспекта
- Отслеживание engagement до регистрации

---

## 🧩 Компоненты системы

### 1. Telegram Mini App (Frontend)
**Файлы:** `client/src/pages/partner-app/`

**Экраны:**
- `DashboardScreen.tsx` — главный экран с статистикой
- `WebinarsScreen.tsx` — список вебинаров для создания инвайтов
- `ReportsScreen.tsx` — статистика по событиям и гостям

**Вход:**
- Автоматическая авторизация через Telegram WebApp SDK
- Получение `telegramId` из `window.Telegram.WebApp.initDataUnsafe`

### 2. Telegram Bot (Backend)
**Файл:** `server/integrations/partner-bot.ts`

**Команды:**
- `/start` — открывает Mini App
- `/invite` — открывает раздел вебинаров
- `/events` — список событий
- `/report` — детальный отчет по событию
- `/followup` — AI-ассистент для follow-up сообщений

**Уведомления:**
```javascript
// При регистрации гостя
await bot.sendMessage(partner.telegramChatId, 
  `🎉 Новая регистрация!\n${guestName} зарегистрировался на ${eventTitle}`
);
```

### 3. Backend API
**Файл:** `server/partner-app-routes.ts`

**Основные endpoints:**
- `GET /api/partner-app/webinars` — список доступных вебинаров
- `POST /api/partner-app/create-invite` — создание инвайта
- `GET /api/partner-app/events` — события партнера (группировка по вебинарам)
- `GET /api/partner-app/events/:id/report` — детальный отчет

### 4. Zoom Integration
**Файл:** `server/integrations/zoom-api.ts`

**Функции:**
- `fetchZoomMeetingParticipants()` — получение списка участников
- `fetchZoomMeetingQA()` — получение вопросов из Q&A
- `syncZoomDataForEvent()` — синхронизация данных

---

## 🔄 Flow от начала до конца

### Flow 1: Регистрация партнера

```
1. Партнер открывает Telegram → находит @Jetup_partner_test_bot
                                        ↓
2. Нажимает /start → бот отправляет кнопку "Открыть Partner App"
                                        ↓
3. Открывается Mini App → проверка telegramId в БД
                                        ↓
4. НЕ НАЙДЕН → показывается экран регистрации
                                        ↓
5. Партнер вводит: Имя, CU-номер, телефон, email
                                        ↓
6. POST /api/partner-app/register → создается запись в partners
                                        ↓
7. Партнер получает доступ к Dashboard
```

**Код регистрации:**
```typescript
// client/src/pages/partner-app/RegistrationScreen.tsx
const handleRegister = async () => {
  await fetch('/api/partner-app/register', {
    method: 'POST',
    headers: { 'x-telegram-id': telegramId },
    body: JSON.stringify({ name, cuNumber, phone, email })
  });
};
```

### Flow 2: Создание инвайта (Social Share)

```
1. Партнер открывает раздел "Вебинары"
                    ↓
2. Выбирает вебинар "Трейдинг стратегии 20.03 19:00"
                    ↓
3. Нажимает "Создать приглашение"
                    ↓
4. Выбирает стиль сообщения (Профессиональное/Дружеское/Короткое)
                    ↓
5. POST /api/partner-app/create-invite
   {
     scheduleEventId: 5
   }
                    ↓
6. Backend:
   - Создает запись в invite_events
   - Генерирует уникальный invite_code (например, "x8k2p")
   - Возвращает ссылку: /invite/x8k2p
                    ↓
7. Партнер получает ссылку и делится ей (WhatsApp, Telegram, Email)
```

**Backend создание инвайта:**
```typescript
// server/partner-app-routes.ts
app.post("/api/partner-app/create-invite", async (req, res) => {
  const partner = await getPartnerFromRequest(req);
  const { scheduleEventId } = req.body;
  
  const scheduleEvent = await storage.getScheduleEvent(scheduleEventId);
  
  // Создаем invite_event
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
  
  res.json({
    inviteCode: inviteEvent.inviteCode,
    inviteUrl: `/invite/${inviteEvent.inviteCode}`
  });
});
```

### Flow 3: Регистрация гостя

```
1. Гость получает ссылку https://jet-up.ai/invite/x8k2p
                    ↓
2. Открывает → видит landing page с информацией о вебинаре
                    ↓
3. Заполняет форму: Имя, Email, Телефон
                    ↓
4. POST /api/invite/x8k2p/register
   {
     name: "Иван Петров",
     email: "ivan@example.com",
     phone: "+7..."
   }
                    ↓
5. Backend:
   - Создает запись в invite_guests
   - Отправляет уведомление партнеру в Telegram
   - Отправляет confirmation email гостю
                    ↓
6. Гость видит кнопку "Присоединиться к Zoom"
                    ↓
7. Клик → POST /api/invite/x8k2p/click
   - Обновляется clicked_zoom = true, clicked_at = NOW()
   - Редирект на Zoom ссылку
```

### Flow 4: Синхронизация с Zoom

```
1. Вебинар завершился
                    ↓
2. Партнер открывает отчет в боте: /report
                    ↓
3. Бот показывает кнопку "🔄 Обновить Zoom данные"
                    ↓
4. Клик → вызывается syncZoomDataForEvent(inviteEventId, zoomLink)
                    ↓
5. Zoom API процесс:
   
   a) Извлекаем meetingId из zoom_link
      https://zoom.us/j/84938727526 → 84938727526
   
   b) Запрос OAuth токена:
      POST https://zoom.us/oauth/token
      grant_type=account_credentials
      → access_token
   
   c) Получаем участников:
      GET /v2/report/meetings/84938727526/participants
      (или /v2/report/webinars/... если webinar)
      
      Ответ:
      {
        participants: [
          {
            name: "Иван Петров",
            user_email: "ivan@example.com",
            join_time: "2026-03-20T19:05:00Z",
            leave_time: "2026-03-20T20:30:00Z",
            duration: 85  // минуты
          },
          ...
        ]
      }
   
   d) Получаем Q&A:
      GET /v2/report/meetings/84938727526/qa
      
      Ответ:
      {
        questions: [
          {
            email: "ivan@example.com",
            question_details: [
              { question: "Какой минимальный депозит?" }
            ]
          }
        ]
      }
                    ↓
6. Сопоставление с гостями:
   
   Для каждого Zoom участника:
   - Ищем в invite_guests по email
   - НАЙДЕН → создаем zoom_attendance с invite_guest_id
   - НЕ НАЙДЕН → создаем zoom_attendance с invite_guest_id = NULL (walk-in)
                    ↓
7. Сохранение в БД:
   
   INSERT INTO zoom_attendance (
     invite_guest_id,    -- 15 или NULL
     invite_event_id,    -- 42
     participant_email,  -- ivan@example.com
     participant_name,   -- Иван Петров
     join_time,          -- 2026-03-20 19:05:00
     leave_time,         -- 2026-03-20 20:30:00
     duration_minutes,   -- 85
     questions_asked     -- 1
   )
                    ↓
8. Логирование:
   console.log("[ZoomSync] Persisted attendance: ivan@example.com — 85min")
   console.log("[ZoomSync] Complete: 3 synced, 1 skipped, 4 total")
```

**Код синхронизации:**
```typescript
// server/integrations/zoom-api.ts
export async function syncZoomDataForEvent(
  inviteEventId: number, 
  zoomMeetingUrl: string
) {
  // 1. Извлечение ID
  const meetingId = extractMeetingId(zoomMeetingUrl);
  
  // 2. Получение данных из Zoom
  let participants = await fetchZoomMeetingParticipants(meetingId);
  const qaData = await fetchZoomMeetingQA(meetingId);
  
  // 3. Получение зарегистрированных гостей
  const guests = await storage.getGuestsByEventId(inviteEventId);
  const existingAttendance = await storage.getZoomAttendanceByEventId(inviteEventId);
  
  // 4. Сопоставление и сохранение
  let synced = 0;
  for (const participant of participants) {
    const email = participant.user_email?.toLowerCase();
    
    // Пропускаем дубликаты
    if (existingEmails.has(email)) {
      skipped++;
      continue;
    }
    
    // Ищем гостя
    const matchedGuest = guests.find(g => g.email.toLowerCase() === email);
    
    // Считаем вопросы
    const questionsCount = qaData.filter(q => 
      q.email.toLowerCase() === email
    ).length;
    
    // Сохраняем
    await storage.createZoomAttendance({
      inviteGuestId: matchedGuest?.id || null,  // NULL для walk-in
      inviteEventId,
      participantEmail: participant.user_email,
      participantName: participant.name,
      joinTime: new Date(participant.join_time),
      leaveTime: new Date(participant.leave_time),
      durationMinutes: participant.duration,
      questionsAsked: questionsCount,
    });
    
    synced++;
  }
  
  return { participants, synced, skipped };
}
```

---

## 🤖 Персональные AI-приглашения (DISC)

### Что это такое?

**Персональные AI-приглашения** — это продвинутая версия обычного инвайта, где:
1. Партнер отвечает на вопросы о конкретном проспекте
2. AI определяет **DISC-тип** личности (Dominance, Influence, Steadiness, Conscientiousness)
3. Генерируются **2 персонализированных сообщения** под этот тип
4. Проспект попадает на страницу с **AI-чатом**, который ведет диалог в его стиле
5. Inline-регистрация прямо в чате

### Зачем это нужно?

**Проблема с обычными инвайтами:**
- Одна и та же ссылка для всех
- Холодное landing page без персонализации
- Низкая конверсия с "холодными" контактами

**Решение с AI:**
- Партнер квалифицирует лид заранее
- Сообщение подстраивается под тип личности
- AI-ассистент вовлекает в диалог
- Выше конверсия регистрации

### DISC-профилирование

**4 типа личности:**

#### D (Dominance) — Доминирование
- **Характер:** Прямой, решительный, ориентирован на результат
- **Что важно:** Эффективность, быстрые решения, контроль
- **Стиль общения:** Короткие фразы, факты, "к делу"
- **Quick Replies:** "Да, интересно" / "К делу" / "Регистрируй"

#### I (Influence) — Влияние
- **Характер:** Общительный, энтузиаст, оптимист
- **Что важно:** Люди, эмоции, новые возможности
- **Стиль общения:** Энергичный, дружелюбный, истории
- **Quick Replies:** "Звучит круто!" / "Расскажи ещё" / "Да, хочу!"

#### S (Steadiness) — Стабильность
- **Характер:** Спокойный, надежный, избегает рисков
- **Что важно:** Доверие, стабильность, поддержка
- **Стиль общения:** Мягкий, поддерживающий, без давления
- **Quick Replies:** "Расскажи подробнее?" / "Может быть" / "Да, зарегистрируй"

#### C (Conscientiousness) — Добросовестность
- **Характер:** Аналитический, точный, скептик
- **Что важно:** Детали, доказательства, логика
- **Стиль общения:** Структурированный, с цифрами и фактами
- **Quick Replies:** "Что именно покажут?" / "Покажи детали" / "Да, зарегистрируй"

### Flow персонального AI-инвайта

```
1. Партнер выбирает вебинар → нажимает "AI Invite"
                    ↓
2. Заполняет форму о проспекте:
   - Имя проспекта
   - Тип отношений (друг / бизнес-контакт / MLM-лидер / инвестор)
   - Что мотивирует? (деньги / рост бизнеса / технологии / сообщество)
   - Как реагирует? (быстрые решения / аналитик / скептик / нужно доверие)
   - Дополнительные заметки (опционально)
                    ↓
3. AI анализ (backend):
   a) Определяет DISC-тип на основе ответов:
      • fast_decision + money_results → D (Доминирование)
      • community_people OR needs_trust → S (Стабильность)
      • analytical OR skeptical → C (Добросовестность)
      • Остальное → I (Влияние)
   
   b) Выбирает стратегию приглашения:
      • Authority — для MLM-лидеров и предпринимателей
      • Opportunity — для инвесторов
      • Curiosity — для холодных контактов
      • Support — для тех, кому нужно доверие
   
   c) Генерирует 2 сообщения через GPT-4o-mini:
      Промпт учитывает:
      - DISC-тип (тон и стиль)
      - Стратегию (фокус сообщения)
      - Язык проспекта (EN/DE/RU)
      - Имя партнера
      - Название вебинара
                    ↓
4. Партнер видит превью:
   ┌───────────────────────────────────────┐
   │ Preview: Персональное приглашение     │
   ├───────────────────────────────────────┤
   │ Проспект: Иван Петров                 │
   │ DISC: I (Influence)                   │
   │ Стратегия: Curiosity                  │
   │                                       │
   │ Сообщение 1:                          │
   │ "Привет, Иван! 🚀                     │
   │  Вот эта тема меня прям зацепила...   │
   │  [полный текст]"                      │
   │                                       │
   │ Сообщение 2:                          │
   │ "Иван, слушай!                        │
   │  Там будет живая демонстрация...      │
   │  [полный текст]"                      │
   │                                       │
   │ Quick Replies:                        │
   │ • Звучит круто!                       │
   │ • Расскажи ещё                        │
   │ • Да, хочу!                           │
   └───────────────────────────────────────┘
                    ↓
5. Партнер подтверждает → получает ссылку:
   /personal-invite/xyz789
                    ↓
6. Проспект открывает ссылку → видит AI-чат:
   ┌───────────────────────────────────────┐
   │ 💬 Chat от Dennis                     │
   ├───────────────────────────────────────┤
   │ 👤 Dennis Assistent                   │
   │ Привет, Иван! 🚀                      │
   │ Вот эта тема меня прям зацепила...    │
   │                                       │
   │ [Звучит круто!] [Расскажи ещё]        │
   │ [Да, хочу!]                           │
   │                                       │
   │ 📅 Webinar Card:                      │
   │ Трейдинг стратегии                    │
   │ 20 марта, 19:00 CET                   │
   │ Спикер: John Doe                      │
   └───────────────────────────────────────┘
                    ↓
7. Проспект взаимодействует:
   - Кликает на Quick Reply ИЛИ пишет свой текст
   - AI отвечает в соответствии с DISC-типом
   - Вовлекает в разговор
                    ↓
8. Inline регистрация в чате:
   AI: "Отлично! Давай зарегистрирую тебя.
        Как тебя представить на вебинаре?"
   
   [Форма прямо в чате:]
   Имя: [Иван Петров]
   Email: [ivan@example.com]
   Telegram: [@ivanpetrov] (опционально)
   
   [Зарегистрироваться]
                    ↓
9. После регистрации:
   - Партнер получает уведомление в Telegram
   - Проспект получает confirmation email
   - В чате появляется кнопка "Join Zoom"
   - AI предлагает настроить напоминание
```

### Код: определение DISC-типа

```typescript
// server/partner-app-routes.ts
function inferDiscFromAnswers(motivation: string, reaction: string): string {
  // D — Доминирование (быстрые решения + результат)
  if (hasAny(reaction, ["fast_decision"]) && 
      hasAny(motivation, ["money_results", "business_growth"])) 
    return "D";
  
  // I — Влияние (люди + энергия)
  if (hasAny(motivation, ["community_people"]) || 
      (hasAny(reaction, ["fast_decision"]) && 
       hasAny(motivation, ["technology_innovation"]))) 
    return "I";
  
  // S — Стабильность (доверие + поддержка)
  if (hasAny(reaction, ["needs_trust"]) || 
      hasAny(motivation, ["community_people"])) 
    return "S";
  
  // C — Добросовестность (аналитик + скептик)
  if (hasAny(reaction, ["analytical", "skeptical"])) 
    return "C";
  
  // По умолчанию I
  return "I";
}
```

### Код: генерация сообщений

```typescript
// Промпт для GPT-4o-mini
const systemPrompt = `
You are a personal assistant helping a partner invite a prospect to a webinar.

DISC TYPE: ${discType} (${discToneGuide})

STRATEGY: ${invite.inviteStrategy}
${strategyGuide}

Generate 2 short, personalized messages (2-3 sentences each) 
that ${partner.name} can send to ${invite.prospectName}.

Language: ${language}
Tone: Natural, conversational, like a personal message.
`;
```

### Преимущества

✅ **Высокая персонализация** — каждый проспект видит свой стиль общения
✅ **AI вовлечение** — чат создает диалог, а не просто форму
✅ **Квалификация лида** — партнер думает о проспекте заранее
✅ **Inline регистрация** — без редиректов, всё в чате
✅ **Multilingual** — EN/DE/RU автоматически

---

## 🔔 Автоматические уведомления партнеру

### Что партнер получает АВТОМАТИЧЕСКИ

#### 1. ✅ Уведомление о регистрации гостя (РАБОТАЕТ)

**Когда:** Гость заполняет форму регистрации на `/invite/:code` или `/personal-invite/:code`

**Что приходит:**
```
🎉 Neue Registrierung!

📊 Event: Трейдинг стратегии
📅 2026-03-20 19:00

👤 Gast:
   Иван Петров
   ivan@example.com
   +7 999 123 4567

🔗 Einladungscode: x8k2p
⏰ 18.03.2026 22:35
```

**Канал:** Telegram (Partner Bot)

**Код:** `server/integrations/partner-bot.ts` → `notifyPartnerNewRegistration()`

**Триггер:** 
- `POST /api/invite/:code/register` (обычный инвайт)
- `POST /api/personal-invite/:code/register` (AI инвайт)

---

#### 2. ✅ Уведомление о клике на Zoom (РАБОТАЕТ опционально)

**Когда:** Гость кликает "Присоединиться к Zoom"

**Что приходит:**
```
🔗 Zoom-Link geklickt!

👤 Иван Петров (ivan@example.com)
📊 Event: Трейдинг стратегии
⏰ 20.03.2026 18:55
```

**Канал:** Telegram

**Код:** `server/routes.ts` → `POST /api/invite/:code/click`

**Статус:** Опционально (можно включить)

---

#### 3. ✅ Напоминание о проспекте с reminder (РАБОТАЕТ)

**Когда:** За час или 15 минут до вебинара (если гость выбрал напоминание)

**Что приходит:**
```
⏰ Erinnerung: Gast möchte erinnert werden!

👤 Иван Петров
📊 Event: Трейдинг стратегии
🕐 Beginnt in 1 Stunde (19:00 CET)
📱 Bevorzugter Kanal: WhatsApp

Hinweis: Gast hat ein Reminder gewünscht. 
Du kannst ihn jetzt persönlich kontaktieren.
```

**Канал:** Telegram

**Код:** `server/integrations/reminder-scheduler.ts` → `checkAndSendReminders()`

**Триггер:** Background scheduler (каждые 2 минуты)

---

### Что партнер НЕ получает АВТОМАТИЧЕСКИ (проблемы!)

#### 4. ❌ Уведомление после окончания вебинара (НЕ РАБОТАЕТ!)

**Что ДОЛЖНО быть:**
```
📊 Webinar beendet: Трейдинг стратегии

Deine Ergebnisse:
📝 Registriert: 8 Gäste
🔗 Zoom geklickt: 6
⏳ Warte auf Zoom-Daten...

💡 Tipp: Zoom-Daten werden ~30 Min. 
nach Ende verfügbar. Dann kannst du 
sehen, wer wirklich teilgenommen hat.

[🔄 Zoom-Daten jetzt abrufen]
```

**Что ЕСТЬ сейчас:** НИЧЕГО! Партнер должен сам зайти в бот и проверить.

**Почему важно:**
- Партнер не знает, что вебинар закончился
- Упускает момент для follow-up
- Не видит "горячих" лидов сразу

**Что нужно добавить:**
1. Определять, когда вебинар закончился (event_date + event_time + 2 часа)
2. Проверять раз в 10-15 минут
3. Отправлять summary партнеру автоматически
4. Предлагать кнопку "Обновить Zoom данные"

---

#### 5. ❌ Автоматическая синхронизация Zoom (НЕ РАБОТАЕТ!)

**Что ДОЛЖНО быть:**
- Через 30 минут после окончания вебинара
- Система автоматически запрашивает Zoom API
- Синхронизирует данные
- Отправляет партнеру полный отчет с attendance

**Что ЕСТЬ сейчас:**
- Партнер должен ВРУЧНУЮ нажать кнопку "🔄 Zoom-Daten aktualisieren"
- Если забыл — данные не синхронизируются
- Неудобно

**Почему важно:**
- Партнер может забыть
- Данные устаревают
- Неточная статистика

**Что нужно добавить:**
1. Background job через 30-40 минут после окончания
2. Автоматический вызов `syncZoomDataForEvent()`
3. Отправка результата партнеру:
   ```
   ✅ Zoom-Daten synchronisiert!
   
   📊 Трейдинг стратегии
   📅 2026-03-20 19:00
   
   ✅ Teilgenommen: 4 von 8 (50%)
   • Иван Петров — 85 min, 2 Fragen
   • Мария Сидорова — 120 min, 5 Fragen
   ...
   
   ❌ No-show: 4
   • Петр Иванов
   • ...
   
   🆕 Walk-in: 1 (nicht über deinen Link)
   
   [📊 Vollständiger Bericht] [💬 AI Follow-up]
   ```

---

#### 6. ❌ Еженедельный summary (НЕ РАБОТАЕТ!)

**Что ДОЛЖНО быть:**
```
📊 Wochenreport: 14. - 20. März

Deine Aktivität:
🔗 Einladungen erstellt: 12
👥 Registrierungen: 45
✅ Teilnahmen: 23 (51% Conversion)

Top Event:
📊 Трейдинг стратегии
   8 reg. → 4 attended (50%)

💡 Tipp: 22 Gäste haben nicht teilgenommen. 
   Nutze AI Follow-up für Nachfassung!

[📊 Detaillierter Bericht]
```

**Что ЕСТЬ сейчас:** Ничего

**Почему важно:**
- Партнер видит свой прогресс
- Мотивация продолжать
- Напоминание о no-show для follow-up

---

### Summary: Автоматические уведомления

| Событие | Статус | Канал | Когда срабатывает |
|---------|--------|-------|-------------------|
| Гость зарегистрировался | ✅ Работает | Telegram | Сразу при регистрации |
| Гость кликнул Zoom | ⚠️ Опционально | Telegram | При клике (можно включить) |
| Напоминание (reminder) | ✅ Работает | Telegram | За 1 час / 15 мин до вебинара |
| **Вебинар закончился** | ❌ НЕ РАБОТАЕТ | - | Должно быть через ~2 часа после начала |
| **Zoom автосинхронизация** | ❌ НЕ РАБОТАЕТ | - | Должно быть через 30 мин после окончания |
| **Еженедельный отчет** | ❌ НЕ РАБОТАЕТ | - | Должно быть каждый понедельник |

---

## 📱 Визуальные примеры интерфейсов

### 1. Telegram Bot — главное меню

```
🤖 @Jetup_partner_test_bot

👋 Willkommen zurück, Dennis!

Öffne die Partner App für Dashboard, 
Einladungen, Statistiken und KI-Tools.

┌─────────────────────────────────┐
│ 📱 Partner App öffnen           │ ← Mini App button
└─────────────────────────────────┘
```

**Команды:**
- `/start` — открыть Partner App
- `/invite` — открыть Partner App на вкладке Webinars
- `/events` — список событий (inline keyboard)
- `/report` — отчет по событию
- `/followup` — AI follow-up ассистент

---

### 2. Partner Mini App — Dashboard

```
┌────────────────────────────────────────┐
│ 📊 Dashboard                           │
├────────────────────────────────────────┤
│                                        │
│  👋 Hallo, Dennis!                     │
│  CU-1234                               │
│                                        │
│  📈 Deine Statistik (März)             │
│  ┌────────────┬────────────┐          │
│  │ 🔗 Invites │ 👥 Gäste   │          │
│  │     12     │     45     │          │
│  └────────────┴────────────┘          │
│  ┌────────────┬────────────┐          │
│  │ ✅ Attended│ 📊 Rate    │          │
│  │     23     │    51%     │          │
│  └────────────┴────────────┘          │
│                                        │
│  🚀 Nächster Webinar:                  │
│  📅 Трейдинг стратегии                 │
│  20. März, 19:00 CET                   │
│                                        │
│  [Einladung erstellen]                 │
│                                        │
├────────────────────────────────────────┤
│  [📊 Dashboard] [📅 Webinars] [📈]    │ ← Bottom tabs
└────────────────────────────────────────┘
```

---

### 3. Webinars Screen — список вебинаров

```
┌────────────────────────────────────────┐
│ 📅 Webinars                            │
├────────────────────────────────────────┤
│                                        │
│  🔴 Live & Upcoming                    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📊 Трейдинг стратегии            │ │
│  │ 20 марта, 19:00 CET              │ │
│  │ 🎤 John Doe                      │ │
│  │                                  │ │
│  │ [Einladung erstellen]            │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 💰 Passives Einkommen            │ │
│  │ 22 марта, 18:00 CET              │ │
│  │ 🎤 Maria Schmidt                 │ │
│  │                                  │ │
│  │ [Einladung erstellen]            │ │
│  └──────────────────────────────────┘ │
│                                        │
│  📚 Vergangene Events                  │
│  (можно создать новый инвайт)          │
│                                        │
├────────────────────────────────────────┤
│  [📊] [📅 Webinars] [📈 Reports]      │
└────────────────────────────────────────┘
```

---

### 4. Invite Type Selection

```
┌────────────────────────────────────────┐
│ Einladung erstellen                    │
│ Трейдинг стратегии                     │
├────────────────────────────────────────┤
│                                        │
│  Welche Art von Einladung?             │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📢 Social Share                  │ │
│  │ Schnelle Einladung für          │ │
│  │ WhatsApp, Telegram, Email       │ │
│  │                                  │ │
│  │ [Auswählen]                     │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🤖 Persönliches AI-Invite        │ │
│  │ KI-gestützte Einladung          │ │
│  │ mit DISC-Profiling              │ │
│  │                                  │ │
│  │ [Auswählen]                     │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [← Zurück]                            │
└────────────────────────────────────────┘
```

---

### 5. Personal AI Invite — Qualification Form

```
┌────────────────────────────────────────┐
│ 🤖 Persönliches AI-Invite              │
│ Трейдинг стратегии                     │
├────────────────────────────────────────┤
│                                        │
│  Name des Prospects:                   │
│  [Иван Петров_____________]            │
│                                        │
│  Beziehung:                            │
│  ○ Freund                              │
│  ○ Geschäftskontakt                    │
│  ● MLM-Leader                          │
│  ○ Investor                            │
│  ○ Kalter Kontakt                      │
│                                        │
│  Was motiviert ihn? (mehrere möglich)  │
│  ☑ Geld & Ergebnisse                   │
│  ☐ Geschäftswachstum                   │
│  ☑ Technologie & Innovation            │
│  ☐ Community & Leute                   │
│  ☐ Lernen & Neugier                    │
│                                        │
│  Wie reagiert er typischerweise?       │
│  ☑ Schnelle Entscheidungen             │
│  ☐ Analytisch / will Details           │
│  ☐ Skeptisch / kritisch                │
│  ☐ Braucht Vertrauen                   │
│                                        │
│  Notizen (optional):                   │
│  [Hat eigenes MLM-Team,              ] │
│  [sucht neue Möglichkeiten___________] │
│                                        │
│  [🚀 AI analysieren & Messages generieren] │
│                                        │
│  [← Zurück]                            │
└────────────────────────────────────────┘
```

---

### 6. Personal AI Invite — Preview

```
┌────────────────────────────────────────┐
│ 🎯 Preview: Persönliche Einladung      │
├────────────────────────────────────────┤
│                                        │
│  Prospect: Иван Петров                 │
│  DISC: D (Dominance)                   │
│  Strategie: Authority                  │
│                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│  💬 Nachricht 1:                       │
│  ┌────────────────────────────────┐   │
│  │ Иван, ich hab da was für dich. │   │
│  │ Webinar am 20. März — Strategie│   │
│  │ die funktioniert. Konkret,     │   │
│  │ messbar, ohne Blabla. Dein     │   │
│  │ Team wird's danken.            │   │
│  └────────────────────────────────┘   │
│                                        │
│  💬 Nachricht 2:                       │
│  ┌────────────────────────────────┐   │
│  │ Nur 90 Minuten, live Demo,    │   │
│  │ direkte Zahlen. Kein Sales-    │   │
│  │ Pitch. Wenn du Ergebnisse      │   │
│  │ willst, klick hier.            │   │
│  └────────────────────────────────┘   │
│                                        │
│  🔘 Quick Replies:                     │
│  • Ja, interessiert                    │
│  • Zur Sache                           │
│  • Registriere mich                    │
│                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│  [✓ Bestätigen & Link erhalten]       │
│  [🔄 Neu generieren]  [✏ Bearbeiten]  │
│  [← Zurück]                            │
└────────────────────────────────────────┘
```

---

### 7. Personal Invite Page — Proспект видит

```
┌────────────────────────────────────────┐
│ 💬 Einladung von Dennis                │
├────────────────────────────────────────┤
│                                        │
│  👤 Dennis Assistent                   │
│  ┌────────────────────────────────┐   │
│  │ Иван, ich hab da was für dich. │   │
│  │ Webinar am 20. März — Strategie│   │
│  │ die funktioniert. Konkret,     │   │
│  │ messbar, ohne Blabla. Dein     │   │
│  │ Team wird's danken.            │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📊 Трейдинг стратегии            │ │
│  │ 📅 20. März 2026, 19:00 CET      │ │
│  │ 🎤 John Doe                      │ │
│  │ ⏱ Dauer: 90 Minuten              │ │
│  └──────────────────────────────────┘ │
│                                        │
│  💬 Quick Replies:                     │
│  ┌─────────────┬─────────────┬─────┐  │
│  │ Ja, interes-│ Zur Sache  │ Reg-│  │
│  │ siert       │            │istr-│  │
│  │             │            │iere │  │
│  └─────────────┴─────────────┴─────┘  │
│                                        │
│  ⌨ Oder schreib deine Nachricht:       │
│  [____________________________]        │
│  [Senden]                              │
│                                        │
│  🌐 [DE] [EN] [RU]  ← Language selector│
└────────────────────────────────────────┘
```

---

### 8. Reports Screen — статистика партнера

```
┌────────────────────────────────────────┐
│ 📈 Reports                             │
├────────────────────────────────────────┤
│                                        │
│  📊 Deine Events                       │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Трейдинг стратегии               │ │
│  │ 20. März 2026, 19:00             │ │
│  │                                  │ │
│  │ 📝 Registriert: 8                │ │
│  │ 🔗 Clicked: 6                    │ │
│  │ ✅ Attended: 4 (50%)             │ │
│  │ 🆕 Walk-in: 1                    │ │
│  │                                  │ │
│  │ [Details anzeigen]               │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Passives Einkommen               │ │
│  │ 22. März 2026, 18:00             │ │
│  │                                  │ │
│  │ 📝 Registriert: 5                │ │
│  │ 🔗 Clicked: 3                    │ │
│  │ ✅ Attended: — (noch nicht)      │ │
│  │                                  │ │
│  │ [Details anzeigen]               │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│  [📊] [📅] [📈 Reports]               │
└────────────────────────────────────────┘
```

---

### 9. Report Details — детальный отчет

```
┌────────────────────────────────────────┐
│ ← Event Report                         │
│ Трейдинг стратегии                     │
├────────────────────────────────────────┤
│                                        │
│  📊 Funnel:                            │
│  ┌─────────────────────────────────┐  │
│  │ 📝 Registered        8          │  │
│  │ ↓                               │  │
│  │ 🔗 Clicked Zoom      6 (75%)    │  │
│  │ ↓                               │  │
│  │ ✅ Attended          4 (50%)    │  │
│  └─────────────────────────────────┘  │
│                                        │
│  [🔄 Zoom-Daten aktualisieren]         │
│                                        │
│  👥 Gäste (5 total):                   │
│                                        │
│  ✅ Иван Петров                        │
│     ivan@example.com                   │
│     🕐 85 min  •  💬 2 Fragen          │
│     [▼ Mehr]                           │
│                                        │
│  ✅ Мария Сидорова                     │
│     maria@example.com                  │
│     🕐 120 min  •  💬 5 Fragen         │
│     [▼ Mehr]                           │
│                                        │
│  ❌ Петр Иванов (No-show)              │
│     petr@example.com                   │
│     Registriert, nicht teilgenommen    │
│                                        │
│  ❌ Анна Ковалева (No-show)            │
│     anna@example.com                   │
│     Registriert, nicht teilgenommen    │
│                                        │
│  🟡 Unknown Guest (Walk-in)            │
│     guest@example.com                  │
│     🕐 45 min  •  💬 0 Fragen          │
│                                        │
│  [💬 AI Follow-up generieren]          │
│                                        │
└────────────────────────────────────────┘
```

---

### 10. Telegram Bot — Report im Chat

```
@Jetup_partner_test_bot

Du → /report

Bot →
📊 Event-Bericht: Трейдинг стратегии
📅 2026-03-20 19:00

👤 Partner: Dennis (CU-1234)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Statistik:
📝 Registriert: 8 Gäste
🔗 Zoom geklickt: 6
✅ Teilgenommen: 4 (50% Conversion)
🆕 Walk-in: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ TEILGENOMMEN (4):

• Иван Петров
  📧 ivan@example.com
  🕐 85 Minuten
  💬 2 Fragen gestellt

• Мария Сидорова
  📧 maria@example.com
  🕐 120 Minuten
  💬 5 Fragen gestellt

• ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ NO-SHOW (4):

• Петр Иванов (petr@example.com)
• ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────────────────────┐
│ 🔄 Zoom-Daten aktualisieren  │
├──────────────────────────────┤
│ 💬 AI Follow-up erstellen    │
└──────────────────────────────┘
```

---

## 📊 Интеграция с Zoom

### Почему нужна интеграция с Zoom?

**Проблема без интеграции:**
- Партнер видит только "кто зарегистрировался" и "кто кликнул на Zoom"
- НО не знает: кто реально был, сколько времени, задавал ли вопросы

**Решение с интеграцией:**
- Точные данные посещаемости из самого Zoom
- Метрики engagement (duration, questions)
- Выявление "no-show" (зарегистрировался, но не пришел)
- Выявление "walk-in" (пришел, но не регистрировался)

### Zoom API Endpoints

#### 1. OAuth токен (Server-to-Server)
```http
POST https://zoom.us/oauth/token
Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)
Content-Type: application/x-www-form-urlencoded

grant_type=account_credentials&account_id=ACCOUNT_ID

→ Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### 2. Participants Report
```http
GET https://api.zoom.us/v2/report/meetings/{meetingId}/participants?page_size=300
Authorization: Bearer {access_token}

→ Response:
{
  "page_size": 300,
  "total_records": 15,
  "participants": [
    {
      "id": "user123",
      "name": "Иван Петров",
      "user_email": "ivan@example.com",
      "join_time": "2026-03-20T19:05:23Z",
      "leave_time": "2026-03-20T20:30:15Z",
      "duration": 85,
      "attentiveness_score": ""
    },
    ...
  ]
}
```

**Для вебинаров:** `/v2/report/webinars/{webinarId}/participants`

#### 3. Q&A Report
```http
GET https://api.zoom.us/v2/report/meetings/{meetingId}/qa
Authorization: Bearer {access_token}

→ Response:
{
  "questions": [
    {
      "email": "ivan@example.com",
      "name": "Иван Петров",
      "question_details": [
        {
          "question": "Какой минимальный депозит для начала?",
          "answer": "Минимальный депозит 100 USD"
        }
      ]
    }
  ]
}
```

### Обработка ошибок

**Ошибка 400 "webinar":**
```javascript
if (res.status === 400 && errorText.includes("webinar")) {
  // Переключаемся на webinar endpoint
  res = await fetch(`/v2/report/webinars/${meetingId}/participants`);
}
```

**Ошибка 404:**
- Встреча еще не завершилась
- Неверный meeting ID
- Данные еще не доступны (Zoom обрабатывает ~30 мин после окончания)

**Ошибка 429:**
- Rate limit достигнут
- Нужно подождать несколько минут

---

## 🎛️ Админка

### Раздел "Partner Invites Management" (Invites)

**Что это:**
Административный раздел для управления всеми инвайтами в системе.

**Что видно:**
```
┌─────────────────────────────────────────────────────────┐
│ Partner Invites Management (234 events)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🔍 Search: [________]  📅 Filter  [+ Create]           │
│                                                          │
│  Event                    Partner     Guests  Clicks    │
│  ─────────────────────   ─────────   ──────  ──────    │
│  Трейдинг стратегии      Денис (CU-  5 👥   3 🖱️      │
│  2026-03-20 19:00        1234)                          │
│  ✅ Active               🔗 abc123                       │
│  📊 View Details  📧 Send Report  🔄 Zoom Sync          │
│  ────────────────────────────────────────────────────   │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

**Функции:**

1. **View Details** — открывает модальное окно с таблицей гостей:
   ```
   Guest Report: Трейдинг стратегии
   Partner: Денис (CU-1234)
   
   ┌────────────┬───────────┬──────────┬─────────┬─────────┬──────────┐
   │ Name       │ Email     │ Registered│ Clicked │ Attended│ Duration │
   ├────────────┼───────────┼──────────┼─────────┼─────────┼──────────┤
   │ Иван П.    │ ivan@...  │ 19.03    │ ✓       │ ✓ Yes   │ 85m      │
   │ Мария С.   │ maria@... │ 18.03    │ ✓       │ ─       │ ─        │
   │ Unknown    │ guest@... │ ─        │ ─       │ ✓ Yes   │ 45m      │
   │ (Walk-in)  │           │          │         │ 🟡      │          │
   └────────────┴───────────┴──────────┴─────────┴─────────┴──────────┘
   ```
   
   **Walk-in участники** (🟡 желтый фон):
   - Люди, которые были на вебинаре
   - НО не регистрировались через ссылку партнера
   - Пример: организатор пригласил напрямую

2. **Send Report** — отправляет отчет партнеру в Telegram:
   ```
   📊 Event-Bericht: Трейдинг стратегии
   📅 2026-03-20 19:00
   👤 Partner: Денис (CU-1234)
   
   📝 Registriert: 5 Gäste
   ✅ Zoom beigetreten: 3
   ❌ Nicht beigetreten: 2
   
   ✅ Beigetreten:
     • Иван Петров (ivan@example.com)
     • ...
   ```

3. **Zoom Sync** — запускает синхронизацию с Zoom:
   - Вызывает `POST /api/admin/zoom-sync/:eventId`
   - Показывает результат: "3 synchronisiert, 1 übersprungen"

**Зачем нужен:**
- Центральный мониторинг всех инвайтов
- Помощь партнерам (если у них проблемы)
- Контроль качества лидов
- Ручная синхронизация Zoom (если автоматическая не сработала)

### Раздел "Partners"

**Что это:**
Список всех зарегистрированных партнеров.

**Что видно:**
```
┌─────────────────────────────────────────────────────────┐
│ Registrierte Partner (42)                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Денис Иванов  [CU-1234]  [Aktiv]                       │
│  📱 @denis_broker  📧 denis@example.com                  │
│  Registriert: 15.02.2026                                │
│  ────────────────────────────────────────────────────   │
│  Мария Петрова  [CU-5678]  [Aktiv]                      │
│  📱 @maria_trading  📧 maria@example.com                 │
│  Registriert: 20.02.2026                                │
│  ────────────────────────────────────────────────────   │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

**Зачем нужен:**
- Видеть всех партнеров системы
- Проверять статус (active/inactive)
- Контакты для связи
- Аудит (кто и когда зарегистрировался)

---

## 📡 API Endpoints

### Partner App API

#### Регистрация
```http
POST /api/partner-app/register
Headers:
  x-telegram-id: 123456789
Body:
  {
    "name": "Денис Иванов",
    "cuNumber": "CU-1234",
    "phone": "+7...",
    "email": "denis@example.com"
  }
Response:
  {
    "partner": { id: 1, name: "Денис Иванов", ... }
  }
```

#### Получение вебинаров
```http
GET /api/partner-app/webinars?language=de
Headers:
  x-telegram-id: 123456789
Response:
  [
    {
      "id": 5,
      "title": "Trading Strategien",
      "date": "2026-03-20",
      "time": "19:00",
      "speaker": "John Doe",
      "link": "https://zoom.us/j/...",
      ...
    }
  ]
```

#### Создание инвайта
```http
POST /api/partner-app/create-invite
Headers:
  x-telegram-id: 123456789
Body:
  {
    "scheduleEventId": 5
  }
Response:
  {
    "inviteCode": "x8k2p",
    "inviteUrl": "/invite/x8k2p",
    "event": {
      "title": "Trading Strategien",
      "date": "2026-03-20",
      "time": "19:00",
      "speaker": "John Doe"
    }
  }
```

#### Статистика событий (с группировкой)
```http
GET /api/partner-app/events
Headers:
  x-telegram-id: 123456789
Response:
  [
    {
      "id": 42,
      "title": "Trading Strategien",
      "eventDate": "2026-03-20",
      "eventTime": "19:00",
      "scheduleEventId": 5,
      "invitesSent": 3,              // Сколько инвайтов создано
      "registeredCount": 8,          // Всего регистраций
      "clickedCount": 6,             // Кликнули на Zoom
      "attendedCount": 4,            // Реально были (из Zoom)
      "conversionRate": 50,          // 4/8 * 100%
      "inviteEventIds": [42, 43, 44] // ID всех инвайтов
    }
  ]
```

**Группировка по `scheduleEventId`:**
- Если партнер создал 3 инвайта для одного вебинара → показывается 1 строка
- Суммируются все регистрации и attendance
- При клике на детали → объединяются данные всех 3 инвайтов

#### Детальный отчет
```http
GET /api/partner-app/events/42/report
Headers:
  x-telegram-id: 123456789
Response:
  {
    "event": { id: 42, title: "...", ... },
    "guests": [
      {
        "id": 15,
        "name": "Иван Петров",
        "email": "ivan@example.com",
        "registeredAt": "2026-03-19T...",
        "clickedZoom": true,
        "attended": true,
        "durationMinutes": 85,
        "questionsAsked": 1,
        "joinTime": "2026-03-20T19:05:00Z",
        "isWalkIn": false
      },
      {
        "id": -234,  // Negative ID для walk-in
        "name": "Unknown Guest",
        "email": "guest@example.com",
        "attended": true,
        "durationMinutes": 45,
        "questionsAsked": 0,
        "isWalkIn": true
      }
    ],
    "funnel": {
      "invited": 8,
      "registered": 8,
      "clickedZoom": 6,
      "attended": 4
    }
  }
```

### Admin API

#### Получение всех инвайтов
```http
GET /api/admin/invite-events
Headers:
  x-admin-password: SECRET
Response:
  [
    {
      "id": 42,
      "partnerName": "Денис Иванов",
      "partnerCu": "CU-1234",
      "title": "Trading Strategien",
      "eventDate": "2026-03-20",
      "inviteCode": "x8k2p",
      "guestCount": 8,
      "clickedCount": 6,
      "zoomSyncedCount": 4
    }
  ]
```

#### Отчет по событию (с walk-in)
```http
GET /api/admin/invite-events/42/report
Headers:
  x-admin-password: SECRET
Response:
  {
    "event": { ... },
    "guests": [
      {
        "id": 15,
        "name": "Иван Петров",
        "email": "ivan@example.com",
        "clickedZoom": true,
        "attended": true,
        "durationMinutes": 85,
        "questionsAsked": 1,
        "joinTime": "2026-03-20T19:05:00Z",
        "isWalkIn": false
      },
      {
        "id": -234,
        "name": "Unknown",
        "email": "guest@example.com",
        "attended": true,
        "durationMinutes": 45,
        "isWalkIn": true
      }
    ],
    "stats": {
      "totalRegistered": 8,
      "totalClicked": 6,
      "totalAttended": 4,
      "totalWalkIns": 1
    }
  }
```

#### Zoom синхронизация
```http
POST /api/admin/zoom-sync/42
Headers:
  x-admin-password: SECRET
Response:
  {
    "synced": 3,
    "skipped": 1,
    "error": null
  }
```

---

## 🎯 Практические сценарии

### Сценарий 1: Партнер создает инвайт и отслеживает результаты

**День 1 (19.03):**
1. Денис открывает Partner App → Вебинары
2. Видит "Trading Strategien 20.03 19:00"
3. Создает инвайт → получает ссылку `/invite/x8k2p`
4. Делится в WhatsApp группе (50 человек)

**День 2 (19.03 вечер):**
5. 8 человек кликают на ссылку и регистрируются
6. Денис получает 8 уведомлений в Telegram:
   ```
   🎉 Новая регистрация!
   Иван Петров зарегистрировался на Trading Strategien
   ```

**День 3 (20.03 19:00):**
7. Начинается вебинар
8. 6 из 8 кликают "Присоединиться к Zoom"
9. Фактически приходят только 4 человека
10. Еще 1 человек приходит (не регистрировался) — walk-in

**День 4 (21.03):**
11. Денис открывает бота → `/report`
12. Видит предварительную статистику:
    ```
    📝 Registriert: 8
    🔗 Zoom geklickt: 6
    ```
13. Нажимает "🔄 Zoom-Daten aktualisieren"
14. Система синхронизирует:
    - 4 matched (нашли по email)
    - 1 walk-in (новый участник)
15. Обновленный отчет:
    ```
    📝 Registriert: 8
    🔗 Zoom geklickt: 6
    ✅ Teilgenommen: 4
    ❌ No-show: 2
    🆕 Walk-in: 1
    
    ✅ Teilgenommen:
      • Иван Петров (85 min, 1 Frage)
      • Мария Сидорова (120 min, 3 Fragen)
      ...
    ```

### Сценарий 2: Админ проверяет качество лидов

**Задача:** Выявить неактивных партнеров

1. Админ открывает `/admin` → Partner Invites
2. Фильтрует за последний месяц
3. Смотрит conversion rate:
   ```
   Денис:   8 регистраций → 4 attendance (50%)  ✅
   Мария:   12 регистраций → 2 attendance (17%) ⚠️
   Петр:    3 регистрации → 0 attendance (0%)   ❌
   ```
4. Выводы:
   - Денис — качественные лиды
   - Мария — нужна помощь с квалификацией
   - Петр — возможно, спам-регистрации

---

## 🔑 Ключевые концепции

### 1. Walk-in участники
**Что:** Люди на вебинаре, которых НЕТ в `invite_guests`

**Почему возникают:**
- Организатор пригласил напрямую
- Участник был на других вебинарах и имеет постоянную ссылку
- Email в Zoom не совпадает с email при регистрации

**Как обрабатывается:**
- `invite_guest_id = NULL` в `zoom_attendance`
- Показываются внизу списка с меткой "Walk-in"
- Включаются в `totalAttended`, но не в конверсию (invited → attended)

### 2. Группировка событий
**Зачем:** Один вебинар = много инвайтов от разных партнеров

**Пример:**
```
schedule_events.id = 5  "Trading Strategien 20.03"
  ├─ invite_events.id = 42  (Денис, 8 guests)
  ├─ invite_events.id = 43  (Мария, 12 guests)
  └─ invite_events.id = 44  (Петр, 3 guests)

В Partner App Дениса:
  "Trading Strategien" — 8 registered, 4 attended
  (только ЕГО гости)

В админке:
  Event #42 (Денис) — 8/4
  Event #43 (Мария) — 12/2
  Event #44 (Петр) — 3/0
```

### 3. Null-safe отображение
**Проблема:** До Zoom sync attendance = null

**Решение:**
```typescript
{guest.durationMinutes != null ? 
  `${guest.durationMinutes}m` : 
  "—"
}
```

**Зачем:** Четко показывать "данные еще не синхронизированы" vs "был, но 0 минут"

---

## 🚨 Распространенные проблемы

### Проблема 1: Zoom возвращает ошибку 300/400 "webinar"

**Причина:** У вас вебинары (webinars), а не обычные встречи (meetings)

**Решение:** Система автоматически определяет и переключается на webinar endpoint

### Проблема 2: Walk-in участники не показываются

**Причина:** Zoom attendance не синхронизирован

**Решение:** Нажать кнопку "🔄 Zoom Sync" в админке или боте

### Проблема 3: Email не совпадает

**Ситуация:** 
- Гость регистрировался с `ivan.petrov@gmail.com`
- В Zoom зашел с `ivan@company.com`

**Результат:** Будет показан как walk-in (не matched)

**Решение:** Гость должен использовать один email

---

## 📞 Быстрая справка

**Основной принцип:**
```
Partner создает Invite → генерирует ссылку → 
Guest регистрируется → кликает Zoom → 
Zoom фиксирует посещение → система синхронизирует → 
Partner видит полную картину
```

**Ключевые файлы:**
- База данных: `shared/schema.ts`
- Backend API: `server/partner-app-routes.ts`
- Zoom интеграция: `server/integrations/zoom-api.ts`
- Telegram Bot: `server/integrations/partner-bot.ts`
- Frontend: `client/src/pages/partner-app/`

**Environment переменные:**
```bash
# Zoom API
ZOOM_ACCOUNT_ID=...
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...

# Telegram Bot
TELEGRAM_PARTNER_BOT_TOKEN=...

# Partner App
PARTNER_APP_ENABLED=true
```

---

## ⚠️ Что работает и что НЕ работает

### ✅ ЧТО РАБОТАЕТ (реализовано и протестировано)

#### 1. Регистрация партнера
- ✅ Telegram Bot распознает нового пользователя
- ✅ Mini App открывает форму регистрации
- ✅ Данные сохраняются в `partners` таблицу
- ✅ Партнер получает доступ к Dashboard

#### 2. Создание обычных инвайтов (Social Share)
- ✅ Партнер выбирает вебинар
- ✅ Генерируется уникальный код
- ✅ Создается запись в `invite_events`
- ✅ Партнер получает ссылку `/invite/:code`
- ✅ Landing page показывает информацию о вебинаре

#### 3. Регистрация гостей
- ✅ Гость заполняет форму (имя, email, телефон)
- ✅ Запись создается в `invite_guests`
- ✅ **Партнер СРАЗУ получает уведомление в Telegram**
- ✅ Гость получает confirmation email
- ✅ Гость видит кнопку "Join Zoom"

#### 4. Трекинг кликов на Zoom
- ✅ Клик на "Join Zoom" отслеживается
- ✅ `clicked_zoom = true` сохраняется в БД
- ✅ Timestamp `clicked_at` записывается
- ✅ Редирект на Zoom ссылку работает

#### 5. Персональные AI-инвайты (DISC)
- ✅ Форма квалификации проспекта
- ✅ Автоматическое определение DISC-типа
- ✅ Генерация 2 персонализированных сообщений через GPT-4o-mini
- ✅ Preview перед отправкой
- ✅ AI-чат на странице `/personal-invite/:code`
- ✅ Quick Replies под DISC-тип
- ✅ Inline регистрация в чате
- ✅ Multilingual (EN/DE/RU)

#### 6. Напоминания гостям
- ✅ Гость выбирает reminder (1 час / 15 мин)
- ✅ Background scheduler проверяет каждые 2 минуты
- ✅ Отправка email за 1 час / 15 минут до вебинара
- ✅ Отправка Telegram DM (если указан @username)
- ✅ Уведомление партнеру, что гость хочет reminder

#### 7. Zoom интеграция (РУЧНАЯ)
- ✅ Server-to-Server OAuth с Zoom
- ✅ Запрос `/v2/report/meetings/:id/participants`
- ✅ **Автоматическое переключение на `/v2/report/webinars/:id` при ошибке 400**
- ✅ Запрос Q&A данных
- ✅ Сопоставление участников с гостями по email
- ✅ Создание walk-in записей для unmatched участников
- ✅ Сохранение в `zoom_attendance`
- ✅ Детальное логирование каждого участника

#### 8. Отчеты в Mini App
- ✅ Группировка событий по `scheduleEventId`
- ✅ Funnel статистика (registered → clicked → attended)
- ✅ Детальный список гостей
- ✅ Walk-in участники с меткой 🟡
- ✅ Null-safe отображение (duration, questions)
- ✅ Кнопка "🔄 Zoom-Daten aktualisieren"

#### 9. Отчеты в Telegram Bot
- ✅ Команда `/events` — список событий
- ✅ Команда `/report` — детальный отчет
- ✅ Inline keyboard для выбора события
- ✅ Кнопка Zoom Sync в отчете
- ✅ AI Follow-up ассистент (`/followup`)

#### 10. Админка
- ✅ Список всех инвайтов (Invites)
- ✅ Список всех партнеров (Partners)
- ✅ View Details modal с walk-in участниками
- ✅ 9 колонок: Name, Email, Registered, Clicked, Attended, Join Time, Duration, Q&A, Walk-in
- ✅ Ручной Zoom Sync через админку

---

### ❌ ЧТО НЕ РАБОТАЕТ (критические пробелы)

#### 1. ❌ АВТОМАТИЧЕСКОЕ уведомление партнеру после вебинара

**Проблема:**
Партнер НЕ получает уведомление, когда вебинар закончился.

**Что должно быть:**
```
⏰ Webinar beendet: Трейдинг стратегии
📅 20. März, 19:00-21:00

Deine vorläufige Statistik:
📝 Registriert: 8
🔗 Zoom geklickt: 6
⏳ Zoom-Daten noch nicht verfügbar

💡 Tipp: Daten werden ~30 Min nach Ende 
   verfügbar. Ich informiere dich automatisch!

[🔄 Jetzt manuell abrufen]
```

**Текущее состояние:**
- Партнер должен САМ зайти в бот и проверить
- Упускается момент для "горячего" follow-up
- Партнер может забыть проверить

**Что нужно сделать:**
1. Создать background job в `server/integrations/reminder-scheduler.ts`
2. Проверять события, которые закончились ~2 часа назад
3. Отправлять summary партнеру автоматически
4. Помечать событие как "notified_completion = true"

**Примерный код:**
```typescript
// server/integrations/reminder-scheduler.ts
async function checkCompletedWebinars() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  
  const events = await db
    .select()
    .from(inviteEvents)
    .where(
      and(
        eq(inviteEvents.isActive, true),
        eq(inviteEvents.notifiedCompletion, false),
        // event_date + event_time + 2 hours < now
      )
    );
  
  for (const event of events) {
    const partner = await storage.getPartnerById(event.partnerId);
    const stats = await storage.getEventStats(event.id);
    
    await sendMessage(partner.telegramChatId, 
      `⏰ Webinar beendet: ${event.title}\n\n` +
      `📝 Registriert: ${stats.registered}\n` +
      `🔗 Clicked: ${stats.clicked}\n` +
      `⏳ Zoom-Daten werden in ~30 Min verfügbar sein.`
    );
    
    // Mark as notified
    await db.update(inviteEvents)
      .set({ notifiedCompletion: true })
      .where(eq(inviteEvents.id, event.id));
  }
}
```

---

#### 2. ❌ АВТОМАТИЧЕСКАЯ синхронизация Zoom

**Проблема:**
Партнер должен ВРУЧНУЮ нажать "🔄 Zoom-Daten aktualisieren".

**Что должно быть:**
- Через 30-40 минут после окончания вебинара
- Система АВТОМАТИЧЕСКИ вызывает `syncZoomDataForEvent()`
- Отправляет партнеру полный отчет с attendance
- Партнер видит "горячих" лидов сразу

**Текущее состояние:**
- Если партнер забыл нажать кнопку → данные НЕ синхронизируются
- Неудобно для партнера
- Данные устаревают

**Что нужно сделать:**
1. Добавить в background scheduler
2. Через 30 минут после "webinar ended" → запустить sync
3. Отправить результат партнеру:
   ```
   ✅ Zoom-Daten automatisch synchronisiert!
   
   📊 Трейдинг стратегии
   
   ✅ Teilgenommen: 4 von 8 (50%)
   • Иван Петров — 85min, 2 Fragen ⭐
   • Мария Сидорова — 120min, 5 Fragen ⭐⭐
   ...
   
   ❌ No-show: 4
   🆕 Walk-in: 1
   
   [📊 Vollständiger Bericht] [💬 AI Follow-up]
   ```

**Примерный код:**
```typescript
async function autoSyncZoomData() {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  const events = await db
    .select()
    .from(inviteEvents)
    .where(
      and(
        eq(inviteEvents.isActive, true),
        eq(inviteEvents.zoomSynced, false),
        // event ended 30+ minutes ago
      )
    );
  
  for (const event of events) {
    try {
      const result = await syncZoomDataForEvent(event.id, event.zoomLink);
      
      const partner = await storage.getPartnerById(event.partnerId);
      
      // Send detailed report
      await sendMessage(partner.telegramChatId, buildSyncReport(event, result));
      
      // Mark as synced
      await db.update(inviteEvents)
        .set({ zoomSynced: true })
        .where(eq(inviteEvents.id, event.id));
        
    } catch (error) {
      console.error(`Auto-sync failed for event ${event.id}:`, error);
    }
  }
}
```

---

#### 3. ❌ Еженедельный summary для партнера

**Проблема:**
Партнер не получает общий overview своей активности.

**Что должно быть:**
```
📊 Wochenreport: 14.-20. März

Hallo Dennis! 👋

Deine Aktivität:
🔗 Einladungen erstellt: 12
👥 Registrierungen: 45
✅ Teilnahmen: 23 (51% Conversion)

📈 Best Event:
   Трейдинг стратегии
   8 reg → 4 attended (50%)

⚠️ 22 No-shows diese Woche
   💡 Nutze AI Follow-up!

[📊 Detaillierter Report]
```

**Текущее состояние:**
- Ничего
- Партнер не видит общую картину
- Нет мотивации

**Что нужно сделать:**
1. Cron job каждый понедельник 9:00
2. Агрегировать статистику за неделю
3. Отправить summary партнеру

---

#### 4. ⚠️ Walk-in участники не учитываются в funnel conversion

**Проблема:**
Walk-in участники показываются в отчете, но не влияют на конверсию.

**Пример:**
- Registered: 8
- Attended: 4 + 2 walk-in = 6 total
- Conversion: 4/8 = 50% (walk-in не учитываются)

**Правильно или нет?**
Зависит от цели метрики:
- **Для оценки качества лидов партнера** → правильно (считать только его лиды)
- **Для общей статистики вебинара** → неправильно (считать всех)

**Решение:**
Показывать ДВЕ метрики:
```
✅ Deine Gäste: 4 von 8 (50%)
👥 Gesamt Teilnehmer: 6 (inkl. 2 Walk-in)
```

---

#### 5. ⚠️ Нет push-уведомлений в Mini App

**Проблема:**
Все уведомления идут только в Telegram Bot.

**Что могло бы быть:**
- Mini App открыт → показывать badge на иконке Reports
- In-app notification: "Neue Registrierung!"
- Звуковое уведомление (опционально)

**Текущее состояние:**
- Партнер должен переключаться в бота
- Неудобно, если работает в Mini App

**Что нужно:**
1. WebSocket или Server-Sent Events
2. Real-time обновления в Mini App
3. Badge count на tab Reports

---

#### 6. ⚠️ Нет A/B тестирования сообщений

**Проблема:**
Партнер не знает, какое из 2 AI-сгенерированных сообщений лучше.

**Что могло бы быть:**
- Система отслеживает, какое сообщение использовал партнер
- После регистрации проспекта → записывает "message_variant": 1 или 2
- Показывает статистику: "Message 1: 60% conversion, Message 2: 40%"

**Текущее состояние:**
- Генерируется 2 сообщения, но нет tracking
- Партнер не знает, что работает лучше

---

#### 7. ⚠️ Нет автоматического follow-up

**Проблема:**
Партнер должен ВРУЧНУЮ создавать follow-up через `/followup` команду.

**Что могло бы быть:**
- Автоматически через 24 часа после no-show:
  ```
  💬 Auto Follow-up Vorschlag
  
  Петр Иванов hat sich registriert, 
  aber nicht teilgenommen.
  
  AI-generiertes Follow-up:
  "Hi Петр! Schade, dass es gestern 
  nicht geklappt hat. Die Aufzeichnung 
  ist verfügbar: [link]
  
  Nächster Live-Termin: 25. März"
  
  [✓ Senden] [✏ Bearbeiten] [✗ Skip]
  ```

**Текущее состояние:**
- Партнер должен помнить и делать вручную
- Упускаются лиды

---

### 📋 ROADMAP: Что доделать в первую очередь

#### Критично (необходимо для полноценной работы):

1. **✅ Добавить автоматическое уведомление "вебинар закончился"**
   - Время: 2-3 часа
   - Файл: `server/integrations/reminder-scheduler.ts`
   - Добавить поле `notified_completion` в `invite_events` table

2. **✅ Автоматическая синхронизация Zoom**
   - Время: 3-4 часа
   - Файл: `server/integrations/reminder-scheduler.ts`
   - Добавить поле `zoom_synced` в `invite_events` table
   - Через 30 мин после окончания → auto-sync → notify partner

3. **⚠️ Еженедельный summary**
   - Время: 2-3 часа
   - Новая функция в scheduler
   - Cron job: каждый понедельник 9:00

#### Важно (улучшает UX):

4. **Walk-in в конверсии** — показывать 2 метрики (1 час)
5. **Push-уведомления в Mini App** — real-time updates (4-6 часов)
6. **A/B tracking сообщений** — отслеживать варианты (2-3 часа)

#### Nice to have (можно позже):

7. **Автоматический follow-up** — предложения через 24 часа (5-6 часов)
8. **Экспорт в CSV/Excel** — отчеты для анализа (2 часа)
9. **Telegram inline buttons** — быстрые действия прямо из уведомлений (3 часа)

---

### 🔧 Технический долг

1. **❌ Нет обработки timezone для разных регионов**
   - Все времена в CET
   - Если партнер в Москве → путаница

2. **❌ Отсутствует rate limiting на Zoom API**
   - Можно получить 429 ошибку
   - Нужна очередь запросов

3. **❌ Нет retry логики для failed notifications**
   - Если Telegram недоступен → уведомление потеряно
   - Нужна queue с retry

4. **❌ Нет unit/integration тестов**
   - Сложно находить регрессии
   - Рискованно деплоить

---

### 📊 Метрики для мониторинга

**Что нужно отслеживать:**

1. **Партнерская активность:**
   - Сколько инвайтов создано за неделю
   - Сколько партнеров активны (создали хотя бы 1 инвайт)
   - Средний conversion rate по партнерам

2. **Качество лидов:**
   - Registered → Clicked (сколько % доходит до Zoom)
   - Clicked → Attended (сколько % реально приходит)
   - Walk-in ratio (много walk-in = партнер не квалифицирует)

3. **Zoom интеграция:**
   - Сколько % событий синхронизировано
   - Сколько failed syncs
   - Средняя duration участников

4. **AI-инвайты:**
   - Conversion rate: Personal AI vs Social Share
   - Какие DISC-типы конвертируются лучше
   - Какие стратегии (Authority/Opportunity/Curiosity/Support) эффективнее

---

## 📞 Следующие шаги

**Для разработчика:**
1. Прочитать этот документ полностью
2. Реализовать критичные фичи из ROADMAP (1-2)
3. Добавить недостающие поля в БД:
   ```sql
   ALTER TABLE invite_events 
   ADD COLUMN notified_completion BOOLEAN DEFAULT FALSE,
   ADD COLUMN zoom_synced BOOLEAN DEFAULT FALSE;
   ```
4. Протестировать на dev боте

**Для администратора:**
1. Убедиться, что Zoom credentials настроены правильно
2. Проверить, что партнеры получают уведомления
3. Следить за метриками conversion rate

**Для партнера:**
1. Использовать Personal AI Invite для "холодных" контактов
2. Social Share для "теплых" контактов
3. Проверять отчеты после каждого вебинара
4. Использовать AI Follow-up для no-show гостей

---

## 📚 Дополнительные ресурсы

**Файлы кода:**
- `server/partner-app-routes.ts` — Partner App API
- `server/integrations/partner-bot.ts` — Telegram Bot
- `server/integrations/zoom-api.ts` — Zoom интеграция
- `server/integrations/reminder-scheduler.ts` — Background jobs
- `shared/schema.ts` — База данных
- `client/src/pages/partner-app/` — Frontend Mini App

**Environment переменные:**
```bash
# Telegram
TELEGRAM_PARTNER_BOT_TOKEN=...          # Prod bot
TELEGRAM_PARTNER_BOT_TOKEN_DEV=...      # Dev bot
TELEGRAM_PARTNER_BOT_USERNAME=...       # Bot username

# Zoom
ZOOM_ACCOUNT_ID=...
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...

# Email
RESEND_API_KEY=...

# OpenAI (для AI-инвайтов)
AI_INTEGRATIONS_OPENAI_API_KEY=...
AI_INTEGRATIONS_OPENAI_BASE_URL=...

# Feature flags
PARTNER_APP_ENABLED=true
```

**Useful SQL queries:**
```sql
-- Все инвайты партнера
SELECT e.*, COUNT(g.id) as guests_count
FROM invite_events e
LEFT JOIN invite_guests g ON g.invite_event_id = e.id
WHERE e.partner_id = 1
GROUP BY e.id;

-- Conversion rate по партнерам
SELECT 
  p.name,
  COUNT(DISTINCT g.id) as registered,
  COUNT(DISTINCT za.id) as attended,
  ROUND(COUNT(DISTINCT za.id)::numeric / 
        NULLIF(COUNT(DISTINCT g.id), 0) * 100, 1) as rate
FROM partners p
JOIN invite_events e ON e.partner_id = p.id
LEFT JOIN invite_guests g ON g.invite_event_id = e.id
LEFT JOIN zoom_attendance za ON za.invite_guest_id = g.id
GROUP BY p.name
ORDER BY rate DESC;

-- Walk-in участники по событиям
SELECT 
  e.title,
  e.event_date,
  COUNT(*) as walk_ins
FROM zoom_attendance za
JOIN invite_events e ON za.invite_event_id = e.id
WHERE za.invite_guest_id IS NULL
GROUP BY e.id, e.title, e.event_date
ORDER BY e.event_date DESC;
```

---

**Конец документации**

Этот документ содержит полное описание Partner System от А до Я. 
Если остались вопросы — смотрите код в указанных файлах или спрашивайте у разработчика.

