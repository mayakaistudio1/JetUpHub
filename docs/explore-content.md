# /explore — Полный контент и архитектура

> Последнее обновление: апрель 2026
> Файлы: `client/src/pages/ExplorePage.tsx`, `client/src/pages/partner/PresentationOverlay.tsx`, `client/src/contexts/LanguageContext.tsx`

---

## АРХИТЕКТУРА СТРАНИЦЫ

### Компонентное дерево

```
ExplorePage (route: /explore)
├── ThemeCtx.Provider (dark / light)
├── HeroSection          — fullscreen hero с видео, навигация, переключатели языка/темы
├── ContentSections      — основной контент (Problem → Answer → Pillar 1/2/3 → Transform)
├── VideoShowcaseSection — [NEW] Videothek: YouTube-ролики из /api/tutorials (до 4 шт.)
├── CTASection           — CTA с кнопками «Мария AI» и «Презентация»
├── RecruitingAISection  — [NEW] KI-Schicht: Мария в 3 режимах (Text / Voice / Live Avatar)
│   └── RecruitingChat   — inline компактный чат → POST /api/maria/recruiting/chat
├── ApplicationSection   — форма заявки
├── Footer
├── PresentationOverlay  (fullscreen overlay, z-index: 200) — 10 слайдов
└── ChatOverlay          (fullscreen overlay, z-index: 200) — AI Мария
```

### State в ExplorePage
| Переменная | Тип | Назначение |
|---|---|---|
| `theme` | `"dark" \| "light"` | Тема оформления |
| `showPresentation` | boolean | Показать презентацию |
| `showMaria` | boolean | Показать чат с Марией |
| `presentationWatched` | boolean | Флаг просмотра презентации |
| `messages` | `SharedMessage[]` | Общий массив сообщений (чат + презентация) |

### State в VideoShowcaseSection
| Переменная | Тип | Назначение |
|---|---|---|
| `videos` | `Tutorial[]` | Список видео из `/api/tutorials?language={lang}` |
| `playingId` | `string \| null` | ID YouTube-видео в режиме воспроизведения |

### State в RecruitingAISection
| Переменная | Тип | Назначение |
|---|---|---|
| `mode` | `null \| "chat" \| "voice" \| "avatar"` | Активный режим взаимодействия с Марией |
| `videoCallActive` | boolean | Активен ли VideoCallBar (для voice/avatar режимов) |

### State в RecruitingChat
| Переменная | Тип | Назначение |
|---|---|---|
| `messages` | `ChatMsg[]` | История сообщений (начинается с приветствия Марии) |
| `input` | string | Текст в поле ввода |
| `streaming` | string | Накопленный текст стриминг-ответа |
| `loading` | boolean | Ожидание ответа от API |

### Shared State (чат ↔ презентация)
Сообщения живут в `ExplorePage` и передаются пропсами в оба оверлея.
Любое сообщение из презентации сразу видно в чате Марии.

```
SharedMessage { id: number, text: string, sender: "ai" | "user" }
```

### Файлы
| Файл | Назначение |
|---|---|
| `client/src/pages/ExplorePage.tsx` | Главная страница `/explore` |
| `client/src/pages/partner/PresentationOverlay.tsx` | Презентация (10 слайдов) |
| `client/src/pages/partner/ChatOverlay.tsx` | Чат с Марией AI |
| `client/src/contexts/LanguageContext.tsx` | Все тексты (RU/EN/DE) |
| `client/src/pdh-v3.css` | Стили презентации (`.pres-*`, `.ph-*`) |
| `client/public/videos/` | Видео: `jetup-intro.mp4`, `-de.mp4`, `-ru.mp4`, `bg_market.mp4`, `bg_partner.mp4`, `bg_tech.mp4` |
| `client/public/images/presentation/` | `scene_01.png` … `scene_10.png` |
| `server/integrations/maria-chat.ts` | Промпты Марии (в т.ч. `MARIA_RECRUITING_PROMPT_DE/EN/RU`) + `registerMariaChatRoutes()` |
| `server/routes.ts` | Регистрация `/api/maria/recruiting/chat` и `/api/tutorials` |
| `docs/presentation-architecture.md` | Архитектурная документация |

