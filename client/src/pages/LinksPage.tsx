import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronLeft, FileText, UserPlus, Download, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const LinksPage: React.FC = () => {
  const { language } = useLanguage();

  const pdfUrl = { ru: '/jetup-presentation-ru.pdf', en: '/jetup-presentation-en.pdf', de: '/jetup-presentation-de.pdf' }[language];

  const links = {
    ru: [
      { title: 'Регистрация', desc: 'JetUP IB Portal', url: 'https://jetup.ibportal.io', icon: UserPlus, color: 'bg-primary/10 text-primary' },
      { title: 'Презентация', desc: 'Скачать PDF', url: pdfUrl, icon: FileText, color: 'bg-red-500/10 text-red-500', showDownload: true },
    ],
    en: [
      { title: 'Registration', desc: 'JetUP IB Portal', url: 'https://jetup.ibportal.io', icon: UserPlus, color: 'bg-primary/10 text-primary' },
      { title: 'Presentation', desc: 'Download PDF', url: pdfUrl, icon: FileText, color: 'bg-red-500/10 text-red-500', showDownload: true },
    ],
    de: [
      { title: 'Registrierung', desc: 'JetUP IB Portal', url: 'https://jetup.ibportal.io', icon: UserPlus, color: 'bg-primary/10 text-primary' },
      { title: 'Präsentation', desc: 'PDF herunterladen', url: pdfUrl, icon: FileText, color: 'bg-red-500/10 text-red-500', showDownload: true },
    ],
  }[language];

  const pageTitle = { ru: 'Полезные ссылки', en: 'Useful Links', de: 'Nützliche Links' }[language];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-2 flex-shrink-0">
        <Link href="/">
          <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors shadow-sm">
            <ChevronLeft size={22} />
          </button>
        </Link>
        <h1 className="text-xl font-bold">{pageTitle}</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-3">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 pt-2"
        >
          {links.map((link, idx) => (
            <a key={idx} href={link.url} {...(link.showDownload ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })} className="block group">
              <Card className="p-4 flex items-center gap-4 border-none shadow-sm bg-card group-hover:bg-card/80 transition-all group-active:scale-98 rounded-2xl">
                <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center`}>
                  <link.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </div>
                {link.showDownload ? <Download size={20} className="text-muted-foreground" /> : <ExternalLink size={20} className="text-muted-foreground" />}
              </Card>
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LinksPage;
