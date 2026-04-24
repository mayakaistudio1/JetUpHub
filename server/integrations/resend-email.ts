import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendPromoVerificationEmail(to: string, name: string): Promise<boolean> {
  try {
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: "JetUp <noreply@jet-up.ai>",
      to: [to],
      subject: "Your Dennis Fast Start Bonus Has Been Confirmed",
      html: buildPromoConfirmationHtml(name),
    });

    if (error) {
      console.error("Resend email error:", error);
      return false;
    }

    console.log("Promo verification email sent to", to, "id:", data?.id);
    return true;
  } catch (error) {
    console.error("Failed to send promo verification email:", error);
    return false;
  }
}

function getAppUrl(): string {
  if (process.env.REPLIT_DEPLOYMENT_URL) return `https://${process.env.REPLIT_DEPLOYMENT_URL}`;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return "https://jet-up.ai";
}

function buildPromoConfirmationHtml(name: string): string {
  const appUrl = getAppUrl();
  const logoUrl = `${appUrl}/assets/jetup-logo-banner.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Dennis Fast Start Bonus Has Been Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:44px 40px;text-align:center;">
              <img src="${logoUrl}" alt="JetUp" style="height:72px;width:auto;" />
            </td>
          </tr>

          <tr>
            <td style="padding:48px 48px 20px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;width:64px;height:64px;background-color:#ecfdf5;border-radius:50%;line-height:64px;font-size:32px;color:#059669;">&#10003;</div>
              </div>
              <h1 style="margin:0 0 12px;color:#0f172a;font-size:26px;font-weight:800;text-align:center;letter-spacing:-0.5px;line-height:1.3;">
                Your additional 100 USD bonus<br>has been confirmed
              </h1>
              <p style="margin:0;color:#64748b;font-size:16px;text-align:center;font-weight:400;">
                Congratulations, <strong style="color:#0f172a;">${escapeHtml(name)}</strong>!
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 48px 32px;">
              <p style="margin:0 0 14px;color:#475569;font-size:15px;line-height:1.7;">
                Your participation in the <strong style="color:#0f172a;">Dennis Fast Start Promo</strong> has been successfully verified and confirmed by our broker Tag Markets.
              </p>
              <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">
                As part of this promotion, you have received an additional <strong style="color:#0f172a;">100 USD bonus</strong>, which is applied exclusively to the <strong style="color:#0f172a;">Sonic strategy</strong> within the <strong style="color:#0f172a;">24x Amplify</strong> model.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafe;border:1px solid #e8e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px 12px;">
                    <p style="margin:0;color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;">Promo Summary</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f1f1f5;color:#64748b;font-size:14px;">Additional Bonus</td>
                        <td style="padding:10px 0;border-top:1px solid #f1f1f5;color:#059669;font-size:14px;font-weight:700;text-align:right;">100 USD</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f1f1f5;color:#64748b;font-size:14px;">Strategy</td>
                        <td style="padding:10px 0;border-top:1px solid #f1f1f5;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">Sonic</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f1f1f5;color:#64748b;font-size:14px;">Model</td>
                        <td style="padding:10px 0;border-top:1px solid #f1f1f5;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">24x Amplify</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f1f1f5;color:#64748b;font-size:14px;">Status</td>
                        <td style="padding:10px 0;border-top:1px solid #f1f1f5;text-align:right;">
                          <span style="display:inline-block;background-color:#ecfdf5;color:#059669;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;">Confirmed</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="padding:8px 0;"></td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fefcf8;border:1px solid #f0e6d3;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px 12px;">
                    <p style="margin:0;color:#a08050;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;">Important Terms</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #f5edd9;color:#78622e;font-size:13px;line-height:1.6;">
                          <span style="color:#c4972a;margin-right:6px;">&#8226;</span> The additional 100 USD bonus is provided as part of the Dennis Fast Start Promo.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #f5edd9;color:#78622e;font-size:13px;line-height:1.6;">
                          <span style="color:#c4972a;margin-right:6px;">&#8226;</span> This promotion is available only for the Sonic strategy.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #f5edd9;color:#78622e;font-size:13px;line-height:1.6;">
                          <span style="color:#c4972a;margin-right:6px;">&#8226;</span> The initial personal funds can be withdrawn after 30 days.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #f5edd9;color:#78622e;font-size:13px;line-height:1.6;">
                          <span style="color:#c4972a;margin-right:6px;">&#8226;</span> If the initial personal funds are withdrawn before 12 months, the account will be liquidated and the promotion will end.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #f5edd9;color:#78622e;font-size:13px;line-height:1.6;">
                          <span style="color:#c4972a;margin-right:6px;">&#8226;</span> Profits can be withdrawn at any time.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #f5edd9;color:#78622e;font-size:13px;line-height:1.6;">
                          <span style="color:#c4972a;margin-right:6px;">&#8226;</span> Each partner can participate in this promotion only once.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 36px;text-align:center;">
              <p style="margin:0 0 16px;color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;">Follow Us</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://t.me/jet_up_official" style="display:inline-block;width:40px;height:40px;background-color:#f1f5f9;border-radius:10px;text-align:center;line-height:40px;text-decoration:none;border:1px solid #e2e8f0;">
                      <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram" style="width:20px;height:20px;vertical-align:middle;" />
                    </a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="https://www.youtube.com/@JetUP_official" style="display:inline-block;width:40px;height:40px;background-color:#f1f5f9;border-radius:10px;text-align:center;line-height:40px;text-decoration:none;border:1px solid #e2e8f0;">
                      <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style="width:20px;height:20px;vertical-align:middle;" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#fafafe;padding:24px 48px;border-top:1px solid #f1f1f5;">
              <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;text-align:center;">
                This is an automated message — please do not reply.
              </p>
              <p style="margin:0;text-align:center;">
                <a href="${appUrl}" style="color:#8b5cf6;font-size:12px;text-decoration:none;font-weight:500;">jet-up.ai</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendPromoNoMoneyEmail(to: string, name: string): Promise<boolean> {
  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: "JetUp <noreply@jet-up.ai>",
      to: [to],
      subject: "Your Promo Request Needs One More Step",
      html: buildPromoNoMoneyHtml(name),
    });
    if (error) {
      console.error("Resend no-money email error:", error);
      return false;
    }
    console.log("Promo no-money email sent to", to, "id:", data?.id);
    return true;
  } catch (error) {
    console.error("Failed to send promo no-money email:", error);
    return false;
  }
}

function buildPromoNoMoneyHtml(name: string): string {
  const appUrl = getAppUrl();
  const logoUrl = `${appUrl}/assets/jetup-logo-banner.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Promo Request Needs One More Step</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:44px 40px;text-align:center;">
              <img src="${logoUrl}" alt="JetUp" style="height:72px;width:auto;" />
            </td>
          </tr>

          <tr>
            <td style="padding:48px 48px 20px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;width:64px;height:64px;background-color:#fff7ed;border-radius:50%;line-height:64px;font-size:32px;">&#9888;</div>
              </div>
              <h1 style="margin:0 0 12px;color:#0f172a;font-size:26px;font-weight:800;text-align:center;letter-spacing:-0.5px;line-height:1.3;">
                Your Promo Request<br>Needs One More Step
              </h1>
              <p style="margin:0;color:#64748b;font-size:16px;text-align:center;font-weight:400;">
                Hello, <strong style="color:#0f172a;">${escapeHtml(name)}</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 48px 32px;">
              <p style="margin:0 0 14px;color:#475569;font-size:15px;line-height:1.7;">
                Thank you for your interest in the <strong style="color:#0f172a;">Dennis Fast Start Promo</strong>.
              </p>
              <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">
                We have reviewed your account and, at the moment of verification, your <strong style="color:#0f172a;">TAG Balance</strong> did not contain the required minimum of <strong style="color:#0f172a;">100 USD</strong> needed to participate in this promotion.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafe;border:1px solid #e8e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px 12px;">
                    <p style="margin:0;color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;">To Continue</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:12px 0;border-top:1px solid #f1f1f5;color:#475569;font-size:14px;line-height:1.6;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#f3f0ff;color:#7c3aed;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:10px;vertical-align:middle;">1</span>
                          Top up your <strong style="color:#0f172a;">TAG Balance</strong> with <strong style="color:#0f172a;">100 USD or more</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-top:1px solid #f1f1f5;color:#475569;font-size:14px;line-height:1.6;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#f3f0ff;color:#7c3aed;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:10px;vertical-align:middle;">2</span>
                          Once your balance has been updated, <strong style="color:#0f172a;">submit the registration form again</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-top:1px solid #f1f1f5;color:#475569;font-size:14px;line-height:1.6;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#f3f0ff;color:#7c3aed;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:10px;vertical-align:middle;">3</span>
                          After that, your request can be reviewed for approval
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:12px;">
                <tr>
                  <td style="padding:16px 24px;">
                    <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6;">
                      <span style="color:#d97706;margin-right:6px;">&#8226;</span>
                      Status: <span style="display:inline-block;background-color:#fef3c7;color:#b45309;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;margin-left:4px;">Balance Below 100 USD</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 36px;">
              <p style="margin:0;color:#64748b;font-size:15px;line-height:1.7;text-align:center;">
                Thank you for your understanding.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 36px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://t.me/jet_up_official" style="display:inline-block;width:40px;height:40px;background-color:#f1f5f9;border-radius:10px;text-align:center;line-height:40px;text-decoration:none;border:1px solid #e2e8f0;">
                      <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram" style="width:20px;height:20px;vertical-align:middle;" />
                    </a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="https://www.youtube.com/@JetUP_official" style="display:inline-block;width:40px;height:40px;background-color:#f1f5f9;border-radius:10px;text-align:center;line-height:40px;text-decoration:none;border:1px solid #e2e8f0;">
                      <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style="width:20px;height:20px;vertical-align:middle;" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#fafafe;padding:24px 48px;border-top:1px solid #f1f1f5;">
              <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;text-align:center;">
                This is an automated message — please do not reply.
              </p>
              <p style="margin:0;text-align:center;">
                <a href="${appUrl}" style="color:#8b5cf6;font-size:12px;text-decoration:none;font-weight:500;">jet-up.ai</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const guestEmailTranslations: Record<string, {
  confirmSubject: string;
  confirmHeading: string;
  confirmSubheading: string;
  eventDetails: string;
  eventLabel: string;
  dateLabel: string;
  timeLabel: string;
  speakerLabel: string;
  joinButton: string;
  confirmFooter: string;
  reminderSubject: string;
  reminderHeading: string;
  reminderSubheading: string;
  reminderFooter: string;
  automated: string;
}> = {
  en: {
    confirmSubject: "You're registered! Here are your webinar details",
    confirmHeading: "You're registered!",
    confirmSubheading: "Here are your details for the upcoming webinar.",
    eventDetails: "Event Details",
    eventLabel: "Event",
    dateLabel: "Date",
    timeLabel: "Time",
    speakerLabel: "Speaker",
    joinButton: "Join Zoom",
    confirmFooter: "Save the link — you'll need it to join the webinar.",
    reminderSubject: "Reminder: Your webinar starts soon!",
    reminderHeading: "Your webinar is starting soon!",
    reminderSubheading: "Don't forget — the webinar is about to begin. Click below to join.",
    reminderFooter: "Click the button above to join the Zoom meeting.",
    automated: "This is an automated message — please do not reply.",
  },
  de: {
    confirmSubject: "Du bist registriert! Deine Webinar-Details",
    confirmHeading: "Du bist registriert!",
    confirmSubheading: "Hier sind deine Details für das kommende Webinar.",
    eventDetails: "Event-Details",
    eventLabel: "Event",
    dateLabel: "Datum",
    timeLabel: "Uhrzeit",
    speakerLabel: "Referent",
    joinButton: "Zoom beitreten",
    confirmFooter: "Speichere den Link — du brauchst ihn, um am Webinar teilzunehmen.",
    reminderSubject: "Erinnerung: Dein Webinar beginnt bald!",
    reminderHeading: "Dein Webinar beginnt bald!",
    reminderSubheading: "Nicht vergessen — das Webinar fängt gleich an. Klicke unten, um beizutreten.",
    reminderFooter: "Klicke oben, um dem Zoom-Meeting beizutreten.",
    automated: "Dies ist eine automatische Nachricht — bitte nicht antworten.",
  },
  ru: {
    confirmSubject: "Вы зарегистрированы! Детали вебинара",
    confirmHeading: "Вы зарегистрированы!",
    confirmSubheading: "Вот ваши данные для предстоящего вебинара.",
    eventDetails: "Детали мероприятия",
    eventLabel: "Мероприятие",
    dateLabel: "Дата",
    timeLabel: "Время",
    speakerLabel: "Спикер",
    joinButton: "Войти в Zoom",
    confirmFooter: "Сохраните ссылку — она понадобится для входа на вебинар.",
    reminderSubject: "Напоминание: Ваш вебинар скоро начнётся!",
    reminderHeading: "Ваш вебинар скоро начнётся!",
    reminderSubheading: "Не забудьте — вебинар вот-вот начнётся. Нажмите ниже, чтобы войти.",
    reminderFooter: "Нажмите кнопку выше, чтобы войти в Zoom.",
    automated: "Это автоматическое сообщение — пожалуйста, не отвечайте.",
  },
};

function buildGuestWebinarEmailHtml(params: {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  timezone: string;
  speaker: string;
  zoomLink: string;
  goLink?: string;
  language: string;
  isReminder: boolean;
}): string {
  const appUrl = getAppUrl();
  const logoUrl = `${appUrl}/assets/jetup-logo-banner.png`;
  const lang = params.language in guestEmailTranslations ? params.language : "en";
  const t = guestEmailTranslations[lang];

  const heading = params.isReminder ? t.reminderHeading : t.confirmHeading;
  const subheading = params.isReminder ? t.reminderSubheading : t.confirmSubheading;
  const footer = params.isReminder ? t.reminderFooter : t.confirmFooter;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#3b82f6 50%,#60a5fa 100%);padding:44px 40px;text-align:center;">
              <img src="${logoUrl}" alt="JetUp" style="height:60px;width:auto;" />
            </td>
          </tr>

          <tr>
            <td style="padding:40px 48px 20px;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;width:64px;height:64px;background-color:#eff6ff;border-radius:50%;line-height:64px;font-size:32px;">🎉</div>
              </div>
              <h1 style="margin:0 0 10px;color:#0f172a;font-size:24px;font-weight:800;text-align:center;letter-spacing:-0.5px;line-height:1.3;">
                ${escapeHtml(heading)}
              </h1>
              <p style="margin:0;color:#64748b;font-size:15px;text-align:center;">
                ${escapeHtml(subheading)}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 48px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:16px 24px 12px;">
                    <p style="margin:0;color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;">${escapeHtml(t.eventDetails)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#64748b;font-size:14px;width:100px;">${escapeHtml(t.eventLabel)}</td>
                        <td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(params.eventTitle)}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#64748b;font-size:14px;">${escapeHtml(t.dateLabel)}</td>
                        <td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(params.eventDate)}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#64748b;font-size:14px;">${escapeHtml(t.timeLabel)}</td>
                        <td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(params.eventTime)}${params.timezone ? ` ${escapeHtml(params.timezone)}` : ""}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#64748b;font-size:14px;">${escapeHtml(t.speakerLabel)}</td>
                        <td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(params.speaker)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="padding:8px 0;"></td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 32px;text-align:center;">
              <a href="${params.goLink || params.zoomLink}" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
                🎥 ${escapeHtml(t.joinButton)}
              </a>
              <p style="margin:16px 0 0;color:#94a3b8;font-size:13px;">${escapeHtml(footer)}</p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#fafafe;padding:20px 48px;border-top:1px solid #f1f1f5;">
              <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;text-align:center;">
                ${escapeHtml(t.automated)}
              </p>
              <p style="margin:0;text-align:center;">
                <a href="${appUrl}" style="color:#2563eb;font-size:12px;text-decoration:none;font-weight:500;">jet-up.ai</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendGuestConfirmationEmail(params: {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  timezone: string;
  speaker: string;
  zoomLink: string;
  goLink?: string;
  language: string;
}): Promise<boolean> {
  try {
    const resend = getResendClient();
    const lang = params.language in guestEmailTranslations ? params.language : "en";
    const t = guestEmailTranslations[lang];

    const { data, error } = await resend.emails.send({
      from: "JetUp <noreply@jet-up.ai>",
      to: [params.to],
      subject: t.confirmSubject,
      html: buildGuestWebinarEmailHtml({ ...params, isReminder: false }),
    });

    if (error) {
      console.error("Guest confirmation email error:", error);
      return false;
    }

    console.log("Guest confirmation email sent to", params.to, "id:", data?.id);
    return true;
  } catch (error) {
    console.error("Failed to send guest confirmation email:", error);
    return false;
  }
}

export async function sendGuestReminderEmail(params: {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  timezone: string;
  speaker: string;
  zoomLink: string;
  goLink?: string;
  language: string;
}): Promise<boolean> {
  try {
    const resend = getResendClient();
    const lang = params.language in guestEmailTranslations ? params.language : "en";
    const t = guestEmailTranslations[lang];

    const { data, error } = await resend.emails.send({
      from: "JetUp <noreply@jet-up.ai>",
      to: [params.to],
      subject: t.reminderSubject,
      html: buildGuestWebinarEmailHtml({ ...params, isReminder: true }),
    });

    if (error) {
      console.error("Guest reminder email error:", error);
      return false;
    }

    console.log("Guest reminder email sent to", params.to, "id:", data?.id);
    return true;
  } catch (error) {
    console.error("Failed to send guest reminder email:", error);
    return false;
  }
}