---

## ТЕМА И ВИЗУАЛ

### Dark тема (по умолчанию)
- BG: `#0a0a12`
- Surface: `#12121c`
- Text: `#ffffff`
- Accent: `#7C3AED` (фиолетовый)
- Accent Light: `#A855F7`

### Light тема
- BG: `#f6f6fa`
- Surface: `#ffffff`
- Text: `#0d0d1a`
- Accent: тот же

---

## НАВИГАЦИЯ (Header)

Якорные ссылки:
- `#product` → Pillar 1 (Торговая инфраструктура)
- `#difference` → Pillar 2 (Партнёрская модель)
- `#partner` → Pillar 3 (ИИ-инфраструктура)
- `#ai` → CTA / AI-секция

Переключатели: EN / DE / RU + Dark/Light тема

---

## ТЕКСТЫ СТРАНИЦЫ (LanguageContext keys)

### Hero

| Ключ | RU | EN | DE |
|---|---|---|---|
| `explore.hero.label` | Платформа архитектуры роста | Growth Architecture Platform | Growth Architecture Platform |
| `explore.hero.title1` | Это не просто | This isn't just | Das ist nicht nur |
| `explore.hero.title2` | очередная возможность. | another opportunity. | eine weitere Gelegenheit. |
| `explore.hero.title3` | Это система. | It's a system. | Es ist ein System. |
| `explore.hero.subtitle1` | Продукт в центре. Партнёрская модель для масштаба. | Product at the core. Partner model for scale. | Produkt im Kern. Partnermodell für Wachstum. |
| `explore.hero.subtitle2` | ИИ‑инфраструктура, усиливающая лидера. | AI infrastructure that amplifies the leader. | KI-Infrastruktur, die den Leader stärkt. |
| `explore.hero.cta1` | Исследовать систему | Explore the system | System erkunden |
| `explore.hero.cta2` | Поговорить с Марией AI | Talk to Maria AI | Mit Maria AI sprechen |

**Видео (автовыбор по языку):**
- RU → `/videos/jetup-intro-ru.mp4`
- DE → `/videos/jetup-intro-de.mp4`
- EN → `/videos/jetup-intro.mp4`

---

### Секция: Problem

| Ключ | RU |
|---|---|
| `explore.problem.label` | Проблема |
| `explore.problem.title1` | Рынок перегрет. |
| `explore.problem.title2` | Люди видят больше предложений — но меньше системы. |
| `explore.problem.body` | Лидеры выгорают на ручном росте. Партнёры перебегают между краткосрочными проектами. Клиенты теряют доверие к разрозненным обещаниям. Цикл повторяется: вход — надежда — выгорание — новый поиск. |

---

### Секция: Answer (формула)

| Ключ | RU |
|---|---|
| `explore.answer.label` | Ответ |
| `explore.answer.title1` | JetUP заменяет хаос |
| `explore.answer.title2` | архитектурой. |
| `explore.answer.col1.label` | Продукт |
| `explore.answer.col1.desc` | Реальная ценность в основе. |
| `explore.answer.col2.label` | Партнёрская модель |
| `explore.answer.col2.desc` | Остаточный доход, а не хайп. |
| `explore.answer.col3.label` | ИИ‑инфраструктура |
| `explore.answer.col3.desc` | Масштабирование лидера, а не его замена. |
| `explore.formula` | = Продукт + Партнёрская модель + ИИ‑инфраструктура |

---

### Pillar 1: Торговая инфраструктура (id: `#product`)

| Ключ | RU |
|---|---|
| `explore.pillar1.title` | Торговая инфраструктура |
| `explore.pillar1.subtitle` | Исполнение институционального уровня. Прозрачный продукт. |
| `explore.pillar1.heading` | Экосистема, а не отдельный инструмент |
| `explore.pillar1.body` | В основе — реальный продукт институционального уровня, которым клиенты пользуются и от которого получают выгоду. Не обёртка поверх хайпа, а регулируемая, прозрачная торговая инфраструктура для долгосрочного участия. |
| `explore.pillar1.item1` | Регулируемая среда исполнения |
| `explore.pillar1.item2` | Профессиональные стратегии, доступные каждому |
| `explore.pillar1.item3` | Прозрачная статистика, никаких скрытых механизмов |
| `explore.pillar1.item4` | Низкий порог входа — высокий потенциал роста |

