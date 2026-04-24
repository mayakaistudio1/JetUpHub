# JetUP Partner Digital Hub — Funktionsübersicht

## 1. Dennis Fast Start Promo (100+100)

### Was ist das?
Neue Partner zahlen 100 USD in ihre TAG Balance ein und erhalten zusätzlich 100 USD Bonus. Mit dem 24x Amplify Modell werden insgesamt 200 USD genutzt, um ein 4.800 USD MT5-Konto zu erstellen, das mit der Sonic-Strategie verbunden wird.

### Ablauf für den Interessenten

1. **Anmeldung auf der Website**
   Der Interessent öffnet die JetUP-Website (jet-up.ai), sieht die Promo-Karte und klickt auf "Jetzt teilnehmen".

2. **Formular ausfüllen**
   Er gibt seinen Namen, seine E-Mail-Adresse und seine CU-Nummer ein (beginnt mit "CU"). Das System prüft automatisch auf Duplikate.

3. **Sofortige Benachrichtigung**
   Nach dem Absenden erhält das Team eine Telegram-Nachricht in der Admin-Gruppe mit allen Daten des Bewerbers.

4. **Google Sheets Erfassung**
   Die Bewerbung wird automatisch in ein Google Sheet eingetragen — mit Spalten für Name, E-Mail, CU-Nummer, Status und Verifizierung.

### Ablauf für das Admin-Team

5. **Prüfung in Google Sheets**
   Das Team prüft die Bewerbung (z.B. ob die CU-Nummer gültig ist, ob der Bewerber tatsächlich neu ist). Wenn alles stimmt, wird in der Spalte "Verified" ein "YES" eingetragen.

6. **Automatische Verifizierung**
   Alle 3 Minuten prüft das System automatisch das Google Sheet. Sobald "YES" erkannt wird:
   - Der Status in der Datenbank wird auf "verified" gesetzt
   - Eine Bestätigungs-E-Mail wird automatisch an den Bewerber gesendet
   - Eine Telegram-Benachrichtigung bestätigt die erfolgreiche Verifizierung

7. **Bestätigungs-E-Mail**
   Der Bewerber erhält eine professionelle E-Mail mit:
   - Bestätigung der Teilnahme an der 100+100 Promo
   - Übersicht der Konditionen (30 Tage Sperrfrist, 12 Monate für Bonus)
   - Hinweis zur Sonic-Strategie

### Verwaltung in der Admin-Oberfläche (Promo-Tab)

- **Angebote verwalten:** Promo-Titel, Beschreibung und Regeln erstellen und bearbeiten (mehrsprachig: DE/RU/EN)
- **Bewerbungen einsehen:** Alle Bewerbungen mit Status (pending/verified/duplicate) anzeigen
- **Status manuell ändern:** Bei Bedarf den Status direkt in der Admin-Oberfläche aktualisieren

---

## 2. Smart Invite System (Partner Bot)

### Was ist das?
Der @JetUP_Partner_Bot in Telegram ist ein persönliches Werkzeug für jeden JetUP-Partner. Er ermöglicht es, Einladungslinks für Webinare zu erstellen, Gäste zu tracken und mit KI-Unterstützung Follow-up-Nachrichten zu verfassen.

### Registrierung als Partner

1. Partner öffnet @JetUP_Partner_Bot in Telegram
2. Sendet `/start`
3. Bot fragt nach: Name, CU-Nummer, Telefon (optional), E-Mail (optional)
4. Nach Abschluss ist der Partner registriert und hat Zugriff auf alle Funktionen

### Einladungslink erstellen (`/invite`)

1. Partner sendet `/invite`
2. Bot zeigt alle aktiven, kommenden Webinare als Buttons an
3. Partner wählt ein Webinar aus
4. Bot generiert sofort einen persönlichen Link: `jet-up.ai/invite/ABC123`
5. Dieser Link ist einzigartig — er gehört nur diesem Partner für dieses Event

### Was passiert, wenn ein Gast den Link öffnet?

1. **Landing Page:** Der Gast sieht eine professionelle Einladungsseite mit Event-Details (Titel, Datum, Uhrzeit, Speaker, Highlights)
2. **Registrierung:** Der Gast gibt Name, E-Mail und Telefon ein
3. **Benachrichtigung:** Der Partner erhält sofort eine Telegram-Nachricht: "Neue Registrierung für dein Event!"
4. **Zoom-Weiterleitung:** Nach der Registrierung kann der Gast direkt dem Zoom-Meeting beitreten — der Klick wird getrackt

### Meine Events anzeigen (`/events`)

