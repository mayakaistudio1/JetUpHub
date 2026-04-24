# JetUP — Полный обзор проекта (статус на апрель 2026)

> Один документ, в котором собрано всё, что мы делали в проекте JetUP: цель, что готово, что полу-готово, что ещё не сделано, и мои заметки/комментарии по каждому блоку. Чтобы открыть один файл и сразу понимать, на какой стадии находится проект.
>
> **Дата:** 20 апреля 2026
> **Источник истины:** код в этом репозитории + `replit.md` + `architecture.md` + история задач в `.local/tasks/`.

---

## 0. Видение проекта

**JetUP Digital Hub & Partner Platform** — это центральный цифровой хаб для финансовой экосистемы JetUP. Одно приложение объединяет:

- маркетинговый онбординг (лендинги, AI-консультанты, видео);
- партнёрский CRM (Telegram-бот + Mini App, приглашения, статистика, посещаемость Zoom);
- акции и заявки (Dennis Promo, верификация);
- админку и аналитику.

**Слоган:** «Struktur. Transparenz. Kontrolle.» / «Структура. Прозрачность. Контроль.»

**Аудитория:** немецко- и русскоговорящие пользователи, интересующиеся трейдингом, копи-трейдингом и партнёрским доходом.

**Языки UI:** DE, RU, EN.

**Стек (кратко):** React 19 + Vite 7 + Tailwind v4 + shadcn/ui на фронте, Node.js 20 + Express 5 + Drizzle ORM + PostgreSQL на бэке. Деплой — Replit.

Подробнее по архитектуре: `replit.md`, `architecture.md`, `docs/PARTNER_SYSTEM_ARCHITECTURE.md`, `docs/presentation-architecture.md`, `JETUP_BRAND_KNOWLEDGE.md`, `JETUP_LANDING_KNOWLEDGE.md`.

---

## Оглавление