**Карточки:**
| Ключ | Заголовок | Описание |
|---|---|---|
| pillar1.card1 | Регулируемый доступ | Исполнение институционального уровня в полностью комплаентной среде |
| pillar1.card2 | Экосистема стратегий | Несколько профессиональных подходов для разных профилей риска |
| pillar1.card3 | Эффективность капитала | Встроенные механизмы максимизации торговой мощности с любой точки входа |

---

### Pillar 2: Партнёрская модель (id: `#difference`)

| Ключ | RU |
|---|---|
| `explore.pillar2.title` | Партнёрская модель |
| `explore.pillar2.subtitle` | Архитектура остаточного дохода. Создана для лидеров. |
| `explore.pillar2.heading` | Доход, который строит сам себя |
| `explore.pillar2.body` | Партнёрская модель построена на одном принципе: остаточный доход, привязанный к реальной активности продукта. Не разовый бонус, не вознаграждение за рекрутинг — непрерывный поток, растущий вместе с экосистемой. Каждый уровень структуры вносит свой вклад, и доход нарастает со временем. |
| `explore.pillar2.item1` | Доход привязан к реальному использованию продукта, а не только к рекрутингу |
| `explore.pillar2.item2` | Множество уровней дохода, нарастающих с глубиной |
| `explore.pillar2.item3` | Для лидеров, мыслящих системами, а не транзакциями |
| `explore.pillar2.item4` | Долгосрочная архитектура вместо краткосрочных выплат |
| `explore.pillar2.quote1` | «Новичок видит первую комиссию. |
| `explore.pillar2.quote2` | Лидер видит архитектуру дохода.» |

---

### Pillar 3: ИИ‑инфраструктура (id: `#partner`)

| Ключ | RU |
|---|---|
| `explore.pillar3.title` | ИИ‑инфраструктура |
| `explore.pillar3.subtitle` | Масштабировать лидера. Не заменять. |
| `explore.pillar3.limitLabel` | Предел |
| `explore.pillar3.limitHeading` | Почему сильные лидеры упираются в потолок? |
| `explore.pillar3.limitBody` | Потому что физически есть только один из них. Их время, энергия и пропускная способность становятся узким местом всей структуры. |
| `explore.pillar3.solutionLabel` | Решение |
| `explore.pillar3.solutionHeading` | ИИ как слой дубликации |
| `explore.pillar3.solutionBody` | ИИ JetUP не заменяет лидера. Он превращает влияние лидера в более масштабируемую, воспроизводимую и доступную систему. |
| `explore.pillar3.mariaDesc` | ИИ‑ассистент с живым видео‑аватаром. Мультиязычный, всегда на связи. Знает каждую деталь экосистемы и сопровождает партнёров на каждом шагу. |
| `explore.pillar3.mode.text` | Текст |
| `explore.pillar3.mode.video` | Видео |
| `explore.pillar3.mode.voice` | Голос |

**Карточки:**
| Ключ | Заголовок | Описание |
|---|---|---|
| pillar3.card1 | Цифровой хаб | Единая точка входа с ИИ‑навигацией |
| pillar3.card2 | ИИ‑дубликация | Клонирование стиля общения лидера в масштабе |
| pillar3.card3 | Автоматический онбординг | Первые шаги без затрат времени лидера |

---

### Секция: Transform (сравнение «до/после»)

| Ключ | RU Before | RU After |
|---|---|---|
| transform.1 | Ручной рекрутинг | ИИ‑дубликация |
| transform.2 | Краткосрочные волны хайпа | Долгосрочный остаточный доход |
| transform.3 | Лидер как узкое место | Лидер как архитектор |
| transform.4 | Разрозненные инструменты | Единая экосистема |

Заголовок: «От случайного роста → к управляемой инфраструктуре.»

---

### Секция: VideoShowcaseSection — Videothek [NEUE SEKTION]

