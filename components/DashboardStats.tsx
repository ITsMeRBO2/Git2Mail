'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, Users, CheckCircle, Search, LogOut, Loader2, GitBranch, Mail, ChevronDown, ChevronUp
} from 'lucide-react';

export default function DashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dash/stats');
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Fix: use server-side logout route to properly clear the httpOnly cookie
  const logout = async () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/dash/logout';
    document.body.appendChild(form);
    form.submit();
  };

  const toggleRow = (i: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-red-400">
        {error || 'Erreur'}
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Statistiques d&apos;utilisation de GitLeak Finder</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors text-sm text-red-400"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Requêtes totales" value={stats.totalRequests} icon={<Search className="text-blue-400" />} />
          <KpiCard title="Emails trouvés" value={stats.emailsFound} icon={<Mail className="text-green-400" />} />
          <KpiCard title="Taux de succès" value={`${stats.successRate}%`} icon={<CheckCircle className="text-emerald-400" />} />
          <KpiCard title="Requêtes aujourd'hui" value={stats.dailyRequests[stats.dailyRequests.length - 1]?.count || 0} icon={<Activity className="text-purple-400" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 glass-card p-6 border-[#222]">
            <h3 className="text-lg font-semibold text-white mb-6">Activité (14 jours)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyRequests}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Providers Donut */}
          <div className="glass-card p-6 border-[#222]">
            <h3 className="text-lg font-semibold text-white mb-6">Sources de données</h3>
            <div className="h-[220px] w-full flex items-center justify-center">
              {stats.providers.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.providers} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                      {stats.providers.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 text-sm">Aucune donnée</div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {stats.providers.map((p: any, i: number) => (
                <div key={p.name} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-gray-400">{p.name}</span>
                  <span className="text-white font-semibold">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Errors Bar Chart */}
          <div className="glass-card p-6 border-[#222]">
            <h3 className="text-lg font-semibold text-white mb-6">Erreurs fréquentes</h3>
            <div className="h-[200px] w-full">
              {stats.errors.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.errors} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#888" fontSize={11} tickLine={false} axisLine={false} width={60} />
                    <RechartsTooltip cursor={{fill: '#222'}} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">Aucune erreur</div>
              )}
            </div>
          </div>

          {/* Logs Table — with expandable email rows */}
          <div className="lg:col-span-2 glass-card p-6 border-[#222] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Dernières analyses</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 bg-[#111] uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Heure</th>
                    <th className="px-4 py-3">Dépôt</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Emails</th>
                    <th className="px-4 py-3 rounded-r-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.logs.length > 0 ? stats.logs.map((log: any, i: number) => (
                    <>
                      <tr key={i} className="border-b border-[#1a1a1a] hover:bg-[#111]/50 cursor-pointer" onClick={() => log.success && log.emails?.length > 0 && toggleRow(i)}>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-300 max-w-[180px] truncate">
                          <span className="flex items-center gap-2">
                            {log.provider === 'github' && <GitBranch size={14} className="text-blue-400 shrink-0"/>}
                            <span className="truncate">{log.repo?.replace('https://github.com/', '').replace('https://gitlab.com/', '')}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {log.success ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">Succès</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">{log.error}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {log.success ? (
                            <span className="text-blue-400 font-semibold">{log.emailsFound}</span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {log.success && log.emails?.length > 0 && (
                            expandedRows.has(i) ? <ChevronUp size={14}/> : <ChevronDown size={14}/>
                          )}
                        </td>
                      </tr>
                      {/* Expanded row — show actual emails */}
                      {expandedRows.has(i) && log.emails?.length > 0 && (
                        <tr key={`${i}-emails`} className="bg-[#0d0d0d] border-b border-[#1a1a1a]">
                          <td colSpan={5} className="px-6 pb-4 pt-2">
                            <div className="flex flex-wrap gap-2">
                              {log.emails.map((email: string, j: number) => (
                                <span key={j} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
                                  <Mail size={10} />
                                  {email}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Aucune analyse récente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="glass-card p-6 border-[#222] flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}
