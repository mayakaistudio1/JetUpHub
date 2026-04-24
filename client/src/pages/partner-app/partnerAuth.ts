export function getPartnerAuthHeader(): Record<string, string> {
  const webToken = localStorage.getItem("partnerWebToken");
  if (webToken) return { "x-partner-token": webToken };
  if (process.env.NODE_ENV === "development") {
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id?.toString();
    if (userId) return { "x-telegram-id": userId };
  }
  return {};
}

export function clearPartnerSession(): void {
  sessionStorage.setItem("partnerLoggedOut", "true");
  localStorage.removeItem("partnerWebToken");
  localStorage.removeItem("partnerTelegramId");
  sessionStorage.removeItem("partnerTelegramId");
}

export function getStoredTelegramId(): string | null {
  return localStorage.getItem("partnerTelegramId");
}

export function hasPartnerSession(): boolean {
  if (sessionStorage.getItem("partnerLoggedOut") === "true") return false;
  return !!localStorage.getItem("partnerWebToken");
}
