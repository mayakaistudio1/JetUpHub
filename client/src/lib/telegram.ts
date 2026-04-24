// Mocking the Telegram WebApp object for development
export interface TelegramWebApps {
  WebApp: {
    ready: () => void;
    expand: () => void;
    close: () => void;
    MainButton: {
      text: string;
      color: string;
      textColor: string;
      isVisible: boolean;
      isActive: boolean;
      show: () => void;
      hide: () => void;
      onClick: (cb: () => void) => void;
      offClick: (cb: () => void) => void;
    };
    BackButton: {
      isVisible: boolean;
      show: () => void;
      hide: () => void;
      onClick: (cb: () => void) => void;
      offClick: (cb: () => void) => void;
    };
    themeParams: {
      bg_color?: string;
      text_color?: string;
      hint_color?: string;
      link_color?: string;
      button_color?: string;
      button_text_color?: string;
      secondary_bg_color?: string;
    };
    openLink: (url: string) => void;
    openTelegramLink: (url: string) => void;
  };
}

declare global {
  interface Window {
    Telegram: TelegramWebApps;
  }
}

export const tg = window.Telegram?.WebApp;

export const initTelegram = () => {
  if (tg) {
    tg.ready();
    tg.expand();
    
    // Set theme vars dynamically if needed, though CSS vars handle most
    // We could listen to themeChanged event here
  }
};
