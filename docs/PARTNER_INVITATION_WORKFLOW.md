# Partner Invitation Workflow — Полная архитектура

## Обзор системы

Партнёр приглашает гостей на вебинары JetUP через Telegram Mini App. Вебинары проводятся в Zoom с единой ссылкой для всех гостей и партнёров. Система отслеживает весь путь гостя: от получения приглашения до посещения вебинара и follow-up.

---

## 1. Источник мероприятий

```
Админ-панель (jet-up.ai/admin)
    │
    ├── Создаёт schedule_event:
    │     title, date, time, timezone, speaker,
    │     language, zoom_link, highlights, banner
    │
    └── Сохраняется в таблицу schedule_events
              │
              ▼
    Partner Mini App → GET /api/partner-app/webinars
              │
              ▼
    Фильтр: date >= сегодня → Список предстоящих мероприятий
```

**Таблица:** `schedule_events`
**Ключевые поля:** id, title, date, time, timezone, speaker, link (Zoom), language, highlights

---

## 2. Партнёр выбирает способ приглашения

Из экрана предстоящего мероприятия партнёр выбирает один из двух путей:

```
┌─────────────────────────────────────────────┐
│           ПРЕДСТОЯЩЕЕ МЕРОПРИЯТИЕ           │
│   "Система Дупликации 2.0" — 28.03, 13:00  │
│                                             │
│   ┌─────────────┐   ┌──────────────────┐    │
│   │ Social      │   │ Personal AI      │    │
│   │ Invite      │   │ Invite           │    │
│   └──────┬──────┘   └────────┬─────────┘    │
└──────────┼───────────────────┼──────────────┘
           │                   │
           ▼                   ▼
      Путь A               Путь B
```

---

## Путь A — Social Invite (Массовая ссылка)

### Шаг A1: Создание ссылки

```
Партнёр нажимает "Social Invite"
    │
    ▼
POST /api/partner-app/create-invite
    body: { scheduleEventId }
    │
    ▼
Сервер создаёт invite_event:
    partner_id, schedule_event_id, invite_code (unique),
    zoom_link, title, date, time
    │
    ▼
Возвращает: inviteUrl = /invite/{inviteCode}
    │
    ▼
Партнёр видит ссылку + кнопки "Поделиться":
    Telegram / WhatsApp / Email / Копировать
```

**Таблица:** `invite_events`
**Ключевые поля:** id, partner_id, schedule_event_id, invite_code, zoom_link, is_active

### Шаг A2: Гость открывает ссылку

```
jet-up.ai/invite/{inviteCode}
    │
    ▼
GET /api/invite/{code}
    │
    ▼
InvitePage — лендинг мероприятия:
    • Название вебинара
    • Спикер (фото, имя)
    • Дата, время, таймзона
    • Таймер обратного отсчёта
    • Кнопка "Зарегистрироваться"
```

### Шаг A3: Гость регистрируется

```
Гость заполняет форму:
    name, email, phone
    │
    ▼
POST /api/invite/{code}/register
    invitationMethod = "bulk_link"
    │
    ▼
Создаётся запись invite_guests:
    invite_event_id, name, email, phone,
    guest_token (UUID),
    invitation_method = "bulk_link"
    │
    ├──► Партнёр получает Telegram-уведомление (через Partner Bot):
    │    "Новая регистрация: [Имя] на [Вебинар]"
    │
    └──► Гость видит экран подтверждения:
         • "📧 Link wird per E-Mail gesendet" (по умолчанию)
         • Кнопка "Jetzt Zoom Meeting beitreten" появляется
           только за ≤60 минут до начала вебинара
           и ведёт на /go/{guestToken}
```

**Таблица:** `invite_guests`
**Ключевые поля:** id, invite_event_id, name, email, phone, guest_token, invitation_method, clicked_zoom, go_clicked_at

---

## Путь B — Personal AI Invite (Персональное приглашение)

### Шаг B1: Квалификация гостя

