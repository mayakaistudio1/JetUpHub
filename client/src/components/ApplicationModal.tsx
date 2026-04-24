import * as React from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { tg } from "@/lib/telegram";
import { useLanguage } from "@/contexts/LanguageContext";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const allTexts = {
    en: {
      title: 'Application',
      description: 'Fill out the form and we will contact you shortly.',
      name: 'Name',
      namePlaceholder: 'How should we call you?',
      contact: 'Contact',
      contactPlaceholder: 'Telegram or WhatsApp',
      interest: 'Interest',
      interestPlaceholder: 'Select topic',
      passive: 'Passive income',
      team: 'Building a team',
      general: 'General overview',
      submit: 'Submit',
      success: 'Thank you!',
      successMsg: 'We will contact you shortly.',
      error: 'An error occurred. Please try again.',
    },
    de: {
      title: 'Anfrage',
      description: 'Fülle das Formular aus und wir melden uns bei dir.',
      name: 'Name',
      namePlaceholder: 'Wie sollen wir dich nennen?',
      contact: 'Kontakt',
      contactPlaceholder: 'Telegram oder WhatsApp',
      interest: 'Interesse',
      interestPlaceholder: 'Thema wählen',
      passive: 'Passives Einkommen',
      team: 'Teamaufbau',
      general: 'Allgemeiner Überblick',
      submit: 'Absenden',
      success: 'Danke!',
      successMsg: 'Wir melden uns in Kürze bei dir.',
      error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
    },
    ru: {
      title: 'Заявка',
      description: 'Заполните форму, и мы свяжемся с вами в ближайшее время.',
      name: 'Имя',
      namePlaceholder: 'Как к вам обращаться?',
      contact: 'Контакт',
      contactPlaceholder: 'Telegram или WhatsApp',
      interest: 'Что интересно',
      interestPlaceholder: 'Выберите тему',
      passive: 'Пассивный доход',
      team: 'Построение команды',
      general: 'Общий обзор',
      submit: 'Отправить',
      success: 'Спасибо!',
      successMsg: 'Мы свяжемся с вами в ближайшее время.',
      error: 'Произошла ошибка. Попробуйте еще раз.',
    },
  };
  const texts = allTexts[language] || allTexts.de;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      contact: formData.get("contact") as string,
      interest: formData.get("interest") as string,
    };
    
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit application");
      }
      
      setIsSubmitting(false);
      setIsSuccess(true);
      form.reset();
      
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      setIsSubmitting(false);
      alert(texts.error);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-card flex flex-col rounded-t-[20px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 max-w-[420px] mx-auto outline-none">
          <div className="p-4 bg-card rounded-t-[20px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
            
            <div className="max-w-md mx-auto">
              {!isSuccess ? (
                <>
                  <Drawer.Title className="font-bold text-2xl mb-2 text-foreground">{texts.title}</Drawer.Title>
                  <Drawer.Description className="text-muted-foreground mb-6">
                    {texts.description}
                  </Drawer.Description>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{texts.name}</Label>
                      <Input id="name" name="name" placeholder={texts.namePlaceholder} required className="bg-background" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact">{texts.contact}</Label>
                      <Input id="contact" name="contact" placeholder={texts.contactPlaceholder} required className="bg-background" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="interest">{texts.interest}</Label>
                      <select
                        id="interest"
                        name="interest"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">{texts.interestPlaceholder}</option>
                        <option value="passive">{texts.passive}</option>
                        <option value="team">{texts.team}</option>
                        <option value="general">{texts.general}</option>
                      </select>
                    </div>
                    
                    <Button type="submit" className="w-full mt-4 font-bold rounded-xl h-12 text-base shadow-lg shadow-primary/20" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : texts.submit}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{texts.success}</h3>
                  <p className="text-muted-foreground">{texts.successMsg}</p>
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default ApplicationModal;