**Позиция в странице:** между ContentSections (Transform) и CTASection.

**data-testid:** `section-videothek`

**Источник данных:** `GET /api/tutorials?language={lang}` → до 4 первых записей (sortOrder ASC).

**Тип данных (Tutorial):**
```ts
interface Tutorial {
  id: number;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  sortOrder: number;
}
```

**Поведение:**
- Компонент скрыт (`return null`), если API вернул пустой массив.
- Thumbnail: `https://img.youtube.com/vi/{youtubeVideoId}/hqdefault.jpg` — lazy-load.
- Клик по карточке → iframe YouTube с `?autoplay=1&rel=0` заменяет thumbnail в той же карточке.
- Сетка: 2 столбца (desktop, если видео ≥ 4), 1 столбец (mobile).

**Тексты по языкам:**

| | DE | EN | RU |
|---|---|---|---|
| label | VIDEOTHEK | LIBRARY | БИБЛИОТЕКА |
| title | Die Bibliothek, die das System erklärt | The library that explains the system | Библиотека, которая объясняет систему |
| subtitle | Kuratierte Inhalte, die JetUP verständlich machen — in wenigen Minuten. | Curated content that makes JetUP clear — in just a few minutes. | Подборка материалов — понятно о JetUP за несколько минут. |

---

### Секция: CTA (id: `#ai`)

| Ключ | RU |
|---|---|
| `explore.cta.label` | Готовы? |
| `explore.cta.title` | Войдите в систему. |
| `explore.cta.subtitle1` | Поговорите с Марией. Изучайте в своём темпе. |
| `explore.cta.subtitle2` | Найдите свой путь в JetUP. |
| `explore.cta.btn1` | Начать с Марией AI |
| `explore.cta.btn2` | Смотреть презентацию |

---

### Секция: RecruitingAISection — KI-Schicht Recruiting [NEUE SEKTION]

**Позиция в странице:** между CTASection и ApplicationSection.

**data-testid:** `section-recruiting-ai`

**Режимы (`mode` state):**
| Значение | Описание |
|---|---|
| `null` | Стартовое состояние — три плитки выбора |
| `"chat"` | Инлайн-чат `RecruitingChat` с SSE-стримингом |
| `"voice"` | VideoCallBar (только аудио-режим) |
| `"avatar"` | VideoCallBar (Live Avatar) |

**Тексты по языкам:**

| | DE | EN | RU |
|---|---|---|---|
| label | KI-SCHICHT | AI LAYER | KI-СЛОЙ |
| title | Sprich mit Maria. | Talk to Maria. | Поговори с Марией. |
| subtitle | Stelle deine Fragen — per Text, Sprache oder Live-Avatar. | Ask your questions — via text, voice, or live avatar. | Задай вопросы — текстом, голосом или через live-аватар. |
| tile_chat | Text-Chat | Text Chat | Текстовый чат |
| tile_voice | Sprache | Voice | Голос |
| tile_avatar | Live Avatar | Live Avatar | Live-аватар |

**RecruitingChat — приветственное сообщение Марии (не из API):**

| Язык | Текст |
|---|---|
| DE | Hallo! Ich bin Maria — die KI von JetUP. Ich beantworte alle deine Fragen zum Partnerprogramm. Was möchtest du wissen? |
| EN | Hello! I'm Maria — JetUP's AI. I can answer all your questions about the partner program. What would you like to know? |
| RU | Привет! Я Мария — ИИ JetUP. Отвечу на любые вопросы о партнёрской программе. Что хочешь узнать? |

**API endpoint для чата:**
```
POST /api/maria/recruiting/chat
Body: { messages: { role: "user"|"assistant", content: string }[], language: "de"|"en"|"ru" }
Response: SSE stream → data: { text: "..." }
```

**Системные промпты:** `MARIA_RECRUITING_PROMPT_DE/EN/RU` — в `server/integrations/maria-chat.ts`.
Фокус: обработка возражений, убеждение → форма заявки. Макс. 35 слов/ответ (TTS-оптимизация).

---

## ФОРМА ЗАЯВКИ (ApplicationSection)