```
Партнёр заполняет информацию о госте:
    │
    ├── Имя проспекта
    ├── Тип: Инвестор / MLM-лидер / Предприниматель / Нейтральный
    ├── Мотивация: Финансовая свобода / Рост / Новые возможности
    ├── Реакция на предложения: Открыт / Скептичен / Аналитичен
    │
    ▼
POST /api/partner-app/generate-invite-messages
    │
    ▼
AI (GPT-4o-mini) определяет:
    • DISC-тип (Dominance / Influence / Steadiness / Conscientiousness)
    • Стратегию приглашения
    • 2 персонализированных сообщения
    │
    ▼
Партнёр видит preview → подтверждает → получает ссылку
```

### Шаг B2: Создание персонального инвайта

```
POST /api/partner-app/create-personal-invite
    │
    ▼
Создаётся personal_invites:
    partner_id, schedule_event_id, invite_code (unique),
    prospect_name, disc_type, motivation_type,
    invite_strategy, generated_messages, chat_history = []
    │
    ▼
Возвращает: inviteUrl = /personal-invite/{inviteCode}
    │
    ▼
Партнёр отправляет ссылку гостю (Telegram / WhatsApp)
```

**Таблица:** `personal_invites`
**Ключевые поля:** id, partner_id, schedule_event_id, invite_code, prospect_name, disc_type, guest_name, guest_email, guest_telegram, telegram_chat_id, viewed_at, registered_at, chat_history, guest_token, go_clicked_at

### Шаг B3: Гость открывает персональную ссылку

```
jet-up.ai/personal-invite/{inviteCode}
    │
    ▼
GET /api/personal-invite/{code}
    • Помечает viewed_at = now()     ← статус "link_opened"
    │
    ▼
PersonalInvitePage — Landing фаза:
    • Название вебинара, дата/время
    • "Тебя лично приглашает [Имя партнёра]"
    • Кнопка "Открыть приглашение"
    │
    ▼
Chat фаза — AI-ассистент:
    • Персонализированные сообщения (по DISC-типу)
    • Quick replies адаптированы под тип личности
    • Общение на языке гостя (RU/DE/EN)
    │
    ▼
Когда гость готов → Inline-форма регистрации:
    name, email, phone (опционально)
    │
    ▼
POST /api/personal-invite/{code}/register
    • registered_at = now()
    • Генерируется guest_token (UUID)
    • Данные синхронизируются в invite_guests
      (invitationMethod = "personal_ai")
    │
    ├──► Партнёр получает Telegram-уведомление (через Partner Bot)
    │
    └──► Гость видит экран подтверждения:
         • "📧 Link wird per E-Mail gesendet" (по умолчанию)
         • Кнопка "Jetzt Zoom Meeting beitreten" появляется
           только за ≤60 минут до начала вебинара
           и ведёт на /go/{guestToken}
```

---

## 3. Статусы гостя (воронка)

```
    ┌─────────────┐
    │   Invited    │ ← партнёр отправил ссылку
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Link Opened │ ← viewed_at (только personal AI)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Chatted   │ ← chat_history не пустой (только personal AI)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Registered  │ ← registered_at заполнен
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Clicked /go │ ← go_clicked_at
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │  Attended   │ ← matched в zoom_attendance
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │  Follow-up  │ ← AI-генерация сообщения
    └─────────────┘
```

---

## 4. Напоминания и `/go/` ссылка

### Telegram-напоминание (реализовано)

