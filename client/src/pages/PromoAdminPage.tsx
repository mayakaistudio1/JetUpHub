import React, { useState, useEffect } from "react";

interface PromoApplication {
  id: number;
  name: string;
  email: string;
  cuNumber: string;
  promoTitle?: string;
  status: string;
  verifiedAt: string | null;
  emailSentAt: string | null;
  noMoneyEmailSentAt: string | null;
  createdAt: string;
}

export default function PromoAdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [applications, setApplications] = useState<PromoApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [loginError, setLoginError] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"aktiv" | "bestaetigt" | "archiv">("aktiv");

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const primaryPriority: Record<string, number> = { approved: 0, verified: 0, retry: 1, no_money: 2, pending: 3, rejected: 4, duplicate: 5 };

  const groupedApplications = (() => {
    const map: Record<string, PromoApplication[]> = {};
    for (const app of applications) {
      const key = app.email.toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(app);
    }
    return Object.values(map).map(group => {
      const sorted = [...group].sort((a, b) => {
        const pa = primaryPriority[a.status] ?? 3;
        const pb = primaryPriority[b.status] ?? 3;
        if (pa !== pb) return pa - pb;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return { primary: sorted[0], history: sorted.slice(1) };
    }).sort((a, b) =>
      new Date(b.primary.createdAt).getTime() - new Date(a.primary.createdAt).getTime()
    );
  })();

  const AKTIV_STATUSES = ["pending", "retry", "no_money"];
  const BESTAETIGT_STATUSES = ["approved", "verified"];
  const ARCHIV_STATUSES = ["rejected", "duplicate"];

  const tabGroups = {
    aktiv: groupedApplications.filter(g => AKTIV_STATUSES.includes(g.primary.status)),
    bestaetigt: groupedApplications.filter(g => BESTAETIGT_STATUSES.includes(g.primary.status)),
    archiv: groupedApplications.filter(g => ARCHIV_STATUSES.includes(g.primary.status)),
  };
  const tabApplications = tabGroups[activeTab];

  const storedPassword = authenticated ? sessionStorage.getItem("promo_admin_pw") || "" : "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/promo-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("promo_admin_pw", password);
        setAuthenticated(true);
      } else {
        setLoginError("Invalid password");
      }
    } catch {
      setLoginError("Connection error");
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const pw = sessionStorage.getItem("promo_admin_pw") || "";
      const res = await fetch("/api/promo-admin/applications", {
        headers: { "x-promo-password": pw },
      });
      if (res.status === 401) {
        setAuthenticated(false);
        sessionStorage.removeItem("promo_admin_pw");
        return;
      }
      const data = await res.json();
      setApplications(data);
      setError("");
    } catch {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) fetchApplications();
  }, [authenticated]);

  useEffect(() => {
    const saved = sessionStorage.getItem("promo_admin_pw");
    if (saved) {
      setPassword(saved);
      setAuthenticated(true);
    }
  }, []);

  const handleVerify = async (id: number) => {
    setActionLoading(id);
    try {
      const pw = sessionStorage.getItem("promo_admin_pw") || "";
      const res = await fetch(`/api/promo-admin/applications/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-promo-password": pw },
      });
      if (res.ok) {
        await fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || "Verification failed");
      }
    } catch {
      alert("Connection error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleNoMoney = async (id: number) => {
    if (!confirm("Send 'insufficient balance' email to this applicant?")) return;
    setActionLoading(id);
    try {
      const pw = sessionStorage.getItem("promo_admin_pw") || "";
      const res = await fetch(`/api/promo-admin/applications/${id}/no-money`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-promo-password": pw },
      });
      if (res.ok) {
        await fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send no-money email");
      }
    } catch {
      alert("Connection error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this application?")) return;
    setActionLoading(id);
    try {
      const pw = sessionStorage.getItem("promo_admin_pw") || "";
      const res = await fetch(`/api/promo-admin/applications/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-promo-password": pw },
      });
      if (res.ok) {
        await fetchApplications();
      }
    } catch {
      alert("Connection error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("promo_admin_pw");
    setAuthenticated(false);
    setPassword("");
    setApplications([]);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      verified: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      duplicate: "bg-gray-100 text-gray-600",
      retry: "bg-orange-100 text-orange-700",
      no_money: "bg-amber-100 text-amber-800",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`} data-testid={`status-badge-${status}`}>
        {status === "no_money" ? "No Money" : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Promo Verification</h1>
            <p className="text-sm text-gray-500 mt-1">JetUP Partner Applications</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              data-testid="input-promo-admin-password"
              autoFocus
            />
            {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
            <button
              type="submit"
              className="w-full mt-4 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              data-testid="button-promo-admin-login"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const aktivCount = tabGroups.aktiv.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Promo Verification</h1>
            <p className="text-xs text-gray-500">
              {groupedApplications.length} Antrag{groupedApplications.length !== 1 ? "anträge" : ""}
              {aktivCount > 0 && <span className="text-orange-500 font-medium"> · {aktivCount} aktiv</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchApplications}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
            data-testid="button-refresh-applications"
          >
            <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="button-promo-admin-logout"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="p-4 max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {loading && applications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No applications found</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4" data-testid="stats-bar">
              <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Aktiv</div>
                  <div className="text-2xl font-bold text-orange-500" data-testid="stat-count-aktiv">{tabGroups.aktiv.length}</div>
                </div>
                <div className="text-orange-200">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Bestätigt</div>
                  <div className="text-2xl font-bold text-green-600" data-testid="stat-count-bestaetigt">{tabGroups.bestaetigt.length}</div>
                </div>
                <div className="text-green-200">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Archiv</div>
                  <div className="text-2xl font-bold text-gray-400" data-testid="stat-count-archiv">{tabGroups.archiv.length}</div>
                </div>
                <div className="text-gray-200">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" /></svg>
                </div>
              </div>
            </div>

            <div className="flex gap-1 mb-4 bg-white rounded-xl shadow-sm p-1" data-testid="tabs-bar">
              {(["aktiv", "bestaetigt", "archiv"] as const).map(tab => {
                const labels = { aktiv: "Aktiv", bestaetigt: "Bestätigt", archiv: "Archiv" };
                const counts = { aktiv: tabGroups.aktiv.length, bestaetigt: tabGroups.bestaetigt.length, archiv: tabGroups.archiv.length };
                const activeStyles = {
                  aktiv: "bg-orange-500 text-white shadow-sm",
                  bestaetigt: "bg-green-600 text-white shadow-sm",
                  archiv: "bg-gray-500 text-white shadow-sm",
                };
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${isActive ? activeStyles[tab] : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                    data-testid={`tab-${tab}`}
                  >
                    {labels[tab]}
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${isActive ? "bg-white/25" : "bg-gray-100 text-gray-600"}`}>
                      {counts[tab]}
                    </span>
                  </button>
                );
              })}
            </div>

            {tabApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-xl shadow-sm" data-testid="empty-tab">
                Keine Anträge in dieser Kategorie
              </div>
            ) : (
            <>
            <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">CU Number</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Verified</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tabApplications.map(({ primary: app, history }) => {
                    const groupKey = app.email.toLowerCase();
                    const isExpanded = expandedGroups.has(groupKey);
                    const hadNoMoney = history.some(h => h.noMoneyEmailSentAt || h.status === "no_money");
                    return (
                    <React.Fragment key={app.id}>
                    <tr className="hover:bg-gray-50" data-testid={`row-application-${app.id}`}>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        #{app.id}
                        {history.length > 0 && (
                          <button onClick={() => toggleGroup(groupKey)} className="ml-1 text-xs text-purple-500 hover:text-purple-700 font-medium">{isExpanded ? "▲" : "▼"} {history.length}</button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {app.name}
                        {hadNoMoney && <span className="ml-1 text-xs text-amber-500" title="Previously sent no money email">⚠</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{app.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{app.cuNumber}</td>
                      <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                      <td className="px-4 py-3 text-sm">
                        {app.verifiedAt ? (
                          <div>
                            <div className="text-green-600 text-xs">{formatDate(app.verifiedAt)}</div>
                            {app.emailSentAt && <div className="text-green-500 text-xs">Email sent</div>}
                          </div>
                        ) : app.noMoneyEmailSentAt ? (
                          <div className="text-amber-600 text-xs">No Money email sent<br />{formatDate(app.noMoneyEmailSentAt)}</div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(app.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {app.status !== "approved" && app.status !== "verified" && app.status !== "rejected" && app.status !== "duplicate" && !app.emailSentAt && (
                            <>
                              <button
                                onClick={() => handleVerify(app.id)}
                                disabled={actionLoading === app.id}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Verify & Send Email"
                                data-testid={`button-verify-${app.id}`}
                              >
                                {actionLoading === app.id ? (
                                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                              {!app.noMoneyEmailSentAt && !app.emailSentAt && (
                                <button
                                  onClick={() => handleNoMoney(app.id)}
                                  disabled={actionLoading === app.id}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="No Money — Send Insufficient Balance Email"
                                  data-testid={`button-no-money-${app.id}`}
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleReject(app.id)}
                                disabled={actionLoading === app.id}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                                data-testid={`button-reject-${app.id}`}
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                          {(app.status === "approved" || app.status === "verified") && (
                            <span className="text-green-500">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                          )}
                          {app.status === "rejected" && (
                            <span className="text-red-400">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                          )}
                          {app.status === "no_money" && (
                            <span className="text-amber-500" title="No Money email sent">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && history.map(h => (
                      <tr key={h.id} className="bg-gray-50/60 text-xs border-t border-gray-100" data-testid={`row-history-${h.id}`}>
                        <td className="px-4 py-2 text-gray-400 pl-8">#{h.id}</td>
                        <td className="px-4 py-2 text-gray-500">{h.name}</td>
                        <td className="px-4 py-2 text-gray-400">{h.email}</td>
                        <td className="px-4 py-2 text-gray-400 font-mono">{h.cuNumber}</td>
                        <td className="px-4 py-2">{getStatusBadge(h.status)}</td>
                        <td className="px-4 py-2 text-gray-400">
                          {h.emailSentAt ? <span className="text-green-600">Email sent {formatDate(h.emailSentAt)}</span>
                           : h.noMoneyEmailSentAt ? <span className="text-amber-600">No money {formatDate(h.noMoneyEmailSentAt)}</span>
                           : "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-400">{formatDate(h.createdAt)}</td>
                        <td className="px-4 py-2 text-gray-400">—</td>
                      </tr>
                    ))}
                    </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {tabApplications.map(({ primary: app, history }) => {
                const groupKey = app.email.toLowerCase();
                const isExpanded = expandedGroups.has(groupKey);
                const hadNoMoney = history.some(h => h.noMoneyEmailSentAt || h.status === "no_money");
                return (
                <div key={app.id} className="bg-white rounded-xl shadow-sm p-4" data-testid={`card-application-${app.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{app.name}</div>
                      <div className="text-sm text-gray-500">{app.email}</div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-mono">{app.cuNumber}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-3">
                    Applied: {formatDate(app.createdAt)}
                    {app.verifiedAt && (
                      <span className="text-green-600 ml-2">
                        Verified: {formatDate(app.verifiedAt)}
                        {app.emailSentAt && " · Email sent"}
                      </span>
                    )}
                    {app.noMoneyEmailSentAt && (
                      <span className="text-amber-600 ml-2">
                        No Money email sent · {formatDate(app.noMoneyEmailSentAt)}
                      </span>
                    )}
                  </div>
                  {app.status !== "approved" && app.status !== "verified" && app.status !== "rejected" && app.status !== "no_money" && app.status !== "duplicate" && !app.emailSentAt && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleVerify(app.id)}
                        disabled={actionLoading === app.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                        data-testid={`button-verify-mobile-${app.id}`}
                      >
                        {actionLoading === app.id ? "Processing..." : "Verify & Send Email"}
                      </button>
                      {!app.noMoneyEmailSentAt && !app.emailSentAt && (
                        <button
                          onClick={() => handleNoMoney(app.id)}
                          disabled={actionLoading === app.id}
                          className="px-3 flex items-center justify-center bg-amber-50 text-amber-700 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
                          data-testid={`button-no-money-mobile-${app.id}`}
                        >
                          No Money
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(app.id)}
                        disabled={actionLoading === app.id}
                        className="px-3 flex items-center justify-center bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        data-testid={`button-reject-mobile-${app.id}`}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {history.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <button onClick={() => toggleGroup(groupKey)} className="text-xs text-purple-500 hover:text-purple-700 font-medium">
                        {isExpanded ? "▲ Скрыть историю" : `▼ История (${history.length})`}
                      </button>
                      {isExpanded && history.map(h => (
                        <div key={h.id} className="mt-2 pl-3 border-l-2 border-gray-200 text-xs text-gray-500">
                          <span className="font-mono mr-2">#{h.id}</span>
                          {getStatusBadge(h.status)}
                          {h.emailSentAt && <span className="ml-2 text-green-600">email отправлен</span>}
                          {h.noMoneyEmailSentAt && <span className="ml-2 text-amber-600">no money email</span>}
                          <span className="ml-2 text-gray-400">{formatDate(h.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
            </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
