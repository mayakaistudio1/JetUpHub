import React, { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import WorkflowTab from "./CanvasWorkflowPage";
import {
  Shield,
  LogOut,
  MessageSquare,
  Tag,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Users,
  Upload,
  Globe,
  Loader2,
  Image as ImageIcon,
  FileSpreadsheet,
  ExternalLink,
  BarChart3,
  Brain,
  Gift,
  Link as LinkIcon,
  UserCheck,
  Video,
  Zap,
  HelpCircle,
  Mail,
} from "lucide-react";

type Tab = "chat" | "promotions" | "schedule" | "speakers" | "promo" | "invites" | "partners" | "workflow" | "videos" | "ama" | "contacts";

interface AnalysisSection {
  title: string;
  items: string[];
}

interface AnalysisReport {
  summary: string;
  sections: AnalysisSection[];
  sessionsAnalyzed: number;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
}

interface ChatSession {
  id: string;
  sessionId: string;
  type: string;
  language: string;
  createdAt: string;
  messageCount: number;
}

interface InviteGuest {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  registeredAt: string;
  clickedZoom: boolean;
  clickedAt?: string | null;
  attended?: boolean;
  durationMinutes?: number | null;
  questionsAsked?: number | null;
  joinTime?: string | null;
  isWalkIn?: boolean;
}

interface InviteEvent {
  id: number;
  partnerName: string;
  partnerCu: string;
  zoomLink: string;
  title: string;
  eventDate: string;
  eventTime: string;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  guestCount: number;
  clickedCount: number;
  zoomSyncedCount?: number;
}

interface GroupedGuest {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  registeredAt: string;
  clickedZoom: boolean;
  goClickedAt?: string | null;
  invitationMethod?: string | null;
  attended: boolean;
  durationMinutes?: number | null;
  questionsAsked?: number | null;
  joinTime?: string | null;
}

interface PartnerBreakdown {
  inviteEventId: number;
  partnerId: number | null;
  partnerName: string;
  partnerCu: string;
  inviteCode: string;
  isActive: boolean;
  registered: number;
  clicked: number;
  attended: number;
  walkIns: number;
  zoomSynced: number;
  guests: GroupedGuest[];
}

interface GroupedWebinar {
  scheduleEvent: {
    id: number;
    title: string;
    date: string;
    time: string;
    timezone: string;
    speaker: string;
    link: string;
    isActive: boolean;
  };
  stats: {
    totalPartners: number;
    totalInvited: number;
    totalRegistered: number;
    totalAttended: number;
  };
  partners: PartnerBreakdown[];
}

interface AdminPartner {
  id: number;
  name: string;
  cuNumber: string;
  telegramUsername?: string;
  phone?: string;
  email?: string;
  status: string;
  createdAt: string;
}

type AmaQuestionStatus = "pending" | "selected" | "answered";

interface AmaQuestionItem {
  id: number;
  name: string;
  contact: string;
  question: string;
  status: AmaQuestionStatus;
  createdAt: string;
}

interface Speaker {
  id?: number;
  name: string;
  photo: string;
  role: string;
  isActive: boolean;
}

interface Promotion {
  id?: number;
  badge: string;
  title: string;
  subtitle: string;
  banner: string;
  highlights: string[];
  ctaText: string;
  ctaLink: string;
  deadline: string;
  language: string;
  translationGroup?: string;
  isActive: boolean;
}

interface ScheduleEvent {
  id?: number;
  day: string;
  date: string;
  time: string;
  timezone: string;
  title: string;
  speaker: string;
  speakerId?: number | null;
  speakerPhoto?: string | null;
  type: string;
  typeBadge: string;
  banner: string;
  highlights: string[];
  link: string;
  language: string;
  languages?: string[];
  translationGroup?: string;
  actionUrl?: string;
  actionLabel?: string;
  isActive: boolean;
}

const emptySpeaker: Speaker = { name: "", photo: "", role: "", isActive: true };

const emptyPromotion: Promotion = {
  badge: "",
  title: "",
  subtitle: "",
  banner: "",
  highlights: [],
  ctaText: "",
  ctaLink: "",
  deadline: "",
  language: "de",
  isActive: true,
};

const emptyEvent: ScheduleEvent = {
  day: "",
  date: "",
  time: "",
  timezone: "CET",
  title: "",
  speaker: "",
  speakerId: null,
  type: "trading",
  typeBadge: "",
  banner: "",
  highlights: [],
  link: "",
  language: "de",
  actionUrl: "",
  actionLabel: "",
  isActive: true,
};

const LANG_LABELS: Record<string, string> = { de: "DE", en: "EN", ru: "RU" };
const LANG_COLORS: Record<string, string> = {
  de: "bg-yellow-100 text-yellow-700",
  en: "bg-blue-100 text-blue-700",
  ru: "bg-red-100 text-red-700",
};

function AdminPage() {
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuthError = (res: Response) => {
    if (res.status === 401) {
      setIsLoggedIn(false);
      setAdminPassword("");
      setLoginError("Sitzung abgelaufen. Bitte erneut anmelden.");
      return true;
    }
    return false;
  };

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatFilterType, setChatFilterType] = useState("all");
  const [chatDateFrom, setChatDateFrom] = useState("");
  const [chatDateTo, setChatDateTo] = useState("");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const [speakersList, setSpeakersList] = useState<Speaker[]>([]);
  const [speakersLoading, setSpeakersLoading] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [speakerFormOpen, setSpeakerFormOpen] = useState(false);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [promoFormOpen, setPromoFormOpen] = useState(false);

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);

  const [promoApps, setPromoApps] = useState<any[]>([]);
  const [promoAppsLoading, setPromoAppsLoading] = useState(false);

  const [dennisPromos, setDennisPromos] = useState<any[]>([]);
  const [dennisPromosLoading, setDennisPromosLoading] = useState(false);
  const [editingDennisPromo, setEditingDennisPromo] = useState<any | null>(null);
  const [dennisPromoFormOpen, setDennisPromoFormOpen] = useState(false);
  const [promoSubTab, setPromoSubTab] = useState<"offers" | "applications">("offers");

  const [videosList, setVideosList] = useState<VideoFormData[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [contactsList, setContactsList] = useState<ContactEntry[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoFormData | null>(null);
  const [videoFormOpen, setVideoFormOpen] = useState(false);
  const [videoFilterCategory, setVideoFilterCategory] = useState("all");
  const [videoFilterLang, setVideoFilterLang] = useState("all");

  const [amaQuestions, setAmaQuestions] = useState<AmaQuestionItem[]>([]);
  const [amaLoading, setAmaLoading] = useState(false);

  const [inviteEvents, setInviteEvents] = useState<InviteEvent[]>([]);
  const [adminPartners, setAdminPartners] = useState<AdminPartner[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [editingInvite, setEditingInvite] = useState<Partial<InviteEvent> | null>(null);
  const [inviteFormOpen, setInviteFormOpen] = useState(false);
  const [selectedInviteReport, setSelectedInviteReport] = useState<InviteEvent | null>(null);
  const [inviteGuests, setInviteGuests] = useState<InviteGuest[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [groupedWebinars, setGroupedWebinars] = useState<GroupedWebinar[]>([]);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      "x-admin-password": adminPassword,
    }),
    [adminPassword]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAdminPassword(password);
        setIsLoggedIn(true);
        setPassword("");
      } else {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.message || "Falsches Passwort");
      }
    } catch {
      setLoginError("Verbindungsfehler");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminPassword("");
    setPassword("");
    setChatSessions([]);
    setPromotions([]);
    setEvents([]);
    setSpeakersList([]);
  };

  const fetchChatSessions = useCallback(async () => {
    setChatLoading(true);
    try {
      const params = new URLSearchParams();
      if (chatFilterType !== "all") params.set("type", chatFilterType);
      if (chatDateFrom) params.set("from", chatDateFrom);
      if (chatDateTo) params.set("to", chatDateTo);
      const res = await fetch(`/api/admin/chat-sessions?${params.toString()}`, {
        headers: headers(),
      });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setChatSessions(await res.json());
      } else {
        setErrorMsg("Fehler beim Laden der Chat-Sitzungen");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setChatLoading(false);
    }
  }, [chatFilterType, chatDateFrom, chatDateTo, headers]);

  const exportCSV = async () => {
    try {
      const res = await fetch("/api/admin/chat-sessions/export", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "chat-sessions.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setErrorMsg("Export fehlgeschlagen");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchPromoApps = useCallback(async () => {
    setPromoAppsLoading(true);
    try {
      const res = await fetch("/api/admin/promo-applications", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setPromoApps(await res.json());
      else setErrorMsg("Fehler beim Laden der Promo-Anträge");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setPromoAppsLoading(false);
    }
  }, [headers]);

  const sendNoMoneyAdmin = async (id: number) => {
    if (!confirm("Send 'No Money' email to this applicant?")) return;
    try {
      const res = await fetch(`/api/admin/promo-applications/${id}/no-money`, {
        method: "PATCH",
        headers: headers(),
      });
      if (handleAuthError(res)) return;
      if (res.ok) fetchPromoApps();
      else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to send no-money email");
      }
    } catch {
      setErrorMsg("Connection error");
    }
  };

  const updatePromoAppStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/promo-applications/${id}/status`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status }),
      });
      if (handleAuthError(res)) return;
      if (res.ok) fetchPromoApps();
      else setErrorMsg("Fehler beim Aktualisieren");
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const exportPromoAppsCSV = () => {
    const csvHeader = "ID,Name,Email,CU Number,Status,Date\n";
    const csvRows = promoApps.map((a: any) =>
      `${a.id},"${a.name}","${a.email}","${a.cuNumber}","${a.status}","${new Date(a.createdAt).toLocaleString()}"`
    ).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `promo-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fetchDennisPromos = useCallback(async () => {
    setDennisPromosLoading(true);
    try {
      const res = await fetch("/api/admin/dennis-promos", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setDennisPromos(await res.json());
      else setErrorMsg("Fehler beim Laden der Dennis Promos");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setDennisPromosLoading(false);
    }
  }, [headers]);

  const saveDennisPromo = async (promo: any) => {
    const method = promo.id ? "PUT" : "POST";
    const url = promo.id ? `/api/admin/dennis-promos/${promo.id}` : "/api/admin/dennis-promos";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(promo) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setDennisPromoFormOpen(false);
        setEditingDennisPromo(null);
        fetchDennisPromos();
      } else {
        setErrorMsg("Fehler beim Speichern");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const deleteDennisPromo = async (id: number) => {
    if (!confirm("Promo wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/admin/dennis-promos/${id}`, { method: "DELETE", headers: headers() });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchDennisPromos();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchSpeakers = useCallback(async () => {
    setSpeakersLoading(true);
    try {
      const res = await fetch("/api/admin/speakers", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setSpeakersList(await res.json());
      else setErrorMsg("Fehler beim Laden der Sprecher");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setSpeakersLoading(false);
    }
  }, [headers]);

  const saveSpeaker = async (speaker: Speaker) => {
    const method = speaker.id ? "PUT" : "POST";
    const url = speaker.id ? `/api/admin/speakers/${speaker.id}` : "/api/admin/speakers";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(speaker) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setSpeakerFormOpen(false);
        setEditingSpeaker(null);
        fetchSpeakers();
      } else {
        setErrorMsg("Fehler beim Speichern");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const deleteSpeaker = async (id: number) => {
    if (!confirm("Sprecher wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/admin/speakers/${id}`, { method: "DELETE", headers: headers() });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchSpeakers();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchPromotions = useCallback(async () => {
    setPromoLoading(true);
    try {
      const res = await fetch("/api/admin/promotions", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setPromotions(await res.json());
      else setErrorMsg("Fehler beim Laden der Aktionen");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setPromoLoading(false);
    }
  }, [headers]);

  const savePromotion = async (promo: Promotion) => {
    const method = promo.id ? "PUT" : "POST";
    const url = promo.id ? `/api/admin/promotions/${promo.id}` : "/api/admin/promotions";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(promo) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setPromoFormOpen(false);
        setEditingPromo(null);
        fetchPromotions();
      } else {
        setErrorMsg("Fehler beim Speichern der Aktion");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const deletePromotion = async (id: number) => {
    if (!confirm("Aktion wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE", headers: headers() });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchPromotions();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await fetch("/api/admin/schedule-events", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setEvents(await res.json());
      else setErrorMsg("Fehler beim Laden der Events");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setEventsLoading(false);
    }
  }, [headers]);

  const saveEvent = async (event: ScheduleEvent) => {
    const method = event.id ? "PUT" : "POST";
    const url = event.id ? `/api/admin/schedule-events/${event.id}` : "/api/admin/schedule-events";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(event) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        const data = await res.json();
        setEventFormOpen(false);
        setEditingEvent(null);
        fetchEvents();
        if (data.multiLang) {
          alert(`Event in ${data.count} Sprachen erstellt: ${data.languages.map((l: string) => l.toUpperCase()).join(", ")}`);
        }
      } else {
        setErrorMsg("Fehler beim Speichern des Events");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("Event wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/admin/schedule-events/${id}`, { method: "DELETE", headers: headers() });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchEvents();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchVideos = useCallback(async () => {
    setVideosLoading(true);
    try {
      const res = await fetch("/api/admin/tutorials", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setVideosList(await res.json());
      else setErrorMsg("Fehler beim Laden der Videos");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setVideosLoading(false);
    }
  }, [headers]);

  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const res = await fetch("/api/applications", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setContactsList(await res.json());
      else setErrorMsg("Fehler beim Laden der Kontaktanfragen");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setContactsLoading(false);
    }
  }, [headers]);

  const saveVideo = async (video: VideoFormData) => {
    const method = video.id ? "PUT" : "POST";
    const url = video.id ? `/api/admin/tutorials/${video.id}` : "/api/admin/tutorials";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(video) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setVideoFormOpen(false);
        setEditingVideo(null);
        fetchVideos();
      } else {
        setErrorMsg("Fehler beim Speichern");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const deleteVideo = async (id: number) => {
    if (!confirm("Video wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/admin/tutorials/${id}`, { method: "DELETE", headers: headers() });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchVideos();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchAmaQuestions = useCallback(async () => {
    setAmaLoading(true);
    try {
      const res = await fetch("/api/ama/questions", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setAmaQuestions(await res.json());
      else setErrorMsg("Fehler beim Laden der AMA-Fragen");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setAmaLoading(false);
    }
  }, [headers]);

  const updateAmaQuestionStatus = async (id: number, status: AmaQuestionStatus) => {
    try {
      const res = await fetch(`/api/ama/questions/${id}/status`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status }),
      });
      if (handleAuthError(res)) return;
      if (res.ok) fetchAmaQuestions();
      else setErrorMsg("Fehler beim Aktualisieren");
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/partners", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setAdminPartners(await res.json());
    } catch {}
  }, [headers]);

  const fetchInviteEvents = useCallback(async () => {
    setInvitesLoading(true);
    try {
      const res = await fetch("/api/admin/invite-events", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setInviteEvents(await res.json());
      else setErrorMsg("Fehler beim Laden der Einladungen");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setInvitesLoading(false);
    }
  }, [headers]);

  const fetchGroupedInvites = useCallback(async () => {
    setInvitesLoading(true);
    try {
      const res = await fetch("/api/admin/invites-grouped", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setGroupedWebinars(await res.json());
      else setErrorMsg("Fehler beim Laden der Einladungen");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setInvitesLoading(false);
    }
  }, [headers]);

  const saveInviteEvent = async (event: Partial<InviteEvent>) => {
    const method = "POST";
    const url = "/api/admin/invite-events";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(event) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setInviteFormOpen(false);
        setEditingInvite(null);
        fetchInviteEvents();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Fehler beim Speichern");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchInviteReport = async (id: number) => {
    setGuestsLoading(true);
    try {
      const res = await fetch(`/api/admin/invite-events/${id}/report`, { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) {
        const data = await res.json();
        setInviteGuests(data.guests);
        setSelectedInviteReport(data.event);
      } else {
        setErrorMsg("Fehler beim Laden des Berichts");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setGuestsLoading(false);
    }
  };

  const sendInviteTelegramReport = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/invite-events/${id}/send-report`, {
        method: "POST",
        headers: headers(),
      });
      if (handleAuthError(res)) return;
      if (res.ok) {
        alert("Bericht gesendet!");
      } else {
        setErrorMsg("Fehler beim Senden des Berichts");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const syncZoomData = async (eventId: number) => {
    try {
      const res = await fetch(`/api/admin/zoom-sync/${eventId}`, {
        method: "POST",
        headers: headers(),
      });
      if (handleAuthError(res)) return;
      const data = await res.json();
      if (data.error) {
        alert(`Zoom Sync: ${data.error}`);
      } else {
        alert(`Zoom Sync: ${data.synced} synchronisiert, ${data.skipped} übersprungen`);
        fetchInviteEvents();
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab === "chat") fetchChatSessions();
    if (activeTab === "promotions") fetchPromotions();
    if (activeTab === "schedule") { fetchEvents(); fetchSpeakers(); }
    if (activeTab === "speakers") fetchSpeakers();
    if (activeTab === "promo") { fetchPromoApps(); fetchDennisPromos(); }
    if (activeTab === "invites") { fetchGroupedInvites(); fetchInviteEvents(); }
    if (activeTab === "partners") fetchPartners();
    if (activeTab === "videos") fetchVideos();
    if (activeTab === "ama") fetchAmaQuestions();
    if (activeTab === "contacts") fetchContacts();
  }, [isLoggedIn, activeTab, fetchChatSessions, fetchPromotions, fetchEvents, fetchSpeakers, fetchPromoApps, fetchInviteEvents, fetchGroupedInvites, fetchPartners, fetchVideos, fetchAmaQuestions, fetchContacts]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center mb-4 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">JetApp Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Admin-Bereich Login</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                data-testid="input-admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Passwort"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
              />
              <button
                type="button"
                data-testid="button-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {loginError && (
              <p data-testid="text-login-error" className="text-red-500 text-sm text-center">
                {loginError}
              </p>
            )}
            <button
              data-testid="button-admin-login"
              type="submit"
              disabled={loginLoading || !password}
              className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loginLoading ? "..." : "Einloggen"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "chat", label: "Chat Logs", icon: <MessageSquare size={18} /> },
    { key: "promotions", label: "Aktionen", icon: <Tag size={18} /> },
    { key: "schedule", label: "Webinare", icon: <Calendar size={18} /> },
    { key: "speakers", label: "Sprecher", icon: <Users size={18} /> },
    { key: "promo", label: "Promo", icon: <Gift size={18} /> },
    { key: "invites", label: "Invites", icon: <LinkIcon size={18} /> },
    { key: "partners", label: "Partners", icon: <UserCheck size={18} /> },
    { key: "videos", label: "Videos", icon: <Video size={18} /> },
    { key: "ama", label: "AMA", icon: <HelpCircle size={18} /> },
    { key: "contacts", label: "Contacts", icon: <Mail size={18} /> },
    { key: "workflow", label: "Workflow", icon: <Zap size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {errorMsg && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white px-3 md:px-6 py-3 flex items-center justify-between" data-testid="error-banner">
          <span className="text-sm font-medium">{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-white hover:text-red-100"><X size={18} /></button>
        </div>
      )}
      <header className={`bg-white border-b border-gray-200 px-3 md:px-6 py-3 flex items-center justify-between sticky ${errorMsg ? 'top-10' : 'top-0'} z-50 gap-2`}>
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 hidden md:block">JetApp Admin</h1>
        </div>
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto flex-1 min-w-0 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              data-testid={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-2.5 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 min-h-[44px] md:min-h-0 ${
                activeTab === tab.key
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <button
          data-testid="button-admin-logout"
          onClick={handleLogout}
          className="flex items-center gap-2 px-2.5 md:px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex-shrink-0 min-h-[44px] md:min-h-0"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </header>

      <main className="flex-1 p-3 md:p-6">
        {activeTab === "chat" && (
          <ChatLogsTab
            sessions={chatSessions}
            loading={chatLoading}
            filterType={chatFilterType}
            setFilterType={setChatFilterType}
            dateFrom={chatDateFrom}
            setDateFrom={setChatDateFrom}
            dateTo={chatDateTo}
            setDateTo={setChatDateTo}
            onSearch={fetchChatSessions}
            onExport={exportCSV}
            expandedSession={expandedSession}
            setExpandedSession={setExpandedSession}
            headers={headers}
          />
        )}
        {activeTab === "promotions" && (
          <PromotionsTab
            promotions={promotions}
            loading={promoLoading}
            formOpen={promoFormOpen}
            setFormOpen={setPromoFormOpen}
            editing={editingPromo}
            setEditing={setEditingPromo}
            onSave={savePromotion}
            onDelete={deletePromotion}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "schedule" && (
          <ScheduleTab
            events={events}
            loading={eventsLoading}
            formOpen={eventFormOpen}
            setFormOpen={setEventFormOpen}
            editing={editingEvent}
            setEditing={setEditingEvent}
            onSave={saveEvent}
            onDelete={deleteEvent}
            speakers={speakersList}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "speakers" && (
          <SpeakersTab
            speakers={speakersList}
            loading={speakersLoading}
            formOpen={speakerFormOpen}
            setFormOpen={setSpeakerFormOpen}
            editing={editingSpeaker}
            setEditing={setEditingSpeaker}
            onSave={saveSpeaker}
            onDelete={deleteSpeaker}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "promo" && (
          <DennisPromoTab
            dennisPromos={dennisPromos}
            dennisPromosLoading={dennisPromosLoading}
            formOpen={dennisPromoFormOpen}
            setFormOpen={setDennisPromoFormOpen}
            editing={editingDennisPromo}
            setEditing={setEditingDennisPromo}
            onSave={saveDennisPromo}
            onDelete={deleteDennisPromo}
            promoApps={promoApps}
            promoAppsLoading={promoAppsLoading}
            updatePromoAppStatus={updatePromoAppStatus}
            sendNoMoneyAdmin={sendNoMoneyAdmin}
            exportPromoAppsCSV={exportPromoAppsCSV}
            promoSubTab={promoSubTab}
            setPromoSubTab={setPromoSubTab}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "invites" && (
          <InvitesTab
            groupedWebinars={groupedWebinars}
            loading={invitesLoading}
            headers={headers}
            onRefresh={fetchGroupedInvites}
            onSendTelegramReport={sendInviteTelegramReport}
          />
        )}
        {activeTab === "partners" && (
          <PartnersTab partners={adminPartners} onDelete={async (id) => {
            if (!confirm("Partner wirklich löschen? Alle persönlichen Einladungen dieses Partners werden ebenfalls gelöscht.")) return;
            try {
              const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE", headers: headers() });
              if (res.ok) fetchPartners();
            } catch {}
          }} />
        )}
        {activeTab === "videos" && (
          <VideosTab
            videos={videosList}
            loading={videosLoading}
            formOpen={videoFormOpen}
            setFormOpen={setVideoFormOpen}
            editing={editingVideo}
            setEditing={setEditingVideo}
            onSave={saveVideo}
            onDelete={deleteVideo}
            onBulkSave={async (items: VideoFormData[]) => {
              let saved = 0;
              for (const item of items) {
                try {
                  const res = await fetch("/api/admin/tutorials", { method: "POST", headers: headers(), body: JSON.stringify(item) });
                  if (res.ok) saved++;
                } catch {}
              }
              fetchVideos();
              return saved;
            }}
            filterCategory={videoFilterCategory}
            setFilterCategory={setVideoFilterCategory}
            filterLang={videoFilterLang}
            setFilterLang={setVideoFilterLang}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "ama" && (
          <AmaTab
            questions={amaQuestions}
            loading={amaLoading}
            onUpdateStatus={updateAmaQuestionStatus}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "contacts" && (
          <ContactsTab contacts={contactsList} loading={contactsLoading} onRefresh={fetchContacts} />
        )}
        {activeTab === "workflow" && (
          <WorkflowTab />
        )}
      </main>
    </div>
  );
}

interface ContactEntry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

type SortKey = "name" | "email" | "subject" | "createdAt";

function ContactsTab({ contacts, loading, onRefresh }: { contacts: ContactEntry[]; loading: boolean; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = contacts
    .filter(c => [c.name, c.email, c.subject, c.message].join(" ").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortKey] ?? "";
      const vb = b[sortKey] ?? "";
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className={`inline-block ml-1 text-xs ${sortKey === col ? "text-purple-600" : "text-gray-300"}`}>
      {sortKey === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Contact Form Submissions ({contacts.length})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-48"
              data-testid="contacts-search"
            />
          </div>
          <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
          {search ? "No results found." : "No contact form submissions yet."}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="contacts-table">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none whitespace-nowrap" onClick={() => handleSort("name")} data-testid="sort-name">
                    Name <SortIcon col="name" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none whitespace-nowrap" onClick={() => handleSort("email")} data-testid="sort-email">
                    Email <SortIcon col="email" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none whitespace-nowrap" onClick={() => handleSort("subject")} data-testid="sort-subject">
                    Subject <SortIcon col="subject" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none whitespace-nowrap" onClick={() => handleSort("createdAt")} data-testid="sort-date">
                    Date <SortIcon col="createdAt" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <React.Fragment key={c.id}>
                    <tr
                      className="border-b border-gray-50 hover:bg-purple-50 cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                      data-testid={`contact-row-${c.id}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900" data-testid={`contact-name-${c.id}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs flex-shrink-0">
                            {c.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          {c.name}
                        </div>
                      </td>
                      <td className="px-4 py-3" data-testid={`contact-email-${c.id}`}>
                        <a href={`mailto:${c.email}`} className="text-purple-600 hover:underline" onClick={e => e.stopPropagation()}>
                          {c.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate" data-testid={`contact-subject-${c.id}`}>
                        {c.subject}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[260px] truncate hidden lg:table-cell">
                        {c.message}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(c.createdAt).toLocaleString("de-DE")}
                      </td>
                    </tr>
                    {expanded === c.id && (
                      <tr className="bg-purple-50">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap" data-testid={`contact-message-${c.id}`}>
                            {c.message}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatLogsTab({
  sessions, loading, filterType, setFilterType, dateFrom, setDateFrom, dateTo, setDateTo, onSearch, onExport, expandedSession, setExpandedSession, headers,
}: {
  sessions: ChatSession[]; loading: boolean; filterType: string; setFilterType: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void; dateTo: string; setDateTo: (v: string) => void;
  onSearch: () => void; onExport: () => void; expandedSession: string | null; setExpandedSession: (v: string | null) => void;
  headers: () => Record<string, string>;
}) {
  const [loadedMessages, setLoadedMessages] = useState<Record<string, any[]>>({});
  const [messagesLoading, setMessagesLoading] = useState<string | null>(null);
  const [sheetsSyncing, setSheetsSyncing] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState<string | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [analysisLang, setAnalysisLang] = useState<string>("all");
  const [analysisChatType, setAnalysisChatType] = useState<string>("text");
  const [analysisReportLang, setAnalysisReportLang] = useState<string>("de");
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [promptIsOverride, setPromptIsOverride] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptSaving, setPromptSaving] = useState(false);
  const [promptSaveOk, setPromptSaveOk] = useState(false);

  const handleSyncSheets = async () => {
    setSheetsSyncing(true);
    setSheetsError(null);
    setSheetsUrl(null);
    try {
      const res = await fetch("/api/admin/sync-sheets", { method: "POST", headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setSheetsUrl(data.spreadsheetUrl);
      } else {
        const err = await res.json().catch(() => ({}));
        setSheetsError(err.error || "Sync fehlgeschlagen");
      }
    } catch {
      setSheetsError("Verbindungsfehler");
    } finally {
      setSheetsSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalysisRunning(true);
    setAnalysisError(null);
    setAnalysisReport(null);
    setExpandedSections({});
    try {
      const res = await fetch("/api/admin/analyze-maria", {
        method: "POST",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ language: analysisLang, chatType: analysisChatType, reportLanguage: analysisReportLang }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisReport(data);
        const initial: Record<number, boolean> = {};
        data.sections?.forEach((_: any, i: number) => { initial[i] = true; });
        setExpandedSections(initial);
      } else {
        const err = await res.json().catch(() => ({}));
        setAnalysisError(err.error || "Analyse fehlgeschlagen");
      }
    } catch {
      setAnalysisError("Verbindungsfehler");
    } finally {
      setAnalysisRunning(false);
    }
  };

  const handleExportDialogues = () => {
    const params = new URLSearchParams({ language: analysisLang, chatType: analysisChatType });
    const url = `/api/admin/export-dialogues?${params.toString()}`;
    fetch(url, { headers: headers() })
      .then(async (res) => {
        if (!res.ok) throw new Error("Export failed");
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `dialogues-${analysisChatType}-${analysisLang}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => {});
  };

  const loadPrompt = async () => {
    setPromptLoading(true);
    try {
      const mode = analysisChatType === "video" ? "video" : "text";
      const lang = analysisLang === "all" ? "de" : analysisLang;
      const res = await fetch(`/api/admin/maria-prompt?mode=${mode}&language=${lang}`, {
        headers: headers(),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentPrompt(data.prompt || "");
        setPromptIsOverride(data.isOverride || false);
      }
    } catch {}
    setPromptLoading(false);
  };

  const handlePromptExpand = () => {
    setPromptExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (promptExpanded) {
      setPromptLoading(true);
      const mode = analysisChatType === "video" ? "video" : "text";
      const lang = analysisLang === "all" ? "de" : analysisLang;
      fetch(`/api/admin/maria-prompt?mode=${mode}&language=${lang}`, { headers: headers() })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setCurrentPrompt(data.prompt || "");
            setPromptIsOverride(data.isOverride || false);
          }
        })
        .catch(() => {})
        .finally(() => setPromptLoading(false));
    }
  }, [analysisChatType, analysisLang, promptExpanded]);

  const handleSavePrompt = async () => {
    setPromptSaving(true);
    setPromptSaveOk(false);
    try {
      const mode = analysisChatType === "video" ? "video" : "text";
      const lang = analysisLang === "all" ? "de" : analysisLang;
      const res = await fetch("/api/admin/maria-prompt", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ mode, language: lang, prompt: currentPrompt }),
      });
      if (res.ok) {
        setPromptSaveOk(true);
        setPromptIsOverride(true);
        setTimeout(() => setPromptSaveOk(false), 3000);
      }
    } catch {}
    setPromptSaving(false);
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleExpand = async (sessionId: string) => {
    if (expandedSession === sessionId) { setExpandedSession(null); return; }
    setExpandedSession(sessionId);
    if (!loadedMessages[sessionId]) {
      setMessagesLoading(sessionId);
      try {
        const res = await fetch(`/api/admin/chat-sessions/${sessionId}/messages`, { headers: headers() });
        if (res.ok) {
          const msgs = await res.json();
          setLoadedMessages((prev) => ({ ...prev, [sessionId]: msgs }));
        }
      } catch {}
      setMessagesLoading(null);
    }
  };

  const handleExportSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/chat-sessions/${sessionId}/export`, { headers: headers() });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chat-${sessionId.substring(0, 8)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
        <div className="flex flex-wrap items-end gap-3 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Typ</label>
            <select data-testid="select-chat-type" value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="all">Alle</option>
              <option value="text">Text</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Von</label>
            <input data-testid="input-date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bis</label>
            <input data-testid="input-date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <button data-testid="button-search-chats" onClick={onSearch}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            <Search size={16} /> Suchen
          </button>
          <button data-testid="button-export-csv" onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-auto">
            <Download size={16} /> Export CSV
          </button>
          <button data-testid="button-sync-sheets" onClick={handleSyncSheets} disabled={sheetsSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {sheetsSyncing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            {sheetsSyncing ? "Sync..." : "Google Sheets"}
          </button>
        </div>
        {sheetsUrl && (
          <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <Check size={16} />
            <span>Synchronisiert!</span>
            <a href={sheetsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-700 underline font-medium hover:text-green-900" data-testid="link-sheets-url">
              Google Sheet öffnen <ExternalLink size={14} />
            </a>
          </div>
        )}
        {sheetsError && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {sheetsError}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Modus</label>
              <select data-testid="select-analysis-type" value={analysisChatType} onChange={(e) => setAnalysisChatType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="text">Text Chat</option>
                <option value="video">Live Avatar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dialoge</label>
              <select data-testid="select-analysis-lang" value={analysisLang} onChange={(e) => setAnalysisLang(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">Alle Sprachen</option>
                <option value="de">Deutsch</option>
                <option value="ru">Russisch</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bericht</label>
              <select data-testid="select-report-lang" value={analysisReportLang} onChange={(e) => setAnalysisReportLang(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="de">Deutsch</option>
                <option value="ru">Russisch</option>
              </select>
            </div>
            <div className="pt-5 flex items-center gap-2">
              <button data-testid="button-analyze-maria" onClick={handleAnalyze} disabled={analysisRunning}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {analysisRunning ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                {analysisRunning ? "Analyse läuft..." : "Analyse Марии"}
              </button>
              <button data-testid="button-export-dialogues" onClick={handleExportDialogues}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                <Download size={16} />
                Dialoge laden
              </button>
            </div>
          </div>
          {analysisError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {analysisError}
            </div>
          )}

          <div className="mt-4 border-t border-gray-100 pt-4">
            <button data-testid="button-toggle-prompt" onClick={handlePromptExpand}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {promptExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              Aktueller Prompt
              {promptIsOverride && <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">geändert</span>}
            </button>
            {promptExpanded && (
              <div className="mt-3">
                {promptLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={14} className="animate-spin" /> Lade Prompt...</div>
                ) : (
                  <>
                    <textarea
                      data-testid="textarea-maria-prompt"
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      rows={14}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <button data-testid="button-save-prompt" onClick={handleSavePrompt} disabled={promptSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        {promptSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Speichern
                      </button>
                      {promptSaveOk && <span className="text-sm text-green-600">Gespeichert!</span>}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {analysisReport && (
        <div className="bg-white rounded-xl border border-indigo-200 overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-indigo-600" />
              <div>
                <h3 className="font-semibold text-indigo-900" data-testid="text-analysis-title">
                  Analyse — {analysisChatType === "video" ? "Live Avatar" : "Text Chat"}
                </h3>
                <p className="text-xs text-indigo-600" data-testid="text-analysis-count">{analysisReport.sessionsAnalyzed} Sitzungen analysiert</p>
              </div>
            </div>
            <button data-testid="button-close-analysis" onClick={() => setAnalysisReport(null)}
              className="p-1 text-indigo-400 hover:text-indigo-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800" data-testid="text-analysis-summary">
              {analysisReport.summary}
            </div>
            <div className="space-y-3">
              {analysisReport.sections.map((section, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button data-testid={`button-section-${idx}`} onClick={() => toggleSection(idx)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                    <span className="font-medium text-sm text-gray-800">{section.title}</span>
                    {expandedSections[idx] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  {expandedSections[idx] && (
                    <div className="p-3 space-y-2">
                      {section.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex gap-2 text-sm text-gray-700" data-testid={`text-analysis-item-${idx}-${iIdx}`}>
                          <span className="text-indigo-400 mt-0.5 shrink-0">&#8226;</span>
                          <span className="whitespace-pre-wrap">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Laden...</div>
        ) : sessions.length === 0 ? (
          <div data-testid="text-no-sessions" className="p-8 text-center text-gray-500">Keine Chat-Sitzungen gefunden</div>
        ) : (
          <table className="w-full min-w-[600px] md:min-w-0">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Session ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Typ</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sprache</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Datum</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nachrichten</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <React.Fragment key={session.sessionId}>
                  <tr data-testid={`row-session-${session.sessionId}`}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleExpand(session.sessionId)}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{session.sessionId.substring(0, 12)}...</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${session.type === "video" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{session.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{session.language}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(session.createdAt).toLocaleDateString("de-DE")}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{session.messageCount || 0}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button
                        data-testid={`button-export-session-${session.sessionId}`}
                        onClick={(e) => handleExportSession(e, session.sessionId)}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                        title="Download CSV"
                      >
                        <Download size={14} />
                      </button>
                      <span className="text-gray-400">{expandedSession === session.sessionId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                    </td>
                  </tr>
                  {expandedSession === session.sessionId && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 bg-gray-50">
                        <div className="max-h-96 overflow-y-auto space-y-2 px-2">
                          {messagesLoading === session.sessionId ? (
                            <p className="text-sm text-gray-400 text-center py-4">Laden...</p>
                          ) : (loadedMessages[session.sessionId] || []).length > 0 ? (
                            (loadedMessages[session.sessionId] || []).map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user" ? "bg-purple-600 text-white rounded-br-md" : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"}`}>
                                  <p className="text-xs font-semibold mb-1 opacity-70">{msg.role === "user" ? "User" : "Maria"}</p>
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-4">Keine Nachrichten</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SpeakersTab({
  speakers, loading, formOpen, setFormOpen, editing, setEditing, onSave, onDelete, adminPassword,
}: {
  speakers: Speaker[]; loading: boolean; formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: Speaker | null; setEditing: (v: Speaker | null) => void;
  onSave: (s: Speaker) => void; onDelete: (id: number) => void; adminPassword: string;
}) {
  const openNew = () => { setEditing({ ...emptySpeaker }); setFormOpen(true); };
  const openEdit = (s: Speaker) => { setEditing({ ...s }); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Sprecher / Speakers</h2>
        <button data-testid="button-new-speaker" onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          <Plus size={16} /> Neuer Sprecher
        </button>
      </div>

      {formOpen && editing && (
        <SpeakerForm speaker={editing} setSpeaker={setEditing} onSave={() => onSave(editing)} onClose={closeForm} adminPassword={adminPassword} />
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : speakers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Keine Sprecher vorhanden</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {speakers.map((s) => (
            <div key={s.id} data-testid={`card-speaker-${s.id}`} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-start gap-4">
                {s.photo ? (
                  <img src={s.photo} alt={s.name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center"><Users size={24} className="text-gray-400" /></div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.role}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button data-testid={`button-edit-speaker-${s.id}`} onClick={() => openEdit(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit size={14} /> Bearbeiten
                </button>
                <button data-testid={`button-delete-speaker-${s.id}`} onClick={() => s.id && onDelete(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} /> Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpeakerForm({ speaker, setSpeaker, onSave, onClose, adminPassword }: {
  speaker: Speaker; setSpeaker: (s: Speaker) => void; onSave: () => void; onClose: () => void; adminPassword: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSpeaker({ ...speaker, photo: data.url });
      }
    } catch {}
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-none md:rounded-2xl shadow-2xl w-full max-w-none md:max-w-lg h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{speaker.id ? "Sprecher bearbeiten" : "Neuer Sprecher"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"><X size={20} /></button>
        </div>
        <InputField label="Name" value={speaker.name} onChange={(v) => setSpeaker({ ...speaker, name: v })} testId="input-speaker-name" />
        <InputField label="Rolle" value={speaker.role} onChange={(v) => setSpeaker({ ...speaker, role: v })} testId="input-speaker-role" />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Foto</label>
          <div className="flex items-center gap-3">
            {speaker.photo ? (
              <img src={speaker.photo} alt="preview" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center"><ImageIcon size={24} className="text-gray-400" /></div>
            )}
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Foto hochladen
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <InputField label="oder Foto URL" value={speaker.photo} onChange={(v) => setSpeaker({ ...speaker, photo: v })} testId="input-speaker-photo" />
        </div>
        <ToggleField label="Aktiv" value={speaker.isActive} onChange={(v) => setSpeaker({ ...speaker, isActive: v })} testId="toggle-speaker-active" />
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
          <button data-testid="button-save-speaker" onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            <Check size={16} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function PromotionsTab({
  promotions, loading, formOpen, setFormOpen, editing, setEditing, onSave, onDelete, adminPassword,
}: {
  promotions: Promotion[]; loading: boolean; formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: Promotion | null; setEditing: (v: Promotion | null) => void;
  onSave: (p: Promotion) => void; onDelete: (id: number) => void; adminPassword: string;
}) {
  const openNew = () => { setEditing({ ...emptyPromotion }); setFormOpen(true); };
  const openEdit = (p: Promotion) => { setEditing({ ...p }); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">Aktionen / Promotions</h2>
        <button data-testid="button-new-promotion" onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors min-h-[44px] md:min-h-0">
          <Plus size={16} /> Neue Aktion
        </button>
      </div>

      {formOpen && editing && (
        <PromotionForm promo={editing} setPromo={setEditing} onSave={onSave} onClose={closeForm} adminPassword={adminPassword} />
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Keine Aktionen vorhanden</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promo) => (
            <div key={promo.id} data-testid={`card-promotion-${promo.id}`} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {promo.badge && (
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{promo.badge}</span>
                    )}
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${LANG_COLORS[promo.language] || "bg-gray-100 text-gray-600"}`}>
                      {LANG_LABELS[promo.language] || promo.language}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{promo.title}</h3>
                  <p className="text-sm text-gray-500">{promo.subtitle}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${promo.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {promo.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              {promo.highlights && promo.highlights.length > 0 && promo.highlights.some(h => h.trim()) && (
                <p className="text-sm text-gray-600 whitespace-pre-line">{promo.highlights.join("\n")}</p>
              )}
              {promo.deadline && <p className="text-xs text-gray-400">Deadline: {promo.deadline}</p>}
              {promo.translationGroup && (
                <p className="text-xs text-gray-400 flex items-center gap-1"><Globe size={12} /> Gruppe: {promo.translationGroup.substring(0, 8)}...</p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button data-testid={`button-edit-promotion-${promo.id}`} onClick={() => openEdit(promo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit size={14} /> Bearbeiten
                </button>
                <button data-testid={`button-delete-promotion-${promo.id}`} onClick={() => promo.id && onDelete(promo.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} /> Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromotionForm({ promo, setPromo, onSave, onClose, adminPassword }: {
  promo: Promotion; setPromo: (p: Promotion) => void;
  onSave: (p: Promotion) => void; onClose: () => void; adminPassword: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPromo({ ...promo, banner: data.url });
      }
    } catch {}
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-none md:rounded-2xl shadow-2xl w-full max-w-none md:max-w-lg h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{promo.id ? "Aktion bearbeiten" : "Neue Aktion"}</h3>
          <button data-testid="button-close-promo-form" onClick={onClose} className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sprache</label>
            <select data-testid="select-promo-language" value={promo.language} onChange={(e) => setPromo({ ...promo, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <InputField label="Badge" value={promo.badge} onChange={(v) => setPromo({ ...promo, badge: v })} testId="input-promo-badge" />
        </div>
        <InputField label="Titel" value={promo.title} onChange={(v) => setPromo({ ...promo, title: v })} testId="input-promo-title" />
        <InputField label="Subtitle" value={promo.subtitle} onChange={(v) => setPromo({ ...promo, subtitle: v })} testId="input-promo-subtitle" />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Banner</label>
          <div className="flex items-center gap-3">
            {promo.banner && <img src={promo.banner} alt="banner" className="h-16 rounded-lg object-cover" />}
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Banner hochladen
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </label>
          </div>
          <InputField label="oder Banner URL" value={promo.banner} onChange={(v) => setPromo({ ...promo, banner: v })} testId="input-promo-banner" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Text</label>
          <textarea data-testid="textarea-promo-highlights" value={(promo.highlights || []).join("\n")}
            onChange={(e) => setPromo({ ...promo, highlights: e.target.value.split("\n") })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
              }
            }}
            rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField label="CTA Text" value={promo.ctaText} onChange={(v) => setPromo({ ...promo, ctaText: v })} testId="input-promo-cta-text" />
          <InputField label="CTA Link" value={promo.ctaLink} onChange={(v) => setPromo({ ...promo, ctaLink: v })} testId="input-promo-cta-link" />
        </div>
        <InputField label="Deadline" value={promo.deadline} onChange={(v) => setPromo({ ...promo, deadline: v })} testId="input-promo-deadline" />
        <ToggleField label="Aktiv" value={promo.isActive} onChange={(v) => setPromo({ ...promo, isActive: v })} testId="toggle-promo-active" />
        <div className="flex justify-end gap-3 pt-2">
          <button data-testid="button-cancel-promo" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
          <button data-testid="button-save-promo" onClick={() => onSave(promo)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            <Check size={16} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({
  events, loading, formOpen, setFormOpen, editing, setEditing, onSave, onDelete, speakers, adminPassword,
}: {
  events: ScheduleEvent[]; loading: boolean; formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: ScheduleEvent | null; setEditing: (v: ScheduleEvent | null) => void;
  onSave: (e: ScheduleEvent) => void; onDelete: (id: number) => void;
  speakers: Speaker[]; adminPassword: string;
}) {
  const openNew = () => { setEditing({ ...emptyEvent }); setFormOpen(true); };
  const openEdit = (e: ScheduleEvent) => { setEditing({ ...e }); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">Webinare & Termine</h2>
        <button data-testid="button-new-event" onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors min-h-[44px] md:min-h-0">
          <Plus size={16} /> Neues Event
        </button>
      </div>

      {formOpen && editing && (
        <EventForm event={editing} setEvent={setEditing} onSave={onSave} onClose={closeForm} speakers={speakers} adminPassword={adminPassword} />
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Keine Events vorhanden</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} data-testid={`card-event-${event.id}`} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${event.type === "trading" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {event.typeBadge || event.type}
                    </span>
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${LANG_COLORS[event.language] || "bg-gray-100 text-gray-600"}`}>
                      {LANG_LABELS[event.language] || event.language}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.speaker}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${event.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {event.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{event.day}, {event.date} - {event.time} {event.timezone || "CET"}</p>
              </div>
              {event.highlights && event.highlights.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {event.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5"><Check size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />{h}</li>
                  ))}
                </ul>
              )}
              {event.translationGroup && (
                <p className="text-xs text-gray-400 flex items-center gap-1"><Globe size={12} /> Gruppe: {event.translationGroup.substring(0, 8)}...</p>
              )}
              {event.actionUrl && (
                <p className="text-xs text-purple-500 flex items-center gap-1"><LinkIcon size={12} /> {event.actionLabel || event.actionUrl}</p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button data-testid={`button-edit-event-${event.id}`} onClick={() => openEdit(event)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit size={14} /> Bearbeiten
                </button>
                {(event.banner || event.speakerPhoto) && (
                  <button data-testid={`button-download-banner-${event.id}`} onClick={() => openEdit(event)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                    <Download size={14} /> Banner
                  </button>
                )}
                <button data-testid={`button-delete-event-${event.id}`} onClick={() => event.id && onDelete(event.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} /> Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventForm({ event, setEvent, onSave, onClose, speakers, adminPassword }: {
  event: ScheduleEvent; setEvent: (e: ScheduleEvent) => void;
  onSave: (e: ScheduleEvent) => void; onClose: () => void;
  speakers: Speaker[]; adminPassword: string;
}) {
  const isNew = !event.id;
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(isNew ? [event.language || "de"] : [event.language]);

  const toggleLang = (lang: string) => {
    if (!isNew) return;
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        if (prev.length <= 1) return prev;
        return prev.filter(l => l !== lang);
      }
      return [...prev, lang];
    });
  };

  const handleSave = () => {
    if (isNew && selectedLanguages.length > 1) {
      onSave({ ...event, languages: selectedLanguages });
    } else if (isNew && selectedLanguages.length === 1) {
      onSave({ ...event, language: selectedLanguages[0] });
    } else {
      onSave(event);
    }
  };

  const bannerRef = useRef<HTMLDivElement>(null);

  const handleSpeakerSelect = (speakerId: string) => {
    if (speakerId === "") {
      setEvent({ ...event, speakerId: null, speaker: "", speakerPhoto: null });
      return;
    }
    const id = parseInt(speakerId);
    const found = speakers.find(s => s.id === id);
    if (found) {
      setEvent({ ...event, speakerId: found.id, speaker: found.name, speakerPhoto: found.photo || null });
    }
  };

  const currentSpeakerPhoto = event.speakerPhoto || speakers.find(s => s.id === event.speakerId)?.photo || "";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-none md:rounded-2xl shadow-2xl w-full max-w-none md:max-w-lg h-full md:h-auto md:max-h-[95vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900">{event.id ? "Event bearbeiten" : "Neues Event"}</h3>
          <button data-testid="button-close-event-form" onClick={onClose} className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1 custom-scrollbar">

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Sprache{isNew && selectedLanguages.length > 1 ? "n" : ""}</label>
            {isNew ? (
              <div className="flex gap-1.5" data-testid="select-event-language">
                {([["de", "DE"], ["en", "EN"], ["ru", "RU"]] as const).map(([code, label]) => (
                  <button key={code} type="button" data-testid={`toggle-lang-${code}`}
                    onClick={() => toggleLang(code)}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-all ${
                      selectedLanguages.includes(code)
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-purple-300"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-gray-50 text-gray-600">
                {event.language === "de" ? "Deutsch" : event.language === "en" ? "English" : "Русский"}
              </div>
            )}
            {isNew && selectedLanguages.length > 1 && (
              <p className="text-[10px] text-purple-500 mt-1 font-medium">
                {selectedLanguages.length} Sprachen — es werden {selectedLanguages.length} verknüpfte Events erstellt
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Typ</label>
            <select data-testid="select-event-type" value={event.type} onChange={(e) => setEvent({ ...event, type: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
              <option value="trading">Trading</option>
              <option value="partner">Partner</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Tag (z.B. Mittwoch)" value={event.day} onChange={(v) => setEvent({ ...event, day: v })} testId="input-event-day" />
          <InputField label="Datum (z.B. Jeden Mittwoch)" value={event.date} onChange={(v) => setEvent({ ...event, date: v })} testId="input-event-date" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Uhrzeit</label>
            <input data-testid="input-event-time" type="time" value={event.time}
              onChange={(e) => setEvent({ ...event, time: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Zeitzone</label>
            <select data-testid="select-event-timezone" value={event.timezone || "CET"}
              onChange={(e) => setEvent({ ...event, timezone: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
              <option value="CET">CET (Berlin)</option>
              <option value="CEST">CEST (Berlin Sommer)</option>
              <option value="MSK">MSK (Moskau)</option>
              <option value="EST">EST (New York)</option>
              <option value="GST">GST (Dubai)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <InputField label="Titel" value={event.title} onChange={(v) => setEvent({ ...event, title: v })} testId="input-event-title" />

        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Sprecher</label>
          <select data-testid="select-event-speaker" value={event.speakerId || ""}
            onChange={(e) => handleSpeakerSelect(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
            <option value="">-- Sprecher wählen --</option>
            {speakers.filter(s => s.isActive).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
          {event.speakerId && currentSpeakerPhoto && (
            <div className="flex items-center gap-3 mt-2 p-2 bg-gray-50 rounded-lg">
              <img src={currentSpeakerPhoto} alt={event.speaker} className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-[13px] font-medium text-gray-700">{event.speaker}</span>
            </div>
          )}
          {!event.speakerId && (
            <InputField label="oder manuell eingeben" value={event.speaker} onChange={(v) => setEvent({ ...event, speaker: v })} testId="input-event-speaker" />
          )}
        </div>

        <InputField label="Typ Badge" value={event.typeBadge} onChange={(v) => setEvent({ ...event, typeBadge: v })} testId="input-event-type-badge" />

        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Highlights (eine pro Zeile)</label>
          <textarea data-testid="textarea-event-highlights" value={(event.highlights || []).join("\n")}
            onChange={(e) => setEvent({ ...event, highlights: e.target.value.split("\n") })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
              }
            }}
            rows={2} className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
        </div>

        <InputField label="Link" value={event.link} onChange={(v) => setEvent({ ...event, link: v })} testId="input-event-link" />

        <div className="border-t border-gray-100 pt-3 mt-1">
          <p className="text-[10px] font-medium text-gray-400 mb-2 uppercase tracking-wider">Action Link (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Action URL" value={event.actionUrl || ""} onChange={(v) => setEvent({ ...event, actionUrl: v })} testId="input-event-action-url" />
            <InputField label="Button Label" value={event.actionLabel || ""} onChange={(v) => setEvent({ ...event, actionLabel: v })} testId="input-event-action-label" />
          </div>
        </div>

        <ToggleField label="Aktiv" value={event.isActive} onChange={(v) => setEvent({ ...event, isActive: v })} testId="toggle-event-active" />

        {(currentSpeakerPhoto || event.banner) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-medium text-gray-400">Banner Vorschau</label>
              <button
                type="button"
                data-testid="button-download-banner-preview"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const W = 1200, H = 660;
                  const tz = event.timezone || "CET";
                  const tripleTime = event.time ? convertTripleTime(event.time, tz) : "";
                  const titleLen = event.title?.length || 0;
                  const titleFontSize = titleLen > 40 ? 36 : titleLen > 25 ? 42 : 48;
                  const sloganWords = event.language === "ru" ? ["СТРУКТУРА", "ПРОЗРАЧНОСТЬ", "КОНТРОЛЬ"] :
                    event.language === "en" ? ["STRUCTURE", "TRANSPARENCY", "CONTROL"] :
                    ["STRUKTUR", "TRANSPARENZ", "KONTROLLE"];
                  const speakerName = event.speaker || "Name";
                  const spkFontSize = speakerName.length > 20 ? 16 : speakerName.length > 15 ? 18 : 20;
                  const dateStr = [formatDate(event.date), event.day].filter(Boolean).join(" · ") || "Datum";

                  const wrapper = document.createElement("div");
                  wrapper.style.cssText = `position:fixed;left:-9999px;top:0;width:${W}px;height:${H}px;overflow:hidden;z-index:-1;`;
                  const inner = document.createElement("div");
                  inner.style.cssText = `width:${W}px;height:${H}px;position:relative;background:linear-gradient(-29deg,rgb(182,139,255) 0%,rgb(255,255,255) 69%);font-family:Montserrat,sans-serif;overflow:hidden;margin:0;padding:0;`;

                  const gridHtml = Array.from({length:40},()=>'<div style="background:#f3f4f6;opacity:0.18;border-radius:2px;"></div>').join("");
                  inner.innerHTML = `
                    <div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(5,1fr);gap:2px;padding:8px;pointer-events:none;">${gridHtml}</div>
                    <img src="/jetup-logo-banner.png" crossorigin="anonymous" style="position:absolute;left:40px;top:60px;height:48px;width:auto;z-index:10;" />
                    <p style="position:absolute;left:40px;top:200px;z-index:10;color:#1a1a1a;font-weight:700;font-size:32px;line-height:1.2;margin:0;">Zoom Call</p>
                    <h3 style="position:absolute;left:40px;top:240px;z-index:10;width:620px;color:#7C3AED;font-weight:800;font-size:${titleFontSize}px;line-height:1.1;text-transform:uppercase;word-break:break-word;letter-spacing:-0.02em;margin:0;">\u201C${event.title || "Webinar Titel"}\u201D</h3>
                    <div style="position:absolute;left:40px;top:420px;z-index:10;width:620px;">
                      <div style="margin:0;padding:0;line-height:1.2;display:flex;flex-direction:column;align-items:flex-start;">
                        <span style="color:#1a1a1a;font-weight:700;font-size:32px;margin:0 0 2px 0;text-align:left;display:block;">${dateStr}</span>
                        ${tripleTime ? `<span style="color:#9ca3af;font-weight:500;font-size:24px;margin:0;text-align:left;display:block;white-space:nowrap;">(${tripleTime})</span>` : ""}
                      </div>
                    </div>
                    <div style="position:absolute;left:40px;top:590px;z-index:10;">
                      ${sloganWords.map((w,i) => `${i > 0 ? '<span style="color:#a855f7;font-size:22px;margin:0 10px;vertical-align:middle;">•</span>' : ''}<span style="font-weight:700;color:#111827;text-transform:uppercase;font-size:18px;letter-spacing:3px;vertical-align:middle;">${w}</span>`).join("")}
                    </div>
                    <div style="position:absolute;left:720px;top:100px;z-index:10;width:440px;text-align:center;">
                      ${currentSpeakerPhoto ? `
                        <div style="position:relative;width:340px;height:340px;margin:0 auto 24px auto;overflow:hidden;border-radius:50%;">
                          <div style="position:absolute;inset:0;border-radius:50%;border:4px solid rgba(192,132,252,0.4);z-index:2;pointer-events:none;"></div>
                          <img src="${currentSpeakerPhoto}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;" />
                        </div>
                        <div style="display:inline-block;background:white;border-radius:8px;padding:12px 28px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                          <span style="font-family:Inter,sans-serif;font-weight:700;color:black;font-size:${spkFontSize + 2}px;">Speaker: ${speakerName}</span>
                        </div>
                      ` : ''}
                    </div>`;

                  wrapper.appendChild(inner);
                  document.body.appendChild(wrapper);

                  const imgs = wrapper.querySelectorAll("img");
                  const loadPromises = Array.from(imgs).map(img => new Promise<void>((resolve) => {
                    if (img.complete && img.naturalWidth > 0) { resolve(); return; }
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                  }));

                  Promise.all(loadPromises).then(() => {
                    return new Promise(r => setTimeout(r, 300));
                  }).then(() => {
                    return html2canvas(inner, {
                      useCORS: true,
                      allowTaint: true,
                      scale: 2,
                      backgroundColor: null,
                      width: W,
                      height: H,
                      windowWidth: W,
                      windowHeight: H,
                      x: 0,
                      y: 0,
                      scrollX: 0,
                      scrollY: 0,
                      logging: false,
                    });
                  }).then(canvas => {
                    const dataUrl = canvas.toDataURL("image/png");
                    const a = document.createElement("a");
                    a.href = dataUrl;
                    a.download = `banner-${event.title?.replace(/\s+/g, "-") || "webinar"}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    document.body.removeChild(wrapper);
                  }).catch((err) => {
                    console.error("Banner export error:", err);
                    try { document.body.removeChild(wrapper); } catch {}
                  });
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Download size={12} /> Banner herunterladen
              </button>
            </div>
            <EventBannerPreview ref={bannerRef} event={event} speakerPhoto={currentSpeakerPhoto} />
          </div>
        )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
          <button data-testid="button-cancel-event" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
          <button data-testid="button-save-event" onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            <Check size={16} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  }
  return dateStr;
}

function getDynamicUtcOffset(ianaZone: string): number {
  const fmt = new Intl.DateTimeFormat("en", { timeZone: ianaZone, timeZoneName: "shortOffset" });
  const tzPart = fmt.formatToParts(new Date()).find(p => p.type === "timeZoneName")?.value || "";
  const match = tzPart.match(/GMT([+-]\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function convertTripleTime(time: string, fromTz: string): string {
  const [h, m] = time.split(":").map(Number);
  const TZ_TO_IANA: Record<string, string> = {
    CET: "Europe/Berlin", CEST: "Europe/Berlin", MEZ: "Europe/Berlin", MESZ: "Europe/Berlin",
    MSK: "Europe/Moscow", GST: "Asia/Dubai", EST: "America/New_York", EDT: "America/New_York", UTC: "UTC",
  };
  const fromIana = TZ_TO_IANA[fromTz] || "Europe/Berlin";
  const fromOffset = getDynamicUtcOffset(fromIana);
  const berlinOffset = getDynamicUtcOffset("Europe/Berlin");
  const mskOffset = getDynamicUtcOffset("Europe/Moscow");
  const dubaiOffset = getDynamicUtcOffset("Asia/Dubai");

  const getZonedTime = (offset: number) => {
    let newH = h + (offset - fromOffset);
    if (newH >= 24) newH -= 24;
    if (newH < 0) newH += 24;
    return `${String(newH).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
  };

  return `${getZonedTime(berlinOffset)} BER | ${getZonedTime(mskOffset)} MSK | ${getZonedTime(dubaiOffset)} DXB`;
}

const EventBannerPreview = React.forwardRef<HTMLDivElement, { event: ScheduleEvent; speakerPhoto: string }>(({ event, speakerPhoto }, ref) => {
  const tz = event.timezone || "CET";
  const tripleTime = event.time ? convertTripleTime(event.time, tz) : "";

  const rows = 5;
  const cols = 8;
  const gridCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      gridCells.push(<div key={`${r}-${c}`} className="bg-[#f3f4f6] rounded-[2px]" style={{ opacity: 0.18 }} />);
    }
  }

  return (
    <div ref={ref} className="relative w-full rounded-xl overflow-hidden shadow-lg"
      style={{ background: "linear-gradient(-29deg, rgb(182, 139, 255) 0%, rgb(255, 255, 255) 69%)", containerType: "inline-size" }}>
      <div className="pt-[55%]" />
      <div className="absolute inset-0 p-1 grid gap-[2px] pointer-events-none"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {gridCells}
      </div>

      <div className="absolute inset-0 flex">
        <div className="flex-1 flex flex-col justify-between z-10" style={{ maxWidth: "62%", padding: "12% 5% 4% 5%" }}>
          <img src="/jetup-logo-banner.png" alt="JetUP" className="h-[12%] w-auto object-contain self-start mb-[4%]" />

          <div className="space-y-[1%]">
            <p className="text-[#1a1a1a] font-bold leading-tight" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2.7cqw" }}>
              Zoom Call
            </p>
            <h3 className="text-[#7C3AED] font-extrabold leading-[1.1] uppercase break-words" style={{ fontFamily: "Montserrat, sans-serif", fontSize: ((event.title?.length || 0) > 40 ? "3cqw" : (event.title?.length || 0) > 25 ? "3.5cqw" : "4cqw"), letterSpacing: "-0.02em" }}>
              &ldquo;{event.title || "Webinar Titel"}&rdquo;
            </h3>
          </div>

          <div className="flex flex-col gap-[1%]">
            <div className="flex items-center gap-[1.5%] flex-wrap">
              <img src="/calendar-icon-banner.png" alt="" style={{ height: "2.2cqw" }} className="w-auto opacity-80" />
              <span className="text-[#1a1a1a] font-bold" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2.5cqw" }}>
                {[formatDate(event.date), event.day].filter(Boolean).join(" · ") || "Datum"}
              </span>
            </div>
            {tripleTime && (
              <span className="text-[#9ca3af] font-medium" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2cqw" }}>
                ({tripleTime})
              </span>
            )}
          </div>

          <div className="flex items-center gap-[2%]">
            {(event.language === "ru" ? ["СТРУКТУРА", "ПРОЗРАЧНОСТЬ", "КОНТРОЛЬ"] :
              event.language === "en" ? ["STRUCTURE", "TRANSPARENCY", "CONTROL"] :
              ["STRUKTUR", "TRANSPARENZ", "KONTROLLE"]).map((word, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="bg-[#a855f7] rounded-full" style={{ width: "0.7cqw", height: "0.7cqw" }} />}
                <span className="font-bold text-[#111827] uppercase" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "1.5cqw", letterSpacing: "0.3cqw", lineHeight: "1" }}>{word}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center z-10 pr-[3%]">
          {speakerPhoto ? (
            <>
              <div className="relative w-[70%] aspect-square">
                <div className="absolute -inset-[4%] rounded-full border-[3px] border-[#C084FC]/40" />
                <img src={speakerPhoto} alt="speaker" className="w-full h-full rounded-full object-cover object-top" />
              </div>
              <div className="mt-[4%] bg-white rounded px-[6%] py-[2%] shadow-sm w-fit max-w-[90%] overflow-hidden">
                <p className="font-semibold text-black text-center truncate" style={{ fontFamily: "Inter, sans-serif", fontSize: "2.2cqw" }}>
                  Speaker: {event.speaker || "Name"}
                </p>
              </div>
            </>
          ) : (
            <div className="w-[60%] aspect-square rounded-full bg-gradient-to-br from-[#C084FC]/20 to-[#A855F7]/10" />
          )}
        </div>
      </div>
    </div>
  );
});

function InputField({ label, value, onChange, testId }: {
  label: string; value: string; onChange: (v: string) => void; testId: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-400 mb-0.5">{label}</label>
      <input 
        data-testid={testId} 
        type={label.toLowerCase().includes("datum") ? "date" : "text"} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
      />
    </div>
  );
}

function ToggleField({ label, value, onChange, testId }: {
  label: string; value: boolean; onChange: (v: boolean) => void; testId: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button data-testid={testId} type="button" onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors relative ${value ? "bg-purple-600" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function DennisPromoTab({
  dennisPromos, dennisPromosLoading, formOpen, setFormOpen, editing, setEditing, onSave, onDelete,
  promoApps, promoAppsLoading, updatePromoAppStatus, sendNoMoneyAdmin, exportPromoAppsCSV, promoSubTab, setPromoSubTab, adminPassword,
}: {
  dennisPromos: any[]; dennisPromosLoading: boolean;
  formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: any | null; setEditing: (v: any | null) => void;
  onSave: (promo: any) => void; onDelete: (id: number) => void;
  promoApps: any[]; promoAppsLoading: boolean;
  updatePromoAppStatus: (id: number, status: string) => void;
  sendNoMoneyAdmin: (id: number) => void;
  exportPromoAppsCSV: () => void;
  promoSubTab: "offers" | "applications";
  setPromoSubTab: (v: "offers" | "applications") => void;
  adminPassword: string;
}) {
  const [form, setForm] = useState<any>({
    title: "", shortDesc: "", description: "", rules: [], isActive: true, sortOrder: 0, language: "ru", translationGroup: "",
  });
  const [rulesText, setRulesText] = useState("");

  useEffect(() => {
    if (editing) {
      setForm(editing);
      setRulesText((editing.rules || []).join("\n"));
    } else {
      setForm({ title: "", shortDesc: "", description: "", rules: [], isActive: true, sortOrder: 0, language: "ru", translationGroup: "" });
      setRulesText("");
    }
  }, [editing]);

  const handleSave = () => {
    const rules = rulesText.split("\n").map((r: string) => r.trim()).filter(Boolean);
    onSave({ ...form, rules });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setPromoSubTab("offers")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            promoSubTab === "offers" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"
          }`}
          data-testid="subtab-offers"
        >
          <Gift size={16} className="inline mr-1.5" />
          Промо-акции
        </button>
        <button
          onClick={() => setPromoSubTab("applications")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            promoSubTab === "applications" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"
          }`}
          data-testid="subtab-applications"
        >
          <Users size={16} className="inline mr-1.5" />
          Заявки ({promoApps.length})
        </button>
      </div>

      {promoSubTab === "offers" && (
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Dennis Promo — Управление акциями</h2>
            <button
              onClick={() => { setEditing(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              data-testid="btn-add-dennis-promo"
            >
              <Plus size={16} />
              Добавить акцию
            </button>
          </div>

          {formOpen && (
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 border border-orange-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{editing?.id ? "Редактировать" : "Новая"} промо-акция</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Заголовок</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Dennis Fast Start Promo"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                    data-testid="input-dp-title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Краткое описание (кнопка)</label>
                  <input
                    type="text"
                    value={form.shortDesc}
                    onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                    placeholder="Пополни баланс на 100 и получи ещё +100"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                    data-testid="input-dp-short-desc"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Полное описание</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Подробное описание акции..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none resize-y"
                    data-testid="input-dp-description"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Правила (каждое с новой строки)</label>
                  <textarea
                    value={rulesText}
                    onChange={(e) => setRulesText(e.target.value)}
                    rows={4}
                    placeholder={"Правило 1\nПравило 2\nПравило 3"}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none resize-y font-mono"
                    data-testid="input-dp-rules"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sprache / Язык</label>
                    <select
                      value={form.language}
                      onChange={(e) => setForm({ ...form, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                      data-testid="select-dp-language"
                    >
                      <option value="ru">🇷🇺 Русский</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="en">🇬🇧 English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gruppe / Группа перевода</label>
                    <input
                      type="text"
                      value={form.translationGroup || ""}
                      onChange={(e) => setForm({ ...form, translationGroup: e.target.value })}
                      placeholder="fast-start-100"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                      data-testid="input-dp-translation-group"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Активна</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                      className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
                      data-testid="toggle-dp-active"
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mr-2">Порядок</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                      data-testid="input-dp-sort"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                    data-testid="btn-save-dp"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => { setFormOpen(false); setEditing(null); }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    data-testid="btn-cancel-dp"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {dennisPromosLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-orange-600" />
            </div>
          ) : dennisPromos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Нет промо-акций. Добавьте первую акцию.
            </div>
          ) : (
            <div className="space-y-3">
              {dennisPromos.map((promo: any) => (
                <div key={promo.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100" data-testid={`dp-card-${promo.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900">{promo.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${LANG_COLORS[promo.language] || "bg-gray-100 text-gray-700"}`}>
                          {LANG_LABELS[promo.language] || promo.language}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${promo.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {promo.isActive ? "Активна" : "Выключена"}
                        </span>
                        {promo.translationGroup && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-600">
                            {promo.translationGroup}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{promo.shortDesc}</p>
                      <p className="text-xs text-gray-400">{promo.description?.substring(0, 100)}{promo.description?.length > 100 ? "..." : ""}</p>
                      {promo.rules?.length > 0 && (
                        <p className="text-[10px] text-gray-400 mt-1">Правила: {promo.rules.length} шт.</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-3">
                      <button
                        onClick={() => { setEditing(promo); setFormOpen(true); }}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        data-testid={`btn-edit-dp-${promo.id}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(promo.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`btn-delete-dp-${promo.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {promoSubTab === "applications" && (
        <PromoApplicationsSubTab
          promoApps={promoApps}
          promoAppsLoading={promoAppsLoading}
          updatePromoAppStatus={updatePromoAppStatus}
          sendNoMoneyAdmin={sendNoMoneyAdmin}
          exportPromoAppsCSV={exportPromoAppsCSV}
          adminPassword={adminPassword}
        />
      )}
    </div>
  );
}

function PromoApplicationsSubTab({
  promoApps, promoAppsLoading, updatePromoAppStatus, sendNoMoneyAdmin, exportPromoAppsCSV, adminPassword,
}: {
  promoApps: any[]; promoAppsLoading: boolean;
  updatePromoAppStatus: (id: number, status: string) => void;
  sendNoMoneyAdmin: (id: number) => void;
  exportPromoAppsCSV: () => void;
  adminPassword: string;
}) {
  const [syncing, setSyncing] = useState(false);
  const [checkingVerifications, setCheckingVerifications] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const statusPriority: Record<string, number> = { pending: 0, no_money: 1, retry: 2, approved: 3, rejected: 4, duplicate: 99 };

  const groupedPromoApps = (() => {
    const map: Record<string, any[]> = {};
    for (const app of promoApps) {
      const key = app.email.toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(app);
    }
    return Object.values(map).map(group => {
      const sorted = [...group].sort((a, b) => {
        const pa = statusPriority[a.status] ?? 3;
        const pb = statusPriority[b.status] ?? 3;
        if (pa !== pb) return pa - pb;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return { primary: sorted[0], history: sorted.slice(1) };
    }).sort((a, b) => {
      const pa = statusPriority[a.primary.status] ?? 3;
      const pb = statusPriority[b.primary.status] ?? 3;
      if (pa !== pb) return pa - pb;
      return new Date(b.primary.createdAt).getTime() - new Date(a.primary.createdAt).getTime();
    });
  })();

  const checkVerifications = async () => {
    setCheckingVerifications(true);
    setVerificationResult(null);
    try {
      const res = await fetch("/api/admin/check-promo-verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
      });
      const data = await res.json();
      if (data.success) {
        setVerificationResult(data.processedCount > 0 ? `${data.processedCount} verification(s) processed` : "No new verifications found");
        if (data.processedCount > 0) {
          window.location.reload();
        }
      } else {
        setVerificationResult(data.error || "Check failed");
      }
    } catch (err: any) {
      setVerificationResult(err.message || "Check failed");
    } finally {
      setCheckingVerifications(false);
    }
  };

  const syncToSheets = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/admin/sync-promo-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
      });
      const data = await res.json();
      if (data.success) {
        setSheetUrl(data.spreadsheetUrl);
      } else {
        setSyncError(data.error || "Sync failed");
      }
    } catch (err: any) {
      setSyncError(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3 md:gap-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Заявки на промо-акции</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={checkVerifications}
            disabled={checkingVerifications}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            data-testid="btn-check-verifications"
          >
            {checkingVerifications ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Check Verifications
          </button>
          <button
            onClick={syncToSheets}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid="btn-sync-promo-sheets"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            Google Sheets
          </button>
          <button
            onClick={exportPromoAppsCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            data-testid="btn-export-promo-csv"
          >
            <Download size={16} />
            CSV Export
          </button>
        </div>
      </div>
      {sheetUrl && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm">
          <FileSpreadsheet size={16} className="text-blue-600 flex-shrink-0" />
          <span className="text-blue-800">Синхронизировано!</span>
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1 ml-1" data-testid="link-promo-sheet">
            Открыть таблицу <ExternalLink size={12} />
          </a>
        </div>
      )}
      {verificationResult && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700" data-testid="verification-result">
          {verificationResult}
        </div>
      )}
      {syncError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{syncError}</div>
      )}
      {promoAppsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-purple-600" />
        </div>
      ) : promoApps.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Нет заявок</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px] md:min-w-0">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">CU Number</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Verified</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedPromoApps.map(({ primary: app, history }) => {
                const groupKey = app.email.toLowerCase();
                const isExpanded = expandedGroups.has(groupKey);
                const hadNoMoney = history.some((h: any) => h.noMoneyEmailSentAt || h.status === "no_money");
                const statusBadge = (a: any) => (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    a.status === "approved" ? "bg-green-100 text-green-700" :
                    a.status === "rejected" ? "bg-red-100 text-red-700" :
                    a.status === "duplicate" ? "bg-orange-100 text-orange-700" :
                    a.status === "retry" ? "bg-blue-100 text-blue-700" :
                    a.status === "no_money" ? "bg-amber-100 text-amber-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`} data-testid={`badge-status-${a.id}`}>
                    {a.status === "duplicate" ? "дубликат" :
                     a.status === "retry" ? "↩ retry" :
                     a.status === "no_money" ? "no money" : a.status}
                  </span>
                );
                return (
                  <React.Fragment key={app.id}>
                    <tr className="border-b hover:bg-gray-50" data-testid={`row-promo-app-${app.id}`}>
                      <td className="px-4 py-3 text-gray-500">
                        #{app.id}
                        {history.length > 0 && (
                          <button onClick={() => toggleGroup(groupKey)} className="ml-1 text-xs text-purple-500 hover:text-purple-700 font-medium" title="Show history">
                            {isExpanded ? "▲" : "▼"} {history.length}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {app.name}
                        {hadNoMoney && <span className="ml-1 text-xs text-amber-500" title="Previously sent no money email">⚠</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{app.email}</td>
                      <td className="px-4 py-3 text-gray-700 font-mono">{app.cuNumber}</td>
                      <td className="px-4 py-3">{statusBadge(app)}</td>
                      <td className="px-4 py-3 text-xs">
                        {app.verifiedAt ? (
                          <div>
                            <span className="text-blue-600 font-medium" data-testid={`verified-date-${app.id}`}>{new Date(app.verifiedAt).toLocaleString()}</span>
                            {app.emailSentAt && <span className="block text-green-600 mt-0.5" data-testid={`email-sent-${app.id}`}>Email sent</span>}
                          </div>
                        ) : app.noMoneyEmailSentAt ? (
                          <div>
                            <span className="text-amber-600 font-medium" data-testid={`no-money-date-${app.id}`}>No money email</span>
                            <span className="block text-amber-500 mt-0.5">{new Date(app.noMoneyEmailSentAt).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(app.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {app.status !== "approved" && app.status !== "duplicate" && !app.emailSentAt && (
                            <button onClick={() => updatePromoAppStatus(app.id, "approved")} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200" title="Verify & Send Email" data-testid={`btn-approve-${app.id}`}><Check size={14} /></button>
                          )}
                          {!app.noMoneyEmailSentAt && !app.emailSentAt && app.status !== "approved" && app.status !== "rejected" && app.status !== "duplicate" && (
                            <button onClick={() => sendNoMoneyAdmin(app.id)} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold hover:bg-amber-200" title="No Money — Send Email" data-testid={`btn-no-money-${app.id}`}>💰</button>
                          )}
                          {app.status !== "rejected" && app.status !== "approved" && app.status !== "duplicate" && (
                            <button onClick={() => updatePromoAppStatus(app.id, "rejected")} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200" title="Reject" data-testid={`btn-reject-${app.id}`}><X size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && history.map((h: any) => (
                      <tr key={h.id} className="border-b bg-gray-50/60 text-xs" data-testid={`row-history-${h.id}`}>
                        <td className="px-4 py-2 text-gray-400 pl-8">#{h.id}</td>
                        <td className="px-4 py-2 text-gray-500">{h.name}</td>
                        <td className="px-4 py-2 text-gray-400">{h.email}</td>
                        <td className="px-4 py-2 text-gray-400 font-mono">{h.cuNumber}</td>
                        <td className="px-4 py-2">{statusBadge(h)}</td>
                        <td className="px-4 py-2 text-gray-400">
                          {h.emailSentAt ? <span className="text-green-600">Email sent {new Date(h.emailSentAt).toLocaleString()}</span>
                           : h.noMoneyEmailSentAt ? <span className="text-amber-600">No money email {new Date(h.noMoneyEmailSentAt).toLocaleString()}</span>
                           : "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-400">{new Date(h.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-400">—</td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;

function InvitesTab({
  groupedWebinars, loading, headers, onRefresh, onSendTelegramReport
}: {
  groupedWebinars: GroupedWebinar[];
  loading: boolean;
  headers: () => Record<string, string>;
  onRefresh: () => void;
  onSendTelegramReport: (id: number) => void;
}) {
  const [zoomStatus, setZoomStatus] = useState<{ configured: boolean; ok: boolean; error?: string } | null>(null);
  const [zoomChecking, setZoomChecking] = useState(false);
  const [showZoomConfig, setShowZoomConfig] = useState(false);
  const [zoomCreds, setZoomCreds] = useState({ accountId: "", clientId: "", clientSecret: "" });
  const [zoomSaving, setZoomSaving] = useState(false);
  const [resyncLoading, setResyncLoading] = useState(false);
  const [expandedWebinar, setExpandedWebinar] = useState<number | null>(null);
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);

  const checkZoomStatus = async () => {
    setZoomChecking(true);
    try {
      const res = await fetch("/api/admin/zoom-test", { headers: headers() });
      if (res.ok) setZoomStatus(await res.json());
    } catch {}
    setZoomChecking(false);
  };

  const saveZoomCredentials = async () => {
    setZoomSaving(true);
    try {
      const res = await fetch("/api/admin/zoom-credentials", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(zoomCreds),
      });
      if (res.ok) {
        const data = await res.json();
        setZoomStatus(data);
        if (data.ok) {
          setShowZoomConfig(false);
          setZoomCreds({ accountId: "", clientId: "", clientSecret: "" });
        }
      }
    } catch {}
    setZoomSaving(false);
  };

  const resyncAll = async () => {
    if (!confirm("Re-sync all Zoom attendance data? This will clear and re-fetch all attendance records.")) return;
    setResyncLoading(true);
    try {
      const res = await fetch("/api/admin/zoom-resync-all", {
        method: "POST",
        headers: headers(),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Re-sync complete: ${data.totalSynced} participants synced, ${data.totalErrors} errors`);
        onRefresh();
      } else {
        alert("Re-sync failed");
      }
    } catch {
      alert("Connection error");
    }
    setResyncLoading(false);
  };

  useEffect(() => { checkZoomStatus(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900" data-testid="text-invites-title">Invites by Webinar</h2>
          {zoomStatus && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${zoomStatus.ok ? 'bg-green-500' : zoomStatus.configured ? 'bg-yellow-500' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-500">
                Zoom: {zoomStatus.ok ? 'Verbunden' : zoomStatus.configured ? `Fehler: ${zoomStatus.error}` : 'Nicht konfiguriert'}
              </span>
              {zoomChecking && <Loader2 size={12} className="animate-spin text-gray-400" />}
              <button onClick={() => setShowZoomConfig(!showZoomConfig)}
                className="text-xs text-purple-600 hover:text-purple-700 underline ml-1">
                {zoomStatus.ok ? 'Ändern' : 'Konfigurieren'}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {zoomStatus?.ok && (
            <button data-testid="button-resync-all" onClick={resyncAll} disabled={resyncLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 disabled:opacity-50">
              {resyncLoading ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
              Re-sync All Zoom
            </button>
          )}
        </div>
      </div>

      {showZoomConfig && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Zoom API Credentials</h3>
            <button onClick={() => setShowZoomConfig(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <p className="text-xs text-gray-500">Server-to-Server OAuth credentials from <a href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">Zoom Marketplace</a></p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Account ID</label>
              <input data-testid="input-zoom-account-id" type="text" value={zoomCreds.accountId}
                onChange={(e) => setZoomCreds({ ...zoomCreds, accountId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Account ID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client ID</label>
              <input data-testid="input-zoom-client-id" type="text" value={zoomCreds.clientId}
                onChange={(e) => setZoomCreds({ ...zoomCreds, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Client ID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client Secret</label>
              <input data-testid="input-zoom-client-secret" type="password" value={zoomCreds.clientSecret}
                onChange={(e) => setZoomCreds({ ...zoomCreds, clientSecret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Client Secret" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button data-testid="button-save-zoom-creds" onClick={saveZoomCredentials} disabled={zoomSaving || !zoomCreds.accountId || !zoomCreds.clientId || !zoomCreds.clientSecret}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {zoomSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Speichern & Testen
            </button>
            {zoomStatus?.configured && !zoomStatus.ok && zoomStatus.error && (
              <span className="text-xs text-red-500">{zoomStatus.error}</span>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : groupedWebinars.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">No webinars with invites found</div>
      ) : (
        <div className="grid gap-4">
          {groupedWebinars.map((webinar) => {
            const isExpanded = expandedWebinar === webinar.scheduleEvent.id;
            return (
              <div key={webinar.scheduleEvent.id} data-testid={`card-webinar-${webinar.scheduleEvent.id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedWebinar(isExpanded ? null : webinar.scheduleEvent.id)}
                  className="w-full p-3 md:p-5 text-left hover:bg-gray-50 transition-colors"
                  data-testid={`button-expand-webinar-${webinar.scheduleEvent.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                        <h3 className="font-bold text-lg text-gray-900">{webinar.scheduleEvent.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${webinar.scheduleEvent.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {webinar.scheduleEvent.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 ml-7">{webinar.scheduleEvent.date} {webinar.scheduleEvent.time} {webinar.scheduleEvent.timezone} | {webinar.scheduleEvent.speaker}</p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 bg-gray-50 px-3 md:px-4 py-2 rounded-lg border border-gray-100 overflow-x-auto no-scrollbar flex-shrink-0">
                      <div className="text-center flex-shrink-0">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Partners</p>
                        <p className="text-lg font-bold text-gray-700" data-testid={`stat-partners-${webinar.scheduleEvent.id}`}>{webinar.stats.totalPartners}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
                      <div className="text-center flex-shrink-0">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Invited</p>
                        <p className="text-lg font-bold text-purple-600" data-testid={`stat-invited-${webinar.scheduleEvent.id}`}>{webinar.stats.totalInvited}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
                      <div className="text-center flex-shrink-0">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Registered</p>
                        <p className="text-lg font-bold text-blue-600" data-testid={`stat-registered-${webinar.scheduleEvent.id}`}>{webinar.stats.totalRegistered}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
                      <div className="text-center flex-shrink-0">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Attended</p>
                        <p className="text-lg font-bold text-emerald-600" data-testid={`stat-attended-${webinar.scheduleEvent.id}`}>{webinar.stats.totalAttended}</p>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    {webinar.partners.length === 0 ? (
                      <p className="text-center py-4 text-gray-400 text-sm">No partners for this webinar</p>
                    ) : (
                      <div className="space-y-3 mt-4">
                        {webinar.partners.map((partner) => {
                          const isPartnerExpanded = expandedPartner === partner.inviteEventId;
                          return (
                            <div key={partner.inviteEventId} className="border border-gray-100 rounded-lg overflow-hidden" data-testid={`card-partner-invite-${partner.inviteEventId}`}>
                              <button
                                onClick={() => setExpandedPartner(isPartnerExpanded ? null : partner.inviteEventId)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                                data-testid={`button-expand-partner-${partner.inviteEventId}`}
                              >
                                <div className="flex items-center gap-3">
                                  {isPartnerExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                                  <span className="font-semibold text-gray-900">{partner.partnerName}</span>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{partner.partnerCu}</span>
                                  {partner.zoomSynced > 0 && (
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Video size={10} /> {partner.zoomSynced}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{partner.registered} registered</span>
                                  <span>{partner.clicked} clicked</span>
                                  <span className="text-emerald-600 font-semibold">{partner.attended} attended</span>
                                  {partner.walkIns > 0 && <span className="text-amber-600">{partner.walkIns} walk-ins</span>}
                                </div>
                              </button>

                              {isPartnerExpanded && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 max-w-sm">
                                    <LinkIcon size={12} className="text-gray-400 shrink-0" />
                                    <span className="text-xs text-gray-500 truncate font-mono">{`${window.location.origin}/invite/${partner.inviteCode}`}</span>
                                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invite/${partner.inviteCode}`); alert("Kopiert!"); }}
                                      className="ml-auto text-purple-600 hover:text-purple-700 font-medium text-xs whitespace-nowrap" data-testid={`button-copy-invite-${partner.inviteEventId}`}>Copy</button>
                                  </div>
                                  <button onClick={() => onSendTelegramReport(partner.inviteEventId)}
                                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                                    data-testid={`button-tg-report-${partner.inviteEventId}`}>
                                    <MessageSquare size={12} /> TG Report
                                  </button>
                                </div>
                              )}

                              {isPartnerExpanded && partner.guests.length > 0 && (
                                <div className="border-t border-gray-100 overflow-x-auto">
                                  <table className="w-full text-left min-w-[600px] md:min-w-0">
                                    <thead className="bg-gray-50 border-b">
                                      <tr>
                                        <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Email</th>
                                        <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Method</th>
                                        <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-center">Clicked</th>
                                        <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-center">Attended</th>
                                        <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-center">Duration</th>
                                        <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-center">Q&A</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                      {partner.guests.map((guest) => (
                                        <tr key={guest.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{guest.name}</td>
                                          <td className="px-4 py-2 text-sm text-gray-600">{guest.email}</td>
                                          <td className="px-4 py-2 text-sm">
                                            {guest.invitationMethod === "personal_ai" ? (
                                              <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">AI</span>
                                            ) : (
                                              <span className="text-xs bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-full">Manual</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-center">
                                            {guest.clickedZoom ? (
                                              <Check className="text-green-500 mx-auto" size={16} />
                                            ) : (
                                              <X className="text-gray-300 mx-auto" size={16} />
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-center">
                                            {guest.attended ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                                <Check size={12} /> Yes
                                              </span>
                                            ) : (
                                              <span className="text-gray-300 text-xs">—</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-center text-sm text-gray-600">
                                            {guest.attended && guest.durationMinutes != null ? (
                                              <span className="font-medium">{guest.durationMinutes}m</span>
                                            ) : (
                                              <span className="text-gray-300">—</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-center text-sm text-gray-600">
                                            {guest.attended && guest.questionsAsked != null && guest.questionsAsked > 0 ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                                                {guest.questionsAsked}
                                              </span>
                                            ) : (
                                              <span className="text-gray-300">—</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {isPartnerExpanded && partner.guests.length === 0 && (
                                <div className="border-t border-gray-100 px-4 py-3 text-center text-sm text-gray-400">No guests registered yet</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InviteForm({ event, setEvent, onSave, onClose }: {
  event: Partial<InviteEvent>; setEvent: (e: Partial<InviteEvent>) => void; onSave: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-none md:rounded-2xl shadow-2xl w-full max-w-none md:max-w-lg h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Create New Invite Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"><X size={20} /></button>
        </div>
        
        <InputField label="Event Title" value={event.title || ""} onChange={(v) => setEvent({ ...event, title: v })} testId="input-invite-title" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Partner Name" value={event.partnerName || ""} onChange={(v) => setEvent({ ...event, partnerName: v })} testId="input-invite-partner-name" />
          <InputField label="Partner CU Number" value={event.partnerCu || ""} onChange={(v) => setEvent({ ...event, partnerCu: v })} testId="input-invite-partner-cu" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Date" value={event.eventDate || ""} onChange={(v) => setEvent({ ...event, eventDate: v })} testId="input-invite-date" />
          <InputField label="Time" value={event.eventTime || ""} onChange={(v) => setEvent({ ...event, eventTime: v })} testId="input-invite-time" />
        </div>

        <InputField label="Zoom Link" value={event.zoomLink || ""} onChange={(v) => setEvent({ ...event, zoomLink: v })} testId="input-invite-zoom-link" />
        
        <ToggleField label="Active" value={event.isActive ?? true} onChange={(v) => setEvent({ ...event, isActive: v })} testId="toggle-invite-active" />

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
          <button data-testid="button-save-invite" onClick={onSave}
            disabled={!event.title || !event.partnerName || !event.partnerCu || !event.zoomLink}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">
            <Check size={16} /> Create
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnersTab({ partners, onDelete }: { partners: AdminPartner[]; onDelete: (id: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" data-testid="text-partners-title">
          Registrierte Partner ({partners.length})
        </h2>
      </div>
      {partners.length === 0 ? (
        <p className="text-gray-500" data-testid="text-no-partners">Noch keine Partner registriert.</p>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-shadow" data-testid={`card-partner-${p.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900" data-testid={`text-partner-name-${p.id}`}>{p.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{p.cuNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.status === "active" ? "Aktiv" : p.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    {p.telegramUsername && (
                      <span>📱 @{p.telegramUsername}</span>
                    )}
                    {p.email && (
                      <span>📧 {p.email}</span>
                    )}
                    {p.phone && (
                      <span>📞 {p.phone}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-xs text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString("de-DE")}
                  </div>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                    data-testid={`button-delete-partner-${p.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function extractYouTubeVideoId(url: string): string {
  if (!url) return "";
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/);
  if (shortsMatch) return shortsMatch[1];
  const standardMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&/]+)/);
  if (standardMatch) return standardMatch[1];
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/);
  if (embedMatch) return embedMatch[1];
  return url;
}

const VIDEO_CATEGORIES = [
  { value: "bonuses", label: "Incentives" },
  { value: "strategies", label: "Strategies" },
  { value: "partner-program", label: "Partner Program" },
  { value: "getting-started", label: "Getting Started" },
];

interface VideoFormData {
  id?: number;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  category: string;
  topicTags: string[];
  language: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyVideo: VideoFormData = {
  title: "",
  description: "",
  youtubeUrl: "",
  youtubeVideoId: "",
  category: "getting-started",
  topicTags: [] as string[],
  language: "de",
  sortOrder: 0,
  isActive: true,
};

interface BulkEntry extends VideoFormData {
  _key: string;
  _metaFailed?: boolean;
  _duplicate?: boolean;
  _invalid?: boolean;
}

function LandingVideosPanel({ adminPassword }: { adminPassword: string }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"de" | "ru" | "en">("de");
  const [allVideos, setAllVideos] = useState<VideoFormData[]>([]);
  const [selection, setSelection] = useState<Record<string, number[]>>({ de: [], ru: [], en: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const h = { "x-admin-password": adminPassword };
    Promise.all([
      fetch("/api/admin/tutorials", { headers: h }).then(r => r.json()).catch(() => []),
      fetch("/api/admin/landing-settings", { headers: h }).then(r => r.json()).catch(() => null),
    ]).then(([vids, settings]) => {
      setAllVideos(Array.isArray(vids) ? vids : []);
      if (settings) setSelection(settings);
    }).finally(() => setLoading(false));
  }, [open, adminPassword]);

  const forLang = allVideos.filter(v => v.language === lang && v.isActive);
  const sel = selection[lang] || [];

  const toggle = (id: number) => {
    setSelection(prev => {
      const cur = prev[lang] || [];
      const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
      return { ...prev, [lang]: next };
    });
  };

  const move = (id: number, dir: -1 | 1) => {
    setSelection(prev => {
      const cur = [...(prev[lang] || [])];
      const idx = cur.indexOf(id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= cur.length) return prev;
      [cur[idx], cur[target]] = [cur[target], cur[idx]];
      return { ...prev, [lang]: cur };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/landing-settings", {
        method: "PUT",
        headers: { "x-admin-password": adminPassword, "Content-Type": "application/json" },
        body: JSON.stringify(selection),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  };

  const LANGS: { key: "de" | "ru" | "en"; label: string }[] = [
    { key: "de", label: "DE" }, { key: "ru", label: "RU" }, { key: "en", label: "EN" },
  ];

  return (
    <div className="bg-purple-50 rounded-xl border border-purple-200 overflow-hidden" data-testid="landing-videos-panel">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-purple-100 transition-colors"
        data-testid="button-landing-panel-toggle"
      >
        <div className="flex items-center gap-3">
          <Globe size={18} className="text-purple-600" />
          <span className="font-semibold text-gray-900 text-sm">Landing Page — Видеотека (/explore)</span>
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
            DE: {(selection.de || []).length} · RU: {(selection.ru || []).length} · EN: {(selection.en || []).length}
          </span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          <div className="flex gap-1 border-b border-purple-200">
            {LANGS.map(l => (
              <button
                key={l.key}
                onClick={() => setLang(l.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${lang === l.key ? "border-purple-600 text-purple-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                data-testid={`button-landing-lang-${l.key}`}
              >
                {l.label}
                <span className="ml-1.5 text-xs text-gray-400">({(selection[l.key] || []).length})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <Loader2 size={16} className="animate-spin" /> Laden...
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">Выбери видео для лендинга. Порядок важен — первые идут слева. Рекомендуется 3–4.</p>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {forLang.length === 0 && (
                  <p className="text-sm text-gray-400 py-3 text-center">Нет активных видео для {lang.toUpperCase()}</p>
                )}
                {forLang.map(v => {
                  const posIdx = sel.indexOf(v.id!);
                  const isSelected = posIdx !== -1;
                  return (
                    <div
                      key={v.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${isSelected ? "bg-white border-purple-300" : "bg-white border-gray-200 hover:border-gray-300"}`}
                      onClick={() => toggle(v.id!)}
                      data-testid={`landing-video-item-${v.id}`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${isSelected ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      {isSelected && (
                        <span className="text-xs font-bold text-purple-600 w-4 text-right flex-shrink-0">#{posIdx + 1}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{v.title}</p>
                        <p className="text-xs text-gray-400">{v.category}</p>
                      </div>
                      {isSelected && (
                        <div className="flex flex-col gap-0.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => move(v.id!, -1)}
                            disabled={posIdx === 0}
                            className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"
                            data-testid={`button-move-up-${v.id}`}
                          >
                            <ChevronUp size={14} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => move(v.id!, 1)}
                            disabled={posIdx === sel.length - 1}
                            className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"
                            data-testid={`button-move-down-${v.id}`}
                          >
                            <ChevronDown size={14} className="text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-400">{sel.length} выбрано для {lang.toUpperCase()}</span>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  data-testid="button-save-landing-settings"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
                  {saved ? "Сохранено!" : saving ? "Сохраняю..." : "Сохранить"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function VideosTab({
  videos, loading, formOpen, setFormOpen, editing, setEditing, onSave, onDelete, onBulkSave,
  filterCategory, setFilterCategory, filterLang, setFilterLang, adminPassword,
}: {
  videos: VideoFormData[]; loading: boolean; formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: VideoFormData | null; setEditing: (v: VideoFormData | null) => void;
  onSave: (v: VideoFormData) => void; onDelete: (id: number) => void;
  onBulkSave: (items: VideoFormData[]) => Promise<number>;
  filterCategory: string; setFilterCategory: (v: string) => void;
  filterLang: string; setFilterLang: (v: string) => void;
  adminPassword: string;
}) {
  const [form, setForm] = useState(emptyVideo);
  const [tagInput, setTagInput] = useState("");
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const fetchTokenRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSaveResult, setBulkSaveResult] = useState<string | null>(null);
  const [bulkTagInputs, setBulkTagInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editing) {
      setForm(editing);
    } else {
      setForm(emptyVideo);
    }
    fetchTokenRef.current++;
    setFetchingMeta(false);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, [editing]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const isValidYouTubeId = (id: string) => /^[a-zA-Z0-9_-]{11}$/.test(id);

  const fetchYoutubeMeta = async (videoId: string, token: number) => {
    setFetchingMeta(true);
    try {
      const res = await fetch(`/api/admin/youtube-meta?videoId=${encodeURIComponent(videoId)}`, {
        headers: { "x-admin-password": adminPassword },
      });
      if (res.ok && fetchTokenRef.current === token) {
        const meta = await res.json();
        setForm((f) => ({
          ...f,
          title: f.title || meta.title || "",
          description: f.description || meta.description || "",
        }));
      }
    } catch {}
    if (fetchTokenRef.current === token) {
      setFetchingMeta(false);
    }
  };

  const handleUrlChange = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    setForm((f) => ({ ...f, youtubeUrl: url, youtubeVideoId: videoId }));

    fetchTokenRef.current++;
    setFetchingMeta(false);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (videoId && isValidYouTubeId(videoId)) {
      const token = fetchTokenRef.current;
      debounceTimerRef.current = setTimeout(() => fetchYoutubeMeta(videoId, token), 400);
    }
  };

  const handleBulkLoad = async () => {
    const lines = bulkUrls.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    setBulkLoading(true);
    setBulkSaveResult(null);

    const existingIds = new Set(videos.map(v => v.youtubeVideoId));

    const entries: BulkEntry[] = [];
    const seenIds = new Set<string>();

    for (const line of lines) {
      const videoId = extractYouTubeVideoId(line);
      const isValid = videoId && isValidYouTubeId(videoId);

      if (!isValid) {
        entries.push({
          ...emptyVideo,
          youtubeUrl: line,
          youtubeVideoId: "",
          _key: `invalid-${Date.now()}-${Math.random()}`,
          _invalid: true,
        });
        continue;
      }

      const isDuplicate = existingIds.has(videoId) || seenIds.has(videoId);
      seenIds.add(videoId);

      entries.push({
        ...emptyVideo,
        youtubeUrl: line,
        youtubeVideoId: videoId,
        _key: `${videoId}-${Date.now()}-${Math.random()}`,
        _duplicate: isDuplicate,
      });
    }

    setBulkEntries([...entries]);

    const validIndices = entries.map((e, i) => (!e._invalid ? i : -1)).filter(i => i >= 0);

    const metaPromises = validIndices.map(async (idx) => {
      const entry = entries[idx];
      try {
        const res = await fetch(`/api/admin/youtube-meta?videoId=${encodeURIComponent(entry.youtubeVideoId)}`, {
          headers: { "x-admin-password": adminPassword },
        });
        if (res.ok) {
          const meta = await res.json();
          return { idx, title: meta.title || "", description: meta.description || "", failed: false };
        }
      } catch {}
      return { idx, title: "", description: "", failed: true };
    });

    const results = await Promise.all(metaPromises);

    setBulkEntries(prev => {
      const updated = [...prev];
      for (const r of results) {
        if (updated[r.idx]) {
          updated[r.idx] = {
            ...updated[r.idx],
            title: r.title,
            description: r.description,
            _metaFailed: r.failed,
          };
        }
      }
      return updated;
    });

    setBulkLoading(false);
  };

  const updateBulkEntry = (key: string, field: string, value: any) => {
    setBulkEntries(prev => prev.map(e => e._key === key ? { ...e, [field]: value } : e));
  };

  const removeBulkEntry = (key: string) => {
    setBulkEntries(prev => prev.filter(e => e._key !== key));
  };

  const addBulkTag = (key: string) => {
    const tag = (bulkTagInputs[key] || "").trim();
    if (!tag) return;
    setBulkEntries(prev => prev.map(e => {
      if (e._key === key && !e.topicTags.includes(tag)) {
        return { ...e, topicTags: [...e.topicTags, tag] };
      }
      return e;
    }));
    setBulkTagInputs(prev => ({ ...prev, [key]: "" }));
  };

  const removeBulkTag = (key: string, tag: string) => {
    setBulkEntries(prev => prev.map(e => e._key === key ? { ...e, topicTags: e.topicTags.filter(t => t !== tag) } : e));
  };

  const handleBulkSave = async () => {
    const valid = bulkEntries.filter(e => e.youtubeVideoId && e.title && !e._duplicate && !e._invalid);
    if (valid.length === 0) return;

    setBulkSaving(true);
    const saved = await onBulkSave(valid.map(({ _key, _metaFailed, _duplicate, _invalid, ...rest }) => rest));
    setBulkSaving(false);
    setBulkSaveResult(`${saved} von ${valid.length} Videos gespeichert`);
    if (saved > 0) {
      setBulkEntries([]);
      setBulkUrls("");
      setTimeout(() => {
        setBulkOpen(false);
        setBulkSaveResult(null);
      }, 1500);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.topicTags.includes(tag)) {
      setForm((f) => ({ ...f, topicTags: [...f.topicTags, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, topicTags: f.topicTags.filter((t: string) => t !== tag) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const filtered = videos.filter((v) => {
    if (filterCategory !== "all" && v.category !== filterCategory) return false;
    if (filterLang !== "all" && v.language !== filterLang) return false;
    return true;
  });

  return (
    <div className="space-y-6" data-testid="videos-tab">
      <LandingVideosPanel adminPassword={adminPassword} />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Videos</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setBulkOpen(!bulkOpen); setBulkEntries([]); setBulkUrls(""); setBulkSaveResult(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 min-h-[44px] md:min-h-0"
            data-testid="button-bulk-import"
          >
            <Upload size={16} />
            Bulk Import
          </button>
          <button
            onClick={() => { setEditing(null); setForm(emptyVideo); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 min-h-[44px] md:min-h-0"
            data-testid="button-add-video"
          >
            <Plus size={16} />
            Neues Video
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          data-testid="filter-video-category"
        >
          <option value="all">Alle Kategorien</option>
          {VIDEO_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          data-testid="filter-video-lang"
        >
          <option value="all">Alle Sprachen</option>
          <option value="de">DE</option>
          <option value="en">EN</option>
          <option value="ru">RU</option>
        </select>
      </div>

      {bulkOpen && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200 space-y-4" data-testid="bulk-import-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Bulk Import</h3>
            <button onClick={() => { setBulkOpen(false); setBulkEntries([]); setBulkUrls(""); }} className="p-1 rounded hover:bg-gray-100" data-testid="button-close-bulk">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {bulkEntries.length === 0 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">YouTube URLs (eine pro Zeile)</label>
                <textarea
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-mono"
                  rows={6}
                  placeholder={"https://youtube.com/shorts/abc123...\nhttps://youtube.com/shorts/def456...\nhttps://youtu.be/ghi789..."}
                  data-testid="textarea-bulk-urls"
                />
                <p className="text-xs text-gray-400 mt-1">{bulkUrls.split("\n").filter(l => l.trim()).length} URLs erkannt</p>
              </div>
              <button
                onClick={handleBulkLoad}
                disabled={bulkLoading || !bulkUrls.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                data-testid="button-bulk-load"
              >
                {bulkLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {bulkLoading ? "Metadaten laden..." : "Laden"}
              </button>
            </div>
          )}

          {bulkEntries.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  {bulkEntries.length} Videos geladen
                  {bulkEntries.some(e => e._duplicate) && (
                    <span className="text-amber-600 ml-2">({bulkEntries.filter(e => e._duplicate).length} Duplikate)</span>
                  )}
                  {bulkEntries.some(e => e._invalid) && (
                    <span className="text-red-500 ml-2">({bulkEntries.filter(e => e._invalid).length} ungültig)</span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setBulkEntries([]); setBulkUrls(""); }}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200"
                    data-testid="button-bulk-reset"
                  >
                    Zurücksetzen
                  </button>
                  {bulkSaveResult && (
                    <span className="text-xs text-green-600 font-medium">{bulkSaveResult}</span>
                  )}
                  <button
                    onClick={handleBulkSave}
                    disabled={bulkSaving || bulkEntries.filter(e => e.youtubeVideoId && e.title && !e._duplicate && !e._invalid).length === 0}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                    data-testid="button-bulk-save"
                  >
                    {bulkSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {bulkSaving ? "Speichern..." : `Alle speichern (${bulkEntries.filter(e => e.youtubeVideoId && e.title && !e._duplicate && !e._invalid).length})`}
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {bulkEntries.map((entry, idx) => (
                  <div
                    key={entry._key}
                    className={`rounded-lg border p-4 space-y-3 ${entry._invalid ? "border-red-300 bg-red-50" : entry._duplicate ? "border-amber-300 bg-amber-50" : entry._metaFailed ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"}`}
                    data-testid={`bulk-entry-${idx}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                        {entry._invalid ? (
                          <span className="text-xs text-red-500 font-mono truncate max-w-[300px]">{entry.youtubeUrl}</span>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">{entry.youtubeVideoId}</span>
                        )}
                        {entry._invalid && <span className="text-[10px] px-1.5 py-0.5 bg-red-200 text-red-700 rounded-full font-bold">Ungültige URL</span>}
                        {entry._duplicate && <span className="text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-700 rounded-full font-bold">Duplikat</span>}
                        {entry._metaFailed && !entry._duplicate && !entry._invalid && <span className="text-[10px] px-1.5 py-0.5 bg-orange-200 text-orange-700 rounded-full font-bold">Manuell ausfüllen</span>}
                      </div>
                      <button onClick={() => removeBulkEntry(entry._key)} className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500" data-testid={`button-remove-bulk-${idx}`}>
                        <X size={14} />
                      </button>
                    </div>

                    {entry._invalid && (
                      <p className="text-xs text-red-500">Diese URL konnte nicht erkannt werden. Bitte entfernen oder korrigieren.</p>
                    )}

                    {!entry._invalid && <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Title</label>
                        <input
                          value={entry.title}
                          onChange={(e) => updateBulkEntry(entry._key, "title", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 text-xs"
                          placeholder="Titel eingeben..."
                          data-testid={`bulk-title-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">URL</label>
                        <input value={entry.youtubeUrl} readOnly className="w-full px-2 py-1.5 rounded border border-gray-200 text-xs bg-gray-100 text-gray-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Description</label>
                      <textarea
                        value={entry.description}
                        onChange={(e) => updateBulkEntry(entry._key, "description", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-gray-300 text-xs"
                        rows={2}
                        placeholder="Beschreibung..."
                        data-testid={`bulk-desc-${idx}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Category</label>
                        <select
                          value={entry.category}
                          onChange={(e) => updateBulkEntry(entry._key, "category", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 text-xs"
                          data-testid={`bulk-category-${idx}`}
                        >
                          {VIDEO_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Language</label>
                        <select
                          value={entry.language}
                          onChange={(e) => updateBulkEntry(entry._key, "language", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 text-xs"
                          data-testid={`bulk-lang-${idx}`}
                        >
                          <option value="de">DE</option>
                          <option value="en">EN</option>
                          <option value="ru">RU</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Sort Order</label>
                        <input
                          type="number"
                          value={entry.sortOrder}
                          onChange={(e) => updateBulkEntry(entry._key, "sortOrder", parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded border border-gray-300 text-xs"
                          data-testid={`bulk-sort-${idx}`}
                        />
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={entry.isActive}
                            onChange={(e) => updateBulkEntry(entry._key, "isActive", e.target.checked)}
                            className="rounded"
                            data-testid={`bulk-active-${idx}`}
                          />
                          Active
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Topic Tags</label>
                      <div className="flex gap-1 flex-wrap mb-1">
                        {entry.topicTags.map(tag => (
                          <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium">
                            {tag}
                            <button type="button" onClick={() => removeBulkTag(entry._key, tag)} className="hover:text-red-500"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <input
                          value={bulkTagInputs[entry._key] || ""}
                          onChange={(e) => setBulkTagInputs(prev => ({ ...prev, [entry._key]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBulkTag(entry._key); } }}
                          className="flex-1 px-2 py-1 rounded border border-gray-300 text-[10px]"
                          placeholder="Tag..."
                          data-testid={`bulk-tag-input-${idx}`}
                        />
                        <button type="button" onClick={() => addBulkTag(entry._key)} className="px-2 py-1 rounded bg-gray-200 text-[10px] font-medium hover:bg-gray-300">+</button>
                      </div>
                    </div>
                    </>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 space-y-4" data-testid="video-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Title {fetchingMeta && <span className="text-purple-500 animate-pulse ml-1">⏳</span>}
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                placeholder={fetchingMeta ? "Laden..." : ""}
                required
                data-testid="input-video-title"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">YouTube URL</label>
              <input
                value={form.youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                placeholder="https://youtube.com/shorts/..."
                required
                data-testid="input-video-url"
              />
              {form.youtubeVideoId && (
                <p className="text-xs text-green-600 mt-1">Video ID: {form.youtubeVideoId}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Description {fetchingMeta && <span className="text-purple-500 animate-pulse ml-1">⏳</span>}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              placeholder={fetchingMeta ? "Laden..." : ""}
              rows={2}
              data-testid="input-video-description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                data-testid="select-video-category"
              >
                {VIDEO_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                data-testid="select-video-language"
              >
                <option value="de">DE</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                data-testid="input-video-sort"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Topic Tags</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {form.topicTags.map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm"
                placeholder="z.B. tag-markets, copy-x, amplify, commissions..."
                data-testid="input-video-tag"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 rounded-lg bg-gray-200 text-sm font-medium hover:bg-gray-300">
                Hinzufügen
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Tags werden verwendet, um Videos in Trading Hub / Partner Hub Abschnitten zuzuordnen.</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded"
                data-testid="checkbox-video-active"
              />
              Active
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700" data-testid="button-save-video">
              <Check size={16} className="inline mr-1" />
              Speichern
            </button>
            <button type="button" onClick={() => { setFormOpen(false); setEditing(null); }} className="px-4 py-2 rounded-lg bg-gray-200 text-sm font-medium hover:bg-gray-300" data-testid="button-cancel-video">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Laden...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Keine Videos vorhanden.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <div key={v.id} className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-3 md:gap-4" data-testid={`video-item-${v.id}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">{v.title}</span>
                  {!v.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full font-medium">Inaktiv</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${LANG_COLORS[v.language] || "bg-gray-100 text-gray-500"}`}>
                    {LANG_LABELS[v.language] || v.language}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                    {VIDEO_CATEGORIES.find(c => c.value === v.category)?.label || v.category}
                  </span>
                  {v.topicTags?.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                {v.description && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{v.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { setEditing(v); setFormOpen(true); }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-purple-600"
                  data-testid={`button-edit-video-${v.id}`}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(v.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                  data-testid={`button-delete-video-${v.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AmaTab({ questions, loading, onUpdateStatus, adminPassword }: {
  questions: AmaQuestionItem[];
  loading: boolean;
  onUpdateStatus: (id: number, status: AmaQuestionStatus) => void;
  adminPassword: string;
}) {
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | AmaQuestionStatus>("all");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  const sorted = [...questions].sort((a, b) => {
    const tA = new Date(a.createdAt).getTime();
    const tB = new Date(b.createdAt).getTime();
    return sortAsc ? tA - tB : tB - tA;
  });

  const filtered = filterStatus === "all" ? sorted : sorted.filter(q => q.status === filterStatus);

  const statusColors: Record<AmaQuestionStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    selected: "bg-blue-100 text-blue-700",
    answered: "bg-green-100 text-green-700",
  };

  const exportCSV = () => {
    const csvHeader = "Nr,Name,Kontakt,Frage,Status,Datum\n";
    const csvRows = filtered.map((q, i) =>
      `${i + 1},"${q.name.replace(/"/g, '""')}","${q.contact.replace(/"/g, '""')}","${q.question.replace(/"/g, '""')}","${q.status}","${new Date(q.createdAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}"`
    ).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ama-questions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const syncToSheets = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/admin/sync-ama-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
      });
      const data = await res.json();
      if (data.success) {
        setSheetUrl(data.spreadsheetUrl);
      } else {
        setSyncError(data.error || "Sync failed");
      }
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3 md:gap-2">
        <h2 className="text-lg font-bold text-gray-900">AMA Questions ({filtered.length})</h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as "all" | AmaQuestionStatus)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
            data-testid="select-ama-filter"
          >
            <option value="all">Alle</option>
            <option value="pending">Pending</option>
            <option value="selected">Selected</option>
            <option value="answered">Answered</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
            data-testid="button-ama-sort"
          >
            {sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Zeit
          </button>
          <button
            onClick={syncToSheets}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid="btn-sync-ama-sheets"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            Google Sheets
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            data-testid="btn-export-ama-csv"
          >
            <Download size={16} />
            CSV Export
          </button>
        </div>
      </div>

      {sheetUrl && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm">
          <FileSpreadsheet size={16} className="text-blue-600 flex-shrink-0" />
          <span className="text-blue-800">Синхронизировано!</span>
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1 ml-1" data-testid="link-ama-sheet">
            Открыть таблицу <ExternalLink size={12} />
          </a>
        </div>
      )}
      {syncError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {syncError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Laden...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Keine Fragen vorhanden.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-sm" data-testid="table-ama-questions">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-8">Nr</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kontakt</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Frage</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-24">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-36">Datum</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-48">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, idx) => (
                <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" data-testid={`ama-question-${q.id}`}>
                  <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{q.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{q.contact}</td>
                  <td className="px-4 py-3 text-gray-700 leading-relaxed max-w-xs" data-testid={`text-ama-question-${q.id}`}>
                    <div className="whitespace-pre-wrap break-words">{q.question}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColors[q.status]}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(q.createdAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {q.status !== "selected" && (
                        <button
                          onClick={() => onUpdateStatus(q.id, "selected")}
                          className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Mark as selected"
                          data-testid={`button-ama-select-${q.id}`}
                        >
                          Select
                        </button>
                      )}
                      {q.status !== "answered" && (
                        <button
                          onClick={() => onUpdateStatus(q.id, "answered")}
                          className="px-2 py-1 text-xs font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Mark as answered"
                          data-testid={`button-ama-answer-${q.id}`}
                        >
                          Answered
                        </button>
                      )}
                      {q.status !== "pending" && (
                        <button
                          onClick={() => onUpdateStatus(q.id, "pending")}
                          className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Reset to pending"
                          data-testid={`button-ama-reset-${q.id}`}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