Поля:
- Имя (name)
- Email
- Откуда узнали (source, опционально)
- Кнопка «Отправить»

После отправки — анимация успеха с чекмаркой.

---

### Footer

| Ключ | RU | EN | DE |
|---|---|---|---|
| `explore.footer.tagline` | Платформа архитектуры роста | Growth Architecture Platform | Growth Architecture Platform |
| `explore.footer.terms` | Условия | Terms | AGB |
| `explore.footer.privacy` | Конфиденциальность | Privacy | Datenschutz |

---

## ПРЕЗЕНТАЦИЯ (PresentationOverlay)

### Структура

Fullscreen overlay (z-index через AnimatePresence в ExplorePage).
Компонент: `client/src/pages/partner/PresentationOverlay.tsx`

**Journey Bar** (5 групп в топе):
| ID | Слайды | Цвет | Название |
|---|---|---|---|
| market | 1–2 | #EF4444 | Рынок |
| solution | 3–4 | #A855F7 | Решение |
| partner | 5–6–7 | #22C55E | Партнёр |
| ai | 8 | #3B82F6 | AI |
| ecosystem | 9–10 | #F59E0B | Итог |

**Видео-фоны (CinematicVideoBg):**
| Пресет | Видео | Слайды |
|---|---|---|
| market | `/videos/bg_market.mp4` | 1, 2, 3 |
| partner | `/videos/bg_partner.mp4` | 4, 5, 6, 7, 10 |
| tech | `/videos/bg_tech.mp4` | 8, 9 |

---

### Слайд 1 — Реальность рынка
- **Акцент:** `#7C3AED`
- **Изображение:** `scene_01.png`
- **Заголовок:** Реальность рынка
- **Текст:** Рынок финансов растёт, как и интерес к пассивному доходу. Но 87% людей теряют деньги, торгуя в одиночку. Почему это происходит?
- **Чипы:** «Почему 87% теряют?» / «Какие ошибки стоят денег?»
- **Факты:**
  - «87% теряют деньги» — По статистике 87% розничных трейдеров теряют деньги в первый год. Большинство из-за отсутствия системы и дисциплины.
  - «Информационный хаос» — Средний трейдер подписан на 12+ каналов с сигналами. Это создаёт перегрузку и приводит к импульсивным решениям.

---

### Слайд 2 — Проблема индустрии
- **Акцент:** `#EF4444`
- **Изображение:** `scene_02.png`
- **Заголовок:** Проблема индустрии
- **Текст:** Проблема не в людях, а в модели. Всё зависит от одного лидера, а система дубликации отсутствует. Партнёры выгорают за 4-6 месяцев без поддержки.
- **Чипы:** «Почему модель не работает?» / «Что убивает партнёров?»
- **Факты:**
  - «Проблема масштабирования» — 95% партнёрских программ не дают инструментов для масштабирования. Партнёр остаётся один на один с рутиной.
  - «Выгорание партнёров» — Средний срок жизни активного партнёра без системы поддержки — 4-6 месяцев. С системой — 2+ года.

---

### Слайд 3 — Решение JetUP
- **Акцент:** `#8B5CF6`
- **Изображение:** `scene_03.png`
- **Заголовок:** Решение JetUP
- **Текст:** JetUP объединяет финансовый продукт, партнёрскую модель и AI-инфраструктуру в одной системе. Это не просто проект, а готовая инфраструктура для масштабирования.
- **Чипы:** «Что отличает JetUP?» / «Почему именно три элемента?»
- **Dennis Insight:** «Большинство партнёров пытаются масштабировать продукт. Я масштабирую систему.»

---

### Слайд 4 — Безопасность
- **Акцент:** `#22C55E`
- **Изображение:** `scene_04.png`
- **Заголовок:** Безопасность
- **Текст:** Ваш капитал остаётся на ВАШЕМ личном счету. KYC на ваше имя. Вы полностью контролируете ввод и вывод средств.
- **Интерактив (SecurityPoints):**
  - 🟢 KYC — Полная верификация на ваше имя. Аккаунт принадлежит только вам.
  - 🔵 Personal Account — Личный аккаунт у лицензированного брокера. Без посредников.
  - 🟡 Withdraw Control — Только вы контролируете вывод средств. Без ограничений.
