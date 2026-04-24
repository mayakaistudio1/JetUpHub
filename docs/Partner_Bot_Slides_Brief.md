# JetUP Partner Bot — Бриф для слайдов-презентации

> Скопируйте этот текст в новый проект на Replit и попросите агента создать слайды на его основе.
> Язык слайдов: немецкий (DE), стиль: тёмный/премиум, цвета JetUP (фиолетовый #7c3aed, тёмный фон #0a0a1a).

---

## Слайд 1: Титульный

**Заголовок:** JetUP Partner Digital Hub
**Подзаголовок:** Dein intelligenter Assistent für Partnergewinnung und Webinar-Management
**Описание:** Der JetUP Partner Bot ist dein persönlicher Assistent im Telegram. Er hilft dir, Einladungen zu erstellen, Gäste zu tracken, Zoom-Daten zu analysieren und mit KI-Unterstützung Follow-up-Nachrichten zu verfassen.

---

## Слайд 2: Registrierung — /start

**Заголовок:** Erste Schritte — Registrierung
**Содержание:**
- Öffne den Bot @JetUP_Partner_Bot in Telegram
- Sende /start
- Der Bot führt dich durch 4 Schritte:
  1. **Name** — Dein vollständiger Name
  2. **CU-Nummer** — Deine Partner-CU-Nummer
  3. **Telefon** — Optional (sende /skip zum Überspringen)
  4. **E-Mail** — Optional (sende /skip zum Überspringen)
- Nach der Registrierung erhältst du eine Bestätigung mit deinen Daten
- Ab jetzt stehen dir alle Funktionen zur Verfügung

**Bot-Nachricht Beispiel:**
```
🚀 Willkommen beim JetUP Partner Bot!
Ich helfe dir, Einladungslinks zu erstellen, Gäste zu tracken und Follow-up-Nachrichten zu verfassen.
📝 Wie ist dein vollständiger Name?
```

---

## Слайд 3: Einladung erstellen — /invite

**Заголовок:** Smart Invite — Persönliche Einladungslinks
**Содержание:**
- Sende /invite im Bot
- Wähle ein geplantes Webinar aus der Liste
- Der Bot erstellt automatisch einen **einzigartigen Tracking-Link** nur für dich
- Teile diesen Link mit deinen Kontakten (WhatsApp, Telegram, E-Mail, Social Media)
- **Jeder Klick und jede Registrierung wird getrackt!**

**Was passiert beim Gast:**
- Gast klickt deinen Link → Elegante Einladungsseite mit:
  - Event-Name und Datum
  - Speaker-Info
  - Countdown-Timer
  - Registrierungsformular (Name, E-Mail, Telefon)
- Nach der Registrierung → "Zoom Meeting beitreten"-Button wird angezeigt
- **Du erhältst sofort eine Benachrichtigung im Bot!**

**Bot-Nachricht Beispiel:**
```
✅ Einladungslink erstellt!
📋 Event: AI TOOLS Webinar
📅 2026-03-15 | 🕐 19:00
🔗 Dein Link: https://jet-up.ai/invite/abc123
Teile diesen Link mit deinen Kontakten!
```

---

## Слайд 4: Gast-Registrierung — Live-Tracking

**Заголовок:** Live-Benachrichtigungen bei neuen Gästen
**Содержание:**
- Sobald sich ein Gast über deinen Link registriert, bekommst du **sofort** eine Nachricht im Bot
- Du siehst:
  - Name des Gastes
  - E-Mail-Adresse
  - Telefonnummer (falls angegeben)
  - Zeitpunkt der Registrierung
- Jeder Klick auf den Zoom-Link wird ebenfalls getrackt

**Bot-Nachricht Beispiel:**
```
🎉 Neuer Gast registriert!
👤 Max Mustermann
📧 max@example.com
📱 +49 170 1234567
📋 Event: AI TOOLS Webinar
```

---

## Слайд 5: Meine Events — /events

**Заголовок:** Event-Übersicht — Alle deine Einladungen im Blick
**Содержание:**
- Sende /events für eine kompakte Übersicht aller deiner Events
- Für jedes Event siehst du:
  - 🟢 Aktiv / ⚪ Inaktiv
  - Event-Name und Datum
  - Anzahl registrierter Gäste
  - Anzahl der Zoom-Beitritte
  - Einladungscode
- Direkte Buttons zu detaillierten Berichten

**Bot-Nachricht Beispiel:**
```
📊 Deine Events:

🟢 AI TOOLS Webinar
   📅 2026-03-15 | 🕐 19:00
   👥 5 registriert | ✅ 3 Zoom beigetreten
   🔗 Code: abc123
```

---

## Слайд 6: Event-Bericht — /report

**Заголовок:** Detaillierter Event-Bericht mit Zoom-Daten
**Содержание:**
- Sende /report und wähle ein Event
- **Basis-Statistik:**
  - Anzahl registrierter Gäste
  - Wer hat den Zoom-Link geklickt
  - Wer ist nicht beigetreten

- **Zoom-Daten (nach dem Webinar):**
  - Drücke "📹 Zoom-Daten laden" → Bot synchronisiert die Daten direkt von der Zoom API
  - Für jeden Teilnehmer siehst du:
    - ✅ Matched (über deinen Link registriert) oder ❓ Unbekannt
    - E-Mail-Adresse
    - Uhrzeit: Beitritt und Verlassen
    - **Dauer in Minuten** (z.B. ⏱ 19:00–19:45 (45 Min.))
    - Anzahl gestellter Fragen (aus Zoom Q&A)
  - **Durchschnittliche Verweildauer** aller Teilnehmer

**Bot-Nachricht Beispiel:**
```
📊 Event-Bericht: AI TOOLS Webinar
📅 2026-03-15 | 🕐 19:00

📝 Registriert: 5 Gäste
✅ Zoom beigetreten: 3
❌ Nicht beigetreten: 2

📹 Zoom-Teilnehmer (API): 3
⏱ Ø 38 Min. | 💬 2 Fragen

  ✅ Max Mustermann
     📧 max@example.com | ⏱ 19:00–19:45 (45 Min.) | 💬 1
  ✅ Anna Schmidt
     📧 anna@example.com | ⏱ 19:02–19:40 (38 Min.)
  ❓ Unknown User
     📧 unknown@mail.com | ⏱ 19:10–19:30 (20 Min.)

⚠️ Registriert, aber nicht auf Zoom (2):
  • Peter Weber (peter@example.com)
  • Lisa Müller (lisa@example.com)
```

---

## Слайд 7: Zoom-Analyse — Insights

**Заголовок:** Verstehe das Engagement deiner Gäste
**Содержание:**
- **✅ Matched** — Gast hat sich über deinen Link registriert UND war auf Zoom → Heißer Lead!
- **❓ Unbekannt** — War auf Zoom, aber nicht über deinen Link registriert → Potentieller neuer Kontakt
- **⚠️ Registriert, aber nicht erschienen** — Hat sich angemeldet, aber nicht teilgenommen → Follow-up nötig!
- **⏱ Dauer** — Je länger ein Gast dabeigeblieben ist, desto interessierter ist er
- **💬 Fragen** — Gäste, die Fragen gestellt haben, zeigen hohes Interesse

**Priorisierung der Leads:**
1. 🔥 Längste Verweildauer + Fragen gestellt = Höchste Priorität
2. 🟡 Teilgenommen, aber früh gegangen = Medium Priorität
3. 🔵 Registriert, nicht erschienen = Trotzdem ansprechen!

---

## Слайд 8: KI Follow-up — /followup

**Заголовок:** KI-Assistent für personalisierte Follow-up-Nachrichten
**Содержание:**
- Sende /followup und wähle ein Event
- Der KI-Assistent (GPT-4o-mini) kennt:
  - Alle deine Gäste und ihr Engagement
  - Wer teilgenommen hat und wie lange
  - Wer Fragen gestellt hat
  - Wer nicht erschienen ist
- **Was du fragen kannst:**
  - "Schreibe eine Follow-up-Nachricht für Max Mustermann"
  - "Wen soll ich zuerst kontaktieren?"
  - "Erstelle eine Recruiting-Nachricht für Anna"
  - "Wie soll ich Peter ansprechen, der nicht gekommen ist?"
- Antworten sind personalisiert basierend auf den echten Daten
- Sende /exit um den Follow-up-Modus zu verlassen

**Bot-Nachricht Beispiel:**
```
🤖 KI Follow-up Assistent
📋 Event: AI TOOLS Webinar

Hier ist eine Übersicht deiner 5 Gäste.
Ich kann dir helfen mit:
• Follow-up-Nachrichten für einzelne Gäste
• Priorisierung der Leads
• Recruiting-Strategien

Frag mich einfach!
```

---

## Слайд 9: Alle Bot-Befehle — /help

**Заголовок:** Alle verfügbaren Befehle im Überblick

| Befehl | Funktion |
|--------|----------|
| /start | Registrierung als Partner |
| /invite | Einladungslink für ein Webinar erstellen |
| /events | Übersicht aller deiner Events und Gäste |
| /report | Detaillierter Bericht mit Zoom-Statistiken |
| /followup | KI-Assistent für Follow-up-Nachrichten |
| /help | Hilfe und Befehlsübersicht |

---

## Слайд 10: Der Workflow — Von der Einladung zum Abschluss

**Заголовок:** Dein Weg zum erfolgreichen Partnergewinn

**Flowchart / Ablauf:**
1. **📲 /invite** → Erstelle einen persönlichen Tracking-Link
2. **📤 Teilen** → Sende den Link an deine Kontakte
3. **📝 Registrierung** → Gäste melden sich an (du wirst sofort benachrichtigt)
4. **📹 Zoom** → Gäste treten dem Webinar bei
5. **📊 /report** → Analysiere Teilnahme, Dauer, Fragen
6. **🤖 /followup** → Lass die KI dir helfen, die besten Nachrichten zu formulieren
7. **🤝 Abschluss** → Kontaktiere priorisierte Leads und gewinne neue Partner

---

## Слайд 11: Abschluss

**Заголовок:** Starte jetzt mit dem JetUP Partner Bot!
**Содержание:**
- Öffne @JetUP_Partner_Bot in Telegram
- Registriere dich mit /start
- Erstelle deinen ersten Einladungslink mit /invite
- Nutze die KI für smartes Follow-up

**Tagline:** Dein digitaler Partner-Assistent. Immer erreichbar. Immer vorbereitet.
