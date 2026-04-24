# JetUP — Логика добавления вебинаров и акций

## Вебинары (Schedule Events)

### API endpoint
`POST /api/admin/schedule-events`

### Поля

| Поле | Тип | Обязательное | Описание |
|------|-----|-------------|----------|
| `language` | string | Да | Язык: `de` или `ru` |
| `type` | string | Да | Тип: `trading` или `partner` |
| `day` | string | Да | День недели (например: `Mittwoch`, `Четверг`) |
| `date` | string | Да | Дата в формате `YYYY-MM-DD` (например: `2026-03-05`). Без корректной даты вебинар НЕ будет отображаться |
| `time` | string | Да | Время (например: `19:00`) |
| `timezone` | string | Да | Часовой пояс: `CET` (для DE) или `MSK` (для RU) |
| `title` | string | Да | Заголовок вебинара |
| `speaker` | string | Да | Имя спикера |
| `speakerId` | number | Нет | ID спикера из базы (для подтягивания фото) |
| `typeBadge` | string | Да | Бейдж типа: `Trading` или `Partner` |
| `banner` | string | Нет | URL баннера |
| `highlights` | string[] | Да | Массив из 3 ключевых пунктов вебинара |
| `link` | string | Да | Ссылка на Zoom/вебинар |
| `isActive` | boolean | Да | Активен ли (true/false) |
| `sortOrder` | number | Нет | Порядок сортировки (по умолчанию 0) |

### Правила отображения
- Вебинары видны на **всех языках** (не фильтруются по языку пользователя), но показывают языковой бейдж (DE/RU)
- Вебинар **автоматически скрывается**, когда его дата проходит (сравнение `date >= сегодня`)
- Если поле `date` пустое или не в формате `YYYY-MM-DD` — вебинар **не отображается**
- В админке (`/admin`) видны все вебинары, включая прошедшие

### Пример JSON для создания вебинара
```json
{
  "language": "de",
  "type": "trading",
  "day": "Mittwoch",
  "date": "2026-03-04",
  "time": "19:00",
  "timezone": "CET",
  "title": "Dein klarer Einstieg in die Finanzmärkte",
  "speaker": "Lorenz Brunner",
  "speakerId": 1,
  "typeBadge": "Trading",
  "banner": "/webinar-lorenz.png",
  "highlights": [
    "Einstieg in die Finanzmärkte — strukturiert und verständlich",
    "Transparenz und Kontrolle über dein Kapital",
    "Praxisnahe Strategien für deinen Start"
  ],
  "link": "https://us05web.zoom.us/j/83031264996",
  "isActive": true,
  "sortOrder": 1
}
```

---

## Акции (Promotions)

### API endpoint
`POST /api/admin/promotions`

### Поля

| Поле | Тип | Обязательное | Описание |
|------|-----|-------------|----------|
| `language` | string | Да | Язык: `de` или `ru` |
| `badge` | string | Да | Бейдж акции (например: `SPEZIALAKTION`, `NEWS`, `АКЦИЯ`, `НОВОСТЬ`) |
| `title` | string | Да | Заголовок акции |
| `subtitle` | string | Нет | Подзаголовок |
| `banner` | string | Нет | URL баннера (загружается через админку) |
| `highlights` | string[] | Да | Массив ключевых пунктов акции |
| `ctaText` | string | Да | Текст кнопки призыва к действию (например: `Jetzt aktivieren`, `Узнать больше`) |
| `ctaLink` | string | Да | Ссылка кнопки |
| `deadline` | string | Нет | Срок действия акции (текст, например: `Bis 31.03.2026`) |
| `gradient` | string | Нет | CSS-градиент карточки (например: `from-[#7C3AED] to-[#A855F7]`) |
| `badgeColor` | string | Нет | CSS-класс цвета бейджа (например: `bg-orange-500`, `bg-red-500`, `bg-green-500`) |
| `isActive` | boolean | Да | Активна ли (true/false) |
| `sortOrder` | number | Нет | Порядок сортировки |

### Правила отображения
- Акции **фильтруются по языку** пользователя: DE-пользователь видит только немецкие акции, RU-пользователь — только русские
- API запрос: `GET /api/promotions?language=de` или `GET /api/promotions?language=ru`
- В админке (`/admin`) видны все акции на всех языках

### Пример JSON для создания акции (DE)
```json
{
  "language": "de",
  "badge": "SPEZIALAKTION",
  "title": "24X Trading-Boost aktivieren",
  "subtitle": "Normalerweise 12X Multiplikator — jetzt verdoppelt!",
  "highlights": [
    "Doppelte Rendite auf alle Copy-X Strategien",
    "Zeitlich begrenzt bis 31.03.2026",
    "Automatische Aktivierung nach Anmeldung"
  ],
  "ctaText": "Jetzt aktivieren",
  "ctaLink": "https://example.com/activate",
  "deadline": "Bis 31.03.2026",
  "gradient": "from-[#7C3AED] to-[#A855F7]",
  "badgeColor": "bg-orange-500",
  "isActive": true,
  "sortOrder": 1
}
```

### Пример JSON для создания акции (RU)
```json
{
  "language": "ru",
  "badge": "АКЦИЯ",
  "title": "Активируй 24X Trading-Boost",
  "subtitle": "Обычно 12X мультипликатор — сейчас удвоен!",
  "highlights": [
    "Двойная доходность на все Copy-X стратегии",
    "Ограниченное предложение до 31.03.2026",
    "Автоматическая активация после регистрации"
  ],
  "ctaText": "Активировать",
  "ctaLink": "https://example.com/activate",
  "deadline": "До 31.03.2026",
  "gradient": "from-[#7C3AED] to-[#A855F7]",
  "badgeColor": "bg-orange-500",
  "isActive": true,
  "sortOrder": 1
}
```

---

## Существующие спикеры в базе

| ID | Имя | Роль |
|----|-----|------|
| 1 | Lorenz Brunner | Trading Expert |
| 2 | Eddy Kanke | Partner & Ecosystem Expert |
| 3 | Anna Barchatova | Trading & Ecosystem Expert |

При создании вебинара можно указать `speakerId` для автоматического подтягивания фото спикера.