- **Чипы:** «Где хранится капитал?» / «Кто контролирует вывод?»

---

### Слайд 5 — Партнёрская программа
- **Акцент:** `#22C55E`
- **Изображение:** `scene_05.png`
- **Заголовок:** Партнёрская программа
- **Текст:** 5 потоков дохода в одной системе. Не один источник — а полноценная финансовая модель для партнёра.
- **Интерактив (StrategyCards):**
  - 🟢 Lot Commissions — Комиссия с каждого торгового лота твоих клиентов. Постоянный пассивный доход от активности.
  - 🔵 Profit Share — Доля от прибыли стратегий. Чем лучше результат — тем больше ты получаешь.
  - 🟡 Infinity Bonus — Бонус с оборота всей твоей структуры в глубину. Без ограничений по уровням.
- **Чипы:** «Как работают комиссии?» / «Сколько можно заработать?» / «Что такое Infinity Bonus?»
- **Dennis Insight:** «Для меня главное — контроль и прозрачность. Тогда масштаб становится безопасным.»

---

### Слайд 6 — Доходы партнёра
- **Акцент:** `#10B981`
- **Изображение:** `scene_06.png`
- **Заголовок:** Доходы партнёра
- **Текст:** Каждый источник дохода работает параллельно. Ты зарабатываешь от активности клиентов, результатов стратегий и роста команды.
- **Интерактив (SecurityPoints):**
  - 🟡 Global Pool — Глобальный пул доходов для топ-партнёров. Доля от общего оборота компании.
  - 🔴 Incentives — Путешествия, бонусы, карьерные ступени. Система мотивации для активных партнёров.
  - 🟣 Career Steps — Прозрачная карьерная лестница с чёткими критериями. От Partner до Global Director.
- **Чипы:** «Что такое Global Pool?» / «Какие бонусы есть?» / «Как растёт карьера?»
- **Dennis Insight:** «Люди устают от хаоса. Они выбирают инфраструктуру, где всё на одном месте.»

---

### Слайд 7 — Масштаб
- **Акцент:** `#F97316`
- **Изображение:** `scene_07.png`
- **Заголовок:** Масштаб
- **Текст:** Даже лучший продукт не масштабируется сам. JetUP даёт инфраструктуру дубликации — каждый партнёр получает готовую систему.
- **Чипы:** «Что такое дубликация?» / «Как работает система?»
- **Факты:**
  - «Система дубликации» — Каждый партнёр получает готовый набор инструментов: AI-презентацию, чат-бот, квалификацию лидов. Не нужно быть экспертом — система работает за тебя.
  - «Масштаб без потерь» — Благодаря AI-инфраструктуре партнёр может масштабировать свою команду без потери качества коммуникации. Каждый новый партнёр получает ту же систему.

---

### Слайд 8 — AI-дубликация
- **Акцент:** `#E88FEC`
- **Изображение:** `scene_08.png`
- **Заголовок:** AI-дубликация
- **Текст:** Твоя AI-копия работает 24/7: презентует, отвечает на вопросы, квалифицирует лиды. Система работает за тебя, пока ты спишь.
- **Интерактив (AiNodes — 4 узла):**
  - 🟣 AI Chat — Умный чат-бот отвечает на вопросы клиентов 24/7 от имени партнёра.
  - 🔵 Mini Presentation — Интерактивная презентация системы — клиент изучает всё сам.
  - 🟢 Lead Qualification — AI квалифицирует интерес и передаёт только горячие лиды.
  - 🟡 24/7 Support — Автоматическая поддержка работает без перерывов и выходных.
- **Доп. компонент: AIComparison (таблица «Без AI / С AI»)**

  | Без AI | С AI |
  |---|---|
  | Партнёр отвечает на сообщения | AI отвечает 24/7 |
  | Партнёр делает звонки | AI квалифицирует лиды |
  | Партнёр объясняет презентацию | AI проводит презентацию |
  | Партнёр повторяет одни и те же ответы | Партнёр общается только с серьёзными людьми |