```
Гость зарегистрировался → хочет напоминание в Telegram
    │
    ▼
Переходит по deep link:
    t.me/BotName?start=remind_{inviteCode}
    │
    ▼
Бот получает /start remind_{inviteCode}
    • Находит personal_invite по inviteCode
    • Сохраняет telegram_chat_id гостя
    • Отправляет подтверждение:
      "✅ Super! Du erhältst Erinnerungen für das Webinar.
       📅 [Название] 🕐 [Дата] um [Время]"
    │
    ▼
reminder-scheduler.ts (опрос каждые 2 мин):
    Для каждого гостя с reminder_preference:
        • "1_hour"  → отправляет за 60 мин до старта
        • "15_min"  → отправляет за 15 мин до старта
    │
    ▼
Канал отправки (приоритет):
    1. telegram_chat_id (если гость нажал deep link) → прямой чат
    2. guest_telegram (@username)                     → @username
    3. email                                          → email
    │
    ▼
Текст напоминания содержит /go/{guestToken}:
    "🎥 Erinnerung! Das Webinar beginnt in 1 Stunde!
     📅 28.03 | 🕐 13:00 CET
     🔗 Jetzt teilnehmen: https://jet-up.ai/go/{token}"
```

### Переход `/go/:token`

```
Гость кликает /go/{token} (из письма, Telegram или кнопки в приложении)
    │
    ▼
GET /go/:token (server-side)
    • Ищет token в invite_guests (social invite)
    • Ищет token в personal_invites (personal AI invite)
    │
    ├── Найден:
    │     • Записывает go_clicked_at = now()
    │     • 302 Redirect → Zoom-ссылка (из invite_event или schedule_event)
    │
    └── Не найден:
          • 404 HTML-страница с сообщением об ошибке
```

---

## 5. Zoom Sync и атрибуция посещения

```
После вебинара — партнёр нажимает "Sync Zoom"
    │
    ▼
POST /api/partner-app/events/{id}/zoom-sync
    │
    ▼
syncZoomDataForEvent():
    1. Извлечь meetingId из Zoom-ссылки
    2. GET /report/meetings/{meetingId}/participants (Zoom API)
    3. Получить список участников: email, name, join_time, leave_time
    │
    ▼
Алгоритм матчинга (для каждого участника Zoom):

    Приоритет 1: Email
    ┌─ invite_guests.email == participant.user_email? → MATCH ✅
    │
    Приоритет 2: /go/ click timing
    ├─ invite_guests.go_clicked_at ±10 мин от join_time? → MATCH ✅
    │
    Приоритет 3: Не совпал ни один критерий
    └─ → Не привязан к партнёру (walk-in, не отображается в статистике партнёра)
    │
    ▼
Создаётся zoom_attendance:
    invite_guest_id (если совпал), invite_event_id,
    participant_email, participant_name,
    join_time, leave_time, duration_minutes,
    questions_asked, question_texts
```

**Таблица:** `zoom_attendance`
**Ключевые поля:** id, invite_guest_id, invite_event_id, participant_email, participant_name, join_time, leave_time, duration_minutes, questions_asked

> **Важно:** Walk-in гости (не совпавшие ни по email, ни по /go/ клику) не отображаются в статистике партнёра. Партнёр видит только своих гостей.

---

## 6. Что видит партнёр

### Предстоящие мероприятия (UpcomingScreen)

```
┌──────────────────────────────────────────┐
│  Система Дупликации 2.0                  │
│  28.03.2026, 13:00 CET                   │
│  Спикер: Якоб Шмидт                      │
│                                          │
│  📩 AI Invites: 3 отправлено             │
│     └─ 2 открыли / 1 зарегистрировался   │
│  🔗 Social Invites: 5 отправлено         │
│     └─ 2 зарегистрировались              │
│                                          │
│  [Мои приглашения]  ← список контактов   │
│  ┌────────────────────────────────────┐   │
│  │ Макс М.    ✅ Зарег. 🔔 Подписан  │   │
│  │ Анна С.    👁 Открыла  [Follow-up] │   │
│  │ Игорь К.   🔗 Отправлено          │   │
│  └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### Прошедшие мероприятия (PastScreen)

```
┌──────────────────────────────────────────┐
│  Отчёт: Система Дупликации 1.0           │
│  21.03.2026                              │
│                                          │
│  Воронка:                                │
│  Зарегистрировано:  5                     │
│  Перешли по /go/:   4                     │
│  Пришли:            3                     │
│  Конверсия:         60%                   │
│                                          │
│  ┌────────────────────────────────────┐   │
│  │ Макс М.   ✅ Был  45 мин  2 вопр. │   │
│  │ Анна С.   ✅ Была 30 мин          │   │
│  │ Игорь К.  ✅ Был  15 мин          │   │
│  │ Ольга Т.  ❌ Не пришла [Follow-up]│   │
│  │ Денис Р.  ❌ Не пришёл [Follow-up]│   │
│  └────────────────────────────────────┘   │
│                                          │
│  [🤖 AI Follow-up]                       │
└──────────────────────────────────────────┘
```

### Контакты (ContactsScreen)

```
Все гости партнёра из всех мероприятий:
    • Имя, email, телефон
    • Канал связи: Telegram / WhatsApp / Email
    • Статус: Attended / Registered / No-show
    • Рекомендуемое действие: "Follow-up" / "Пригласить на следующий"