1. [Главный хаб и навигация](#1-главный-хаб-и-навигация-)
2. [Maria AI — текстовый чат и видео-аватар](#2-maria-ai)
3. [Sofia AI — голосовой LiveAvatar для DE](#3-sofia-ai-livekit-overlay-de)
4. [Лендинг `/explore` — Desktop Premium Landing](#4-лендинг-explore--desktop-premium-landing)
5. [`/ai-landing` и `/presentation` (HeyGen Interactive)](#5-ai-landing-и-presentation-heygen-interactive)
6. [Partner Telegram Bot](#6-partner-telegram-bot)
7. [Partner Mini App (4 таба)](#7-partner-mini-app-4-таба)
8. [Personal Invite — пайплайн приглашений](#8-personal-invite--пайплайн-приглашений)
9. [Social Invite — общая ссылка на событие](#9-social-invite--общая-ссылка-на-событие)
10. [Email-уведомления (Resend)](#10-email-уведомления-resend)
11. [Zoom — учёт посещаемости вебинаров](#11-zoom--учёт-посещаемости-вебинаров)
12. [Вебинары и расписание (`/schedule`)](#12-вебинары-и-расписание-schedule)
13. [Видео-библиотека / туториалы (`/tutorials`)](#13-видео-библиотека--туториалы-tutorials)
14. [Promo: Dennis Fast Start + Promo Verification Admin](#14-promo-dennis-fast-start--promo-verification-admin)
15. [Partner Digital Hub (`/dennis`, `/p/:slug`)](#15-partner-digital-hub-dennis-pslug)
16. [Админ-панель (`/admin`)](#16-админ-панель-admin)
17. [HQ Read-Only API для маркетингового штаба](#17-hq-read-only-api-для-маркетингового-штаба)
18. [Многоязычность DE/RU/EN](#18-многоязычность-deruen)
19. [Object Storage и медиа-ассеты](#19-object-storage-и-медиа-ассеты)
20. [Brand Knowledge Pack и HeyGen-агент-Repl](#20-brand-knowledge-pack-и-heygen-агент-repl)
21. [AMA — вопросы пользователей](#21-ama--вопросы-пользователей)
22. [Что я бы делал дальше (приоритеты)](#22-что-я-бы-делал-дальше-приоритеты)

---

## 1. Главный хаб и навигация (`/`)

**Цель.** Точка входа: пользователь приходит на короткую ссылку и за один экран видит, куда ему дальше — Maria, трейдинг, партнёрка, акции, вебинары, туториалы.

**Что готово.**
- Главная `/` со всеми основными карточками (Trading, Partner, Promo, Schedule, Tutorials).
- Smart Linktree на внешние ресурсы (Telegram-канал, Instagram, Google Drive с презентациями).
- Дополнительные страницы-хабы: `/trading` (TradingHubPage), `/partner` (PartnerHubPage), `/promo`, `/schedule`, `/tutorials`, `/maria`.
- Отдельные карточки записей вебинаров и социальные иконки (задачи #57, #58).
- TabBar на главной и на странице Maria.

**Что полу-готово / в работе.** Контент карточек хорошо отлажен на DE и RU, EN местами тянет тексты по умолчанию.

**Что не сделано.** Глобального редизайна главной не планировали; пока всё держится на mobile-first стиле и хорошо работает.

**Файлы:** `client/src/pages/HomePage.tsx`, `TradingHubPage.tsx`, `PartnerHubPage.tsx`, `LinksPage.tsx`. Архитектурная карта — `architecture.md`.

**Мои заметки.**
- Хаб давно «устаканился», большой работы по нему не ведётся.
- Главный риск — текст на главной должен оставаться в синхронизации с Maria/Sofia (они ссылаются на эти разделы). При смене формулировок в продуктах надо обновлять и system-prompt'ы.

---

## 2. Maria AI

**Цель.** Универсальный AI-ассистент по экосистеме JetUP: отвечает на вопросы про продукты, трейдинг, партнёрку, помогает с навигацией, может перейти в видео-аватар.

**Что готово.**
- Текстовый чат (GPT-4o-mini, SSE-стрим) на странице `/maria` — три языка (DE/RU/EN), system-prompt'ы в `server/integrations/maria-chat.ts` (`MARIA_SYSTEM_PROMPT_DE/EN/RU`).
- Видео-аватар через HeyGen LiveAvatar поверх LiveKit WebRTC (`server/integrations/liveavatar.ts`).
- Все диалоги пишутся в БД (`chat_sessions`, `chat_messages`) и доступны в админке.
- Гайдед-режим (Guided Mode) с интерактивными кнопками и push-to-talk (#68, #69).
- Maria также появляется в режиме «recruiting» на `/explore` (#110).
- Анализ диалогов через админку, экспорт, ручная правка промптов из UI (#59).

**Что полу-готово / в работе.**
- База знаний Maria — собрана (`docs/maria-knowledge-base.md`, `docs/maria-prompts-updated.md`), но в задачах #60 и #61 (правка промптов и аудит знаний) мы остановились — оба отменены, значит формально цикл доработки не закрыт.
- Качество ответов на EN держится на «хорошо», но не отшлифовано так, как DE.

**Что не сделано / открытые вопросы.**
- Нет автоматических метрик качества (CSAT, off-topic rate, hand-off rate).
- Нет автотестов на промпты — любая правка может незаметно ухудшить ответы.

**Файлы:** `server/integrations/maria-chat.ts`, `server/integrations/liveavatar.ts`, `client/src/pages/MariaPage.tsx`, `docs/maria-*.md`.

**Мои заметки.**
- Maria — самый «зрелый» AI-блок: работает, логируется, есть админка, Sheets-синхронизация диалогов (#59).
- Если хотите серьёзно улучшать — сначала надо завести небольшой регрессионный набор «тестовых вопросов» и прогонять его руками после каждой правки промпта. Иначе доработки идут вслепую.
- Я бы аккуратно перечитал DE-prompt и проверил, не врёт ли он в цифрах (комиссии, проценты, минималки) — это часто меняющиеся величины.

---

## 3. Sofia AI (LiveKit overlay, DE)

**Цель.** Премиальный голосовой/видео гид на немецком: единый «персонаж бренда», который сопровождает пользователя по всем страницам (`/explore` → `/presentation` → `/hub` → `/trading`), а не сидит в одном чате как Maria.

**Что готово.**
- Persistent overlay через `SofiaSessionProvider` в корне приложения (вне Routes) — одна и та же LiveKit-сессия живёт между переходами.
- Backend-ветка `persona="sofia"` в `server/integrations/liveavatar.ts` + прокси `server/integrations/sofia-proxy.ts`.
- Конфиг через переменные окружения: `SOFIA_AVATAR_ID`, `SOFIA_VOICE_ID_{DE|EN|RU}`, `SOFIA_CONTEXT_ID_{DE|EN|RU}`, опционально `SOFIA_LLM_CONFIG_ID`, `SOFIA_SANDBOX_MODE`.
- Graceful fallback: если env-переменные не заданы — `/api/sofia/config` возвращает `enabled:false`, и старый «Maria-landing» работает как ни в чём не бывало.
- Логирование: транскрипты + посещённые страницы пишутся в таблицу `sofia_sessions` (поля `messages`, `pagesVisited`, `userType`, `finalPhase`, `energyLevel`, `exitAction`).
- Keep-alive каждые 120 секунд, чтобы не упираться в HeyGen-таймаут 5 минут.
- Готовы черновики промптов: `sofia-prompt-de.md`, `-v2.md`, `-v3-draft.md`.

**Что полу-готово / в работе.**
- **Задача #135 (Sofia — голосовой гид по Explore)** — в Drafts: концепт описан, частично реализован.
- **Задача #137 (Sofia на /explore + persistent overlay)** — Drafts: persistent-механизм есть, но финальный сценарий поведения на /explore не закрыт.
- **Задача #139 (Sofia Voice→Text Handoff at Video)** — Drafts: при просмотре длинного видео нужно красиво переключать голос → текст.
- Промпт Sofia версии v3 — пока черновик, в продакшене стоит более ранняя версия.

**Что не сделано / открытые вопросы.**
- **Задача #138 (починить navigate actions — Sofia говорит, но не ведёт)** — известный баг: голосовая команда «давай посмотрим презентацию» произносится, но фактического перехода по маршруту не происходит. Нужно срочно.
- Нет аналитики поверх `sofia_sessions`: какие пользователи где «отваливаются», какая средняя длина сессии, какой `exitAction` чаще всего.
- Sofia формально только DE — RU/EN-голоса в env заведены, но контент-сценариев нет.

**Файлы:** `server/integrations/liveavatar.ts`, `server/integrations/sofia-proxy.ts`, `client/src/pages/ExplorePage.tsx`, `shared/schema.ts:380-401` (`sofia_sessions`).

**Мои заметки.**
- Технически Sofia — **самый сложный** блок проекта: WebRTC, LiveKit, HeyGen, SSE, persistent state, env-фолбэки. Поэтому ломается чаще всего.
- Приоритет №1 по Sofia — закрыть #138 (`navigate` works), потом #139 (handoff на видео), потом отполировать промпт.
- Логично сначала навести порядок в навигации, потом докрутить контент. Иначе мы будем переписывать сценарии под сломанную механику.
- Стоит добавить мини-дашборд по `sofia_sessions` в админке — без него улучшать промпт практически вслепую.

---

## 4. Лендинг `/explore` — Desktop Premium Landing

**Цель.** Публичный «продающий» лендинг для холодного трафика и рекрутинга партнёров. Кинематографичная подача JetUP как «архитектуры роста». Без подробных таблиц комиссий — высокий уровень.

**Что готово.**
- Маршрут `/explore` (публичный, без DEV-гейта), файл `client/src/pages/ExplorePage.tsx`.
- Восемь актов: Hero (split + welcome video) → The Shift → The Product → The Difference → Partner Model → AI Advantage (Maria showcase + переключатель режимов) → Toolkit → Final CTA.
- Видео-интро `/videos/jetup-intro.mp4` (muted autoplay, оптимизировано — #120).
- Полная многоязычность DE/RU/EN (#100), мобильная адаптация (#102), правки русских багов (#119).
- AI-слой recruiting (Text/Voice/Live Avatar) на /explore (#110), application form, footer.
- Юридические модалки Impressum/Terms/Privacy (#117).
- Документ контента `docs/explore-content.md` и LANDING_REVIEW (`LANDING_REVIEW.md`).

**Что полу-готово / в работе.**
- **Задача #90 (Desktop Premium Landing — мокап на канвасе)** — Drafts: хочется проработать новый макет в mockup-sandbox, прежде чем менять прод.
- Контент-блоки сейчас «абстрактные» (после #98) — это даёт премиум-эффект, но кому-то не хватает конкретики; вопрос баланса.

**Что не сделано / открытые вопросы.**
- Нет A/B-тестов и счётчика конверсии в заявку — мы не знаем, какой акт «отваливает» пользователя.
- Нет привязки к реальному CRM по UTM-меткам (заявки приходят в админку, но без атрибуции).

**Файлы:** `client/src/pages/ExplorePage.tsx`, `docs/explore-content.md`, `JETUP_LANDING_KNOWLEDGE.md`, `LANDING_REVIEW.md`.

**Мои заметки.**
- Лендинг — наша «вывеска». Он визуально хорош, но без аналитики мы летим по приборам.
- До запуска любого нового трафика стоит подключить хотя бы Plausible/PostHog и отметить ключевые ивенты (видео сыграно, форма заполнена, CTA нажат).
- #90 имеет смысл делать на mockup-sandbox (канвас), не трогая прод — пока не утвердим.

---

## 5. `/ai-landing` и `/presentation` (HeyGen Interactive)

**Цель.**
- `/ai-landing` — внутренний кинематографичный лендинг про «JetUP × AI × Recruiting» для демонстраций и продаж.
- `/presentation` — интерактивная HeyGen-презентация с фиолетовым ребрендингом.

**Что готово.**
- `/ai-landing` (Dev-only, гейт `import.meta.env.DEV`), файл `AILandingPage.tsx`. Hero (typewriter), Problem, Before/After, AI Infrastructure, Maria Chat (имитация), Formula + CTA. Полностью адаптивен (#73).
- `/presentation` — интерактивная презентация. Перекрашена в фиолет/magenta (#140), интегрирована HeyGen Interactive (#141), есть RU/EN (#113).
- Editorial-redesign оверлея презентации (`presentation-overlay-editorial-redesign.md`).
- Экспорт слайдов в папку для HeyGen (#123, #125, #126, #127, #129).

**Что полу-готово / в работе.**
- Решение «выбор Classic / Interactive на /explore» — отменено (#142, #143). Текущая стратегия: показывать Interactive только тем, кому действительно нужно, без switcher'а.
- Голос/нарратор для слайдов — частично (#124 отменена, #128 закрыта со скриптами, #130/#131 отменены). То есть скрипты есть, авто-озвучки и авто-аплоада в облако пока нет.

**Что не сделано / открытые вопросы.**
- `/ai-landing` спрятан за DEV-гейтом — для публичного промо нужно решить, выводить его в прод или оставить как внутренний инструмент.
- Нет единого «навигатора» между `/explore`, `/ai-landing`, `/presentation` — это три отдельных опыта, между ними легко «потерять пользователя».

**Файлы:** `client/src/pages/AILandingPage.tsx`, `client/src/pages/PresentationPage.tsx`, `docs/presentation-architecture.md`, `docs/presentation-guide.md`, `docs/presentation_structure.md`.

**Мои заметки.**
- HeyGen Interactive (#141) — потенциально «вау-фича», но дорогая по поддержке. Не стоит вкладываться, пока нет стабильного продакшен-сценария.
- `/ai-landing` стоит либо публиковать с трафиком, либо переименовать в `/demo` и использовать как презентацию для встреч 1-на-1.

---

## 6. Partner Telegram Bot

**Цель.** Точка входа партнёра. Бот авторизует партнёра, отправляет уведомления (новый гость, напоминания), даёт быстрые команды и открывает Mini App.

**Что готово.**
- Бот: команды `/start` (открывает Mini App или ловит deep-link `remind_CODE`), `/invite`, `/events`, `/report`.
- Уведомления партнёрам: о регистрации гостя, о напоминаниях.
- **Многоязычность (DE/EN/RU)**: автодетект по Telegram `language_code`, сохранение в `partners.language`, тексты в `server/integrations/partner-bot-texts.ts` (#77).
- AI follow-up в боте (отвечает на языке партнёра).
- Auto-launch Mini App (#25).
- Уведомления гостям после регистрации (#45), отчёты по вебинарам (#36, #37).

**Что полу-готово / в работе.**
- **Задача #6 (Fix production bot webhook & Zoom test scopes)** — Drafts: на проде есть проблема с вебхуком + неполные Zoom-скоупы для тестового приложения.
- **Задача #20 (Разделение dev/prod Telegram-ботов партнёров)** — Drafts: сейчас один бот, нет чистого разделения окружений.
- **Задача #8 (Setup @Jetup_partner_test_bot for Dev Environment)** — Drafts: связана с #20, нужен отдельный test-бот.
- **Задача #17 (/invite opens Partner Mini App)** — Drafts: команда `/invite` должна напрямую открывать соответствующий экран Mini App.

**Что не сделано / открытые вопросы.**
- Нет дашборда «здоровье бота» (последний апдейт, ошибки доставки сообщений).
- Нет регламента по кратким командам (часть партнёров просит `/help`, `/me`).

**Файлы:** `server/integrations/partner-bot.ts`, `server/integrations/partner-bot-texts.ts`, `server/integrations/telegram-notify.ts`.

**Мои заметки.**
- Бот стабильный, но **#6 + #20 + #8 — связанная тройка**, которую я бы делал одной волной перед следующим деплоем (#4). Иначе тестировать продовые сценарии больно — мешаются.
- AI follow-up хорош, но нет лимита по токенам/частоте — стоит поставить дешёвую защиту.

---

## 7. Partner Mini App (4 таба)

**Цель.** Партнёрский CRM прямо в Telegram: события, контакты, статистика, профиль.

**Что готово.**
- **Auth:** Telegram WebApp `initData` (HMAC-проверка) + dev-fallback `x-partner-auth: id:<chatId>` (#18, #38, #40).
- **Tab «Upcoming Events»:** список событий со статистикой, личные приглашения, social share, AI Personal Invite (#43).
- **Tab «Contacts»:** агрегированные данные по гостям, статус канала напоминания, клик `/go/`, посещаемость, AI follow-up (#47).
- **Tab «Statistics»:** lifetime totals по приглашениям/регистрациям/посещениям (#29).
- **Tab «Profile»:** просмотр и редактирование профиля.
- Регистрация нового партнёра в Mini App (#18).
- Фиксы текстовых полей в iOS-Telegram (#76, #79).
- Полный аудит Mini App: `docs/partner-miniapp-audit.md` (#33).

**Что полу-готово / в работе.**
- **Задача #21 (Фикс Email Sent синхронизации + фильтрация прошедших событий)** — Drafts.
- **Задача #22 (Personal Invite — статистика + навигация + выбор канала напоминания)** — Drafts.
- **Задача #19 (Invite Preview, Multi-language & Visit Tracking)** — Drafts.

**Что не сделано / открытые вопросы.**
- Нет push-уведомлений об открытии/просмотре приглашения гостем.
- Нет экспорта списка контактов (CSV) — частая просьба активных партнёров.

**Файлы:** `client/src/pages/partner-app/`, `server/partner-app-routes.ts`.

**Мои заметки.**
- Mini App — реально рабочий инструмент, не «макет». Сильнее всего просит #21 и #22 — это про доверие к цифрам и удобство партнёра.
- Перед #4 (деплой) стоит закрыть как минимум #21, чтобы статистика на проде была верной.

---

## 8. Personal Invite — пайплайн приглашений

**Цель.** Партнёр персонально приглашает гостя на конкретный вебинар; AI помогает с квалификацией и текстом приглашения; гость регистрируется и получает напоминания.

**Что готово.**
- Создание инвайта в Mini App: prospect-форма + опциональная DISC-квалификация + AI-генерация сообщения (#13, #14).
- Публичная страница `personal-invite/:code` с AI-чатом (GPT-4o-mini, SSE), inline-форма регистрации (#31).
- На регистрации: подтверждающее письмо (Resend) + Telegram-DM партнёру (#27, #45).
- Success-screen: предложение подписаться на Telegram, если выбран канал «Telegram» (#23).
- Reminder Scheduler: 24h и 1h напоминания (email или Telegram) — `server/integrations/reminder-scheduler.ts` (#24).
- `/go/{guestToken}` — трекинг клика и редирект на Zoom (#46, #48).
- Чат с гостем хранится в `personalInvites.chatHistory`.
- Per-contact трекинг и social-share (#43, #44).

**Что полу-готово / в работе.**
- См. #19, #21, #22 (выше): нужно докрутить статистику и фильтрацию прошедших событий, multi-language preview.

**Что не сделано / открытые вопросы.**
- Нет UI для «мягкой» отмены инвайта гостем (например, «не смогу прийти, перенесите меня»).
- Нет автогенерации follow-up-сообщения после вебинара по тем, кто не пришёл.

**Файлы:** `server/partner-app-routes.ts`, `server/integrations/reminder-scheduler.ts`, `client/src/pages/PersonalInvitePage.tsx`, `shared/schema.ts:284-331`.

**Мои заметки.**
- Это **главный value-driver** платформы для партнёров. Почти всё работает.
- Дальнейшее развитие — не «ещё одна фича», а аналитика воронки: invite created → opened → registered → joined Zoom → stayed N min. У нас все данные уже есть в БД, нужен дашборд.

---

## 9. Social Invite — общая ссылка на событие

**Цель.** Партнёр шарит одну ссылку на вебинар в чат/канал, по ней регистрируются несколько гостей.

**Что готово.**
- Public landing для социальной регистрации.
- Учёт регистраций: фиксируется, что гость пришёл по social-share (`invitationMethod`), а не личным приглашением.
- Корректная стата: walk-ins исключаются из персональной статистики партнёра (#44).

**Что полу-готово / в работе.** Стабильно, активных задач нет.

**Что не сделано / открытые вопросы.**
- Нет brand-кастомизации страницы под конкретного партнёра (логотип, фото).

**Файлы:** `client/src/pages/InvitePage.tsx`, `server/partner-app-routes.ts`.

**Мои заметки.** Меньше фич — меньше багов. Я бы оставил как есть до запроса от партнёров.

---

## 10. Email-уведомления (Resend)

**Цель.** Транзакционная почта: подтверждения регистрации, напоминания, верификация промо, «нет денег на счёте».

**Что готово.**
- Все шаблоны живут в `server/integrations/resend-email.ts` (~31 KB — заметно крупный файл).
- Подтверждение регистрации гостя.
- 24h и 1h напоминания (через reminder-scheduler).
- Promo verification email (#1, #62).
- No Money email (#62, #67) — отправляется, когда партнёр на проверке оказался с пустым счётом.
- Письма используют `/go/{token}` вместо прямых Zoom-ссылок (#48).

**Что полу-готово / в работе.**
- **Задача #3 (Fix email sending on promo approval)** — Drafts: где-то теряется письмо при апруве промо.
- **Задача #28 (No Money Email for Promo Applications)** — Drafts: продолжение #62, нужно докрутить шаблон/логику.

**Что не сделано / открытые вопросы.**
- Нет ретраев при ошибках Resend (упало → потеряли письмо).
- Нет «inbox preview» в админке — приходится тестировать на живых ящиках.

**Файлы:** `server/integrations/resend-email.ts`, `server/integrations/reminder-scheduler.ts`.

**Мои заметки.**
- Файл `resend-email.ts` стоит распилить на модули по типам писем — он быстро растёт и в нём легко что-то сломать.
- Перед #4 (деплой) обязательно закрыть #3, иначе пользователи не получают подтверждения.

---

## 11. Zoom — учёт посещаемости вебинаров

**Цель.** После вебинара забрать данные участников из Zoom и привязать их к нашим гостям → партнёр видит, кто реально пришёл.

**Что готово.**
- Server-to-Server OAuth с Zoom API (#5).
- `server/integrations/zoom-api.ts` + scheduler `zoom-sync-scheduler.ts`: после события автоматически тянем участников.
- Матчинг по `inviteGuestId` или по email → запись в `zoom_attendance` (поля `joinTime`, `leaveTime`, `durationMinutes`, `questionsAsked`, `questionTexts`).
- Авто-переход события в «прошедшее» + sync (#80).
- Защита от повторных синков для прошедших событий (#34).

**Что полу-готово / в работе.**
- **Задача #6 (Fix production bot webhook & Zoom test scopes)** — на проде неполные scopes у Zoom-приложения.

**Что не сделано / открытые вопросы.**
- Нет UI «в каком вебинаре сколько вопросов задал гость» (данные в `questionTexts` есть, но не выведены).

**Файлы:** `server/integrations/zoom-api.ts`, `server/integrations/zoom-sync-scheduler.ts`, `shared/schema.ts:262-282`.

**Мои заметки.**
- Это редкая, но «золотая» фича для партнёра — закрытие петли (приглашён → пришёл).
- #6 надо чинить как часть продового релиза, иначе на проде у нас «слепое пятно».

---

## 12. Вебинары и расписание (`/schedule`)

**Цель.** Публичный календарь Zoom-созвонов: шеринг, фильтры, многоязычность.

**Что готово.**
- Страница `/schedule` (PartnerSchedulePage), детальная `/event/:id` (EventDetailPage).
- Автогенерируемые баннеры, бейджи (Trading/Partner/AMA, язык, Zoom).
- Тройной формат времени (Berlin | MSK | Dubai) с DST-корректировкой (#74).
- Шеринг (Telegram, WhatsApp, копировать).
- Highlights в plain text (#75).
- Multilingual events + action link button (#92).
- AMA: multilang events + pre-questions в Mini App (#91).
- Объединение записей вебинаров с видео-библиотекой (#88).

**Что полу-готово / в работе.** См. #21 (фильтрация прошедших).

**Что не сделано / открытые вопросы.**
- Нет рекуррентных событий («каждый вторник в 19:00 Berlin») — каждый вебинар заводится вручную.

**Файлы:** `client/src/pages/partnerSchedulePage.tsx`, `client/src/pages/EventDetailPage.tsx`, `shared/schema.ts:160-189`.

**Мои заметки.** Расписание — рабочий инструмент, но как только число событий вырастет (>20 в неделю), админка станет неудобной. Тогда нужны рекуррентные шаблоны.

---

## 13. Видео-библиотека / туториалы (`/tutorials`)

**Цель.** Обучающие видео (YouTube Shorts) с фильтрами по языку и категории, плюс встраивание роликов прямо в Trading/Partner-разделы.

**Что готово.**
- Таблица `tutorials` (DE/RU/EN, категории `bonuses`/`strategies`/`partner-program`/`getting-started`, `topicTags`).
- Страница `/tutorials` с фильтрами (Trader / Partner).
- Видео-слой Mini Hub: ролики появляются inline в нужных секциях, если есть для топика+языка (#83).
- Админ: автозаполнение метаданных по YouTube-URL (#84), bulk-import (#85).
- DE-видео (#83), EN-туториалы синхронизированы в продовую БД (#114), RU-библиотека (#115).
- Объединение записей вебинаров (#88).

**Что полу-готово / в работе.** Нет активных задач.

**Что не сделано / открытые вопросы.**
- Нет аналитики «какое видео реально досмотрели».
- Нет встроенного «watch later» / избранного.

**Файлы:** `client/src/pages/TutorialsPage.tsx`, `shared/schema.ts:333-353`.

**Мои заметки.** Хороший «evergreen»-актив. Если хочется усиления — нужен реактивный плейлист «следующее видео по теме».

---

## 14. Promo: Dennis Fast Start + Promo Verification Admin

**Цель.** Маркетинговые акции (Dennis 100+100 и др.): пользователь подаёт заявку с CU-номером → проверка → подтверждение → email.

**Что готово.**
- Таблица `dennis_promos` + `promo_applications` (`pending`/`approved`/`rejected`/`duplicate`/`retry`/`no_money`).
- Публичная подача `/api/partner/promo-apply` с CU-валидацией, дедуп-проверкой (исключая no_money), детектом «retry-after-topup» (#35).
- Telegram-уведомления админу + Google Sheets append (#62, #63, #67).
- Админ-флоу: одобрить → отправить email (Resend) → отметить `email_sent_at` → синк в Sheets.
- «No Money» кнопка в админке + отдельное письмо (#62).
- Цветовая маркировка статусов в Sheets, немецкий язык (#67).
- Аккордеон карточек на странице промо (#87).
- Turkey Promo (предпросмотр в `client/src/pages/TurkeyPromoPreview.tsx`).

**Что полу-готово / в работе.**
- **Задача #7 (Promo Verification Admin Panel /promo-admin)** — Drafts: уже есть отдельный `/promo-admin` с табами по статусам (#64), но финальная полировка/документация ещё в работе.
- **Задача #28 (No Money Email for Promo Applications)** — Drafts.
- **Задача #39 (Turkey Promo — Update content & redesign assets)** — Drafts.

**Что не сделано / открытые вопросы.**
- Поллер верификации (`promo-verification-poller.ts`) формально есть, но реальная автоматическая верификация по внешней системе пока не подключена — финальное решение «approve/reject» делает человек.
- Нет лимита подачи заявок (один email — N раз в N часов).

**Файлы:** `server/routes.ts:182-477`, `server/integrations/resend-email.ts`, `server/integrations/promo-verification-poller.ts`, `client/src/pages/PromoAdminPage.tsx`.

**Мои заметки.**
- Это **самый «бизнес-критичный» поток**: касается денег, доверия и репутации Dennis.
- Связка #3 (email при approval) + #28 (no-money письмо) + #7 (полировка админки) + #39 (Turkey Promo) — логичный пакет к следующему релизу.

---

## 15. Partner Digital Hub (`/dennis`, `/p/:slug`)

**Цель.** Персонализированная посадочная партнёра: «свой Maria», своя презентация, свой ecosystem map.

**Что готово.**
- State machine: HERO → CHAT_OVERLAY → PRESENTATION_OVERLAY → ECOSYSTEM_OVERLAY.
- AI-чат на GPT-4o-mini (SSE), интерактивные слайды презентации с видео-фонами и картой экосистемы.
- Многоязычность DE/RU/EN.
- Презентация перекрашена в фиолет/magenta (#140), HeyGen Interactive вшит (#141).

**Что полу-готово / в работе.** Нет активных задач.

**Что не сделано / открытые вопросы.**
- Хаб «жёстко» под Dennis. Чтобы дать другим партнёрам — нужно вынести `slug → contentSet` в админку.

**Файлы:** `client/src/pages/PartnerDigitalHub.tsx`, `client/src/pages/PresentationPage.tsx`, `server/integrations/dennis-chat.ts`.

**Мои заметки.** Если планируем «масштабировать» хабы на других партнёров — это отдельный продукт, а не feature. Сейчас работает как кастомный showcase для Dennis.

---

## 16. Админ-панель (`/admin`)

**Цель.** Закрытое управление контентом и операциями: акции, события, спикеры, заявки, видео, партнёры, чат-логи.

**Что готово.**
- Парольная защита (`ADMIN_PASSWORD`), rate-limit на login.
- Управление: chat logs (#59), promotions, events, speakers, promo applications, invite events, partners, videos.
- Mobile-responsive (#89).
- Анализ диалогов Maria + экспорт + ручная правка промптов (#59).
- Bulk import видео (#85), автозаполнение по YouTube (#84).

**Что полу-готово / в работе.**
- **Задача #86 (Admin Translation Editor)** — Drafts: единый редактор переводов прямо в админке.

**Что не сделано / открытые вопросы.**
- Нет ролей (всё под одним паролем).
- Нет журнала действий («кто что менял»).

**Файлы:** `client/src/pages/AdminPage.tsx`, `client/src/pages/PromoAdminPage.tsx`, `server/routes.ts`.

**Мои заметки.** Один общий пароль — нормальный compromise для текущего масштаба, но как только подключим внешних людей (#86 + контент-менеджеры), нужны хотя бы простые роли.

---

## 17. HQ Read-Only API для маркетингового штаба

**Цель.** Внешний маркетинговый Repl («HQ») должен видеть, что происходит в JetUP, но **только читать** и без PII.

**Что готово.**
- `/api/hq/*` — Bearer-token (`HQ_READONLY_TOKEN`), GET-only (#147).
- Эндпоинты: Sofia/Maria sessions + транскрипты, текущие промпты (с источником override), partners, promo applications, events + Zoom attendance, personal invites, контент (tutorials/speakers/promos/translations), object storage files, метрики overview.
- Маскировка PII (email/phone/telegram), rate-limit 60 req/min/token.
- Public `GET /api/hq/_health` — только liveness.
- Контракт API: `docs/hq-api.md`.

**Что полу-готово / в работе.** Нет.

**Что не сделано (отменено).**
- #148 (live updates / push вместо поллинга) — отменено.
- #149 (UI ротации токена) — отменено.
- #150 (автотесты на API) — отменено.

**Файлы:** `server/integrations/hq-readonly.ts` (~26 KB), `docs/hq-api.md`.

**Мои заметки.**
- Сейчас HQ работает по pull-модели (опрос). Если HQ начнёт расти и опрашивать часто — задумаемся об #148.
- Отсутствие автотестов (#150) — реальный риск: эндпоинт большой и легко сломать молча. Стоит хотя бы добавить smoke-тест health + структуру одного-двух ответов.

---

## 18. Многоязычность DE/RU/EN

**Цель.** Один продукт, три языка. Пользователь не должен видеть «полу-перевод».

**Что готово.**
- Все основные страницы переведены: HomePage, Trading, Partner, Schedule, Tutorials, Promo, Maria, Personal Invite.
- `/explore` интернационализирован (#100), мобильно адаптирован (#102), баги RU исправлены (#119), видео-плейлисты RU добавлены (#115), EN-туториалы (#114).
- Partner Bot — автодетект языка партнёра (#77).
- Контент с `translationGroup` для events/promos: один логический объект на трёх языках.

**Что полу-готово / в работе.**
- **Задача #86 (Admin Translation Editor)** — Drafts: сейчас переводы редактируются в БД/коде, нужен UI.
- DE прокачан лучше всех, EN — местами «функционально», но не «премиум».

**Что не сделано / открытые вопросы.**
- Нет fallback-логики «если перевода нет — показать DE» (где-то падает на исходный язык записи).

**Мои заметки.** #86 — давно назревший must, особенно если будут внешние переводчики.

---

## 19. Object Storage и медиа-ассеты

**Цель.** Хранилище для фото спикеров, баннеров промо/событий, B-Roll, slide-экспортов и т. п.

**Что готово.**
- Replit Object Storage (`@replit/object-storage`).
- Эндпоинты `/uploads/:filename` и `/assets/:filename` через `objectStorage.searchPublicObject` + `downloadObject`.
- Аплоад через `multer` (in-memory, до 5MB, расширения jpg/jpeg/png/webp).
- Использование `PUBLIC_OBJECT_SEARCH_PATHS` и `PRIVATE_OBJECT_DIR`.
- B-Roll templates (#70, #71, #72).

**Что полу-готово / в работе.** Нет активных задач.

**Что не сделано / открытые вопросы.**
- Нет CDN-инвалидации, нет автоматических ресайзов (один большой файл и для thumbnail, и для full).
- 5MB лимит — для slide-экспортов высокого разрешения может быть мал.

**Файлы:** `server/replit_integrations/object_storage.ts`, `server/routes.ts:31-154`.

**Мои заметки.** Подходит для текущего объёма. При росте ассетов лучше явно вынести «папки по назначению» (`/promo`, `/events`, `/broll`, `/heygen`) и почистить корзину.

---

## 20. Brand Knowledge Pack и HeyGen-агент-Repl

**Цель.** Дать внешнему агент-Repl'у (отдельный, генерирует видео через HeyGen) ровно тот контекст, который нужен, без постоянного «дёргания» нашего проекта.

**Что готово.**
- `JETUP_BRAND_KNOWLEDGE.md` — единственный источник истины по бренду: цвета, voice/tone, Sofia persona, продуктовый глоссарий (CopyX, Amplify, Sonic AI, TAG Markets, IB Portal, 4 income streams), HeyGen env-vars, форматы контента, DE-стиль озвучки, 10 типичных промптов агента (#144).
- `JETUP_LANDING_KNOWLEDGE.md` — большая документация по лендингу (#95).
- MVP Roadmap для нового HeyGen-агент-Repl'а (#145).
- HeyGen MCP подключение + тест-генерация (#146).
- Слайды экспортируются + аплоадятся в HeyGen + статус трекается + готовое скачивается локально (#123, #125, #126, #127, #129).

**Что полу-готово / в работе.** Нет активных задач.

**Что не сделано / открытые вопросы.**
- Долгосрочное хранение готовых видео в облаке — отменили (#131). Сейчас файлы лежат локально.
- Нет авто-публикации готового видео в YouTube/Telegram.

**Мои заметки.** Это «фабрика контента». Сильно связано с Sofia (один и тот же brand voice). Если решите масштабировать видео-продакшн — следующая итерация: автопостинг + структурированные плейлисты.

---

## 21. AMA — вопросы пользователей

**Цель.** Принимать заранее заданные вопросы перед AMA-сессиями.

**Что готово.**
- Таблица `ama_questions`, страница `AmaPage.tsx`.
- Multilang AMA-события + pre-questions прямо в Mini App (#91).
- Sync вопросов в Google Sheets (`syncAllAmaQuestions`).

**Что не сделано.** Нет UI для модерации/группировки похожих вопросов.

**Мои заметки.** Лёгкая, рабочая фича. Дальше развивать по запросу.

---

## 22. Что я бы делал дальше (приоритеты)

Список — мой, по приоритету. Цифры в скобках — номера задач, где это уже описано.

1. **Закрыть продовый релиз-пакет (#4 + #3 + #6 + #21):** письмо при approval, бот webhook + Zoom scopes, корректная Email-Sent синхронизация и фильтрация прошедших событий. Без этих четырёх задач продакшен живёт с реальными багами в денежном потоке.
2. **Sofia: починить навигацию (#138).** Sofia говорит «давай посмотрим презентацию», но не ведёт — это хуже, чем если бы её не было. Один из самых заметных багов «премиум»-впечатления.
3. **Promo-пакет (#7 + #28 + #39):** дополировать `/promo-admin`, добить «No Money»-флоу, обновить Turkey Promo. Это «чистый» спринт без зависимостей, можно делать одним блоком.
4. **Partner-app + бот: dev/prod разделение (#20 + #8) и `/invite` → Mini App (#17).** Уберёт боль тестирования и улучшит UX команды `/invite`.
5. **Personal Invite — статистика и канал напоминания (#22) + preview/мультиязычность (#19).** Это про доверие партнёра к цифрам, ключ к удержанию.
6. **Sofia v2 на /explore (#137 + #135) + handoff на видео (#139).** Делать после #138 — иначе чиним промпт в сломанной механике.
7. **Admin Translation Editor (#86).** Снимет хроническую боль с переводами и подготовит почву для внешних копирайтеров.
8. **Аналитика без новых фич:** сделать простой дашборд по `sofia_sessions`, `personal_invites` (воронка), `zoom_attendance`. У нас все данные уже в БД, нужен только SQL + страница в админке.
9. **Smoke-тесты на HQ API.** Без них любой редактор `hq-readonly.ts` молча ломает контракт с внешним штабом. Минимум — health + 2 эндпоинта.
10. **Документация-ревью: `replit.md` vs реальный код.** Раз в квартал, иначе расходимся. Этот документ — первая итерация такой ревизии.

---

## Приложение: где лежит что

| Тема | Ключевые файлы / документы |
|------|----------------------------|
| Архитектура и обзор | `replit.md`, `architecture.md`, `ARCHITECTURE.md` |
| Бренд-пак и HeyGen | `JETUP_BRAND_KNOWLEDGE.md`, `JETUP_LANDING_KNOWLEDGE.md`, `LANDING_REVIEW.md` |
| Партнёрская система | `docs/PARTNER_SYSTEM_ARCHITECTURE.md`, `docs/partner-system.md`, `docs/partner-app-description.md`, `docs/partner-miniapp-audit.md`, `docs/PARTNER_INVITATION_WORKFLOW.md`, `docs/JetUP_Partner_System_DE.md` |
| Презентация / лендинг | `docs/presentation-architecture.md`, `docs/presentation-guide.md`, `docs/presentation_structure.md`, `docs/explore-content.md` |
| Maria | `docs/maria-knowledge-base.md`, `docs/maria-prompts-updated.md`, `docs/prompts.md` |
| HQ API | `docs/hq-api.md` |
| UI-тексты и контент | `docs/ui-texts.md`, `content/`, `TRANSLATIONS_EN.md`, `TEXTS_AUDIT_DE.md` |
| Промпты Sofia | `.local/tasks/sofia-prompt-de.md`, `.local/tasks/sofia-prompt-de-v2.md`, `.local/tasks/sofia-prompt-de-v3-draft.md` |
| Схема БД | `shared/schema.ts` |
| Server entrypoint | `server/index.ts`, `server/routes.ts`, `server/storage.ts`, `server/partner-app-routes.ts` |
| Интеграции | `server/integrations/` (Maria, Sofia, LiveAvatar, Partner Bot, Zoom, Resend, HQ, Telegram-notify, Reminder/Verification schedulers) |
| Frontend pages | `client/src/pages/` |

---

*Документ генерируется вручную. Если вы видите расхождение с реальным поведением приложения — `replit.md` и сам код являются источником истины; обновите этот файл по запросу.*