- **Доп. компонент: LivePipeline**
  Посетитель приходит → AI начинает разговор → Квалификация лида → Запись на встречу

- **Кнопка:** «Попробуй Dennis AI»
- **Чипы:** «Что AI делает за меня?» / «Как AI квалифицирует?» / «Попробовать AI вживую»
- **Dennis Insight:** «AI не заменяет партнёра. Он убирает рутину и оставляет только сильные контакты.»
- **Факты:**
  - «AI обрабатывает 24/7» — AI-ассистент Dennis отвечает на вопросы потенциальных партнёров круглосуточно, квалифицирует лиды и записывает на встречи.
  - «Конверсия ×3» — Партнёры с AI-инфраструктурой показывают в 3 раза более высокую конверсию из первого контакта в активного партнёра.

---

### Слайд 9 — Экосистема JetUP
- **Акцент:** `#A855F7`
- **Изображение:** `scene_09.png`
- **Тип:** `ecosystem` (рендерится через `EcosystemMapSlide`)
- **Заголовок:** Экосистема JetUP
- **Текст:** Единая инфраструктура: брокер, биржа, карта, AI-система и партнёрская сеть — всё связано в одну экосистему.
- **Чипы:** «Как всё связано между собой?» / «Что даёт экосистема партнёру?»
- **Элементы карты:**
  - TAG Markets — Лицензированная брокерская инфраструктура для доступа к мировым финансовым рынкам.
  - BIT1 — Криптобиржа институционального уровня с глубокой ликвидностью.
  - BIX Card — Криптодебетовая карта нового поколения для мгновенных расходов.
  - AI System — AI-инфраструктура для автоматизации партнёров и квалификации лидов.
  - Partners — Глобальное партнёрское сообщество и многоуровневая экосистема роста.
- **Факты:**
  - «6 продуктов — 1 система» — Экосистема JetUP объединяет 6 финансовых продуктов в единую систему: копитрейдинг, сигналы, академию и партнёрскую программу.
  - «Сила экосистемы» — Клиент, использующий 3+ продукта экосистемы, остаётся активным в 5 раз дольше, чем пользователь одного продукта.

---

### Слайд 10 — Твой выбор
- **Акцент:** `#7C3AED`
- **Изображение:** `scene_10.png`
- **Заголовок:** Твой выбор
- **Текст:** Ты можешь изучать. Или начать строить. Я помогу определить формат участия под твой опыт и цели.
- **Чипы:** нет
- **Доп. компонент: JetUPEngine**
  - THE JETUP ENGINE = Продукты + AI Инфраструктура + Партнёрская система = Scaling Engine
- **Финальные CTA-кнопки:**
  - «Записаться на звонок»
  - «Начать по моей ссылке»
  - «Перейти в Telegram»
  - «Посмотреть полный обзор экосистемы»

---

## НАВИГАЦИЯ ПРЕЗЕНТАЦИИ

- **← / →** — пред./след. слайд
- **TOC (☰)** — оглавление всех 10 слайдов (нижний bottom-sheet, drag-dismiss)
- **Journey Bar** — 5 групп вверху, кликабельны (переход к первому слайду группы)
- **Progress bar** — тонкая полоска (3px) вверху, цвет = акцент текущего слайда
- **Чат (внизу)** — bottom sheet 75vh, тот же shared state, Dennis AI / Maria AI

---

## ЧАТ В ПРЕЗЕНТАЦИИ

- Открывается по кнопке «Попробуй Dennis AI» или из TOC
- Bottom sheet, 75vh, drag-to-dismiss (порог 100px вниз)
- Показывает тот же массив `messages` что и ChatOverlay
- Аватар: `dennis-photo.png`, имя: «Dennis AI», статус: Online
- Placeholder: «Напиши сообщение...»

---

## ЧАТ МАРИЯ AI (ChatOverlay)

- Открывается из Hero («Поговорить с Марией AI») и CTA («Начать с Марией AI»)
- Если `presentationWatched = true` — через 600ms добавляется сообщение: «Что из этого откликнулось больше всего? Давай разберём твой кейс лично.»
- Первое AI-сообщение: «Hi! I'm Maria, your AI assistant. How can I help you today?»