- Zeigt alle Einladungslinks des Partners mit Statistiken
- Pro Event: Anzahl Registrierungen und Zoom-Beitritte

### Bericht abrufen (`/report`)

Der Partner sendet `/report` und erhält einen detaillierten Bericht:

- **Registrierungen:** Wer hat sich über den Link angemeldet?
- **Zoom-Teilnahme:** Wer war tatsächlich im Webinar? (Daten aus der Zoom API)
- **Teilnahmedauer:** Wie lange war jeder Gast im Meeting?
- **Zeitstempel:** Wann ist der Gast beigetreten und wann gegangen?

Der Partner kann die Zoom-Daten jederzeit aktualisieren über den Button "Zoom-Daten aktualisieren".

### KI-Follow-up-Assistent (`/followup`)

1. Partner sendet `/followup` und wählt ein Event
2. Der KI-Assistent kennt alle Gäste, ihre Registrierungsdaten und Zoom-Teilnahme
3. Der Partner kann im Dialog Nachrichten generieren lassen:
   - Für Gäste, die dabei waren: Dankesnachricht mit nächsten Schritten
   - Für Gäste, die sich registriert, aber nicht teilgenommen haben: Freundliche Erinnerung mit Aufzeichnungslink
   - Für neue Kontakte: Einladung zum nächsten Webinar
4. Der Assistent passt Ton und Stil an die Wünsche des Partners an
5. Mit `/exit` wird der KI-Modus beendet

---

## 3. Zoom-Integration

### Was ist das?
Die direkte Anbindung an die Zoom API ermöglicht es, echte Teilnahmedaten aus Webinaren automatisch abzurufen — ohne manuelle Listen oder Abgleiche.

### Einrichtung (einmalig)

1. Im Zoom Marketplace ein Server-to-Server OAuth App erstellen
2. Benötigte Scopes: `report:read:list_meeting_participants:admin` und `user:read:list_users:admin`
3. Account ID, Client ID und Client Secret in der Admin-Oberfläche (Tab "Invites") eingeben
4. "Speichern & Testen" klicken — bei Erfolg erscheint ein grüner Punkt "Verbunden"

### Wie funktioniert der Datenabgleich?

- Nach jedem Webinar kann der Partner (oder Admin) die Zoom-Daten synchronisieren
- Das System ruft die Teilnehmerliste über die Zoom Reports API ab
- Jeder Teilnehmer wird per E-Mail mit den registrierten Gästen abgeglichen
- Ergebnis: Übersicht, wer tatsächlich teilgenommen hat, wie lange, und wann

### Daten die erfasst werden

| Datenpunkt | Beschreibung |
|------------|--------------|
| Name | Name des Zoom-Teilnehmers |
| E-Mail | E-Mail-Adresse des Teilnehmers |
| Beitrittszeit | Wann der Teilnehmer dem Meeting beigetreten ist |
| Austrittszeit | Wann der Teilnehmer das Meeting verlassen hat |
| Dauer | Gesamtdauer der Teilnahme in Minuten |

---

## 4. Admin-Oberfläche (jet-up.ai/admin)

Die Admin-Oberfläche bietet folgende Bereiche:

| Tab | Funktion |
|-----|----------|
| Chat Logs | Alle Chat-Sitzungen mit dem KI-Assistenten Dennis einsehen |
| Aktionen | Promo-Angebote verwalten (erstellen, bearbeiten, aktivieren) |
| Webinare | Webinar-Events erstellen und verwalten (Datum, Uhrzeit, Speaker, Highlights) |
| Sprecher | Speaker-Profile verwalten (Foto, Name, Rolle) |
| Promo | Promo-Bewerbungen einsehen und Status verwalten |
| Invites | Zoom-Verbindung konfigurieren, Partner-Einladungen mit Statistiken einsehen |
| Partners | Registrierte Partner anzeigen (Name, CU-Nummer, Telegram-Username) |

---

## Zusammenfassung: Der komplette Partner-Workflow

```
Partner registriert sich im Bot
        |
        v
Partner erstellt Einladungslink (/invite)
        |
        v
Partner teilt den Link mit Kontakten
        |
        v
Gast klickt Link → Landing Page → Registrierung
        |
        v
Partner erhält Benachrichtigung
        |
        v
Webinar findet statt (Zoom)
        |
        v
Partner ruft Bericht ab (/report) → Zoom-Daten werden synchronisiert
        |
        v
Partner nutzt KI-Assistent (/followup) → Personalisierte Nachrichten
        |
        v
Follow-up an Gäste senden → Neue Partner gewinnen
```

---

*JetUP Partner Digital Hub — Alle Tools in einem Telegram-Bot.*