```

### Статистика (StatisticsScreen)

```
За 7 дней / 30 дней / Всё время:
    • Всего приглашено: X (только свои гости)
    • Зарегистрировано: Y
    • Пришли: Z (только сматченные, без walk-in)
    • Конверсия: Z/Y × 100%
```

---

## 7. AI Follow-up (после вебинара)

```
Партнёр выбирает контакт → "AI Follow-up"
    │
    ▼
POST /api/partner-app/ai-followup
    body: { message, guestContext: { name, attended, duration, questions } }
    │
    ▼
GPT-4o-mini генерирует персонализированное сообщение:
    • Для attended: "Привет, Макс! Рад что ты был на вебинаре..."
    • Для no-show: "Привет, Макс! Жаль что не получилось прийти..."
    │
    ▼
Партнёр копирует → отправляет через Telegram/WhatsApp
```

---

## 8. Таблицы базы данных — связи

```
schedule_events          (админ создаёт вебинары)
    │
    ├──► invite_events   (партнёр создаёт social invite ссылку)
    │       │
    │       └──► invite_guests  (гость регистрируется)
    │               │
    │               └──► zoom_attendance (Zoom-синк привязывает посещение)
    │
    └──► personal_invites  (партнёр создаёт AI invite)
            │
            └──► invite_guests  (при регистрации данные дублируются сюда)
                    │
                    └──► zoom_attendance
```

---

## 9. Статус задач

| # | Задача | Статус | Что реализовано |
|---|--------|--------|----------------|
| 38 | Auth hardening | ✅ Готово | HMAC validate-init-data, X-Telegram-ID header |
| 40 | Remove Login Widget | ✅ Готово | Убран Telegram Login Widget |
| 41 | invite_guests migration | ✅ Готово | Автомиграции при старте |
| 42 | Guest UX | ✅ Готово | Умный экран после регистрации (email notice + кнопка ≤60 мин) |
| 44 | Stats fix | ✅ Готово | Walk-in убран из партнёрского API |
| 45 | Telegram notifications | ✅ Готово | `/start remind_CODE` бот-хэндлер, планировщик через telegram_chat_id + /go/{token} |
| 46 | /go/ tracking | ✅ Готово | guest_token, /go/:token endpoint, go_clicked_at, time-proximity Zoom matching |
| 43 | Invite tracking | 🔄 В работе | API + UpcomingScreen список контактов per-event со статусами |

---

## 10. Ключевые файлы

| Область | Файл |
|---------|------|
| Схема БД | `shared/schema.ts` |
| Partner Mini App (фронт) | `client/src/pages/partner-app/` |
| Гостевые страницы | `client/src/pages/InvitePage.tsx`, `PersonalInvitePage.tsx` |
| API партнёра | `server/partner-app-routes.ts` |
| API регистрации | `server/routes.ts` |
| Zoom-интеграция | `server/integrations/zoom-api.ts` |
| Напоминания | `server/integrations/reminder-scheduler.ts` |
| Partner Bot | `server/integrations/partner-bot.ts` |
| Переводы | `client/src/contexts/LanguageContext.tsx` |
